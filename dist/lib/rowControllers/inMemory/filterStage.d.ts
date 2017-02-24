// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { IRowNodeStage, StageExecuteParams } from "../../interfaces/iRowNodeStage";
export declare class FilterStage implements IRowNodeStage {
    private gridOptionsWrapper;
    private filterManager;
    execute(params: StageExecuteParams): void;
    private recursivelyFilter(rowNode, filterActive);
    private setAllChildrenCount(rowNode);
}
