import { BeanStub, IRowNodeStage, RowNode, StageExecuteParams } from "ag-grid-community";
export declare class FlattenStage extends BeanStub implements IRowNodeStage {
    private columnModel;
    private beans;
    execute(params: StageExecuteParams): RowNode[];
    private getFlattenDetails;
    private recursivelyAddToRowsToDisplay;
    private addRowNodeToRowsToDisplay;
    private createDetailNode;
}
