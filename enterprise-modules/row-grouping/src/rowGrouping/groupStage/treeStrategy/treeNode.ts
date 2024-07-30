import { RowNode } from '@ag-grid-community/core';

/**
 * We need this to mark a row as expanded value already precomputed.
 * A row can be reinserted after a rowData replacement, and we want to maintain the expanded state.
 */
const EXPANDED_INITIALIZED_SYM = Symbol('expandedInitialized');

/**
 * Used to map a TreeNode to a RowNode, so we can find the right tree node for a row in O(1).
 * The association is disposed when the row is removed from the tree, or, when the TreeStrategy gets disposed.
 */
const TREE_NODE_SYM = Symbol('treeNode');

interface TreeRow extends RowNode {
    [TREE_NODE_SYM]?: TreeNode | null | undefined;
    [EXPANDED_INITIALIZED_SYM]?: unknown;
}

/** Gets the TreeNode associated to a RowNode */
export const getTreeNode = (row: RowNode | null | undefined): TreeNode | null =>
    (row as TreeRow | null)?.[TREE_NODE_SYM] ?? null;

/** Sets the TreeNode associated to a RowNode */
export const setTreeNode = (row: RowNode, node: TreeNode | null): void => {
    (row as TreeRow)[TREE_NODE_SYM] = node;
};

export const getExpandedInitialized = (row: RowNode): boolean => !!(row as TreeRow)[EXPANDED_INITIALIZED_SYM];

export const setExpandedInitialized = (row: RowNode, value: boolean): void => {
    (row as TreeRow)[EXPANDED_INITIALIZED_SYM] = value;
};

export class TreeNode {
    /** The children of the tree, where the key is the node key and the value is the child node */
    public map: Map<string, TreeNode> | null = null;

    /** The RowNode associated to this tree node */
    public row: RowNode | null = null;

    /** List of direct children to update in the commit stage */
    public updates: Set<TreeNode> | null = null;

    public flags: number = 0;

    public parent: TreeNode | null;

    /** We use this during commit to understand if the row changed. After commit, it will be the same as this.row. */
    public oldRow: RowNode | null = null;

    public key: string;

    public childrenAfterGroup: RowNode[] = [];
    public allLeafChildren: RowNode[] = [];

    public constructor(parent: TreeNode | null, key: string) {
        this.parent = parent;
        this.key = key;
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

/**
 * Called during commit to make the id of a new filler node.
 * We put "row-group-" before the group id, so it doesn't clash with standard row id's.
 * We also use 't-' and 'b-' for top pinned and bottom pinned rows.
 */
export function makeFillerRowId(node: TreeNode, level: number): string {
    let id = level + '-' + node.key;
    for (let p = node.parent; p?.parent; p = p.parent) {
        id = `${--level}-${p.key}-${id}`;
    }
    return RowNode.ID_PREFIX_ROW_GROUP + id;
}
