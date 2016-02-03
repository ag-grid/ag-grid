// Type definitions for ag-grid v3.3.0-alpha.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import GridOptionsWrapper from "../gridOptionsWrapper";
import { ColumnGroupChild } from "../entities/columnGroupChild";
export default class ColumnUtils {
    private gridOptionsWrapper;
    init(gridOptionsWrapper: GridOptionsWrapper): void;
    calculateColInitialWidth(colDef: any): number;
    deptFirstAllColumnTreeSearch(tree: ColumnGroupChild[], callback: (treeNode: ColumnGroupChild) => void): void;
    deptFirstDisplayedColumnTreeSearch(tree: ColumnGroupChild[], callback: (treeNode: ColumnGroupChild) => void): void;
}
