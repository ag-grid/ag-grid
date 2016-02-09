// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import GridOptionsWrapper from "../gridOptionsWrapper";
import { ColumnGroupChild } from "../entities/columnGroupChild";
import ColumnGroup from "../entities/columnGroup";
import { OriginalColumnGroupChild } from "../entities/originalColumnGroupChild";
import Column from "../entities/column";
export default class ColumnUtils {
    private gridOptionsWrapper;
    init(gridOptionsWrapper: GridOptionsWrapper): void;
    calculateColInitialWidth(colDef: any): number;
    getPathForColumn(column: Column, allDisplayedColumnGroups: ColumnGroupChild[]): ColumnGroup[];
    deptFirstOriginalTreeSearch(tree: OriginalColumnGroupChild[], callback: (treeNode: OriginalColumnGroupChild) => void): void;
    deptFirstAllColumnTreeSearch(tree: ColumnGroupChild[], callback: (treeNode: ColumnGroupChild) => void): void;
    deptFirstDisplayedColumnTreeSearch(tree: ColumnGroupChild[], callback: (treeNode: ColumnGroupChild) => void): void;
}
