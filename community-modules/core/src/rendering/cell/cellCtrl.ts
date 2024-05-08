import { UserCompDetails } from "../../components/framework/userComponentFactory";
import { BeanStub } from "../../context/beanStub";
import { CellPosition } from "../../entities/cellPositionUtils";
import { CellStyle } from "../../entities/colDef";
import { Column } from "../../entities/column";
import { RowNode } from "../../entities/rowNode";
import { RowPosition } from "../../entities/rowPositionUtils";
import {
    CellEditingStartedEvent,
    CellEditingStoppedEvent,
    CellEvent,
    CellFocusedEvent,
    Events
} from "../../events";
import { CssClassApplier } from "../../headerRendering/cells/cssClassApplier";
import { BrandedType } from "../../interfaces/brandedType";
import { ICellEditor, ICellEditorParams } from "../../interfaces/iCellEditor";
import { CellChangedEvent } from "../../interfaces/iRowNode";
import { setAriaColIndex } from "../../utils/aria";
import { getElementSize } from "../../utils/dom";
import { makeNull } from "../../utils/generic";
import { escapeString } from "../../utils/string";
import { ICellRenderer, ICellRendererParams } from "../cellRenderers/iCellRenderer";
import { RowCtrl } from "../row/rowCtrl";
import { Beans } from "./../beans";
import { CellCustomStyleFeature } from "./cellCustomStyleFeature";
import { CellPositionFeature } from "./cellPositionFeature";
import { CellRangeFeature } from "./cellRangeFeature";

const CSS_CELL = 'ag-cell';
const CSS_AUTO_HEIGHT = 'ag-cell-auto-height';
const CSS_NORMAL_HEIGHT = 'ag-cell-normal-height';
const CSS_CELL_FOCUS = 'ag-cell-focus';
const CSS_CELL_FIRST_RIGHT_PINNED = 'ag-cell-first-right-pinned';
const CSS_CELL_LAST_LEFT_PINNED = 'ag-cell-last-left-pinned';
const CSS_CELL_NOT_INLINE_EDITING = 'ag-cell-not-inline-editing';
const CSS_COLUMN_HOVER = 'ag-column-hover';
const CSS_CELL_WRAP_TEXT = 'ag-cell-wrap-text';

export interface ICellComp {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    setUserStyles(styles: CellStyle): void;
    getFocusableElement(): HTMLElement;

    getCellEditor(): ICellEditor | null;
    getCellRenderer(): ICellRenderer | null;
    getParentOfValue(): HTMLElement | null;

    setRenderDetails(compDetails: UserCompDetails | undefined, valueToDisplay: any, forceNewCellRendererInstance: boolean): void;
    setEditDetails(compDetails?: UserCompDetails, popup?: boolean, position?: 'over' | 'under', reactiveCustomComponents?: boolean): void;
}

let instanceIdSequence = 0;
export type CellCtrlInstanceId = BrandedType<string, 'CellCtrlInstanceId'>;

export class CellCtrl extends BeanStub {

    public static DOM_DATA_KEY_CELL_CTRL = 'cellCtrl';

    private instanceId: CellCtrlInstanceId;

    private eGui: HTMLElement;
    private cellComp: ICellComp;
    private beans: Beans;
    private column: Column;
    private rowNode: RowNode;
    private rowCtrl: RowCtrl;
    private editCompDetails?: UserCompDetails;

    private focusEventToRestore: CellFocusedEvent | undefined;

    private printLayout: boolean;

    private value: any;
    private valueFormatted: any;

    private cellRangeFeature: CellRangeFeature | null = null;
    private cellPositionFeature: CellPositionFeature | null = null;
    private cellCustomStyleFeature: CellCustomStyleFeature | null = null;

    private cellPosition: CellPosition;
    private editing: boolean;
    
    private includeSelection: boolean;
    private includeDndSource: boolean;
    private includeRowDrag: boolean;
    private colIdSanitised: string;
    private tabIndex: number | undefined;
    private isAutoHeight: boolean;

    private suppressRefreshCell = false;

    // this comp used only for custom row drag handle (ie when user calls params.registerRowDragger)

    private onCellCompAttachedFuncs: (() => void)[] = [];

