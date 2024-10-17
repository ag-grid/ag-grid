import type { IRowChildrenService, RowNode } from 'ag-grid-community';

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
    removeFromChildrenAfterGroup: { [id: string]: boolean };
    removeFromAllLeafChildren: { [id: string]: boolean };
}

export class BatchRemover {
    private allSets: { [parentId: string]: RemoveDetails } = {};
    private allParents: RowNode[] = [];

    constructor(private readonly rowChildrenService: IRowChildrenService | undefined) {}

    public removeFromChildrenAfterGroup(parent: RowNode, child: RowNode): void {
        const set = this.getSet(parent);
        set.removeFromChildrenAfterGroup[child.id!] = true;
    }

    public isRemoveFromAllLeafChildren(parent: RowNode, child: RowNode): boolean {
        const set = this.getSet(parent);
        return !!set.removeFromAllLeafChildren[child.id!];
    }

    public preventRemoveFromAllLeafChildren(parent: RowNode, child: RowNode): void {
        const set = this.getSet(parent);
        delete set.removeFromAllLeafChildren[child.id!];
    }

    public removeFromAllLeafChildren(parent: RowNode, child: RowNode): void {
        const set = this.getSet(parent);
        set.removeFromAllLeafChildren[child.id!] = true;
    }

    private getSet(parent: RowNode): RemoveDetails {
        if (!this.allSets[parent.id!]) {
            this.allSets[parent.id!] = {
                removeFromAllLeafChildren: {},
                removeFromChildrenAfterGroup: {},
            };
            this.allParents.push(parent);
        }
        return this.allSets[parent.id!];
    }

    public getAllParents(): RowNode[] {
        return this.allParents;
    }

    public flush(): void {
        this.allParents.forEach((parent: GroupRow) => {
            const nodeDetails = this.allSets[parent.id!];

            parent.childrenAfterGroup = parent.childrenAfterGroup!.filter(
                (child) => !nodeDetails.removeFromChildrenAfterGroup[child.id!]
            );
            parent.allLeafChildren =
                parent.allLeafChildren?.filter((child) => !nodeDetails.removeFromAllLeafChildren[child.id!]) ?? null;
            this.rowChildrenService?.updateHasChildren(parent);

            const sibling: GroupRow = parent.sibling;
            if (sibling) {
                sibling.childrenAfterGroup = parent.childrenAfterGroup;
                sibling.allLeafChildren = parent.allLeafChildren;
            }
        });
        this.allSets = {};
        this.allParents.length = 0;
    }
}
