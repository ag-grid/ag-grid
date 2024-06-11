import type { RowNode } from '../entities/rowNode';
import type { IRowModel } from '../interfaces/iRowModel';

/**
 * The context of a row range selection operation.
 *
 * Used to model the stateful range selection behaviour found in Excel, where
 * a given cell/row represents the "root" of a selection range, and subsequent
 * selections are based off that root.
 *
 * See AG-9620 for more
 */
export class RowRangeSelectionContext {
    private root: RowNode | null = null;
    /**
     * Note that the "end" `RowNode` may come before or after the "root" `RowNode` in the
     * actual grid.
     */
    private end: RowNode | null = null;
    private rowModel: IRowModel;
    private cachedRange: RowNode[] = [];

    public init(rowModel: IRowModel): void {
        this.rowModel = rowModel;
    }

    public destroy(): void {
        this.root = null;
        this.end = null;
        this.cachedRange.length = 0;
    }

    public reset(node: RowNode): void {
        this.root = node;
        this.end = null;
        this.cachedRange.length = 0;
    }

    public setEndRange(end: RowNode): void {
        this.end = end;
        this.cachedRange.length = 0;
    }

    public getRange(): RowNode[] {
        if (this.cachedRange.length === 0 && this.end !== null) {
            this.cachedRange = this.rowModel.getNodesInRangeForSelection(this.root, this.end);
        }

        return this.cachedRange;
    }

    public isInRange(node: RowNode): boolean {
        if (this.root === null) {
            return false;
        }

        return this.getRange().some((nodeInRange) => nodeInRange.id === node.id);
    }

    public getRoot(): RowNode | null {
        return this.root;
    }

    /**
     * Truncates the range to the given node (assumed to be within the current range).
     * Returns nodes that remain in the current range and those that should be removed
     *
     * @param node - Node at which to truncate the range
     * @returns Object of nodes to either keep or discard (i.e. deselect) from the range
     */
    public truncate(node: RowNode): { keep: RowNode[]; discard: RowNode[] } {
        const range = this.getRange();

        if (range.length === 0) {
            return { keep: [], discard: [] };
        }

        // if root is first, then selection range goes "down" the table
        // so we should be unselecting the range _after_ the given `node`
        const discardAfter = range[0].id === this.root!.id;

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
    public extend(node: RowNode): { keep: RowNode[]; discard: RowNode[] } {
        const newRange = this.rowModel.getNodesInRangeForSelection(this.root, node);

        if (newRange.find((newRangeNode) => newRangeNode.id === this.end?.id)) {
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
