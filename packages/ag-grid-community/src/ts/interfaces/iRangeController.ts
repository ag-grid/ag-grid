import { Column } from "../entities/column";
import { GridCell } from "../entities/gridCell";
import { GridPanel } from "../gridPanel/gridPanel";

export interface IRangeController {
    clearSelection(): void;
    getCellRangeCount(cell: GridCell): number;
    isCellInAnyRange(cell: GridCell): boolean;
    isCellInSpecificRange(cell: GridCell, range: CellRange): boolean;
    isMoreThanOneCell(): boolean;
    onDragStart(mouseEvent: MouseEvent): void;
    onDragStop(): void;
    onDragging(mouseEvent: MouseEvent): void;
    getCellRanges(): CellRange[] | null;
    setRangeToCell(cell: GridCell, appendRange?: boolean): void;
    setRange(rangeSelection: AddRangeSelectionParams): void;
    addRange(rangeSelection: AddRangeSelectionParams): void;
    extendLatestRangeInDirection(key: number): GridCell | undefined;
    extendLatestRangeToCell(cell: GridCell): void;
    registerGridComp(gridPanel: GridPanel): void;
}

export interface RowPosition {
    index: number,
    floating: string
}

export interface CellRange {
    startRow: RowPosition;
    endRow: RowPosition;
    columns: Column[]
}

// DEPRECATED
export interface RangeSelection {
    start: GridCell;
    end: GridCell;
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
