import type { ColumnState, ColumnStateParams } from '../columns/columnStateUtils';
import type { AgColumn } from '../entities/agColumn';
import type { ColAggFunc, ColKey } from '../entities/colDef';
import type { ColumnEventType } from '../events';

/** `columnChanged`-family event dispatched by a cols service. @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type ColumnChangedEventType = 'columnValueChanged' | 'columnPivotChanged' | 'columnRowGroupChanged';

/** Shared base for all three cols services; service-specific ops live on sub-interfaces. @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IColsService {
    columns: AgColumn[];

    /** Dispatch this service's staged change (if any); called when the column update that staged it ends. */
    dispatchColChange(source: ColumnEventType): void;

    setColumns(colKeys: ColKey[] | undefined, source: ColumnEventType): void;
    addColumns(keys: (ColKey | null | undefined)[] | undefined, source: ColumnEventType): void;
    removeColumns(keys: (ColKey | null | undefined)[] | undefined, source: ColumnEventType): void;

    /** Recompute active cols with a shared scan: call {@link extractCol} per primary col, then finalise via {@link commitExtract}. */
    extractCol(col: AgColumn, colIsNew: boolean, source: ColumnEventType, newColDefs: boolean): void;
    commitExtract(source: ColumnEventType, asNewGrid: boolean, newColDefs: boolean): void;

    syncColState(
        column: AgColumn,
        stateItem: ColumnState | null,
        defaultState: ColumnStateParams | undefined,
        source: ColumnEventType
    ): void;
    /** Ends a state pass: re-orders by the indexes its `syncColState` calls recorded. */
    sortByPendingState(source: ColumnEventType): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.  */
export interface IOrderedColsService extends IColsService {
    /** Whether {@link IColsService.extractCol} would make `col` active, without staging it. */
    willExtractCol(col: AgColumn, colIsNew: boolean, newColDefs: boolean): boolean;
    /** Assigns synthetic indexes to `incoming` and adds new entries to `accumulator`; both mutated. */
    restoreColumnOrder(incoming: { [colId: string]: ColumnState }, accumulator: { [colId: string]: ColumnState }): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.  */
export interface IRowGroupColsService extends IOrderedColsService {
    moveColumn(fromIndex: number, toIndex: number, source: ColumnEventType): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.  */
export interface IPivotColsService extends IOrderedColsService {
    isStrictColumnOrder(): boolean;
    /** True if any active pivot col has an interactive `pivotSort` direction set. */
    hasInteractivePivotSort(): boolean;
    /** Re-rank `stickyOrder` so its pivot groups follow the freshly-sorted `defColsList` group order, while
     *  keeping each group's within-group (user) column order. Stable: equal group rank keeps sticky order. */
    reRankByPivotGroupOrder(
        defColsList: AgColumn[],
        stickyOrder: AgColumn[],
        colsById: Record<string, AgColumn>
    ): AgColumn[];
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.  */
export interface IValueColsService extends IColsService {
    setColumnAggFunc(key: ColKey | undefined, aggFunc: ColAggFunc, source: ColumnEventType): void;
}
