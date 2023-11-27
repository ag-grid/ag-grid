"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelItemUtils = void 0;
var core_1 = require("@ag-grid-community/core");
var ModelItemUtils = /** @class */ (function () {
    function ModelItemUtils() {
    }
    ModelItemUtils.prototype.selectAllChildren = function (colTree, selectAllChecked, eventType) {
        var cols = this.extractAllLeafColumns(colTree);
        this.setAllColumns(cols, selectAllChecked, eventType);
    };
    ModelItemUtils.prototype.setColumn = function (col, selectAllChecked, eventType) {
        this.setAllColumns([col], selectAllChecked, eventType);
    };
    ModelItemUtils.prototype.setAllColumns = function (cols, selectAllChecked, eventType) {
        if (this.columnModel.isPivotMode()) {
            this.setAllPivot(cols, selectAllChecked, eventType);
        }
        else {
            this.setAllVisible(cols, selectAllChecked, eventType);
        }
    };
    ModelItemUtils.prototype.extractAllLeafColumns = function (allItems) {
        var res = [];
        var recursiveFunc = function (items) {
            items.forEach(function (item) {
                if (!item.isPassesFilter()) {
                    return;
                }
                if (item.isGroup()) {
                    recursiveFunc(item.getChildren());
                }
                else {
                    res.push(item.getColumn());
                }
            });
        };
        recursiveFunc(allItems);
        return res;
    };
    ModelItemUtils.prototype.setAllVisible = function (columns, visible, eventType) {
        var colStateItems = [];
        columns.forEach(function (col) {
            if (col.getColDef().lockVisible) {
                return;
            }
            if (col.isVisible() != visible) {
                colStateItems.push({
                    colId: col.getId(),
                    hide: !visible
                });
            }
        });
        if (colStateItems.length > 0) {
            this.columnModel.applyColumnState({ state: colStateItems }, eventType);
        }
    };
    ModelItemUtils.prototype.setAllPivot = function (columns, value, eventType) {
        if (this.gridOptionsService.get('functionsPassive')) {
            this.setAllPivotPassive(columns, value);
        }
        else {
            this.setAllPivotActive(columns, value, eventType);
        }
    };
    ModelItemUtils.prototype.setAllPivotPassive = function (columns, value) {
        var copyOfPivotColumns = this.columnModel.getPivotColumns().slice();
        var copyOfValueColumns = this.columnModel.getValueColumns().slice();
        var copyOfRowGroupColumns = this.columnModel.getRowGroupColumns().slice();
        var pivotChanged = false;
        var valueChanged = false;
        var rowGroupChanged = false;
        var turnOnAction = function (col) {
            // don't change any column that's already got a function active
            if (col.isAnyFunctionActive()) {
                return;
            }
            if (col.isAllowValue()) {
                copyOfValueColumns.push(col);
                valueChanged = true;
            }
            else if (col.isAllowRowGroup()) {
                copyOfRowGroupColumns.push(col);
                pivotChanged = true;
            }
            else if (col.isAllowPivot()) {
                copyOfPivotColumns.push(col);
                rowGroupChanged = true;
            }
        };
        var turnOffAction = function (col) {
            if (!col.isAnyFunctionActive()) {
                return;
            }
            if (copyOfPivotColumns.indexOf(col) >= 0) {
                core_1._.removeFromArray(copyOfPivotColumns, col);
                pivotChanged = true;
            }
            if (copyOfValueColumns.indexOf(col) >= 0) {
                core_1._.removeFromArray(copyOfValueColumns, col);
                valueChanged = true;
            }
            if (copyOfRowGroupColumns.indexOf(col) >= 0) {
                core_1._.removeFromArray(copyOfRowGroupColumns, col);
                rowGroupChanged = true;
            }
        };
        var action = value ? turnOnAction : turnOffAction;
        columns.forEach(action);
        if (pivotChanged) {
            var event_1 = {
                type: core_1.Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST,
                columns: copyOfPivotColumns
            };
            this.eventService.dispatchEvent(event_1);
        }
        if (rowGroupChanged) {
            var event_2 = {
                type: core_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
                columns: copyOfRowGroupColumns
            };
            this.eventService.dispatchEvent(event_2);
        }
        if (valueChanged) {
            var event_3 = {
                type: core_1.Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
                columns: copyOfRowGroupColumns
            };
            this.eventService.dispatchEvent(event_3);
        }
    };
    ModelItemUtils.prototype.setAllPivotActive = function (columns, value, eventType) {
        var _this = this;
        var colStateItems = [];
        var turnOnAction = function (col) {
            // don't change any column that's already got a function active
            if (col.isAnyFunctionActive()) {
                return;
            }
            if (col.isAllowValue()) {
                var aggFunc = typeof col.getAggFunc() === 'string'
                    ? col.getAggFunc()
                    : _this.aggFuncService.getDefaultAggFunc(col);
                colStateItems.push({
                    colId: col.getId(),
                    aggFunc: aggFunc
                });
            }
            else if (col.isAllowRowGroup()) {
                colStateItems.push({
                    colId: col.getId(),
                    rowGroup: true
                });
            }
            else if (col.isAllowPivot()) {
                colStateItems.push({
                    colId: col.getId(),
                    pivot: true
                });
            }
        };
        var turnOffAction = function (col) {
            var isActive = col.isPivotActive() || col.isRowGroupActive() || col.isValueActive();
            if (isActive) {
                colStateItems.push({
                    colId: col.getId(),
                    pivot: false,
                    rowGroup: false,
                    aggFunc: null
                });
            }
        };
        var action = value ? turnOnAction : turnOffAction;
        columns.forEach(action);
        if (colStateItems.length > 0) {
            this.columnModel.applyColumnState({ state: colStateItems }, eventType);
        }
    };
    ModelItemUtils.prototype.updateColumns = function (params) {
        var _this = this;
        var columns = params.columns, visibleState = params.visibleState, pivotState = params.pivotState, eventType = params.eventType;
        var state = columns.map(function (column) {
            var colId = column.getColId();
            if (_this.columnModel.isPivotMode()) {
                var pivotStateForColumn = pivotState === null || pivotState === void 0 ? void 0 : pivotState[colId];
                return {
                    colId: colId,
                    pivot: pivotStateForColumn === null || pivotStateForColumn === void 0 ? void 0 : pivotStateForColumn.pivot,
                    rowGroup: pivotStateForColumn === null || pivotStateForColumn === void 0 ? void 0 : pivotStateForColumn.rowGroup,
                    aggFunc: pivotStateForColumn === null || pivotStateForColumn === void 0 ? void 0 : pivotStateForColumn.aggFunc,
                };
            }
            else {
                return {
                    colId: colId,
                    hide: !(visibleState === null || visibleState === void 0 ? void 0 : visibleState[colId])
                };
            }
        });
        this.columnModel.applyColumnState({ state: state }, eventType);
    };
    ModelItemUtils.prototype.createPivotState = function (column) {
        return {
            pivot: column.isPivotActive(),
            rowGroup: column.isRowGroupActive(),
            aggFunc: column.isValueActive() ? column.getAggFunc() : undefined
        };
    };
    __decorate([
        (0, core_1.Autowired)('aggFuncService')
    ], ModelItemUtils.prototype, "aggFuncService", void 0);
    __decorate([
        (0, core_1.Autowired)('columnModel')
    ], ModelItemUtils.prototype, "columnModel", void 0);
    __decorate([
        (0, core_1.Autowired)('gridOptionsService')
    ], ModelItemUtils.prototype, "gridOptionsService", void 0);
    __decorate([
        (0, core_1.Autowired)('eventService')
    ], ModelItemUtils.prototype, "eventService", void 0);
    ModelItemUtils = __decorate([
        (0, core_1.Bean)('modelItemUtils')
    ], ModelItemUtils);
    return ModelItemUtils;
}());
exports.ModelItemUtils = ModelItemUtils;
