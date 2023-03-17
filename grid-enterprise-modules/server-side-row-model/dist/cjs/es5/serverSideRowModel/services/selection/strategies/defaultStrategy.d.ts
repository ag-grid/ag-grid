import { BeanStub, RowNode, SelectionEventSourceType, ISetNodeSelectedParams, IServerSideSelectionState } from "@ag-grid-community/core";
import { ISelectionStrategy } from "./iSelectionStrategy";
export declare class DefaultStrategy extends BeanStub implements ISelectionStrategy {
    private rowModel;
    private selectedState;
    private lastSelected;
    private selectAllUsed;
    private selectedNodes;
    private rowSelection?;
    private init;
    getSelectedState(): IServerSideSelectionState;
    setSelectedState(state: any): void;
    deleteSelectionStateFromParent(parentPath: string[], removedNodeIds: string[]): boolean;
    setNodeSelected(params: ISetNodeSelectedParams): number;
    processNewRow(node: RowNode<any>): void;
    isNodeSelected(node: RowNode): boolean | undefined;
    getSelectedNodes(): RowNode<any>[];
    getSelectedRows(): any[];
    getSelectionCount(): number;
    clearOtherNodes(rowNodeToKeepSelected: RowNode<any>, source: SelectionEventSourceType): number;
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
