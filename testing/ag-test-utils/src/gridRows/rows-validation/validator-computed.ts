import type { RowNode } from 'ag-grid-community';

import type { GridRowErrors } from './gridRowErrors';
import type { GridRowsValidationState } from './gridRowsValidationState';

/** Counts unbalanced (empty-key) group ancestors, used to adjust SSRM uiLevel. */
function countUnbalancedAncestors(state: GridRowsValidationState, row: RowNode): number {
    if (!state.groupAllowUnbalanced) {
        return 0;
    }

    let count = 0;
    let current: RowNode | null | undefined = row;
    const visited = new Set<RowNode>();

    while (current && current.parent) {
        current = current.parent;
        if (!current || visited.has(current)) {
            break;
        }
        visited.add(current);

        if (current.level == null || current.level < 0) {
            break;
        }

        if (current.footer) {
            continue;
        }

        if (current.group && current.key === '') {
            ++count;
        }
    }

    return count;
}

function computeSsrmUiLevel(state: GridRowsValidationState, row: RowNode): number {
    if (row.level == null || row.level < 0) {
        return 0;
    }

    if (row.detail && row.parent) {
        return computeSsrmUiLevel(state, row.parent);
    }

    let expected = row.level + (row.footer ? 1 : 0);
    expected -= countUnbalancedAncestors(state, row);

    if (expected < 0) {
        expected = 0;
    }

    return expected;
}

export function computeUiLevel(state: GridRowsValidationState, row: RowNode): number {
    if (state.ssrm) {
        return computeSsrmUiLevel(state, row);
    }

    let level = -1;
    let parent = row.parent;
    while (parent) {
        if (parent.footer) {
            ++level;
        }

        // Check if this parent should be counted based on grouping options
        let shouldCountParent = true;

        if (!parent.master) {
            if (state.groupHideOpenParents && parent.expanded) {
                shouldCountParent = false;
            } else if (state.groupHideParentOfSingleChild && parent.group && parent.childrenAfterGroup?.length === 1) {
                if (
                    state.groupHideParentOfSingleChild === true ||
                    (state.groupHideParentOfSingleChild === 'leafGroupsOnly' && parent.leafGroup)
                ) {
                    shouldCountParent = false;
                }
            }
        }

        parent = parent.parent;
        if (shouldCountParent) {
            ++level;
        }
    }
    if (row.footer) {
        ++level;
    } else if (row.detail) {
        --level;
    }
    if (level <= 0) {
        return 0;
    }
    return level;
}

/** Tree data: count all descendants (groups + leaves) from childrenAfterAggFilter recursively. */
function computeExpectedAllChildrenCountTreeData(row: RowNode): number | null {
    const childrenAfterAggFilter = row.childrenAfterAggFilter;
    if (!childrenAfterAggFilter) {
        return row.level >= 0 ? null : 0;
    }
    let count = childrenAfterAggFilter.length;
    for (const child of childrenAfterAggFilter) {
        count += child.allChildrenCount ?? 0;
    }
    // Historical behaviour: null for non-root rows with no children, 0 for root
    return count === 0 && row.level >= 0 ? null : count;
}

/** Grid grouping: count only leaf descendants from childrenAfterAggFilter recursively. */
function computeExpectedAllChildrenCountGridGrouping(row: RowNode): number | null {
    const childrenAfterAggFilter = row.childrenAfterAggFilter;
    if (!childrenAfterAggFilter) {
        return null;
    }
    let count = 0;
    for (const child of childrenAfterAggFilter) {
        if (child.group) {
            count += child.allChildrenCount as number;
        } else {
            count++;
        }
    }
    return count;
}

function computeExpectedAllChildrenCount(state: GridRowsValidationState, row: RowNode): number | null {
    if (!row.hasChildren()) {
        return null;
    }
    if (state.gridRows.treeData) {
        return computeExpectedAllChildrenCountTreeData(row);
    }
    return computeExpectedAllChildrenCountGridGrouping(row);
}

/**
 * Validates `allChildrenCount` by recomputing the expected value from `childrenAfterAggFilter`,
 * mirroring the enterprise FilterAggregatesStage logic:
 * - Grid grouping: counts only leaf descendants (groups are not counted, only their leaf children).
 * - Tree data: counts all descendants (groups + leaves) recursively; null when no children at level >= 0.
 */
export function validateAllChildrenCount(state: GridRowsValidationState, rowErrors: GridRowErrors, row: RowNode): void {
    const expected = computeExpectedAllChildrenCount(state, row);
    rowErrors.add(
        row.allChildrenCount !== expected &&
            `allChildrenCount=${row.allChildrenCount} but expected ${expected} (computed from childrenAfterAggFilter)`
    );
}
