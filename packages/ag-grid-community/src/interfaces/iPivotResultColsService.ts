import type { ColumnCollections } from '../columns/columnModel';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ColGroupDef, ColKey } from '../entities/colDef';
import type { ColumnEventType } from '../events';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IPivotResultColsService {
    isPivotResultColsPresent(): boolean;

    lookupPivotResultCol(pivotKeys: string[], valueColKey: ColKey): AgColumn | null;

    getPivotResultCols(): ColumnCollections | null;

    getPivotResultCol(key: ColKey): AgColumn | null;

    setPivotResultCols(
        colDefs: (ColDef | ColGroupDef)[] | null,
        source: ColumnEventType,
        useGeneratedOrder?: boolean
    ): void;

    /** Returns pivot result columns ordered for aggregation: regular columns first, total columns after.
     * Cached — only recomputed when pivot result columns change. */
    getAggregationOrderedList(): AgColumn[] | null;
}
