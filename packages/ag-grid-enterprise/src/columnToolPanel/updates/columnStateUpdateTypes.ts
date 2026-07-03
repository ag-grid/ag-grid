import type { AgColumn, ColAggFunc, ColumnEventType, ColumnState, SortDef, SortDirection } from 'ag-grid-community';

export type ColumnStateUpdateParams = { buttons?: Array<'apply' | 'cancel'> };

export interface ColumnStateConcreteUpdateStrategy {
    applyColumnState(state: ColumnState[], eventType: ColumnEventType): void;
    commit(): void;
    hasPendingChanges(): boolean;
    moveColumns(columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void;
    reset(): void;
    setColumnsVisible(columns: AgColumn[], visible: boolean, eventType: ColumnEventType): void;
    isColumnVisibleInToolPanel(column: AgColumn): boolean;
    setRowGroupColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    getRowGroupColumns(): AgColumn[];
    getPrimaryColumns(): AgColumn[];
    hasDeferredColumnOrder(): boolean;
    setValueColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    getValueColumns(): AgColumn[];
    setColumnAggFunc(column: AgColumn, aggFunc: ColAggFunc, eventType: ColumnEventType): void;
    getColumnAggFunc(column: AgColumn): ColAggFunc;
    setPivotColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    getPivotColumns(): AgColumn[];
    setPivotMode(pivotMode: boolean, eventType: ColumnEventType): void;
    getPivotMode(): boolean;
    isColumnSelectedInPivotModeToolPanel(column: AgColumn): boolean;
    progressSortFromEvent(column: AgColumn, event: MouseEvent | KeyboardEvent): void;
    getSortDef(column: AgColumn): SortDef | null;
    progressPivotSortFromEvent(column: AgColumn): void;
    getPivotSort(column: AgColumn): SortDirection | undefined;
}

type Seq = { seq: number; eventType: ColumnEventType };
type ColIdsDraft = { colIds: string[] } & Seq;
type ColumnStateDraft = { patches: Map<string, ColumnState> } & Seq;
type PivotModeDraft = { pivotMode: boolean } & Seq;
type SortDraft = { sortDefsByColId: Map<string, SortDef | null>; baselineCleared: boolean } & Seq;
type AggFuncsDraft = { values: Map<string, ColAggFunc> } & Seq;

export type DeferredState = {
    columnState?: ColumnStateDraft;
    columnOrder?: ColIdsDraft;
    rowGroup?: ColIdsDraft;
    aggregation?: ColIdsDraft;
    pivot?: ColIdsDraft;
    pivotMode?: PivotModeDraft;
    sort?: SortDraft;
    aggFuncs?: AggFuncsDraft;
};

export type CommitOperation =
    | ({ type: 'columnState' } & ColumnStateDraft)
    | ({ type: 'columnOrder' } & ColIdsDraft)
    | ({ type: 'rowGroup' } & ColIdsDraft)
    | ({ type: 'aggregation' } & ColIdsDraft)
    | ({ type: 'pivot' } & ColIdsDraft)
    | ({ type: 'pivotMode' } & PivotModeDraft)
    | ({ type: 'sort' } & SortDraft)
    | ({ type: 'aggFuncs' } & AggFuncsDraft);

export type CommitOperations = CommitOperation[];
