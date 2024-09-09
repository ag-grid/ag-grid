import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import type { SelectionEventSourceType } from '../events';
import { isSelectionUIEvent } from '../events';
import { _getGroupSelectsDescendants, _isClientSideRowModel, _isMultiRowSelection } from '../gridOptionsUtils';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { IRowModel } from '../interfaces/iRowModel';
import type { ISelectionService, ISetNodesSelectedParams } from '../interfaces/iSelectionService';
import type { ServerSideRowGroupSelectionState, ServerSideRowSelectionState } from '../interfaces/selectionState';
import type { PageBoundsService } from '../pagination/pageBoundsService';
import { _last } from '../utils/array';
import { ChangedPath } from '../utils/changedPath';
import { _errorOnce, _warnOnce } from '../utils/function';
import { _exists, _missing } from '../utils/generic';
import { RowRangeSelectionContext } from './rowRangeSelectionContext';

export class SelectionService extends BeanStub implements NamedBean, ISelectionService {
    beanName = 'selectionService' as const;

    private rowModel: IRowModel;
    private pageBoundsService: PageBoundsService;

    public wireBeans(beans: BeanCollection): void {
        this.rowModel = beans.rowModel;
        this.pageBoundsService = beans.pageBoundsService;
    }

    private selectedNodes: Map<string, RowNode> = new Map();
    private selectionCtx: RowRangeSelectionContext = new RowRangeSelectionContext();

    private groupSelectsChildren: boolean;
    private isMultiSelect: boolean = false;

    public postConstruct(): void {
        const { gos, rowModel, onRowSelected } = this;
        this.selectionCtx.init(rowModel);
        this.isMultiSelect = _isMultiRowSelection(gos);
        this.groupSelectsChildren = _getGroupSelectsDescendants(gos);
        this.addManagedPropertyListeners(['groupSelectsChildren', 'rowSelection', 'selection'], () => {
            const groupSelectsChildren = _getGroupSelectsDescendants(gos);
            const multiSelect = _isMultiRowSelection(gos);

            if (groupSelectsChildren !== this.groupSelectsChildren || multiSelect !== this.isMultiSelect) {
                this.groupSelectsChildren = groupSelectsChildren;
                this.isMultiSelect = multiSelect;
                this.deselectAllRowNodes({ source: 'api' });
            }
        });

        this.addManagedEventListeners({ rowSelected: onRowSelected.bind(this) });
    }

    public override destroy(): void {
        super.destroy();
        this.resetNodes();
        this.selectionCtx.reset();
    }

    /**
     * We override the selection value for UI-triggered events because it's the
     * current selection state that should determine the next selection state. This
     * is a stepping stone towards removing selection logic from event listeners and
     * other code external to the selection service(s).
     */
    private overrideSelectionValue(newValue: boolean, source: SelectionEventSourceType): boolean {
        if (!isSelectionUIEvent(source)) {
            return newValue;
        }

        const root = this.selectionCtx.getRoot();

        return root ? root.isSelected() ?? false : true;
    }

