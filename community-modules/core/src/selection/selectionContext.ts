import type { RowNode } from '../entities/rowNode';
import type { IRowModel } from '../interfaces/iRowModel';

export class SelectionContext {
    private root: RowNode | null = null;
    private tail: RowNode | null = null;
    private rowModel: IRowModel;
    private cachedRange: RowNode[] = [];

    public init(rowModel: IRowModel): void {
        this.rowModel = rowModel;
    }

    public destroy(): void {
        this.root = null;
        this.tail = null;
        this.cachedRange.length = 0;
    }

    public reset(node: RowNode): void {
        this.root = node;
        this.tail = null;
        this.cachedRange.length = 0;
    }

    public setTail(tail: RowNode): void {
        this.tail = tail;
        this.cachedRange.length = 0;
    }

    private getRange(): RowNode[] {
        if (this.cachedRange.length === 0 && this.root !== null) {
            this.cachedRange = this.rowModel.getNodesInRangeForSelection(this.root, this.tail);
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

    public splitRangeAt(node: RowNode): [left: RowNode[], right: RowNode[]] {
        const range = this.getRange();

        const idx = range.findIndex((rowNode) => rowNode.id === node.id);
        if (idx > -1) {
            return [range.slice(0, idx), range.slice(idx + 1)];
        } else {
            return [range, []];
        }
    }
}
