import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef, ColKey } from '../entities/colDef';
import type { ColumnEventType } from '../events';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IPivotResultColsService {
    /** The pivot result column tree, or null when not pivoting. */
    readonly pivotTree: (AgColumn | AgProvidedColumnGroup)[] | null;

    /** Depth of the pivot result tree. */
    readonly pivotTreeDepth: number;

    /** Leaf pivot columns, lazily derived from pivotTree. Undefined when not pivoting. */
    readonly pivotCols: AgColumn[] | undefined;

    lookupPivotResultCol(pivotKeys: string[], valueColKey: ColKey): AgColumn | null;

    getPivotResultCol(colId: string): AgColumn | null;

    setPivotResultCols(colDefs: (ColDef | ColGroupDef)[] | null, source: ColumnEventType): void;

    /**
     * Returns pivot columns ordered for aggregation: regular columns first, total columns after.
     * Aggregation requires this order because total columns read from already-computed regular results.
     */
    getAggregationOrderedList(): AgColumn[] | null;
}
