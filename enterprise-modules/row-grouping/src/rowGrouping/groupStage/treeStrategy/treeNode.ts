import type { RowNode } from '@ag-grid-community/core';

export class TreeNode {
    /** The children of the tree, where the key is the node key and the value is the child node */
    public map: Map<string, TreeNode> | null = null;

    /** The RowNode associated to this tree node */
    public row: RowNode | null = null;

    /** List of direct children to update in the commit stage */
    public updates: Set<TreeNode> | null = null;

    public flags: number;

    public parent: TreeNode | null;

    public level: number;

    public key: string;

    public constructor(parent: TreeNode | null, level: number, key: string, flags: number) {
        this.parent = parent;
        this.level = level;
        this.key = key;
        this.flags = flags;
    }

    /** Recursively add every node to its parent.updates set */
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
