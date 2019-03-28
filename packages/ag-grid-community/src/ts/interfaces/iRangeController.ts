import { Column } from "../entities/column";
import { CellPosition } from "../entities/gridCell";
import { GridPanel } from "../gridPanel/gridPanel";
import {Constants} from "../constants";
import {_} from "../utils";

export interface IRangeController {
    clearSelection(): void;
    getCellRangeCount(cell: CellPosition): number;
    isCellInAnyRange(cell: CellPosition): boolean;
    isCellInSpecificRange(cell: CellPosition, range: CellRange): boolean;
    isMoreThanOneCell(): boolean;
    onDragStart(mouseEvent: MouseEvent): void;
    onDragStop(): void;
    onDragging(mouseEvent: MouseEvent): void;
    getCellRanges(): CellRange[] | null;
    setRangeToCell(cell: CellPosition, appendRange?: boolean): void;
    setRange(rangeSelection: AddRangeSelectionParams): void;
    addRange(rangeSelection: AddRangeSelectionParams): void;
    extendLatestRangeInDirection(key: number): CellPosition | undefined;
    extendLatestRangeToCell(cell: CellPosition): void;
    registerGridComp(gridPanel: GridPanel): void;
}

export interface RowPosition {
    rowIndex: number,
    floating: string
}

export class RowPositionUtils {

    // tests if this row selection is before the other row selection
    public static before(rowA: RowPosition, rowB: RowPosition): boolean {
        switch (rowA.floating) {
            case Constants.PINNED_TOP:
                // we we are floating top, and other isn't, then we are always before
                if (rowB.floating !== Constants.PINNED_TOP) { return true; }
                break;
            case Constants.PINNED_BOTTOM:
                // if we are floating bottom, and the other isn't, then we are never before
                if (rowB.floating !== Constants.PINNED_BOTTOM) { return false; }
                break;
            default:
                // if we are not floating, but the other one is floating...
                if (_.exists(rowB.floating)) {
                    if (rowB.floating === Constants.PINNED_TOP) {
                        // we are not floating, other is floating top, we are first
                        return false;
                    } else {
                        // we are not floating, other is floating bottom, we are always first
                        return true;
                    }
                }
                break;
        }
        return rowA.rowIndex < rowB.rowIndex;
    }
}

export interface CellRange {
    startRow: RowPosition;
    endRow: RowPosition;
    columns: Column[]
}

// DEPRECATED
export interface RangeSelection {
    start: CellPosition;
    end: CellPosition;
    columns: Column[] | null;
}

export interface AddRangeSelectionParams {
    rowStart: number;
    floatingStart: string;
    rowEnd: number;
    floatingEnd: string;
    columnStart: string | Column;
    columnEnd: string | Column;
}
