import type { GridOptions } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import type { ChangedPath } from '../utils/changedPath';
import type { ClientSideRowModelSteps } from './iClientSideRowModel';
import type { RowNodeTransaction } from './rowNodeTransaction';

export interface StageExecuteParams<TData = any> {
    rowNode: RowNode<TData>;
    // used in group stage, as group stage does one transaction at a time
    rowNodeTransaction?: RowNodeTransaction<TData> | null;
    // used in sort stage, as sort stage looks at all transactions in one go
    rowNodeTransactions?: RowNodeTransaction<TData>[] | null;
    // true if the order of root.allLeafChildren has changed
    // This can happen if order of root.allLeafChildren is updated or rows are inserted (and not just appended at the end)
    rowNodesOrderChanged?: boolean;
    changedPath?: ChangedPath;
    afterColumnsChanged?: boolean;
}

export interface IRowNodeStage<TData = any> {
    step: ClientSideRowModelSteps;
    refreshProps: Set<keyof GridOptions>;
    execute(params: StageExecuteParams<TData>): any;
}
