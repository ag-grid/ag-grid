import { RowNode, SelectionEventSourceType, ISetNodeSelectedParams } from "@ag-grid-community/core";

export interface ISelectionStrategy {
    getSelectedState(): any;
    setNodeSelected(params: ISetNodeSelectedParams): number;
    isNodeSelected(node: RowNode): boolean | undefined;
    getSelectedNodes(): RowNode<any>[];
    getSelectedRows(): any[];
    getBestCostNodeSelection(): RowNode<any>[] | undefined;
    isEmpty(): boolean;
    selectAllRowNodes(params: { source: SelectionEventSourceType; justFiltered?: boolean | undefined; justCurrentPage?: boolean | undefined; }): void;
    deselectAllRowNodes(params: { source: SelectionEventSourceType; justFiltered?: boolean | undefined; justCurrentPage?: boolean | undefined; }): void;
    getSelectAllState(justFiltered?: boolean, justCurrentPage?: boolean): boolean | null;
}