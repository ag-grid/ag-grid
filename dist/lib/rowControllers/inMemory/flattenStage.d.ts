// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RowNode } from "../../entities/rowNode";
import { IRowNodeStage } from "../../interfaces/iRowNodeStage";
export declare class FlattenStage implements IRowNodeStage {
    private gridOptionsWrapper;
    private selectionController;
    private eventService;
    execute(rowsToFlatten: RowNode[]): RowNode[];
    private recursivelyAddToRowsToDisplay(rowsToFlatten, result, nextRowTop);
    private addRowNodeToRowsToDisplay(rowNode, result, nextRowTop);
    private createFooterNode(groupNode);
}
