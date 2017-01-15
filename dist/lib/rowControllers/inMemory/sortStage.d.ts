// Type definitions for ag-grid v7.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../../entities/rowNode";
export declare class SortStage {
    private gridOptionsWrapper;
    private sortController;
    private valueService;
    execute(rowNode: RowNode): any;
    private sortRowNode(rowNode, sortOptions);
    private compareRowNodes(sortOptions, nodeA, nodeB);
    private updateChildIndexes(rowNode);
}
