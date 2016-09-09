// Type definitions for ag-grid v5.4.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RowNode } from "../../entities/rowNode";
import { IRowNodeStage } from "../../interfaces/iRowNodeStage";
export declare class FilterStage implements IRowNodeStage {
    private gridOptionsWrapper;
    private filterManager;
    execute(rowNode: RowNode): any;
    private recursivelyFilter(rowNode, filterActive);
    private setAllChildrenCount(rowNode);
}
