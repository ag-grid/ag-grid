// Type definitions for @ag-grid-community/core v29.1.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "./entities/rowNode";
import { BeanStub } from "./context/beanStub";
import { SelectionEventSourceType } from "./events";
import { ChangedPath } from "./utils/changedPath";
export declare class SelectionService extends BeanStub {
    private rowModel;
    private paginationProxy;
    private selectedNodes;
    private logger;
    private lastSelectedNode;
    private groupSelectsChildren;
    private setBeans;
    private init;
    setLastSelectedNode(rowNode: RowNode): void;
    getLastSelectedNode(): RowNode | null;
    getSelectedNodes(): RowNode<any>[];
    getSelectedRows(): any[];
    removeGroupsFromSelection(): void;
    updateGroupsFromChildrenSelections(source: SelectionEventSourceType, changedPath?: ChangedPath): boolean;
    getNodeForIdIfSelected(id: number): RowNode | undefined;
    clearOtherNodes(rowNodeToKeepSelected: RowNode, source: SelectionEventSourceType): number;
    private onRowSelected;
    syncInRowNode(rowNode: RowNode, oldNode: RowNode | null): void;
    private syncInOldRowNode;
    private syncInNewRowNode;
    reset(): void;
    getBestCostNodeSelection(): RowNode[] | undefined;
    setRowModel(rowModel: any): void;
    isEmpty(): boolean;
    deselectAllRowNodes(params: {
        source: SelectionEventSourceType;
        justFiltered?: boolean;
        justCurrentPage?: boolean;
    }): void;
    /**
     * @param justFiltered whether to just include nodes which have passed the filter
     * @param justCurrentPage whether to just include nodes on the current page
     * @returns all nodes including unselectable nodes which are the target of this selection attempt
     */
    getNodesToSelect(justFiltered?: boolean, justCurrentPage?: boolean): RowNode<any>[];
    selectAllRowNodes(params: {
        source: SelectionEventSourceType;
        justFiltered?: boolean;
        justCurrentPage?: boolean;
    }): void;
}
