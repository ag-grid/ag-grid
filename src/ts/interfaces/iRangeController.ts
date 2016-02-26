import Column from "../entities/column";
import {ColDef} from "../entities/colDef";

export interface IRangeController {
    clearSelection(): void;
    getCellRangeCount(rowIndex: number, column: Column): number;
    isCellInRange(rowIndex: number, column: Column): boolean;
    onDragStart(mouseEvent: MouseEvent): void;
    onDragStop(): void;
    onDragging(mouseEvent: MouseEvent): void;
    getCellRanges(): RangeSelection[];
    setRangeToCell(rowIndex: number, column: Column): void;
    setRange(rangeSelection: AddRangeSelectionParams): void;
    addRange(rangeSelection: AddRangeSelectionParams): void;
}

export interface RangeSelection {
    rowStart: number,
    rowEnd: number,
    columnStart: Column,
    columnEnd: Column,
    columns: Column[]
}

export interface AddRangeSelectionParams {
    rowStart: number,
    rowEnd: number,
    columnStart: Column|ColDef|string,
    columnEnd: Column|ColDef|string
}
