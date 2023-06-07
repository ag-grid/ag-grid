var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Events, Bean, Autowired, _ } from "@ag-grid-community/core";
let ModelItemUtils = class ModelItemUtils {
    selectAllChildren(colTree, selectAllChecked, eventType) {
        const cols = this.extractAllLeafColumns(colTree);
        this.setAllColumns(cols, selectAllChecked, eventType);
    }
    setColumn(col, selectAllChecked, eventType) {
        this.setAllColumns([col], selectAllChecked, eventType);
    }
    setAllColumns(cols, selectAllChecked, eventType) {
        if (this.columnModel.isPivotMode()) {
            this.setAllPivot(cols, selectAllChecked, eventType);
        }
        else {
            this.setAllVisible(cols, selectAllChecked, eventType);
        }
    }
    extractAllLeafColumns(allItems) {
        const res = [];
        const recursiveFunc = (items) => {
            items.forEach(item => {
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
    }
    setAllVisible(columns, visible, eventType) {
        const colStateItems = [];
        columns.forEach(col => {
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
    }
    setAllPivot(columns, value, eventType) {
        if (this.gridOptionsService.is('functionsPassive')) {
            this.setAllPivotPassive(columns, value);
        }
        else {
            this.setAllPivotActive(columns, value, eventType);
        }
    }
    setAllPivotPassive(columns, value) {
        const copyOfPivotColumns = this.columnModel.getPivotColumns().slice();
        const copyOfValueColumns = this.columnModel.getValueColumns().slice();
        const copyOfRowGroupColumns = this.columnModel.getRowGroupColumns().slice();
        let pivotChanged = false;
        let valueChanged = false;
        let rowGroupChanged = false;
        const turnOnAction = (col) => {
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
        const turnOffAction = (col) => {
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
        const action = value ? turnOnAction : turnOffAction;
        columns.forEach(action);
        if (pivotChanged) {
            const event = {
                type: Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST,
                columns: copyOfPivotColumns
            };
            this.eventService.dispatchEvent(event);
        }
        if (rowGroupChanged) {
            const event = {
                type: Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
                columns: copyOfRowGroupColumns
            };
            this.eventService.dispatchEvent(event);
        }
        if (valueChanged) {
            const event = {
                type: Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
                columns: copyOfRowGroupColumns
            };
            this.eventService.dispatchEvent(event);
        }
    }
    setAllPivotActive(columns, value, eventType) {
        const colStateItems = [];
        const turnOnAction = (col) => {
            // don't change any column that's already got a function active
            if (col.isAnyFunctionActive()) {
                return;
            }
            if (col.isAllowValue()) {
                const aggFunc = typeof col.getAggFunc() === 'string'
                    ? col.getAggFunc()
                    : this.aggFuncService.getDefaultAggFunc(col);
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
        const turnOffAction = (col) => {
            const isActive = col.isPivotActive() || col.isRowGroupActive() || col.isValueActive();
            if (isActive) {
                colStateItems.push({
                    colId: col.getId(),
                    pivot: false,
                    rowGroup: false,
                    aggFunc: null
                });
            }
        };
        const action = value ? turnOnAction : turnOffAction;
        columns.forEach(action);
        if (colStateItems.length > 0) {
            this.columnModel.applyColumnState({ state: colStateItems }, eventType);
        }
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
export { ModelItemUtils };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWxJdGVtVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29sdW1uVG9vbFBhbmVsL21vZGVsSXRlbVV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLE9BQU8sRUFFSCxNQUFNLEVBSU4sSUFBSSxFQUVKLFNBQVMsRUFJVCxDQUFDLEVBRUosTUFBTSx5QkFBeUIsQ0FBQztBQUdqQyxJQUFhLGNBQWMsR0FBM0IsTUFBYSxjQUFjO0lBT2hCLGlCQUFpQixDQUFDLE9BQTBCLEVBQUUsZ0JBQXlCLEVBQUUsU0FBMEI7UUFDdEcsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFTSxTQUFTLENBQUMsR0FBVyxFQUFFLGdCQUF5QixFQUFFLFNBQTBCO1FBQy9FLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRU0sYUFBYSxDQUFDLElBQWMsRUFBRSxnQkFBeUIsRUFBRSxTQUEwQjtRQUN0RixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDaEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDdkQ7YUFBTTtZQUNILElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQ3pEO0lBQ0wsQ0FBQztJQUVPLHFCQUFxQixDQUFDLFFBQTJCO1FBRXJELE1BQU0sR0FBRyxHQUFhLEVBQUUsQ0FBQztRQUV6QixNQUFNLGFBQWEsR0FBRyxDQUFDLEtBQXdCLEVBQUUsRUFBRTtZQUMv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