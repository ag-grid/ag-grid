import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef, ColKey } from '../entities/colDef';
import type { ColumnEventType } from '../events';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 *  Owns the pivot result column lifecycle (creation, retention across save/clear, teardown). */
export interface IPivotResultColsService {
    /** Generated pivot result leaf columns. Null when not pivoting. */
    readonly pivotCols: AgColumn[] | null;

    /** Balanced-tree wrappers around `pivotCols`. Empty when not pivoting. */
    readonly pivotTree: (AgColumn | AgProvidedColumnGroup)[];

    /** Tree depth of `pivotTree` (max group nesting). */
    readonly pivotTreeDepth: number;

    isPivotResultColsPresent(): boolean;

    lookupPivotResultCol(pivotKeys: string[], valueColKey: ColKey): AgColumn | null;

    setPivotResultCols(colDefs: (ColDef | ColGroupDef)[] | null, source: ColumnEventType): void;

    /** Returns pivot result columns ordered for aggregation: regular columns first, total columns after.
     * Cached — only recomputed when pivot result columns change. */
    getAggregationOrderedList(): AgColumn[] | null;

    /** Release pivot trees including any saved tree held over a clear/restore window. */
    destroyTrees(): void;
}