    constructor(column: Column, rowNode: RowNode, beans: Beans, rowCtrl: RowCtrl) {
        super();
        this.column = column;
        this.rowNode = rowNode;
        this.beans = beans;
        this.rowCtrl = rowCtrl;

        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        this.instanceId = column.getId() + '-' + instanceIdSequence++ as CellCtrlInstanceId;

        this.colIdSanitised = escapeString(this.column.getId())!;
        if (!beans.gos.get('suppressCellFocus')) {
            this.tabIndex = -1;
        }

        this.createCellPosition();
        this.addFeatures();
        this.updateAndFormatValue(false);
    }



    private addFeatures(): void {
        this.cellPositionFeature = new CellPositionFeature(this, this.beans);
        this.addDestroyFunc(() => { this.cellPositionFeature?.destroy(); this.cellPositionFeature = null; });

        this.cellCustomStyleFeature = new CellCustomStyleFeature(this, this.beans);
        this.addDestroyFunc(() => { this.cellCustomStyleFeature?.destroy(); this.cellCustomStyleFeature = null; });

    }


    public setComp(
        comp: ICellComp,
        eGui: HTMLElement,
        eCellWrapper: HTMLElement | undefined,
        printLayout: boolean,
        startEditing: boolean
    ): void {
        this.cellComp = comp;
        this.eGui = eGui;
        this.printLayout = printLayout;

        this.addDomData();

        this.applyStaticCssClasses();
        this.refreshFirstAndLastStyles();
        this.refreshAriaColIndex();

        this.cellPositionFeature?.setComp(eGui);
        this.cellCustomStyleFeature?.setComp(comp);


            this.showValue();
    

        if (this.onCellCompAttachedFuncs.length) {
            this.onCellCompAttachedFuncs.forEach(func => func());
            this.onCellCompAttachedFuncs = [];
        }
    }

    public getCellAriaRole(): string {
        return this.column.getColDef().cellAriaRole ?? 'gridcell';
    }

    public getInstanceId(): CellCtrlInstanceId {
        return this.instanceId;
    }
    public getColumnIdSanitised(): string {
        return this.colIdSanitised;
    }
    public getTabIndex(): number | undefined {
        return this.tabIndex;
    }
    public isCellRenderer(): boolean {
        const colDef = this.column.getColDef();
        return colDef.cellRenderer != null || colDef.cellRendererSelector != null;
    }
    public getValueToDisplay(): any {
        return this.valueFormatted ?? this.value;
    }

    private showValue(forceNewCellRendererInstance = false): void {
        const valueToDisplay = this.getValueToDisplay();
        let compDetails: UserCompDetails | undefined;

        this.cellComp.setRenderDetails(compDetails, valueToDisplay, forceNewCellRendererInstance);
        this.cellRangeFeature?.refreshHandle();
    }


    public isForceWrapper(): boolean {
        // text selection requires the value to be wrapped in another element
        const forceWrapper = this.beans.gos.get('enableCellTextSelection') || this.column.isAutoHeight();
        return forceWrapper;
    }

    private isIncludeControl(value: boolean | Function | undefined): boolean {
        const rowNodePinned = this.rowNode.rowPinned != null;
        const isFunc = typeof value === 'function';
        const res = rowNodePinned ? false : isFunc || value === true;

        return res;
    }

    private refreshShouldDestroy(): boolean {
        const colDef = this.column.getColDef();
        const selectionChanged = this.includeSelection != this.isIncludeControl(colDef.checkboxSelection);
        const rowDragChanged = this.includeRowDrag != this.isIncludeControl(colDef.rowDrag);
        const dndSourceChanged = this.includeDndSource != this.isIncludeControl(colDef.dndSource);
        // auto height uses wrappers, so need to destroy
        const autoHeightChanged = this.isAutoHeight != this.column.isAutoHeight();

        return selectionChanged || rowDragChanged || dndSourceChanged || autoHeightChanged;
    }







    public onCellChanged(event: CellChangedEvent): void {
        const eventImpactsThisCell = event.column === this.column;

        if (eventImpactsThisCell) {
            this.refreshCell({});
        }
    }

    public refreshOrDestroyCell(params?: { suppressFlash?: boolean, newData?: boolean, forceRefresh?: boolean; }): void {
        if (this.refreshShouldDestroy()) {
            this.rowCtrl?.recreateCell(this);
        } else {
            this.refreshCell(params);
        }
    }

