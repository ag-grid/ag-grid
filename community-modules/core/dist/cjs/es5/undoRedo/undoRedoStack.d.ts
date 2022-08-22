// Type definitions for @ag-grid-community/core v28.1.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowPinnedType } from "../entities/rowNode";
import { CellRange } from "../interfaces/IRangeService";
export interface CellValueChange {
    rowPinned: RowPinnedType;
    rowIndex: number;
    columnId: string;
    oldValue: any;
    newValue: any;
}
export interface LastFocusedCell {
    rowPinned: RowPinnedType;
    rowIndex: number;
    columnId: string;
}
export declare class UndoRedoAction {
    cellValueChanges: CellValueChange[];
    constructor(cellValueChanges: CellValueChange[]);
}
export declare class FillUndoRedoAction extends UndoRedoAction {
    initialRange: CellRange;
    finalRange: CellRange;
    constructor(cellValueChanges: CellValueChange[], initialRange: CellRange, finalRange: CellRange);
}
export declare class UndoRedoStack {
    private static DEFAULT_STACK_SIZE;
    private readonly maxStackSize;
    private actionStack;
    constructor(maxStackSize?: number);
    pop(): UndoRedoAction | undefined;
    push(item: UndoRedoAction): void;
    clear(): void;
    getCurrentStackSize(): number;
}
