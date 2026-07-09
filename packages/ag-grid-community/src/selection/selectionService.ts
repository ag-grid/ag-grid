import type { GridApi } from '../api/gridApi';
import { _getClientSideRowModel } from '../api/rowModelApiUtils';
import type { ChangedRowNodes } from '../clientSideRowModel/changedRowNodes';
import type { NamedBean } from '../context/bean';
import type { GridOptions, RowSelectionMode, SelectAllMode } from '../entities/gridOptions';
import { RowNode } from '../entities/rowNode';
import type { SelectionEventSourceType } from '../events';
import {
    _getGroupSelection,
    _getGroupSelectsDescendants,
    _getMasterSelects,
    _getRowSelectionMode,
    _isMultiRowSelection,
    _isRowSelection,
    _isUsingNewRowSelectionAPI,
} from '../gridOptionsUtils';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { IRowNode } from '../interfaces/iRowNode';
import type { ISelectionService, ISetNodesSelectedParams } from '../interfaces/iSelectionService';
import type { ServerSideRowGroupSelectionState, ServerSideRowSelectionState } from '../interfaces/selectionState';
import { _isManualPinnedRow } from '../pinnedRowModel/pinnedRowUtils';
import type { ChangedPath } from '../utils/changedPath';
import { _forEachChangedGroupDepthFirst } from '../utils/changedPath';
import { BaseSelectionService } from './baseSelectionService';

export class SelectionService extends BaseSelectionService implements NamedBean, ISelectionService {
    beanName = 'selectionSvc' as const;

    private readonly selectedNodes = new Map<string, RowNode>();
    /** Only used to track detail grid selection state when master/detail is enabled */
    private readonly detailSelection = new Map<string, Set<string>>();

    private groupSelectsDescendants: boolean;
    private groupSelectsFiltered: boolean;
    private mode?: RowSelectionMode;
    private masterSelectsDetail = false;
    private csrm?: IClientSideRowModel;

    // Selection batch: while depth > 0, `selectionChanged` is coalesced into one pending event (carrying
    // the first source seen) and flushed when the outermost batch ends.
    private selectionBatchDepth = 0;
    private pendingSelectionChanged = false;
    private pendingSelectionSource: SelectionEventSourceType | null = null;

    public override postConstruct(): void {
        super.postConstruct();
        const { gos } = this;

        this.csrm = _getClientSideRowModel(this.beans);
        this.mode = _getRowSelectionMode(gos);
        this.groupSelectsDescendants = _getGroupSelectsDescendants(gos);
        this.groupSelectsFiltered = _getGroupSelection(gos) === 'filteredDescendants';
        this.masterSelectsDetail = _getMasterSelects(gos) === 'detail';

        this.addManagedPropertyListeners(['groupSelectsChildren', 'groupSelectsFiltered', 'rowSelection'], () => {
            const groupSelectsDescendants = _getGroupSelectsDescendants(gos);
            const selectionMode = _getRowSelectionMode(gos);
            const groupSelectsFiltered = _getGroupSelection(gos) === 'filteredDescendants';

            this.masterSelectsDetail = _getMasterSelects(gos) === 'detail';

            if (
                groupSelectsDescendants !== this.groupSelectsDescendants ||
                groupSelectsFiltered !== this.groupSelectsFiltered ||
                selectionMode !== this.mode
            ) {
                this.deselectAllRowNodes({ source: 'api' });
                this.groupSelectsDescendants = groupSelectsDescendants;
                this.groupSelectsFiltered = groupSelectsFiltered;
                this.mode = selectionMode;
            }
        });
    }

    public override destroy(): void {
        super.destroy();
        this.resetNodes();
    }

    public handleSelectionEvent(
        event: MouseEvent | KeyboardEvent,
        rowNode: RowNode,
        source: SelectionEventSourceType
    ): number {
        if (this.isRowSelectionBlocked(rowNode)) {
            return 0;
        }

        const selection = this.inferNodeSelections(rowNode, event.shiftKey, event.metaKey || event.ctrlKey, source);

        if (selection == null) {
            return 0;
        }

        this.selectionCtx.selectAll = false;

        if ('select' in selection) {
            if (selection.reset) {
                this.resetNodes();
            } else {
                this.selectRange(selection.deselect, false, source);
            }
            return this.selectRange(selection.select, true, source);
        } else {
            const newValue = selection.checkFilteredNodes
                ? recursiveCanNodesBeSelected(selection.node)
                : selection.newValue;

            return this.setNodesSelected({
                nodes: [selection.node],
                newValue,
                clearSelection: selection.clearSelection,
                keepDescendants: selection.keepDescendants,
                event,
                source,
            });
        }
    }

