import { RowNode, SelectionEventSourceType, ISetNodesSelectedParams } from "ag-grid-community";
export interface ISelectionStrategy {
    getSelectedState(): any;
    setSelectedState(state: any): void;
    setNodesSelected(params: ISetNodesSelectedParams): number;
    isNodeSelected(node: RowNode): boolean | undefined;
    processNewRow(node: RowNode): void;
    getSelectedNodes(): RowNode<any>[];
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
    deleteSelectionStateFromParent(parentRoute: string[], removedNodeIds: string[]): boolean;
}
