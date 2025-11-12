import type { RowsDrop } from '../dragAndDrop/rowDragTypes';

export interface IGroupEditService {
    shouldHandleManagedRowMove<TData = any, TContext = any>(rowsDrop: RowsDrop<TData, TContext>): boolean;
    canSetManagedParent<TData = any, TContext = any>(rowsDrop: RowsDrop<TData, TContext>): boolean;
    moveRowsWithGroupEdit<TData = any, TContext = any>(rowsDrop: RowsDrop<TData, TContext>): boolean;
}
