/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var utils_1 = require("../utils");
var ColumnApi = /** @class */ (function () {
    function ColumnApi() {
    }
    /** Gets the grid to size the columns to the specified width in pixels, e.g. `sizeColumnsToFit(900)`. To have the grid fit the columns to the grid's width, use the Grid API `gridApi.sizeColumnsToFit()` instead. */
    ColumnApi.prototype.sizeColumnsToFit = function (gridWidth) {
        // AG-3403 validate that gridWidth is provided because this method has the same name as
        // a method on the grid API that takes no arguments, and it's easy to confuse the two
        if (typeof gridWidth === "undefined") {
            console.error('AG Grid: missing parameter to columnApi.sizeColumnsToFit(gridWidth)');
        }
        this.columnModel.sizeColumnsToFit(gridWidth, 'api');
    };
    /** Call this if you want to open or close a column group. */
    ColumnApi.prototype.setColumnGroupOpened = function (group, newValue) { this.columnModel.setColumnGroupOpened(group, newValue, 'api'); };
    /** Returns the column group with the given name. */
    ColumnApi.prototype.getColumnGroup = function (name, instanceId) { return this.columnModel.getColumnGroup(name, instanceId); };
    /** Returns the provided column group with the given name. */
    ColumnApi.prototype.getProvidedColumnGroup = function (name) { return this.columnModel.getProvidedColumnGroup(name); };
    /** Returns the display name for a column. Useful if you are doing your own header rendering and want the grid to work out if `headerValueGetter` is used, or if you are doing your own column management GUI, to know what to show as the column name. */
    ColumnApi.prototype.getDisplayNameForColumn = function (column, location) { return this.columnModel.getDisplayNameForColumn(column, location) || ''; };
    /** Returns the display name for a column group (when grouping columns). */
    ColumnApi.prototype.getDisplayNameForColumnGroup = function (columnGroup, location) { return this.columnModel.getDisplayNameForColumnGroup(columnGroup, location) || ''; };
    /** Returns the column with the given `colKey`, which can either be the `colId` (a string) or the `colDef` (an object). */
    ColumnApi.prototype.getColumn = function (key) { return this.columnModel.getPrimaryColumn(key); };
    /** Returns all the columns, regardless of visible or not. */
    ColumnApi.prototype.getColumns = function () { return this.columnModel.getAllPrimaryColumns(); };
    /** Applies the state of the columns from a previous state. Returns `false` if one or more columns could not be found. */
    ColumnApi.prototype.applyColumnState = function (params) { return this.columnModel.applyColumnState(params, 'api'); };
    /** Gets the state of the columns. Typically used when saving column state. */
    ColumnApi.prototype.getColumnState = function () { return this.columnModel.getColumnState(); };
    /** Sets the state back to match the originally provided column definitions. */
    ColumnApi.prototype.resetColumnState = function () { this.columnModel.resetColumnState('api'); };
    /** Gets the state of the column groups. Typically used when saving column group state. */
    ColumnApi.prototype.getColumnGroupState = function () { return this.columnModel.getColumnGroupState(); };
    /** Sets the state of the column group state from a previous state. */
    ColumnApi.prototype.setColumnGroupState = function (stateItems) { this.columnModel.setColumnGroupState(stateItems, 'api'); };
    /** Sets the state back to match the originally provided column definitions. */
    ColumnApi.prototype.resetColumnGroupState = function () { this.columnModel.resetColumnGroupState('api'); };
    /** Returns `true` if pinning left or right, otherwise `false`. */
    ColumnApi.prototype.isPinning = function () { return this.columnModel.isPinningLeft() || this.columnModel.isPinningRight(); };
    /** Returns `true` if pinning left, otherwise `false`. */
    ColumnApi.prototype.isPinningLeft = function () { return this.columnModel.isPinningLeft(); };
    /** Returns `true` if pinning right, otherwise `false`. */
    ColumnApi.prototype.isPinningRight = function () { return this.columnModel.isPinningRight(); };
    /** Returns the column to the right of the provided column, taking into consideration open / closed column groups and visible columns. This is useful if you need to know what column is beside yours e.g. if implementing your own cell navigation. */
    ColumnApi.prototype.getDisplayedColAfter = function (col) { return this.columnModel.getDisplayedColAfter(col); };
    /** Same as `getVisibleColAfter` except gives column to the left. */
    ColumnApi.prototype.getDisplayedColBefore = function (col) { return this.columnModel.getDisplayedColBefore(col); };
    /** Sets the visibility of a column. Key can be the column ID or `Column` object. */
    ColumnApi.prototype.setColumnVisible = function (key, visible) { this.columnModel.setColumnVisible(key, visible, 'api'); };
    /** Same as `setColumnVisible`, but provide a list of column keys. */
    ColumnApi.prototype.setColumnsVisible = function (keys, visible) { this.columnModel.setColumnsVisible(keys, visible, 'api'); };
    /** Sets the column pinned / unpinned. Key can be the column ID, field, `ColDef` object or `Column` object. */
    ColumnApi.prototype.setColumnPinned = function (key, pinned) { this.columnModel.setColumnPinned(key, pinned, 'api'); };
    /** Same as `setColumnPinned`, but provide a list of column keys. */
    ColumnApi.prototype.setColumnsPinned = function (keys, pinned) { this.columnModel.setColumnsPinned(keys, pinned, 'api'); };
    /**
     * Returns all the grid columns, same as `getColumns()`, except
     *
     *  a) it has the order of the columns that are presented in the grid
     *
     *  b) it's after the 'pivot' step, so if pivoting, has the value columns for the pivot.
     */
    ColumnApi.prototype.getAllGridColumns = function () { return this.columnModel.getAllGridColumns(); };
    /** Same as `getAllDisplayedColumns` but just for the pinned left portion of the grid. */
    ColumnApi.prototype.getDisplayedLeftColumns = function () { return this.columnModel.getDisplayedLeftColumns(); };
    /** Same as `getAllDisplayedColumns` but just for the center portion of the grid. */
    ColumnApi.prototype.getDisplayedCenterColumns = function () { return this.columnModel.getDisplayedCenterColumns(); };
    /** Same as `getAllDisplayedColumns` but just for the pinned right portion of the grid. */
    ColumnApi.prototype.getDisplayedRightColumns = function () { return this.columnModel.getDisplayedRightColumns(); };
    /** Returns all columns currently displayed (e.g. are visible and if in a group, the group is showing the columns) for the pinned left, centre and pinned right portions of the grid. */
    ColumnApi.prototype.getAllDisplayedColumns = function () { return this.columnModel.getAllDisplayedColumns(); };
    /** Same as `getAllGridColumns()`, except only returns rendered columns, i.e. columns that are not within the viewport and therefore not rendered, due to column virtualisation, are not displayed. */
    ColumnApi.prototype.getAllDisplayedVirtualColumns = function () { return this.columnModel.getViewportColumns(); };
    /** Moves a column to `toIndex`. The column is first removed, then added at the `toIndex` location, thus index locations will change to the right of the column after the removal. */
    ColumnApi.prototype.moveColumn = function (key, toIndex) {
        if (typeof key === 'number') {
            // moveColumn used to take indexes, so this is advising user who hasn't moved to new method name
            console.warn('AG Grid: you are using moveColumn(fromIndex, toIndex) - moveColumn takes a column key and a destination index, not two indexes, to move with indexes use moveColumnByIndex(from,to) instead');
            this.columnModel.moveColumnByIndex(key, toIndex, 'api');
        }
        else {
            this.columnModel.moveColumn(key, toIndex, 'api');
        }
    };
    /** Same as `moveColumn` but works on index locations. */
    ColumnApi.prototype.moveColumnByIndex = function (fromIndex, toIndex) { this.columnModel.moveColumnByIndex(fromIndex, toIndex, 'api'); };
    /** Same as `moveColumn` but works on list. */
    ColumnApi.prototype.moveColumns = function (columnsToMoveKeys, toIndex) { this.columnModel.moveColumns(columnsToMoveKeys, toIndex, 'api'); };
    /** Move the column to a new position in the row grouping order. */
    ColumnApi.prototype.moveRowGroupColumn = function (fromIndex, toIndex) { this.columnModel.moveRowGroupColumn(fromIndex, toIndex); };
    /** Sets the agg function for a column. `aggFunc` can be one of `'min' | 'max' | 'sum'`. */
    ColumnApi.prototype.setColumnAggFunc = function (key, aggFunc) { this.columnModel.setColumnAggFunc(key, aggFunc); };
    /** Sets the column width on a single column. The finished flag gets included in the resulting event and not used internally by the grid. The finished flag is intended for dragging, where a dragging action will produce many `columnWidth` events, so the consumer of events knows when it receives the last event in a stream. The finished parameter is optional, and defaults to `true`. */
    ColumnApi.prototype.setColumnWidth = function (key, newWidth, finished, source) {
        if (finished === void 0) { finished = true; }
        this.columnModel.setColumnWidths([{ key: key, newWidth: newWidth }], false, finished, source);
    };
    /** Sets the column widths on multiple columns. This method offers better performance than calling `setColumnWidth` multiple times. The finished flag gets included in the resulting event and not used internally by the grid. The finished flag is intended for dragging, where a dragging action will produce many `columnWidth` events, so the consumer of events knows when it receives the last event in a stream. The finished parameter is optional, and defaults to `true`. */
    ColumnApi.prototype.setColumnWidths = function (columnWidths, finished, source) {
        if (finished === void 0) { finished = true; }
        this.columnModel.setColumnWidths(columnWidths, false, finished, source);
    };
    /** Set the pivot mode. */
    ColumnApi.prototype.setPivotMode = function (pivotMode) { this.columnModel.setPivotMode(pivotMode); };
    /** Get the pivot mode. */
    ColumnApi.prototype.isPivotMode = function () { return this.columnModel.isPivotMode(); };
    /** @deprecated Use `getPivotResultColumn` instead */
    ColumnApi.prototype.getSecondaryPivotColumn = function (pivotKeys, valueColKey) {
        console.warn('AG Grid: since version 28.0.x getSecondaryPivotColumn has been renamed, please use getPivotResultColumn instead');
        return this.getPivotResultColumn(pivotKeys, valueColKey);
    };
    /** Returns the pivot result column for the given `pivotKeys` and `valueColId`. Useful to then call operations on the pivot column. */
    ColumnApi.prototype.getPivotResultColumn = function (pivotKeys, valueColKey) { return this.columnModel.getSecondaryPivotColumn(pivotKeys, valueColKey); };
    /** Set the value columns. */
    ColumnApi.prototype.setValueColumns = function (colKeys) { this.columnModel.setValueColumns(colKeys, 'api'); };
    /** Get value columns. */
    ColumnApi.prototype.getValueColumns = function () { return this.columnModel.getValueColumns(); };
    /** Remove a value column. */
    ColumnApi.prototype.removeValueColumn = function (colKey) { this.columnModel.removeValueColumn(colKey, 'api'); };
    /** Same as `removeValueColumns` but provide a list. */
    ColumnApi.prototype.removeValueColumns = function (colKeys) { this.columnModel.removeValueColumns(colKeys, 'api'); };
    /** Add a value column. */
    ColumnApi.prototype.addValueColumn = function (colKey) { this.columnModel.addValueColumn(colKey, 'api'); };
    /** Same as `addValueColumn` but provide a list. */
    ColumnApi.prototype.addValueColumns = function (colKeys) { this.columnModel.addValueColumns(colKeys, 'api'); };
    /** Set the row group columns. */
    ColumnApi.prototype.setRowGroupColumns = function (colKeys) { this.columnModel.setRowGroupColumns(colKeys, 'api'); };
    /** Remove a column from the row groups. */
    ColumnApi.prototype.removeRowGroupColumn = function (colKey) { this.columnModel.removeRowGroupColumn(colKey, 'api'); };
    /** Same as `removeRowGroupColumn` but provide a list of columns. */
    ColumnApi.prototype.removeRowGroupColumns = function (colKeys) { this.columnModel.removeRowGroupColumns(colKeys, 'api'); };
    /** Add a column to the row groups. */
    ColumnApi.prototype.addRowGroupColumn = function (colKey) { this.columnModel.addRowGroupColumn(colKey, 'api'); };
    /** Same as `addRowGroupColumn` but provide a list of columns. */
    ColumnApi.prototype.addRowGroupColumns = function (colKeys) { this.columnModel.addRowGroupColumns(colKeys, 'api'); };
    /** Get row group columns. */
    ColumnApi.prototype.getRowGroupColumns = function () { return this.columnModel.getRowGroupColumns(); };
    /** Set the pivot columns. */
    ColumnApi.prototype.setPivotColumns = function (colKeys) { this.columnModel.setPivotColumns(colKeys, 'api'); };
    /** Remove a pivot column. */
    ColumnApi.prototype.removePivotColumn = function (colKey) { this.columnModel.removePivotColumn(colKey, 'api'); };
    /** Same as `removePivotColumn` but provide a list of columns. */
    ColumnApi.prototype.removePivotColumns = function (colKeys) { this.columnModel.removePivotColumns(colKeys, 'api'); };
    /** Add a pivot column. */
    ColumnApi.prototype.addPivotColumn = function (colKey) { this.columnModel.addPivotColumn(colKey, 'api'); };
    /** Same as `addPivotColumn` but provide a list of columns. */
    ColumnApi.prototype.addPivotColumns = function (colKeys) { this.columnModel.addPivotColumns(colKeys, 'api'); };
    /** Get the pivot columns. */
    ColumnApi.prototype.getPivotColumns = function () { return this.columnModel.getPivotColumns(); };
    /** Same as `getAllDisplayedColumnGroups` but just for the pinned left portion of the grid. */
    ColumnApi.prototype.getLeftDisplayedColumnGroups = function () { return this.columnModel.getDisplayedTreeLeft(); };
    /** Same as `getAllDisplayedColumnGroups` but just for the center portion of the grid. */
    ColumnApi.prototype.getCenterDisplayedColumnGroups = function () { return this.columnModel.getDisplayedTreeCentre(); };
    /** Same as `getAllDisplayedColumnGroups` but just for the pinned right portion of the grid. */
    ColumnApi.prototype.getRightDisplayedColumnGroups = function () { return this.columnModel.getDisplayedTreeRight(); };
    /** Returns all 'root' column headers. If you are not grouping columns, these return the columns. If you are grouping, these return the top level groups - you can navigate down through each one to get the other lower level headers and finally the columns at the bottom. */
    ColumnApi.prototype.getAllDisplayedColumnGroups = function () { return this.columnModel.getAllDisplayedTrees(); };
    /** Auto-sizes a column based on its contents. */
    ColumnApi.prototype.autoSizeColumn = function (key, skipHeader) { return this.columnModel.autoSizeColumn(key, skipHeader, 'api'); };
    /** Same as `autoSizeColumn`, but provide a list of column keys. */
    ColumnApi.prototype.autoSizeColumns = function (keys, skipHeader) {
        this.columnModel.autoSizeColumns({ columns: keys, skipHeader: skipHeader });
    };
    /** Calls `autoSizeColumns` on all displayed columns. */
    ColumnApi.prototype.autoSizeAllColumns = function (skipHeader) { this.columnModel.autoSizeAllColumns(skipHeader, 'api'); };
    /** @deprecated Use `setPivotResultColumns` instead. */
    ColumnApi.prototype.setSecondaryColumns = function (colDefs) {
        console.warn('AG Grid: since version 28.0.x setSecondaryColumns has been renamed, please use setPivotResultColumns instead');
        this.setPivotResultColumns(colDefs);
    };
    /** Set the pivot result columns. */
    ColumnApi.prototype.setPivotResultColumns = function (colDefs) { this.columnModel.setSecondaryColumns(colDefs, 'api'); };
    /** @deprecated Use `getPivotResultColumns` instead. */
    ColumnApi.prototype.getSecondaryColumns = function () {
        console.warn('AG Grid: since version 28.0.x getSecondaryColumns has been renamed, please use getPivotResultColumns instead');
        return this.getPivotResultColumns();
    };
    /** Returns the grid's pivot result columns. */
    ColumnApi.prototype.getPivotResultColumns = function () { return this.columnModel.getSecondaryColumns(); };
    /** @deprecated Use `getColumns` instead. */
    ColumnApi.prototype.getPrimaryColumns = function () {
        console.warn('AG Grid: since version 28.0.x getPrimaryColumns has been renamed, please use getColumns instead');
        return this.getColumns();
    };
    ColumnApi.prototype.cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid = function () {
        // some users were raising support issues with regards memory leaks. the problem was the customers applications
        // were keeping references to the API. trying to educate them all would be difficult, easier to just remove
        // all references in the API so at least the core grid can be garbage collected.
        //
        // wait about 100ms before clearing down the references, in case user has some cleanup to do,
        // and needs to deference the API first
        setTimeout(utils_1._.removeAllReferences.bind(window, this, 'Column API'), 100);
    };
    // below goes through deprecated items, prints message to user, then calls the new version of the same method
    // public getColumnDefs(): (ColDef | ColGroupDef)[] {
    //     this.setColumnGroupOpened(group, newValue);
    //     return null;
    // }
    /** @deprecated Use `getColumns` instead */
    ColumnApi.prototype.getAllColumns = function () {
        console.warn('AG Grid: since version 28.0.x getAllColumns has been renamed, please use getColumns instead');
        return this.getColumns();
    };
    /** @deprecated columnGroupOpened no longer exists, use setColumnGroupOpened */
    ColumnApi.prototype.columnGroupOpened = function (group, newValue) {
        console.error('AG Grid: columnGroupOpened no longer exists, use setColumnGroupOpened');
        this.setColumnGroupOpened(group, newValue);
    };
    /** @deprecated hideColumns is deprecated, use setColumnsVisible */
    ColumnApi.prototype.hideColumns = function (colIds, hide) {
        console.error('AG Grid: hideColumns is deprecated, use setColumnsVisible');
        this.columnModel.setColumnsVisible(colIds, !hide, 'api');
    };
    /** @deprecated hideColumn is deprecated, use setColumnVisible */
    ColumnApi.prototype.hideColumn = function (colId, hide) {
        console.error('AG Grid: hideColumn is deprecated, use setColumnVisible');
        this.columnModel.setColumnVisible(colId, !hide, 'api');
    };
    /** @deprecated setState is deprecated, use setColumnState */
    ColumnApi.prototype.setState = function (columnState) {
        console.error('AG Grid: setState is deprecated, use setColumnState');
        return this.setColumnState(columnState);
    };
    /** @deprecated getState is deprecated, use getColumnState */
    ColumnApi.prototype.getState = function () {
        console.error('AG Grid: getState is deprecated, use getColumnState');
        return this.getColumnState();
    };
    /** @deprecated resetState is deprecated, use resetColumnState */
    ColumnApi.prototype.resetState = function () {
        console.error('AG Grid: resetState is deprecated, use resetColumnState');
        this.resetColumnState();
    };
    /** @deprecated getAggregationColumns is deprecated, use getValueColumns */
    ColumnApi.prototype.getAggregationColumns = function () {
        console.error('AG Grid: getAggregationColumns is deprecated, use getValueColumns');
        return this.columnModel.getValueColumns();
    };
    /** @deprecated removeAggregationColumn is deprecated, use removeValueColumn */
    ColumnApi.prototype.removeAggregationColumn = function (colKey) {
        console.error('AG Grid: removeAggregationColumn is deprecated, use removeValueColumn');
        this.columnModel.removeValueColumn(colKey, 'api');
    };
    /** @deprecated removeAggregationColumns is deprecated, use removeValueColumns */
    ColumnApi.prototype.removeAggregationColumns = function (colKeys) {
        console.error('AG Grid: removeAggregationColumns is deprecated, use removeValueColumns');
        this.columnModel.removeValueColumns(colKeys, 'api');
    };
    /** @deprecated addAggregationColumn is deprecated, use addValueColumn */
    ColumnApi.prototype.addAggregationColumn = function (colKey) {
        console.error('AG Grid: addAggregationColumn is deprecated, use addValueColumn');
        this.columnModel.addValueColumn(colKey, 'api');
    };
    /** @deprecated addAggregationColumns is deprecated, use addValueColumns */
    ColumnApi.prototype.addAggregationColumns = function (colKeys) {
        console.error('AG Grid: addAggregationColumns is deprecated, use addValueColumns');
        this.columnModel.addValueColumns(colKeys, 'api');
    };
    /** @deprecated setColumnAggFunction is deprecated, use setColumnAggFunc */
    ColumnApi.prototype.setColumnAggFunction = function (column, aggFunc) {
        console.error('AG Grid: setColumnAggFunction is deprecated, use setColumnAggFunc');
        this.columnModel.setColumnAggFunc(column, aggFunc, 'api');
    };
    /** @deprecated getDisplayNameForCol is deprecated, use getDisplayNameForColumn */
    ColumnApi.prototype.getDisplayNameForCol = function (column) {
        console.error('AG Grid: getDisplayNameForCol is deprecated, use getDisplayNameForColumn');
        return this.getDisplayNameForColumn(column, null);
    };
    /** @deprecated setColumnState is deprecated, use applyColumnState. */
    ColumnApi.prototype.setColumnState = function (columnState) {
        console.error('AG Grid: setColumnState is deprecated, use applyColumnState');
        return this.columnModel.applyColumnState({ state: columnState, applyOrder: true }, 'api');
    };
    /** @deprecated getOriginalColumnGroup is deprecated, use getProvidedColumnGroup. */
    ColumnApi.prototype.getOriginalColumnGroup = function (name) {
        console.error('AG Grid: getOriginalColumnGroup is deprecated, use getProvidedColumnGroup');
        return this.columnModel.getProvidedColumnGroup(name);
    };
    __decorate([
        context_1.Autowired('columnModel')
    ], ColumnApi.prototype, "columnModel", void 0);
    __decorate([
        context_1.PreDestroy
    ], ColumnApi.prototype, "cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid", null);
    ColumnApi = __decorate([
        context_1.Bean('columnApi')
    ], ColumnApi);
    return ColumnApi;
}());
exports.ColumnApi = ColumnApi;
