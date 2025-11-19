import type { RowsDrop } from '../dragAndDrop/rowDragTypes';
import type { IRowNode } from './iRowNode';

export interface IGroupEditService {
    canSetParent(rowsDrop: RowsDrop): boolean;
    isGroupingDrop(rowsDrop: RowsDrop): boolean;
    groupingEditDrop(rowsDrop: RowsDrop): boolean;
    canDropRow(row: IRowNode, rowsDrop: RowsDrop): boolean;
    canDropStartGroup(target: IRowNode | null | undefined): boolean;
    fixRowsDrop(rowsDrop: RowsDrop, canSetParent: boolean, moving: boolean, yDelta: number): void;
    resetRowDrag(): void;
}
