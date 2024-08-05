import { RowNode } from '@ag-grid-community/core';

import { setTreeRowTreeNode } from './treeRowNode';

/** An empty iterator */
const EMPTY_CHILDREN = ([] as readonly TreeNode[]).values();

interface TreeNodeWritablePrivateFields {
    parent: TreeNode | null;
    row: RowNode | null;
    ghost: boolean;
}

/**
 * We keep a secondary tree data structure together with the rows.
 * We associate a node with a TreeNode, both storing the row in node.row and by storing the TreeNode in a hidden field in the row.
 * We break the association when the row is removed or the TreeStrategy destroyed.
 *
 * TreeStrategy uses a two stage approach both for first time creation and updates.
 * Multiple updates interact with the tree, and a commit stage commits all updates reducing expensive computations.
 *
 * The operations are:
 *  - create a path with a filler node with a null row, calling TreeStrategy.upsertPath
 *  - replace an existing node row with another, or null, with TreeStrategy.overwriteRow
 *
 * Insert and overwrite will invalidate the affected paths with node.invalidate(), so that the commit operation will only
 * update the affected paths without traversing the whole tree.
 * Consider that order of invalidated items is not deterministic, so the commit operation should be able to handle any order.
 * The subtrees that don't have children after a move or remove operation will be marked as ghosts and removed during commit.
 *
 * During commit, the childrenAfterGroup and allLeafChildren arrays are rebuilt, and the updates are applied.
 * The ghost nodes are removed.
 * Before commit those arrays are NOT representing the truth, so they should not be used.
 */
export class TreeNode implements Readonly<TreeNodeWritablePrivateFields> {
    /** Keep track of the number of children that are ghosts in this node */
    private ghostsCount: number = 0;

    /**
     * The children of the tree, where the key is the node key and the value is the child node.
     * We use this to avoid exploring the whole tree during commit, we will just go to the paths
     * that are changed in DFS order.
     */
    private children: Map<string, TreeNode> | null = null;

    /** The head of the linked list of direct children nodes that are invalidated and need to be committed. */
    private invalidatedHead: TreeNode | null = null;

    /**
     * The next node in the linked list of parent.invalidatedHead.
     * - undefined: the node is not invalidated (not present in the parent linked list)
     * - null: this is the first and last node in the linked list
     * - TreeNode instance: is the next node in the linked list
     */
    private invalidatedNext: TreeNode | null | undefined = undefined;

    /** The RowNode associated to this tree node */
    public readonly row: RowNode | null = null;

    /** We keep the row.childrenAfterGroup here, we just swap it when we assign row */
    public readonly childrenAfterGroup: RowNode[] = [];

    /** We keep the row.allLeafChildren here, we just swap it when we assign row */
    public readonly allLeafChildren: RowNode[] = [];

    /** We use this during commit to understand if the row changed. After commit, it will be the same as this.row. */
    public oldRow: RowNode | null = null;

    /**  True if changedPath.addParentNode(row) should be called on this node. Reset to false during commit. */
    public pathChanged: boolean = false;

    /** True if childrenAfterGroup should be fully recomputed. Reset to false during commit. */
    public childChanged: boolean = false;

    /** True if childrenAfterGroup array should be filtered from removed nodes. Reset to false during commit. */
    public childRemoved: boolean = false;

    /** True allLeafChildren should be recomputed. Reset to false during commit. */
    public leafChildrenChanged: boolean = false;

    /** A ghost node is a node that should be removed */
    public readonly ghost: boolean;

    /** The parent node of this node, or null if removed or the root. */
    public readonly parent: TreeNode | null;

    /** The key of this node. */
    public readonly key: string;

    /** The level of this node. Root has level -1 */
    public readonly level: number;

    public constructor(parent: TreeNode | null, key: string, level: number, ghost: boolean) {
        this.parent = parent;
        this.key = key;
        this.level = level;
        this.ghost = ghost;
    }

    /** Returns the number of children in this node */
    public childrenCount(): number {
        return this.children?.size ?? 0;
    }

    /** Returns an iterator able to iterate all children in this node, in order of insertion */
    public enumChildren(): IterableIterator<TreeNode> {
        return this.children?.values() ?? EMPTY_CHILDREN;
    }

    /**
     * Gets a node a key in the given parent. If the node does not exists, creates a filler node, with null row.
     * Note that invalidate() is not called, is up to the caller to call it if needed.
     * @returns the node at the given key, or a new filler node inserted there if it does not exist.
     */
    public upsertKey(key: string): TreeNode {
        let node = this.children?.get(key);
        if (!node) {
            node = new TreeNode(this, key, this.level + 1, true);
            (this.children ??= new Map()).set(key, node);
            ++this.ghostsCount;
        }
        return node;
    }

