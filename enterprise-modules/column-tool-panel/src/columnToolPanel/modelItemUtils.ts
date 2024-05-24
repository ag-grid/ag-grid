import type {
    BeanCollection,
    BeanName,
    Column,
    ColumnApplyStateService,
    ColumnEventType,
    ColumnModel,
    ColumnState,
    IAggFunc,
    IAggFuncService,
} from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';

import type { ColumnModelItem } from './columnModelItem';

export class ModelItemUtils extends BeanStub {
    static BeanName: BeanName = 'modelItemUtils';

    private aggFuncService: IAggFuncService;
    private columnModel: ColumnModel;
    private columnApplyStateService: ColumnApplyStateService;

    public override wireBeans(beans: BeanCollection) {
        super.wireBeans(beans);
        this.aggFuncService = beans.aggFuncService;
        this.columnModel = beans.columnModel;
        this.columnApplyStateService = beans.columnApplyStateService;
    }

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
            items.forEach((item) => {
                if (!item.isPassesFilter()) {
                    return;
                }
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

        columns.forEach((col) => {
            if (col.getColDef().lockVisible) {
                return;
            }
            if (col.isVisible() != visible) {
                colStateItems.push({
                    colId: col.getId(),
                    hide: !visible,
                });
            }
        });

        if (colStateItems.length > 0) {
            this.columnApplyStateService.applyColumnState({ state: colStateItems }, eventType);
        }
    }

    private setAllPivot(columns: Column[], value: boolean, eventType: ColumnEventType): void {
        this.setAllPivotActive(columns, value, eventType);
    }

    private setAllPivotActive(columns: Column[], value: boolean, eventType: ColumnEventType): void {
        const colStateItems: ColumnState[] = [];

        const turnOnAction = (col: Column) => {
            // don't change any column that's already got a function active
            if (col.isAnyFunctionActive()) {
                return;
            }

            if (col.isAllowValue()) {
                const aggFunc =
                    typeof col.getAggFunc() === 'string'
                        ? col.getAggFunc()
                        : this.aggFuncService.getDefaultAggFunc(col);
                colStateItems.push({
                    colId: col.getId(),
                    aggFunc: aggFunc,
                });
            } else if (col.isAllowRowGroup()) {
                colStateItems.push({
                    colId: col.getId(),
                    rowGroup: true,
                });
            } else if (col.isAllowPivot()) {
                colStateItems.push({
                    colId: col.getId(),
                    pivot: true,
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
                    aggFunc: null,
                });
            }
        };

        const action = value ? turnOnAction : turnOffAction;

        columns.forEach(action);

        if (colStateItems.length > 0) {
            this.columnApplyStateService.applyColumnState({ state: colStateItems }, eventType);
        }
    }

    public updateColumns(params: {
        columns: Column[];
        visibleState?: { [key: string]: boolean };
        pivotState?: {
            [key: string]: {
                pivot?: boolean;
                rowGroup?: boolean;
                aggFunc?: string | IAggFunc | null;
            };
        };
        eventType: ColumnEventType;
    }): void {
        const { columns, visibleState, pivotState, eventType } = params;
        const state: ColumnState[] = columns.map((column) => {
            const colId = column.getColId();
            if (this.columnModel.isPivotMode()) {
                const pivotStateForColumn = pivotState?.[colId];
                return {
                    colId,
                    pivot: pivotStateForColumn?.pivot,
                    rowGroup: pivotStateForColumn?.rowGroup,
                    aggFunc: pivotStateForColumn?.aggFunc,
                };
            } else {
                return {
                    colId,
                    hide: !visibleState?.[colId],
                };
            }
        });
        this.columnApplyStateService.applyColumnState({ state }, eventType);
    }

    public createPivotState(column: Column): {
        pivot?: boolean;
        rowGroup?: boolean;
        aggFunc?: string | IAggFunc | null;
    } {
        return {
            pivot: column.isPivotActive(),
            rowGroup: column.isRowGroupActive(),
            aggFunc: column.isValueActive() ? column.getAggFunc() : undefined,
        };
    }
}
