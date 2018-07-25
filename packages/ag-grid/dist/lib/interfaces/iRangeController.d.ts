// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
import { GridCell } from "../entities/gridCell";
import { GridPanel } from "../gridPanel/gridPanel";
export interface IRangeController {
    clearSelection(): void;
    getCellRangeCount(cell: GridCell): number;
    isCellInAnyRange(cell: GridCell): boolean;
    onDragStart(mouseEvent: MouseEvent): void;
    onDragStop(): void;
    onDragging(mouseEvent: MouseEvent): void;
    getCellRanges(): RangeSelection[];
    setRangeToCell(cell: GridCell, appendRange?: boolean): void;
    setRange(rangeSelection: AddRangeSelectionParams): void;
    addRange(rangeSelection: AddRangeSelectionParams): void;
    extendRangeInDirection(cell: GridCell, key: number): boolean;
    extendRangeToCell(cell: GridCell): void;
    registerGridComp(gridPanel: GridPanel): void;
}
export interface RangeSelection {
    start: GridCell;
    end: GridCell;
    columns: Column[];
}
export interface AddRangeSelectionParams {
    rowStart: number;
    floatingStart: string;
    rowEnd: number;
    floatingEnd: string;
    columnStart: string | Column;
    columnEnd: string | Column;
}
