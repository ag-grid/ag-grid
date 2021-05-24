/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
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
var ColumnApi = /** @class */ (function () {
    function ColumnApi() {
    }
    ColumnApi.prototype.sizeColumnsToFit = function (gridWidth) {
        // AG-3403 validate that gridWidth is provided because this method has the same name as
        // a method on the grid API that takes no arguments, and it's easy to confuse the two
        if (typeof gridWidth === "undefined") {
            console.error('AG Grid: missing parameter to columnApi.sizeColumnsToFit(gridWidth)');
        }
        this.columnController.sizeColumnsToFit(gridWidth, 'api');
    };
    ColumnApi.prototype.setColumnGroupOpened = function (group, newValue) { this.columnController.setColumnGroupOpened(group, newValue, 'api'); };
    ColumnApi.prototype.getColumnGroup = function (name, instanceId) { return this.columnController.getColumnGroup(name, instanceId); };
    ColumnApi.prototype.getOriginalColumnGroup = function (name) { return this.columnController.getOriginalColumnGroup(name); };
    ColumnApi.prototype.getDisplayNameForColumn = function (column, location) { return this.columnController.getDisplayNameForColumn(column, location) || ''; };
    ColumnApi.prototype.getDisplayNameForColumnGroup = function (columnGroup, location) { return this.columnController.getDisplayNameForColumnGroup(columnGroup, location) || ''; };
    ColumnApi.prototype.getColumn = function (key) { return this.columnController.getPrimaryColumn(key); };
    ColumnApi.prototype.applyColumnState = function (params) { return this.columnController.applyColumnState(params, 'api'); };
    ColumnApi.prototype.getColumnState = function () { return this.columnController.getColumnState(); };
    ColumnApi.prototype.resetColumnState = function () { this.columnController.resetColumnState('api'); };
    ColumnApi.prototype.getColumnGroupState = function () { return this.columnController.getColumnGroupState(); };
    ColumnApi.prototype.setColumnGroupState = function (stateItems) { this.columnController.setColumnGroupState(stateItems, 'api'); };
    ColumnApi.prototype.resetColumnGroupState = function () { this.columnController.resetColumnGroupState('api'); };
    ColumnApi.prototype.isPinning = function () { return this.columnController.isPinningLeft() || this.columnController.isPinningRight(); };
    ColumnApi.prototype.isPinningLeft = function () { return this.columnController.isPinningLeft(); };
    ColumnApi.prototype.isPinningRight = function () { return this.columnController.isPinningRight(); };
    ColumnApi.prototype.getDisplayedColAfter = function (col) { return this.columnController.getDisplayedColAfter(col); };
    ColumnApi.prototype.getDisplayedColBefore = function (col) { return this.columnController.getDisplayedColBefore(col); };
    ColumnApi.prototype.setColumnVisible = function (key, visible) { this.columnController.setColumnVisible(key, visible, 'api'); };
    ColumnApi.prototype.setColumnsVisible = function (keys, visible) { this.columnController.setColumnsVisible(keys, visible, 'api'); };
    ColumnApi.prototype.setColumnPinned = function (key, pinned) { this.columnController.setColumnPinned(key, pinned, 'api'); };
    ColumnApi.prototype.setColumnsPinned = function (keys, pinned) { this.columnController.setColumnsPinned(keys, pinned, 'api'); };
    ColumnApi.prototype.getAllColumns = function () { return this.columnController.getAllPrimaryColumns(); };
    ColumnApi.prototype.getAllGridColumns = function () { return this.columnController.getAllGridColumns(); };
    ColumnApi.prototype.getDisplayedLeftColumns = function () { return this.columnController.getDisplayedLeftColumns(); };
    ColumnApi.prototype.getDisplayedCenterColumns = function () { return this.columnController.getDisplayedCenterColumns(); };
    ColumnApi.prototype.getDisplayedRightColumns = function () { return this.columnController.getDisplayedRightColumns(); };
    ColumnApi.prototype.getAllDisplayedColumns = function () { return this.columnController.getAllDisplayedColumns(); };
    ColumnApi.prototype.getAllDisplayedVirtualColumns = function () { return this.columnController.getViewportColumns(); };
    ColumnApi.prototype.moveColumn = function (key, toIndex) {
        if (typeof key === 'number') {
            // moveColumn used to take indexes, so this is advising user who hasn't moved to new method name
            console.warn('AG Grid: you are using moveColumn(fromIndex, toIndex) - moveColumn takes a column key and a destination index, not two indexes, to move with indexes use moveColumnByIndex(from,to) instead');
            this.columnController.moveColumnByIndex(key, toIndex, 'api');
        }
        else {
            this.columnController.moveColumn(key, toIndex, 'api');
        }
    };
    ColumnApi.prototype.moveColumnByIndex = function (fromIndex, toIndex) { this.columnController.moveColumnByIndex(fromIndex, toIndex, 'api'); };
    ColumnApi.prototype.moveColumns = function (columnsToMoveKeys, toIndex) { this.columnController.moveColumns(columnsToMoveKeys, toIndex, 'api'); };
    ColumnApi.prototype.moveRowGroupColumn = function (fromIndex, toIndex) { this.columnController.moveRowGroupColumn(fromIndex, toIndex); };
    ColumnApi.prototype.setColumnAggFunc = function (key, aggFunc) { this.columnController.setColumnAggFunc(key, aggFunc); };
    ColumnApi.prototype.setColumnWidth = function (key, newWidth, finished) {
        if (finished === void 0) { finished = true; }
        this.columnController.setColumnWidths([{ key: key, newWidth: newWidth }], false, finished);
    };
    ColumnApi.prototype.setColumnWidths = function (columnWidths, finished) {
        if (finished === void 0) { finished = true; }
        this.columnController.setColumnWidths(columnWidths, false, finished);
    };
    ColumnApi.prototype.setPivotMode = function (pivotMode) { this.columnController.setPivotMode(pivotMode); };
    ColumnApi.prototype.isPivotMode = function () { return this.columnController.isPivotMode(); };
    ColumnApi.prototype.getSecondaryPivotColumn = function (pivotKeys, valueColKey) { return this.columnController.getSecondaryPivotColumn(pivotKeys, valueColKey); };
    ColumnApi.prototype.setValueColumns = function (colKeys) { this.columnController.setValueColumns(colKeys, 'api'); };
    ColumnApi.prototype.getValueColumns = function () { return this.columnController.getValueColumns(); };
    ColumnApi.prototype.removeValueColumn = function (colKey) { this.columnController.removeValueColumn(colKey, 'api'); };
    ColumnApi.prototype.removeValueColumns = function (colKeys) { this.columnController.removeValueColumns(colKeys, 'api'); };
    ColumnApi.prototype.addValueColumn = function (colKey) { this.columnController.addValueColumn(colKey, 'api'); };
    ColumnApi.prototype.addValueColumns = function (colKeys) { this.columnController.addValueColumns(colKeys, 'api'); };
    ColumnApi.prototype.setRowGroupColumns = function (colKeys) { this.columnController.setRowGroupColumns(colKeys, 'api'); };
    ColumnApi.prototype.removeRowGroupColumn = function (colKey) { this.columnController.removeRowGroupColumn(colKey, 'api'); };
    ColumnApi.prototype.removeRowGroupColumns = function (colKeys) { this.columnController.removeRowGroupColumns(colKeys, 'api'); };
    ColumnApi.prototype.addRowGroupColumn = function (colKey) { this.columnController.addRowGroupColumn(colKey, 'api'); };
    ColumnApi.prototype.addRowGroupColumns = function (colKeys) { this.columnController.addRowGroupColumns(colKeys, 'api'); };
    ColumnApi.prototype.getRowGroupColumns = function () { return this.columnController.getRowGroupColumns(); };
    ColumnApi.prototype.setPivotColumns = function (colKeys) { this.columnController.setPivotColumns(colKeys, 'api'); };
    ColumnApi.prototype.removePivotColumn = function (colKey) { this.columnController.removePivotColumn(colKey, 'api'); };
    ColumnApi.prototype.removePivotColumns = function (colKeys) { this.columnController.removePivotColumns(colKeys, 'api'); };
    ColumnApi.prototype.addPivotColumn = function (colKey) { this.columnController.addPivotColumn(colKey, 'api'); };
    ColumnApi.prototype.addPivotColumns = function (colKeys) { this.columnController.addPivotColumns(colKeys, 'api'); };
    ColumnApi.prototype.getPivotColumns = function () { return this.columnController.getPivotColumns(); };
    ColumnApi.prototype.getLeftDisplayedColumnGroups = function () { return this.columnController.getDisplayedTreeLeft(); };
    ColumnApi.prototype.getCenterDisplayedColumnGroups = function () { return this.columnController.getDisplayedTreeCentre(); };
    ColumnApi.prototype.getRightDisplayedColumnGroups = function () { return this.columnController.getDisplayedTreeRight(); };
    ColumnApi.prototype.getAllDisplayedColumnGroups = function () { return this.columnController.getAllDisplayedTrees(); };
    ColumnApi.prototype.autoSizeColumn = function (key, skipHeader) { return this.columnController.autoSizeColumn(key, skipHeader, 'api'); };
    ColumnApi.prototype.autoSizeColumns = function (keys, skipHeader) { return this.columnController.autoSizeColumns(keys, skipHeader, 'api'); };
    ColumnApi.prototype.autoSizeAllColumns = function (skipHeader) { this.columnController.autoSizeAllColumns(skipHeader, 'api'); };
    ColumnApi.prototype.setSecondaryColumns = function (colDefs) { this.columnController.setSecondaryColumns(colDefs, 'api'); };
    ColumnApi.prototype.getSecondaryColumns = function () { return this.columnController.getSecondaryColumns(); };
    ColumnApi.prototype.getPrimaryColumns = function () { return this.columnController.getAllPrimaryColumns(); };
    ColumnApi.prototype.cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid = function () {
        // some users were raising support issues with regards memory leaks. the problem was the customers applications
        // were keeping references to the API. trying to educate them all would be difficult, easier to just remove
        // all references in teh API so at least the core grid can be garbage collected.
        //
        // wait about 100ms before clearing down the references, in case user has some cleanup to do,
        // and needs to deference the API first
        setTimeout(_.removeAllReferences.bind(window, this, 'Column API'), 100);
    };
    // below goes through deprecated items, prints message to user, then calls the new version of the same method
    // public getColumnDefs(): (ColDef | ColGroupDef)[] {
    //     this.setColumnGroupOpened(group, newValue);
    //     return null;
    // }
    ColumnApi.prototype.columnGroupOpened = function (group, newValue) {
        console.error('AG Grid: columnGroupOpened no longer exists, use setColumnGroupOpened');
        this.setColumnGroupOpened(group, newValue);
    };
    ColumnApi.prototype.hideColumns = function (colIds, hide) {
        console.error('AG Grid: hideColumns is deprecated, use setColumnsVisible');
        this.columnController.setColumnsVisible(colIds, !hide, 'api');
    };
    ColumnApi.prototype.hideColumn = function (colId, hide) {
        console.error('AG Grid: hideColumn is deprecated, use setColumnVisible');
        this.columnController.setColumnVisible(colId, !hide, 'api');
    };
    ColumnApi.prototype.setState = function (columnState) {
        console.error('AG Grid: setState is deprecated, use setColumnState');
        return this.setColumnState(columnState);
    };
    ColumnApi.prototype.getState = function () {
        console.error('AG Grid: getState is deprecated, use getColumnState');
        return this.getColumnState();
    };
    ColumnApi.prototype.resetState = function () {
        console.error('AG Grid: resetState is deprecated, use resetColumnState');
        this.resetColumnState();
    };
    ColumnApi.prototype.getAggregationColumns = function () {
        console.error('AG Grid: getAggregationColumns is deprecated, use getValueColumns');
        return this.columnController.getValueColumns();
    };
    ColumnApi.prototype.removeAggregationColumn = function (colKey) {
        console.error('AG Grid: removeAggregationColumn is deprecated, use removeValueColumn');
        this.columnController.removeValueColumn(colKey, 'api');
    };
    ColumnApi.prototype.removeAggregationColumns = function (colKeys) {
        console.error('AG Grid: removeAggregationColumns is deprecated, use removeValueColumns');
        this.columnController.removeValueColumns(colKeys, 'api');
    };
    ColumnApi.prototype.addAggregationColumn = function (colKey) {
        console.error('AG Grid: addAggregationColumn is deprecated, use addValueColumn');
        this.columnController.addValueColumn(colKey, 'api');
    };
    ColumnApi.prototype.addAggregationColumns = function (colKeys) {
        console.error('AG Grid: addAggregationColumns is deprecated, use addValueColumns');
        this.columnController.addValueColumns(colKeys, 'api');
    };
    ColumnApi.prototype.setColumnAggFunction = function (column, aggFunc) {
        console.error('AG Grid: setColumnAggFunction is deprecated, use setColumnAggFunc');
        this.columnController.setColumnAggFunc(column, aggFunc, 'api');
    };
    ColumnApi.prototype.getDisplayNameForCol = function (column) {
        console.error('AG Grid: getDisplayNameForCol is deprecated, use getDisplayNameForColumn');
        return this.getDisplayNameForColumn(column, null);
    };
    ColumnApi.prototype.setColumnState = function (columnState) {
        return this.columnController.applyColumnState({ state: columnState, applyOrder: true }, 'api');
    };
    __decorate([
        Autowired('columnController')
    ], ColumnApi.prototype, "columnController", void 0);
    __decorate([
        PreDestroy
    ], ColumnApi.prototype, "cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid", null);
    ColumnApi = __decorate([
        Bean('columnApi')
    ], ColumnApi);
    return ColumnApi;
}());
export { ColumnApi };
