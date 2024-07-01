import type { RowPosition } from '../entities/rowPositionUtils';
import type { SortModelItem } from '../sortController';
import type { CellRangeType } from './IRangeService';
import type { AdvancedFilterModel } from './advancedFilterModel';
import type { FilterModel } from './iFilter';
import type { ServerSideRowGroupSelectionState, ServerSideRowSelectionState } from './selectionState';
export interface FilterState {
    filterModel?: FilterModel;
    advancedFilterModel?: AdvancedFilterModel;
}
export interface RangeSelectionCellState {
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
export interface PivotState {
    pivotMode: boolean;
    pivotColIds: string[];
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
export interface ColumnGroupState {
    openColumnGroupIds: string[];
}
export interface RowGroupExpansionState {
    expandedRowGroupIds: string[];
}
export interface GridState {
    /** Includes aggregation functions */
    aggregation?: AggregationState;
    /** Includes opened groups */
    columnGroup?: ColumnGroupState;
    /** Includes column ordering */
    columnOrder?: ColumnOrderState;
    /** Includes left/right pinned columns */
    columnPinning?: ColumnPinningState;
    /** Includes column width/flex */
    columnSizing?: ColumnSizingState;
    /** Includes hidden columns */
    columnVisibility?: ColumnVisibilityState;
    /** Includes Column Filters and Advanced Filter */
    filter?: FilterState;
    /** Includes currently focused cell. Works for Client-Side Row Model only */
    focusedCell?: FocusedCellState;
    /** Includes current page */
    pagination?: PaginationState;
    /** Includes current pivot mode and pivot columns */
    pivot?: PivotState;
    /** Includes currently selected cell ranges */
    rangeSelection?: RangeSelectionState;
    /** Includes current row group columns */
    rowGroup?: RowGroupState;
    /** Includes currently expanded group rows */
    rowGroupExpansion?: RowGroupExpansionState;
    /**
     * Includes currently selected rows.
     * For Server-Side Row Model, will be `ServerSideRowSelectionState | ServerSideRowGroupSelectionState`,
     * for other row models, will be an array of row IDs
     */
    rowSelection?: string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState;
    /** Includes current scroll position. Works for Client-Side Row Model only */
    scroll?: ScrollState;
    /** Includes current Side Bar positioning and opened tool panel */
    sideBar?: SideBarState;
    /** Includes current sort columns and direction */
    sort?: SortState;
}
