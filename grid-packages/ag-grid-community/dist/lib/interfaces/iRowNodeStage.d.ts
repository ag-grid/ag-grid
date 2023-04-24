import { RowNode } from "../entities/rowNode";
import { ChangedPath } from "../utils/changedPath";
import { RowNodeTransaction } from "./rowNodeTransaction";
export interface StageExecuteParams<TData = any> {
    rowNode: RowNode<TData>;
    rowNodeTransaction?: RowNodeTransaction<TData> | null;
    rowNodeTransactions?: RowNodeTransaction<TData>[] | null;
    rowNodeOrder?: {
        [id: string]: number;
    };
    changedPath?: ChangedPath;
    afterColumnsChanged?: boolean;
}
export interface IRowNodeStage<TData = any> {
    execute(params: StageExecuteParams<TData>): any;
}
