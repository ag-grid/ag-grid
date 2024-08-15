import type { IRowNode } from './iRowNode';

export interface RowNodeTransaction<TData = any> {
    /** Row nodes added */
    add: IRowNode<TData>[];
    /** Row nodes removed */
    remove: IRowNode<TData>[];
    /** Row nodes updated */
    update: IRowNode<TData>[];
    /** Is true if update caused node to be moved or new nodes are added */
    orderChanged: boolean;
}
