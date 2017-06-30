import {RowNode} from "../entities/rowNode";
import {RowNodeTransaction} from "../rowModels/inMemory/inMemoryRowModel";

export interface StageExecuteParams {
    rowNode: RowNode;
    rowNodeTransaction?: RowNodeTransaction;
    changedPath?: ChangedPath;
}

export interface ChangedPath {
    [id:string]:{[id:string]:boolean}
}

export interface IRowNodeStage {
    execute(params: StageExecuteParams): any;
}
