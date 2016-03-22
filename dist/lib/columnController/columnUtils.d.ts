// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { ColumnGroupChild } from "../entities/columnGroupChild";
import { ColumnGroup } from "../entities/columnGroup";
import { OriginalColumnGroupChild } from "../entities/originalColumnGroupChild";
import { Column } from "../entities/column";
export declare class ColumnUtils {
    private gridOptionsWrapper;
    calculateColInitialWidth(colDef: any): number;
    getPathForColumn(column: Column, allDisplayedColumnGroups: ColumnGroupChild[]): ColumnGroup[];
    deptFirstOriginalTreeSearch(tree: OriginalColumnGroupChild[], callback: (treeNode: OriginalColumnGroupChild) => void): void;
    deptFirstAllColumnTreeSearch(tree: ColumnGroupChild[], callback: (treeNode: ColumnGroupChild) => void): void;
    deptFirstDisplayedColumnTreeSearch(tree: ColumnGroupChild[], callback: (treeNode: ColumnGroupChild) => void): void;
}
