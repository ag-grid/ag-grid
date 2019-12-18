import { IRowNodeStage, RowNode, StageExecuteParams } from "@ag-grid-community/core";
export declare class FlattenStage implements IRowNodeStage {
    private gridOptionsWrapper;
    private selectionController;
    private eventService;
    private context;
    private columnController;
    execute(params: StageExecuteParams): RowNode[];
    private recursivelyAddToRowsToDisplay;
    private addRowNodeToRowsToDisplay;
    private ensureFooterNodeExists;
    private createDetailNode;
}
