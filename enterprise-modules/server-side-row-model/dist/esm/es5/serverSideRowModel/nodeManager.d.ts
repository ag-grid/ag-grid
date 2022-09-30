import { RowNode } from "@ag-grid-community/core";
export declare class NodeManager {
    private rowNodes;
    addRowNode(rowNode: RowNode): void;
    removeNode(rowNode: RowNode): void;
    clear(): void;
}
