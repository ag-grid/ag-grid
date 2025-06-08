import type { Bean } from '../context/bean';
import type { GridOptions } from '../entities/gridOptions';
import type { ITreeNode, RowNode } from '../entities/rowNode';
import type { GroupingApproach } from '../gridOptionsUtils';
import type { ChangedPath } from '../utils/changedPath';
import type { ClientSideRowModelStage, IChangedRowNodes } from './iClientSideRowModel';

export interface RowGroupingRowNode<TData = any> extends RowNode<TData> {
    parent: RowGroupingRowNode<TData> | null;
    allLeafChildren: RowGroupingRowNode<TData>[] | null;
    childrenAfterGroup: RowGroupingRowNode<TData>[] | null;
    treeNode: ITreeNode | RowNode<TData> | null;
    treeNodeFlags: number;
    sibling: RowGroupingRowNode<TData>;
    sourceRowIndex: number;
}

export interface StageExecuteParams<TData = any> {
    rowNode: RowNode<TData>;

    // used in sort stage, as sort stage looks at all transactions in one go
    changedRowNodes?: IChangedRowNodes<TData>;

    // true if the order of root.allLeafChildren has changed
    // This can happen if order of root.allLeafChildren is updated or rows are inserted (and not just appended at the end)
    rowNodesOrderChanged?: boolean;
    changedPath?: ChangedPath;
    afterColumnsChanged?: boolean;
}

export interface IRowGroupingStrategy<TData = any> extends Bean {
    execute(params: StageExecuteParams<TData>, approach: GroupingApproach): void;
}

export interface IRowNodeStage<TResult = any, TData = any> {
    step: ClientSideRowModelStage;
    refreshProps: Set<keyof GridOptions>;
    execute(params: StageExecuteParams<TData>): TResult;
}
