import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef, ColKey } from '../entities/colDef';
import type { ColumnEventType } from '../events';

/** Owns pivot result column lifecycle (create/retain/teardown).
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IPivotResultColsService {
    /** Generated pivot result leaf columns. Null when not pivoting. */
    readonly pivotCols: AgColumn[] | null;

    /** Balanced-tree wrappers around `pivotCols`. Empty when not pivoting. */
    readonly pivotTree: (AgColumn | AgProvidedColumnGroup)[];

    /** Tree depth of `pivotTree` (max group nesting). */
    readonly pivotTreeDepth: number;

    /** True iff any `pivotTree` group has `marryChildren`.
     *  Feeds `ColumnModel.hasMarryChildren` while pivoting. */
    readonly pivotHasMarryChildren: boolean;

    /** Non-padding `pivotTree` groups keyed by `groupId`.
     *  Feeds `ColumnModel.colsGroupsById` while pivoting. */
    readonly pivotGroupsById: Map<string, AgProvidedColumnGroup>;

    /** Flat list of all `pivotTree` groups (padding and non-padding).
     *  Feeds `ColumnModel.colsAllGroups` while pivoting. */
    readonly pivotAllGroups: AgProvidedColumnGroup[];

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

    /** Rebuild `colDef`s for pivot result cols whose `pivotValueColumn` is `sourceCol` via reverse-map lookup.
     *  No-op when not pivoting. */
    recreateColDefsForSource(sourceCol: AgColumn, source: ColumnEventType): void;
}
