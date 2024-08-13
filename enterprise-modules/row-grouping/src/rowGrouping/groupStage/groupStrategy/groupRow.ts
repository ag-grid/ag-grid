import type { RowNode } from '@ag-grid-community/core';

export interface GroupRow extends RowNode {
    allLeafChildren: GroupRow[] | null;
    childrenAfterGroup: GroupRow[] | null;
}
