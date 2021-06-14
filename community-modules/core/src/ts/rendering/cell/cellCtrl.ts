import { Beans } from "./../beans";
import { Column } from "../../entities/column";
import { CellClassParams, ColDef } from "../../entities/colDef";
import { RowNode } from "../../entities/rowNode";
import { CellPosition } from "../../entities/cellPosition";
import {
    CellClickedEvent,
    CellContextMenuEvent,
    CellDoubleClickedEvent,
    CellEvent,
    CellFocusedEvent,
    Events
} from "../../events";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { CellRangeFeature } from "./cellRangeFeature";
import { areEqual, last } from "../../utils/array";
import { Constants } from "../../constants/constants";
import { setAriaColIndex } from "../../utils/aria";
import { exists, missing } from "../../utils/generic";
import { BeanStub } from "../../context/beanStub";
import { CellPositionFeature } from "./cellPositionFeature";
import { escapeString } from "../../utils/string";
import { CellCustomStyleFeature } from "./cellCustomStyleFeature";
import { TooltipFeature } from "../../widgets/tooltipFeature";
import { getValueUsingField } from "../../utils/object";
import { ITooltipParams } from "../tooltipComponent";
import { CellTooltipFeature } from "./cellTooltipFeature";
import { RowPosition } from "../../entities/rowPosition";
import { RowCtrl } from "../row/rowCtrl";
import { isEventSupported, isStopPropagationForAgGrid } from "../../utils/event";
import { isIOSUserAgent } from "../../utils/browser";
import { CellMouseListenerFeature } from "./cellMouseListenerFeature";
import { CellKeyboardListenerFeature } from "./cellKeyboardListenerFeature";

//////// theses should not be imported, remove them once CellComp has been refactored
export const CSS_CELL = 'ag-cell';
export const CSS_CELL_VALUE = 'ag-cell-value';
export const CSS_AUTO_HEIGHT = 'ag-cell-auto-height';

export const CSS_CELL_RANGE_TOP = 'ag-cell-range-top';
export const CSS_CELL_RANGE_RIGHT = 'ag-cell-range-right';
export const CSS_CELL_RANGE_BOTTOM = 'ag-cell-range-bottom';
export const CSS_CELL_RANGE_LEFT = 'ag-cell-range-left';

export const CSS_CELL_FOCUS = 'ag-cell-focus';

export const CSS_CELL_FIRST_RIGHT_PINNED = 'ag-cell-first-right-pinned';
export const CSS_CELL_LAST_LEFT_PINNED = 'ag-cell-last-left-pinned';

export const CSS_CELL_NOT_INLINE_EDITING = 'ag-cell-not-inline-editing';
export const CSS_CELL_INLINE_EDITING = 'ag-cell-inline-editing';
export const CSS_CELL_POPUP_EDITING = 'ag-cell-popup-editing';

export const CSS_CELL_RANGE_SELECTED = 'ag-cell-range-selected';
export const CSS_COLUMN_HOVER = 'ag-column-hover';
export const CSS_CELL_WRAP_TEXT = 'ag-cell-wrap-text';

export const CSS_CELL_RANGE_CHART = 'ag-cell-range-chart';
export const CSS_CELL_RANGE_SINGLE_CELL = 'ag-cell-range-single-cell';
export const CSS_CELL_RANGE_CHART_CATEGORY = 'ag-cell-range-chart-category';
export const CSS_CELL_RANGE_HANDLE = 'ag-cell-range-handle';

export interface ICellComp {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    setUserStyles(styles: any): void;
    setAriaSelected(selected: boolean): void;
    getFocusableElement(): HTMLElement;

    setLeft(left: string): void;
    setWidth(width: string): void;
    setAriaColIndex(index: number): void;
    setHeight(height: string): void;
    setZIndex(zIndex: string): void;
    setTabIndex(tabIndex: number): void;
    setRole(role: string): void;
    setColId(colId: string): void;
    setTitle(title: string | null): void;
    setUnselectable(value: string | null): void;

