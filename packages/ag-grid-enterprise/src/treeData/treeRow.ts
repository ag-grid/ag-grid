import type { ITreeNode, RowNode } from 'ag-grid-community';

/**
 * This is the type of any row processed by the TreeStrategy.
 *
 * TreeStrategy can modify:
 * - allLeafChildren
 * - childrenAfterGroup
 * - treeNode
 * - treeNodeFlags
 */
export interface TreeRow<TData = any> extends RowNode<TData> {
    parent: TreeRow<TData> | null;
    allLeafChildren: TreeRow<TData>[] | null;
    childrenAfterGroup: TreeRow<TData>[] | null;
    treeNode: ITreeNode | TreeRow<TData> | null;
    treeNodeFlags: number;
    sibling: TreeRow<TData>;
    sourceRowIndex: number;
}
