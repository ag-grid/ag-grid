import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import { _getGrandTotalRow, _isServerSideRowModel } from '../gridOptionsUtils';
import type { RowPinnedType } from '../interfaces/iRowNode';

export class PinnedRows {
    /** Canonical set of pinned nodes, hidden ones included, in pin order. Mutate only via methods. */
    public readonly all = new Set<RowNode>();
    /** The subset of `all` hidden by a filter, pivot mode or the SSRM cache, usually empty. */
    private readonly hidden = new Set<RowNode>();
    /** IDs of nodes that need to be pinned once they are available from the row model */
    public readonly queued = new Set<string>();
    private readonly sorted: RowNode[] = [];
    private sortedValid = true;

    constructor(
        private readonly beans: BeanCollection,
        public readonly floating: NonNullable<RowPinnedType>
    ) {}

    public getDisplayedCount(): number {
        return this.all.size - this.hidden.size;
    }

    /** The displayed nodes in display order, re-sorted in place on the first read after a change. */
    public getSorted(): RowNode[] {
        const sorted = this.sorted;
        if (!this.sortedValid) {
            this.sortedValid = true;
            sortPinnedRows(this.beans, this.all, this.hidden, sorted);
        }
        return sorted;
    }

    public add(node: RowNode, hidden: boolean): void {
        const all = this.all;
        if (all.has(node)) {
            return;
        }
        all.add(node);
        if (hidden) {
            this.hidden.add(node);
        } else {
            this.sortedValid = false;
        }
    }

    public delete(item: RowNode): void {
        this.beans.editSvc?.releaseRowEdits(item);
        if (!this.all.delete(item)) {
            return;
        }
        if (!this.hidden.delete(item)) {
            this.sortedValid = false;
        }
    }

    public getById(id: string): RowNode | undefined {
        const hidden = this.hidden;
        for (const node of this.all) {
            if (node.id == id && !hidden.has(node)) {
                return node;
            }
        }
    }

    /** Re-evaluates visibility and invalidates the display order, which the source rows' sort and index drive.
     *  Returns whether any row was hidden or revealed; a swap leaves the count unchanged. */
    public refreshVisibility(): boolean {
        const { beans, hidden } = this;
        let changed = false;
        for (const node of this.all) {
            if (!_shouldHidePinnedRows(beans, node.pinnedSibling!)) {
                changed = hidden.delete(node) || changed;
            } else if (!hidden.has(node)) {
                hidden.add(node);
                node.setRowTop(null); // a hidden row has no position
                node.setRowIndex(null);
                changed = true;
            }
        }
        this.sortedValid = false;
        return changed;
    }
}

const sortPinnedRows = (beans: BeanCollection, all: Set<RowNode>, hidden: Set<RowNode>, sorted: RowNode[]): void => {
    const { sortSvc, rowNodeSorter, gos } = beans;
    sorted.length = 0;
    // The grand total row is placed by `grandTotalRow`, not by the sort.
    let grandTotalNode: RowNode | undefined;
    for (const node of all) {
        if (hidden.has(node)) {
            continue;
        }
        if (_isPinnedNodeGrandTotal(node)) {
            grandTotalNode = node;
        } else {
            sorted.push(node);
        }
    }
    const sortOptions = sortSvc?.getSortOptions() ?? [];
    // Falls back to the source row index, otherwise rows would keep the order they were pinned in.
    sorted.sort(
        (a, b) =>
            rowNodeSorter?.compareRowNodes(sortOptions, a, b) ||
            (a.pinnedSibling?.rowIndex ?? 0) - (b.pinnedSibling?.rowIndex ?? 0)
    );
    if (grandTotalNode) {
        const grandTotalRow = _getGrandTotalRow(gos);
        if (grandTotalRow === 'bottom' || grandTotalRow === 'pinnedBottom') {
            sorted.push(grandTotalNode);
        } else {
            sorted.unshift(grandTotalNode);
        }
    }
};

/**
 * Recursively check the parent node's `childrenAfterSort`.
 * For CSRM, this is currently the "least bad" way to check whether a node is
 * displayed after filtering, accounting for both normal filters and aggregate filters.
 */
const _isDisplayedAfterFilterCSRM = (node: RowNode): boolean => {
    if (node.level === -1) {
        return true;
    }
    const parent = node.parent;
    return !!parent?.childrenAfterSort?.includes(node) && _isDisplayedAfterFilterCSRM(parent);
};

/** Expect to be passed the source node, not the pinned node */
export const _shouldHidePinnedRows = (beans: BeanCollection, node: RowNode): boolean => {
    const { gos, rowModel, filterManager } = beans;

    if (_isServerSideRowModel(gos, rowModel)) {
        // For SSRM the best we can do for now is check if the node is in the cache.
        // This will let us display the node when a group is collapsed.
        return !rowModel.getRowNode(node.id!);
    }

    if (gos.get('pivotMode') && !node.group) {
        return true;
    }

    return !!filterManager?.isAnyFilterPresent() && !_isDisplayedAfterFilterCSRM(node);
};

const _isNodeGrandTotal = (node: RowNode): boolean => !!node.footer && node.level === -1;

export const _isPinnedNodeGrandTotal = (node: RowNode): boolean =>
    !!node.pinnedSibling && _isNodeGrandTotal(node.pinnedSibling);
