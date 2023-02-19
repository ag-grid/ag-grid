import { RowNode } from "./entities/rowNode";
import { Bean } from "./context/context";
import { BeanStub } from "./context/beanStub";
import { Qualifier } from "./context/context";
import { Logger } from "./logger";
import { LoggerFactory } from "./logger";
import { Events, SelectionChangedEvent, SelectionEventSourceType } from "./events";
import { Autowired } from "./context/context";
import { IRowModel } from "./interfaces/iRowModel";
import { PostConstruct } from "./context/context";
import { ChangedPath } from "./utils/changedPath";
import { IClientSideRowModel } from "./interfaces/iClientSideRowModel";
import { iterateObject } from "./utils/object";
import { exists } from "./utils/generic";
import { WithoutGridCommon } from "./interfaces/iCommon";
import { PaginationProxy } from "./pagination/paginationProxy";
import { ISelectionService } from "./interfaces/iSelectionService";
import { SetSelectedParams } from "./interfaces/iRowNode";
import { _ } from "./utils";

@Bean('selectionService')
export class SelectionService extends BeanStub implements ISelectionService {

    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;

    private selectedNodes: { [key: string]: RowNode | undefined; };
    private logger: Logger;

    // used for shift selection, so we know where to start the range selection from
    private lastSelectedNode: RowNode | null;