    // setValue(value: any): void;
    // setValueFormatted(value: string): void;

    // temp to get things compiling
    isEditing(): boolean;
    getValue(): any;
    getValueFormatted(): string;
    stopRowOrCellEdit(flag?: boolean): void;
    stopEditing(): void;
    setFocusOutOnEditor(): void;
    setFocusInOnEditor(): void;
    stopEditingAndFocus(): void;
    startRowOrCellEdit(keyPress?: number | null, charPress?: string | null): void;
    startEditingIfEnabled(keyPress?: number | null, charPress?: string | null, cellStartedEdit?: boolean): void;
}

export class CellCtrl extends BeanStub {

    public static DOM_DATA_KEY_CELL_CTRL = 'cellCtrl';

    private eGui: HTMLElement;
    private cellComp: ICellComp;
    private beans: Beans;
    private gow: GridOptionsWrapper;
    private column: Column;
    private rowNode: RowNode;
    private rowCtrl: RowCtrl | null;

    private autoHeightCell: boolean;
    private printLayout: boolean;

    private value: any;
    private valueFormatted: any;

    // just passed in
    private scope: any;
    private usingWrapper: boolean;

    private cellRangeFeature: CellRangeFeature;
    private cellPositionFeature: CellPositionFeature;
    private cellCustomStyleFeature: CellCustomStyleFeature;
    private cellTooltipFeature: CellTooltipFeature;
    private cellMouseListenerFeature: CellMouseListenerFeature;
    private cellKeyboardListenerFeature: CellKeyboardListenerFeature;

    private cellPosition: CellPosition;

    constructor(column: Column, rowNode: RowNode, beans: Beans, rowCtrl: RowCtrl | null) {
        super();
        this.column = column;
        this.rowNode = rowNode;
        this.beans = beans;
        this.rowCtrl = rowCtrl;

        this.createCellPosition();
        this.addFeatures();
    }

    private addFeatures(): void {
        this.cellPositionFeature = new CellPositionFeature(this, this.beans);
        this.addDestroyFunc( ()=> this.cellPositionFeature.destroy() );

        this.cellCustomStyleFeature = new CellCustomStyleFeature(this, this.beans);
        this.addDestroyFunc( ()=> this.cellCustomStyleFeature.destroy() );

        this.cellTooltipFeature = new CellTooltipFeature(this, this.beans);
        this.addDestroyFunc( ()=> this.cellTooltipFeature.destroy() );

        this.cellMouseListenerFeature = new CellMouseListenerFeature(this, this.beans, this.column, this.rowNode, this.scope);
        this.addDestroyFunc( ()=> this.cellMouseListenerFeature.destroy() );

        this.cellKeyboardListenerFeature = new CellKeyboardListenerFeature(this, this.beans, this.column, this.rowNode, this.scope, this.rowCtrl);
        this.addDestroyFunc( ()=> this.cellKeyboardListenerFeature.destroy() );

        const rangeSelectionEnabled = this.beans.rangeService && this.beans.gridOptionsWrapper.isEnableRangeSelection();
        if (rangeSelectionEnabled) {
            this.cellRangeFeature = new CellRangeFeature(this.beans, this);
        }
    }

