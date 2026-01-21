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
    const oldSortedRows = rowNode.childrenAfterSort;
    if (!oldSortedRows) {
        return rowNodeSorter.doFullSortInPlace(unsortedRows.slice(), sortOptions);
    }

    // Key: RowNode. Value: 1-based index; sign encodes touched state (negative = touched).
    const stateByNode = new Map<RowNode, number>();

    const unsortedRowsLen = unsortedRows.length;
    const { updates, adds } = changedRowNodes;
    const touchedRows: RowNode[] = [];
    // Seed current order in stateByNode and collect touched rows in one pass.
    for (let i = 0; i < unsortedRowsLen; ++i) {
        const node = unsortedRows[i];
        if (updates.has(node) || adds.has(node) || (changedPath && !changedPath.canSkip(node))) {
            touchedRows.push(node);
            stateByNode.set(node, -i - 1);
        } else {
            stateByNode.set(node, i + 1);
        }
    }

    const oldSortedLen = oldSortedRows.length;
    let hasRemoved = false;
    // Overwrite with previous order for nodes that still exist, while tracking removals.
    for (let i = 0; i < oldSortedLen; ++i) {
        const node = oldSortedRows[i];
        const currentState = stateByNode.get(node);
        if (currentState === undefined) {
            hasRemoved = true;
            continue; // Skip nodes that are no longer present in the current rows.
        }
        stateByNode.set(node, currentState < 0 ? -i - 1 : i + 1);
    }

    if (!touchedRows.length) {
        // No touched rows: either return previous order or filter after removals.
        if (!hasRemoved && oldSortedLen === unsortedRowsLen) {
            return oldSortedRows; // No changes detected, return previous array
        }

        if (hasRemoved && oldSortedLen > unsortedRowsLen) {
            // Only removals: preserve previous order and filter out missing nodes.
            return compactRemovedRows(touchedRows, oldSortedRows, stateByNode, unsortedRowsLen);
        }
    }

    // Sort touched rows and keep a stable tie-breaker based on previous/current index.
    touchedRows.sort(
        (a, b) =>
            rowNodeSorter.compareRowNodes(sortOptions, a, b) ||
            Math.abs(stateByNode.get(a)!) - Math.abs(stateByNode.get(b)!)
    );

    return mergeDeltaSortedArrays(rowNodeSorter, sortOptions, touchedRows, oldSortedRows, stateByNode, unsortedRowsLen);
};

const compactRemovedRows = (
    target: RowNode[],
    oldSortedRows: RowNode[],
    stateByNode: ReadonlyMap<RowNode, number>,
    expectedLength: number
): RowNode[] => {
    target.length = expectedLength;
    let writeIdx = 0;
    for (let i = 0, len = oldSortedRows.length; i < len; ++i) {
        const node = oldSortedRows[i];
        if (stateByNode.has(node)) {
            target[writeIdx++] = node;
        }
    }
    return target;
};

/**
 * Merge touched rows with untouched rows in previous order.
 * See https://en.wikipedia.org/wiki/Merge_algorithm
 */
const mergeDeltaSortedArrays = (
    rowNodeSorter: RowNodeSorter,
    sortOptions: SortOption[],
    touchedRows: RowNode[],
    oldSortedRows: RowNode[],
    stateByNode: ReadonlyMap<RowNode, number>,
    totalLength: number
): RowNode[] => {
    const oldSortedLen = oldSortedRows.length;
    const result = new Array<RowNode>(totalLength);
    let resultIdx = 0;
    let touchedIdx = 0;
    let oldIdx = 0;
    let untouchedIndex = 0;

    const advanceUntouched = (): RowNode | null => {
        while (oldIdx < oldSortedLen) {
            const candidate = oldSortedRows[oldIdx++];
            const state = stateByNode.get(candidate);
            if (state && state > 0) {
                untouchedIndex = state - 1;
                return candidate;
            }
        }
        return null;
    };

    let untouchedNode = advanceUntouched();

    // Merge touched and untouched rows while preserving previous order for untouched rows.
    const touchedLength = touchedRows.length;
    while (touchedIdx < touchedLength && untouchedNode) {
        const touchedNode = touchedRows[touchedIdx];
        let orderDelta = rowNodeSorter.compareRowNodes(sortOptions, touchedNode, untouchedNode);
        if (!orderDelta) {
            orderDelta = Math.abs(stateByNode.get(touchedNode)!) - 1 - untouchedIndex;
        }

        if (orderDelta < 0) {
            result[resultIdx] = touchedNode;
            ++touchedIdx;
        } else {
            result[resultIdx] = untouchedNode;
            untouchedNode = advanceUntouched();
        }
        ++resultIdx;
    }

    // Append remaining touched rows.
    while (touchedIdx < touchedLength) {
        result[resultIdx++] = touchedRows[touchedIdx++];
    }

    // Append remaining untouched rows.
    while (untouchedNode) {
        result[resultIdx++] = untouchedNode;
        untouchedNode = advanceUntouched();
    }

    return result;
};
