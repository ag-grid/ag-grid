import type { ITreeNode, RowNode } from '@ag-grid-community/core';

export type RowNodeOrder = { readonly [id: string]: number | undefined };

export const EMPTY_ARRAY = Object.freeze([]) as unknown as any[];

/** An empty iterator */
const EMPTY_CHILDREN = EMPTY_ARRAY.values();

export const getRowIndex = (row: RowNode | null | undefined, rowNodeOrder: RowNodeOrder): number => {
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

/** Compare two RowNode by the TreeNode rowOrder. Assumes TreeNode to be set and valid. */
const rowOrderComparer = (a: RowNode, b: RowNode): number =>
    (a.treeNode! as TreeNode).rowOrder - (b.treeNode! as TreeNode).rowOrder;

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
    public row: RowNode | null = null;

    /** We keep the row.childrenAfterGroup here, we just swap arrays when we assign rows */
    public childrenAfterGroup: RowNode[] = EMPTY_ARRAY;

    /** We keep the row.allLeafChildren here, we just swap arrays when we assign rows */
    public allLeafChildren: RowNode[] = EMPTY_ARRAY;

    /** We use this during commit to understand if the row changed. After commit, it will be the same as this.row. */
    public oldRow: RowNode | null = null;

    /** Keep track of the number of children that are ghosts in this node */
    private ghostsCount: number = 0;

    /** Coming from rowNodeOrder, or, first time, from the index of the row in the root.allLeafChildren array */
    public rowIndex: number = -1;

    /**  True if changedPath.addParentNode(row) should be called on this node. Reset to false during commit. */
    public pathChanged: boolean = false;

    /**
     * We use this to keep track if children were removed or added and moved, so we can skip
     * recomputing the whole childrenAfterGroup and allLeafChildren array if not needed.
     * Reset during commit.
     */
    public childrenChanged: boolean = false;

    /** True allLeafChildren should be recomputed. Reset to false during commit. */
    public leafChildrenChanged: boolean = false;

    /**
     * Used when sorting.
     * If this is a filler node, is the rowOrder of the first child.
     * If this is a leaf node with no children, is the rowIndex.
     * If this is a leaf node with children, is the min(this.rowOrder, childrenAfterGroup[0].rowOrder)
     */
    public rowOrder: number = -1;

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
            ++this.ghostsCount;
        }
        return node;
    }

    /** Bidirectionally links (or unlink) a row to a node. */
    public linkRow(newRow: RowNode | null): boolean {
        const { row: oldRow } = this;

        if (oldRow === newRow) {
            return false; // No change
        }

        if (oldRow) {
            oldRow.treeNode = null;
            oldRow.parent = null;
            oldRow.level = 0;
            if (this.level >= 0) {
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
                newRow.allLeafChildren = this.allLeafChildren;
            }
        }

        this.row = newRow;

        return true;
    }

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

        const newGhost = !row?.data && this.ghostsCount === (this.children?.size ?? 0);
        if (newGhost === ghost) {
            return false; // No changes
        }

        this.ghost = newGhost;

        if (newGhost) {
            ++parent.ghostsCount;
        } else {
            --parent.ghostsCount;

            // This was a ghost node, now is not, move the node at the end of the children list
            // We need to do this to keep the order of insertion consistent if rowNodeOrder is not passed during transactions
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
    public remove(): void {
        const parent = this.parent;
        if (parent?.children?.delete(this.key)) {
            if (this.ghost) {
                --parent.ghostsCount;
            }
        }
        this.parent = null;
        this.children = null;
    }

    public getNewRowOrder(rowNodeOrder: RowNodeOrder, rowIndex = getRowIndex(this.row, rowNodeOrder)): number {
        let result = rowIndex;
        if (result < 0) {
            result = this.rowIndex;
        } else {
            this.rowIndex = result;
        }

        let currentNode: TreeNode | null = this;

        while (currentNode?.childrenAfterGroup.length > 0) {
            const firstChildNode = currentNode.childrenAfterGroup[0].treeNode! as TreeNode;
            let firstChildRowOrder = getRowIndex(firstChildNode.row, rowNodeOrder);
            if (firstChildRowOrder < 0) {
                firstChildRowOrder = firstChildNode.rowIndex;
            }

            if (firstChildRowOrder >= 0 && (result < 0 || firstChildRowOrder < result)) {
                result = firstChildRowOrder;
            }

            currentNode = firstChildNode;
        }

        return result;
    }

    public updateChildrenAfterGroup(rowNodeOrder: RowNodeOrder | undefined): void {
        this.childrenChanged = false; // Reset the flag for this node

        let count = 0;
        let changed = false;
        let orderChanged = false;
        let output = this.childrenAfterGroup;
        const children = this.children;
        const childrenCount = children?.size ?? 0;
        if (childrenCount === 0) {
            // No children

            if (output.length > 0) {
                changed = true;
                this.childrenAfterGroup = EMPTY_ARRAY;
                this.row!.childrenAfterGroup = EMPTY_ARRAY;
            }
        } else {
            // We have children

            if (output.length !== childrenCount) {
                changed = true;
                if (output === EMPTY_ARRAY) {
                    output = new Array(childrenCount);
                    this.childrenAfterGroup = output;
                    this.row!.childrenAfterGroup = output;
                } else {
                    output.length = childrenCount;
                }
            }

            if (rowNodeOrder) {
                // We have an order to follow, as rowNodeOrder was passed

                let prevOrder = -1;
                for (const child of children!.values()) {
                    const newOrder = child.getNewRowOrder(rowNodeOrder);
                    child.rowOrder = newOrder;
                    const row = child.row!;
                    if (changed || output[count] !== row) {
                        output[count] = child.row!;
                        changed = true;
                    }
                    ++count;
                    if (prevOrder > newOrder) {
                        orderChanged = true;
                    }
                    prevOrder = newOrder;
                }

                if (orderChanged) {
                    output.sort(rowOrderComparer);

                    // We need to rebuild the children map in the right order
                    children!.clear();
                    for (let i = 0; i < count; ++i) {
                        const node = output[i].treeNode! as TreeNode;
                        children!.set(node.key, node);
                    }
                }
            } else {
                // We follow the order that is already in the children map

                for (const child of children!.values()) {
                    const row = child.row!;
                    if (changed || output[count] !== row) {
                        output[count] = row;
                        changed = true;
                    }
                    ++count;
                }
            }
        }

        if (changed) {
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
     * It uses the allLeafChildren of all the children, we assume is already updated.
     * @returns true if the array changed, false if not
     */
    public updateAllLeafChildren(): void {
        this.leafChildrenChanged = false; // Reset the flag for this node

        const { parent, row, childrenAfterGroup } = this;

        let changed = false;
        const childrenAfterGroupLen = childrenAfterGroup.length;

        if (childrenAfterGroupLen === 0) {
            // No children, no leaf nodes.
            changed = row!.allLeafChildren?.length !== 0;
            row!.allLeafChildren = EMPTY_ARRAY;
            this.allLeafChildren = EMPTY_ARRAY;
        } else if (childrenAfterGroupLen === 1 && childrenAfterGroup[0].allLeafChildren?.length) {
            // We can avoid building the leaf children array if we are a node with just one child that has leafs
            // In this case we use the allLeafChildren of the child by assigning it to this.row.allLeafChildren in O(1)
            // and without occupying any extra memory.
            changed = true; // This must be true as this may come from a child that changed
            this.allLeafChildren = EMPTY_ARRAY; // We cannot set here the the child allLeafChildren or it may get modified
            row!.allLeafChildren = childrenAfterGroup[0].allLeafChildren; // Use the same array
        } else {
            // We need to rebuild the allLeafChildren array, we use children allLeafChildren arrays

            let output = this.allLeafChildren;
            if (output === EMPTY_ARRAY) {
                output = [];
                this.allLeafChildren = output;
            }

            const oldLen = output.length;
            let count = 0;
            for (let i = 0; i < childrenAfterGroupLen; ++i) {
                const childRow = childrenAfterGroup[i];
                const childAllLeafChildren = childRow.allLeafChildren!;
                const jLen = childAllLeafChildren.length;
                if (jLen) {
                    for (let j = 0; j < jLen; j++) {
                        const leaf = childAllLeafChildren[j];
                        if (count >= oldLen || output[count] !== leaf) {
                            output[count] = leaf;
                            changed = true;
                        }
                        ++count;
                    }
                } else {
                    if ((count >= oldLen || output[count] !== childRow) && childRow) {
                        output[count] = childRow;
                        changed = true;
                    }
                    ++count;
                }
            }
            if (count !== oldLen) {
                changed = true;
                if (count > 0) {
                    output.length = count;
                } else {
                    output = EMPTY_ARRAY;
                    this.allLeafChildren = EMPTY_ARRAY;
                }
            }
            if (row!.allLeafChildren !== output) {
                if (!changed && (row!.allLeafChildren!.length > 0 || output.length > 0)) {
                    changed = true;
                }
                row!.allLeafChildren = output;
            }
        }

        if (changed && parent) {
            parent.leafChildrenChanged = true; // Propagate to the parent, as it may need to rebuild its allLeafChildren too
        }
    }
}
