import { RowNode } from "../entities/rowNode";
import { SelectionEventSourceType } from "../events";
import { ChangedPath } from "../utils/changedPath";

export interface ISelectionService {
    setLastSelectedNode(rowNode: RowNode): void;
    getLastSelectedNode(): RowNode | null;
    getSelectedNodes(): RowNode<any>[];
    getSelectedRows(): any[];
    removeGroupsFromSelection(): void;
    updateGroupsFromChildrenSelections(source: SelectionEventSourceType, changedPath?: ChangedPath): boolean;
    clearOtherNodes(rowNodeToKeepSelected: RowNode, source: SelectionEventSourceType): number;
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
