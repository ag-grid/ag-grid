import { RowNode } from "./entities/rowNode";
import { BeanStub } from "./context/beanStub";
import { SelectionEventSourceType } from "./events";
import { ChangedPath } from "./utils/changedPath";
import { ISelectionService } from "./interfaces/iSelectionService";
import { SetSelectedParams } from "./interfaces/iRowNode";
export declare class SelectionService extends BeanStub implements ISelectionService {
    private rowModel;
    private paginationProxy;
    private selectedNodes;
    private logger;
    private lastSelectedNode;
    private groupSelectsChildren;
    private rowSelection?;
    private setBeans;
    private init;
    private isMultiselect;
    setNodeSelected(params: SetSelectedParams & {
        event?: Event;
        node: RowNode;
    }): number;
    private selectRange;
    private selectChildren;
    private setLastSelectedNode;
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
    reset(): void;
    getBestCostNodeSelection(): RowNode[] | undefined;
    isEmpty(): boolean;
    deselectAllRowNodes(params: {
        source: SelectionEventSourceType;
        justFiltered?: boolean;
        justCurrentPage?: boolean;
    }): void;
    getSelectAllState(justFiltered?: boolean | undefined, justCurrentPage?: boolean | undefined): boolean | null;
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
    getServerSideSelectionState(): null;
    setServerSideSelectionState(state: any): void;
}
