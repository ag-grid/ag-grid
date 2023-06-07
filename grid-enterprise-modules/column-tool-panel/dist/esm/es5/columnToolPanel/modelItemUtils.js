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
        if (this.gridOptionsService.is('functionsPassive')) {
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
        Autowired('gridOptionsService')
    ], ModelItemUtils.prototype, "gridOptionsService", void 0);
    __decorate([
        Autowired('eventService')
    ], ModelItemUtils.prototype, "eventService", void 0);
    ModelItemUtils = __decorate([
        Bean('modelItemUtils')
    ], ModelItemUtils);
    return ModelItemUtils;
}());
export { ModelItemUtils };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWxJdGVtVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29sdW1uVG9vbFBhbmVsL21vZGVsSXRlbVV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLE9BQU8sRUFFSCxNQUFNLEVBSU4sSUFBSSxFQUVKLFNBQVMsRUFJVCxDQUFDLEVBRUosTUFBTSx5QkFBeUIsQ0FBQztBQUdqQztJQUFBO0lBK0xBLENBQUM7SUF4TFUsMENBQWlCLEdBQXhCLFVBQXlCLE9BQTBCLEVBQUUsZ0JBQXlCLEVBQUUsU0FBMEI7UUFDdEcsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFTSxrQ0FBUyxHQUFoQixVQUFpQixHQUFXLEVBQUUsZ0JBQXlCLEVBQUUsU0FBMEI7UUFDL0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFTSxzQ0FBYSxHQUFwQixVQUFxQixJQUFjLEVBQUUsZ0JBQXlCLEVBQUUsU0FBMEI7UUFDdEYsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQ2hDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQ3ZEO2FBQU07WUFDSCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUN6RDtJQUNMLENBQUM7SUFFTyw4Q0FBcUIsR0FBN0IsVUFBOEIsUUFBMkI7UUFFckQsSUFBTSxHQUFHLEdBQWEsRUFBRSxDQUFDO1FBRXpCLElBQU0sYUFBYSxHQUFHLFVBQUMs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