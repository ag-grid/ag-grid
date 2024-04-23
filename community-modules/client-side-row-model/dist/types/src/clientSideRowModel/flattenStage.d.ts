import { BeanStub, IRowNodeStage, RowNode, StageExecuteParams } from "@ag-grid-community/core";
export declare class FlattenStage extends BeanStub implements IRowNodeStage {
    private beans;
    execute(params: StageExecuteParams): RowNode[];
    private getFlattenDetails;
    private recursivelyAddToRowsToDisplay;
    private addRowNodeToRowsToDisplay;
    private createDetailNode;
}
