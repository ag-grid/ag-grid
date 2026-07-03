import type { ColumnState } from '../columns/columnStateUtils';
import type { AgColumn } from '../entities/agColumn';
import type { ColAggFunc } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { SortDef, SortDirection } from '../interfaces/iSort';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IColumnStateUpdateStrategy {
    applyColumnState(deferMode: boolean, state: ColumnState[], eventType: ColumnEventType): void;
    commit(deferMode: boolean): void;
    hasPendingChanges(deferMode: boolean): boolean;
    moveColumns(deferMode: boolean, columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void;
    reset(deferMode: boolean): void;
    setColumnsVisible(deferMode: boolean, columns: AgColumn[], visible: boolean, eventType: ColumnEventType): void;
    isColumnVisibleInToolPanel(deferMode: boolean, column: AgColumn): boolean;
    setRowGroupColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void;
    getRowGroupColumns(deferMode: boolean): AgColumn[];
    getPrimaryColumns(deferMode: boolean): AgColumn[];
    hasDeferredColumnOrder(deferMode: boolean): boolean;
    setValueColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void;
    getValueColumns(deferMode: boolean): AgColumn[];
    setColumnAggFunc(deferMode: boolean, column: AgColumn, aggFunc: ColAggFunc, eventType: ColumnEventType): void;
    getColumnAggFunc(deferMode: boolean, column: AgColumn): ColAggFunc;
    setPivotColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void;
    getPivotColumns(deferMode: boolean): AgColumn[];
    setPivotMode(deferMode: boolean, pivotMode: boolean, eventType: ColumnEventType): void;
    getPivotMode(deferMode: boolean): boolean;
    isColumnSelectedInPivotModeToolPanel(deferMode: boolean, column: AgColumn): boolean;
    progressSortFromEvent(deferMode: boolean, column: AgColumn, event: MouseEvent | KeyboardEvent): void;
    getSortDef(deferMode: boolean, column: AgColumn): SortDef | null;
    progressPivotSortFromEvent(deferMode: boolean, column: AgColumn): void;
    getPivotSort(deferMode: boolean, column: AgColumn): SortDirection | undefined;
}
