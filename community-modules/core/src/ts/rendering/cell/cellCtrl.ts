import { Beans } from "./../beans";
import { Column } from "../../entities/column";
import { CellClassParams, ColDef } from "../../entities/colDef";
import { RowNode } from "../../entities/rowNode";
import { CellPosition } from "../../entities/cellPosition";
import { CellFocusedEvent, Events } from "../../events";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { CellRangeFeature } from "./cellRangeFeature";
import { areEqual, last } from "../../utils/array";
import { Constants } from "../../constants/constants";
import { setAriaColIndex } from "../../utils/aria";
import { missing } from "../../utils/generic";
import { BeanStub } from "../../context/beanStub";
import { CellPositionFeature } from "./cellPositionFeature";

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

    // setValue(value: any): void;
    // setValueFormatted(value: string): void;

    // temp to get things compiling
    isEditing(): boolean;
    getValue(): any;
    stopRowOrCellEdit(): void;
}

export class CellCtrl extends BeanStub {

    private eGui: HTMLElement;
    private comp: ICellComp;
    private beans: Beans;
    private gow: GridOptionsWrapper;
    private column: Column;
    private rowNode: RowNode;

    private autoHeightCell: boolean;
    private printLayout: boolean;

    // just passed in
    private scope: any;
    private usingWrapper: boolean;

    private cellRangeFeature: CellRangeFeature;
    private cellPositionFeature: CellPositionFeature;

    private cellPosition: CellPosition;

    constructor(column: Column, rowNode: RowNode, beans: Beans) {
        super();
        this.column = column;
        this.rowNode = rowNode;
        this.beans = beans;

        this.createCellPosition();
        this.addFeatures();
    }

    private addFeatures(): void {
        this.cellPositionFeature = new CellPositionFeature(this, this.beans);
        this.addDestroyFunc( ()=> this.cellPositionFeature.destroy() );

        const rangeSelectionEnabled = this.beans.rangeService && this.beans.gridOptionsWrapper.isEnableRangeSelection();
        if (rangeSelectionEnabled) {
            this.cellRangeFeature = new CellRangeFeature(this.beans, this);
        }
    }

    public setComp(comp: ICellComp, autoHeightCell: boolean,
                   usingWrapper: boolean, scope: any, eGui: HTMLElement, printLayout: boolean): void {
        this.comp = comp;
        this.usingWrapper = usingWrapper;
        this.autoHeightCell = autoHeightCell;
        this.gow = this.beans.gridOptionsWrapper;
        this.scope = scope;
        this.eGui = eGui;
        this.printLayout = printLayout;

        this.onCellFocused();

        this.applyStaticCssClasses();
        this.applyCellClassRules();
        this.applyUserStyles();
        this.applyClassesFromColDef();

        this.onFirstRightPinnedChanged();
        this.onLastLeftPinnedChanged();
        this.onColumnHover();

        this.comp.setTabIndex(-1);
        this.comp.setRole('gridcell');

        this.cellPositionFeature.setComp(comp);
        if (this.cellRangeFeature) { this.cellRangeFeature.setComp(comp); }
    }

    public getColSpanningList(): Column[] {
        return this.cellPositionFeature.getColSpanningList();
    }

    public onLeftChanged(): void {
        return this.cellPositionFeature.onLeftChanged();
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
        this.comp.addOrRemoveCssClass(CSS_CELL_FIRST_RIGHT_PINNED, firstRightPinned);
    }

    public onLastLeftPinnedChanged(): void {
        const lastLeftPinned = this.column.isLastLeftPinned();
        this.comp.addOrRemoveCssClass(CSS_CELL_LAST_LEFT_PINNED, lastLeftPinned);
    }

