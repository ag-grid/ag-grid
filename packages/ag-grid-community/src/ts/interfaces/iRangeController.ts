import {Column} from "../entities/column";
import {CellPosition} from "../entities/cellPosition";
import {GridPanel} from "../gridPanel/gridPanel";
import {RowPosition} from "../entities/rowPosition";

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

export interface CellRange {
    startRow: RowPosition;
    endRow: RowPosition;
    columns: Column[]
}

/** @deprecated */
// instead of this, we now use CellRange
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
