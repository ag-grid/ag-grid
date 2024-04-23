import { BeanStub, ChangedPath, ISelectionService, RowNode, SelectionEventSourceType, ISetNodesSelectedParams, ServerSideRowSelectionState, ServerSideRowGroupSelectionState } from "ag-grid-community";
export declare class ServerSideSelectionService extends BeanStub implements ISelectionService {
    private rowModel;
    private selectionStrategy;
    private init;
    getSelectionState(): string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState | null;
    setSelectionState(state: string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState, source: SelectionEventSourceType): void;
    setNodesSelected(params: ISetNodesSelectedParams): number;
    /**
     * Deletes the selection state for a set of nodes, for use after deleting nodes via
     * transaction. As this is designed for transactions, all nodes should belong to the same group.
     */
    deleteSelectionStateFromParent(storeRoute: string[], removedNodeIds: string[]): void;
    private shotgunResetNodeSelectionState;
    getSelectedNodes(): RowNode<any>[];
    getSelectedRows(): any[];
    getSelectionCount(): number;
    syncInRowNode(rowNode: RowNode<any>, oldNode: RowNode<any> | null): void;
    reset(): void;
    isEmpty(): boolean;
    hasNodesToSelect(justFiltered?: boolean, justCurrentPage?: boolean): boolean;
    selectAllRowNodes(params: {
        source: SelectionEventSourceType;
        justFiltered?: boolean | undefined;
        justCurrentPage?: boolean | undefined;
    }): void;
    deselectAllRowNodes(params: {
        source: SelectionEventSourceType;
        justFiltered?: boolean | undefined;
        justCurrentPage?: boolean | undefined;
    }): void;
    getSelectAllState(justFiltered?: boolean, justCurrentPage?: boolean): boolean | null;
    updateGroupsFromChildrenSelections(source: SelectionEventSourceType, changedPath?: ChangedPath | undefined): boolean;
    getBestCostNodeSelection(): RowNode<any>[] | undefined;
    filterFromSelection(): void;
}
