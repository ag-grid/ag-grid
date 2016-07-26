// Type definitions for ag-grid v5.0.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
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
    clearOtherNodes(rowNodeToKeepSelected: RowNode): void;
    private onRowSelected(event);
    syncInRowNode(rowNode: RowNode): void;
    reset(): void;
    getBestCostNodeSelection(): any;
    setRowModel(rowModel: any): void;
    isEmpty(): boolean;
    deselectAllRowNodes(): void;
    selectAllRowNodes(): void;
    selectNode(rowNode: RowNode, tryMulti: boolean): void;
    deselectIndex(rowIndex: number): void;
    deselectNode(rowNode: RowNode): void;
    selectIndex(index: any, tryMulti: boolean): void;
}