    private groupSelectsChildren: boolean;
    private rowSelection?: 'single' | 'multiple';

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('selectionService');
        this.reset();
    }

    @PostConstruct
    private init(): void {
        // remember to reactively update this
        this.groupSelectsChildren = this.gridOptionsService.is('groupSelectsChildren');
        this.rowSelection = this.gridOptionsService.get('rowSelection');

        this.addManagedListener(this.eventService, Events.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
    }

    private isMultiselect() {
        return this.rowSelection === 'multiple';
    }

    public setNodeSelected(params: SetSelectedParams & { event?: Event, node: RowNode }): number {
        const {
            newValue,
            clearSelection,
            suppressFinishActions,
            rangeSelect,
            event,
            node,
            source = 'api',
        } = params;

        // groupSelectsFiltered only makes sense when group selects children
        const groupSelectsFiltered = this.groupSelectsChildren && (params.groupSelectsFiltered === true);

        if (node.id === undefined) {
            console.warn('AG Grid: cannot select node until id for node is known');
            return 0;
        }

        if (node.rowPinned) {
            console.warn('AG Grid: cannot select pinned rows');
            return 0;
        }

        // if we are a footer, we don't do selection, just pass the info
        // to the sibling (the parent of the group)
        if (node.footer) {
            return this.setNodeSelected({ ...params, node: node.sibling });
        }

        const lastSelectedNode = this.getLastSelectedNode();
        if (rangeSelect && lastSelectedNode) {
            const newRowClicked = lastSelectedNode !== node;
            if (newRowClicked && this.isMultiselect()) {
                const nodesChanged = this.selectRange(node, lastSelectedNode, params.newValue, source);
                this.setLastSelectedNode(node);
                return nodesChanged;
            }
        }

        // when groupSelectsFiltered, then this node may end up intermediate despite
        // trying to set it to true / false. this group will be calculated further on
        // down when we call calculatedSelectedForAllGroupNodes(). we need to skip it
        // here, otherwise the updatedCount would include it.
        const skipThisNode = groupSelectsFiltered && node.group;
        let updatedCount = 0;

        if (!skipThisNode) {
            const thisNodeWasSelected = node.selectThisNode(newValue, params.event, source);
            if (thisNodeWasSelected) {
                updatedCount++;
            }
        }

        if (this.groupSelectsChildren && node.childrenAfterGroup?.length) {
            updatedCount += this.selectChildren(node, newValue, groupSelectsFiltered, source);
        }

        // clear other nodes if not doing multi select
        if (!suppressFinishActions) {
            const clearOtherNodes = newValue && (clearSelection || !this.isMultiselect());
            if (clearOtherNodes) {
                updatedCount += this.clearOtherNodes(node, source);
            }

            // only if we selected something, then update groups and fire events
            if (updatedCount > 0) {
                this.updateGroupsFromChildrenSelections(source);

                // this is the very end of the 'action node', so we are finished all the updates,
                // include any parent / child changes that this method caused
                const event: WithoutGridCommon<SelectionChangedEvent> = {
                    type: Events.EVENT_SELECTION_CHANGED,
                    source
                };
                this.eventService.dispatchEvent(event);
            }

            // so if user next does shift-select, we know where to start the selection from
            if (newValue) {
                this.setLastSelectedNode(node);
            }
        }
        return updatedCount;
    }

    // selects all rows between this node and the last selected node (or the top if this is the first selection).
    // not to be mixed up with 'cell range selection' where you drag the mouse, this is row range selection, by
    // holding down 'shift'.
    private selectRange(fromNode: RowNode, toNode: RowNode, value: boolean = true, source: SelectionEventSourceType): number {
        const nodesToSelect = this.rowModel.getNodesInRangeForSelection(fromNode, toNode);   

        let updatedCount = 0;

        nodesToSelect.forEach(rowNode => {
            if (rowNode.group && this.groupSelectsChildren || (value === false && fromNode === rowNode)) { return; }

            const nodeWasSelected = rowNode.selectThisNode(value, undefined, source);
            if (nodeWasSelected) {
                updatedCount++;
            }
        });

        this.updateGroupsFromChildrenSelections(source);

        const event: WithoutGridCommon<SelectionChangedEvent> = {
            type: Events.EVENT_SELECTION_CHANGED,
            source
        };

        this.eventService.dispatchEvent(event);

        return updatedCount;
    }

    private selectChildren(node: RowNode, newValue: boolean, groupSelectsFiltered: boolean, source: SelectionEventSourceType): number {
        const children = groupSelectsFiltered ? node.childrenAfterAggFilter : node.childrenAfterGroup;

        if (_.missing(children)) { return 0; }

        let updatedCount = 0;

        for (let i = 0; i < children.length; i++) {
            updatedCount += children[i].setSelectedParams({
                newValue: newValue,
                clearSelection: false,
                suppressFinishActions: true,
                groupSelectsFiltered,
                source
            });
        }

        return updatedCount;
    }

    private setLastSelectedNode(rowNode: RowNode): void {
        this.lastSelectedNode = rowNode;
    }

    private getLastSelectedNode(): RowNode | null {
        return this.lastSelectedNode;
    }

    public getSelectedNodes() {
        const selectedNodes: RowNode[] = [];
        iterateObject(this.selectedNodes, (key: string, rowNode: RowNode) => {
            if (rowNode) {
                selectedNodes.push(rowNode);
            }
        });
        return selectedNodes;
    }

    public getSelectedRows() {
        const selectedRows: any[] = [];
        iterateObject(this.selectedNodes, (key: string, rowNode: RowNode) => {
            if (rowNode && rowNode.data) {
                selectedRows.push(rowNode.data);
            }
        });
        return selectedRows;
    }

    public getSelectionCount(): number {
        return Object.values(this.selectedNodes).length;
    }

    /**
     * This method is used by the CSRM to remove groups which are being disposed of,
     * events do not need fired in this case
     */
    public filterFromSelection(predicate: (node: RowNode) => boolean): void {
        const newSelectedNodes: { [key: string]: RowNode | undefined; } = {};
        Object.entries(this.selectedNodes).forEach(([key, node]) => {
            const passesPredicate = node && predicate(node);
            if (passesPredicate) {
                newSelectedNodes[key] = node;
            }
        })
        this.selectedNodes = newSelectedNodes;
    }

    // should only be called if groupSelectsChildren=true
    public updateGroupsFromChildrenSelections(source: SelectionEventSourceType, changedPath?: ChangedPath): boolean {
        // we only do this when group selection state depends on selected children
        if (!this.groupSelectsChildren) {
            return false;
        }
        // also only do it if CSRM (code should never allow this anyway)
        if (this.rowModel.getType() !== 'clientSide') {
            return false;
        }

        const clientSideRowModel = this.rowModel as IClientSideRowModel;
        const rootNode = clientSideRowModel.getRootNode();

        if (!changedPath) {
            changedPath = new ChangedPath(true, rootNode);
            changedPath.setInactive();
        }

        let selectionChanged = false;

        changedPath.forEachChangedNodeDepthFirst(rowNode => {
            if (rowNode !== rootNode) {
                const selected = rowNode.calculateSelectedFromChildren();
                selectionChanged = rowNode.selectThisNode(selected === null ? false : selected, undefined, source) || selectionChanged;
            }
        });

        return selectionChanged;
    }

    public clearOtherNodes(rowNodeToKeepSelected: RowNode, source: SelectionEventSourceType): number {
        const groupsToRefresh: any = {};
        let updatedCount = 0;
        iterateObject(this.selectedNodes, (key: string, otherRowNode: RowNode) => {
            if (otherRowNode && otherRowNode.id !== rowNodeToKeepSelected.id) {
                const rowNode = this.selectedNodes[otherRowNode.id!];
                updatedCount += rowNode!.setSelectedParams({
                    newValue: false,
                    clearSelection: false,
                    suppressFinishActions: true,
                    source
                });
                if (this.groupSelectsChildren && otherRowNode.parent) {
                    groupsToRefresh[otherRowNode.parent.id!] = otherRowNode.parent;
                }
            }
        });
        iterateObject(groupsToRefresh, (key: string, group: RowNode) => {
            const selected = group.calculateSelectedFromChildren();
            group.selectThisNode(selected === null ? false : selected, undefined, source);
        });
        return updatedCount;
    }

    private onRowSelected(event: any): void {
        const rowNode = event.node;

        // we do not store the group rows when the groups select children
        if (this.groupSelectsChildren && rowNode.group) {
            return;
        }

        if (rowNode.isSelected()) {
            this.selectedNodes[rowNode.id] = rowNode;
        } else {
            this.selectedNodes[rowNode.id] = undefined;
        }
    }

    public syncInRowNode(rowNode: RowNode, oldNode: RowNode | null): void {
        this.syncInOldRowNode(rowNode, oldNode);
        this.syncInNewRowNode(rowNode);
    }

    // if the id has changed for the node, then this means the rowNode
    // is getting used for a different data item, which breaks
    // our selectedNodes, as the node now is mapped by the old id
    // which is inconsistent. so to keep the old node as selected,
    // we swap in the clone (with the old id and old data). this means
    // the oldNode is effectively a daemon we keep a reference to,
    // so if client calls api.getSelectedNodes(), it gets the daemon
    // in the result. when the client un-selects, the reference to the
    // daemon is removed. the daemon, because it's an oldNode, is not
    // used by the grid for rendering, it's a copy of what the node used
    // to be like before the id was changed.
    private syncInOldRowNode(rowNode: RowNode, oldNode: RowNode | null): void {
        const oldNodeHasDifferentId = exists(oldNode) && (rowNode.id !== oldNode.id);
        if (oldNodeHasDifferentId && oldNode) {
            const id = oldNode.id!;
            const oldNodeSelected = this.selectedNodes[id] == rowNode;
            if (oldNodeSelected) {
                this.selectedNodes[oldNode.id!] = oldNode;
            }
        }
    }

    private syncInNewRowNode(rowNode: RowNode): void {
        if (exists(this.selectedNodes[rowNode.id!])) {
            rowNode.setSelectedInitialValue(true);
            this.selectedNodes[rowNode.id!] = rowNode;
        } else {
            rowNode.setSelectedInitialValue(false);
        }
    }

    public reset(): void {
        this.logger.log('reset');
        this.selectedNodes = {};
        this.lastSelectedNode = null;
    }

    // returns a list of all nodes at 'best cost' - a feature to be used
    // with groups / trees. if a group has all it's children selected,
    // then the group appears in the result, but not the children.
    // Designed for use with 'children' as the group selection type,
    // where groups don't actually appear in the selection normally.
    public getBestCostNodeSelection(): RowNode[] | undefined {
        if (this.rowModel.getType() !== 'clientSide') {
            // Error logged as part of gridApi as that is only call point for this method.
            return;
        }

        const clientSideRowModel = this.rowModel as IClientSideRowModel;

        const topLevelNodes = clientSideRowModel.getTopLevelNodes();

        if (topLevelNodes === null) {
            return;
        }

        const result: RowNode[] = [];

        // recursive function, to find the selected nodes
        function traverse(nodes: RowNode[]) {
            for (let i = 0, l = nodes.length; i < l; i++) {
                const node = nodes[i];
                if (node.isSelected()) {
                    result.push(node);
                } else {
                    // if not selected, then if it's a group, and the group
                    // has children, continue to search for selections
                    const maybeGroup = node as any;
                    if (maybeGroup.group && maybeGroup.children) {
                        traverse(maybeGroup.children);
                    }
                }
            }
        }

        traverse(topLevelNodes);

        return result;
    }

    public isEmpty(): boolean {
        let count = 0;
        iterateObject(this.selectedNodes, (nodeId: string, rowNode: RowNode) => {
            if (rowNode) {
                count++;
            }
        });
        return count === 0;
    }

    public deselectAllRowNodes(params: { source: SelectionEventSourceType, justFiltered?: boolean, justCurrentPage?: boolean }) {
        const callback = (rowNode: RowNode) => rowNode.selectThisNode(false, undefined, source);
        const rowModelClientSide = this.rowModel.getType() === 'clientSide';

        const { source, justFiltered, justCurrentPage } = params;

        if (justCurrentPage || justFiltered) {
            if (!rowModelClientSide) {
                console.error("AG Grid: selecting just filtered only works when gridOptions.rowModelType='clientSide'");
                return;
            }
            this.getNodesToSelect(justFiltered, justCurrentPage).forEach(callback);
        } else {
            iterateObject(this.selectedNodes, (id: string, rowNode: RowNode) => {
                // remember the reference can be to null, as we never 'delete' from the map
                if (rowNode) {
                    callback(rowNode);
                }
            });
            // this clears down the map (whereas above only sets the items in map to 'undefined')
            this.reset();
        }

        // the above does not clean up the parent rows if they are selected
        if (rowModelClientSide && this.groupSelectsChildren) {
            this.updateGroupsFromChildrenSelections(source);
        }

        const event: WithoutGridCommon<SelectionChangedEvent> = {
            type: Events.EVENT_SELECTION_CHANGED,
            source
        };

        this.eventService.dispatchEvent(event);
    }

    public getSelectAllState(justFiltered?: boolean | undefined, justCurrentPage?: boolean | undefined): boolean | null {
        let selectedCount = 0;
        let notSelectedCount = 0;

        const callback = (node: RowNode) => {
            if (this.groupSelectsChildren && node.group) { return; }

            if (node.isSelected()) {
                selectedCount++;
            } else if (!node.selectable) {
                // don't count non-selectable nodes!
            } else {
                notSelectedCount++;
            }
        };

        this.getNodesToSelect(justFiltered, justCurrentPage).forEach(callback);

        // if no rows, always have it unselected
        if (selectedCount === 0 && notSelectedCount === 0) {
            return false;
        }

        // if mix of selected and unselected, this is indeterminate
        if (selectedCount > 0 && notSelectedCount > 0) {
            return null;
        }

        // only selected
        return selectedCount > 0;
    }

    /**
     * @param justFiltered whether to just include nodes which have passed the filter
     * @param justCurrentPage whether to just include nodes on the current page
     * @returns all nodes including unselectable nodes which are the target of this selection attempt
     */
    private getNodesToSelect(justFiltered = false, justCurrentPage = false) {
        if (this.rowModel.getType() !== 'clientSide') {
            throw new Error(`selectAll only available when rowModelType='clientSide', ie not ${this.rowModel.getType()}`);
        }

        const nodes: RowNode[] = [];
        if (justCurrentPage) {
            this.paginationProxy.forEachNodeOnPage((node) => {
                if (!node.group) {
                    nodes.push(node);
                    return;
                }

                if (!node.expanded) {
                    // even with groupSelectsChildren, do this recursively as only the filtered children
                    // are considered as the current page
                    const recursivelyAddChildren = (child: RowNode) => {
                        nodes.push(child);
                        if (child.childrenAfterFilter?.length) {
                            child.childrenAfterFilter.forEach(recursivelyAddChildren);
                        }
                    }
                    recursivelyAddChildren(node);
                    return;
                }

                // if the group node is expanded, the pagination proxy will include the visible nodes to select
                if (!this.groupSelectsChildren) {
                    nodes.push(node);
                }
            });
            return nodes;
        }

        const clientSideRowModel = this.rowModel as IClientSideRowModel;
        if (justFiltered) {
            clientSideRowModel.forEachNodeAfterFilter(node => {
                nodes.push(node);
            });
            return nodes;
        }

        clientSideRowModel.forEachNode(node => {
            nodes.push(node);
        })
        return nodes;
    }

    public selectAllRowNodes(params: { source: SelectionEventSourceType, justFiltered?: boolean, justCurrentPage?: boolean }) {
        if (this.rowModel.getType() !== 'clientSide') {
            throw new Error(`selectAll only available when rowModelType='clientSide', ie not ${this.rowModel.getType()}`);
        }

        const { source, justFiltered, justCurrentPage } = params;

        const callback = (rowNode: RowNode) => rowNode.selectThisNode(true, undefined, source);

        this.getNodesToSelect(justFiltered, justCurrentPage).forEach(callback);

        // the above does not clean up the parent rows if they are selected
        if (this.rowModel.getType() === 'clientSide' && this.groupSelectsChildren) {
            this.updateGroupsFromChildrenSelections(source);
        }

        const event: WithoutGridCommon<SelectionChangedEvent> = {
            type: Events.EVENT_SELECTION_CHANGED,
            source
        };
        this.eventService.dispatchEvent(event);
    }

    // Used by SSRM
    public getServerSideSelectionState() {
        return null;
    }

    public setServerSideSelectionState(state: any): void {}
}
