/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v17.0.0
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
    ColumnApi.prototype.sizeColumnsToFit = function (gridWidth, source) { this.columnController.sizeColumnsToFit(gridWidth, source); };
    ColumnApi.prototype.setColumnGroupOpened = function (group, newValue, source) { this.columnController.setColumnGroupOpened(group, newValue, source); };
    ColumnApi.prototype.getColumnGroup = function (name, instanceId) { return this.columnController.getColumnGroup(name, instanceId); };
    ColumnApi.prototype.getOriginalColumnGroup = function (name) { return this.columnController.getOriginalColumnGroup(name); };
    ColumnApi.prototype.getDisplayNameForColumn = function (column, location) { return this.columnController.getDisplayNameForColumn(column, location); };
    ColumnApi.prototype.getDisplayNameForColumnGroup = function (columnGroup, location) { return this.columnController.getDisplayNameForColumnGroup(columnGroup, location); };
    ColumnApi.prototype.getColumn = function (key) { return this.columnController.getPrimaryColumn(key); };
    ColumnApi.prototype.setColumnState = function (columnState, source) { return this.columnController.setColumnState(columnState, source); };
    ColumnApi.prototype.getColumnState = function () { return this.columnController.getColumnState(); };
    ColumnApi.prototype.resetColumnState = function (source) { this.columnController.resetColumnState(source); };
    ColumnApi.prototype.getColumnGroupState = function () { return this.columnController.getColumnGroupState(); };
    ColumnApi.prototype.setColumnGroupState = function (stateItems, source) { this.columnController.setColumnGroupState(stateItems, source); };
    ColumnApi.prototype.resetColumnGroupState = function (source) { this.columnController.resetColumnGroupState(source); };
    ColumnApi.prototype.isPinning = function () { return this.columnController.isPinningLeft() || this.columnController.isPinningRight(); };
    ColumnApi.prototype.isPinningLeft = function () { return this.columnController.isPinningLeft(); };
    ColumnApi.prototype.isPinningRight = function () { return this.columnController.isPinningRight(); };
    ColumnApi.prototype.getDisplayedColAfter = function (col) { return this.columnController.getDisplayedColAfter(col); };
    ColumnApi.prototype.getDisplayedColBefore = function (col) { return this.columnController.getDisplayedColBefore(col); };
    ColumnApi.prototype.setColumnVisible = function (key, visible, source) { this.columnController.setColumnVisible(key, visible, source); };
    ColumnApi.prototype.setColumnsVisible = function (keys, visible, source) { this.columnController.setColumnsVisible(keys, visible, source); };
    ColumnApi.prototype.setColumnPinned = function (key, pinned, source) { this.columnController.setColumnPinned(key, pinned, source); };
    ColumnApi.prototype.setColumnsPinned = function (keys, pinned, source) { this.columnController.setColumnsPinned(keys, pinned, source); };
    ColumnApi.prototype.getAllColumns = function () { return this.columnController.getAllPrimaryColumns(); };
    ColumnApi.prototype.getAllGridColumns = function () { return this.columnController.getAllGridColumns(); };
    ColumnApi.prototype.getDisplayedLeftColumns = function () { return this.columnController.getDisplayedLeftColumns(); };
    ColumnApi.prototype.getDisplayedCenterColumns = function () { return this.columnController.getDisplayedCenterColumns(); };
    ColumnApi.prototype.getDisplayedRightColumns = function () { return this.columnController.getDisplayedRightColumns(); };
    ColumnApi.prototype.getAllDisplayedColumns = function () { return this.columnController.getAllDisplayedColumns(); };
    ColumnApi.prototype.getAllDisplayedVirtualColumns = function () { return this.columnController.getAllDisplayedVirtualColumns(); };
    ColumnApi.prototype.moveColumn = function (key, toIndex, source) {
        if (typeof key === 'number') {
            // moveColumn used to take indexes, so this is advising user who hasn't moved to new method name
            console.log('ag-Grid: you are using moveColumn(fromIndex, toIndex) - moveColumn takes a column key and a destination index, not two indexes, to move with indexes use moveColumnByIndex(from,to) instead');
            this.columnController.moveColumnByIndex(key, toIndex, source);
        }
        else {
            this.columnController.moveColumn(key, toIndex, source);
        }
    };
    ColumnApi.prototype.moveColumnByIndex = function (fromIndex, toIndex, source) { this.columnController.moveColumnByIndex(fromIndex, toIndex, source); };
    ColumnApi.prototype.moveColumns = function (columnsToMoveKeys, toIndex, source) { this.columnController.moveColumns(columnsToMoveKeys, toIndex, source); };
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
    ColumnApi.prototype.setValueColumns = function (colKeys, source) { this.columnController.setValueColumns(colKeys, source); };
    ColumnApi.prototype.getValueColumns = function () { return this.columnController.getValueColumns(); };
    ColumnApi.prototype.removeValueColumn = function (colKey, source) { this.columnController.removeValueColumn(colKey, source); };
    ColumnApi.prototype.removeValueColumns = function (colKeys, source) { this.columnController.removeValueColumns(colKeys, source); };
    ColumnApi.prototype.addValueColumn = function (colKey, source) { this.columnController.addValueColumn(colKey, source); };
    ColumnApi.prototype.addValueColumns = function (colKeys, source) { this.columnController.addValueColumns(colKeys, source); };
    ColumnApi.prototype.setRowGroupColumns = function (colKeys, source) { this.columnController.setRowGroupColumns(colKeys, source); };
    ColumnApi.prototype.removeRowGroupColumn = function (colKey, source) { this.columnController.removeRowGroupColumn(colKey, source); };
    ColumnApi.prototype.removeRowGroupColumns = function (colKeys, source) { this.columnController.removeRowGroupColumns(colKeys, source); };
    ColumnApi.prototype.addRowGroupColumn = function (colKey, source) { this.columnController.addRowGroupColumn(colKey, source); };
    ColumnApi.prototype.addRowGroupColumns = function (colKeys, source) { this.columnController.addRowGroupColumns(colKeys, source); };
    ColumnApi.prototype.getRowGroupColumns = function () { return this.columnController.getRowGroupColumns(); };
    ColumnApi.prototype.setPivotColumns = function (colKeys, source) { this.columnController.setPivotColumns(colKeys, source); };
    ColumnApi.prototype.removePivotColumn = function (colKey, source) { this.columnController.removePivotColumn(colKey, source); };
    ColumnApi.prototype.removePivotColumns = function (colKeys, source) { this.columnController.removePivotColumns(colKeys, source); };
    ColumnApi.prototype.addPivotColumn = function (colKey, source) { this.columnController.addPivotColumn(colKey, source); };
    ColumnApi.prototype.addPivotColumns = function (colKeys, source) { this.columnController.addPivotColumns(colKeys, source); };
    ColumnApi.prototype.getPivotColumns = function () { return this.columnController.getPivotColumns(); };
    ColumnApi.prototype.getLeftDisplayedColumnGroups = function () { return this.columnController.getLeftDisplayedColumnGroups(); };
    ColumnApi.prototype.getCenterDisplayedColumnGroups = function () { return this.columnController.getCenterDisplayedColumnGroups(); };
    ColumnApi.prototype.getRightDisplayedColumnGroups = function () { return this.columnController.getRightDisplayedColumnGroups(); };
    ColumnApi.prototype.getAllDisplayedColumnGroups = function () { return this.columnController.getAllDisplayedColumnGroups(); };
    ColumnApi.prototype.autoSizeColumn = function (key, source) { return this.columnController.autoSizeColumn(key, source); };
    ColumnApi.prototype.autoSizeColumns = function (keys, source) { return this.columnController.autoSizeColumns(keys, source); };
    ColumnApi.prototype.autoSizeAllColumns = function (source) { this.columnController.autoSizeAllColumns(source); };
    ColumnApi.prototype.setSecondaryColumns = function (colDefs, source) { this.columnController.setSecondaryColumns(colDefs, source); };
    // below goes through deprecated items, prints message to user, then calls the new version of the same method
    ColumnApi.prototype.columnGroupOpened = function (group, newValue, source) {
        console.error('ag-Grid: columnGroupOpened no longer exists, use setColumnGroupOpened');
        this.setColumnGroupOpened(group, newValue, source);
    };
    ColumnApi.prototype.hideColumns = function (colIds, hide, source) {
        console.error('ag-Grid: hideColumns is deprecated, use setColumnsVisible');
        this.columnController.setColumnsVisible(colIds, !hide, source);
    };
    ColumnApi.prototype.hideColumn = function (colId, hide, source) {
        console.error('ag-Grid: hideColumn is deprecated, use setColumnVisible');
        this.columnController.setColumnVisible(colId, !hide, source);
    };
    ColumnApi.prototype.setState = function (columnState, source) {
        console.error('ag-Grid: setState is deprecated, use setColumnState');
        return this.setColumnState(columnState, source);
    };
    ColumnApi.prototype.getState = function () {
        console.error('ag-Grid: getState is deprecated, use getColumnState');
        return this.getColumnState();
    };
    ColumnApi.prototype.resetState = function (source) {
        console.error('ag-Grid: resetState is deprecated, use resetColumnState');
        this.resetColumnState(source);
    };
    ColumnApi.prototype.getAggregationColumns = function () {
        console.error('ag-Grid: getAggregationColumns is deprecated, use getValueColumns');
        return this.columnController.getValueColumns();
    };
    ColumnApi.prototype.removeAggregationColumn = function (colKey, source) {
        console.error('ag-Grid: removeAggregationColumn is deprecated, use removeValueColumn');
        this.columnController.removeValueColumn(colKey, source);
    };
    ColumnApi.prototype.removeAggregationColumns = function (colKeys, source) {
        console.error('ag-Grid: removeAggregationColumns is deprecated, use removeValueColumns');
        this.columnController.removeValueColumns(colKeys, source);
    };
    ColumnApi.prototype.addAggregationColumn = function (colKey, source) {
        console.error('ag-Grid: addAggregationColumn is deprecated, use addValueColumn');
        this.columnController.addValueColumn(colKey, source);
    };
    ColumnApi.prototype.addAggregationColumns = function (colKeys, source) {
        console.error('ag-Grid: addAggregationColumns is deprecated, use addValueColumns');
        this.columnController.addValueColumns(colKeys, source);
    };
    ColumnApi.prototype.setColumnAggFunction = function (column, aggFunc, source) {
        console.error('ag-Grid: setColumnAggFunction is deprecated, use setColumnAggFunc');
        this.columnController.setColumnAggFunc(column, aggFunc, source);
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
