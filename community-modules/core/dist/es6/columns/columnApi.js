/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.0.0
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
        this.columnModel.sizeColumnsToFit(gridWidth, 'api');
    };
    ColumnApi.prototype.setColumnGroupOpened = function (group, newValue) { this.columnModel.setColumnGroupOpened(group, newValue, 'api'); };
    ColumnApi.prototype.getColumnGroup = function (name, instanceId) { return this.columnModel.getColumnGroup(name, instanceId); };
    ColumnApi.prototype.getOriginalColumnGroup = function (name) { return this.columnModel.getOriginalColumnGroup(name); };
    ColumnApi.prototype.getDisplayNameForColumn = function (column, location) { return this.columnModel.getDisplayNameForColumn(column, location) || ''; };
    ColumnApi.prototype.getDisplayNameForColumnGroup = function (columnGroup, location) { return this.columnModel.getDisplayNameForColumnGroup(columnGroup, location) || ''; };
    ColumnApi.prototype.getColumn = function (key) { return this.columnModel.getPrimaryColumn(key); };
    ColumnApi.prototype.applyColumnState = function (params) { return this.columnModel.applyColumnState(params, 'api'); };
    ColumnApi.prototype.getColumnState = function () { return this.columnModel.getColumnState(); };
    ColumnApi.prototype.resetColumnState = function () { this.columnModel.resetColumnState('api'); };
    ColumnApi.prototype.getColumnGroupState = function () { return this.columnModel.getColumnGroupState(); };
    ColumnApi.prototype.setColumnGroupState = function (stateItems) { this.columnModel.setColumnGroupState(stateItems, 'api'); };
    ColumnApi.prototype.resetColumnGroupState = function () { this.columnModel.resetColumnGroupState('api'); };
    ColumnApi.prototype.isPinning = function () { return this.columnModel.isPinningLeft() || this.columnModel.isPinningRight(); };
    ColumnApi.prototype.isPinningLeft = function () { return this.columnModel.isPinningLeft(); };
    ColumnApi.prototype.isPinningRight = function () { return this.columnModel.isPinningRight(); };
    ColumnApi.prototype.getDisplayedColAfter = function (col) { return this.columnModel.getDisplayedColAfter(col); };
    ColumnApi.prototype.getDisplayedColBefore = function (col) { return this.columnModel.getDisplayedColBefore(col); };
    ColumnApi.prototype.setColumnVisible = function (key, visible) { this.columnModel.setColumnVisible(key, visible, 'api'); };
    ColumnApi.prototype.setColumnsVisible = function (keys, visible) { this.columnModel.setColumnsVisible(keys, visible, 'api'); };
    ColumnApi.prototype.setColumnPinned = function (key, pinned) { this.columnModel.setColumnPinned(key, pinned, 'api'); };
    ColumnApi.prototype.setColumnsPinned = function (keys, pinned) { this.columnModel.setColumnsPinned(keys, pinned, 'api'); };
    ColumnApi.prototype.getAllColumns = function () { return this.columnModel.getAllPrimaryColumns(); };
    ColumnApi.prototype.getAllGridColumns = function () { return this.columnModel.getAllGridColumns(); };
    ColumnApi.prototype.getDisplayedLeftColumns = function () { return this.columnModel.getDisplayedLeftColumns(); };
    ColumnApi.prototype.getDisplayedCenterColumns = function () { return this.columnModel.getDisplayedCenterColumns(); };
    ColumnApi.prototype.getDisplayedRightColumns = function () { return this.columnModel.getDisplayedRightColumns(); };
    ColumnApi.prototype.getAllDisplayedColumns = function () { return this.columnModel.getAllDisplayedColumns(); };
    ColumnApi.prototype.getAllDisplayedVirtualColumns = function () { return this.columnModel.getViewportColumns(); };
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
    ColumnApi.prototype.moveColumnByIndex = function (fromIndex, toIndex) { this.columnModel.moveColumnByIndex(fromIndex, toIndex, 'api'); };
    ColumnApi.prototype.moveColumns = function (columnsToMoveKeys, toIndex) { this.columnModel.moveColumns(columnsToMoveKeys, toIndex, 'api'); };
    ColumnApi.prototype.moveRowGroupColumn = function (fromIndex, toIndex) { this.columnModel.moveRowGroupColumn(fromIndex, toIndex); };
    ColumnApi.prototype.setColumnAggFunc = function (key, aggFunc) { this.columnModel.setColumnAggFunc(key, aggFunc); };
    ColumnApi.prototype.setColumnWidth = function (key, newWidth, finished, source) {
        if (finished === void 0) { finished = true; }
        this.columnModel.setColumnWidths([{ key: key, newWidth: newWidth }], false, finished, source);
    };
    ColumnApi.prototype.setColumnWidths = function (columnWidths, finished, source) {
        if (finished === void 0) { finished = true; }
        this.columnModel.setColumnWidths(columnWidths, false, finished, source);
    };
    ColumnApi.prototype.setPivotMode = function (pivotMode) { this.columnModel.setPivotMode(pivotMode); };
    ColumnApi.prototype.isPivotMode = function () { return this.columnModel.isPivotMode(); };
    ColumnApi.prototype.getSecondaryPivotColumn = function (pivotKeys, valueColKey) { return this.columnModel.getSecondaryPivotColumn(pivotKeys, valueColKey); };
    ColumnApi.prototype.setValueColumns = function (colKeys) { this.columnModel.setValueColumns(colKeys, 'api'); };
    ColumnApi.prototype.getValueColumns = function () { return this.columnModel.getValueColumns(); };
    ColumnApi.prototype.removeValueColumn = function (colKey) { this.columnModel.removeValueColumn(colKey, 'api'); };
    ColumnApi.prototype.removeValueColumns = function (colKeys) { this.columnModel.removeValueColumns(colKeys, 'api'); };
    ColumnApi.prototype.addValueColumn = function (colKey) { this.columnModel.addValueColumn(colKey, 'api'); };
    ColumnApi.prototype.addValueColumns = function (colKeys) { this.columnModel.addValueColumns(colKeys, 'api'); };
    ColumnApi.prototype.setRowGroupColumns = function (colKeys) { this.columnModel.setRowGroupColumns(colKeys, 'api'); };
    ColumnApi.prototype.removeRowGroupColumn = function (colKey) { this.columnModel.removeRowGroupColumn(colKey, 'api'); };
    ColumnApi.prototype.removeRowGroupColumns = function (colKeys) { this.columnModel.removeRowGroupColumns(colKeys, 'api'); };
    ColumnApi.prototype.addRowGroupColumn = function (colKey) { this.columnModel.addRowGroupColumn(colKey, 'api'); };
    ColumnApi.prototype.addRowGroupColumns = function (colKeys) { this.columnModel.addRowGroupColumns(colKeys, 'api'); };
    ColumnApi.prototype.getRowGroupColumns = function () { return this.columnModel.getRowGroupColumns(); };
    ColumnApi.prototype.setPivotColumns = function (colKeys) { this.columnModel.setPivotColumns(colKeys, 'api'); };
    ColumnApi.prototype.removePivotColumn = function (colKey) { this.columnModel.removePivotColumn(colKey, 'api'); };
    ColumnApi.prototype.removePivotColumns = function (colKeys) { this.columnModel.removePivotColumns(colKeys, 'api'); };
    ColumnApi.prototype.addPivotColumn = function (colKey) { this.columnModel.addPivotColumn(colKey, 'api'); };
    ColumnApi.prototype.addPivotColumns = function (colKeys) { this.columnModel.addPivotColumns(colKeys, 'api'); };
    ColumnApi.prototype.getPivotColumns = function () { return this.columnModel.getPivotColumns(); };
    ColumnApi.prototype.getLeftDisplayedColumnGroups = function () { return this.columnModel.getDisplayedTreeLeft(); };
    ColumnApi.prototype.getCenterDisplayedColumnGroups = function () { return this.columnModel.getDisplayedTreeCentre(); };
    ColumnApi.prototype.getRightDisplayedColumnGroups = function () { return this.columnModel.getDisplayedTreeRight(); };
    ColumnApi.prototype.getAllDisplayedColumnGroups = function () { return this.columnModel.getAllDisplayedTrees(); };
    ColumnApi.prototype.autoSizeColumn = function (key, skipHeader) { return this.columnModel.autoSizeColumn(key, skipHeader, 'api'); };
    ColumnApi.prototype.autoSizeColumns = function (keys, skipHeader) { return this.columnModel.autoSizeColumns(keys, skipHeader, 'api'); };
    ColumnApi.prototype.autoSizeAllColumns = function (skipHeader) { this.columnModel.autoSizeAllColumns(skipHeader, 'api'); };
    ColumnApi.prototype.setSecondaryColumns = function (colDefs) { this.columnModel.setSecondaryColumns(colDefs, 'api'); };
    ColumnApi.prototype.getSecondaryColumns = function () { return this.columnModel.getSecondaryColumns(); };
    ColumnApi.prototype.getPrimaryColumns = function () { return this.columnModel.getAllPrimaryColumns(); };
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
        this.columnModel.setColumnsVisible(colIds, !hide, 'api');
    };
    ColumnApi.prototype.hideColumn = function (colId, hide) {
        console.error('AG Grid: hideColumn is deprecated, use setColumnVisible');
        this.columnModel.setColumnVisible(colId, !hide, 'api');
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
        return this.columnModel.getValueColumns();
    };
    ColumnApi.prototype.removeAggregationColumn = function (colKey) {
        console.error('AG Grid: removeAggregationColumn is deprecated, use removeValueColumn');
        this.columnModel.removeValueColumn(colKey, 'api');
    };
    ColumnApi.prototype.removeAggregationColumns = function (colKeys) {
        console.error('AG Grid: removeAggregationColumns is deprecated, use removeValueColumns');
        this.columnModel.removeValueColumns(colKeys, 'api');
    };
    ColumnApi.prototype.addAggregationColumn = function (colKey) {
        console.error('AG Grid: addAggregationColumn is deprecated, use addValueColumn');
        this.columnModel.addValueColumn(colKey, 'api');
    };
    ColumnApi.prototype.addAggregationColumns = function (colKeys) {
        console.error('AG Grid: addAggregationColumns is deprecated, use addValueColumns');
        this.columnModel.addValueColumns(colKeys, 'api');
    };
    ColumnApi.prototype.setColumnAggFunction = function (column, aggFunc) {
        console.error('AG Grid: setColumnAggFunction is deprecated, use setColumnAggFunc');
        this.columnModel.setColumnAggFunc(column, aggFunc, 'api');
    };
    ColumnApi.prototype.getDisplayNameForCol = function (column) {
        console.error('AG Grid: getDisplayNameForCol is deprecated, use getDisplayNameForColumn');
        return this.getDisplayNameForColumn(column, null);
    };
    ColumnApi.prototype.setColumnState = function (columnState) {
        return this.columnModel.applyColumnState({ state: columnState, applyOrder: true }, 'api');
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
    return ColumnApi;
}());
export { ColumnApi };