    public onCellFocused(event?: CellFocusedEvent): void {
        const cellFocused = this.beans.focusService.isCellFocused(this.cellPosition);

        if (!this.gow.isSuppressCellSelection()) {
            this.comp.addOrRemoveCssClass(CSS_CELL_FOCUS, cellFocused);
        }

        // see if we need to force browser focus - this can happen if focus is programmatically set
        if (cellFocused && event && event.forceBrowserFocus) {
            const focusEl = this.comp.getFocusableElement();
            focusEl.focus();
            // Fix for AG-3465 "IE11 - After editing cell's content, selection doesn't go one cell below on enter"
            // IE can fail to focus the cell after the first call to focus(), and needs a second call
            if (!document.activeElement || document.activeElement === document.body) {
                focusEl.focus();
            }
        }

        // if another cell was focused, and we are editing, then stop editing
        const fullRowEdit = this.beans.gridOptionsWrapper.isFullRowEdit();

        if (!cellFocused && !fullRowEdit && this.comp.isEditing()) {
            this.comp.stopRowOrCellEdit();
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
        const cssClasses = [CSS_CELL, CSS_CELL_NOT_INLINE_EDITING];

        // if we are putting the cell into a dummy container, to work out it's height,
        // then we don't put the height css in, as we want cell to fit height in that case.
        if (!this.autoHeightCell) {
            cssClasses.push(CSS_AUTO_HEIGHT);
        }

        // if using the wrapper, this class goes on the wrapper instead
        if (!this.usingWrapper) {
            cssClasses.push(CSS_CELL_VALUE);
        }

        const wrapText = this.column.getColDef().wrapText == true;
        if (wrapText) {
            cssClasses.push(CSS_CELL_WRAP_TEXT);
        }

        cssClasses.forEach(c => this.comp.addOrRemoveCssClass(c, true));
    }

    public onColumnHover(): void {
        const isHovered = this.beans.columnHoverService.isHovered(this.column);
        this.comp.addOrRemoveCssClass(CSS_COLUMN_HOVER, isHovered);
    }

    public temp_applyRules(): void {
        // we do cellClassRules even if the value has not changed, so that users who have rules that
        // look at other parts of the row (where the other part of the row might of changed) will work.
        this.applyCellClassRules();
    }

    public temp_applyClasses(): void {
        this.applyClassesFromColDef();
    }

    public temp_applyStyles(): void {
        this.applyUserStyles();
    }

    public temp_applyOnNewColumnsLoaded(): void {
        this.onNewColumnsLoaded();
    }

    private applyUserStyles() {
        const colDef = this.column.getColDef();

        if (!colDef.cellStyle) { return; }

        let styles: {};

        if (typeof colDef.cellStyle === 'function') {
            const cellStyleParams = {
                column: this.column,
                value: this.comp.getValue(),
                colDef: colDef,
                data: this.rowNode.data,
                node: this.rowNode,
                rowIndex: this.rowNode.rowIndex!,
                $scope: this.scope,
                api: this.beans.gridOptionsWrapper.getApi()!,
                columnApi: this.beans.gridOptionsWrapper.getColumnApi()!,
                context: this.beans.gridOptionsWrapper.getContext(),
            } as CellClassParams;
            const cellStyleFunc = colDef.cellStyle as Function;
            styles = cellStyleFunc(cellStyleParams);
        } else {
            styles = colDef.cellStyle;
        }

        this.comp.setUserStyles(styles);
    }

    public getComponentHolder(): ColDef {
        return this.column.getColDef();
    }

    private applyCellClassRules(): void {
        const colDef = this.getComponentHolder();
        const cellClassParams: CellClassParams = {
            value: this.comp.getValue(),
            data: this.rowNode.data,
            node: this.rowNode,
            colDef: colDef,
            rowIndex: this.cellPosition.rowIndex,
            api: this.beans.gridOptionsWrapper.getApi()!,
            columnApi: this.beans.gridOptionsWrapper.getColumnApi()!,
            $scope: this.scope,
            context: this.beans.gridOptionsWrapper.getContext()
        };

        this.beans.stylingService.processClassRules(
            colDef.cellClassRules,
            cellClassParams,
            className => this.comp.addOrRemoveCssClass(className, true),
            className => this.comp.addOrRemoveCssClass(className, false)
        );
    }

    public onNewColumnsLoaded(): void {
        this.postProcessWrapText();
        this.applyCellClassRules();
    }

    private postProcessWrapText(): void {
        const value = this.column.getColDef().wrapText == true;
        this.comp.addOrRemoveCssClass(CSS_CELL_WRAP_TEXT, value);
    }


    private applyClassesFromColDef() {

        const colDef = this.getComponentHolder();
        const cellClassParams: CellClassParams = {
            value: this.comp.getValue(),
            data: this.rowNode.data,
            node: this.rowNode,
            colDef: colDef,
            rowIndex: this.rowNode.rowIndex!,
            $scope: this.scope,
            api: this.beans.gridOptionsWrapper.getApi()!,
            columnApi: this.beans.gridOptionsWrapper.getColumnApi()!,
            context: this.beans.gridOptionsWrapper.getContext()
        };

        this.beans.stylingService.processStaticCellClasses(
            colDef,
            cellClassParams,
            className => this.comp.addOrRemoveCssClass(className, true)
        );
    }



    public destroy(): void {
        if (this.cellRangeFeature) { this.cellRangeFeature.destroy(); }
    }

}