/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, PreDestroy } from "../context/context";
import { _ } from "../utils";
let ColumnApi = class ColumnApi {
    /** Gets the grid to size the columns to the specified width in pixels, e.g. `sizeColumnsToFit(900)`. To have the grid fit the columns to the grid's width, use the Grid API `gridApi.sizeColumnsToFit()` instead. */
    sizeColumnsToFit(gridWidth) {
        // AG-3403 validate that gridWidth is provided because this method has the same name as
        // a method on the grid API that takes no arguments, and it's easy to confuse the two
        if (typeof gridWidth === "undefined") {
            console.error('AG Grid: missing parameter to columnApi.sizeColumnsToFit(gridWidth)');
        }
        this.columnModel.sizeColumnsToFit(gridWidth, 'api');
    }
    /** Call this if you want to open or close a column group. */
    setColumnGroupOpened(group, newValue) { this.columnModel.setColumnGroupOpened(group, newValue, 'api'); }
    /** Returns the column group with the given name. */
    getColumnGroup(name, instanceId) { return this.columnModel.getColumnGroup(name, instanceId); }
    /** Returns the provided column group with the given name. */
    getProvidedColumnGroup(name) { return this.columnModel.getProvidedColumnGroup(name); }
    /** Returns the display name for a column. Useful if you are doing your own header rendering and want the grid to work out if `headerValueGetter` is used, or if you are doing your own column management GUI, to know what to show as the column name. */
    getDisplayNameForColumn(column, location) { return this.columnModel.getDisplayNameForColumn(column, location) || ''; }
    /** Returns the display name for a column group (when grouping columns). */
    getDisplayNameForColumnGroup(columnGroup, location) { return this.columnModel.getDisplayNameForColumnGroup(columnGroup, location) || ''; }
    /** Returns the column with the given `colKey`, which can either be the `colId` (a string) or the `colDef` (an object). */
    getColumn(key) { return this.columnModel.getPrimaryColumn(key); }
    /** Returns all the columns, regardless of visible or not. */
    getColumns() { return this.columnModel.getAllPrimaryColumns(); }
    /** Applies the state of the columns from a previous state. Returns `false` if one or more columns could not be found. */
    applyColumnState(params) { return this.columnModel.applyColumnState(params, 'api'); }
    /** Gets the state of the columns. Typically used when saving column state. */
    getColumnState() { return this.columnModel.getColumnState(); }
    /** Sets the state back to match the originally provided column definitions. */
    resetColumnState() { this.columnModel.resetColumnState('api'); }
    /** Gets the state of the column groups. Typically used when saving column group state. */
    getColumnGroupState() { return this.columnModel.getColumnGroupState(); }
    /** Sets the state of the column group state from a previous state. */
    setColumnGroupState(stateItems) { this.columnModel.setColumnGroupState(stateItems, 'api'); }
    /** Sets the state back to match the originally provided column definitions. */
    resetColumnGroupState() { this.columnModel.resetColumnGroupState('api'); }
    /** Returns `true` if pinning left or right, otherwise `false`. */
    isPinning() { return this.columnModel.isPinningLeft() || this.columnModel.isPinningRight(); }
    /** Returns `true` if pinning left, otherwise `false`. */
    isPinningLeft() { return this.columnModel.isPinningLeft(); }
    /** Returns `true` if pinning right, otherwise `false`. */
    isPinningRight() { return this.columnModel.isPinningRight(); }
    /** Returns the column to the right of the provided column, taking into consideration open / closed column groups and visible columns. This is useful if you need to know what column is beside yours e.g. if implementing your own cell navigation. */
    getDisplayedColAfter(col) { return this.columnModel.getDisplayedColAfter(col); }
    /** Same as `getVisibleColAfter` except gives column to the left. */
    getDisplayedColBefore(col) { return this.columnModel.getDisplayedColBefore(col); }
    /** Sets the visibility of a column. Key can be the column ID or `Column` object. */
    setColumnVisible(key, visible) { this.columnModel.setColumnVisible(key, visible, 'api'); }
    /** Same as `setColumnVisible`, but provide a list of column keys. */
    setColumnsVisible(keys, visible) { this.columnModel.setColumnsVisible(keys, visible, 'api'); }
    /** Sets the column pinned / unpinned. Key can be the column ID, field, `ColDef` object or `Column` object. */
    setColumnPinned(key, pinned) { this.columnModel.setColumnPinned(key, pinned, 'api'); }
    /** Same as `setColumnPinned`, but provide a list of column keys. */
    setColumnsPinned(keys, pinned) { this.columnModel.setColumnsPinned(keys, pinned, 'api'); }
    /**
     * Returns all the grid columns, same as `getColumns()`, except
     *
     *  a) it has the order of the columns that are presented in the grid
     *
     *  b) it's after the 'pivot' step, so if pivoting, has the value columns for the pivot.
     */
    getAllGridColumns() { return this.columnModel.getAllGridColumns(); }
    /** Same as `getAllDisplayedColumns` but just for the pinned left portion of the grid. */
    getDisplayedLeftColumns() { return this.columnModel.getDisplayedLeftColumns(); }
    /** Same as `getAllDisplayedColumns` but just for the center portion of the grid. */
    getDisplayedCenterColumns() { return this.columnModel.getDisplayedCenterColumns(); }
    /** Same as `getAllDisplayedColumns` but just for the pinned right portion of the grid. */
    getDisplayedRightColumns() { return this.columnModel.getDisplayedRightColumns(); }
    /** Returns all columns currently displayed (e.g. are visible and if in a group, the group is showing the columns) for the pinned left, centre and pinned right portions of the grid. */
    getAllDisplayedColumns() { return this.columnModel.getAllDisplayedColumns(); }
    /** Same as `getAllGridColumns()`, except only returns rendered columns, i.e. columns that are not within the viewport and therefore not rendered, due to column virtualisation, are not displayed. */
    getAllDisplayedVirtualColumns() { return this.columnModel.getViewportColumns(); }
    /** Moves a column to `toIndex`. The column is first removed, then added at the `toIndex` location, thus index locations will change to the right of the column after the removal. */
    moveColumn(key, toIndex) {
        if (typeof key === 'number') {
            // moveColumn used to take indexes, so this is advising user who hasn't moved to new method name
            console.warn('AG Grid: you are using moveColumn(fromIndex, toIndex) - moveColumn takes a column key and a destination index, not two indexes, to move with indexes use moveColumnByIndex(from,to) instead');
            this.columnModel.moveColumnByIndex(key, toIndex, 'api');
        }
        else {
            this.columnModel.moveColumn(key, toIndex, 'api');
        }
    }
    /** Same as `moveColumn` but works on index locations. */
    moveColumnByIndex(fromIndex, toIndex) { this.columnModel.moveColumnByIndex(fromIndex, toIndex, 'api'); }
    /** Same as `moveColumn` but works on list. */
    moveColumns(columnsToMoveKeys, toIndex) { this.columnModel.moveColumns(columnsToMoveKeys, toIndex, 'api'); }
    /** Move the column to a new position in the row grouping order. */
    moveRowGroupColumn(fromIndex, toIndex) { this.columnModel.moveRowGroupColumn(fromIndex, toIndex); }
    /** Sets the agg function for a column. `aggFunc` can be one of `'min' | 'max' | 'sum'`. */
    setColumnAggFunc(key, aggFunc) { this.columnModel.setColumnAggFunc(key, aggFunc); }
    /** Sets the column width on a single column. The finished flag gets included in the resulting event and not used internally by the grid. The finished flag is intended for dragging, where a dragging action will produce many `columnWidth` events, so the consumer of events knows when it receives the last event in a stream. The finished parameter is optional, and defaults to `true`. */
    setColumnWidth(key, newWidth, finished = true, source) {
        this.columnModel.setColumnWidths([{ key, newWidth }], false, finished, source);
    }
    /** Sets the column widths on multiple columns. This method offers better performance than calling `setColumnWidth` multiple times. The finished flag gets included in the resulting event and not used internally by the grid. The finished flag is intended for dragging, where a dragging action will produce many `columnWidth` events, so the consumer of events knows when it receives the last event in a stream. The finished parameter is optional, and defaults to `true`. */
    setColumnWidths(columnWidths, finished = true, source) {
        this.columnModel.setColumnWidths(columnWidths, false, finished, source);
    }
    /** Set the pivot mode. */
    setPivotMode(pivotMode) { this.columnModel.setPivotMode(pivotMode); }
    /** Get the pivot mode. */
    isPivotMode() { return this.columnModel.isPivotMode(); }
    /** @deprecated Use `getPivotResultColumn` instead */
    getSecondaryPivotColumn(pivotKeys, valueColKey) {
        console.warn('AG Grid: since version 28.0.x getSecondaryPivotColumn has been renamed, please use getPivotResultColumn instead');
        return this.getPivotResultColumn(pivotKeys, valueColKey);
    }
    /** Returns the pivot result column for the given `pivotKeys` and `valueColId`. Useful to then call operations on the pivot column. */
    getPivotResultColumn(pivotKeys, valueColKey) { return this.columnModel.getSecondaryPivotColumn(pivotKeys, valueColKey); }
    /** Set the value columns. */
    setValueColumns(colKeys) { this.columnModel.setValueColumns(colKeys, 'api'); }
    /** Get value columns. */
    getValueColumns() { return this.columnModel.getValueColumns(); }
    /** Remove a value column. */
    removeValueColumn(colKey) { this.columnModel.removeValueColumn(colKey, 'api'); }
    /** Same as `removeValueColumns` but provide a list. */
    removeValueColumns(colKeys) { this.columnModel.removeValueColumns(colKeys, 'api'); }
    /** Add a value column. */
    addValueColumn(colKey) { this.columnModel.addValueColumn(colKey, 'api'); }
    /** Same as `addValueColumn` but provide a list. */
    addValueColumns(colKeys) { this.columnModel.addValueColumns(colKeys, 'api'); }
    /** Set the row group columns. */
    setRowGroupColumns(colKeys) { this.columnModel.setRowGroupColumns(colKeys, 'api'); }
    /** Remove a column from the row groups. */
    removeRowGroupColumn(colKey) { this.columnModel.removeRowGroupColumn(colKey, 'api'); }
    /** Same as `removeRowGroupColumn` but provide a list of columns. */
    removeRowGroupColumns(colKeys) { this.columnModel.removeRowGroupColumns(colKeys, 'api'); }
    /** Add a column to the row groups. */
    addRowGroupColumn(colKey) { this.columnModel.addRowGroupColumn(colKey, 'api'); }
    /** Same as `addRowGroupColumn` but provide a list of columns. */
    addRowGroupColumns(colKeys) { this.columnModel.addRowGroupColumns(colKeys, 'api'); }
    /** Get row group columns. */
    getRowGroupColumns() { return this.columnModel.getRowGroupColumns(); }
    /** Set the pivot columns. */
    setPivotColumns(colKeys) { this.columnModel.setPivotColumns(colKeys, 'api'); }
    /** Remove a pivot column. */
    removePivotColumn(colKey) { this.columnModel.removePivotColumn(colKey, 'api'); }
    /** Same as `removePivotColumn` but provide a list of columns. */
    removePivotColumns(colKeys) { this.columnModel.removePivotColumns(colKeys, 'api'); }
    /** Add a pivot column. */
    addPivotColumn(colKey) { this.columnModel.addPivotColumn(colKey, 'api'); }
    /** Same as `addPivotColumn` but provide a list of columns. */
    addPivotColumns(colKeys) { this.columnModel.addPivotColumns(colKeys, 'api'); }
    /** Get the pivot columns. */
    getPivotColumns() { return this.columnModel.getPivotColumns(); }
    /** Same as `getAllDisplayedColumnGroups` but just for the pinned left portion of the grid. */
    getLeftDisplayedColumnGroups() { return this.columnModel.getDisplayedTreeLeft(); }
    /** Same as `getAllDisplayedColumnGroups` but just for the center portion of the grid. */
    getCenterDisplayedColumnGroups() { return this.columnModel.getDisplayedTreeCentre(); }
    /** Same as `getAllDisplayedColumnGroups` but just for the pinned right portion of the grid. */
    getRightDisplayedColumnGroups() { return this.columnModel.getDisplayedTreeRight(); }
    /** Returns all 'root' column headers. If you are not grouping columns, these return the columns. If you are grouping, these return the top level groups - you can navigate down through each one to get the other lower level headers and finally the columns at the bottom. */
    getAllDisplayedColumnGroups() { return this.columnModel.getAllDisplayedTrees(); }
    /** Auto-sizes a column based on its contents. */
    autoSizeColumn(key, skipHeader) { return this.columnModel.autoSizeColumn(key, skipHeader, 'api'); }
    /** Same as `autoSizeColumn`, but provide a list of column keys. */
    autoSizeColumns(keys, skipHeader) {
        this.columnModel.autoSizeColumns({ columns: keys, skipHeader: skipHeader });
    }
    /** Calls `autoSizeColumns` on all displayed columns. */
    autoSizeAllColumns(skipHeader) { this.columnModel.autoSizeAllColumns(skipHeader, 'api'); }
    /** @deprecated Use `setPivotResultColumns` instead. */
    setSecondaryColumns(colDefs) {
        console.warn('AG Grid: since version 28.0.x setSecondaryColumns has been renamed, please use setPivotResultColumns instead');
        this.setPivotResultColumns(colDefs);
    }
    /** Set the pivot result columns. */
    setPivotResultColumns(colDefs) { this.columnModel.setSecondaryColumns(colDefs, 'api'); }
    /** @deprecated Use `getPivotResultColumns` instead. */
    getSecondaryColumns() {
        console.warn('AG Grid: since version 28.0.x getSecondaryColumns has been renamed, please use getPivotResultColumns instead');
        return this.getPivotResultColumns();
    }
    /** Returns the grid's pivot result columns. */
    getPivotResultColumns() { return this.columnModel.getSecondaryColumns(); }
    /** @deprecated Use `getColumns` instead. */
    getPrimaryColumns() {
        console.warn('AG Grid: since version 28.0.x getPrimaryColumns has been renamed, please use getColumns instead');
        return this.getColumns();
    }
    cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid() {
        // some users were raising support issues with regards memory leaks. the problem was the customers applications
        // were keeping references to the API. trying to educate them all would be difficult, easier to just remove
        // all references in the API so at least the core grid can be garbage collected.
        //
        // wait about 100ms before clearing down the references, in case user has some cleanup to do,
        // and needs to deference the API first
        setTimeout(_.removeAllReferences.bind(window, this, 'Column API'), 100);
    }
    // below goes through deprecated items, prints message to user, then calls the new version of the same method
    // public getColumnDefs(): (ColDef | ColGroupDef)[] {
    //     this.setColumnGroupOpened(group, newValue);
    //     return null;
    // }
    /** @deprecated Use `getColumns` instead */
    getAllColumns() {
        console.warn('AG Grid: since version 28.0.x getAllColumns has been renamed, please use getColumns instead');
        return this.getColumns();
    }
    /** @deprecated columnGroupOpened no longer exists, use setColumnGroupOpened */
    columnGroupOpened(group, newValue) {
        console.error('AG Grid: columnGroupOpened no longer exists, use setColumnGroupOpened');
        this.setColumnGroupOpened(group, newValue);
    }
    /** @deprecated hideColumns is deprecated, use setColumnsVisible */
    hideColumns(colIds, hide) {
        console.error('AG Grid: hideColumns is deprecated, use setColumnsVisible');
        this.columnModel.setColumnsVisible(colIds, !hide, 'api');
    }
    /** @deprecated hideColumn is deprecated, use setColumnVisible */
    hideColumn(colId, hide) {
        console.error('AG Grid: hideColumn is deprecated, use setColumnVisible');
        this.columnModel.setColumnVisible(colId, !hide, 'api');
    }
    /** @deprecated setState is deprecated, use setColumnState */
    setState(columnState) {
        console.error('AG Grid: setState is deprecated, use setColumnState');
        return this.setColumnState(columnState);
    }
    /** @deprecated getState is deprecated, use getColumnState */
    getState() {
        console.error('AG Grid: getState is deprecated, use getColumnState');
        return this.getColumnState();
    }
    /** @deprecated resetState is deprecated, use resetColumnState */
    resetState() {
        console.error('AG Grid: resetState is deprecated, use resetColumnState');
        this.resetColumnState();
    }
    /** @deprecated getAggregationColumns is deprecated, use getValueColumns */
    getAggregationColumns() {
        console.error('AG Grid: getAggregationColumns is deprecated, use getValueColumns');
        return this.columnModel.getValueColumns();
    }
    /** @deprecated removeAggregationColumn is deprecated, use removeValueColumn */
    removeAggregationColumn(colKey) {
        console.error('AG Grid: removeAggregationColumn is deprecated, use removeValueColumn');
        this.columnModel.removeValueColumn(colKey, 'api');
    }
    /** @deprecated removeAggregationColumns is deprecated, use removeValueColumns */
    removeAggregationColumns(colKeys) {
        console.error('AG Grid: removeAggregationColumns is deprecated, use removeValueColumns');
        this.columnModel.removeValueColumns(colKeys, 'api');
    }
    /** @deprecated addAggregationColumn is deprecated, use addValueColumn */
    addAggregationColumn(colKey) {
        console.error('AG Grid: addAggregationColumn is deprecated, use addValueColumn');
        this.columnModel.addValueColumn(colKey, 'api');
    }
    /** @deprecated addAggregationColumns is deprecated, use addValueColumns */
    addAggregationColumns(colKeys) {
        console.error('AG Grid: addAggregationColumns is deprecated, use addValueColumns');
        this.columnModel.addValueColumns(colKeys, 'api');
    }
    /** @deprecated setColumnAggFunction is deprecated, use setColumnAggFunc */
    setColumnAggFunction(column, aggFunc) {
        console.error('AG Grid: setColumnAggFunction is deprecated, use setColumnAggFunc');
        this.columnModel.setColumnAggFunc(column, aggFunc, 'api');
    }
    /** @deprecated getDisplayNameForCol is deprecated, use getDisplayNameForColumn */
    getDisplayNameForCol(column) {
        console.error('AG Grid: getDisplayNameForCol is deprecated, use getDisplayNameForColumn');
        return this.getDisplayNameForColumn(column, null);
    }
    /** @deprecated setColumnState is deprecated, use applyColumnState. */
    setColumnState(columnState) {
        console.error('AG Grid: setColumnState is deprecated, use applyColumnState');
        return this.columnModel.applyColumnState({ state: columnState, applyOrder: true }, 'api');
    }
    /** @deprecated getOriginalColumnGroup is deprecated, use getProvidedColumnGroup. */
    getOriginalColumnGroup(name) {
        console.error('AG Grid: getOriginalColumnGroup is deprecated, use getProvidedColumnGroup');
        return this.columnModel.getProvidedColumnGroup(name);
    }
};
__decorate([
    Autowired('columnModel')
], ColumnApi.prototype, "columnModel", void 0);
__decorate([
    PreDestroy
], ColumnApi.prototype, "cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid", null);
ColumnApi = __decorate([
    Bean('columnApi')
], ColumnApi);
export { ColumnApi };
