import type { RowNode } from '@ag-grid-community/core';

export class TreeNode {
    /** Is true if this node is the root */
    public root!: boolean;

    /** The children of the tree, where the key is the node key and the value is the child node */
    public map: Map<string, TreeNode> | null = null;

    /** The RowNode associated to this tree node */
    public row: RowNode | null = null;

    /** List of direct children to update in the commit stage */
    public updates: Set<TreeNode> | null = null;

    public flags: number;

    public parent: TreeNode | null;

    public key: string;

    public childrenAfterGroup: RowNode[] = [];
    public allLeafChildren: RowNode[] = [];

    public constructor(parent: TreeNode | null, key: string, flags: number) {
        this.parent = parent;
        this.key = key;
        this.flags = flags;
    }

    /** Traverse from the node to the root to get the old path and compare it with the new path */
    public nodePathEquals(path: string[]): boolean {
        let node: TreeNode | null = this;
        for (let i = path.length - 1; i >= 0; --i) {
            if (!node || node.key !== path[i]) {
                return false;
            }
            node = node.parent;
        }
        return !!node?.root; // The path is equal if we reached the root
    }

    /** Recursively add every node to node.parent.updates set */
    public invalidate(): void {
        let current: TreeNode | null = this;
        let parent = this.parent;
        while (parent) {
            let updates: Set<TreeNode> | null = parent.updates;
            if (!updates) {
                updates = new Set<TreeNode>();
                parent.updates = updates;
            } else if (updates.has(current)) {
                break; // Node already added to updates, no need to continue
            }
            updates.add(current);
            current = parent;
            parent = parent.parent;
        }
    }
}

TreeNode.prototype.root = false; // Default value
