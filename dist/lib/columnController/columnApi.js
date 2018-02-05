/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v16.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var columnController_1 = require("./columnController");
var context_1 = require("../context/context");
var ColumnApi = (function () {
    function ColumnApi() {
    }
    ColumnApi.prototype.sizeColumnsToFit = function (gridWidth) { this.columnController.sizeColumnsToFit(gridWidth); };
    ColumnApi.prototype.setColumnGroupOpened = function (group, newValue) { this.columnController.setColumnGroupOpened(group, newValue); };
    ColumnApi.prototype.getColumnGroup = function (name, instanceId) { return this.columnController.getColumnGroup(name, instanceId); };
    ColumnApi.prototype.getOriginalColumnGroup = function (name) { return this.columnController.getOriginalColumnGroup(name); };
    ColumnApi.prototype.getDisplayNameForColumn = function (column, location) { return this.columnController.getDisplayNameForColumn(column, location); };
    ColumnApi.prototype.getDisplayNameForColumnGroup = function (columnGroup, location) { return this.columnController.getDisplayNameForColumnGroup(columnGroup, location); };
    ColumnApi.prototype.getColumn = function (key) { return this.columnController.getPrimaryColumn(key); };
    ColumnApi.prototype.setColumnState = function (columnState) { return this.columnController.setColumnState(columnState); };
    ColumnApi.prototype.getColumnState = function () { return this.columnController.getColumnState(); };
    ColumnApi.prototype.resetColumnState = function () { this.columnController.resetColumnState(); };
    ColumnApi.prototype.getColumnGroupState = function () { return this.columnController.getColumnGroupState(); };
    ColumnApi.prototype.setColumnGroupState = function (stateItems) { this.columnController.setColumnGroupState(stateItems); };
    ColumnApi.prototype.resetColumnGroupState = function () { this.columnController.resetColumnGroupState(); };
    ColumnApi.prototype.isPinning = function () { return this.columnController.isPinningLeft() || this.columnController.isPinningRight(); };
    ColumnApi.prototype.isPinningLeft = function () { return this.columnController.isPinningLeft(); };
    ColumnApi.prototype.isPinningRight = function () { return this.columnController.isPinningRight(); };
    ColumnApi.prototype.getDisplayedColAfter = function (col) { return this.columnController.getDisplayedColAfter(col); };
    ColumnApi.prototype.getDisplayedColBefore = function (col) { return this.columnController.getDisplayedColBefore(col); };
    ColumnApi.prototype.setColumnVisible = function (key, visible) { this.columnController.setColumnVisible(key, visible); };
    ColumnApi.prototype.setColumnsVisible = function (keys, visible) { this.columnController.setColumnsVisible(keys, visible); };
    ColumnApi.prototype.setColumnPinned = function (key, pinned) { this.columnController.setColumnPinned(key, pinned); };
    ColumnApi.prototype.setColumnsPinned = function (keys, pinned) { this.columnController.setColumnsPinned(keys, pinned); };
    ColumnApi.prototype.getAllColumns = function () { return this.columnController.getAllPrimaryColumns(); };
    ColumnApi.prototype.getAllGridColumns = function () { return this.columnController.getAllGridColumns(); };
    ColumnApi.prototype.getDisplayedLeftColumns = function () { return this.columnController.getDisplayedLeftColumns(); };
    ColumnApi.prototype.getDisplayedCenterColumns = function () { return this.columnController.getDisplayedCenterColumns(); };
    ColumnApi.prototype.getDisplayedRightColumns = function () { return this.columnController.getDisplayedRightColumns(); };
    ColumnApi.prototype.getAllDisplayedColumns = function () { return this.columnController.getAllDisplayedColumns(); };
    ColumnApi.prototype.getAllDisplayedVirtualColumns = function () { return this.columnController.getAllDisplayedVirtualColumns(); };
    ColumnApi.prototype.moveColumn = function (key, toIndex) {
        if (typeof key === 'number') {
            // moveColumn used to take indexes, so this is advising user who hasn't moved to new method name
            console.log('ag-Grid: you are using moveColumn(fromIndex, toIndex) - moveColumn takes a column key and a destination index, not two indexes, to move with indexes use moveColumnByIndex(from,to) instead');
            this.columnController.moveColumnByIndex(key, toIndex);
        }
        else {
            this.columnController.moveColumn(key, toIndex);
        }
    };
    ColumnApi.prototype.moveColumnByIndex = function (fromIndex, toIndex) { this.columnController.moveColumnByIndex(fromIndex, toIndex); };
    ColumnApi.prototype.moveColumns = function (columnsToMoveKeys, toIndex) { this.columnController.moveColumns(columnsToMoveKeys, toIndex); };
    ColumnApi.prototype.moveRowGroupColumn = function (fromIndex, toIndex) { this.columnController.moveRowGroupColumn(fromIndex, toIndex); };
    ColumnApi.prototype.setColumnAggFunc = function (column, aggFunc) { this.columnController.setColumnAggFunc(column, aggFunc); };
    ColumnApi.prototype.setColumnWidth = function (key, newWidth, finished) {
        if (finished === void 0) { finished = true; }
        this.columnController.setColumnWidth(key, newWidth, finished);
    };
    ColumnApi.prototype.setPivotMode = function (pivotMode, source) {
        if (source === void 0) { source = "api"; }
        this.columnController.setPivotMode(pivotMode);
    };
    ColumnApi.prototype.isPivotMode = function () { return this.columnController.isPivotMode(); };
    ColumnApi.prototype.getSecondaryPivotColumn = function (pivotKeys, valueColKey) { return this.columnController.getSecondaryPivotColumn(pivotKeys, valueColKey); };
    ColumnApi.prototype.setValueColumns = function (colKeys) { this.columnController.setValueColumns(colKeys); };
    ColumnApi.prototype.getValueColumns = function () { return this.columnController.getValueColumns(); };
    ColumnApi.prototype.removeValueColumn = function (colKey) { this.columnController.removeValueColumn(colKey); };
    ColumnApi.prototype.removeValueColumns = function (colKeys) { this.columnController.removeValueColumns(colKeys); };
    ColumnApi.prototype.addValueColumn = function (colKey) { this.columnController.addValueColumn(colKey); };
    ColumnApi.prototype.addValueColumns = function (colKeys) { this.columnController.addValueColumns(colKeys); };
    ColumnApi.prototype.setRowGroupColumns = function (colKeys) { this.columnController.setRowGroupColumns(colKeys); };
    ColumnApi.prototype.removeRowGroupColumn = function (colKey) { this.columnController.removeRowGroupColumn(colKey); };
    ColumnApi.prototype.removeRowGroupColumns = function (colKeys) { this.columnController.removeRowGroupColumns(colKeys); };
    ColumnApi.prototype.addRowGroupColumn = function (colKey) { this.columnController.addRowGroupColumn(colKey); };
    ColumnApi.prototype.addRowGroupColumns = function (colKeys) { this.columnController.addRowGroupColumns(colKeys); };
    ColumnApi.prototype.getRowGroupColumns = function () { return this.columnController.getRowGroupColumns(); };
    ColumnApi.prototype.setPivotColumns = function (colKeys) { this.columnController.setPivotColumns(colKeys); };
    ColumnApi.prototype.removePivotColumn = function (colKey) { this.columnController.removePivotColumn(colKey); };
    ColumnApi.prototype.removePivotColumns = function (colKeys) { this.columnController.removePivotColumns(colKeys); };
    ColumnApi.prototype.addPivotColumn = function (colKey) { this.columnController.addPivotColumn(colKey); };
    ColumnApi.prototype.addPivotColumns = function (colKeys) { this.columnController.addPivotColumns(colKeys); };
    ColumnApi.prototype.getPivotColumns = function () { return this.columnController.getPivotColumns(); };
    ColumnApi.prototype.getLeftDisplayedColumnGroups = function () { return this.columnController.getLeftDisplayedColumnGroups(); };
    ColumnApi.prototype.getCenterDisplayedColumnGroups = function () { return this.columnController.getCenterDisplayedColumnGroups(); };
    ColumnApi.prototype.getRightDisplayedColumnGroups = function () { return this.columnController.getRightDisplayedColumnGroups(); };
    ColumnApi.prototype.getAllDisplayedColumnGroups = function () { return this.columnController.getAllDisplayedColumnGroups(); };
    ColumnApi.prototype.autoSizeColumn = function (key) { return this.columnController.autoSizeColumn(key); };
    ColumnApi.prototype.autoSizeColumns = function (keys) { return this.columnController.autoSizeColumns(keys); };
    ColumnApi.prototype.autoSizeAllColumns = function () { this.columnController.autoSizeAllColumns(); };
    ColumnApi.prototype.setSecondaryColumns = function (colDefs) { this.columnController.setSecondaryColumns(colDefs); };
    // below goes through deprecated items, prints message to user, then calls the new version of the same method
    ColumnApi.prototype.columnGroupOpened = function (group, newValue) {
        console.error('ag-Grid: columnGroupOpened no longer exists, use setColumnGroupOpened');
        this.setColumnGroupOpened(group, newValue);
    };
    ColumnApi.prototype.hideColumns = function (colIds, hide) {
        console.error('ag-Grid: hideColumns is deprecated, use setColumnsVisible');
        this.columnController.setColumnsVisible(colIds, !hide);
    };
    ColumnApi.prototype.hideColumn = function (colId, hide) {
        console.error('ag-Grid: hideColumn is deprecated, use setColumnVisible');
        this.columnController.setColumnVisible(colId, !hide);
    };
    ColumnApi.prototype.setState = function (columnState) {
        console.error('ag-Grid: setState is deprecated, use setColumnState');
        return this.setColumnState(columnState);
    };
    ColumnApi.prototype.getState = function () {
        console.error('ag-Grid: getState is deprecated, use getColumnState');
        return this.getColumnState();
    };
    ColumnApi.prototype.resetState = function () {
        console.error('ag-Grid: resetState is deprecated, use resetColumnState');
        this.resetColumnState();
    };
    ColumnApi.prototype.getAggregationColumns = function () {
        console.error('ag-Grid: getAggregationColumns is deprecated, use getValueColumns');
        return this.columnController.getValueColumns();
    };
    ColumnApi.prototype.removeAggregationColumn = function (colKey) {
        console.error('ag-Grid: removeAggregationColumn is deprecated, use removeValueColumn');
        this.columnController.removeValueColumn(colKey);
    };
    ColumnApi.prototype.removeAggregationColumns = function (colKeys) {
        console.error('ag-Grid: removeAggregationColumns is deprecated, use removeValueColumns');
        this.columnController.removeValueColumns(colKeys);
    };
    ColumnApi.prototype.addAggregationColumn = function (colKey) {
        console.error('ag-Grid: addAggregationColumn is deprecated, use addValueColumn');
        this.columnController.addValueColumn(colKey);
    };
    ColumnApi.prototype.addAggregationColumns = function (colKeys) {
        console.error('ag-Grid: addAggregationColumns is deprecated, use addValueColumns');
        this.columnController.addValueColumns(colKeys);
    };
    ColumnApi.prototype.setColumnAggFunction = function (column, aggFunc) {
        console.error('ag-Grid: setColumnAggFunction is deprecated, use setColumnAggFunc');
        this.columnController.setColumnAggFunc(column, aggFunc);
    };
    ColumnApi.prototype.getDisplayNameForCol = function (column) {
        console.error('ag-Grid: getDisplayNameForCol is deprecated, use getDisplayNameForColumn');
        return this.getDisplayNameForColumn(column, null);
    };
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], ColumnApi.prototype, "columnController", void 0);
    ColumnApi = __decorate([
        context_1.Bean('columnApi')
    ], ColumnApi);
    return ColumnApi;
}());
exports.ColumnApi = ColumnApi;
