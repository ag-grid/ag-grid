import type { RowNode } from '@ag-grid-community/core';

import type { TreeNode } from './treeNode';

/**
 * Symbol used to map a TreeNode to a RowNode, so we can find the right tree node for a row in O(1).
 * The association is disposed when the row is removed from the tree, or, when the TreeStrategy gets disposed.
 */
const NODE_SYM = Symbol('treeRow');

const FLAGS_SYM = Symbol('treeRowFlags');

const enum Flags {
    None = 0,
    Committed = 0x01,
    ExpandedInitialized = 0x02,
    RowUpdated = 0x04,
}

/** Extends the RowNode with additional private fields */
interface TreeRow extends RowNode {
    [NODE_SYM]?: TreeNode | null;
    [FLAGS_SYM]?: Flags;
}

/** Gets the TreeNode associated to a RowNode */
export const getTreeRowTreeNode = (row: TreeRow | null | undefined): TreeNode | null => row?.[NODE_SYM] ?? null;

/** Used to link a TreeNode to a RowNode */
export const setTreeRowTreeNode = (row: TreeRow, value: TreeNode | null) => {
    row[NODE_SYM] = value;
};

/** We set this on the first time the node is committed. We unset this if the row gets deleted. */
export const isTreeRowCommitted = (row: TreeRow): boolean => (row[FLAGS_SYM]! & Flags.Committed) !== 0;

/** Check if the expanded state needs to be initialized, first time for a node, or again if the node was removed */
export const isTreeRowExpandedInitialized = (row: TreeRow): boolean =>
    (row[FLAGS_SYM]! & Flags.ExpandedInitialized) !== 0;

/** We use this to mark a row as updated by an updated transaction */
export const isTreeRowUpdated = (row: TreeRow): boolean => (row[FLAGS_SYM]! & Flags.RowUpdated) !== 0;

/** Clears the expanded initialized state, so it can be recomputed again. Called when a row is explicitly removed from the tree */
export const unsetTreeRowExpandedInitialized = (row: TreeRow): void => {
    row[FLAGS_SYM]! &= ~Flags.ExpandedInitialized;
};

/** We use this to mark a row as updated by an updated transaction */
export const setTreeRowUpdated = (row: TreeRow): void => {
    row[FLAGS_SYM]! |= Flags.RowUpdated;
};

/** Called when the row is committed. */
export const markTreeRowCommitted = (row: TreeRow): void => {
    row[FLAGS_SYM] = Flags.Committed | Flags.ExpandedInitialized;
};

/** Clears all the flags, called when the row is deleted from the tree */
export const clearTreeRowFlags = (row: TreeRow): void => {
    row[FLAGS_SYM] = 0;
};
