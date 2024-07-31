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

/**
 * We keep a secondary tree data structure together with the rows.
 * We associate a node with a TreeNode, both storing the row in node.row and by storing the TreeNode in a hidden field in the row.
 * We break the association when the row is removed or the TreeStrategy destroyed.
 *
 * TreeStrategy uses a two stage approach both for first time creation and updates.
 * Multiple updates interact with the tree, and a commit stage commits all updates reducing expensive computations.
 *
 * The only interactions in the creation and update allowed are:
 *  - insert a filler node, done with node.upsertNodeByKey, node.upsertPath
 *  - replace the existing node row with another, or null, with TreeStrategy.setRowPath
 *
 * Those operation invalidate the affected paths with node.invalidate(), so that the commit operation will only
 * update the affected paths without traversing the whole tree.
 *
 * During commit, the childrenAfterGroup and allLeafChildren arrays are rebuilt, and the updates are applied.
 * The filler nodes without children are recursively removed.
 * Before commit those arrays are NOT representing the truth, so they should not be used.
 *
 * Deletion and moving subtrees should be performed only by setting rows with TreeStrategy.setRowPath and not by
 * moving node around.
 */
export class TreeNode {
    /**
     * The children of the tree, where the key is the node key and the value is the child node.
     * We use this to avoid exploring the whole tree during commit, we will just go to the paths
     * that are changed in DFS order.
     */
    public map: Map<string, TreeNode> | null = null;

    /** The RowNode associated to this tree node */
    public row: RowNode | null = null;

    /** We keep the row.childrenAfterGroup here, we just swap it when we assign row */
    public readonly childrenAfterGroup: RowNode[] = [];

    /** We keep the row.allLeafChildren here, we just swap it when we assign row */
    public readonly allLeafChildren: RowNode[] = [];

    /** We use this during commit to understand if the row changed. After commit, it will be the same as this.row. */
    public oldRow: RowNode | null = null;

    /** We set this to true if a update transaction happened on this row, is set to false during commit. */
    public rowUpdated: boolean = false;

    /** The parent node of this node, or null if removed or the root. */
    public parent: TreeNode | null;

    /** The key of this node. */
    public readonly key: string;

    /** The head of the linked list of direct children nodes that are invalidated and need to be committed. */
    private invalidatedHead: TreeNode | null | undefined = null;

    /**
     * The tail of the linked list of direct children nodes that are invalidated and need to be committed.
     * This is required to process invalidated nodes in the insertion order, this is required by the commit algorithm.
     */
    private invalidatedTail: TreeNode | null = null;

    /**
     * The next node in the linked list of parent.invalidatedHead.
     * - undefined means that the node is not invalidated (not present in the parent linked list)
     * - null this is the last node in the linked list
     * - a TreeNode is the next node in the linked list
     */
    private invalidatedNext: TreeNode | null | undefined = undefined;

    public constructor(parent: TreeNode | null, key: string) {
        this.parent = parent;
        this.key = key;
    }

    /**
     * Invalidates this node and all its parents until the root is reached.
     * Order of invalidation is maintained when node.dequeueInvalidated is called.
     * The root itself cannot be invalidated, as it has no parents.
     * This is optimized, if a node is already invalidated, it will stop the recursion.
     */
    public invalidate(): void {
        let node: TreeNode | null = this;
        do {
            const parent: TreeNode | null = node.parent;
            if (!parent || node.invalidatedNext !== undefined) {
                break; // This is the root, or an already invalidated node
            }
            node.invalidatedNext = null; // Mark as invalidated, and last in the linked list
            const tail = parent.invalidatedTail;
            if (tail) {
                tail.invalidatedNext = node;
            } else {
                parent.invalidatedHead = node;
            }
            parent.invalidatedTail = node;

            node = parent; // Go to the parent
        } while (node);
    }

    /**
     * Dequeues the next child invalidated node to be committed.
     * @returns the next child node to be committed, or null if all children were already dequeued.
     */
    public dequeueInvalidated(): TreeNode | null {
        const node = this.invalidatedHead;
        if (!node) {
            return null;
        }
        this.invalidatedHead = node.invalidatedNext;
        if (!this.invalidatedHead) {
            this.invalidatedTail = null;
        }
        node.invalidatedNext = undefined;
        return node;
    }

    /** Clears the invalidated list of children nodes. */
    public clearInvalidatedList(): void {
        let node = this.invalidatedHead;
        this.invalidatedHead = null;
        this.invalidatedTail = null;
        while (node) {
            const nextNode = node.invalidatedNext;
            node.invalidatedNext = undefined;
            node = nextNode;
        }
    }

    /**
     * Gets a node a key in the given parent. If the node does not exists, creates a filler node, with null row.
     * Invalidates the path to the node from the root if a filler node is added.
     * @returns the node at the given key, or a new filler node inserted there if it does not exist.
     */
    public upsertNodeByKey(key: string): TreeNode {
        let node = this.map?.get(key);
        if (!node) {
            node = new TreeNode(this, key);
            (this.map ??= new Map()).set(key, node);
            node.invalidate();
        }
        return node;
    }

    /**
     * Given a path to follow, it creates the nodes in the path if they don't exist.
     * @returns the last node in the path, or null if the path is empty.
     */
    public upsertPath(path: string[]): TreeNode | null {
        for (let level = 0, parent: TreeNode | null = this, stopLevel = path.length - 1; level <= stopLevel; ++level) {
            const key = path[level];
            const node: TreeNode | null = parent.upsertNodeByKey(key);
            if (level >= stopLevel) {
                return node;
            }
            parent = node;
        }
        return null;
    }

    /** Used to free memory and reset the node and/or row */
    public clear(clearRow: boolean) {
        const row = clearRow && this.row;
        this.childrenAfterGroup.length = 0;
        this.allLeafChildren.length = 0;
        this.oldRow = null;
        this.map = null;
        if (row) {
            this.row = null;
            if (row.level >= 0) {
                row.childrenAfterGroup = null;
                row.allLeafChildren = null;
            } else {
                row.childrenAfterGroup = []; // root node
            }
            setTreeNode(row, null);
        }
        this.clearInvalidatedList();
    }

    /**
     * Rebuild the allLeafChildren rows array of a node.
     * It uses the allLeafChildren of all the children, we assume is already updated.
     *
     * Note: The order will be based on the map, not on the childrenAfterGroup array,
     * so it does not change with ordering.
     * @returns true if the array changed, false if not
     */
    public rebuildLeaves(): boolean {
        const { map, allLeafChildren: output } = this;
        const oldLen = output.length;
        let writeIdx = 0;
        let changed = false;
        if (map) {
            for (const child of map.values()) {
                const childAllLeafChildren = child.allLeafChildren!;
                const jLen = childAllLeafChildren.length;
                if (jLen) {
                    for (let j = 0; j < jLen; j++) {
                        const leaf = childAllLeafChildren[j];
                        if (writeIdx >= oldLen || output[writeIdx] !== leaf) {
                            output[writeIdx] = leaf;
                            changed = true;
                        }
                        ++writeIdx;
                    }
                } else {
                    const childRow = child.row; // We have the row by now
                    if ((writeIdx >= oldLen || output[writeIdx] !== childRow) && childRow) {
                        output[writeIdx] = childRow;
                        changed = true;
                    }
                    ++writeIdx;
                }
            }
        }
        if (writeIdx !== oldLen) {
            output.length = writeIdx;
            changed = true;
        }
        return changed;
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
