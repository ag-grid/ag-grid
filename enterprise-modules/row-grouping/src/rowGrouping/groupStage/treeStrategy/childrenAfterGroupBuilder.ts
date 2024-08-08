import type { RowNode } from '@ag-grid-community/core';

import type { TreeNode } from './treeNode';

export type RowNodeOrder = { readonly [id: string]: number | undefined };

const getLeftmostRow = (node: TreeNode): RowNode | null => {
    let current: TreeNode | undefined = node;
    while (current) {
        const row = current.row;
        if (row?.data) {
            return row;
        }
        current = current.childrenAfterGroup[0]?.treeNode as TreeNode | undefined;
    }
    return null;
};

export class ChildrenAfterGroupBuilder {
    private readonly tempArray: TreeNode[] = [];
    private rowNodeOrder: RowNodeOrder | undefined;
    private comparer: (a: TreeNode, b: TreeNode) => number;

    public constructor() {
        this.comparer = (a: TreeNode, b: TreeNode) => {
            const rowA = getLeftmostRow(a);
            const rowB = getLeftmostRow(b);
            const aIndex = this.rowNodeOrder![rowA!.id!] || 0;
            const bIndex = this.rowNodeOrder![rowB!.id!] || 0;
            return aIndex - bIndex;
        };
    }

    public init(rowNodeOrder: RowNodeOrder | undefined): void {
        this.rowNodeOrder = rowNodeOrder;
    }

    public free() {
        this.rowNodeOrder = undefined;
        this.tempArray.length = 0;
    }

    public rebuildChildrenAfterGroup(node: TreeNode): boolean {
        const tempArray = this.tempArray;
        tempArray.length = node.childrenCount();
        let index = 0;
        for (const child of node.enumChildren()) {
            tempArray[index++] = child;
        }
        if (this.rowNodeOrder) {
            tempArray.sort(this.comparer);
        }

        let changed = false;

        const output = node.childrenAfterGroup;
        if (output.length !== index) {
            changed = true;
            output.length = index;
            for (let i = 0; i < index; i++) {
                output[i] = tempArray[i].row!;
            }
        } else {
            for (let i = 0; i < tempArray.length; i++) {
                const row = tempArray[i].row!;
                if (output[i] !== row) {
                    output[i] = row;
                    changed = true;
                }
            }
        }

        return changed;
    }
}
