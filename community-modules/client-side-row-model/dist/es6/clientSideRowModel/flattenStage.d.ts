import { BeanStub, IRowNodeStage, RowNode, StageExecuteParams } from "@ag-grid-community/core";
export declare class FlattenStage extends BeanStub implements IRowNodeStage {
    private columnController;
    execute(params: StageExecuteParams): RowNode[];
    private recursivelyAddToRowsToDisplay;
    private addRowNodeToRowsToDisplay;
    private ensureFooterNodeExists;
    private createDetailNode;
}
