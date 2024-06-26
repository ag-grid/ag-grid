import type { BeanCollection, IServerSideSelectionState, ISetNodesSelectedParams, RowNode, SelectionEventSourceType } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import type { ISelectionStrategy } from './iSelectionStrategy';
export declare class DefaultStrategy extends BeanStub implements ISelectionStrategy {
    private rowModel;
    private selectionCtx;
    wireBeans(beans: BeanCollection): void;
    private selectedState;
    private selectAllUsed;
    private selectedNodes;
    private rowSelection?;
    postConstruct(): void;
    getSelectedState(): IServerSideSelectionState;
    setSelectedState(state: any): void;
    deleteSelectionStateFromParent(parentPath: string[], removedNodeIds: string[]): boolean;
    private overrideSelectionValue;
    setNodesSelected(params: ISetNodesSelectedParams): number;
    processNewRow(node: RowNode<any>): void;
    isNodeSelected(node: RowNode): boolean | undefined;
    getSelectedNodes(): RowNode<any>[];
    getSelectedRows(): any[];
    getSelectionCount(): number;
    clearOtherNodes(rowNodeToKeepSelected: RowNode<any>, source: SelectionEventSourceType): number;
    isEmpty(): boolean;
    selectAllRowNodes(): void;
    deselectAllRowNodes(): void;
    getSelectAllState(): boolean | null;
}
