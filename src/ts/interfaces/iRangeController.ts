import Column from "../entities/column";

export interface IRangeController {
    clearSelection(): void;
    getCellRangeCount(rowIndex: number, column: Column): number;
    onDragStart(mouseEvent: MouseEvent): void;
    onDragStop(): void;
    onDragging(mouseEvent: MouseEvent): void;
    getCellRanges(): RangeSelection[];
}

export interface RangeSelection {
    rowStart: number,
    rowEnd: number,
    columnStart: Column,
    columnEnd: Column,
    columns: Column[]
}
