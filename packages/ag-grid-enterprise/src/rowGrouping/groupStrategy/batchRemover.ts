import type { RowNode } from 'ag-grid-community';

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

interface RemoveDetails {
    fromChildrenAfterGroup: Set<GroupRow> | null;
    fromAllLeafChildren: Set<GroupRow> | null;
}

export class BatchRemover {
    private allSets = new Map<GroupRow, RemoveDetails>();

    public removeFromChildrenAfterGroup(parent: RowNode, child: RowNode): void {
        const set = this.getSet(parent);
        (set.fromChildrenAfterGroup ??= new Set()).add(child);
    }

    public isRemoveFromAllLeafChildren(parent: RowNode, child: RowNode): boolean {
        return !!this.allSets.get(parent)?.fromAllLeafChildren?.has(child);
    }

    public preventRemoveFromAllLeafChildren(parent: RowNode, child: RowNode): void {
        this.allSets.get(parent)?.fromAllLeafChildren?.delete(child);
    }

    public removeFromAllLeafChildren(parent: RowNode, child: RowNode): void {
        const set = this.getSet(parent);
        (set.fromAllLeafChildren ??= new Set()).add(child);
    }

    private getSet(parent: RowNode): RemoveDetails {
        let set = this.allSets.get(parent);
        if (!set) {
            set = {
                fromChildrenAfterGroup: null,
                fromAllLeafChildren: null,
            };
            this.allSets.set(parent, set);
        }
        return set;
    }

    public getAllParents(): RowNode[] {
        return Array.from(this.allSets.keys());
    }

    public flush(): void {
        const allSets = this.allSets;
        for (const parent of allSets.keys()) {
            const nodeDetails = allSets.get(parent);
            if (nodeDetails) {
                const { fromChildrenAfterGroup, fromAllLeafChildren } = nodeDetails;
                const { childrenAfterGroup, allLeafChildren } = parent;
                if (childrenAfterGroup && fromChildrenAfterGroup) {
                    filterRowNodesInPlace(childrenAfterGroup, fromChildrenAfterGroup);
                    parent.updateHasChildren();
                }
                if (allLeafChildren && fromAllLeafChildren) {
                    filterRowNodesInPlace(allLeafChildren, fromAllLeafChildren);
                }
            }
        }
        allSets.clear();
    }
}

function filterRowNodesInPlace(array: GroupRow[], removals: ReadonlySet<GroupRow>): void {
    let writeIdx = 0;
    for (let i = 0, len = array.length; i < len; ++i) {
        const item = array[i];
        if (!removals.has(item)) {
            array[writeIdx++] = item;
        }
    }
    array.length = writeIdx;
}
