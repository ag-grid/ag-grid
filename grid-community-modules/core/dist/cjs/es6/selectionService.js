"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionService = void 0;
const context_1 = require("./context/context");
const beanStub_1 = require("./context/beanStub");
const context_2 = require("./context/context");
const events_1 = require("./events");
const context_3 = require("./context/context");
const context_4 = require("./context/context");
const changedPath_1 = require("./utils/changedPath");
const generic_1 = require("./utils/generic");
const array_1 = require("./utils/array");
let SelectionService = class SelectionService extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.selectedNodes = new Map();
    }
    setBeans(loggerFactory) {
        this.logger = loggerFactory.create('selectionService');
        this.resetNodes();
    }
    init() {
        this.rowSelection = this.gridOptionsService.get('rowSelection');
        this.groupSelectsChildren = this.gridOptionsService.get('groupSelectsChildren');
        this.addManagedPropertyListeners(['groupSelectsChildren', 'rowSelection'], () => {
            this.groupSelectsChildren = this.gridOptionsService.get('groupSelectsChildren');
            this.rowSelection = this.gridOptionsService.get('rowSelection');
            this.deselectAllRowNodes({ source: 'api' });
        });
        this.addManagedListener(this.eventService, events_1.Events.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
    }
    isMultiselect() {
        return this.rowSelection === 'multiple';
    }
    setNodesSelected(params) {
        var _a;
        if (params.nodes.length === 0)
            return 0;
        const { newValue, clearSelection, suppressFinishActions, rangeSelect, event, source = 'api', } = params;
        if (params.nodes.length > 1 && !this.isMultiselect()) {
            console.warn(`AG Grid: cannot multi select while rowSelection='single'`);
            return 0;
        }
        // groupSelectsFiltered only makes sense when group selects children
        const groupSelectsFiltered = this.groupSelectsChildren && (params.groupSelectsFiltered === true);
        // if node is a footer, we don't do selection, just pass the info
        // to the sibling (the parent of the group)
        const nodes = params.nodes.map(node => node.footer ? node.sibling : node);
        if (rangeSelect) {
            if (params.nodes.length > 1) {
                console.warn('AG Grid: cannot range select while selecting multiple rows');
                return 0;
            }
            const lastSelectedNode = this.getLastSelectedNode();
            if (lastSelectedNode) {
                // if node is a footer, we don't do selection, just pass the info
                // to the sibling (the parent of the group)
                const node = nodes[0];
                const newRowClicked = lastSelectedNode !== node;
                if (newRowClicked && this.isMultiselect()) {
                    return this.selectRange(node, lastSelectedNode, params.newValue, source);
                    ;
                }
            }
        }
        let updatedCount = 0;
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            // when groupSelectsFiltered, then this node may end up intermediate despite
            // trying to set it to true / false. this group will be calculated further on
            // down when we call calculatedSelectedForAllGroupNodes(). we need to skip it
            // here, otherwise the updatedCount would include it.
            const skipThisNode = groupSelectsFiltered && node.group;
            if (!skipThisNode) {
                const thisNodeWasSelected = node.selectThisNode(newValue, params.event, source);
                if (thisNodeWasSelected) {
                    updatedCount++;
                }
            }
            if (this.groupSelectsChildren && ((_a = node.childrenAfterGroup) === null || _a === void 0 ? void 0 : _a.length)) {
                updatedCount += this.selectChildren(node, newValue, groupSelectsFiltered, source);
            }
        }
        // clear other nodes if not doing multi select
        if (!suppressFinishActions) {
            const clearOtherNodes = newValue && (clearSelection || !this.isMultiselect());
            if (clearOtherNodes) {
                updatedCount += this.clearOtherNodes(nodes[0], source);
            }
            // only if we selected something, then update groups and fire events
            if (updatedCount > 0) {
                this.updateGroupsFromChildrenSelections(source);
                // this is the very end of the 'action node', so we are finished all the updates,
                // include any parent / child changes that this method caused
                const event = {
                    type: events_1.Events.EVENT_SELECTION_CHANGED,
                    source
                };
                this.eventService.dispatchEvent(event);
            }
        }
        return updatedCount;
    }
    // selects all rows between this node and the last selected node (or the top if this is the first selection).
    // not to be mixed up with 'cell range selection' where you drag the mouse, this is row range selection, by
    // holding down 'shift'.
    selectRange(fromNode, toNode, value = true, source) {
        const nodesToSelect = this.rowModel.getNodesInRangeForSelection(fromNode, toNode);
        let updatedCount = 0;
        nodesToSelect.forEach(rowNode => {
            if (rowNode.group && this.groupSelectsChildren || (value === false && fromNode === rowNode)) {
                return;
            }
            const nodeWasSelected = rowNode.selectThisNode(value, undefined, source);
            if (nodeWasSelected) {
                updatedCount++;
            }
        });
        this.updateGroupsFromChildrenSelections(source);
        const event = {
            type: events_1.Events.EVENT_SELECTION_CHANGED,
            source
        };
        this.eventService.dispatchEvent(event);
        return updatedCount;
    }
    selectChildren(node, newValue, groupSelectsFiltered, source) {
        const children = groupSelectsFiltered ? node.childrenAfterAggFilter : node.childrenAfterGroup;
        if ((0, generic_1.missing)(children)) {
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
    getLastSelectedNode() {
        const selectedKeys = Array.from(this.selectedNodes.keys());
        if (selectedKeys.length == 0) {
            return null;
        }
        const node = this.selectedNodes.get((0, array_1.last)(selectedKeys));
        if (node) {
            return node;
        }
        return null;
    }
    getSelectedNodes() {
        const selectedNodes = [];
        this.selectedNodes.forEach((rowNode) => {
            if (rowNode) {
                selectedNodes.push(rowNode);
            }
        });
        return selectedNodes;
    }
    getSelectedRows() {
        const selectedRows = [];
        this.selectedNodes.forEach((rowNode) => {
            if (rowNode && rowNode.data) {
                selectedRows.push(rowNode.data);
            }
        });
        return selectedRows;
    }
    getSelectionCount() {
        return this.selectedNodes.size;
    }
    /**
     * This method is used by the CSRM to remove groups which are being disposed of,
     * events do not need fired in this case
     */
    filterFromSelection(predicate) {
        const newSelectedNodes = new Map();
        this.selectedNodes.forEach((rowNode, key) => {
            const passesPredicate = rowNode && predicate(rowNode);
            if (passesPredicate) {
                newSelectedNodes.set(key, rowNode);
            }
        });
        this.selectedNodes = newSelectedNodes;
    }
    // should only be called if groupSelectsChildren=true
    updateGroupsFromChildrenSelections(source, changedPath) {
        // we only do this when group selection state depends on selected children
        if (!this.groupSelectsChildren) {
            return false;
        }
        // also only do it if CSRM (code should never allow this anyway)
        if (this.rowModel.getType() !== 'clientSide') {
            return false;
        }
        const clientSideRowModel = this.rowModel;
        const rootNode = clientSideRowModel.getRootNode();
        if (!changedPath) {
            changedPath = new changedPath_1.ChangedPath(true, rootNode);
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
    clearOtherNodes(rowNodeToKeepSelected, source) {
        const groupsToRefresh = new Map();
        let updatedCount = 0;
        this.selectedNodes.forEach((otherRowNode) => {
            if (otherRowNode && otherRowNode.id !== rowNodeToKeepSelected.id) {
                const rowNode = this.selectedNodes.get(otherRowNode.id);
                updatedCount += rowNode.setSelectedParams({
                    newValue: false,
                    clearSelection: false,
                    suppressFinishActions: true,
                    source,
                });
                if (this.groupSelectsChildren && otherRowNode.parent) {
                    groupsToRefresh.set(otherRowNode.parent.id, otherRowNode.parent);
                }
            }
        });
        groupsToRefresh.forEach((group) => {
            const selected = group.calculateSelectedFromChildren();
            group.selectThisNode(selected === null ? false : selected, undefined, source);
        });
        return updatedCount;
    }
    onRowSelected(event) {
        const rowNode = event.node;
        // we do not store the group rows when the groups select children
        if (this.groupSelectsChildren && rowNode.group) {
            return;
        }
        if (rowNode.isSelected()) {
            this.selectedNodes.set(rowNode.id, rowNode);
        }
        else {
            this.selectedNodes.delete(rowNode.id);
        }
    }
    syncInRowNode(rowNode, oldNode) {
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
    syncInOldRowNode(rowNode, oldNode) {
        const oldNodeHasDifferentId = (0, generic_1.exists)(oldNode) && (rowNode.id !== oldNode.id);
        if (oldNodeHasDifferentId && oldNode) {
            const id = oldNode.id;
            const oldNodeSelected = this.selectedNodes.get(id) == rowNode;
            if (oldNodeSelected) {
                this.selectedNodes.set(oldNode.id, oldNode);
            }
        }
    }
    syncInNewRowNode(rowNode) {
        if (this.selectedNodes.has(rowNode.id)) {
            rowNode.setSelectedInitialValue(true);
            this.selectedNodes.set(rowNode.id, rowNode);
        }
        else {
            rowNode.setSelectedInitialValue(false);
        }
    }
    reset(source) {
        const selectionCount = this.getSelectionCount();
        this.resetNodes();
        if (selectionCount) {
            const event = {
                type: events_1.Events.EVENT_SELECTION_CHANGED,
                source
            };
            this.eventService.dispatchEvent(event);
        }
    }
    resetNodes() {
        var _a;
        this.logger.log('reset');
        (_a = this.selectedNodes) === null || _a === void 0 ? void 0 : _a.clear();
    }
    // returns a list of all nodes at 'best cost' - a feature to be used
    // with groups / trees. if a group has all it's children selected,
    // then the group appears in the result, but not the children.
    // Designed for use with 'children' as the group selection type,
    // where groups don't actually appear in the selection normally.
    getBestCostNodeSelection() {
        if (this.rowModel.getType() !== 'clientSide') {
            // Error logged as part of gridApi as that is only call point for this method.
            return;
        }
        const clientSideRowModel = this.rowModel;
        const topLevelNodes = clientSideRowModel.getTopLevelNodes();
        if (topLevelNodes === null) {
            return;
        }
        const result = [];
        // recursive function, to find the selected nodes
        function traverse(nodes) {
            for (let i = 0, l = nodes.length; i < l; i++) {
                const node = nodes[i];
                if (node.isSelected()) {
                    result.push(node);
                }
                else {
                    // if not selected, then if it's a group, and the group
                    // has children, continue to search for selections
                    const maybeGroup = node;
                    if (maybeGroup.group && maybeGroup.children) {
                        traverse(maybeGroup.children);
                    }
                }
            }
        }
        traverse(topLevelNodes);
        return result;
    }
    isEmpty() {
        let count = 0;
        this.selectedNodes.forEach((rowNode) => {
            if (rowNode) {
                count++;
            }
        });
        return count === 0;
    }
    deselectAllRowNodes(params) {
        const callback = (rowNode) => rowNode.selectThisNode(false, undefined, source);
        const rowModelClientSide = this.rowModel.getType() === 'clientSide';
        const { source, justFiltered, justCurrentPage } = params;
        if (justCurrentPage || justFiltered) {
            if (!rowModelClientSide) {
                console.error("AG Grid: selecting just filtered only works when gridOptions.rowModelType='clientSide'");
                return;
            }
            this.getNodesToSelect(justFiltered, justCurrentPage).forEach(callback);
        }
        else {
            this.selectedNodes.forEach((rowNode) => {
                // remember the reference can be to null, as we never 'delete' from the map
                if (rowNode) {
                    callback(rowNode);
                }
            });
            // this clears down the map (whereas above only sets the items in map to 'undefined')
            this.reset(source);
        }
        // the above does not clean up the parent rows if they are selected
        if (rowModelClientSide && this.groupSelectsChildren) {
            this.updateGroupsFromChildrenSelections(source);
        }
        const event = {
            type: events_1.Events.EVENT_SELECTION_CHANGED,
            source
        };
        this.eventService.dispatchEvent(event);
    }
    getSelectedCounts(justFiltered, justCurrentPage) {
        let selectedCount = 0;
        let notSelectedCount = 0;
        const callback = (node) => {
            if (this.groupSelectsChildren && node.group) {
                return;
            }
            if (node.isSelected()) {
                selectedCount++;
            }
            else if (!node.selectable) {
                // don't count non-selectable nodes!
            }
            else {
                notSelectedCount++;
            }
        };
        this.getNodesToSelect(justFiltered, justCurrentPage).forEach(callback);
        return { selectedCount, notSelectedCount };
    }
    getSelectAllState(justFiltered, justCurrentPage) {
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
    /**
     * @param justFiltered whether to just include nodes which have passed the filter
     * @param justCurrentPage whether to just include nodes on the current page
     * @returns all nodes including unselectable nodes which are the target of this selection attempt
     */
    getNodesToSelect(justFiltered = false, justCurrentPage = false) {
        if (this.rowModel.getType() !== 'clientSide') {
            throw new Error(`selectAll only available when rowModelType='clientSide', ie not ${this.rowModel.getType()}`);
        }
        const nodes = [];
        if (justCurrentPage) {
            this.paginationProxy.forEachNodeOnPage((node) => {
                if (!node.group) {
                    nodes.push(node);
                    return;
                }
                if (!node.expanded) {
                    // even with groupSelectsChildren, do this recursively as only the filtered children
                    // are considered as the current page
                    const recursivelyAddChildren = (child) => {
                        var _a;
                        nodes.push(child);
                        if ((_a = child.childrenAfterFilter) === null || _a === void 0 ? void 0 : _a.length) {
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
        const clientSideRowModel = this.rowModel;
        if (justFiltered) {
            clientSideRowModel.forEachNodeAfterFilter(node => {
                nodes.push(node);
            });
            return nodes;
        }
        clientSideRowModel.forEachNode(node => {
            nodes.push(node);
        });
        return nodes;
    }
    selectAllRowNodes(params) {
        if (this.rowModel.getType() !== 'clientSide') {
            throw new Error(`selectAll only available when rowModelType='clientSide', ie not ${this.rowModel.getType()}`);
        }
        const { source, justFiltered, justCurrentPage } = params;
        const callback = (rowNode) => rowNode.selectThisNode(true, undefined, source);
        this.getNodesToSelect(justFiltered, justCurrentPage).forEach(callback);
        // the above does not clean up the parent rows if they are selected
        if (this.rowModel.getType() === 'clientSide' && this.groupSelectsChildren) {
            this.updateGroupsFromChildrenSelections(source);
        }
        const event = {
            type: events_1.Events.EVENT_SELECTION_CHANGED,
            source
        };
        this.eventService.dispatchEvent(event);
    }
    getSelectionState() {
        const selectedIds = [];
        const selectedNodes = Object.values(this.selectedNodes);
        for (let i = 0; i < selectedNodes.length; i++) {
            const node = selectedNodes[i];
            if (node === null || node === void 0 ? void 0 : node.id) {
                selectedIds.push(node.id);
            }
        }
        return selectedIds.length ? selectedIds : null;
    }
    setSelectionState(state, source) {
        if (!Array.isArray(state)) {
            return;
        }
        const rowIds = new Set(state);
        const nodes = [];
        this.rowModel.forEachNode(node => {
            if (rowIds.has(node.id)) {
                nodes.push(node);
            }
        });
        this.setNodesSelected({
            newValue: true,
            nodes,
            source
        });
    }
};
__decorate([
    (0, context_3.Autowired)('rowModel')
], SelectionService.prototype, "rowModel", void 0);
__decorate([
    (0, context_3.Autowired)('paginationProxy')
], SelectionService.prototype, "paginationProxy", void 0);
__decorate([
    __param(0, (0, context_2.Qualifier)('loggerFactory'))
], SelectionService.prototype, "setBeans", null);
__decorate([
    context_4.PostConstruct
], SelectionService.prototype, "init", null);
SelectionService = __decorate([
    (0, context_1.Bean)('selectionService')
], SelectionService);
exports.SelectionService = SelectionService;
