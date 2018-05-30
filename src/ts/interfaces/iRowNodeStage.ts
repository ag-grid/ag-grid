import {RowNode} from "../entities/rowNode";
import {RowNodeTransaction} from "../rowModels/clientSide/clientSideRowModel";
import {ChangedPath} from "../rowModels/clientSide/changedPath";

export interface StageExecuteParams {
    rowNode: RowNode;
    rowNodeTransaction?: RowNodeTransaction;
    rowNodeOrder?: {[id: string]: number};
    changedPath?: ChangedPath;
}

export interface IRowNodeStage {
    execute(params: StageExecuteParams): any;
}
