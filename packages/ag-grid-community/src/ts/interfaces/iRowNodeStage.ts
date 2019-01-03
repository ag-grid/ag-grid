import { RowNode } from "../entities/rowNode";
import { RowNodeTransaction } from "../rowModels/clientSide/clientSideRowModel";
import { ChangedPath } from "../rowModels/clientSide/changedPath";

export interface StageExecuteParams {
    rowNode: RowNode;
    // used in group stage, as group stage does one transaction at a time
    rowNodeTransaction?: RowNodeTransaction | null;
    // used in sort stage, as sort stage looks at all transactions in one go
    rowNodeTransactions?: RowNodeTransaction[] | null;
    rowNodeOrder?: {[id: string]: number};
    changedPath?: ChangedPath;
    afterColumnsChanged?: boolean;
}

export interface IRowNodeStage {
    execute(params: StageExecuteParams): any;
}