    public setNodesSelected(params: ISetNodesSelectedParams): number {
        const { newValue, clearSelection, suppressFinishActions, rangeSelect, nodes, event, source } = params;

        if (nodes.length === 0) return 0;

        if (nodes.length > 1 && !this.isMultiSelect) {
            _warnOnce(`cannot multi select unless selection mode is 'multiRow'`);
            return 0;
        }

        // groupSelectsFiltered only makes sense when group selects children
        const groupSelectsFiltered = this.groupSelectsChildren && params.groupSelectsFiltered === true;

        // if node is a footer, we don't do selection, just pass the info
        // to the sibling (the parent of the group)
        const filteredNodes = nodes.map((node) => (node.footer ? node.sibling! : node));

        if (rangeSelect) {
            if (filteredNodes.length > 1) {
                _warnOnce('cannot range select while selecting multiple rows');
                return 0;
            }

            const node = filteredNodes[0];
            const newSelectionValue = this.overrideSelectionValue(newValue, source);

            if (!this.isMultiSelect) {
                // let the normal selection logic handle this
            } else if (this.selectionCtx.isInRange(node)) {
                const partition = this.selectionCtx.truncate(node);

                // When we are selecting a range, we may need to de-select part of the previously
                // selected range (see AG-9620)
                // When we are de-selecting a range, we can/should leave the other nodes unchanged
                // (i.e. selected nodes outside the current range should remain selected - see AG-10215)
                if (newSelectionValue) {
                    this.selectRange(partition.discard, false, source);
                }
                return this.selectRange(partition.keep, newSelectionValue, source);
            } else {
                const fromNode = this.selectionCtx.getRoot();
                const toNode = node;
                if (fromNode !== toNode) {
                    const partition = this.selectionCtx.extend(node, this.groupSelectsChildren);
                    if (newSelectionValue) {
                        this.selectRange(partition.discard, false, source);
                    }
                    return this.selectRange(partition.keep, newSelectionValue, source);
                }
            }
        }

        // Avoid re-setting here because if `suppressFinishActions` is true then this
        // call is not a result of a user action, but rather a follow-on call (e.g
        // in this.clearOtherNodes).
        if (!suppressFinishActions) {
            this.selectionCtx.setRoot(filteredNodes[0]);
        }

        let updatedCount = 0;
        for (let i = 0; i < filteredNodes.length; i++) {
            const node = filteredNodes[i];
            // when groupSelectsFiltered, then this node may end up indeterminate despite
            // trying to set it to true / false. this group will be calculated further on
            // down when we call updateGroupsFromChildrenSelections(). we need to skip it
            // here, otherwise the updatedCount would include it.
            const skipThisNode = groupSelectsFiltered && node.group;

            if (!skipThisNode) {
                const thisNodeWasSelected = node.selectThisNode(newValue, event, source);
                if (thisNodeWasSelected) {
                    updatedCount++;
                }
            }

            if (this.groupSelectsChildren && node.childrenAfterGroup?.length) {
                updatedCount += this.selectChildren(node, newValue, groupSelectsFiltered, source);
            }
        }

        // clear other nodes if not doing multi select
        if (!suppressFinishActions) {
            const clearOtherNodes = newValue && (clearSelection || !this.isMultiSelect);
            if (clearOtherNodes) {
                updatedCount += this.clearOtherNodes(filteredNodes[0], source);
            }

            // only if we selected something, then update groups and fire events
            if (updatedCount > 0) {
                this.updateGroupsFromChildrenSelections(source);

                // this is the very end of the 'action node', so we are finished all the updates,
                // include any parent / child changes that this method caused
                this.dispatchSelectionChanged(source);
            }
        }
        return updatedCount;
    }

    // not to be mixed up with 'cell range selection' where you drag the mouse, this is row range selection, by
    // holding down 'shift'.
    private selectRange(nodesToSelect: RowNode[], value: boolean, source: SelectionEventSourceType): number {
        let updatedCount = 0;

        nodesToSelect.forEach((rowNode) => {
            if (rowNode.group && this.groupSelectsChildren) {
                return;
            }

            const nodeWasSelected = rowNode.selectThisNode(value, undefined, source);
            if (nodeWasSelected) {
                updatedCount++;
            }
        });

        if (updatedCount > 0) {
            this.updateGroupsFromChildrenSelections(source);

            this.dispatchSelectionChanged(source);
        }

        return updatedCount;
    }

    private selectChildren(
        node: RowNode,
        newValue: boolean,
        groupSelectsFiltered: boolean,
        source: SelectionEventSourceType
    ): number {
        const children = groupSelectsFiltered ? node.childrenAfterAggFilter : node.childrenAfterGroup;

        if (_missing(children)) {
            return 0;
        }

        return this.setNodesSelected({
            newValue: newValue,
            clearSelection: false,
            suppressFinishActions: true,
            groupSelectsFiltered,
            source,
            nodes: children,
        });
    }

    public getSelectedNodes() {
        const selectedNodes: RowNode[] = [];
        this.selectedNodes.forEach((rowNode: RowNode) => {
            if (rowNode) {
                selectedNodes.push(rowNode);
            }
        });
        return selectedNodes;
    }

    public getSelectedRows() {
        const selectedRows: any[] = [];

        this.selectedNodes.forEach((rowNode: RowNode) => {
            if (rowNode && rowNode.data) {
                selectedRows.push(rowNode.data);
            }
        });
        return selectedRows;
    }

    public getSelectionCount(): number {
        return this.selectedNodes.size;
    }

    /**
     * This method is used by the CSRM to remove groups which are being disposed of,
     * events do not need fired in this case
     */
    public filterFromSelection(predicate: (node: RowNode) => boolean): void {
        const newSelectedNodes: Map<string, RowNode> = new Map();
        this.selectedNodes.forEach((rowNode: RowNode, key: string) => {
            const passesPredicate = rowNode && predicate(rowNode);
            if (passesPredicate) {
                newSelectedNodes.set(key, rowNode);
            }
        });
        this.selectedNodes = newSelectedNodes;
    }

