// Type definitions for ag-grid v5.0.7
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RowNode } from "../../entities/rowNode";
import { IRowNodeStage } from "../../interfaces/iRowNodeStage";
export declare class FlattenStage implements IRowNodeStage {
    private gridOptionsWrapper;
    private selectionController;
    private eventService;
    private context;
    private columnController;
    execute(rootNode: RowNode): RowNode[];
    private recursivelyAddToRowsToDisplay(rowsToFlatten, result, nextRowTop, reduce);
    private addRowNodeToRowsToDisplay(rowNode, result, nextRowTop);
    private createFooterNode(groupNode);
}
