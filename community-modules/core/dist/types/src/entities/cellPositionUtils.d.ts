import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { Column } from '../interfaces/iColumn';
import type { RowPosition } from './rowPositionUtils';
export interface CellPosition extends RowPosition {
    /** The grid column */
    column: Column;
}
export declare class CellPositionUtils extends BeanStub implements NamedBean {
    beanName: "cellPositionUtils";
    createId(cellPosition: CellPosition): string;
    createIdFromValues(cellPosition: CellPosition): string;
    equals(cellA: CellPosition, cellB: CellPosition): boolean;
}
