import type { RowNode } from '@ag-grid-community/core';

const enum Flags {
    None = 0,
    Committed = 0x01,
    ExpandedInitialized = 0x02,
    RowUpdated = 0x04,
}

/** We set this on the first time the node is committed. We unset this if the row gets deleted. */
export const isTreeRowCommitted = (row: RowNode): boolean => (row.treeNodeFlags & Flags.Committed) !== 0;

/** Check if the expanded state needs to be initialized, first time for a node, or again if the node was removed */
export const isTreeRowExpandedInitialized = (row: RowNode): boolean =>
    (row.treeNodeFlags & Flags.ExpandedInitialized) !== 0;

/** We use this to mark a row as updated by an updated transaction */
export const isTreeRowUpdated = (row: RowNode): boolean => (row.treeNodeFlags & Flags.RowUpdated) !== 0;

/** Clears the expanded initialized state, so it can be recomputed again. Called when a row is explicitly removed from the tree */
export const unsetTreeRowExpandedInitialized = (row: RowNode): void => {
    row.treeNodeFlags &= ~Flags.ExpandedInitialized;
};

/** We use this to mark a row as updated by an updated transaction */
export const setTreeRowUpdated = (row: RowNode): void => {
    row.treeNodeFlags |= Flags.RowUpdated;
};

/** Called when the row is committed. */
export const markTreeRowCommitted = (row: RowNode): void => {
    row.treeNodeFlags = Flags.Committed | Flags.ExpandedInitialized;
};

/** Clears all the flags, called when the row is deleted from the tree */
export const clearTreeRowFlags = (row: RowNode): void => {
    row.treeNodeFlags = 0;
};
