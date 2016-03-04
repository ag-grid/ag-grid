import {RowNode} from "../entities/rowNode";

export interface IRowNodeStage {

    execute(rowNodes: RowNode[]): RowNode[];

}