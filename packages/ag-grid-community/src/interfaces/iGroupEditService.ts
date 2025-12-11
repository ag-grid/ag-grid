import type { RowsDrop } from '../dragAndDrop/rowDragTypes';
import type { IRowNode } from './iRowNode';

export interface IGroupEditService {
    canSetParent(rowsDrop: RowsDrop): boolean;
    isGroupingDrop(rowsDrop: RowsDrop): boolean;
    dropGroupEdit(rowsDrop: RowsDrop): boolean;
    canDropRow(row: IRowNode, rowsDrop: RowsDrop): boolean;
    canDropStartGroup(target: IRowNode | null | undefined): boolean;
    fixRowsDrop(rowsDrop: RowsDrop, canSetParent: boolean, moving: boolean, yDelta: number): void;
    stopDragging(final: boolean): void;
    csrmFirstLeaf(parent: IRowNode | null): IRowNode | null;
    clearNewSameParent(rowsDrop: RowsDrop, canSetParent: boolean): void;
}
