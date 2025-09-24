import type { RowNode } from 'ag-grid-community';

import { invalidateAllLeafChildrenRecursively } from '../rowGroupingUtils';
import type { GroupRow } from './groupRow';

// doing _removeFromArray() multiple times on a large list can be a bottleneck.
// when doing large deletes (eg removing 1,000 rows) then we would be calling _removeFromArray()
// a thousands of times, in particular RootNode.allGroupChildren could be a large list, and
// 1,000 removes is time consuming as each one requires traversing the full list.
// to get around this, we do all the removes in a batch. this class manages the batch.
//
// This problem was brought to light by a client (AG-2879), with dataset of 20,000
// in 10,000 groups (2 items per group), then deleting all rows with transaction,
// it took about 20 seconds to delete. with the BathRemoved, the reduced to less than 1 second.

export class BatchRemover {
    private readonly allSets = new Map<GroupRow, Set<RowNode>>();

    public removeFromChildrenAfterGroup(parent: RowNode, child: RowNode): void {
        this.getSet(parent).add(child);
    }

    private getSet(parent: RowNode): Set<RowNode> {
        const allSets = this.allSets;
        let set = allSets.get(parent);
        if (!set) {
            set = new Set();
            allSets.set(parent, set);
        }
        return set;
    }

    public getAllParents(): RowNode[] {
        return Array.from(this.allSets.keys());
    }

    public flush(): void {
        const allSets = this.allSets;
        for (const parent of allSets.keys()) {
            const fromChildrenAfterGroup = allSets.get(parent);
            if (fromChildrenAfterGroup) {
                const childrenAfterGroup = parent.childrenAfterGroup;
                if (childrenAfterGroup && fromChildrenAfterGroup) {
                    if (filterRowNodesInPlace(childrenAfterGroup, fromChildrenAfterGroup)) {
                        parent.updateHasChildren();
                        invalidateAllLeafChildrenRecursively(parent);
                    }
                }
            }
        }
        allSets.clear();
    }
}

function filterRowNodesInPlace(array: GroupRow[], removals: ReadonlySet<GroupRow>): boolean {
    let writeIdx = 0;
    const len = array.length;
    for (let i = 0; i < len; ++i) {
        const item = array[i];
        if (!removals.has(item)) {
            array[writeIdx++] = item;
        }
    }
    if (len === writeIdx) {
        return false; // no change
    }
    array.length = writeIdx;
    return true;
}
