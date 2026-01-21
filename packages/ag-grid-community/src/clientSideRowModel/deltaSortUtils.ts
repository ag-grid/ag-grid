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
    
    // Build parallel arrays from the start: nodes and their indices
    const touchedSet = new Set<RowNode>();
    const touchedNodes: RowNode[] = [];
    const touchedIndices: number[] = [];
    
    // First pass: identify touched nodes and store with indices
    for (let i = 0; i < unsortedRowsLen; ++i) {
        const node = unsortedRows[i];
        if (updates.has(node) || adds.has(node) || (changedPath && !changedPath.canSkip(node))) {
            touchedSet.add(node);
            touchedNodes.push(node);
            touchedIndices.push(i);
        }
    }

    const touchedRowsLen = touchedNodes.length;
    
    if (!touchedRowsLen) {
        // No touched rows: return oldSortedRows if nothing removed
        if (unsortedRowsLen === oldSortedLen) {
            return oldSortedRows;
        }
        // Some rows removed: need to filter oldSortedRows
        const nodeSet = new Set(unsortedRows);
        const result: RowNode[] = [];
        for (let i = 0; i < oldSortedLen; i++) {
            const node = oldSortedRows[i];
            if (nodeSet.has(node)) {
                result.push(node);
            }
        }
        return result;
    }

    if (touchedRowsLen === unsortedRowsLen) {
        // All touched: sort and return, no merge needed
        const touchedWithIndices = new Array<{ node: RowNode; index: number }>(touchedRowsLen);
        for (let i = 0; i < touchedRowsLen; i++) {
            touchedWithIndices[i] = { node: touchedNodes[i], index: touchedIndices[i] };
        }
        touchedWithIndices.sort(
            (a, b) => rowNodeSorter.compareRowNodes(sortOptions, a.node, b.node) || a.index - b.index
        );
        const result = new Array<RowNode>(touchedRowsLen);
        for (let i = 0; i < touchedRowsLen; i++) {
            result[i] = touchedWithIndices[i].node;
        }
        return result;
    }

    // Build untouched parallel arrays: need Map only for filtering oldSorted rows
    const nodeToIndex = new Map<RowNode, number>();
    for (let i = 0; i < unsortedRowsLen; i++) {
        nodeToIndex.set(unsortedRows[i], i);
    }

    const untouchedNodes: RowNode[] = [];
    const untouchedIndices: number[] = [];
    for (let i = 0; i < oldSortedLen; i++) {
        const node = oldSortedRows[i];
        if (!touchedSet.has(node)) {
            const idx = nodeToIndex.get(node);
            if (idx !== undefined) {
                untouchedNodes.push(node);
                untouchedIndices.push(idx);
            }
        }
    }

    // Sort touched rows using parallel index array for tie-breaking
    const touchedWithIndices = new Array<{ node: RowNode; index: number }>(touchedRowsLen);
    for (let i = 0; i < touchedRowsLen; i++) {
        touchedWithIndices[i] = { node: touchedNodes[i], index: touchedIndices[i] };
    }
    touchedWithIndices.sort(
        (a, b) => rowNodeSorter.compareRowNodes(sortOptions, a.node, b.node) || a.index - b.index
    );
    
    // Extract sorted touched nodes and update parallel index array
    for (let i = 0; i < touchedRowsLen; i++) {
        touchedNodes[i] = touchedWithIndices[i].node;
        touchedIndices[i] = touchedWithIndices[i].index;
    }

    return mergeDeltaSortedArrays(rowNodeSorter, sortOptions, touchedNodes, untouchedNodes, touchedIndices, untouchedIndices);
};

/**
 * Merge touched rows with untouched rows in previous order.
 * Uses parallel index arrays for O(1) tie-breaking without Map lookups.
 * See https://en.wikipedia.org/wiki/Merge_algorithm
 */
const mergeDeltaSortedArrays = (
    rowNodeSorter: RowNodeSorter,
    sortOptions: SortOption[],
    touchedRows: RowNode[],
    untouched: RowNode[],
    touchedIndices: readonly number[],
    untouchedIndices: readonly number[]
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
            touchedIndices[touchedIdx] - untouchedIndices[untouchedIdx];

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
