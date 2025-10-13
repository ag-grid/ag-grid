import type { RowNode } from 'ag-grid-community';

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
    private readonly allSets = new Map<RowNode, Set<RowNode>>();

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
            const childrenAfterGroup = parent.childrenAfterGroup;
            const fromChildrenAfterGroup = childrenAfterGroup && allSets.get(parent);
            if (fromChildrenAfterGroup && filterRowNodesInPlace(childrenAfterGroup, fromChildrenAfterGroup)) {
                invalidateAllLeafChildren(parent);
                parent.updateHasChildren();
            }
        }
        allSets.clear();
    }
}

const filterRowNodesInPlace = (childrenAfterGroup: RowNode[], removals: ReadonlySet<RowNode>): boolean => {
    const childrenAfterGroupLength = childrenAfterGroup.length;
    let writeIdx = 0;
    for (let i = 0, len = childrenAfterGroup.length; i < len; ++i) {
        const item = childrenAfterGroup[i];
        if (!removals.has(item)) {
            childrenAfterGroup[writeIdx++] = item;
        }
    }
    if (childrenAfterGroupLength !== writeIdx) {
        childrenAfterGroup.length = writeIdx;
        return true;
    }
    return false;
};

/** Sets rowNode._leafs to undefined on node and its parents recursively so it will be reloaded at next access. It does not touch the root node. */
export const invalidateAllLeafChildren = (node: RowNode | null): void => {
    while (node?._leafs !== undefined) {
        const parent = node.parent;
        if (!parent) {
            break; // Don't touch the root node.
        }
        node._leafs = undefined; // Invalidate allLeafChildren cache.
        node = parent;
    }
};
