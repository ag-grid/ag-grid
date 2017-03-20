import {RowNode} from "../entities/rowNode";

export interface StageExecuteParams {
    rowNode: RowNode;
    newRowNodes?: RowNode[];
}

export interface IRowNodeStage {
    execute(params: StageExecuteParams): any;
}