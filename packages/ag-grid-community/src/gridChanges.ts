import type { ColumnStateChanges } from './columns/columnStateUtils';
import type { GridOptions } from './entities/gridOptions';
import type { ColumnEventType } from './events';
import type { RefreshModelParams } from './interfaces/iClientSideRowModel';

/** What changed that the rows have not followed: each rows refresh takes it whole, leaving a new one.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class RowChanges {
    // The columns the rows read: see isColumnsChange.
    public columnsLoaded = false;
    public rowGroups = false;
    public values = false;
    public pivot = false;
    /** The source of the latest pivot change, or of the value column rename re-deriving the pivot result columns. */
    public pivotSource: ColumnEventType = 'api';
    /** A value column feeding the generated pivot result columns was renamed: their definitions are re-derived. */
    public pivotResultNames = false;
    public pivotMode = false;

    // What else owes the rows a refresh.
    /** Any `filterChanged`, a filter refreshed after a data change too. */
    public filter = false;
    /** A filter change other than a refresh after a data change. */
    public filterModel = false;
    /** A primary column or the quick filter changed, not only pivot result column filters. */
    public primaryFilter = false;
    public sort = false;
    /** A string comparator a sort may use changed, the sort model staying: client-side sorted rows re-sort. */
    public sortComparators = false;
    /** The step and changed options of the client-side refreshes asked inside the update, run at its end. */
    public rows: RefreshModelParams | null = null;
    /** A state change's `columnMoved`, raised after the refresh rebuilding the pivot result columns. */
    public columnsMoved: { source: ColumnEventType; changes: ColumnStateChanges } | null = null;

    // What owes the rows nothing: the filters follow it before the rows refresh.
    /** Columns were shown or hidden: the advanced filter re-checks those it names, the quick filter those it reads. */
    public columnsVisible = false;
    /** The columns waiting for row data took their inferred data types: the filters waiting for them are built. */
    public dataTypesInferred = false;

    /** Whether the rows read different columns: loaded, regrouped, revalued or repivoted. */
    public isColumnsChange(): boolean {
        return (
            this.columnsLoaded || this.rowGroups || this.values || this.pivot || this.pivotMode || this.pivotResultNames
        );
    }

    /** Whether the rows owe a refresh: something they read changed. */
    public isRowsRefreshOwed(): boolean {
        return this.isColumnsChange() || this.filter || this.sort || this.sortComparators || this.rows !== null;
    }

    /** Whether a flush has a reader to tell: the rows or the filters. */
    public isFlushOwed(): boolean {
        return this.isRowsRefreshOwed() || this.columnsVisible || this.dataTypesInferred;
    }
}

/** What changed that the header cells have not followed, as bits. A changed column marks itself too. */
export type HeaderChanges = number;

/** The rows regrouped, revalued or repivoted, or `treeData` changed: the header names may differ. */
export const HEADER_CHANGE_FLAG_DISPLAY_NAMES = 0x00000001;
export const HEADER_CHANGE_FLAG_SORT = 0x00000002;
/** A show-values mode, the grouping it applies to or the pivot changed: the header cells' indicators follow. */
export const HEADER_CHANGE_FLAG_SHOW_VALUES_AS = 0x00000004;
/** A column was renamed, redefined or given another formula reference. */
export const HEADER_CHANGE_FLAG_COL_DEFS = 0x00000008;
/** A column's header name override changed: the group header cells follow, as their names may read it. */
export const HEADER_CHANGE_FLAG_HEADER_NAME_OVERRIDE = 0x00000010;
/** `suppressHeaderFocus` changed: the header rows and cells enter or leave the tab order. */
export const HEADER_CHANGE_FLAG_SUPPRESS_HEADER_FOCUS = 0x00000020;
/** An option the column header cells draw changed; the floating filter cells follow the name it gives. */
export const HEADER_CHANGE_FLAG_COLUMN_CELL_OPTIONS = 0x00000040;
/** An option the column header cells' description and select-all checkbox follow changed. */
export const HEADER_CHANGE_FLAG_SELECTION_OPTIONS = 0x00000080;
/** An option the group header cells' height, selection and moving follow changed. */
export const HEADER_CHANGE_FLAG_GROUP_CELL_OPTIONS = 0x00000100;
/** `enableAdvancedFilter` changed: the floating filter row comes or goes and the column header cells redraw. */
export const HEADER_CHANGE_FLAG_ENABLE_ADVANCED_FILTER = 0x00000200;

