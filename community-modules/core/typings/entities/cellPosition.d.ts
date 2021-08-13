import { BeanStub } from "../context/beanStub";
import { Column } from "./column";
import { RowPosition } from "./rowPosition";
export interface CellPosition extends RowPosition {
    /** The grid column */
    column: Column;
}
export declare class CellPositionUtils extends BeanStub {
    createId(cellPosition: CellPosition): string;
    createIdFromValues(rowIndex: number, column: Column, rowPinned: string | undefined | null): string;
    equals(cellA: CellPosition, cellB: CellPosition): boolean;
}
