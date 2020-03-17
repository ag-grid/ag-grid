import { CellRange } from "../interfaces/iRangeController";
export interface CellValueChange {
    rowPinned?: string;
    rowIndex: number;
    columnId: string;
    oldValue: any;
    newValue: any;
}
export interface LastFocusedCell {
    rowPinned?: string;
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
    pop(): UndoRedoAction;
    push(item: UndoRedoAction): void;
    clear(): void;
}
