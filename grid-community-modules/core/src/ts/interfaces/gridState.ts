import { RowPosition } from "../entities/rowPositionUtils";
import { SortModelItem } from "../sortController";
import { AdvancedFilterModel } from "./advancedFilterModel";
import { FilterModel } from "./iFilter";
import { CellRangeType } from "./IRangeService";
import { ServerSideRowGroupSelectionState, RowSelectionState } from "./selectionState";

export interface FilterState { 
    filterModel?: FilterModel
    advancedFilterModel?: AdvancedFilterModel;
};

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

export interface SideBarState {
    /** Is side bar visible */
    visible: boolean;
    position: 'left' | 'right';
    /** Open tool panel, or null if closed */
    openToolPanel: string | null;
}

export interface FocusedCellState extends RowPosition {
    colId: string;
}

export interface PaginationState {
    /** Current page */
    page: number;
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
    colId: string,
    /** Only named aggregation functions can be used in state */
    aggFunc: string
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
    aggregation?: AggregationState;
    columnGroup?: ColumnGroupState;
    columnOrder?: ColumnOrderState;
    columnPinning?: ColumnPinningState;
    columnSizing?: ColumnSizingState;
    columnVisibility?: ColumnVisibilityState;
    filter?: FilterState;
    /** Client-Side Row Model only */
    focusedCell?: FocusedCellState;
    pagination?: PaginationState;
    pivot?: PivotState;
    rangeSelection?: RangeSelectionState;
    rowGroup?: RowGroupState;
    rowGroupExpansion?: RowGroupExpansionState;
    rowSelection?: RowSelectionState | ServerSideRowGroupSelectionState;
    /** Client-Side Row Model only */
    scroll?: ScrollState;
    sideBar?: SideBarState;
    sort?: SortState;
}
