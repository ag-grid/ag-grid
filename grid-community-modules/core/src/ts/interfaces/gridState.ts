import { RowPosition } from "../entities/rowPositionUtils";
import { SortModelItem } from "../sortController";
import { AdvancedFilterModel } from "./advancedFilterModel";
import { FilterModel } from "./iFilter";
import { CellRangeType } from "./IRangeService";

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
    visible: boolean;
    position: 'left' | 'right';
    openToolPanel: string | null;
}

export interface FocusedCellState extends RowPosition {
    colId: string;
}

export interface PaginationState {
    page: number;
}

export interface SortState {
    sortColumns: SortModelItem[];
}

export interface RowGroupState {
    groupColumns: string[];
}

export interface AggregationColumnState {
    colId: string,
    aggFunc: string
}

export interface AggregationState {
    aggregationColumns: AggregationColumnState[];
}

export interface PivotState {
    pivotMode: boolean;
    pivotColumns: string[];
}

export interface ColumnPinningState {
    leftColumns: string[];
    rightColumns: string[];
}

export interface ColumnVisibilityState {
    hiddenColumns: string[];
}

export interface ColumnSizeState {
    colId: string;
    width?: number;
    flex?: number;
}

export interface ColumnSizingState {
    columnSizes: ColumnSizeState[];
}

export interface ColumnOrderState {
    columns: string[];
}

export interface ColumnGroupState {
    openColumnGroups: string[];
}

export interface GridState {
    filter?: FilterState;
    rangeSelection?: RangeSelectionState;
    scroll?: ScrollState;
    sideBar?: SideBarState;
    focusedCell?: FocusedCellState;
    pagination?: PaginationState;
    sort?: SortState;
    rowGroup?: RowGroupState;
    aggregation?: AggregationState;
    pivot?: PivotState;
    columnPinning?: ColumnPinningState;
    columnVisibility?: ColumnVisibilityState;
    columnSizing?: ColumnSizingState;
    columnOrder?: ColumnOrderState;
    columnGroup?: ColumnGroupState;
}
