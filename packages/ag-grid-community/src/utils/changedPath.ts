import type { RowNode } from '../entities/rowNode';
import type { ChangedCellsPath } from './changedPathImpl/changedCellsPath';
import type { ChangedRowsPath } from './changedPathImpl/changedRowsPath';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export { ChangedCellsPath } from './changedPathImpl/changedCellsPath';
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export { ChangedRowsPath } from './changedPathImpl/changedRowsPath';

/**
 * Discriminated union of `ChangedRowsPath | ChangedCellsPath`.
 * Both share `addRow`, `addCell`, `hasRow`, and `getSortedRows`.
 *
 * Narrow on `kind` to access cell-specific methods on `ChangedCellsPath`.
 *
 * ```ts
 * changedPath.addCell(rowNode, colId); // works on both — ChangedRowsPath ignores colId
 * if (changedPath.kind === 'cells') {
 *     changedPath.hasCellBySlot(rowSlot, colSlot); // cell-specific
 * }
 * ```
 *
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export type ChangedPath = ChangedRowsPath | ChangedCellsPath;

const forEachGroupDepthFirst = (children: RowNode[], callback: (rowNode: RowNode) => void): void => {
    for (let i = 0, len = children.length; i < len; ++i) {
        const child = children[i];
        const grandChildren = child.childrenAfterGroup;
        if (grandChildren !== null) {
            forEachGroupDepthFirst(grandChildren, callback);
            callback(child);
        }
    }
};

/**
 * Visits group nodes in post-order (deepest-first), skipping leaf nodes.
 * When `changedPath` is provided, visits only changed nodes with `childrenAfterGroup` set.
 * When `changedPath` is `null`/`undefined`, performs a full post-order traversal of nodes with `childrenAfterGroup`.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _forEachChangedGroupDepthFirst = (
    rootNode: RowNode | null | undefined,
    changedPath: ChangedPath | null | undefined,
    callback: (rowNode: RowNode) => void
): void => {
    if (changedPath != null) {
        const rows = changedPath.getSortedRows();
        for (let i = 0, len = rows.length; i < len; ++i) {
            const row = rows[i];
            if (row.childrenAfterGroup !== null && !row.destroyed) {
                callback(row);
            }
        }
        return;
    }
    if (rootNode != null) {
        const children = rootNode.childrenAfterGroup;
        if (children !== null) {
            forEachGroupDepthFirst(children, callback);
            callback(rootNode);
        }
    }
};
