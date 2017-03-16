import {RowNode} from "../entities/rowNode";
import {PaginationModel} from "../rowModels/inMemory/inMemoryRowModel";

export interface StageExecuteParams {
    rowNode: RowNode;
    newRowNodes?: RowNode[];
    paginationModel?:PaginationModel
}

export interface IRowNodeStage {
    execute(params: StageExecuteParams): any;
}