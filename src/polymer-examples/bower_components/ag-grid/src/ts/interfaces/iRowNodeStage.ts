import {RowNode} from "../entities/rowNode";
import {RowNodeTransaction} from "../rowModels/inMemory/inMemoryRowModel";

export interface StageExecuteParams {
    rowNode: RowNode;
    rowNodeTransaction?: RowNodeTransaction;
}

export interface IRowNodeStage {
    execute(params: StageExecuteParams): any;
}