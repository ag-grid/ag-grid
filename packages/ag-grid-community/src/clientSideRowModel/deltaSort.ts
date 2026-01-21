import type { RowNode } from '../entities/rowNode';
import type { SortOption } from '../interfaces/iSortOption';
import type { RowNodeSorter } from '../sort/rowNodeSorter';
import type { ChangedPath } from '../utils/changedPath';
import type { ChangedRowNodes } from './changedRowNodes';

export const doDeltaSort = (
    rowNodeSorter: RowNodeSorter,
    rowNode: RowNode,
    changedRowNodes: ChangedRowNodes,
    changedPath: ChangedPath | undefined,
    sortOptions: SortOption[]
): RowNode[] => {
    const unsortedRows = rowNode.childrenAfterAggFilter!;
    const unsortedRowsLen = unsortedRows.length;

    if (unsortedRowsLen <= 1) {
        return unsortedRows.slice(); // Empty or single element is already sorted
    }

    const oldSortedRows = rowNode.childrenAfterSort;
    if (!oldSortedRows || oldSortedRows.length === 0) {
        // No previous sort, do full sort
        return rowNodeSorter.doFullSortInPlace(unsortedRows.slice(), sortOptions);
    }

    const oldSortedLen = oldSortedRows.length;

    const { updates, adds } = changedRowNodes;
    // Rows that were added, updated, or affected by changed path
    const touchedRows: RowNode[] = [];
    // Map stores current index. Sign encodes touched state: negative = touched, non-negative = untouched.
    const indexByNode = new Map<RowNode, number>();

    // Collect touched rows and build index map in one pass.
    for (let i = 0; i < unsortedRowsLen; ++i) {
        const node = unsortedRows[i];
        if (updates.has(node) || adds.has(node) || (changedPath && !changedPath.canSkip(node))) {
            touchedRows.push(node);
            indexByNode.set(node, ~i); // Bitwise NOT for touched (negative)
        } else {
            indexByNode.set(node, i); // Non-negative for untouched
        }
    }

    // Build untouched array from previous sorted order
    const touchedRowsLen = touchedRows.length;
    const untouchedRows: RowNode[] = new Array(unsortedRowsLen - touchedRowsLen);
    let untouchedIdx = 0;
    for (let i = 0; i < oldSortedLen; i++) {
        const node = oldSortedRows[i];
        const idx = indexByNode.get(node);
        if (idx !== undefined && idx >= 0) {
            untouchedRows[untouchedIdx++] = node;
        }
    }

    if (untouchedIdx < untouchedRows.length) {
        untouchedRows.length = untouchedIdx; // Trim if duplicates caused size mismatch
    }

    if (!touchedRowsLen) {
        // No touched rows: return oldSortedRows if nothing removed, otherwise return untouched
        return untouchedIdx === oldSortedLen ? oldSortedRows : untouchedRows;
    }

    // Sort touched rows and keep a stable tie-breaker based on current index.
    touchedRows.sort(
        (a, b) => rowNodeSorter.compareRowNodes(sortOptions, a, b) || ~indexByNode.get(a)! - ~indexByNode.get(b)!
    );

    if (touchedRowsLen === unsortedRowsLen) {
        return touchedRows; // All touched: no merge needed, return sorted touched rows directly.
    }

    return mergeDeltaSortedArrays(rowNodeSorter, sortOptions, touchedRows, untouchedRows, indexByNode);
};

/**
 * Merge touched rows with untouched rows in previous order.
 * See https://en.wikipedia.org/wiki/Merge_algorithm
 */
const mergeDeltaSortedArrays = (
    rowNodeSorter: RowNodeSorter,
    sortOptions: SortOption[],
    touchedRows: RowNode[],
    untouched: RowNode[],
    indexByNode: ReadonlyMap<RowNode, number>
): RowNode[] => {
    const touchedLength = touchedRows.length;
    const untouchedLength = untouched.length;
    const result = new Array<RowNode>(touchedLength + untouchedLength);
    let touchedIdx = 0;
    let untouchedIdx = 0;
    let resultIdx = 0;

    // Merge touched and untouched nodes - cache node references to avoid repeated array access
    let touchedNode = touchedRows[0];
    let untouchedNode = untouched[0];

    while (true) {
        const orderDelta =
            rowNodeSorter.compareRowNodes(sortOptions, touchedNode, untouchedNode) ||
            ~indexByNode.get(touchedNode)! - indexByNode.get(untouchedNode)!;

        if (orderDelta < 0) {
            result[resultIdx++] = touchedNode;
            if (++touchedIdx >= touchedLength) {
                break; // No more touched nodes
            }
            touchedNode = touchedRows[touchedIdx];
        } else {
            result[resultIdx++] = untouchedNode;
            if (++untouchedIdx >= untouchedLength) {
                break; // No more untouched nodes
            }
            untouchedNode = untouched[untouchedIdx];
        }
    }

    // Copy remaining elements
    while (touchedIdx < touchedLength) {
        result[resultIdx++] = touchedRows[touchedIdx++];
    }

    while (untouchedIdx < untouchedLength) {
        result[resultIdx++] = untouched[untouchedIdx++];
    }

    return result;
};
