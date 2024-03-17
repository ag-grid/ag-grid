import { RowNode } from "./entities/rowNode";
import { BeanStub } from "./context/beanStub";
import { SelectionEventSourceType } from "./events";
import { ChangedPath } from "./utils/changedPath";
import { ISelectionService, ISetNodesSelectedParams } from "./interfaces/iSelectionService";
import { ServerSideRowGroupSelectionState, ServerSideRowSelectionState } from "./interfaces/selectionState";
export declare class SelectionService extends BeanStub implements ISelectionService {
    private rowModel;
    private paginationProxy;
    private selectedNodes;
    private lastRowNode;
    private groupSelectsChildren;
    private rowSelection?;
    private init;
    protected destroy(): void;
    private isMultiselect;
    setNodesSelected(params: ISetNodesSelectedParams): number;
    private selectRange;
    private selectChildren;
    private getLastSelectedNode;
    getSelectedNodes(): RowNode<any>[];
    getSelectedRows(): any[];
    getSelectionCount(): number;
    /**
     * This method is used by the CSRM to remove groups which are being disposed of,
     * events do not need fired in this case
     */
    filterFromSelection(predicate: (node: RowNode) => boolean): void;
    updateGroupsFromChildrenSelections(source: SelectionEventSourceType, changedPath?: ChangedPath): boolean;
    clearOtherNodes(rowNodeToKeepSelected: RowNode, source: SelectionEventSourceType): number;
    private onRowSelected;
    syncInRowNode(rowNode: RowNode, oldNode: RowNode | null): void;
    private syncInOldRowNode;
    private syncInNewRowNode;
    reset(source: SelectionEventSourceType): void;
    private resetNodes;
    getBestCostNodeSelection(): RowNode[] | undefined;
    isEmpty(): boolean;
    deselectAllRowNodes(params: {
        source: SelectionEventSourceType;
        justFiltered?: boolean;
        justCurrentPage?: boolean;
    }): void;
    private getSelectedCounts;
    getSelectAllState(justFiltered?: boolean | undefined, justCurrentPage?: boolean | undefined): boolean | null;
    hasNodesToSelect(justFiltered?: boolean, justCurrentPage?: boolean): boolean;
    /**
     * @param justFiltered whether to just include nodes which have passed the filter
     * @param justCurrentPage whether to just include nodes on the current page
     * @returns all nodes including unselectable nodes which are the target of this selection attempt
     */
    private getNodesToSelect;
    selectAllRowNodes(params: {
        source: SelectionEventSourceType;
        justFiltered?: boolean;
        justCurrentPage?: boolean;
    }): void;
    getSelectionState(): string[] | null;
    setSelectionState(state: string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState, source: SelectionEventSourceType): void;
}
