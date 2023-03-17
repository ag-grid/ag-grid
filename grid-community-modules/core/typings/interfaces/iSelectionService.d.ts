import { RowNode } from "../entities/rowNode";
import { SelectionEventSourceType } from "../events";
import { ChangedPath } from "../utils/changedPath";
import { IServerSideGroupSelectionState, IServerSideSelectionState } from "./iServerSideSelection";
export interface ISelectionService {
    getServerSideSelectionState(): IServerSideSelectionState | IServerSideGroupSelectionState | null;
    setServerSideSelectionState(state: IServerSideSelectionState | IServerSideGroupSelectionState): void;
    getSelectedNodes(): RowNode<any>[];
    getSelectedRows(): any[];
    getSelectionCount(): number;
    setNodeSelected(params: ISetNodeSelectedParams): number;
    filterFromSelection(predicate: (node: RowNode) => boolean): void;
    updateGroupsFromChildrenSelections(source: SelectionEventSourceType, changedPath?: ChangedPath): boolean;
    syncInRowNode(rowNode: RowNode, oldNode: RowNode | null): void;
    reset(): void;
    getBestCostNodeSelection(): RowNode[] | undefined;
    isEmpty(): boolean;
    /**
     * @param justFiltered whether to just include nodes which have passed the filter
     * @param justCurrentPage whether to just include nodes on the current page
     * @returns all nodes including unselectable nodes which are the target of this selection attempt
     */
    getSelectAllState(justFiltered?: boolean, justCurrentPage?: boolean): boolean | null;
    selectAllRowNodes(params: {
        source: SelectionEventSourceType;
        justFiltered?: boolean;
        justCurrentPage?: boolean;
    }): void;
    deselectAllRowNodes(params: {
        source: SelectionEventSourceType;
        justFiltered?: boolean;
        justCurrentPage?: boolean;
    }): void;
}
export interface ISetNodeSelectedParams {
    node: RowNode;
    newValue: boolean;
    clearSelection?: boolean;
    suppressFinishActions?: boolean;
    rangeSelect?: boolean;
    groupSelectsFiltered?: boolean;
    source: SelectionEventSourceType;
    event?: Event;
}
