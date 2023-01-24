import { RowNode } from "../entities/rowNode";
import { ChangedPath } from "../utils/changedPath";
import { RowNodeTransaction } from "./rowNodeTransaction";

export interface StageExecuteParams<TData = any> {
    rowNode: RowNode<TData>;
    // used in group stage, as group stage does one transaction at a time
    rowNodeTransaction?: RowNodeTransaction<TData> | null;
    // used in sort stage, as sort stage looks at all transactions in one go
    rowNodeTransactions?: RowNodeTransaction<TData>[] | null;
    rowNodeOrder?: {[id: string]: number};
    changedPath?: ChangedPath;
    afterColumnsChanged?: boolean;
}

export interface IRowNodeStage<TData = any> {
    execute(params: StageExecuteParams<TData>): any;
}
