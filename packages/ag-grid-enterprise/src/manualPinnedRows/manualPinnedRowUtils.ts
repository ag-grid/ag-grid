import type { BeanCollection, GridOptions, RowNode } from 'ag-grid-community';
import { _isServerSideRowModel, _removeFromArray } from 'ag-grid-community';

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
        if (all.has(item)) return;
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
        const { all, visible, order, queued } = this;
        all.clear();
        queued.clear();
        visible.clear();
        order.length = 0;
    }

    public sort(): void {
        const { sortSvc, rowNodeSorter } = this.beans;
        const sortOptions = sortSvc?.getSortOptions() ?? [];
        // pre-sort by existing row-index otherwise we'll fall back to order in which rows are pinned
        this.order.sort((a, b) => (a.pinnedSibling?.rowIndex ?? 0) - (b.pinnedSibling?.rowIndex ?? 0));
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

function _isSourceRowPinned(beans: BeanCollection, node: RowNode): boolean {
    const { pinnedRowModel } = beans;

    // `rowPinned` is only set on pinned sibling nodes
    const rowPinned = node.rowPinned ?? node.pinnedSibling?.rowPinned;

    return !!(pinnedRowModel?.isManual() && rowPinned);
}

/**
 * We need to handle the case where `grandTotalRow = 'pinnedXXXX'` and then is unpinned.
 *
 * In this case, we fallback to 'top'/'bottom'.
 */
export function _getComputedFooterLocation(
    beans: BeanCollection,
    node: RowNode,
    grandTotalRow: GridOptions['grandTotalRow']
): GridOptions['grandTotalRow'] {
    if (_isSourceRowPinned(beans, node)) {
        // For pinned rows, we don't display the non-pinned footer as well.
        // This is different than for all other manually pinned rows
        return;
    }

    switch (grandTotalRow) {
        case 'top':
        case 'bottom':
            return grandTotalRow;
        case 'pinnedBottom':
            return 'bottom';
        case 'pinnedTop':
            return 'top';
    }
}
