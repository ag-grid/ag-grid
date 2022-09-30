var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Events, Bean, Autowired, _ } from "@ag-grid-community/core";
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
        if (this.gridOptionsWrapper.isFunctionsPassive()) {
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
                _.removeFromArray(copyOfPivotColumns, col);
                pivotChanged = true;
            }
            if (copyOfValueColumns.indexOf(col) >= 0) {
                _.removeFromArray(copyOfValueColumns, col);
                valueChanged = true;
            }
            if (copyOfRowGroupColumns.indexOf(col) >= 0) {
                _.removeFromArray(copyOfRowGroupColumns, col);
                rowGroupChanged = true;
            }
        };
        var action = value ? turnOnAction : turnOffAction;
        columns.forEach(action);
        if (pivotChanged) {
            var event_1 = {
                type: Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST,
                columns: copyOfPivotColumns
            };
            this.eventService.dispatchEvent(event_1);
        }
        if (rowGroupChanged) {
            var event_2 = {
                type: Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
                columns: copyOfRowGroupColumns
            };
            this.eventService.dispatchEvent(event_2);
        }
        if (valueChanged) {
            var event_3 = {
                type: Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
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
    __decorate([
        Autowired('aggFuncService')
    ], ModelItemUtils.prototype, "aggFuncService", void 0);
    __decorate([
        Autowired('columnModel')
    ], ModelItemUtils.prototype, "columnModel", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], ModelItemUtils.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('eventService')
    ], ModelItemUtils.prototype, "eventService", void 0);
    ModelItemUtils = __decorate([
        Bean('modelItemUtils')
    ], ModelItemUtils);
    return ModelItemUtils;
}());
export { ModelItemUtils };
