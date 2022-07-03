import { CellRange } from "../interfaces/IRangeService";
export interface CellValueChange {
    rowPinned: string | null;
    rowIndex: number;
    columnId: string;
    oldValue: any;
    newValue: any;
}
export interface LastFocusedCell {
    rowPinned?: string | null;
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
