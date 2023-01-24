import { ColumnModelItem } from "./columnModelItem";
import {
    ColumnModel,
    Events,
    ColumnPivotChangeRequestEvent,
    GridOptionsService,
    ColumnEventType,
    Bean,
    IAggFuncService,
    Autowired,
    Column,
    EventService,
    ColumnState,
    _,
    WithoutGridCommon
} from "@ag-grid-community/core";

@Bean('modelItemUtils')
export class ModelItemUtils {

    @Autowired('aggFuncService') aggFuncService: IAggFuncService;
    @Autowired('columnModel') columnModel: ColumnModel;
    @Autowired('gridOptionsService') private gridOptionsService: GridOptionsService;
    @Autowired('eventService') private eventService: EventService;

    public selectAllChildren(colTree: ColumnModelItem[], selectAllChecked: boolean, eventType: ColumnEventType): void {
        const cols = this.extractAllLeafColumns(colTree);
        this.setAllColumns(cols, selectAllChecked, eventType);
    }

    public setColumn(col: Column, selectAllChecked: boolean, eventType: ColumnEventType): void {
        this.setAllColumns([col], selectAllChecked, eventType);
    }

    public setAllColumns(cols: Column[], selectAllChecked: boolean, eventType: ColumnEventType): void {
        if (this.columnModel.isPivotMode()) {
            this.setAllPivot(cols, selectAllChecked, eventType);
        } else {
            this.setAllVisible(cols, selectAllChecked, eventType);
        }
    }

    private extractAllLeafColumns(allItems: ColumnModelItem[]): Column[] {

        const res: Column[] = [];

        const recursiveFunc = (items: ColumnModelItem[]) => {
            items.forEach(item => {
                if (!item.isPassesFilter()) { return; }
                if (item.isGroup()) {
                    recursiveFunc(item.getChildren());
                } else {
                    res.push(item.getColumn());
                }
            });
        };

        recursiveFunc(allItems);

        return res;
    }

    private setAllVisible(columns: Column[], visible: boolean, eventType: ColumnEventType): void {
        const colStateItems: ColumnState[] = [];

        columns.forEach(col => {
            if (col.getColDef().lockVisible) { return; }
            if (col.isVisible() != visible) {
                colStateItems.push({
                    colId: col.getId(),
                    hide: !visible
                });
            }
        });

        if (colStateItems.length > 0) {
            this.columnModel.applyColumnState({state: colStateItems}, eventType);
        }
    }

    private setAllPivot(columns: Column[], value: boolean, eventType: ColumnEventType): void {
        if (this.gridOptionsService.is('functionsPassive')) {
            this.setAllPivotPassive(columns, value);
        } else {
            this.setAllPivotActive(columns, value, eventType);
        }
    }

    private setAllPivotPassive(columns: Column[], value: boolean): void {

        const copyOfPivotColumns = this.columnModel.getPivotColumns().slice();
        const copyOfValueColumns = this.columnModel.getValueColumns().slice();
        const copyOfRowGroupColumns = this.columnModel.getRowGroupColumns().slice();

        let pivotChanged = false;
        let valueChanged = false;
        let rowGroupChanged = false;

        const turnOnAction = (col: Column) => {
            // don't change any column that's already got a function active
            if (col.isAnyFunctionActive()) { return; }

            if (col.isAllowValue()) {
                copyOfValueColumns.push(col);
                valueChanged = true;
            } else if (col.isAllowRowGroup()) {
                copyOfRowGroupColumns.push(col);
                pivotChanged = true;
            } else if (col.isAllowPivot()) {
                copyOfPivotColumns.push(col);
                rowGroupChanged = true;
            }
        };

        const turnOffAction = (col: Column) => {
            if (!col.isAnyFunctionActive()) { return; }

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
            const event: WithoutGridCommon<ColumnPivotChangeRequestEvent> = {
                type: Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST,
                columns: copyOfPivotColumns
            };
            this.eventService.dispatchEvent(event);
        }

        if (rowGroupChanged) {
            const event: WithoutGridCommon<ColumnPivotChangeRequestEvent> = {
                type: Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
                columns: copyOfRowGroupColumns
            };
            this.eventService.dispatchEvent(event);
        }

        if (valueChanged) {
            const event: WithoutGridCommon<ColumnPivotChangeRequestEvent> = {
                type: Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
                columns: copyOfRowGroupColumns
            };
            this.eventService.dispatchEvent(event);
        }
    }

    private setAllPivotActive(columns: Column[], value: boolean, eventType: ColumnEventType): void {
        const colStateItems: ColumnState[] = [];

        const turnOnAction = (col: Column) => {
            // don't change any column that's already got a function active
            if (col.isAnyFunctionActive()) { return; }

            if (col.isAllowValue()) {
                const aggFunc = typeof col.getAggFunc() === 'string'
                    ? col.getAggFunc()
                    : this.aggFuncService.getDefaultAggFunc(col);
                colStateItems.push({
                    colId: col.getId(),
                    aggFunc: aggFunc
                });
            } else if (col.isAllowRowGroup()) {
                colStateItems.push({
                    colId: col.getId(),
                    rowGroup: true
                });
            } else if (col.isAllowPivot()) {
                colStateItems.push({
                    colId: col.getId(),
                    pivot: true
                });
            }
        };

        const turnOffAction = (col: Column) => {
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
            this.columnModel.applyColumnState({state: colStateItems}, eventType);
        }
    }

}