import { RowNode, SelectionEventSourceType, ISetNodeSelectedParams } from "@ag-grid-community/core";

export interface ISelectionStrategy {
    getSelectedState(): any;
    setSelectedState(state: any): void;
    setNodeSelected(params: ISetNodeSelectedParams): number;
    isNodeSelected(node: RowNode): boolean | undefined;
    processNewRow(node: RowNode): void;
    getSelectedNodes(): RowNode<any>[];
    getSelectedRows(): any[];
    getSelectionCount(): number;
    isEmpty(): boolean;
    selectAllRowNodes(params: { source: SelectionEventSourceType; justFiltered?: boolean | undefined; justCurrentPage?: boolean | undefined; }): void;
    deselectAllRowNodes(params: { source: SelectionEventSourceType; justFiltered?: boolean | undefined; justCurrentPage?: boolean | undefined; }): void;
    getSelectAllState(justFiltered?: boolean, justCurrentPage?: boolean): boolean | null;
    deleteSelectionStateFromParent(parentRoute: string[], removedNodeIds: string[]): boolean;
}