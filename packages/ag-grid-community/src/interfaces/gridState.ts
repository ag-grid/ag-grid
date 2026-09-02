import type { ColDef } from '../entities/colDef';
import type { ShowValuesAs, ShowValuesAsType } from '../entities/colDef-showValuesAs';
import type { CellRangeType } from './IRangeService';
import type { AdvancedFilterModel } from './advancedFilterModel';
import type { RowGroupBulkExpansionState, RowGroupExpansionState } from './iExpansionService';
import type { ColumnFilterState, FilterModel } from './iFilter';
import type { RowPosition } from './iRowPosition';
import type { SortDirection } from './iSort';
import type { SortModelItem } from './iSortModelItem';
import type { ServerSideRowGroupSelectionState, ServerSideRowSelectionState } from './selectionState';

/**
 * Currently selected filters when using the new filter tool panel with `agSelectableColumnFilter`, keyed by column id.
 */
export interface SelectableFilterState {
    [colId: string]: number;
}

export interface FilterState {
    /**
     * Filter model for Column Filters
     */
    filterModel?: FilterModel;
    /**
     * State for Column Filters
     */
    columnFilterState?: ColumnFilterState;
    /**
     * Filter model for Advanced Filter
     */
    advancedFilterModel?: AdvancedFilterModel;
    /**
     * Currently selected filter when using new filter tool panel with `agSelectableColumnFilter`
     */
    selectableFilters?: SelectableFilterState;
}

/**
 * Find state. Works for Client-Side Row Model only.
 */
export interface FindState {
    /** Current search value */
    searchValue?: string;
    /** The number of the active match within all the matches in the grid (starting from `1`) */
    activeMatch?: number;
}

export interface CellSelectionCellState {
    id?: string;
    type?: CellRangeType;
    /** The start row of the range */
    startRow?: RowPosition;
    /** The end row of the range */
    endRow?: RowPosition;
    /** The columns in the range */
    colIds: string[];
    /** The start column for the range */
    startColId: string;
}

/** @deprecated v32.2 Use `CellSelectionCellState` instead. */
export interface RangeSelectionCellState extends CellSelectionCellState {}

export interface CellSelectionState {
    cellRanges: CellSelectionCellState[];
}

/** @deprecated v32.2 Use `CellSelectionState` instead. */
export interface RangeSelectionState {
    cellRanges: RangeSelectionCellState[];
}

export interface ScrollState {
    top: number;
    left: number;
}

export interface FiltersToolPanelState {
    expandedGroupIds: string[];
    expandedColIds: string[];
}

export interface ColumnToolPanelState {
    expandedGroupIds: string[];
}

export interface NewFiltersToolPanelFilterState {
    colId: string;
    expanded?: boolean;
}

export interface NewFiltersToolPanelState {
    /** Ordered list of filters and their expansion state */
    filters?: NewFiltersToolPanelFilterState[];
}

export interface SideBarState {
    /** Is side bar visible */
    visible: boolean;
    position: 'left' | 'right';
    /** Open tool panel, or null if closed */
    openToolPanel: string | null;
    /** State for each tool panel */
    toolPanels: {
        [id: string]: any;
    };
}

export interface FocusedCellState extends RowPosition {
    colId: string;
}

export interface PaginationState {
    /** Current page */
    page?: number;
    /** Current page size. Only use when the pageSizeSelector dropdown is visible */
    pageSize?: number;
}

export interface SortState {
    /** Sorted columns and directions in order */
    sortModel: SortModelItem[];
}

export interface RowGroupState {
    /** Grouped columns in order */
    groupColIds: string[];
}

export interface AggregationColumnState {
    colId: string;
    /** Only named aggregation functions can be used in state */
    aggFunc: string;
}

export interface AggregationState {
    aggregationModel: AggregationColumnState[];
}

export interface ShowValuesAsColumnState {
    colId: string;
    /** The "Show Values As" mode: a mode name, or the object form (`{ type, params?, precision? }`) */
    showValuesAs: ShowValuesAsType | ShowValuesAs;
}

export interface ShowValuesAsState {
    showValuesAsModel: ShowValuesAsColumnState[];
}

export interface PivotSortModelItem {
    colId: string;
    /** Direction the pivot column's labels are ordered in. `null` keeps the generated (natural) order */
    sort: SortDirection;
}

export interface PivotState {
    pivotMode: boolean;
    pivotColIds: string[];
    /** Pivot label sort direction of each pivot column */
    pivotSortModel?: PivotSortModelItem[];
}

export interface ColumnPinningState {
    leftColIds: string[];
    rightColIds: string[];
}

export interface ColumnVisibilityState {
    hiddenColIds: string[];
}

export interface ColumnSizeState {
    colId: string;
    width?: number;
    flex?: number;
}

export interface ColumnSizingState {
    columnSizingModel: ColumnSizeState[];
}

export interface ColumnOrderState {
    /** All colIds in order */
    orderedColIds: string[];
}

export interface ColumnGroupHeaderNameState {
    groupId: string;
    headerName: string;
}

