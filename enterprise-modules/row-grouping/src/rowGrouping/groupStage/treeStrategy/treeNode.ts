import type { ITreeNode } from '@ag-grid-community/core';

import { positionInRootChildrenComparer } from './treeRow';
import type { TreeRow } from './treeRow';

/**
 * An empty array, used to set an empty array to the childrenAfterGroup and allLeafChildren arrays without allocating a new one for each leaf.
 * Leaves don't have children, using a preallocated empty array reduces memory usage and GC pressure considerably.
 */
const EMPTY_ARRAY = Object.freeze([]) as unknown as any[];

/** An empty iterator, to avoid null checking when we iterate the children map */
const EMPTY_CHILDREN = (EMPTY_ARRAY as TreeNode[]).values();

/**
 * Disassociate a node from a row, breaking the association between to the node.
 * Leaves the node untouched, only the row is modified.
 */
const orphanRow = (row: TreeRow, root: boolean): void => {
    row.parent = null;
    row.treeNode = null;
    if (root) {
        row.childrenAfterGroup = [];
    } else {
        row.level = 0;
        row.childrenAfterGroup = null;
        row.allLeafChildren = null;
    }
};

/**
 * We keep a secondary tree data structure together with the rows.
 * We associate a node with a TreeNode, both storing the row in node.row and by storing the TreeNode in row.treeNode field.
 * We break the association when the row is removed or the TreeStrategy destroyed.
 * Consider that a TreeNode can contain more than one row if there are duplicates keys in the same group,
 * in this case it means that the rows will have the same TreeNode.
 *
 * TreeStrategy uses a two stage approach both for first time creation and updates.
 * Multiple updates interact with the tree, and a commit stage commits all updates reducing expensive computations.
 * The map of children is kept in a consistent order of insertion.
 *
 * Operations will invalidate the affected paths with node.invalidate(), so that the commit operation will only
 * update the affected paths without traversing the whole tree.
 * Consider that order of invalidated items is not deterministic, so the commit operation should be able to handle any order.
 *
 * During commit, the childrenAfterGroup and allLeafChildren arrays are rebuilt, and the updates are applied.
 * The empty filler nodes nodes are removed.
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

    /** There may be duplicate rows if they have the same key */
    public duplicateRows: Set<TreeRow> | null = null;

    /** We use this during commit to understand if the row changed. After commit, it will be the same as this.row. */
    public oldRow: TreeRow | null = null;

    /** We keep the row.childrenAfterGroup here, we just swap arrays when we assign rows */
    public childrenAfterGroup: TreeRow[] = EMPTY_ARRAY;

    /** This is set if the duplicate key warning was already raised for this node, to reduce the performance hit */
    public duplicateRowsWarned?: boolean;

    /**
     * We keep the row.allLeafChildren here, we just swap arrays when we assign or swap the row to this node.
     * If this is null, we are borrowing the allLeafChildren array from one of the children,
     * in this case the row.allLeafChildren will be the same as one of the childrenAfterGroup[x].allLeafChildren,
     * to get the allLeafChildren if is null, do node.allLeafChildren ?? node.row.allLeafChildren.
     */
    private allLeafChildren: TreeRow[] | null = EMPTY_ARRAY;

    public oldRowPosition: number = -1;

    public constructor(
        /** The parent node of this node, or null if removed or the root. */
        public parent: TreeNode | null,

        /** The key of this node. */
        public readonly key: string,

        /** The level of this node. Root has level -1 */
        public readonly level: number
    ) {}

    public isEmptyFillerNode(): boolean {
        return !this.row?.data && !this.children?.size;
    }

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
            node = new TreeNode(this, key, this.level + 1);
            (this.children ??= new Map()).set(key, node);
        }
        return node;
    }

    public setRow(newRow: TreeRow): boolean {
        const { parent, level, row: oldRow, childrenAfterGroup } = this;
        if (level < 0) {
            newRow.parent = null; // root
            if (oldRow !== null && oldRow !== newRow) {
                orphanRow(oldRow, true);
            }
        } else {
            if (oldRow === newRow) {
                return false; // Already the same row
            }
            newRow.parent = parent?.row ?? null;
            if (oldRow !== null) {
                newRow.allLeafChildren = oldRow.allLeafChildren ?? this.allLeafChildren ?? EMPTY_ARRAY;
                orphanRow(oldRow, false); // Unlink the old row, is being replaced
            } else {
                newRow.allLeafChildren = this.allLeafChildren ?? EMPTY_ARRAY;
            }
        }
        newRow.childrenAfterGroup = childrenAfterGroup;
        newRow.level = level;
        newRow.treeNode = this;
        this.row = newRow;
        return true;
    }

    public addDuplicateRow(newRow: TreeRow): boolean {
        const { parent, level } = this;
        let duplicateRows = this.duplicateRows;
        if (duplicateRows === null) {
            duplicateRows = new Set();
            this.duplicateRows = duplicateRows;
        } else if (duplicateRows.has(newRow)) {
            return false; // Already present
        }

        duplicateRows.add(newRow);

        newRow.treeNode = this;
        newRow.parent = parent?.row ?? null;
        newRow.level = level;
        newRow.childrenAfterGroup = EMPTY_ARRAY;
        if (level >= 0) {
            newRow.allLeafChildren = EMPTY_ARRAY;
        }
        return true;
    }

    public removeRow(rowToRemove: TreeRow): boolean {
        const { level, row, duplicateRows, childrenAfterGroup } = this;
        if (row === rowToRemove) {
            // Pop the first row from the duplicate rows and use that as first row
            const first: TreeRow | null | undefined = duplicateRows?.values().next().value;
            if (first) {
                this.row = first;
                duplicateRows!.delete(first);
                if (duplicateRows!.size === 0) {
                    this.duplicateRows = null;
                }
                first.childrenAfterGroup = childrenAfterGroup;
                if (level >= 0) {
                    first.allLeafChildren = row.allLeafChildren ?? this.allLeafChildren ?? EMPTY_ARRAY;
                }
            } else {
                this.row = null;
            }
        } else {
            // Delete from the duplicate rows
            if (!duplicateRows?.delete(rowToRemove)) {
                return false; // Not found
            }
            if (duplicateRows.size === 0) {
                this.duplicateRows = null; // Free memory
            }
        }
        orphanRow(rowToRemove, level < 0);
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
     * It does not invalidate the path.
     * After destroyed this node cannot be used, and need to be thrown away.
     * It is safe to destroy the root however.
     */
    public destroy(): void {
        const { parent, level } = this;
        parent?.children?.delete(this.key);
        this.oldRow = null;
        this.parent = null;
        this.children = null;
        this.childrenAfterGroup = EMPTY_ARRAY;
        if (level >= 0) {
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
    public getRowPosition(): number {
        const row = this.row;
        if (row === null) {
            return -1; // No row, no position yet
        }
        if (row.data) {
            return row.positionInRootChildren;
        }
        // This assumes the children are already updated
        return this.childrenAfterGroup.length > 0 ? this.childrenAfterGroup[0].positionInRootChildren : -1;
    }

    public sortDuplicateRows() {
        const oldFirstRow = this.row!;
        const duplicateRows = this.duplicateRows!;

        let inOrder = true;
        let prevOrder = oldFirstRow.positionInRootChildren;
        for (const row of duplicateRows) {
            const order = row.positionInRootChildren;
            if (order <= prevOrder) {
                inOrder = false;
                break;
            }
            prevOrder = order;
        }

        if (!inOrder) {
            const allDuplicatesArray = Array.from(duplicateRows);
            allDuplicatesArray.push(oldFirstRow);
            allDuplicatesArray.sort(positionInRootChildrenComparer);

            duplicateRows.clear();
            for (let i = 1, len = allDuplicatesArray.length; i < len; ++i) {
                duplicateRows.add(allDuplicatesArray[i]);
            }

            const newFirstRow = allDuplicatesArray[0];

            if (newFirstRow !== oldFirstRow) {
                newFirstRow.childrenAfterGroup = this.childrenAfterGroup;
                newFirstRow.allLeafChildren = oldFirstRow.allLeafChildren ?? this.allLeafChildren ?? EMPTY_ARRAY;

                oldFirstRow.childrenAfterGroup = EMPTY_ARRAY;
                oldFirstRow.allLeafChildren = EMPTY_ARRAY;

                this.row = newFirstRow;
            }
        }
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
    public updateChildrenAfterGroup(): void {
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

            let writeIdx = 0; // Keep track of where we are writing in the childrenAfterGroup array
            let prevPosition = -1;
            for (const child of children!.values()) {
                const nextPosition = child.getRowPosition();
                const row = child.row!;
                row.positionInRootChildren = nextPosition;
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
                childrenAfterGroup.sort(positionInRootChildrenComparer);

                // We need to rebuild the children map in the right order
                children!.clear();
                for (let i = 0; i < childrenCount; ++i) {
                    const node = childrenAfterGroup[i].treeNode! as TreeNode;
                    children!.set(node.key, node);
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
