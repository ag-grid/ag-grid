import type { ColumnTreeBuild } from '../columns/columnTree/columnTreeBuilder';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ColGroupDef, ColKey } from '../entities/colDef';
import type { ColumnEventType } from '../events';

/** Owns pivot result column lifecycle (create/retain/teardown).
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IPivotResultColsService {
    /** Generated pivot result leaf columns, `pivotBuild`'s; null when not pivoting or cleared. */
    readonly pivotCols: AgColumn[] | null;

    /** The last pivot result build: its tree and groups while `pivotCols` is set, kept across a clear for reuse. */
    readonly pivotBuild: ColumnTreeBuild | null;

    /** Build pivoting column-state order as parked primaries (`colsById` not `colsList`) first.
     *  Then append displayed cols; return `colsList` directly when none are parked. */
    buildColsInStateOrder(): AgColumn[];

    buildAllCols(): AgColumn[];

    lookupPivotResultCol(pivotKeys: string[], valueColKey: ColKey): AgColumn | null;

    /** `appSupplied`: colDefs came from `setPivotResultColumns`, so the grid orders them by `pivotSort` and
     *  retains them as {@link suppliedColDefs}. Generated colDefs are already ordered and must be left alone. */
    setPivotResultCols(colDefs: (ColDef | ColGroupDef)[] | null, source: ColumnEventType, appSupplied?: boolean): void;

    /** The colDefs last passed to `setPivotResultColumns`, as supplied; `null` when the grid generated the current
     *  pivot result cols. Non-null means the application owns them, so no row model may regenerate them. */
    readonly suppliedColDefs: (ColDef | ColGroupDef)[] | null;

    /** Re-order the applied pivot result cols for the pivot columns' current `pivotSort`. */
    resortPivotResultCols(source: ColumnEventType): void;

    /** Return aggregation order for pivot result cols (regular first, totals after).
     *  Cache until pivot result cols change. */
    getAggregationOrderedList(): AgColumn[] | null;

    /** Rebuild `colDef`s for pivot result cols whose `pivotValueColumn` is `sourceCol` via reverse-map lookup,
     *  also while the build is kept across a clear. No-op before the first pivot result build. */
    recreateColDefsForSource(sourceCol: AgColumn, source: ColumnEventType): void;

    /** `valueCol` was renamed: the generated pivot result cols made from it are re-derived as the update ends. */
    onValueColRenamed(valueCol: AgColumn, source: ColumnEventType): void;

    /** Re-apply the stateful attributes of the pivot result cols derived from `sourceCol`, whose definition was set. */
    reapplyStateForSource(sourceCol: AgColumn, source: ColumnEventType): void;
}
