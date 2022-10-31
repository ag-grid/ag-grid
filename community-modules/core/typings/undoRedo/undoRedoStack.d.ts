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
export declare class RangeUndoRedoAction extends UndoRedoAction {
    readonly initialRange?: CellRange | undefined;
    readonly finalRange?: CellRange | undefined;
    readonly ranges?: CellRange[] | undefined;
    constructor(cellValueChanges: CellValueChange[], initialRange?: CellRange | undefined, finalRange?: CellRange | undefined, ranges?: CellRange[] | undefined);
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
