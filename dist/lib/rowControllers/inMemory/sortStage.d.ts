// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { StageExecuteParams } from "../../interfaces/iRowNodeStage";
export declare class SortStage {
    private gridOptionsWrapper;
    private sortController;
    private valueService;
    execute(params: StageExecuteParams): void;
    private sortRowNode(rowNode, sortOptions);
    private compareRowNodes(sortOptions, nodeA, nodeB);
    private updateChildIndexes(rowNode);
}
