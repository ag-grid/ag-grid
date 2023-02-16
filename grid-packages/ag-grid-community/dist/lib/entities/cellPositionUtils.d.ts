import { BeanStub } from "../context/beanStub";
import { Column } from "./column";
import { RowPosition } from "./rowPositionUtils";
export interface CellPosition extends RowPosition {
    /** The grid column */
    column: Column;
}
export declare class CellPositionUtils extends BeanStub {
    createId(cellPosition: CellPosition): string;
    createIdFromValues(cellPosition: CellPosition): string;
    equals(cellA: CellPosition, cellB: CellPosition): boolean;
}