    /**
     * Bidirectionally links (or unlink) a row to a node.
     * It does not invalidate the node or update the ghost state, it's up to the caller to do it, if applicable.
     */
    public linkRow(newRow: RowNode | null): boolean {
        const { row: oldRow } = this;
        if (oldRow === newRow) {
            return false; // No change
        }

        if (oldRow) {
            setTreeRowTreeNode(oldRow, null);
            oldRow.parent = null;
            oldRow.level = 0;
            if (this.level < 0) {
                oldRow.childrenAfterGroup = [];
            } else {
                oldRow.childrenAfterGroup = null;
                oldRow.allLeafChildren = null;
            }
        }

        if (newRow) {
            setTreeRowTreeNode(newRow, this);
            newRow.parent = this.parent?.row ?? null;
            newRow.level = this.level;
            newRow.childrenAfterGroup = this.childrenAfterGroup;
            if (this.level >= 0) {
                newRow.allLeafChildren = this.allLeafChildren;
            }
        }

        (this as TreeNodeWritablePrivateFields).row = newRow;

        return true;
    }

    /**
     * Invalidates this node and all its parents until the root is reached.
     * Order of invalidated nodes is not deterministic.
     * The root itself cannot be invalidated, as it has no parents.
     * If a node is already invalidated, it will stop the recursion.
     */
    public invalidate(): void {
        let node: TreeNode | null = this;
        while (node?.invalidateThis()) {
            node = node.parent;
        }
    }

    /**
     * Dequeues the next child invalidated node to be committed. Order is not deterministic.
     * @returns the next child node to be committed, or null if all children were already dequeued.
     */
    public dequeueInvalidated(): TreeNode | null {
        const node = this.invalidatedHead;
        if (node !== null) {
            this.invalidatedHead = node.invalidatedNext ?? null;
            node.invalidatedNext = undefined; // Mark as not invalidated
        }
        return node;
    }

    /**
     * Invalidates this node by adding this node in the queue of invalidated children in the parent node.
     * Order of invalidation is not deterministic.
     * It does not traverse the tree up to the root, it only affect the parent node.
     * @returns true if the node was invalidated during this call, false if it was already invalidated or there is no parent.
     */
    private invalidateThis(): boolean {
        const { parent, invalidatedNext } = this;
        if (parent === null || invalidatedNext !== undefined) {
            return false;
        }
        this.invalidatedNext = parent.invalidatedHead;
        parent.invalidatedHead = this;
        return true;
    }

    /**
     * Updates the ghost status of this node.
     * This method does not update the status of the parents.
     * @returns true if the ghost status changed, false if it was already the same.
     */
    public updateThisIsGhost(): boolean {
        const { parent, row, ghost } = this;
        if (parent === null) {
            return false; // Root cannot be a ghost
        }

        const newGhost = !row?.data && this.ghostsCount === this.childrenCount();
        if (newGhost === ghost) {
            return false; // No changes
        }

        (this as TreeNodeWritablePrivateFields).ghost = newGhost;

        if (newGhost) {
            ++parent.ghostsCount;
        } else {
            --parent.ghostsCount;

            // This was a ghost node, now is not, move the node at the end of the children list
            // This is needed to generate a consistent ordering of re-inserted nodes in the childrenAfterGroup array
            const key = this.key;
            const parentChildren = parent.children;
            if (parentChildren?.delete(key)) {
                parentChildren.set(key, this);
                if (this.oldRow !== null) {
                    parent.childChanged = true;
                }
            }
        }

        return true;
    }

    /**
     * Used to free memory and break the association to the node row
     * It does not invalidate and does not update the parent ghost status.
     * After destroyed this node cannot be used, and need to be thrown away.
     * It is safe to destroy the root however.
     */
    public remove(): void {
        const parent = this.parent;
        if (parent?.children?.delete(this.key)) {
            if (this.ghost) {
                --parent.ghostsCount;
            }
        }
        (this as TreeNodeWritablePrivateFields).parent = null;
        this.children = null;
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
        const { children: map, allLeafChildren: output } = this;
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

    /**
     * Called during commit to make the id of a new filler node.
     * We put "row-group-" before the group id, so it doesn't clash with standard row id's.
     * We also use 't-' and 'b-' for top pinned and bottom pinned rows.
     */
    public fillerRowId(): string {
        let id = this.level + '-' + this.key;
        for (let p = this.parent; p?.parent; p = p.parent) {
            id = `${p.level}-${p.key}-${id}`;
        }
        return RowNode.ID_PREFIX_ROW_GROUP + id;
    }
}
