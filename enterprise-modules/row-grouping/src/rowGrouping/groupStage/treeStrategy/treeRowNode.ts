import type { RowNode } from '@ag-grid-community/core';

import type { TreeNode } from './treeNode';

/**
 * Symbol used to map a TreeNode to a RowNode, so we can find the right tree node for a row in O(1).
 * The association is disposed when the row is removed from the tree, or, when the TreeStrategy gets disposed.
 */
const NODE_SYM = Symbol('treeNode');

const STATE_SYM = Symbol('treeNodeState');

const enum Flags {
    None = 0,
    Committed = 0x01,
    ExpandedInitialized = 0x02,
    RowUpdated = 0x04,
}

/** Extends the RowNode with additional private fields */
interface TreeRow extends RowNode {
    [NODE_SYM]?: TreeNode | null;
    [STATE_SYM]?: Flags;
}

/** Gets the TreeNode associated to a RowNode */
export const getTreeRowTreeNode = (row: TreeRow | null | undefined): TreeNode | null => row?.[NODE_SYM] ?? null;

/** Used to link a TreeNode to a RowNode */
export const setTreeRowTreeNode = (row: TreeRow, value: TreeNode | null) => {
    row[NODE_SYM] = value;
};

/** We set this on the first time the node is committed. We unset this if the row gets deleted. */
export const isTreeRowCommitted = (row: TreeRow): boolean => (row[STATE_SYM]! & Flags.Committed) !== 0;

/** We use this to initialize the expanded state only once per row, no matter if it was re-added or updated */
export const isTreeRowExpandedInitialized = (row: TreeRow): boolean =>
    (row[STATE_SYM]! & Flags.ExpandedInitialized) !== 0;

/** Clears the expanded initialized state, so it can be recomputed again. Called when a row is explicitly removed from the tree */
export const clearExpandedInitialized = (row: TreeRow): void => {
    row[STATE_SYM]! &= ~Flags.ExpandedInitialized;
};

/** We use this to mark a row as updated by an updated transaction */
export const isTreeRowUpdated = (row: TreeRow): boolean => (row[STATE_SYM]! & Flags.RowUpdated) !== 0;

/** We use this to mark a row as updated by an updated transaction */
export const setTreeRowUpdated = (row: TreeRow): void => {
    row[STATE_SYM]! |= Flags.RowUpdated;
};

/** Called when the row is committed. */
export const treeRowCommitted = (row: TreeRow): void => {
    if (row[STATE_SYM]! & Flags.RowUpdated) {
        // hack - if we didn't do this, then renaming a tree item (ie changing rowNode.key) wouldn't get
        // refreshed into the gui.
        // this is needed to kick off the event that rowComp listens to for refresh. this in turn
        // then will get each cell in the row to refresh - which is what we need as we don't know which
        // columns will be displaying the rowNode.key info.
        row.setData(row.data);
    }
    row[STATE_SYM] = Flags.Committed | Flags.ExpandedInitialized;
};

/** Called when the row needs to be deleted */
export const treeRowDeleted = (row: TreeRow): void => {
    // We execute this only if the row was committed at least once before, and not already deleted.
    if (isTreeRowCommitted(row)) {
        row.setRowIndex(null);

        // this is important for transition, see rowComp removeFirstPassFuncs. when doing animation and
        // remove, if rowTop is still present, the rowComp thinks it's just moved position.
        row.setRowTop(null);

        if (!row.data) {
            // we remove selection on filler nodes here, as the selection would not be removed
            // from the RowNodeManager, as filler nodes don't exist on the RowNodeManager
            row.setSelectedParams({ newValue: false, source: 'rowGroupChanged' });
        }
    }

    row[STATE_SYM] = 0;
};
