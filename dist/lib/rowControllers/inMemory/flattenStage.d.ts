// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../../entities/rowNode";
import { IRowNodeStage, StageExecuteParams } from "../../interfaces/iRowNodeStage";
export declare class FlattenStage implements IRowNodeStage {
    private gridOptionsWrapper;
    private selectionController;
    private eventService;
    private context;
    private columnController;
    execute(params: StageExecuteParams): RowNode[];
    private resetRowTops(rowNode);
    private recursivelyAddToRowsToDisplay(rowsToFlatten, result, nextRowTop, reduce);
    private addRowNodeToRowsToDisplay(rowNode, result, nextRowTop);
    private ensureFooterNodeExists(groupNode);
    private createFlowerNode(parentNode);
}
