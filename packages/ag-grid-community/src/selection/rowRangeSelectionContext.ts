import type { RowNode } from '../entities/rowNode';
import type { IRowModel } from '../interfaces/iRowModel';
import type { IPinnedRowModel } from '../main-umd-noStyles';
import { _getNodesInRangeForSelection } from '../pinnedRowModel/pinnedRowUtils';

interface RangePartition {
    keep: readonly RowNode[];
    discard: readonly RowNode[];
}

/**
 * The context of a row range selection operation.
 *
 * Used to model the stateful range selection behaviour found in things like Excel and
 * various file explorers, in particular Windows File Explorer, where a given cell/row
 * represents the "root" of a selection range, and subsequent selections are based off that root.
 *
 * See AG-9620 for more
 */
export class RowRangeSelectionContext {
    /** Whether the user is currently selecting all nodes either via the header checkbox or API */
    public selectAll = false;
    private rootId: string | null = null;
    /**
     * Note that the "end" `RowNode` may come before or after the "root" `RowNode` in the
     * actual grid.
     */
    private endId: string | null = null;
    private cachedRange: RowNode[] = [];

    constructor(
        private readonly rowModel: IRowModel,
        private readonly pinnedRowModel?: IPinnedRowModel
    ) {}

    public reset(): void {
        this.rootId = null;
        this.endId = null;
        this.cachedRange.length = 0;
    }

    public setRoot(node: RowNode): void {
        this.rootId = node.id!;
        this.endId = null;
        this.cachedRange.length = 0;
    }

    public setEndRange(end: RowNode): void {
        this.endId = end.id!;
        this.cachedRange.length = 0;
    }

    public getRange(): readonly RowNode[] {
        if (this.cachedRange.length === 0) {
            const root = this.getRoot();
            const end = this.getEnd();

            if (root == null || end == null) {
                return this.cachedRange;
            }

            this.cachedRange = this.getNodesInRange(root, end) ?? [];
        }

        return this.cachedRange;
    }

    public isInRange(node: RowNode): boolean {
        if (this.rootId === null) {
            return false;
        }

        return this.getRange().some((nodeInRange) => nodeInRange.id === node.id);
    }

    public getRoot(fallback?: RowNode): RowNode | undefined {
        if (this.rootId) {
            return this.getRowNode(this.rootId);
        }
        if (fallback) {
            this.setRoot(fallback);
            return fallback;
        }
    }

    private getEnd(): RowNode | undefined {
        if (this.endId) {
            return this.getRowNode(this.endId);
        }
    }

    private getRowNode(id: string): RowNode | undefined {
        let node: RowNode | undefined;

        const { rowModel, pinnedRowModel } = this;

        node ??= rowModel.getRowNode(id);

        if (pinnedRowModel?.isManual()) {
            node ??= pinnedRowModel.getPinnedRowById(id, 'top');
            node ??= pinnedRowModel.getPinnedRowById(id, 'bottom');
        }

        return node;
    }

    /**
     * Truncates the range to the given node (assumed to be within the current range).
     * Returns nodes that remain in the current range and those that should be removed
     *
     * @param node - Node at which to truncate the range
     * @returns Object of nodes to either keep or discard (i.e. deselect) from the range
     */
    public truncate(node: RowNode): RangePartition {
        const range = this.getRange();

        if (range.length === 0) {
            return { keep: [], discard: [] };
        }

        // if root is first, then selection range goes "down" the table
        // so we should be unselecting the range _after_ the given `node`
        const discardAfter = range[0].id === this.rootId;

        const idx = range.findIndex((rowNode) => rowNode.id === node.id);
        if (idx > -1) {
            const above = range.slice(0, idx);
            const below = range.slice(idx + 1);
            this.setEndRange(node);
            return discardAfter ? { keep: above, discard: below } : { keep: below, discard: above };
        } else {
            return { keep: range, discard: [] };
        }
    }

