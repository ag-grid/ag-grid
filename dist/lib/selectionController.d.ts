// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "./entities/rowNode";
export declare class SelectionController {
    private eventService;
    private rowModel;
    private gridOptionsWrapper;
    private selectedNodes;
    private logger;
    private lastSelectedNode;
    private groupSelectsChildren;
    private setBeans(loggerFactory);
    init(): void;
    setLastSelectedNode(rowNode: RowNode): void;
    getLastSelectedNode(): RowNode;
    getSelectedNodes(): RowNode[];
    getSelectedRows(): any[];
    removeGroupsFromSelection(): void;
    updateGroupsFromChildrenSelections(): void;
    getNodeForIdIfSelected(id: number): RowNode;
    clearOtherNodes(rowNodeToKeepSelected: RowNode): number;
    private onRowSelected(event);
    syncInRowNode(rowNode: RowNode, oldNode: RowNode): void;
    private syncInOldRowNode(rowNode, oldNode);
    private syncInNewRowNode(rowNode);
    reset(): void;
    getBestCostNodeSelection(): any;
    setRowModel(rowModel: any): void;
    isEmpty(): boolean;
    deselectAllRowNodes(justFiltered?: boolean): void;
    selectAllRowNodes(justFiltered?: boolean): void;
    selectNode(rowNode: RowNode, tryMulti: boolean): void;
    deselectIndex(rowIndex: number): void;
    deselectNode(rowNode: RowNode): void;
    selectIndex(index: any, tryMulti: boolean): void;
}
