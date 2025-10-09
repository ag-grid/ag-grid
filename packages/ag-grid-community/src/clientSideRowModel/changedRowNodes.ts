import type { RowNode } from '../entities/rowNode';

export class ChangedRowNodes<TData = any> {
    public reordered = false;
    public readonly removals = new Set<RowNode<TData>>();
    public readonly updates = new Set<RowNode<TData>>();
    public readonly adds = new Set<RowNode<TData>>();

    /** Marks a row as removed.*/
    public remove(node: RowNode<TData>): void {
        if (!this.adds.delete(node)) {
            this.updates.delete(node);
            this.removals.add(node);
        }
    }
}
