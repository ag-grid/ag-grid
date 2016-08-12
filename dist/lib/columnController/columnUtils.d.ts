// Type definitions for ag-grid v5.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { ColumnGroupChild } from "../entities/columnGroupChild";
import { OriginalColumnGroupChild } from "../entities/originalColumnGroupChild";
import { OriginalColumnGroup } from "../entities/originalColumnGroup";
import { Column } from "../entities/column";
export declare class ColumnUtils {
    private gridOptionsWrapper;
    calculateColInitialWidth(colDef: any): number;
    getOriginalPathForColumn(column: Column, originalBalancedTree: OriginalColumnGroupChild[]): OriginalColumnGroup[];
    deptFirstOriginalTreeSearch(tree: OriginalColumnGroupChild[], callback: (treeNode: OriginalColumnGroupChild) => void): void;
    deptFirstAllColumnTreeSearch(tree: ColumnGroupChild[], callback: (treeNode: ColumnGroupChild) => void): void;
    deptFirstDisplayedColumnTreeSearch(tree: ColumnGroupChild[], callback: (treeNode: ColumnGroupChild) => void): void;
}
