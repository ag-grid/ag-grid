import { RowPosition } from "../entities/rowPositionUtils";
import { CellRangeType } from "./IRangeService";

export interface FilterState { [colId: string]: any; };

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

export interface GridState {
    filter?: FilterState;
    rangeSelection?: RangeSelectionState;
    scroll?: ScrollState;
    sideBar?: SideBarState;
    focusedCell?: FocusedCellState;
    pagination?: PaginationState;
}
