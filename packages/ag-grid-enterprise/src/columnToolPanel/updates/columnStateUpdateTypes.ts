import type { AgColumn, ColumnEventType, ColumnState, IAggFunc, SortDef } from 'ag-grid-community';

export type ColumnStateUpdateParams = { deferApply?: boolean };

export interface ColumnStateConcreteUpdateStrategy {
    applyColumnState(state: ColumnState[], eventType: ColumnEventType): void;
    commit(): void;
    moveColumns(columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void;
    reset(): void;
    setColumnsVisible(columns: AgColumn[], visible: boolean, eventType: ColumnEventType): void;
    isColumnVisibleInToolPanel(column: AgColumn): boolean;
    setRowGroupColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    getRowGroupColumns(): AgColumn[];
    getPrimaryColumns(): AgColumn[];
    setValueColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    getValueColumns(): AgColumn[];
    setColumnAggFunc(column: AgColumn, aggFunc: string | IAggFunc | null | undefined, eventType: ColumnEventType): void;
    getColumnAggFunc(column: AgColumn): string | IAggFunc | null | undefined;
    setPivotColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    getPivotColumns(): AgColumn[];
    setPivotMode(pivotMode: boolean, eventType: ColumnEventType): void;
    getPivotMode(): boolean;
    isColumnSelectedInPivotModeToolPanel(column: AgColumn): boolean;
    progressSortFromEvent(column: AgColumn, event: MouseEvent | KeyboardEvent): void;
    getSortDef(column: AgColumn): SortDef | null;
}

type Seq = { seq: number; eventType: ColumnEventType };
type ColIdsDraft = { colIds: string[] } & Seq;
type ColumnStateDraft = { patches: Map<string, ColumnState> } & Seq;
type PivotModeDraft = { pivotMode: boolean } & Seq;
type SortDraft = { sortDefsByColId: Map<string, SortDef | null>; baselineCleared: boolean } & Seq;
type AggFuncsDraft = { values: Map<string, string | IAggFunc | null | undefined> } & Seq;

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
