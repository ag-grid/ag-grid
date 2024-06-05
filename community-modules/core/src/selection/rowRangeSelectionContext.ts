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

    private getRange(): RowNode[] {
        if (this.cachedRange.length === 0 && this.root !== null) {
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
     * Finds the given node in the range describe by this context. If the node exists,
     * splits the range at that node (inclusive).
     *
     * @param node - Node at which to bisect the range
     * @returns Tuple of arrays containing nodes to either side of the given node
     */
    public splitRangeAt(node: RowNode): [RowNode[], RowNode[]] {
        const range = this.getRange();

        const idx = range.findIndex((rowNode) => rowNode.id === node.id);
        if (idx > -1) {
            return [range.slice(0, idx), range.slice(idx + 1)];
        } else {
            return [range, []];
        }
    }
}
