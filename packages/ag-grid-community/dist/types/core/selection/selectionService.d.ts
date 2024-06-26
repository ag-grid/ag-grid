import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import type { SelectionEventSourceType } from '../events';
import type { ISelectionService, ISetNodesSelectedParams } from '../interfaces/iSelectionService';
import type { ServerSideRowGroupSelectionState, ServerSideRowSelectionState } from '../interfaces/selectionState';
import { ChangedPath } from '../utils/changedPath';
export declare class SelectionService extends BeanStub implements NamedBean, ISelectionService {
    beanName: "selectionService";
    private rowModel;
    private pageBoundsService;
    wireBeans(beans: BeanCollection): void;
    private selectedNodes;
    private selectionCtx;
    private groupSelectsChildren;
    private rowSelection?;
    postConstruct(): void;
    destroy(): void;
    private isMultiselect;
    /**
     * We override the selection value for UI-triggered events because it's the
     * current selection state that should determine the next selection state. This
     * is a stepping stone towards removing selection logic from event listeners and
     * other code external to the selection service(s).
     */
    private overrideSelectionValue;
    setNodesSelected(params: ISetNodesSelectedParams): number;
    private selectRange;
    private selectChildren;
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
    private forEachNodeOnPage;
    selectAllRowNodes(params: {
        source: SelectionEventSourceType;
        justFiltered?: boolean;
        justCurrentPage?: boolean;
    }): void;
    getSelectionState(): string[] | null;
    setSelectionState(state: string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState, source: SelectionEventSourceType): void;
    private dispatchSelectionChanged;
}