/** The grid options the header pass applies to the header cells, each with what follows it. */
const HEADER_OPTION_CHANGES: { readonly [K in keyof GridOptions]?: HeaderChanges } = {
    suppressHeaderFocus: HEADER_CHANGE_FLAG_SUPPRESS_HEADER_FOCUS,
    suppressMovableColumns: HEADER_CHANGE_FLAG_COLUMN_CELL_OPTIONS | HEADER_CHANGE_FLAG_GROUP_CELL_OPTIONS,
    suppressMenuHide: HEADER_CHANGE_FLAG_COLUMN_CELL_OPTIONS,
    suppressAggFuncInHeader: HEADER_CHANGE_FLAG_COLUMN_CELL_OPTIONS,
    // a column header name may show its aggregation function or not
    treeData: HEADER_CHANGE_FLAG_DISPLAY_NAMES,
    cellSelection: HEADER_CHANGE_FLAG_SELECTION_OPTIONS | HEADER_CHANGE_FLAG_GROUP_CELL_OPTIONS,
    rowSelection: HEADER_CHANGE_FLAG_SELECTION_OPTIONS,
    groupHeaderHeight: HEADER_CHANGE_FLAG_GROUP_CELL_OPTIONS,
    enableAdvancedFilter: HEADER_CHANGE_FLAG_ENABLE_ADVANCED_FILTER,
};

export const HEADER_OPTIONS = Object.keys(HEADER_OPTION_CHANGES) as readonly (keyof GridOptions)[];

/** What a column update changed, kept for its whole length: the rows, the header cells and the grid state each
 *  follow their part at their own point. */
export class GridChanges {
    /** The part the next rows refresh takes. */
    public rowChanges = new RowChanges();
    /** The part the header cells take, once per update. */
    public headerChanges: HeaderChanges = 0;
    /** A value the grid state's column sections read changed: the state service reads it as the update ends. */
    public columnState = false;
    /** The column groups changed too, or a build may hold other user columns: read with the column state, only then. */
    public columnGroupState = false;

    public newColumnsLoaded(): void {
        this.rowChanges.columnsLoaded = true;
        this.columnState = true;
    }

    public rowGroupsChanged(): void {
        this.rowChanges.rowGroups = true;
        this.headerChanges |= HEADER_CHANGE_FLAG_DISPLAY_NAMES;
        this.columnState = true;
    }

    public valuesChanged(): void {
        this.rowChanges.values = true;
        this.headerChanges |= HEADER_CHANGE_FLAG_DISPLAY_NAMES;
        this.columnState = true;
    }

    public pivotChanged(source: ColumnEventType): void {
        const rowChanges = this.rowChanges;
        rowChanges.pivot = true;
        rowChanges.pivotSource = source;
        this.headerChanges |= HEADER_CHANGE_FLAG_DISPLAY_NAMES | HEADER_CHANGE_FLAG_SHOW_VALUES_AS;
        this.columnState = true;
    }

    public pivotResultNamesChanged(source: ColumnEventType): void {
        const rowChanges = this.rowChanges;
        rowChanges.pivotResultNames = true;
        rowChanges.pivotSource = source;
    }

    public pivotModeChanged(): void {
        this.rowChanges.pivotMode = true;
        this.headerChanges |= HEADER_CHANGE_FLAG_DISPLAY_NAMES | HEADER_CHANGE_FLAG_SHOW_VALUES_AS;
        this.columnState = true;
    }

    /** `modelChanged` unless a refresh after a data change, `primary` per {@link RowChanges.primaryFilter}. */
    public filterChanged(modelChanged: boolean, primary: boolean): void {
        const rowChanges = this.rowChanges;
        rowChanges.filter = true;
        rowChanges.filterModel ||= modelChanged;
        rowChanges.primaryFilter ||= primary;
    }

    public sortChanged(): void {
        this.rowChanges.sort = true;
        this.headerChanges |= HEADER_CHANGE_FLAG_SORT;
        this.columnState = true;
    }

    /** Records what the header cells follow of the grid options one options change held. */
    public headerOptionsChanged(changed: ReadonlySet<keyof GridOptions>): void {
        let headerChanges = this.headerChanges;
        for (const option of changed) {
            headerChanges |= HEADER_OPTION_CHANGES[option] ?? 0;
        }
        this.headerChanges = headerChanges;
    }

    /** Takes what the header cells have not followed; 0 when nothing changed for them. */
    public takeHeaderChanges(): HeaderChanges {
        const headerChanges = this.headerChanges;
        this.headerChanges = 0;
        return headerChanges;
    }
}
