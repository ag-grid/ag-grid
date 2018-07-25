// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../../entities/rowNode";
import { Column } from "../../entities/column";
export declare class ChangedPath {
    private active;
    private keepingColumns;
    private nodeIdsToBoolean;
    private nodeIdsToColumns;
    constructor(keepingColumns: boolean);
    setInactive(): void;
    isActive(): boolean;
    addParentNode(rowNode: RowNode, columns?: Column[]): void;
    isInPath(rowNode: RowNode): boolean;
    getValueColumnsForNode(rowNode: RowNode, valueColumns: Column[]): Column[];
    getNotValueColumnsForNode(rowNode: RowNode, valueColumns: Column[]): Column[];
    private validateActive();
}