    // + stop editing {forceRefresh: true, suppressFlash: true}
    // + event cellChanged {}
    // + cellRenderer.params.refresh() {} -> method passes 'as is' to the cellRenderer, so params could be anything
    // + rowCtrl: event dataChanged {suppressFlash: !update, newData: !update}
    // + rowCtrl: api refreshCells() {animate: true/false}
    // + rowRenderer: api softRefreshView() {}
    public refreshCell(params?: { suppressFlash?: boolean, newData?: boolean, forceRefresh?: boolean; }) {
        // if we are in the middle of 'stopEditing', then we don't refresh here, as refresh gets called explicitly
        if (this.suppressRefreshCell || this.editing) { return; }

        const colDef = this.column.getColDef();
        const newData = params != null && !!params.newData;
        const suppressFlash = (params != null && !!params.suppressFlash) || !!colDef.suppressCellFlash;
        // we always refresh if cell has no value - this can happen when user provides Cell Renderer and the
        // cell renderer doesn't rely on a value, instead it could be looking directly at the data, or maybe
        // printing the current time (which would be silly)???. Generally speaking
        // non of {field, valueGetter, showRowGroup} is bad in the users application, however for this edge case, it's
        // best always refresh and take the performance hit rather than never refresh and users complaining in support
        // that cells are not updating.
        const noValueProvided = colDef.field == null && colDef.valueGetter == null && colDef.showRowGroup == null;
        const forceRefresh = (params && params.forceRefresh) || noValueProvided || newData;

        const isCellCompReady = !!this.cellComp;
        // Only worth comparing values if the cellComp is ready
        const valuesDifferent = this.updateAndFormatValue(isCellCompReady);
        const dataNeedsUpdating = forceRefresh || valuesDifferent;

        // In React, due to async, it's possible a refresh was asked for before the CellComp was created and calls setComp()
        // So we do not run the cell comp refresh logic at this point in time.
        if (!isCellCompReady) {
            return;
        }

        if (dataNeedsUpdating) {

            // if it's 'new data', then we don't refresh the cellRenderer, even if refresh method is available.
            // this is because if the whole data is new (ie we are showing stock price 'BBA' now and not 'SSD')
            // then we are not showing a movement in the stock price, rather we are showing different stock.
            this.showValue(newData);

            this.cellCustomStyleFeature?.applyUserStyles();
            this.cellCustomStyleFeature?.applyClassesFromColDef();
        }

        // we do cellClassRules even if the value has not changed, so that users who have rules that
        // look at other parts of the row (where the other part of the row might of changed) will work.
        this.cellCustomStyleFeature?.applyCellClassRules();
    }


    public isCellEditable(): boolean {
        return false;
    }

    public isSuppressFillHandle(): boolean {
        return this.column.isSuppressFillHandle();
    }

    private formatValue(value: any): any {
        return this.callValueFormatter(value) ?? value;
    }

    private callValueFormatter(value: any): string | null {
        return this.beans.valueService.formatValue(this.column, this.rowNode, value);
    }

    private updateAndFormatValue(compareValues: boolean): boolean {
        const oldValue = this.value;
        const oldValueFormatted = this.valueFormatted;

        this.value = this.rowNode.getValueFromValueService(this.column);
        this.valueFormatted = this.callValueFormatter(this.value);

        if (compareValues) {
            return !this.valuesAreEqual(oldValue, this.value) || this.valueFormatted != oldValueFormatted;
        }
        return true;
    }

    private valuesAreEqual(val1: any, val2: any): boolean {
        // if the user provided an equals method, use that, otherwise do simple comparison
        const colDef = this.column.getColDef();
        return colDef.equals ? colDef.equals(val1, val2) : val1 === val2;
    }

    public getComp(): ICellComp {
        return this.cellComp;
    }

    public getValue(): any {
        return this.value;
    }

    private addDomData(): void {
        const element = this.getGui();

        this.beans.gos.setDomData(element, CellCtrl.DOM_DATA_KEY_CELL_CTRL, this);
        this.addDestroyFunc(() => this.beans.gos.setDomData(element, CellCtrl.DOM_DATA_KEY_CELL_CTRL, null));
    }