    public setComp(comp: ICellComp, autoHeightCell: boolean,
                   usingWrapper: boolean, scope: any, eGui: HTMLElement, printLayout: boolean): void {
        this.cellComp = comp;
        this.usingWrapper = usingWrapper;
        this.autoHeightCell = autoHeightCell;
        this.gow = this.beans.gridOptionsWrapper;
        this.scope = scope;
        this.eGui = eGui;
        this.printLayout = printLayout;

        this.calculatedValueAndFormat();

        this.addDomData();

        this.onCellFocused();

        this.applyStaticCssClasses();

        this.onFirstRightPinnedChanged();
        this.onLastLeftPinnedChanged();
        this.onColumnHover();

        const colIdSanitised = escapeString(this.column.getId());
        const ariaColIndex = this.beans.columnModel.getAriaColumnIndex(this.column);

        this.cellComp.setTabIndex(-1);
        this.cellComp.setRole('gridcell');
        this.cellComp.setAriaColIndex(ariaColIndex);
        this.cellComp.setColId(colIdSanitised!);
        this.cellComp.setUnselectable(!this.beans.gridOptionsWrapper.isEnableCellTextSelection() ? 'on' : null);

        this.cellPositionFeature.setComp(comp);
        this.cellCustomStyleFeature.setComp(comp, scope);
        this.cellTooltipFeature.setComp(comp);
        this.cellMouseListenerFeature.setComp(comp);
        this.cellKeyboardListenerFeature.setComp(comp, this.eGui);
        if (this.cellRangeFeature) { this.cellRangeFeature.setComp(comp); }
    }

    private calculatedValueAndFormat(): void {
        this.value = this.calculateValue();
        this.valueFormatted = this.beans.valueFormatterService.formatValue(this.column, this.rowNode, this.scope, this.value);
    }

    public formatValue(): void {
        this.valueFormatted = this.beans.valueFormatterService.formatValue(this.column, this.rowNode, this.scope, this.value);
    }

    public calculateValue(): any {
        // if we don't check this, then the grid will render leaf groups as open even if we are not
        // allowing the user to open leaf groups. confused? remember for pivot mode we don't allow
        // opening leaf groups, so we have to force leafGroups to be closed in case the user expanded
        // them via the API, or user user expanded them in the UI before turning on pivot mode
        const lockedClosedGroup = this.rowNode.leafGroup && this.beans.columnModel.isPivotMode();

        const isOpenGroup = this.rowNode.group && this.rowNode.expanded && !this.rowNode.footer && !lockedClosedGroup;

        // are we showing group footers
        const groupFootersEnabled = this.beans.gridOptionsWrapper.isGroupIncludeFooter();

        // if doing footers, we normally don't show agg data at group level when group is open
        const groupAlwaysShowAggData = this.beans.gridOptionsWrapper.isGroupSuppressBlankHeader();

        // if doing grouping and footers, we don't want to include the agg value
        // in the header when the group is open
        const ignoreAggData = (isOpenGroup && groupFootersEnabled) && !groupAlwaysShowAggData;

        const value = this.beans.valueService.getValue(this.column, this.rowNode, false, ignoreAggData);

        return value;
    }

    public getValue(): any {
        return this.value;
    }

    public getValueFormatted(): string {
        return this.valueFormatted;
    }

    public getValueToUse(): any {
        return this.valueFormatted != null ? this.valueFormatted : this.value;
    }

    private addDomData(): void {
        const element = this.getGui();
        this.beans.gridOptionsWrapper.setDomData(element, CellCtrl.DOM_DATA_KEY_CELL_CTRL, this);

        this.addDestroyFunc(() => this.beans.gridOptionsWrapper.setDomData(element, CellCtrl.DOM_DATA_KEY_CELL_CTRL, null));
    }

    public createEvent(domEvent: Event | null, eventType: string): CellEvent {
        const event: CellEvent = {
            type: eventType,
            node: this.rowNode,
            data: this.rowNode.data,
            value: this.cellComp.getValue(),
            column: this.column,
            colDef: this.column.getColDef(),
            context: this.beans.gridOptionsWrapper.getContext(),
            api: this.beans.gridApi,
            columnApi: this.beans.columnApi,
            rowPinned: this.rowNode.rowPinned,
            event: domEvent,
            rowIndex: this.rowNode.rowIndex!
        };

        // because we are hacking in $scope for angular 1, we have to de-reference
        if (this.scope) {
            (event as any).$scope = this.scope;
        }

        return event;
    }

    public onKeyPress(event: KeyboardEvent): void {
        this.cellKeyboardListenerFeature.onKeyPress(event);
    }

    public onKeyDown(event: KeyboardEvent): void {
        this.cellKeyboardListenerFeature.onKeyDown(event);
    }