    // should only be called if groupSelectsChildren=true
    public updateGroupsFromChildrenSelections(source: SelectionEventSourceType, changedPath?: ChangedPath): boolean {
        // we only do this when group selection state depends on selected children
        if (!this.groupSelectsChildren) {
            return false;
        }
        // also only do it if CSRM (code should never allow this anyway)
        if (!_isClientSideRowModel(this.gos)) {
            return false;
        }

        const clientSideRowModel = this.rowModel as IClientSideRowModel;
        const rootNode = clientSideRowModel.getRootNode();

        if (!changedPath) {
            changedPath = new ChangedPath(true, rootNode);
            changedPath.setInactive();
        }

        let selectionChanged = false;

        changedPath.forEachChangedNodeDepthFirst((rowNode) => {
            if (rowNode !== rootNode) {
                const selected = rowNode.calculateSelectedFromChildren();
                selectionChanged =
                    rowNode.selectThisNode(selected === null ? false : selected, undefined, source) || selectionChanged;
            }
        });

        return selectionChanged;
    }

    public clearOtherNodes(rowNodeToKeepSelected: RowNode, source: SelectionEventSourceType): number {
        const groupsToRefresh: Map<string, RowNode> = new Map();
        let updatedCount = 0;
        this.selectedNodes.forEach((otherRowNode: RowNode) => {
            if (otherRowNode && otherRowNode.id !== rowNodeToKeepSelected.id) {
                const rowNode = this.selectedNodes.get(otherRowNode.id!);
                updatedCount += rowNode!.setSelectedParams({
                    newValue: false,
                    clearSelection: false,
                    suppressFinishActions: true,
                    source,
                });

                if (this.groupSelectsChildren && otherRowNode.parent) {
                    groupsToRefresh.set(otherRowNode.parent.id!, otherRowNode.parent);
                }
            }
        });

        groupsToRefresh.forEach((group: RowNode) => {
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
            this.selectedNodes.set(rowNode.id, rowNode);
        } else {
            this.selectedNodes.delete(rowNode.id);
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
        const oldNodeHasDifferentId = _exists(oldNode) && rowNode.id !== oldNode.id;
        if (oldNodeHasDifferentId && oldNode) {
            const id = oldNode.id!;
            const oldNodeSelected = this.selectedNodes.get(id) == rowNode;
            if (oldNodeSelected) {
                this.selectedNodes.set(oldNode.id!, oldNode);
            }
        }
    }

    private syncInNewRowNode(rowNode: RowNode): void {
        if (this.selectedNodes.has(rowNode.id!)) {
            rowNode.setSelectedInitialValue(true);
            this.selectedNodes.set(rowNode.id!, rowNode);
        } else {
            rowNode.setSelectedInitialValue(false);
        }
    }

    public reset(source: SelectionEventSourceType): void {
        const selectionCount = this.getSelectionCount();
        this.resetNodes();
        if (selectionCount) {
            this.dispatchSelectionChanged(source);
        }
    }

    private resetNodes(): void {
        this.selectedNodes?.clear();
    }

    // returns a list of all nodes at 'best cost' - a feature to be used
    // with groups / trees. if a group has all it's children selected,
    // then the group appears in the result, but not the children.
    // Designed for use with 'children' as the group selection type,
    // where groups don't actually appear in the selection normally.
    public getBestCostNodeSelection(): RowNode[] | undefined {
        if (!_isClientSideRowModel(this.gos)) {
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
        this.selectedNodes.forEach((rowNode: RowNode) => {
            if (rowNode) {
                count++;
            }
        });
        return count === 0;
    }

    public deselectAllRowNodes(params: {
        source: SelectionEventSourceType;
        justFiltered?: boolean;
        justCurrentPage?: boolean;
    }) {
        const callback = (rowNode: RowNode) => rowNode.selectThisNode(false, undefined, source);
        const rowModelClientSide = _isClientSideRowModel(this.gos);

        const { source, justFiltered, justCurrentPage } = params;

        if (justCurrentPage || justFiltered) {
            if (!rowModelClientSide) {
                _errorOnce("selecting just filtered only works when gridOptions.rowModelType='clientSide'");
                return;
            }
            this.getNodesToSelect(justFiltered, justCurrentPage).forEach(callback);
        } else {
            this.selectedNodes.forEach((rowNode: RowNode) => {
                // remember the reference can be to null, as we never 'delete' from the map
                if (rowNode) {
                    callback(rowNode);
                }
            });
            // this clears down the map (whereas above only sets the items in map to 'undefined')
            this.reset(source);
        }

        this.selectionCtx.reset();

        // the above does not clean up the parent rows if they are selected
        if (rowModelClientSide && this.groupSelectsChildren) {
            this.updateGroupsFromChildrenSelections(source);
        }

        this.dispatchSelectionChanged(source);
    }

    private getSelectedCounts(
        justFiltered?: boolean | undefined,
        justCurrentPage?: boolean | undefined
    ): {
        selectedCount: number;
        notSelectedCount: number;
    } {
        let selectedCount = 0;
        let notSelectedCount = 0;

        const callback = (node: RowNode) => {
            if (this.groupSelectsChildren && node.group) {
                return;
            }

            if (node.isSelected()) {
                selectedCount++;
            } else if (!node.selectable) {
                // don't count non-selectable nodes!
            } else {
                notSelectedCount++;
            }
        };

        this.getNodesToSelect(justFiltered, justCurrentPage).forEach(callback);
        return { selectedCount, notSelectedCount };
    }

    public getSelectAllState(
        justFiltered?: boolean | undefined,
        justCurrentPage?: boolean | undefined
    ): boolean | null {
        const { selectedCount, notSelectedCount } = this.getSelectedCounts(justFiltered, justCurrentPage);
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

    public hasNodesToSelect(justFiltered = false, justCurrentPage = false) {
        return this.getNodesToSelect(justFiltered, justCurrentPage).filter((node) => node.selectable).length > 0;
    }

    /**
     * @param justFiltered whether to just include nodes which have passed the filter
     * @param justCurrentPage whether to just include nodes on the current page
     * @returns all nodes including unselectable nodes which are the target of this selection attempt
     */
    private getNodesToSelect(justFiltered = false, justCurrentPage = false) {
        this.validateSelectAllType();

        const nodes: RowNode[] = [];
        if (justCurrentPage) {
            this.forEachNodeOnPage((node) => {
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
                    };
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
            clientSideRowModel.forEachNodeAfterFilter((node) => {
                nodes.push(node);
            });
            return nodes;
        }

        clientSideRowModel.forEachNode((node) => {
            nodes.push(node);
        });
        return nodes;
    }

    private forEachNodeOnPage(callback: (rowNode: RowNode) => void) {
        const firstRow = this.pageBoundsService.getFirstRow();
        const lastRow = this.pageBoundsService.getLastRow();
        for (let i = firstRow; i <= lastRow; i++) {
            const node = this.rowModel.getRow(i);
            if (node) {
                callback(node);
            }
        }
    }

    public selectAllRowNodes(params: {
        source: SelectionEventSourceType;
        justFiltered?: boolean;
        justCurrentPage?: boolean;
    }) {
        this.validateSelectAllType();

        const { source, justFiltered, justCurrentPage } = params;

        const nodes = this.getNodesToSelect(justFiltered, justCurrentPage);
        nodes.forEach((rowNode) => rowNode.selectThisNode(true, undefined, source));

        this.selectionCtx.setRoot(nodes[0] ?? null);
        this.selectionCtx.setEndRange(_last(nodes) ?? null);

        // the above does not clean up the parent rows if they are selected
        if (_isClientSideRowModel(this.gos) && this.groupSelectsChildren) {
            this.updateGroupsFromChildrenSelections(source);
        }

        this.dispatchSelectionChanged(source);
    }

    public getSelectionState(): string[] | null {
        const selectedIds: string[] = [];
        this.selectedNodes.forEach((node) => {
            if (node?.id) {
                selectedIds.push(node.id);
            }
        });
        return selectedIds.length ? selectedIds : null;
    }

    public setSelectionState(
        state: string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState,
        source: SelectionEventSourceType
    ): void {
        if (!Array.isArray(state)) {
            return;
        }
        const rowIds = new Set(state);
        const nodes: RowNode[] = [];
        this.rowModel.forEachNode((node) => {
            if (rowIds.has(node.id!)) {
                nodes.push(node);
            }
        });
        this.setNodesSelected({
            newValue: true,
            nodes,
            source,
        });
    }

    private dispatchSelectionChanged(source: SelectionEventSourceType): void {
        this.eventService.dispatchEvent({
            type: 'selectionChanged',
            source,
        });
    }

    private validateSelectAllType(): void {
        if (!_isClientSideRowModel(this.gos)) {
            throw new Error(
                `selectAll only available when rowModelType='clientSide', ie not ${this.rowModel.getType()}`
            );
        }
    }
}
