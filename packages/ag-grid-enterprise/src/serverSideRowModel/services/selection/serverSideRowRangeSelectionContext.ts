import type { IRowModel, ISelectionContext, RowNode } from 'ag-grid-community';

/**
 * This is the same as RowRangeSelectionContext in core, except that we store RowNode IDs
 * instead of RowNode instances directly, because RowNodes can be dropped when scrolled out
 * of view
 */
export class ServerSideRowRangeSelectionContext implements ISelectionContext<string> {
    private rowModel: IRowModel;
    private root: string | null = null;
    /**
     * Note that the "end" `RowNode` may come before or after the "root" `RowNode` in the
     * actual grid.
     */
    private end: string | null = null;
    private cachedRange: RowNode[] = [];

    public init(rowModel: IRowModel): void {
        this.rowModel = rowModel;
    }

    public reset(): void {
        this.root = null;
        this.end = null;
        this.cachedRange.length = 0;
    }

    public setRoot(node: string): void {
        this.root = node;
        this.end = null;
        this.cachedRange.length = 0;
    }

    public setEndRange(end: string): void {
        this.end = end;
        this.cachedRange.length = 0;
    }

    getRoot(): string | null {
        return this.root;
    }

    public getRange(): RowNode[] {
        if (this.cachedRange.length === 0) {
            const root = this.root ? this.rowModel.getRowNode(this.root) : undefined;
            const end = this.end ? this.rowModel.getRowNode(this.end) : undefined;

            if (root == null || end == null) {
                return this.cachedRange;
            }

            this.cachedRange = this.rowModel.getNodesInRangeForSelection(root, end);
        }

        return this.cachedRange;
    }

    public isInRange(node: string): boolean {
        if (this.root === null) {
            return false;
        }

        return this.getRange().some((nodeInRange) => nodeInRange.id === node);
    }

    /**
     * Truncates the range to the given node (assumed to be within the current range).
     * Returns nodes that remain in the current range and those that should be removed
     *
     * @param node - Node at which to truncate the range
     * @returns Object of nodes to either keep or discard (i.e. deselect) from the range
     */
    public truncate(node: string): { keep: RowNode[]; discard: RowNode[] } {
        const range = this.getRange();

        if (range.length === 0) {
            return { keep: [], discard: [] };
        }

        // if root is first, then selection range goes "down" the table
        // so we should be unselecting the range _after_ the given `node`
        const discardAfter = range[0].id === this.root!;

        const idx = range.findIndex((rowNode) => rowNode.id === node);
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
    public extend(node: string, groupSelectsChildren = false): { keep: RowNode[]; discard: RowNode[] } {
        // If the root ID is null, this is the first selection.
        // That means we add the given `node` plus any leaf children to the selection
        if (this.root == null) {
            const keep = this.getRange().slice(); // current range should be empty but include it anyway
            const rowNode = this.rowModel.getRowNode(node);
            if (rowNode) {
                if (groupSelectsChildren) {
                    rowNode.depthFirstSearch((node) => !node.group && keep.push(node));
                }
                keep.push(rowNode);
            }

            // We now have a node we can use as the root of the selection
            this.setRoot(node);

            return { keep, discard: [] };
        }

        const rowNode = this.rowModel.getRowNode(node);
        const rootNode = this.rowModel.getRowNode(this.root);

        if (rowNode == null) {
            return { keep: this.getRange(), discard: [] };
        }

        // If the root node is no longer retrievable, we cannot iterate from the root
        // to the given `node`. So we keep the existing selection, plus the given `node`
        if (rootNode == null) {
            return { keep: this.getRange().concat(rowNode), discard: [] };
        }

        const newRange = this.rowModel.getNodesInRangeForSelection(rootNode, rowNode);

        if (newRange.find((newRangeNode) => newRangeNode.id === this.end)) {
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
}
