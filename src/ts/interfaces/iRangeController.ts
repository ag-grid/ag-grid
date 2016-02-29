import Column from "../entities/column";
import {ColDef} from "../entities/colDef";

export interface IRangeController {
    clearSelection(): void;
    getCellRangeCount(rowIndex: number, column: Column, floating: string): number;
    isCellInRange(rowIndex: number, column: Column, floating: string): boolean;
    onDragStart(mouseEvent: MouseEvent): void;
    onDragStop(): void;
    onDragging(mouseEvent: MouseEvent): void;
    getCellRanges(): RangeSelection[];
    setRangeToCell(rowIndex: number, column: Column, floating: string): void;
    setRange(rangeSelection: AddRangeSelectionParams): void;
    addRange(rangeSelection: AddRangeSelectionParams): void;
}

export interface RangeSelection {
    rowStart: number,
    floatingStart: string,
    rowEnd: number,
    floatingEnd: string,
    columnStart: Column,
    columnEnd: Column,
    columns: Column[]
}

export interface AddRangeSelectionParams {
    rowStart: number,
    floatingStart: string,
    rowEnd: number,
    floatingEnd: string,
    columnStart: Column|ColDef|string,
    columnEnd: Column|ColDef|string
}
