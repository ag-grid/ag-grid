import type { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { IRowNode } from './iRowNode';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IAutoColService {
    /** Generated auto-group columns. Flat-array — empty when no auto-cols are active. */
    columns: AgColumn[];

    /** Sync internal cols against current row-group state. */
    refreshCols(source: ColumnEventType): AgColumn[] | null;

    /** Whether the next `refreshCols` keeps `col`, one of `columns`, once the row grouping holds `rowGroupCols`. */
    isColKept(col: AgColumn, rowGroupCols: ReadonlySet<AgColumn>): boolean;

    /** Re-derives the multi auto col of `column`, whose header name it copies, after `column` was renamed. */
    onHeaderNameChanged(column: AgColumn, source: ColumnEventType): void;

    /** Redefines the auto cols from a new `autoGroupColumnDef`; the rows follow its new comparator or filter params. */
    applyAutoGroupColumnDef(source: ColumnEventType): void;

    /** Applies the state the auto cols' definitions hold (width, sort, pinning), once the call's columns are final. */
    applyColDefState(source: ColumnEventType): void;

    /** Whether auto cols are hidden until their group is expanded: a rows refresh may show or hide some. */
    isHidingUntilExpanded(): boolean;

    /** Shows the auto cols the rows expand to, every one without `groupHideColumnsUntilExpanded`; call in a column
     *  update. */
    updateColumnVisibility(): void;

    getTooltipColDef(column: AgColumn, node: IRowNode): ColDef;
}
