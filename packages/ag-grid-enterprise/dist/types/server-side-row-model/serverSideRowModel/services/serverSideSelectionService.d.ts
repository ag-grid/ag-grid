import type { BeanCollection, ISelectionService, ISetNodesSelectedParams, NamedBean, RowNode, SelectionEventSourceType, ServerSideRowGroupSelectionState, ServerSideRowSelectionState } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class ServerSideSelectionService extends BeanStub implements NamedBean, ISelectionService {
    beanName: "selectionService";
    private rowModel;
    wireBeans(beans: BeanCollection): void;
    private selectionStrategy;
    postConstruct(): void;
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
    syncInRowNode(rowNode: RowNode<any>): void;
    reset(): void;
    isEmpty(): boolean;
    hasNodesToSelect(): boolean;
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
    updateGroupsFromChildrenSelections(): boolean;
    getBestCostNodeSelection(): RowNode<any>[] | undefined;
    filterFromSelection(): void;
    private dispatchSelectionChanged;
}
