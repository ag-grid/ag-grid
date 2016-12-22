// Type definitions for ag-grid v7.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../../entities/rowNode";
import { IRowNodeStage } from "../../interfaces/iRowNodeStage";
export declare class FlattenStage implements IRowNodeStage {
    private gridOptionsWrapper;
    private selectionController;
    private eventService;
    private context;
    private columnController;
    execute(rootNode: RowNode): RowNode[];
    private resetRowTops(rowNode);
    private recursivelyAddToRowsToDisplay(rowsToFlatten, result, nextRowTop, reduce);
    private addRowNodeToRowsToDisplay(rowNode, result, nextRowTop);
    private ensureFooterNodeExists(groupNode);
    private createFlowerNode(parentNode);
}
