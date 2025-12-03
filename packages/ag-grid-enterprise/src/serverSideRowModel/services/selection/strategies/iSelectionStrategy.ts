import type {
    IServerSideGroupSelectionState,
    IServerSideSelectionState,
    ISetNodesSelectedParams,
    RowNode,
    SelectAllMode,
    SelectionEventSourceType,
    _Bean,
} from 'ag-grid-community';

export interface ISelectionStrategy extends _Bean {
    getSelectedState(): IServerSideSelectionState | IServerSideGroupSelectionState;
    setSelectedState(state: IServerSideSelectionState | IServerSideGroupSelectionState): void;
    setNodesSelected(params: ISetNodesSelectedParams): number;
    isNodeSelected(node: RowNode): boolean | undefined;
    processNewRow(node: RowNode): void;
    getSelectedNodes(nullWhenSelectAll?: boolean, warnWhenSelectAll?: boolean): RowNode<any>[] | null;
    getSelectedRows(): any[];
    getSelectionCount(): number;
    isEmpty(): boolean;
    selectAllRowNodes(params: { source: SelectionEventSourceType; selectAll?: SelectAllMode }): void;
    deselectAllRowNodes(params: { source: SelectionEventSourceType; selectAll?: SelectAllMode }): void;
    getSelectAllState(selectAll?: SelectAllMode): boolean | null;
    deleteSelectionStateFromParent(parentRoute: string[], removedNodeIds: string[]): boolean;
}
