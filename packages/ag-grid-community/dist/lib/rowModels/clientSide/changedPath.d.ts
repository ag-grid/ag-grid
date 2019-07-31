// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../../entities/rowNode";
import { Column } from "../../entities/column";
export declare class ChangedPath {
    private readonly keepingColumns;
    private readonly pathRoot;
    private active;
    private nodeIdsToColumns;
    private mapToItems;
    constructor(keepingColumns: boolean, rootNode: RowNode);
    setInactive(): void;
    isActive(): boolean;
    private depthFirstSearchChangedPath;
    private depthFirstSearchEverything;
    forEachChangedNodeDepthFirst(callback: (rowNode: RowNode) => void, traverseLeafNodes?: boolean): void;
    executeFromRootNode(callback: (rowNode: RowNode) => void): void;
    private createPathItems;
    private populateColumnsMap;
    private linkPathItems;
    addParentNode(rowNode: RowNode | null, columns?: Column[]): void;
    canSkip(rowNode: RowNode): boolean;
    getValueColumnsForNode(rowNode: RowNode, valueColumns: Column[]): Column[];
    getNotValueColumnsForNode(rowNode: RowNode, valueColumns: Column[]): Column[];
}
