import { RowNode } from "../entities/rowNode";
import { ChangedPath } from "../utils/changedPath";
import { RowNodeTransaction } from "./rowNodeTransaction";
export interface StageExecuteParams {
    rowNode: RowNode;
    rowNodeTransaction?: RowNodeTransaction | null;
    rowNodeTransactions?: RowNodeTransaction[] | null;
    rowNodeOrder?: {
        [id: string]: number;
    };
    changedPath?: ChangedPath;
    afterColumnsChanged?: boolean;
}
export interface IRowNodeStage {
    execute(params: StageExecuteParams): any;
}
