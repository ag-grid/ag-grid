import type { RowNode } from 'ag-grid-community';

/**
 * This is the type of any row processed by the GroupStrategy.
 *
 * GroupStrategy can modify:
 * - allLeafChildren
 * - childrenAfterGroup
 */
export interface GroupRow extends RowNode {
    allLeafChildren: GroupRow[] | null;
    childrenAfterGroup: GroupRow[] | null;
}
