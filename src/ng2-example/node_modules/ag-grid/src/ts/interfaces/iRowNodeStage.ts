import {RowNode} from "../entities/rowNode";

export interface IRowNodeStage {

    execute(rowNode: RowNode): any;

}