import type { RowNode } from '../entities/rowNode';
import type { RefreshModelParams } from '../interfaces/iClientSideRowModel';
import type { IRowNode } from '../interfaces/iRowNode';

/**
 * Set-based ChangedPath — no column tracking.
 * All columns are considered changed for every node in the path.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface ChangedRowsPath {
    readonly kind: 'rows';

    /**
     * Adds `rowNode` and all its ancestors. No-op if null/undefined or already present.
     * Column tracking is ignored — delegates to row-level tracking only.
     */
    addRow(rowNode: IRowNode | null | undefined): void;

    /** Delegates to `addRow` — column tracking is ignored for `ChangedRowsPath`. */
    addCell(rowNode: IRowNode | null | undefined, colId: string | null | undefined): void;

    /** Returns true if `rowNode` is tracked (added via `addRow`/`addCell`, or as an ancestor). */
    hasRow(rowNode: IRowNode): boolean;

    /** Returns the changed rows sorted deepest-first. Cached — do not modify the returned array. */
    getSortedRows(): RowNode[];
}

/**
 * Tracks changed rows and which columns changed on each, using bitmasks for fast lookups.
 * Narrow on `kind === 'cells'` to access cell-specific methods.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface ChangedCellsPath {
    readonly kind: 'cells';

    /** Adds `rowNode` and all its ancestors. All columns are considered changed. No-op if null/undefined. */
    addRow(rowNode: IRowNode | null | undefined): void;

    /**
     * Adds `rowNode` and its ancestors with a specific column marked as changed.
     * When `colId` is `null`/`undefined`, delegates to `addRow` (all columns changed).
     */
    addCell(rowNode: IRowNode | null | undefined, colId: string | null | undefined): void;

    /** Returns true if `rowNode` is tracked (added via `addRow`/`addCell`, or as an ancestor). */
    hasRow(rowNode: IRowNode): boolean;

    /** Returns the changed rows sorted deepest-first. Cached — do not modify the returned array. */
    getSortedRows(): RowNode[];

    /**
     * Returns the slot index for a row or column, or -1 if not tracked.
     * For RowNode keys, -1 also means all-columns-changed (via `addRow`).
     */
    getSlot(key: IRowNode | string): number;

    /** Returns true if the column is changed for the row. Always true when `rowSlot < 0`. */
    hasCellBySlot(rowSlot: number, colSlot: number): boolean;
}

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

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IChangedPathFactory {
    /** Creates a `ChangedCellsPath` when `trackCells` is true, otherwise a `ChangedRowsPath`. */
    newPath(trackCells: boolean): ChangedPath;

    /**
     * Creates a ChangedRowsPath on `params` if hierarchical and conditions warrant it.
     * Adds rootNode to the newly created changedPath. No-op if changedPath already exists or grid is flat.
     */
    ensureRowsPath(params: RefreshModelParams, rootNode: IRowNode | null | undefined): ChangedPath | undefined;
}

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
 * When `hierarchical` is `false`, skips child traversal (only the root is visited) — use when no grouping or tree data is active.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _forEachChangedGroupDepthFirst = (
    rootNode: RowNode | null | undefined,
    hierarchical: boolean,
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
    if (rootNode == null) {
        return;
    }
    const children = rootNode.childrenAfterGroup;
    if (children === null) {
        return;
    }
    if (hierarchical) {
        forEachGroupDepthFirst(children, callback);
    }
    callback(rootNode);
};