    public setNodesSelected({
        newValue,
        clearSelection,
        suppressFinishActions,
        nodes,
        event,
        source,
        keepDescendants = false,
    }: ISetNodesSelectedParams & { keepDescendants?: boolean }): number {
        const nodesLength = nodes.length;
        if (nodesLength === 0) {
            return 0;
        }

        const { gos } = this;
        if (!_isRowSelection(gos) && newValue) {
            this.warn(132);
            return 0;
        }

        const isMultiSelect = this.isMultiSelect();
        if (nodesLength > 1 && !isMultiSelect) {
            this.warn(130);
            return 0;
        }

        let updatedCount = 0;
        for (let i = 0; i < nodesLength; i++) {
            const rowNode = nodes[i];
            // if node is a footer, we don't do selection, just pass the info
            // to the sibling (the parent of the group)
            const node = rowNode.primaryRow;

            if (node.rowPinned && !_isManualPinnedRow(node)) {
                this.warn(59);
                continue;
            }

            if (node.id === undefined) {
                this.warn(60);
                continue;
            }

            if (newValue && rowNode.destroyed) {
                continue; // skip destroyed nodes
            }

            const skipThisNode = this.groupSelectsFiltered && node.group && !gos.get('treeData');

            if (!skipThisNode) {
                const thisNodeWasSelected = this.selectRowNode(node, newValue, event, source);
                if (thisNodeWasSelected) {
                    this.detailSelection.delete(node.id);
                    updatedCount++;
                }
            }

            if (this.groupSelectsDescendants && node.childrenAfterGroup?.length) {
                updatedCount += this.selectChildren(node, newValue, source, event);
            }
        }

        // clear other nodes if not doing multi select
        if (!suppressFinishActions) {
            if (nodesLength === 1 && source === 'api') {
                this.selectionCtx.setRoot(nodes[0].primaryRow);
            }

            const clearOtherNodes = newValue && (clearSelection || !isMultiSelect);
            if (clearOtherNodes) {
                updatedCount += this.clearOtherNodes(nodes[0].primaryRow, keepDescendants, source);
            }

            // only if we selected something, then update groups and fire events
            if (updatedCount > 0) {
                this.updateGroupsFromChildrenSelections(source, undefined, event);

                // this is the very end of the 'action node', so we finished all the updates,
                // including any parent / child changes that this method caused
                this.dispatchSelectionChanged(source);
            }
        }
        return updatedCount;
    }

