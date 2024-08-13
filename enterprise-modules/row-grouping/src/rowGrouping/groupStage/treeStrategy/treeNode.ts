import type { ITreeNode, RowNode } from '@ag-grid-community/core';

import type { TreeRow } from './treeRow';

export type RowNodeOrder = { readonly [id: string]: number | undefined };

/**
 * An empty array, used to set an empty array to the childrenAfterGroup and allLeafChildren arrays without allocating a new one for each leaf.
 * Leaves don't have children, using a preallocated empty array reduces memory usage and GC pressure considerably.
 */
const EMPTY_ARRAY = Object.freeze([]) as unknown as any[];

/** An empty iterator, to avoid null checking when we iterate the children map */
const EMPTY_CHILDREN = (EMPTY_ARRAY as TreeNode[]).values();

/**
 * Given a row, extract the row index from the rowNodeOrder map.
 * @returns the row index, or -1 if the row is not found.
 */
const getRowIndex = (row: RowNode | null | undefined, rowNodeOrder: RowNodeOrder): number => {
    if (row?.data) {
        const id = row.id;
        if (id !== undefined) {
            const order = rowNodeOrder[id];
            if (typeof order === 'number') {
                return order;
            }
        }
    }
    return -1;
};

/** Compare two RowNode by the TreeNode rowPosition. Assumes TreeNode to be set and valid. */
const rowPositionComparer = (a: RowNode, b: RowNode): number => a.treeNode!.rowPosition - b.treeNode!.rowPosition;

