import { BeanStub, IServerSideGroupSelectionState, RowNode, SelectionEventSourceType, ISetNodesSelectedParams } from "ag-grid-community";
import { ISelectionStrategy } from "./iSelectionStrategy";
export declare class GroupSelectsChildrenStrategy extends BeanStub implements ISelectionStrategy {
    private rowModel;
    private columnModel;
    private filterManager;
    private serverSideRowModel;
    private selectionService;
    private selectedState;
    private lastSelected;
    private init;
    getSelectedState(): IServerSideGroupSelectionState;
    setSelectedState(state: IServerSideGroupSelectionState): void;
    deleteSelectionStateFromParent(parentRoute: string[], removedNodeIds: string[]): boolean;
    setNodesSelected(params: ISetNodesSelectedParams): number;
    isNodeSelected(node: RowNode): boolean | undefined;
    private isNodePathSelected;
    private getRouteToNode;
    private removeRedundantState;
    private recursivelySelectNode;
    getSelectedNodes(): RowNode<any>[];
    processNewRow(node: RowNode<any>): void;
    getSelectedRows(): any[];
    getSelectionCount(): number;
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
}
