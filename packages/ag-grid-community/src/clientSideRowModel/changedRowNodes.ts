import type { RowNode } from '../entities/rowNode';
import type { IRowNode } from '../interfaces/iRowNode';

export class ChangedRowNodes<TData = any> {
    public readonly removals = new Set<RowNode<TData>>();
    public readonly updates = new Set<RowNode<TData>>();
    public readonly adds = new Set<RowNode<TData>>();

    /** Marks a row as removed. Order of operations is: remove, update, add */
    public remove(node: IRowNode<TData>): void {
        if (!this.adds.delete(node as RowNode<TData>)) {
            this.updates.delete(node as RowNode<TData>);
            this.removals.add(node as RowNode<TData>);
        }
    }
}
