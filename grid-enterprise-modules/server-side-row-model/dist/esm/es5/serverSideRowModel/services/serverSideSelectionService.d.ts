import { BeanStub, ChangedPath, ISelectionService, IServerSideSelectionState, IServerSideGroupSelectionState, RowNode, SelectionEventSourceType, ISetNodeSelectedParams } from "@ag-grid-community/core";
import { ISelectionStrategy } from "./selection/strategies/iSelectionStrategy";
export declare class ServerSideSelectionService extends BeanStub implements ISelectionService {
    private rowModel;
    selectionStrategy: ISelectionStrategy;
    private init;
    getServerSideSelectionState(): any;
    setServerSideSelectionState(state: IServerSideSelectionState | IServerSideGroupSelectionState): void;
    setNodeSelected(params: ISetNodeSelectedParams): number;
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