    public onMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        this.cellMouseListenerFeature.onMouseEvent(eventName, mouseEvent);
    }

    public setFocusInOnEditor(): void {
        this.cellComp.setFocusInOnEditor();
    }

    public getComp(): ICellComp {
        return this.cellComp;
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refreshToolTip(): void {
        this.cellTooltipFeature.refreshToolTip();
    }

    public setFocusOutOnEditor(): void {
        this.cellComp.setFocusOutOnEditor();
    }

    public getColSpanningList(): Column[] {
        return this.cellPositionFeature.getColSpanningList();
    }

    public onLeftChanged(): void {
        this.cellPositionFeature.onLeftChanged();
        this.refreshAriaIndex(); // should change this to listen for when column order changes
    }

    private refreshAriaIndex(): void {
        const colIdx = this.beans.columnModel.getAriaColumnIndex(this.column);
        this.cellComp.setAriaColIndex(colIdx);
    }

    public startEditingIfEnabled(keyPress: number | null = null, charPress: string | null = null, cellStartedEdit = false): void {
        this.cellComp.startEditingIfEnabled(keyPress, charPress, cellStartedEdit);
    }

    public isSuppressNavigable(): boolean {
        return this.column.isSuppressNavigable(this.rowNode);
    }

    public stopEditing(): void {
        this.cellComp.stopEditing();
    }

    public onWidthChanged(): void {
        return this.cellPositionFeature.onWidthChanged();
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

    public appendChild(htmlElement: HTMLElement): void {
        this.eGui.appendChild(htmlElement);
    }

    public refreshHandle(): void {
        if (this.cellRangeFeature) {
            this.cellRangeFeature.refreshHandle();
        }
    }

    public getCellPosition(): CellPosition {
        return this.cellPosition;
    }

    public isEditing(): boolean {
        return this.cellComp.isEditing();
    }

    public startRowOrCellEdit(keyPress?: number | null, charPress?: string | null): void {
        this.cellComp.startRowOrCellEdit(keyPress, charPress);
    }

    public getRowCtrl(): RowCtrl | null {
        return this.rowCtrl;
    }

    public getRowPosition(): RowPosition {
        return {
            rowIndex: this.cellPosition.rowIndex,
            rowPinned: this.cellPosition.rowPinned
        };
    }

    public updateRangeBordersIfRangeCount(): void {
        if (this.cellRangeFeature) {
            this.cellRangeFeature.updateRangeBordersIfRangeCount();
        }
    }

    public onRangeSelectionChanged(): void {
        if (this.cellRangeFeature) {
            this.cellRangeFeature.onRangeSelectionChanged();
        }
    }

    public temp_isRangeSelectionEnabled(): boolean {
        return this.cellRangeFeature != null;
    }

    public focusCell(forceBrowserFocus = false): void {
        this.beans.focusService.setFocusedCell(this.getCellPosition().rowIndex, this.column, this.rowNode.rowPinned, forceBrowserFocus);
    }

    public onRowIndexChanged(): void {
        // when index changes, this influences items that need the index, so we update the
        // grid cell so they are working off the new index.
        this.createCellPosition();
        // when the index of the row changes, ie means the cell may have lost or gained focus
        this.onCellFocused();
        // check range selection
        if (this.cellRangeFeature) {
            this.cellRangeFeature.onRangeSelectionChanged();
        }
    }

    public onFirstRightPinnedChanged(): void {
        const firstRightPinned = this.column.isFirstRightPinned();
        this.cellComp.addOrRemoveCssClass(CSS_CELL_FIRST_RIGHT_PINNED, firstRightPinned);
    }

    public onLastLeftPinnedChanged(): void {
        const lastLeftPinned = this.column.isLastLeftPinned();
        this.cellComp.addOrRemoveCssClass(CSS_CELL_LAST_LEFT_PINNED, lastLeftPinned);
    }

    public onCellFocused(event?: CellFocusedEvent): void {
        const cellFocused = this.beans.focusService.isCellFocused(this.cellPosition);

        if (!this.gow.isSuppressCellSelection()) {
            this.cellComp.addOrRemoveCssClass(CSS_CELL_FOCUS, cellFocused);
        }

        // see if we need to force browser focus - this can happen if focus is programmatically set
        if (cellFocused && event && event.forceBrowserFocus) {
            const focusEl = this.cellComp.getFocusableElement();
            focusEl.focus();
            // Fix for AG-3465 "IE11 - After editing cell's content, selection doesn't go one cell below on enter"
            // IE can fail to focus the cell after the first call to focus(), and needs a second call
            if (!document.activeElement || document.activeElement === document.body) {
                focusEl.focus();
            }
        }

        // if another cell was focused, and we are editing, then stop editing
        const fullRowEdit = this.beans.gridOptionsWrapper.isFullRowEdit();

        if (!cellFocused && !fullRowEdit && this.cellComp.isEditing()) {
            this.cellComp.stopRowOrCellEdit();
        }
    }

    private createCellPosition(): void {
        this.cellPosition = {
            rowIndex: this.rowNode.rowIndex!,
            rowPinned: this.rowNode.rowPinned,
            column: this.column
        };
    }

    // CSS Classes that only get applied once, they never change
    private applyStaticCssClasses(): void {
        this.cellComp.addOrRemoveCssClass(CSS_CELL, true);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_NOT_INLINE_EDITING, true);

        // if we are putting the cell into a dummy container, to work out it's height,
        // then we don't put the height css in, as we want cell to fit height in that case.
        if (!this.autoHeightCell) {
            this.cellComp.addOrRemoveCssClass(CSS_AUTO_HEIGHT, true);
        }

        // if using the wrapper, this class goes on the wrapper instead
        if (!this.usingWrapper) {
            this.cellComp.addOrRemoveCssClass(CSS_CELL_VALUE, true);
        }

        const wrapText = this.column.getColDef().wrapText == true;
        if (wrapText) {
            this.cellComp.addOrRemoveCssClass(CSS_CELL_WRAP_TEXT, true);
        }
    }

    public onColumnHover(): void {
        const isHovered = this.beans.columnHoverService.isHovered(this.column);
        this.cellComp.addOrRemoveCssClass(CSS_COLUMN_HOVER, isHovered);
    }

    public temp_applyRules(): void {
        // we do cellClassRules even if the value has not changed, so that users who have rules that
        // look at other parts of the row (where the other part of the row might of changed) will work.
        this.cellCustomStyleFeature.applyCellClassRules();
    }

    public temp_applyClasses(): void {
        this.cellCustomStyleFeature.applyClassesFromColDef();
    }

    public temp_applyStyles(): void {
        this.cellCustomStyleFeature.applyUserStyles();
    }

    public temp_applyOnNewColumnsLoaded(): void {
        this.onNewColumnsLoaded();
    }

    public onNewColumnsLoaded(): void {
        this.postProcessWrapText();
        this.cellCustomStyleFeature.applyCellClassRules();
    }

    private postProcessWrapText(): void {
        const value = this.column.getColDef().wrapText == true;
        this.cellComp.addOrRemoveCssClass(CSS_CELL_WRAP_TEXT, value);
    }

    public dispatchCellContextMenuEvent(event: Event | null) {
        const colDef = this.column.getColDef();
        const cellContextMenuEvent: CellContextMenuEvent = this.createEvent(event, Events.EVENT_CELL_CONTEXT_MENU);
        this.beans.eventService.dispatchEvent(cellContextMenuEvent);

        if (colDef.onCellContextMenu) {
            // to make the callback async, do in a timeout
            window.setTimeout(() => (colDef.onCellContextMenu as any)(cellContextMenuEvent), 0);
        }
    }

    public destroy(): void {
        if (this.cellRangeFeature) { this.cellRangeFeature.destroy(); }
    }
}