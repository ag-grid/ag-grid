// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RowNode } from "../../entities/rowNode";
export declare class SortStage {
    private gridOptionsWrapper;
    private sortController;
    private valueService;
    execute(rowsToSort: RowNode[]): RowNode[];
    private sortList(nodes, sortOptions);
    private recursivelyResetSort(rowNodes);
    private updateChildIndexes(nodes);
}
