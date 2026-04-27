import type { RowsDrop } from '../dragAndDrop/rowDragTypes';
import type { IRowNode } from './iRowNode';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IGroupEditService {
    canSetParent(rowsDrop: RowsDrop): boolean;
    isGroupingDrop(rowsDrop: RowsDrop): boolean;
    dropGroupEdit(rowsDrop: RowsDrop): boolean;
    canDropRow(row: IRowNode, rowsDrop: RowsDrop): boolean;
    fixRowsDrop(rowsDrop: RowsDrop, canSetParent: boolean, moving: boolean, yDelta: number): void;
    stopDragging(final: boolean): void;
    csrmFirstLeaf(parent: IRowNode | null): IRowNode | null;
    clearNewSameParent(rowsDrop: RowsDrop, canSetParent: boolean): void;
}