/**
 * We keep a secondary tree data structure together with the rows.
 * We associate a node with a TreeNode, both storing the row in node.row and by storing the TreeNode in a hidden field in the row.
 * We break the association when the row is removed or the TreeStrategy destroyed.
 *
 * TreeStrategy uses a two stage approach both for first time creation and updates.
 * Multiple updates interact with the tree, and a commit stage commits all updates reducing expensive computations.
 * The map of children is kept in a consistent order of insertion.
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
export class TreeNode implements ITreeNode {
    /**
     * The children of the tree, where the key is the node key and the value is the child node.
     * We use this to avoid exploring the whole tree during commit, we will just go to the paths
     * that are changed in DFS order.
     * This map is null if the node has no children, and is created lazily. This to reduce memory usage and GC pressure.
     */
    private children: Map<string, TreeNode> | null = null;

    /**
     * The head of the linked list of direct children nodes that are invalidated and need to be committed.
     * We use a linked list so we can invalidate the whole path and explore only the invalidated during commit.
     * Also, once a path is invalidated the next invalidation will not add the same node again and stop the recursion quickly.
     * With a linked list we don't need to allocate any new array or object, we just change the pointers, this is fast.
     */
    private invalidatedHead: TreeNode | null = null;

    /**
     * The next node in the linked list of parent.invalidatedHead.
     * - undefined: the node is not invalidated (not present in the parent linked list)
     * - null: this is the first and last node in the linked list
     * - TreeNode instance: is the next node in the linked list
     */
    private invalidatedNext: TreeNode | null | undefined = undefined;

    /**
     * Keep track of the number of children that are ghosts in this node.
     * Since we do not delete the children during the prepare stage, before the commit, we need to keep track of how many there are.
     * A ghost node is a node that:
     *  - is not the root
     *  - AND is a filler node (it has no row, or no row.data)
     *  - AND all the nodes of its subtrees are ghosts or fillers (they have row null, or no row.data)
     *
     * This is used to update the ghost status of the nodes without recursing the whole subtree, as checking if children.size === ghosts is O(1).
     * When a node switch from being ghost to being a normal node, we move it at the end of the children list, to maintain the insertion order.
     * Think about deleting the single leaf of a filler node, if the filler node has to be inserted again, it should be at the end of the children list.
     */
    private ghosts: number = 0;

    /**
     * Used when sorting.
     * If this is a filler node, is the rowPosition of the first child.
     * If this is a leaf node with no children, is the rowIndex.
     * If this is a leaf node with children, is the min(this.rowPosition, childrenAfterGroup[0].rowPosition)
     */
    public rowPosition: number = -1;

    /**
     * We use this to keep track if children were removed or added and moved, so we can skip
     * recomputing the whole childrenAfterGroup and allLeafChildren array if not needed.
     * Reset during commit.
     */
    public childrenChanged: boolean = false;

    /** True allLeafChildren should be recomputed. Reset to false during commit. */
    public leafChildrenChanged: boolean = false;

    /**  True if changedPath.addParentNode(row) should be called on this node. Reset to false during commit. */
    public pathChanged: boolean = false;

    /** The RowNode associated to this tree node */
    public row: TreeRow | null = null;

    /** We use this during commit to understand if the row changed. After commit, it will be the same as this.row. */
    public oldRow: TreeRow | null = null;

    /** We keep the row.childrenAfterGroup here, we just swap arrays when we assign rows */
    public childrenAfterGroup: TreeRow[] = EMPTY_ARRAY;

    /**
     * We keep the row.allLeafChildren here, we just swap arrays when we assign or swap the row to this node.
     * If this is null, we are borrowing the allLeafChildren array from one of the children,
     * in this case the row.allLeafChildren will be the same as one of the childrenAfterGroup[x].allLeafChildren,
     * to get the allLeafChildren if is null, do node.allLeafChildren ?? node.row.allLeafChildren.
     */
    private allLeafChildren: TreeRow[] | null = EMPTY_ARRAY;

    public constructor(
        /** The parent node of this node, or null if removed or the root. */
        public parent: TreeNode | null,

        /** The key of this node. */
        public readonly key: string,

        /** The level of this node. Root has level -1 */
        public readonly level: number,

        /** A ghost node is a node that should be removed */
        public ghost: boolean
    ) {}

    /** Returns an iterator able to iterate all children in this node, in order of insertion */
    public enumChildren(): IterableIterator<TreeNode> {
        return this.children?.values() ?? EMPTY_CHILDREN;
    }

    /**
     * Gets a node a key in the given parent. If the node does not exists, creates a filler node, with null row.
     * We cast to string just to be sure the user passed a string correctly and not a number.
     * @returns the node at the given key, or a new filler node inserted there if it does not exist.
     */
    public upsertKey(key: string | number): TreeNode {
        if (typeof key !== 'string') {
            key = String(key);
        }
        let node = this.children?.get(key);
        if (!node) {
            node = new TreeNode(this, key, this.level + 1, true);
            (this.children ??= new Map()).set(key, node);
            ++this.ghosts;
        }
        return node;
    }

    /** Bidirectionally links (or unlink) a row to a node. */
    public linkRow(newRow: TreeRow | null): boolean {
        const { row: oldRow } = this;

        if (oldRow === newRow) {
            return false; // No change
        }

        let oldRowAllLeafChildren: TreeRow[] | null = null;
        if (oldRow) {
            oldRow.treeNode = null;
            oldRow.parent = null;
            oldRow.level = 0;
            if (this.level >= 0) {
                oldRowAllLeafChildren = oldRow.allLeafChildren;
                oldRow.childrenAfterGroup = null;
                oldRow.allLeafChildren = null;
            } else {
                oldRow.childrenAfterGroup = []; // root
            }
        }

        if (newRow) {
            newRow.treeNode = this;
            newRow.parent = this.parent?.row ?? null;
            newRow.level = this.level;
            newRow.childrenAfterGroup = this.childrenAfterGroup;
            if (this.level >= 0) {
                newRow.allLeafChildren = this.allLeafChildren ?? oldRowAllLeafChildren ?? EMPTY_ARRAY;
            }
        }

        this.row = newRow;

        return true;
    }

    /**
     * Updates the ghost status of this node and all its parents until the root is reached.
     * Is optimized to avoid updating the ghost status of the parents if the ghost status of a node did not change.
     * @returns true if the ghost status of this node changed, false if it was already the same.
     */
    public updateIsGhost(): boolean {
        // We update the ghost state recursively
        if (!this.updateThisIsGhost()) {
            return false;
        }
        let current: TreeNode | null = this;
        do {
            current = current.parent;
        } while (current?.updateThisIsGhost());
        return true;
    }

    /**
     * Updates the ghost status of this node.
     * This method does not update the status of the parents.
     * @returns true if the ghost status changed, false if it was already the same.
     */
    private updateThisIsGhost(): boolean {
        const { parent, row, ghost } = this;
        if (parent === null) {
            return false; // Root cannot be a ghost
        }

        const newGhost = !row?.data && this.ghosts === (this.children?.size ?? 0);
        if (newGhost === ghost) {
            return false; // No changes
        }

        this.ghost = newGhost;

        if (newGhost) {
            ++parent.ghosts; // We have a new ghost
        } else {
            --parent.ghosts; // Resurrection

            // This was a ghost node, now is not, move the node at the end of the children list
            // We need to do this to keep the order consistent, a node reinserted must go at the end.
            const key = this.key;
            const parentChildren = parent.children;
            if (parentChildren?.delete(key)) {
                parentChildren.set(key, this);
                if (this.oldRow !== null) {
                    parent.childrenChanged = true;
                }
            }
        }

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
        let parent = this.parent;
        while (parent !== null && node.invalidatedNext === undefined) {
            node.invalidatedNext = parent.invalidatedHead;
            parent.invalidatedHead = node;
            node = parent;
            parent = node.parent;
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
     * Used to free memory and break the association to the node row
     * It does not invalidate and does not update the parent ghost status.
     * After destroyed this node cannot be used, and need to be thrown away.
     * It is safe to destroy the root however.
     */
    public destroy(): void {
        const parent = this.parent;
        if (parent?.children?.delete(this.key)) {
            if (this.ghost) {
                --parent.ghosts;
            }
        }
        this.oldRow = null;
        this.parent = null;
        this.children = null;
        this.childrenAfterGroup = EMPTY_ARRAY;
        if (this.level >= 0) {
            this.allLeafChildren = EMPTY_ARRAY; // Not the root
        }
    }

    /**
     * When we receive rowNodeOrder not undefined, we need to update the rowPosition of the node,
     * to ensure it will be sorted in the right order in childrenAfterGroup.
     * This function computes the right rowPosition for the node, based on the rowNodeOrder map.
     *
     * We need to compute the minimum between the rowIndex of this node and the first child, recursively.
     * This is because we need to find the find out which row first "created" this group.
     *
     * Implementation is not recursive however, is O(1) here because this function assumes the children are already
     * sorted correctly, and childrenAfterGroup of the children are already computed in the right order (post-order DFS).
     *
     * So this function makes sense to be called only in the post-order commit DFS.
     *
     * @returns the rowPosition the node should have.
     */
    public getRowPosition(rowNodeOrder: RowNodeOrder): number {
        let rowPosition = getRowIndex(this.row, rowNodeOrder);
        if (this.childrenAfterGroup.length > 0) {
            const firstChildRowPosition = this.childrenAfterGroup[0].treeNode!.rowPosition;
            if (firstChildRowPosition >= 0 && (rowPosition < 0 || firstChildRowPosition < rowPosition)) {
                rowPosition = firstChildRowPosition;
            }
        }
        return rowPosition < 0 ? this.rowPosition : rowPosition;
    }

    /**
     * This is called in post order during commit to update the childrenAfterGroup array.
     * It uses the rowNodeOrder map to sort the children in the right order, if is passed.
     * It assumes all children childrenAfterGroup are up to date and rows all created.
     *
     * It replaces the array with EMPTY_ARRAY if there are no children, to reduce memory usage and GC pressure.
     * It does sort the children only if strictly needed, to avoid unnecessary work.
     *
     * If the order changes, also the order in the children map will be updated,
     * so the next call to enumChildren() will return the children in the right order.
     */
    public updateChildrenAfterGroup(rowNodeOrder: RowNodeOrder | undefined): void {
        this.childrenChanged = false; // Reset the flag for this node

        let nodesChanged = false;
        let orderChanged = false;
        let childrenAfterGroup = this.childrenAfterGroup;
        const children = this.children;
        const childrenCount = children?.size ?? 0;
        if (childrenCount === 0) {
            // No children

            if (childrenAfterGroup.length > 0) {
                nodesChanged = true;
                this.childrenAfterGroup = EMPTY_ARRAY;
                this.row!.childrenAfterGroup = EMPTY_ARRAY;
            }
        } else {
            // We have children

            if (childrenAfterGroup.length !== childrenCount) {
                nodesChanged = true;
                if (childrenAfterGroup === EMPTY_ARRAY) {
                    childrenAfterGroup = new Array(childrenCount);
                    this.childrenAfterGroup = childrenAfterGroup;
                    this.row!.childrenAfterGroup = childrenAfterGroup;
                } else {
                    childrenAfterGroup.length = childrenCount;
                }
            }

            if (rowNodeOrder) {
                // We have an order to follow, as rowNodeOrder was passed

                let writeIdx = 0; // Keep track of where we are writing in the childrenAfterGroup array
                let prevPosition = -1;
                for (const child of children!.values()) {
                    const nextPosition = child.getRowPosition(rowNodeOrder);
                    child.rowPosition = nextPosition;
                    const row = child.row!;
                    if (nodesChanged || childrenAfterGroup[writeIdx] !== row) {
                        childrenAfterGroup[writeIdx] = child.row!;
                        nodesChanged = true;
                    }
                    ++writeIdx;
                    if (prevPosition > nextPosition) {
                        orderChanged = true;
                    }
                    prevPosition = nextPosition;
                }

                if (orderChanged) {
                    childrenAfterGroup.sort(rowPositionComparer);

                    // We need to rebuild the children map in the right order
                    children!.clear();
                    for (let i = 0; i < childrenCount; ++i) {
                        const node = childrenAfterGroup[i].treeNode! as TreeNode;
                        children!.set(node.key, node);
                    }
                }
            } else {
                // We follow the order that is already in the children map

                let writeIdx = 0;
                for (const child of children!.values()) {
                    const row = child.row!;
                    if (nodesChanged || childrenAfterGroup[writeIdx] !== row) {
                        childrenAfterGroup[writeIdx] = row;
                        nodesChanged = true;
                    }
                    ++writeIdx;
                }
            }
        }

        if (nodesChanged) {
            // If there are changed elements, we need to recompute the allLeafChildren
            // I don't think it matters to update the leafs if only order changed, we avoid unnecessary work.
            this.leafChildrenChanged = true;

            // Children changed, we need to call changedPath.addParentNode
            this.pathChanged = true;
        } else if (orderChanged) {
            // Order of children changed, we need to call changedPath.addParentNode
            this.pathChanged = true;
        }
    }

    /**
     * Rebuild the allLeafChildren rows array of a node.
     * It uses childrenAfterGroup, we assume to be already updated.
     * This is called in post order during commit, after the childrenAfterGroup are updated with updateChildrenAfterGroup().
     * It uses the allLeafChildren of all the children, we assume is already updated.
     */
    public updateAllLeafChildren(): void {
        const { parent, row, childrenAfterGroup } = this;

        this.leafChildrenChanged = false; // Reset the flag for this node

        let nodesChanged = false;
        const childrenAfterGroupLen = childrenAfterGroup.length;
        if (childrenAfterGroupLen === 0) {
            // No children, no leaf nodes.
            nodesChanged = row!.allLeafChildren?.length !== 0;
            row!.allLeafChildren = EMPTY_ARRAY;
            this.allLeafChildren = EMPTY_ARRAY;
        } else if (childrenAfterGroupLen === 1 && childrenAfterGroup[0].allLeafChildren?.length) {
            // We can avoid building the leaf children array if we are a node with just one child that has leafs
            // In this case we use the allLeafChildren of the child by assigning it to this.row.allLeafChildren in O(1)
            // and without occupying any extra memory.

            row!.allLeafChildren = childrenAfterGroup[0].allLeafChildren; // Use the same array

            // Set allLeafChildren to null as indicator that we are borrowing the array from one of the children
            // This is used to prevent `updateAllLeafChildren` modifying this array in a future pass, if this nodes
            // direct children have been updated.
            // In this case we will have to use this.row.allLeafChildren to access the allLeafChildren array.
            this.allLeafChildren = null;

            nodesChanged = true; // This must be true as this may come from a child that changed
        } else {
            // We need to rebuild the allLeafChildren array, we use children allLeafChildren arrays

            let allLeafChildren = this.allLeafChildren;
            if (allLeafChildren === EMPTY_ARRAY || allLeafChildren === null) {
                allLeafChildren = [];
                this.allLeafChildren = allLeafChildren;
            }
            const oldAllLeafChildrenLength = allLeafChildren.length;

            let writeIdx = 0;
            for (let i = 0; i < childrenAfterGroupLen; ++i) {
                const childRow = childrenAfterGroup[i];
                const childAllLeafChildren = childRow.allLeafChildren!;
                const childAllLeafChildrenLen = childAllLeafChildren.length;
                if (childAllLeafChildrenLen) {
                    for (let j = 0; j < childAllLeafChildrenLen; ++j) {
                        const leaf = childAllLeafChildren[j];
                        if (writeIdx >= oldAllLeafChildrenLength || allLeafChildren[writeIdx] !== leaf) {
                            allLeafChildren[writeIdx] = leaf;
                            nodesChanged = true;
                        }
                        ++writeIdx;
                    }
                } else {
                    if ((writeIdx >= oldAllLeafChildrenLength || allLeafChildren[writeIdx] !== childRow) && childRow) {
                        allLeafChildren[writeIdx] = childRow;
                        nodesChanged = true;
                    }
                    ++writeIdx;
                }
            }
            if (oldAllLeafChildrenLength !== writeIdx) {
                allLeafChildren.length = writeIdx;
                nodesChanged = true;
            }
            if (row!.allLeafChildren !== allLeafChildren) {
                nodesChanged = true;
                row!.allLeafChildren = allLeafChildren;
            }
        }

        if (nodesChanged && parent) {
            parent.leafChildrenChanged = true; // Propagate to the parent, as it may need to rebuild its allLeafChildren too
        }
    }
}