export interface ColumnGroupState {
    openColumnGroupIds: string[];
    /** User-edited group header names, keyed by group id. */
    headerNames?: ColumnGroupHeaderNameState[];
}

/**
 * The `ColDef` properties a user can configure through the grid's own UI, and so the only ones the
 * `userColumns` state section carries. UI that creates or edits columns extends this union as it gains
 * settings; everything else stays with `columnDefs` and the other state sections.
 */
export type UserColumnPropertyKey = 'calculatedExpression' | 'cellDataType' | 'columnGroupShow' | 'headerName';

/** One `ColDef` property the user configured, as a name/value pair. The value is typed by the property it
 *  names, so an entry cannot pair a property with a value the definition would reject. */
export type UserColumnProperty = {
    [K in UserColumnPropertyKey]: { property: K; value: ColDef[K] };
}[UserColumnPropertyKey];

export interface UserColumnState {
    colId: string;
    /** The user created this column; it exists only because of this entry. Without it the entry describes
     *  changes to a column declared in `columnDefs`, which the developer owns the existence of. */
    created?: boolean;
    /** `groupId` of the containing column group; absent or `null` places the column at the top level. */
    parentGroupId?: string | null;
    /** The column definition properties the user configured. Absent when `removed` is set. */
    properties?: UserColumnProperty[];
    /** The user removed a column declared in `columnDefs`; it stays removed across restores. */
    removed?: boolean;
}

export interface ColumnHeaderNameColumnState {
    colId: string;
    headerName: string;
}

export interface ColumnHeaderNameState {
    /** User-edited column header names, keyed by column id. */
    columnHeaderNames: ColumnHeaderNameColumnState[];
}

export interface RowPinningState {
    /** Row IDs of rows pinned to the top container */
    top: string[];
    /** Row IDs of rows pinned to the bottom container */
    bottom: string[];
}

export interface GridState {
    /** Grid version number */
    version?: string;
    /** Includes aggregation functions (column state) */
    aggregation?: AggregationState;
    /** Includes opened groups */
    columnGroup?: ColumnGroupState;
    /** Includes column ordering (column state) */
    columnOrder?: ColumnOrderState;
    /** Includes left/right pinned columns (column state) */
    columnPinning?: ColumnPinningState;
    /** Includes column width/flex (column state) */
    columnSizing?: ColumnSizingState;
    /** Includes hidden columns (column state) */
    columnVisibility?: ColumnVisibilityState;
    /** Includes user-edited column header names (column state) */
    columnHeaderName?: ColumnHeaderNameState;
    /** Includes Column Filters and Advanced Filter */
    filter?: FilterState;
    /** Includes the Find search value and active match. Works for Client-Side Row Model only */
    find?: FindState;
    /** Includes currently focused cell. Works for Client-Side Row Model only */
    focusedCell?: FocusedCellState;
    /** Includes current page */
    pagination?: PaginationState;
    /** Includes currently manually pinned rows */
    rowPinning?: RowPinningState;
    /** Includes current pivot mode and pivot columns (column state) */
    pivot?: PivotState;
    /** Includes currently selected cell ranges */
    cellSelection?: CellSelectionState;
    /**
     * Includes currently selected cell ranges
     * @deprecated v32.2 Use `cellSelection` instead.
     */
    rangeSelection?: RangeSelectionState;
    /** Includes current row group columns (column state) */
    rowGroup?: RowGroupState;
    /** Includes currently expanded group rows */
    rowGroupExpansion?: RowGroupExpansionState;
    /** Includes currently expanded group rows when using ssrmExpandAllAffectsAllRows */
    ssrmRowGroupExpansion?: RowGroupExpansionState | RowGroupBulkExpansionState;
    /**
     * Includes currently selected rows.
     * For Server-Side Row Model, will be `ServerSideRowSelectionState | ServerSideRowGroupSelectionState`,
     * for other row models, will be an array of row IDs.
     * Can only be set for Client-Side Row Model and Server-Side Row Model.
     */
    rowSelection?: string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState;
    /** Includes current scroll position. Works for Client-Side Row Model only */
    scroll?: ScrollState;
    /** Includes current Side Bar positioning and opened tool panel */
    sideBar?: SideBarState;
    /** Includes current sort columns and direction (column state) */
    sort?: SortState;
    /** Includes the per-column "Show Values As" mode (column state) */
    showValuesAs?: ShowValuesAsState;
    /**
     * Includes columns the user created at runtime (e.g. via the Calculated Column dialog), and the
     * properties the user changed on or removals of columns declared in `columnDefs`. Unlike the other
     * sections, which configure existing columns, this section can create and remove them.
     */
    userColumns?: UserColumnState[];
    /**
     * When providing a partial `initialState` with some but not all column state properties, set this to `true`.
     * This controls which top-level sections are supplied, not whether a section may itself be partial:
     * any section you provide must match its documented shape.
     * Not required if passing the whole state object retrieved from the grid.
     * Not used for `api.setState()`, as that instead takes a second argument of properties to ignore.
     */
    partialColumnState?: boolean;
}

export type GridStateKey = Exclude<keyof GridState, 'version' | 'partialColumnState' | 'rangeSelection'>;
