import type { RowsDrop } from '../dragAndDrop/rowDragTypes';
import type { IRowNode } from './iRowNode';

export interface IGroupEditService {
    wouldCycle(row: IRowNode, newParent: IRowNode | null | undefined): boolean;
    shouldHandleManagedRowMove<TData = any, TContext = any>(rowsDrop: RowsDrop<TData, TContext>): boolean;
    canSetParent<TData = any, TContext = any>(rowsDrop: RowsDrop<TData, TContext>): boolean;
    moveRowsWithGroupEdit<TData = any, TContext = any>(rowsDrop: RowsDrop<TData, TContext>): boolean;
}
