import type { AgColumn } from '../entities/agColumn';
import type { ColumnEventType } from '../events';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IAutoColService {
    /** Generated auto-group columns. Flat-array — empty when no auto-cols are active. */
    columns: AgColumn[];

    /** Sync internal cols against current row-group state. */
    refreshCols(source: ColumnEventType): AgColumn[] | null;

    /** Whether the next `refreshCols` keeps `col`, one of `columns`, once the row grouping holds `rowGroupCols`. */
    isColKept(col: AgColumn, rowGroupCols: ReadonlySet<AgColumn>): boolean;

    /** The group column `colId` the build grouping `rowGroupCols` gets, made ahead of its `refreshCols`, which takes
     *  it; `null` when the build gets none. */
    getColForBuild(colId: string, rowGroupCols: ReadonlySet<AgColumn>): AgColumn | null;

    /** Re-derives the multi auto col of `column`, whose header name it copies, after `column` was renamed. */
    onHeaderNameChanged(column: AgColumn, source: ColumnEventType): void;

    /** Re-derives the auto cols from a new `autoGroupColumnDef`. */
    applyAutoGroupColumnDef(source: ColumnEventType): void;

    /** Shows or hides the auto cols hidden until their group is expanded. Called by the client-side row model in a
     *  column update before each `modelUpdated` it raises, and by the column model when
     *  `groupHideColumnsUntilExpanded` changes. */
    updateColumnVisibility(): void;
}
