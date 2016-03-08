// Type definitions for ag-grid v4.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RowNode } from "../../entities/rowNode";
import { IRowNodeStage } from "../../interfaces/iRowNodeStage";
export declare class FilterStage implements IRowNodeStage {
    private gridOptionsWrapper;
    private filterManager;
    execute(rowsToFilter: RowNode[]): RowNode[];
    private filterItems(rowNodes);
    private recursivelyResetFilter(nodes);
    private getTotalChildCount(rowNodes);
}
