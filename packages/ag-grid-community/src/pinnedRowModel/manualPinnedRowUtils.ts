import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import { _isServerSideRowModel } from '../gridOptionsUtils';
import type { RowPinnedType } from '../interfaces/iRowNode';
import { _removeFromArray } from '../utils/array';

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

    constructor(
        private readonly beans: BeanCollection,
        public readonly floating: NonNullable<RowPinnedType>
    ) {}

    public size(): number {
        return this.visible.size;
    }

    public add(node: RowNode): void {
        const { all, visible, order } = this;
        if (all.has(node)) return;
        all.add(node);
        visible.add(node);
        order.push(node);
        this.sort();
    }

    public delete(item: RowNode): void {
        this.all.delete(item);
        this.visible.delete(item);
        this.queued.delete(item.id!);
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
        const { all, visible, order, queued } = this;
        all.clear();
        queued.clear();
        visible.clear();
        order.length = 0;
    }

    public sort(): void {
        const { sortSvc, rowNodeSorter } = this.beans;
        const sortOptions = sortSvc?.getSortOptions() ?? [];
        // first remove the grand total row so it doesn't get sorted
        const grandTotalNode = _removeGrandTotalRow(this.order);
        // pre-sort by existing row-index otherwise we'll fall back to order in which rows are pinned
        this.order.sort((a, b) => (a.pinnedSibling?.rowIndex ?? 0) - (b.pinnedSibling?.rowIndex ?? 0));
        this.order = rowNodeSorter?.doFullSort(this.order, sortOptions) ?? this.order;
        // post-sort re-insert the grand total row in the correct place
        if (!grandTotalNode) return;
        const grandTotalRow = this.beans.gos.get('grandTotalRow');
        if (grandTotalRow === 'bottom' || grandTotalRow === 'pinnedBottom') {
            this.order.push(grandTotalNode);
        } else {
            this.order.unshift(grandTotalNode);
        }
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

/**
 * Recursively check the parent node's `childrenAfterSort`.
 * For CSRM, this is currently the "least bad" way to check whether a node is
 * displayed after filtering, accounting for both normal filters and aggregate filters.
 */
function _isDisplayedAfterFilterCSRM(node: RowNode): boolean {
    if (node.level === -1) return true;

    const parent = node.parent;

    if (parent?.childrenAfterSort?.some((child) => child == node)) {
        return _isDisplayedAfterFilterCSRM(parent);
    }

    return false;
}

/** Expect to be passed the source node, not the pinned node */
export function _shouldHidePinnedRows(beans: BeanCollection, node: RowNode): boolean {
    const { gos, rowModel, filterManager } = beans;

    if (_isServerSideRowModel(gos, rowModel)) {
        // For SSRM the best we can do for now is check if the node is in the cache.
        // This will let us display the node when a group is collapsed.
        return !rowModel.getRowNode(node.id!);
    }

    if (filterManager?.isAnyFilterPresent()) {
        return !_isDisplayedAfterFilterCSRM(node);
    }

    if (gos.get('pivotMode')) {
        return !node.group;
    }

    return false;
}

function _isNodeGrandTotal(node: RowNode): boolean {
    return !!node.footer && node.level === -1;
}

function _isPinnedNodeGrandTotal(node: RowNode): boolean {
    return !!node.pinnedSibling && _isNodeGrandTotal(node.pinnedSibling);
}

function _removeGrandTotalRow(order: RowNode[]): RowNode | undefined {
    const index = order.findIndex(_isPinnedNodeGrandTotal);
    if (index > -1) {
        return order.splice(index, 1)?.[0];
    }
}
