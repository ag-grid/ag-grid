// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../../entities/rowNode";
import { Column } from "../../entities/column";
export declare class ChangedPath {
    private keepingColumns;
    private nodeIdsToBoolean;
    private nodeIdsToColumns;
    constructor(keepingColumns: boolean);
    addParentNode(rowNode: RowNode, columns?: Column[]): void;
    isInPath(rowNode: RowNode): boolean;
    getValueColumnsForNode(rowNode: RowNode, valueColumns: Column[]): Column[];
    getNotValueColumnsForNode(rowNode: RowNode, valueColumns: Column[]): Column[];
}
