import type { BeanCollection, RowNode } from 'ag-grid-community';
import { _removeFromArray } from 'ag-grid-community';

export class PinnedRows {
    /** Canonical set of pinned nodes */
    private all = new Set<RowNode>();
    /**
     * Set of nodes that should currently be visible given the context of the grid.
     * This is currently used for hiding leaf nodes in pivot mode and filtered nodes.
     */
    private visible = new Set<RowNode>();
    /** Ordering of nodes in the pinned area */
    private order: RowNode[] = [];
    /** IDs of nodes that need to be pinned once they are available from the row model (SSRM) */
    private queued = new Set<string>();

    constructor(private readonly beans: BeanCollection) {}

    public size(): number {
        return this.visible.size;
    }

    public add(item: RowNode): void {
        const { all, visible, order } = this;
        all.add(item);
        visible.add(item);
        order.push(item);
        this.sort();
    }

    public delete(item: RowNode): void {
        this.all.delete(item);
        this.visible.delete(item);
        _removeFromArray(this.order, item);
    }

    public has(item: RowNode): boolean {
        return this.visible.has(item);
    }

    public forEach(fn: (node: RowNode, i: number) => void): void {
        this.order.forEach(fn);
    }

    public getByIndex(i: number): RowNode | undefined {
        return this.order[i];
    }

    public getById(id: string): RowNode | undefined {
        for (const node of this.visible) {
            if (node.id == id) return node;
        }
    }

    public clear(): void {
        const { all, visible, order } = this;
        all.clear();
        visible.clear();
        order.length = 0;
    }

    public sort(): void {
        const { sortSvc, rowNodeSorter } = this.beans;
        const sortOptions = sortSvc?.getSortOptions() ?? [];
        this.order = rowNodeSorter?.doFullSort(this.order, sortOptions) ?? this.order;
    }

    public hide(shouldHide: (node: RowNode) => boolean): void {
        const { all, visible } = this;
        all.forEach((node) => (shouldHide(node) ? visible.delete(node) : visible.add(node)));
        this.order = Array.from(visible);
        this.sort();
    }

    public queue(id: string): void {
        this.queued.add(id);
    }

    public unqueue(id: string): void {
        this.queued.delete(id);
    }

    public forEachQueued(fn: (id: string) => void): void {
        this.queued.forEach(fn);
    }
}

export function _isDisplayedAfterFilter(node: RowNode): boolean {
    if (node.level === -1) return true;

    const parent = node.parent;

    if (parent?.childrenAfterSort?.some((child) => child == node)) {
        return _isDisplayedAfterFilter(parent);
    }

    return false;
}