    public createEvent(domEvent: Event | null, eventType: string): CellEvent {
        const event: CellEvent = this.beans.gos.addGridCommonParams({
            type: eventType,
            node: this.rowNode,
            data: this.rowNode.data,
            value: this.value,
            column: this.column,
            colDef: this.column.getColDef(),
            rowPinned: this.rowNode.rowPinned,
            event: domEvent,
            rowIndex: this.rowNode.rowIndex!
        });

        return event;
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public onLeftChanged(): void {
        if (!this.cellComp) { return; }
        this.cellPositionFeature?.onLeftChanged();
    }

    public onDisplayedColumnsChanged(): void {
        if (!this.eGui) { return; }
        this.refreshAriaColIndex();
        this.refreshFirstAndLastStyles();
    }

    private refreshFirstAndLastStyles(): void {
        const { cellComp, column, beans } = this;
        CssClassApplier.refreshFirstAndLastStyles(cellComp, column, beans.columnModel);
    }

    private refreshAriaColIndex(): void {
        const colIdx = this.beans.columnModel.getAriaColumnIndex(this.column);
        setAriaColIndex(this.getGui(), colIdx); // for react, we don't use JSX, as it slowed down column moving
    }

    public isSuppressNavigable(): boolean {
        return this.column.isSuppressNavigable(this.rowNode);
    }

    public onWidthChanged(): void {
        return this.cellPositionFeature?.onWidthChanged();
    }

    public getColumn(): Column {
        return this.column;
    }

    public getRowNode(): RowNode {
        return this.rowNode;
    }

    public isPrintLayout(): boolean {
        return this.printLayout;
    }

    public getCellPosition(): CellPosition {
        return this.cellPosition;
    }

    public isEditing(): boolean {
        return this.editing;
    }

    // called by rowRenderer when user navigates via tab key


    public getRowCtrl(): RowCtrl {
        return this.rowCtrl;
    }

    public getRowPosition(): RowPosition {
        return {
            rowIndex: this.cellPosition.rowIndex,
            rowPinned: this.cellPosition.rowPinned
        };
    }

    public updateRangeBordersIfRangeCount(): void {
        if (!this.cellComp) { return; }
        if (this.cellRangeFeature) {
            this.cellRangeFeature.updateRangeBordersIfRangeCount();
        }
    }

    public onRangeSelectionChanged(): void {
        if (!this.cellComp) { return; }
        if (this.cellRangeFeature) {
            this.cellRangeFeature.onRangeSelectionChanged();
        }
    }

    public isRangeSelectionEnabled(): boolean {
        return this.cellRangeFeature != null;
    }

    public focusCell(forceBrowserFocus = false): void {

    }

    public onRowIndexChanged(): void {
        // when index changes, this influences items that need the index, so we update the
        // grid cell so they are working off the new index.
        this.createCellPosition();
        // when the index of the row changes, ie means the cell may have lost or gained focus
        // check range selection
        if (this.cellRangeFeature) {
            this.cellRangeFeature.onRangeSelectionChanged();
        }
    }

    private createCellPosition(): void {
        this.cellPosition = {
            rowIndex: this.rowNode.rowIndex!,
            rowPinned: makeNull(this.rowNode.rowPinned),
            column: this.column
        };
    }

    // CSS Classes that only get applied once, they never change
    private applyStaticCssClasses(): void {
        this.cellComp.addOrRemoveCssClass(CSS_CELL, true);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_NOT_INLINE_EDITING, true);

        // normal cells fill the height of the row. autoHeight cells have no height to let them
        // fit the height of content.

        const autoHeight = this.column.isAutoHeight() == true;
        this.cellComp.addOrRemoveCssClass(CSS_AUTO_HEIGHT, autoHeight);
        this.cellComp.addOrRemoveCssClass(CSS_NORMAL_HEIGHT, !autoHeight);
    }

    public onColDefChanged(): void {
        if (!this.cellComp) { return; }

            this.refreshOrDestroyCell({ forceRefresh: true, suppressFlash: true });
       
    }

    public getCellRenderer(): ICellRenderer | null {
        return this.cellComp ? this.cellComp.getCellRenderer() : null;
    }

    public getCellEditor(): ICellEditor | null {
        return this.cellComp ? this.cellComp.getCellEditor() : null;
    }

    public destroy(): void {
        this.onCellCompAttachedFuncs = [];
        super.destroy();
    }

}
