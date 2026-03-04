import type { RowNode } from '../entities/rowNode';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class ChangedRowNodes<TData = any> {
    public reordered = false;
    public readonly removals: RowNode<TData>[] = [];
    public readonly updates = new Set<RowNode<TData>>();
    public readonly adds = new Set<RowNode<TData>>();
}