    /**
     * Extends the range to the given node. Returns nodes that remain in the current range
     * and those that should be removed.
     *
     * @param node - Node marking the new end of the range
     * @returns Object of nodes to either keep or discard (i.e. deselect) from the range
     */
    public extend(node: RowNode, groupSelectsChildren = false): RangePartition {
        const root = this.getRoot();

        // If the root node is null, we cannot iterate from the root to the given `node`.
        // So we keep the existing selection, plus the given `node`, plus any leaf children.
        if (root == null) {
            const keep = this.getRange().slice();
            if (groupSelectsChildren) {
                node.depthFirstSearch((node) => !node.group && keep.push(node));
            }
            keep.push(node);

            // We now have a node we can use as the root of the selection
            this.setRoot(node);

            return { keep, discard: [] };
        }

        const newRange = this.getNodesInRange(root, node);
        if (!newRange) {
            this.setRoot(node);
            return { keep: [node], discard: [] };
        }

        if (newRange.find((newRangeNode) => newRangeNode.id === this.endId)) {
            // Range between root and given node contains the current "end"
            // so this is an extension of the current range direction
            this.setEndRange(node);
            return { keep: this.getRange(), discard: [] };
        } else {
            // otherwise, this is an inversion
            const discard = this.getRange().slice();
            this.setEndRange(node);
            return { keep: this.getRange(), discard };
        }
    }

    private getNodesInRange(start: RowNode, end: RowNode): RowNode[] | null {
        const { pinnedRowModel, rowModel } = this;

        // 1. No manual row pinning: just look at row model
        if (!pinnedRowModel?.isManual()) {
            return rowModel.getNodesInRangeForSelection(start, end);
        }

        // 2. start node is pinned top, end node is main view
        if (start.rowPinned === 'top' && !end.rowPinned) {
            const pinnedRange = _getNodesInRangeForSelection(pinnedRowModel, 'top', start, undefined);
            return pinnedRange.concat(rowModel.getNodesInRangeForSelection(rowModel.getRow(0)!, end) ?? []);
        }

        // 3. start node is pinned bottom, end node is main view
        if (start.rowPinned === 'bottom' && !end.rowPinned) {
            const pinnedRange = _getNodesInRangeForSelection(pinnedRowModel, 'bottom', undefined, start);
            const count = rowModel.getRowCount();
            const lastMain = rowModel.getRow(count - 1)!;
            return (rowModel.getNodesInRangeForSelection(end, lastMain) ?? []).concat(pinnedRange);
        }

        // 4. start node is main view, end node is main view
        if (!start.rowPinned && !end.rowPinned) {
            return rowModel.getNodesInRangeForSelection(start, end);
        }

        // 5. start node is pinned top, end node is pinned top
        if (start.rowPinned === 'top' && end.rowPinned === 'top') {
            return _getNodesInRangeForSelection(pinnedRowModel, 'top', start, end);
        }

        // 6. start node is pinned bottom, end node is pinned top
        if (start.rowPinned === 'bottom' && end.rowPinned === 'top') {
            const top = _getNodesInRangeForSelection(pinnedRowModel, 'top', end, undefined);
            const bottom = _getNodesInRangeForSelection(pinnedRowModel, 'bottom', undefined, start);
            const first = rowModel.getRow(0)!;
            const last = rowModel.getRow(rowModel.getRowCount() - 1)!;
            return top.concat(rowModel.getNodesInRangeForSelection(first, last) ?? []).concat(bottom);
        }

        // 7. start node is main view, end node is pinned top
        if (!start.rowPinned && end.rowPinned === 'top') {
            const pinned = _getNodesInRangeForSelection(pinnedRowModel, 'top', end, undefined);
            return pinned.concat(rowModel.getNodesInRangeForSelection(rowModel.getRow(0)!, start) ?? []);
        }

        // 8. start node is pinned top, end node is pinned bottom
        if (start.rowPinned === 'top' && end.rowPinned === 'bottom') {
            const top = _getNodesInRangeForSelection(pinnedRowModel, 'top', start, undefined);
            const bottom = _getNodesInRangeForSelection(pinnedRowModel, 'bottom', undefined, end);
            const first = rowModel.getRow(0)!;
            const last = rowModel.getRow(rowModel.getRowCount() - 1)!;
            return top.concat(rowModel.getNodesInRangeForSelection(first, last) ?? []).concat(bottom);
        }

        // 9. start node is pinned bottom, end node is pinned bottom
        if (start.rowPinned === 'bottom' && end.rowPinned === 'bottom') {
            return _getNodesInRangeForSelection(pinnedRowModel, 'bottom', start, end);
        }

        // 10. start node is main view, end node is pinned bottom
        if (!start.rowPinned && end.rowPinned === 'bottom') {
            const pinned = _getNodesInRangeForSelection(pinnedRowModel, 'bottom', undefined, end);
            const last = rowModel.getRow(rowModel.getRowCount())!;
            return (rowModel.getNodesInRangeForSelection(start, last) ?? []).concat(pinned);
        }

        return null;
    }
}
