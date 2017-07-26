// Type definitions for ag-grid v12.0.2
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
    private recursivelyAddToRowsToDisplay(rowsToFlatten, result, nextRowTop, skipLeafNodes, uiLevel);
    private addRowNodeToRowsToDisplay(rowNode, result, nextRowTop, uiLevel);
    private ensureFooterNodeExists(groupNode);
    private createFlowerNode(parentNode);
}
