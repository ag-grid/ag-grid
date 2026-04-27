import type { RowNode } from '../entities/rowNode';
import type { SortOption } from '../interfaces/iSortOption';
import type { RowNodeSorter } from '../sort/rowNodeSorter';
import type { ChangedPath } from '../utils/changedPath';
import type { ChangedRowNodes } from './changedRowNodes';

/**
 * Minimum number of rows changed to enable delta sort.
 * Below this threshold, full sort is much faster due to lower overhead.
 */
const MIN_DELTA_SORT_ROWS = 4;

/**
 * Performs an incremental (delta) sort that avoids re-sorting unchanged rows.
 *
 * Algorithm outline:
 * 1. Handle edge cases: empty input or single element - return early
 * 2. Fall back to full sort if no previous sorted result or too few rows
 * 3. Classify rows as "touched" (updated, added, or in changed path) vs "untouched"
 * 4. If no rows are touched, return previous sorted array (filtering removed nodes if needed)
 * 5. Sort only the touched rows using a stable sort with original index as tie-breaker
 * 6. If all rows are touched, return the sorted touched rows directly
 * 7. Merge the sorted touched rows with untouched rows from previous sort order
 *    using a two-pointer merge algorithm (similar to merge sort's merge step)
 *
 * Time complexity: O(t log t + n) where t = touched rows, n = total rows
 * This is faster than full sort O(n log n) when t << n
 *
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const doDeltaSort = (
    rowNodeSorter: RowNodeSorter,
    rowNode: RowNode,
    changedRowNodes: ChangedRowNodes,
    changedPath: ChangedPath | undefined,
    sortOptions: SortOption[]
): RowNode[] => {
    const oldSortedRows = rowNode.childrenAfterSort;
    const unsortedRows = rowNode.childrenAfterAggFilter;
    if (!unsortedRows) {
        return oldSortedRows && oldSortedRows.length > 0 ? oldSortedRows : [];
    }

    const unsortedRowsLen = unsortedRows.length;
    if (unsortedRowsLen <= 1) {
        if (
            oldSortedRows?.length === unsortedRowsLen &&
            (unsortedRowsLen === 0 || oldSortedRows[0] === unsortedRows[0])
        ) {
            return oldSortedRows; // Same content, reuse old array
        }
        return unsortedRows.slice(); // Different content, need new reference
    }

    if (!oldSortedRows || unsortedRowsLen <= MIN_DELTA_SORT_ROWS) {
        return rowNodeSorter.doFullSortInPlace(unsortedRows.slice(), sortOptions);
    }

    const indexByNode = new Map<RowNode, number>();

    // Classify rows as touched or untouched and build an index map.
    // Map stores current index with sign encoding: negative = touched, non-negative = untouched.
    const { updates, adds } = changedRowNodes;
    const touchedRows: RowNode[] = [];
    for (let i = 0; i < unsortedRowsLen; ++i) {
        const node = unsortedRows[i];
        if (updates.has(node) || adds.has(node) || changedPath?.hasRow(node)) {
            indexByNode.set(node, ~i); // Bitwise NOT for touched (negative)
            touchedRows.push(node);
        } else {
            indexByNode.set(node, i); // Non-negative for untouched
        }
    }

    const touchedRowsLen = touchedRows.length;
    if (touchedRowsLen === 0) {
        // No touched rows: return oldSortedRows if nothing removed, otherwise filter out removed nodes
        return unsortedRowsLen === oldSortedRows.length
            ? oldSortedRows // Nothing removed
            : filterRemovedNodes(oldSortedRows, indexByNode, touchedRows);
    }

    // Sort touched rows with stable tie-breaker based on current index
    touchedRows.sort(
        (a, b) => rowNodeSorter.compareRowNodes(sortOptions, a, b) || ~indexByNode.get(a)! - ~indexByNode.get(b)!
    );

    if (touchedRowsLen === unsortedRowsLen) {
        return touchedRows; // All touched: no merge needed, return sorted touched rows directly.
    }

    return mergeDeltaSortedArrays(rowNodeSorter, sortOptions, touchedRows, oldSortedRows, indexByNode, unsortedRowsLen);
};

/**
 * Merge touched rows with untouched rows from previous sorted order.
 * Optimized version: caches untouched index to avoid repeated map lookups in hot loop.
 * See https://en.wikipedia.org/wiki/Merge_algorithm
 */
const mergeDeltaSortedArrays = (
    rowNodeSorter: RowNodeSorter,
    sortOptions: SortOption[],
    touchedRows: RowNode[],
    oldSortedRows: RowNode[],
    indexByNode: ReadonlyMap<RowNode, number>,
    resultSize: number
): RowNode[] => {
    // Result array - size equals total number of rows to output
    const result = new Array<RowNode>(resultSize);

    let touchedIdx = 0;
    let touchedNode = touchedRows[touchedIdx];
    let untouchedNode: RowNode | undefined;
    let untouchedIdx = -1;
    let oldIdx = 0;
    let resultIdx = 0;
    const touchedLength = touchedRows.length;
    const oldSortedLength = oldSortedRows.length;
    while (true) {
        // Advance to next valid untouched node if needed
        if (untouchedIdx < 0) {
            if (oldIdx >= oldSortedLength) {
                break; // No more untouched nodes
            }
            untouchedNode = oldSortedRows[oldIdx++];
            untouchedIdx = indexByNode.get(untouchedNode) ?? -1;
            if (untouchedIdx < 0) {
                continue; // Skip touched/removed nodes
            }
        }

        const orderDelta =
            rowNodeSorter.compareRowNodes(sortOptions, touchedNode, untouchedNode!) ||
            ~indexByNode.get(touchedNode)! - untouchedIdx;

        if (orderDelta < 0) {
            result[resultIdx++] = touchedNode; // Touched node comes next
            if (++touchedIdx >= touchedLength) {
                break; // No more touched nodes
            }
            touchedNode = touchedRows[touchedIdx];
        } else {
            result[resultIdx++] = untouchedNode!; // Untouched node comes next
            untouchedIdx = -1; // Will be fetched on next iteration
        }
    }

    // Copy remaining touched nodes
    while (touchedIdx < touchedLength) {
        result[resultIdx++] = touchedRows[touchedIdx++];
    }

    // If no pending untouched node, we already searched through remaining nodes
    if (untouchedIdx < 0) {
        return result;
    }

    // Add pending untouched node
    result[resultIdx++] = untouchedNode!;

    // Copy remaining untouched nodes
    while (oldIdx < oldSortedLength) {
        const node = oldSortedRows[oldIdx++];
        if (indexByNode.get(node)! >= 0) {
            result[resultIdx++] = node;
        }
    }

    return result;
};

/** Filter out removed nodes from oldSortedRows using preallocated array for performance. */
const filterRemovedNodes = (rows: RowNode[], map: ReadonlyMap<RowNode, number>, result: RowNode[]): RowNode[] => {
    let count = 0;
    result.length = map.size;
    for (let i = 0, len = rows.length; i < len; ++i) {
        const node = rows[i];
        if (map.has(node)) {
            result[count++] = node;
        }
    }
    result.length = count;
    return result;
};
