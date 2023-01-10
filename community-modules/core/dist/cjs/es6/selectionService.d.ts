// Type definitions for @ag-grid-community/core v29.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "./entities/rowNode";
import { BeanStub } from "./context/beanStub";
import { SelectionEventSourceType } from "./events";
import { ChangedPath } from "./utils/changedPath";
export declare class SelectionService extends BeanStub {
    private rowModel;
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
    deselectAllRowNodes(source: SelectionEventSourceType, justFiltered?: boolean): void;
    selectAllRowNodes(source: SelectionEventSourceType, justFiltered?: boolean): void;
}
