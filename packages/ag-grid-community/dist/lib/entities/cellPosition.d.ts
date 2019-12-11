import { Column } from "./column";
import { RowPosition } from "./rowPosition";
export interface CellPosition extends RowPosition {
    column: Column;
}
export declare class CellPositionUtils {
    createId(cellPosition: CellPosition): string;
    createIdFromValues(rowIndex: number, column: Column, rowPinned: string | undefined): string;
    equals(cellA: CellPosition, cellB: CellPosition): boolean;
}
