// Type definitions for ag-grid v5.0.6
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Column } from "../entities/column";
import { ColDef } from "../entities/colDef";
import { GridCell } from "../entities/gridCell";
export interface IRangeController {
    clearSelection(): void;
    getCellRangeCount(cell: GridCell): number;
    isCellInAnyRange(cell: GridCell): boolean;
    onDragStart(mouseEvent: MouseEvent): void;
    onDragStop(): void;
    onDragging(mouseEvent: MouseEvent): void;
    getCellRanges(): RangeSelection[];
    setRangeToCell(cell: GridCell): void;
    setRange(rangeSelection: AddRangeSelectionParams): void;
    addRange(rangeSelection: AddRangeSelectionParams): void;
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
    columnStart: Column | ColDef | string;
    columnEnd: Column | ColDef | string;
}