    // not to be mixed up with 'cell range selection' where you drag the mouse, this is row range selection, by
    // holding down 'shift'.
    private selectRange(nodesToSelect: readonly RowNode[], value: boolean, source: SelectionEventSourceType): number {
        let updatedCount = 0;

        for (let i = 0, len = nodesToSelect.length; i < len; ++i) {
            const rowNode = nodesToSelect[i].primaryRow;

            if (rowNode.group && this.groupSelectsDescendants) {
                continue;
            }

            if (this.selectRowNode(rowNode, value, undefined, source)) {
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            this.updateGroupsFromChildrenSelections(source);
            this.dispatchSelectionChanged(source);
        }

        return updatedCount;
    }

    private selectChildren(node: RowNode, newValue: boolean, source: SelectionEventSourceType, event?: Event): number {
        const children = this.groupSelectsFiltered ? node.childrenAfterAggFilter : node.childrenAfterGroup;
        return children
            ? this.setNodesSelected({
                  newValue,
                  clearSelection: false,
                  suppressFinishActions: true,
                  source,
                  event,
                  nodes: children,
              })
            : 0;
    }

    public getSelectedNodes(): RowNode[] {
        return Array.from(this.selectedNodes.values());
    }

    public getSelectedRows(): any[] {
        const selectedRows: any[] = [];
        for (const rowNode of this.selectedNodes.values()) {
            const data = rowNode.data;
            if (data) {
                selectedRows.push(data);
            }
        }
        return selectedRows;
    }

    public getSelectionCount(): number {
        return this.selectedNodes.size;
    }

    /**
     * Drops a node leaving the model (destroyed, removed or detached) from the selection. Event-free
     * and allocation-free: only updates the map, so callers can call it inline as they tear nodes down.
     * The single `selectionChanged` and group roll-up are emitted by `updateSelectableAfterGrouping`.
     */
    public removeFromSelection(node: RowNode, source: SelectionEventSourceType): void {
        const id = node.id!;
        const selectedNodes = this.selectedNodes;
        // Cheap flag first: a node only registers in the map when selected, so skip the lookup otherwise.
        // The `=== node` identity check still guards a daemon/stale same-id instance from being evicted.
        if (node.__selected && selectedNodes.get(id) === node) {
            selectedNodes.delete(id);
            this.detailSelection.delete(id);
            node.__selected = false;
            this.pendingSelectionChanged = true; // flushed by the pass that follows this refresh phase
            this.pendingSelectionSource ??= source;
        }
    }

    public override updateGroupsFromChildrenSelections(
        source: SelectionEventSourceType,
        changedPath?: ChangedPath,
        event?: Event
    ): boolean {
        // we only do this when group selection state depends on selected children
        if (!this.groupSelectsDescendants) {
            return false;
        }
        // also only do it if CSRM (code should never allow this anyway)
        const csrm = this.csrm;
        if (!csrm) {
            return false;
        }

        const rootNode = csrm.rootNode;
        if (!rootNode) {
            return false;
        }

        let selectionChanged = false;

        const nodeCallback = (rowNode: RowNode): void => {
            if (rowNode !== rootNode) {
                const selected = this.calculateSelectedFromChildren(rowNode);
                selectionChanged =
                    this.selectRowNode(rowNode, selected === null ? false : selected, event, source) ||
                    selectionChanged;
            }
        };

        _forEachChangedGroupDepthFirst(rootNode, csrm.hierarchical, changedPath, nodeCallback);
        return selectionChanged;
    }

    private clearOtherNodes(
        rowNodeToKeepSelected: RowNode,
        keepDescendants: boolean,
        source: SelectionEventSourceType
    ): number {
        const groupsToRefresh = new Map<string, RowNode>();
        let updatedCount = 0;

        for (const otherRowNode of this.selectedNodes.values()) {
            const isNodeToKeep = otherRowNode.id == rowNodeToKeepSelected.id;
            const shouldClearDescendant = keepDescendants ? !isDescendantOf(rowNodeToKeepSelected, otherRowNode) : true;
            if (shouldClearDescendant && !isNodeToKeep) {
                updatedCount += this.setNodesSelected({
                    nodes: [otherRowNode],
                    newValue: false,
                    clearSelection: false,
                    suppressFinishActions: true,
                    source,
                });

                if (this.groupSelectsDescendants && otherRowNode.parent) {
                    groupsToRefresh.set(otherRowNode.parent.id!, otherRowNode.parent);
                }
            }
        }

        for (const group of groupsToRefresh.values()) {
            const selected = this.calculateSelectedFromChildren(group);
            this.selectRowNode(group, selected === null ? false : selected, undefined, source);
        }

        return updatedCount;
    }

    /** Selection-index chokepoint: mirrors the base's `__selected` flip into `selectedNodes`, so the map is
     *  a pure derived index. Groups under groupSelectsDescendants are computed, not stored. */
    public override selectRowNode(
        rowNode: RowNode,
        newValue?: boolean,
        e?: Event,
        source: SelectionEventSourceType = 'api'
    ): boolean {
        const changed = super.selectRowNode(rowNode, newValue, e, source);
        if (changed && !(this.groupSelectsDescendants && rowNode.group)) {
            const selectedNodes = this.selectedNodes;
            if (rowNode.isSelected()) {
                selectedNodes.set(rowNode.id!, rowNode);
            } else {
                selectedNodes.delete(rowNode.id!);
            }
        }
        return changed;
    }

    public syncInRowNode(rowNode: RowNode, oldNode?: RowNode): void {
        const selectedNodes = this.selectedNodes;

        // Id changed: this node now holds different data. Swap in the daemon clone (old id + data) so the
        // old id stays selected and still surfaces in getSelectedNodes(), unrendered, until deselected.
        const oldId = oldNode?.id;
        if (oldId != null && oldId !== rowNode.id && selectedNodes.get(oldId) === rowNode) {
            selectedNodes.set(oldId, oldNode!);
        }

        // Restore selection for the (re)created node from the persisted entry, rebinding it to this live node.
        const id = rowNode.id!;
        const selected = selectedNodes.has(id);
        rowNode.__selected = selected;
        if (selected) {
            selectedNodes.set(id, rowNode);
        }
    }

    public createDaemonNode(rowNode: RowNode): RowNode | undefined {
        if (!rowNode.id) {
            return undefined;
        }
        const oldNode = new RowNode(this.beans);

        // just copy the id and data, this is enough for the node to be used
        // in the selection service
        oldNode.id = rowNode.id;
        oldNode.data = rowNode.data;
        oldNode.__selected = rowNode.__selected;
        oldNode.level = rowNode.level;

        return oldNode;
    }

    public reset(source: SelectionEventSourceType): void {
        if (this.selectedNodes.size) {
            this.resetNodes();
            this.dispatchSelectionChanged(source);
        }
    }

    private resetNodes(): void {
        const selectedNodes = this.selectedNodes;
        for (const node of selectedNodes.values()) {
            this.selectRowNode(node, false);
        }
        selectedNodes.clear();
    }

    // returns a list of all nodes at 'best cost' - a feature to be used
    // with groups / trees. if a group has all it's children selected,
    // then the group appears in the result, but not the children.
    // Designed for use with 'children' as the group selection type,
    // where groups don't actually appear in the selection normally.
    public getBestCostNodeSelection(): RowNode[] | undefined {
        const csrm = this.csrm;
        if (!csrm) {
            // Error logged as part of gridApi as that is only call point for this method.
            return;
        }

        const topLevelNodes = csrm.getTopLevelNodes();
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
                }
                // if not selected, then if it's a group, and the group
                // has children, continue to search for selections
                else if (node.group && node.childrenAfterGroup) {
                    traverse(node.childrenAfterGroup);
                }
            }
        }

        traverse(topLevelNodes);

        return result;
    }

    public isEmpty(): boolean {
        return this.selectedNodes.size === 0;
    }

    public deselectAllRowNodes({ source, selectAll }: { source: SelectionEventSourceType; selectAll?: SelectAllMode }) {
        const csrm = this.csrm;

        let updatedNodes = false;
        const deselect = (rowNode: RowNode) => {
            if (this.selectRowNode(rowNode.primaryRow, false, undefined, source)) {
                updatedNodes = true;
            }
        };

        if (selectAll === 'currentPage' || selectAll === 'filtered') {
            if (!csrm) {
                this.error(102);
                return;
            }
            const nodes = this.getNodesToSelect(selectAll);
            for (let i = 0, len = nodes.length; i < len; ++i) {
                deselect(nodes[i]);
            }
        } else {
            // selectRowNode drops each node from the map as it deselects; clear() mops up daemon/stale entries.
            this.selectedNodes.forEach(deselect);
            this.selectedNodes.clear();
        }

        this.selectionCtx.selectAll = false;

        // the above does not clean up the parent rows if they are selected
        if (csrm && this.groupSelectsDescendants) {
            const updated = this.updateGroupsFromChildrenSelections(source);
            updatedNodes ||= updated;
        }

        if (updatedNodes) {
            this.dispatchSelectionChanged(source);
        }
    }

    public getSelectAllState(selectAll?: SelectAllMode): boolean | null {
        let selectedCount = 0;
        let notSelectedCount = 0;

        const nodes = this.getNodesToSelect(selectAll);
        for (let i = 0, len = nodes.length; i < len; ++i) {
            const node = nodes[i];
            if (this.groupSelectsDescendants && node.group) {
                continue;
            }

            if (node.isSelected()) {
                selectedCount++;
            } else if (node.selectable) {
                // don't count non-selectable nodes!
                notSelectedCount++;
            }
        }

        return _calculateSelectAllState(selectedCount, notSelectedCount) ?? null;
    }

    public hasNodesToSelect(selectAll: SelectAllMode): boolean {
        const nodes = this.getNodesToSelect(selectAll);
        for (let i = 0, len = nodes.length; i < len; ++i) {
            if (nodes[i].selectable) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param selectAll See `MultiRowSelectionOptions.selectAll`
     * @returns all nodes including unselectable nodes which are the target of this selection attempt
     */
    private getNodesToSelect(selectAll?: SelectAllMode): RowNode[] {
        if (!this.canSelectAll()) {
            return [];
        }

        const nodes: RowNode[] = [];
        const addToResult = (node: RowNode) => nodes.push(node);

        if (selectAll === 'currentPage') {
            this.forEachNodeOnPage((node) => {
                if (!node.group) {
                    addToResult(node);
                    return;
                }

                if (!node.footer && !node.expanded) {
                    // even with groupSelectsChildren, do this recursively as only the filtered children
                    // are considered as the current page
                    const recursivelyAddChildren = (child: RowNode) => {
                        addToResult(child);
                        const children = child.childrenAfterFilter;
                        if (children) {
                            for (let i = 0, len = children.length; i < len; ++i) {
                                recursivelyAddChildren(children[i]);
                            }
                        }
                    };
                    recursivelyAddChildren(node);
                    return;
                }

                // if the group node is expanded, the pagination proxy will include the visible nodes to select
                if (!this.groupSelectsDescendants) {
                    addToResult(node);
                }
            });
            return nodes;
        }

        const clientSideRowModel = this.beans.rowModel as IClientSideRowModel;
        if (selectAll === 'filtered') {
            clientSideRowModel.forEachNodeAfterFilter(addToResult);
            return nodes;
        }

        clientSideRowModel.forEachNode(addToResult);
        return nodes;
    }

    private forEachNodeOnPage(callback: (rowNode: RowNode) => void) {
        const { pageBounds, rowModel } = this.beans;
        const firstRow = pageBounds.getFirstRow();
        const lastRow = pageBounds.getLastRow();
        for (let i = firstRow; i <= lastRow; i++) {
            const node = rowModel.getRow(i);
            if (node) {
                callback(node);
            }
        }
    }

    public selectAllRowNodes(params: { source: SelectionEventSourceType; selectAll?: SelectAllMode }) {
        const { gos, selectionCtx } = this;
        if (!_isRowSelection(gos)) {
            this.warn(132);
            return;
        }

        if (_isUsingNewRowSelectionAPI(gos) && !_isMultiRowSelection(gos)) {
            this.warn(130);
            return;
        }
        if (!this.canSelectAll()) {
            return;
        }

        const { source, selectAll } = params;
        let updatedNodes = false;

        const nodes = this.getNodesToSelect(selectAll);
        for (let i = 0, len = nodes.length; i < len; ++i) {
            updatedNodes = this.selectRowNode(nodes[i].primaryRow, true, undefined, source) || updatedNodes;
        }

        selectionCtx.selectAll = true;

        // the above does not clean up the parent rows if they are selected
        if (this.csrm && this.groupSelectsDescendants) {
            const updated = this.updateGroupsFromChildrenSelections(source);
            updatedNodes ||= updated;
        }

        if (updatedNodes) {
            this.dispatchSelectionChanged(source);
        }
    }

    public getSelectionState(): string[] | null {
        return this.isEmpty() ? null : Array.from(this.selectedNodes.keys());
    }

    public setSelectionState(
        state: string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState | undefined,
        source: SelectionEventSourceType,
        clearSelection?: boolean
    ): void {
        state ||= [];
        if (!Array.isArray(state)) {
            this.error(103);
            return;
        }
        const nodes: RowNode[] = [];
        const csrm = this.csrm;
        const rowIds = new Set(state);
        if (csrm) {
            // O(ids) id-lookups beat scanning every node when the selected set is smaller than the grid.
            for (const id of rowIds) {
                const node = csrm.getRowNode(id);
                if (node) {
                    nodes.push(node);
                }
            }
        } else {
            this.beans.rowModel.forEachNode((node) => {
                if (rowIds.has(node.id!)) {
                    nodes.push(node);
                }
            });
        }
        if (clearSelection) {
            this.resetNodes();
        }
        this.setNodesSelected({ newValue: true, nodes, source });
    }

    private canSelectAll(): boolean {
        return !!this.csrm;
    }

    /** Recomputes a node's selectable state. A row that turns non-selectable stays in the grid, so it is
     *  deselected eventfully (fires rowSelected for the visible row); the batch coalesces these. */
    private recomputeSelectable(node: RowNode): boolean {
        const selectable = this.updateRowSelectable(node, true);
        if (!selectable && node.isSelected() && this.selectRowNode(node, false, undefined, 'selectableChanged')) {
            this.detailSelection.delete(node.id!);
            this.dispatchSelectionChanged('selectableChanged');
        }
        return selectable;
    }

    /**
     * Applies isRowSelectable to the affected nodes and deselects any that are no longer selectable. The
     * callback runs once, on the fully-formed node. Scope: `changedPath` → changed subtree (hierarchical);
     * `changedRowNodes` → added/updated rows only (flat); neither → all nodes (e.g. callback changed).
     */
    protected updateSelectable(changedPath?: ChangedPath, changedRowNodes?: ChangedRowNodes) {
        const { gos, rowModel } = this.beans;

        if (!_isRowSelection(gos)) {
            return;
        }

        const csrm = this.csrm;
        const isCSRMGroupSelectsDescendants = !!csrm && this.groupSelectsDescendants;
        const rootNode = csrm ? csrm.rootNode : null;
        // Without a delta every leaf may have changed; otherwise only added/updated leaves can have.
        const adds = changedRowNodes?.adds;
        const updates = changedRowNodes?.updates;

        ++this.selectionBatchDepth;
        try {
            if (!csrm) {
                // Non-CSRM models (infinite/viewport) are flat with no delta to narrow to, so recompute
                // every node — e.g. when the isRowSelectable callback itself changed.
                rowModel.forEachNode((node) => this.recomputeSelectable(node));
            } else if (isCSRMGroupSelectsDescendants) {
                // Post-order: child groups settle before parents, so a group rolls up from already-final children.
                _forEachChangedGroupDepthFirst(rootNode, rowModel.hierarchical, changedPath, (node) => {
                    let childSelectable = false;
                    const children = node.childrenAfterGroup!;
                    for (let i = 0, len = children.length; i < len; ++i) {
                        const child = children[i];
                        // Groups are already rolled up; recompute only changed leaves, keep cached value otherwise.
                        const selectable =
                            !child.group && (!adds || adds.has(child) || updates!.has(child))
                                ? this.recomputeSelectable(child)
                                : child.selectable;
                        childSelectable ||= selectable;
                    }
                    this.setRowSelectable(node, childSelectable, true);
                });
            } else if (changedPath || !adds) {
                // Hierarchical delta, or full recompute when there's no delta: groups/fillers recompute
                // unconditionally (catches leaf↔group flips), leaves only when their own data changed.
                _forEachChangedGroupDepthFirst(rootNode, rowModel.hierarchical, changedPath, (node) => {
                    if (node !== rootNode) {
                        this.recomputeSelectable(node);
                    }
                    const children = node.childrenAfterGroup!;
                    for (let i = 0, len = children.length; i < len; ++i) {
                        const child = children[i];
                        if (!child.group && (!adds || adds.has(child) || updates!.has(child))) {
                            this.recomputeSelectable(child);
                        }
                    }
                });
            } else {
                // Flat delta (changedPath absent): only added/updated rows can have changed selectability.
                for (const node of adds) {
                    this.recomputeSelectable(node);
                }
                for (const node of updates!) {
                    this.recomputeSelectable(node);
                }
            }

            // if csrm and group selects children, update the groups after deselecting leaf nodes.
            if (!changedPath && isCSRMGroupSelectsDescendants) {
                this.updateGroupsFromChildrenSelections?.('selectableChanged');
            }
        } finally {
            this.endSelectionBatch();
        }
    }

    /** Single post-refresh selectable pass, owned by the CSRM and run for both flat and hierarchical grids. */
    public updateSelectableAfterGrouping(
        changedPath: ChangedPath | undefined,
        changedRowNodes?: ChangedRowNodes
    ): void {
        // One batch over the whole pass: removals (already recorded by removeFromSelection), now-unselectable
        // deselections, and the group roll-up coalesce into a single selectionChanged with the first source.
        ++this.selectionBatchDepth;
        try {
            if (this.isRowSelectable) {
                this.updateSelectable(changedPath, changedRowNodes);
            }
            if (
                this.groupSelectsDescendants &&
                this.updateGroupsFromChildrenSelections?.('rowGroupChanged', changedPath)
            ) {
                this.dispatchSelectionChanged('rowGroupChanged');
            }
        } finally {
            this.endSelectionBatch();
        }
    }

    public refreshMasterNodeState(node: RowNode, e?: Event): void {
        if (!this.masterSelectsDetail || !node.expanded) {
            return;
        }

        const detailApi = node.detailNode?.detailGridInfo?.api;
        if (!detailApi) {
            return;
        }

        // detail grid teardown during collapse can emit selection transitions while rows are
        // being removed. Preserve tracked detail selection in this transient state.
        const displayedRowCount = detailApi.getDisplayedRowCount();
        if (displayedRowCount === 0 && node.isSelected() === undefined) {
            return;
        }

        const isSelectAll = _isAllSelected(detailApi);
        const current = node.isSelected();
        if (current !== isSelectAll) {
            const selectionChanged = this.selectRowNode(node, isSelectAll, e, 'masterDetail');

            if (selectionChanged) {
                this.dispatchSelectionChanged('masterDetail');
            }
        }

        if (!isSelectAll && displayedRowCount > 0) {
            this.detailSelection.set(node.id!, new Set(detailApi.getSelectedNodes().map((n) => n.id!)));
        }
    }

    public setDetailSelectionState(masterNode: RowNode, detailGridOptions: GridOptions, detailApi: GridApi): void {
        if (!this.masterSelectsDetail) {
            return;
        }

        if (!_isMultiRowSelection(detailGridOptions)) {
            this.warn(269);
            return;
        }

        const selectedIds = this.detailSelection.get(masterNode.id!);
        const restoreTrackedState = () => {
            if (!selectedIds?.size) {
                return false;
            }

            const nodes: IRowNode[] = [];
            for (const id of selectedIds) {
                const node = detailApi.getRowNode(id);
                if (node) {
                    nodes.push(node);
                }
            }

            if (!nodes.length) {
                return false;
            }

            detailApi.setNodesSelected({ nodes, newValue: true, source: 'masterDetail' });
            return true;
        };

        switch (masterNode.isSelected()) {
            case true: {
                detailApi.selectAll();
                break;
            }
            case false: {
                detailApi.deselectAll();
                break;
            }
            case undefined: {
                restoreTrackedState();
                break;
            }

            default:
                break;
        }
    }

    private dispatchSelectionChanged(source: SelectionEventSourceType): void {
        if (this.selectionBatchDepth > 0) {
            this.pendingSelectionChanged = true;
            this.pendingSelectionSource ??= source;
            return;
        }
        this.pendingSelectionChanged = false;
        this.pendingSelectionSource = null;
        this.eventSvc.dispatchEvent({
            type: 'selectionChanged',
            source,
            selectedNodes: this.getSelectedNodes(),
            serverSideState: null,
        });
    }

    /** Flushes a `selectionChanged` left pending by `removeFromSelection` when its refresh was deferred,
     *  so an unrelated later batch can't emit it with the wrong source. */
    public flushPendingSelectionChanged(): void {
        if (this.selectionBatchDepth === 0 && this.pendingSelectionChanged) {
            this.dispatchSelectionChanged(this.pendingSelectionSource!);
        }
    }

    /** Close the batch; the outermost close flushes the single coalesced `selectionChanged`. Callers MUST
     *  pair the opening `selectionBatchDepth++` with this in a `finally` so a throwing user callback can't
     *  leak the depth and freeze future events. */
    private endSelectionBatch(): void {
        if (--this.selectionBatchDepth === 0) {
            this.flushPendingSelectionChanged();
        }
    }
}

function _isAllSelected(api: GridApi): boolean | undefined {
    let selectedCount = 0;
    let notSelectedCount = 0;

    api.forEachNode((node) => {
        if (node.isSelected()) {
            ++selectedCount;
        } else if (node.selectable) {
            // don't count non-selectable nodes!
            ++notSelectedCount;
        }
    });

    return _calculateSelectAllState(selectedCount, notSelectedCount);
}

function _calculateSelectAllState(selected: number, notSelected: number): boolean | undefined {
    // if no rows, always have it unselected
    if (selected === 0 && notSelected === 0) {
        return false;
    }

    // if mix of selected and unselected, this is indeterminate
    if (selected > 0 && notSelected > 0) {
        return;
    }

    // only selected
    return selected > 0;
}

function isDescendantOf(root: RowNode, child: RowNode): boolean {
    let parent = child.parent;
    while (parent) {
        if (parent === root) {
            return true;
        }
        parent = parent.parent;
    }
    return false;
}

function recursiveCanNodesBeSelected(root: RowNode): boolean {
    if (root.isSelected() === false) {
        return true;
    }
    const children = root.childrenAfterFilter;
    if (children) {
        for (let i = 0, len = children.length; i < len; ++i) {
            if (recursiveCanNodesBeSelected(children[i])) {
                return true;
            }
        }
    }
    return false;
}
