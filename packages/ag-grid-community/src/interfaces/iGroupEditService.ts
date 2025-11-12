import type { RowsDrop } from '../dragAndDrop/rowDragTypes';
import type { IRowNode } from './iRowNode';

export interface IGroupEditService {
    wouldCycle(row: IRowNode, newParent: IRowNode | null | undefined): boolean;
    canSetParent(rowsDrop: RowsDrop): boolean;
    isGroupingDrop(rowsDrop: RowsDrop): boolean;
    groupingEditDrop(rowsDrop: RowsDrop): boolean;
}
