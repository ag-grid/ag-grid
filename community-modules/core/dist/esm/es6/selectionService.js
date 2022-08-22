/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Bean } from "./context/context";
import { BeanStub } from "./context/beanStub";
import { Qualifier } from "./context/context";
import { Events } from "./events";
import { Autowired } from "./context/context";
import { PostConstruct } from "./context/context";
import { Constants } from "./constants/constants";
import { ChangedPath } from "./utils/changedPath";
import { iterateObject } from "./utils/object";
import { exists } from "./utils/generic";
let SelectionService = class SelectionService extends BeanStub {
    setBeans(loggerFactory) {
        this.logger = loggerFactory.create('selectionService');
        this.reset();
    }
    init() {
        this.groupSelectsChildren = this.gridOptionsWrapper.isGroupSelectsChildren();
        this.addManagedListener(this.eventService, Events.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
    }
    setLastSelectedNode(rowNode) {
        this.lastSelectedNode = rowNode;
    }
    getLastSelectedNode() {
        return this.lastSelectedNode;
    }
    getSelectedNodes() {
        const selectedNodes = [];
        iterateObject(this.selectedNodes, (key, rowNode) => {
            if (rowNode) {
                selectedNodes.push(rowNode);
            }
        });
        return selectedNodes;
    }
    getSelectedRows() {
        const selectedRows = [];
        iterateObject(this.selectedNodes, (key, rowNode) => {
            if (rowNode && rowNode.data) {
                selectedRows.push(rowNode.data);
            }
        });
        return selectedRows;
    }
    removeGroupsFromSelection() {
        iterateObject(this.selectedNodes, (key, rowNode) => {
            if (rowNode && rowNode.group) {
                this.selectedNodes[rowNode.id] = undefined;
            }
        });
    }
    // should only be called if groupSelectsChildren=true
    updateGroupsFromChildrenSelections(changedPath) {
        // we only do this when group selection state depends on selected children
        if (!this.gridOptionsWrapper.isGroupSelectsChildren()) {
            return;
        }
        // also only do it if CSRM (code should never allow this anyway)
        if (this.rowModel.getType() !== Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            return;
        }
        const clientSideRowModel = this.rowModel;
        const rootNode = clientSideRowModel.getRootNode();
        if (!changedPath) {
            changedPath = new ChangedPath(true, rootNode);
            changedPath.setInactive();
        }
        changedPath.forEachChangedNodeDepthFirst(rowNode => {
            if (rowNode !== rootNode) {
                const selected = rowNode.calculateSelectedFromChildren();
                rowNode.selectThisNode(selected === null ? false : selected);
            }
        });
        // clientSideRowModel.getTopLevelNodes()!.forEach((rowNode: RowNode) => {
        //     rowNode.depthFirstSearch((node) => {
        //         if (node.group) {
        //         }
        //     });
        // });
    }
    getNodeForIdIfSelected(id) {
        return this.selectedNodes[id];
    }
    clearOtherNodes(rowNodeToKeepSelected) {
        const groupsToRefresh = {};
        let updatedCount = 0;
        iterateObject(this.selectedNodes, (key, otherRowNode) => {
            if (otherRowNode && otherRowNode.id !== rowNodeToKeepSelected.id) {
                const rowNode = this.selectedNodes[otherRowNode.id];
                updatedCount += rowNode.setSelectedParams({
                    newValue: false,
                    clearSelection: false,
                    suppressFinishActions: true
                });
                if (this.groupSelectsChildren && otherRowNode.parent) {
                    groupsToRefresh[otherRowNode.parent.id] = otherRowNode.parent;
                }
            }
        });
        iterateObject(groupsToRefresh, (key, group) => {
            const selected = group.calculateSelectedFromChildren();
            group.selectThisNode(selected === null ? false : selected);
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
            this.selectedNodes[rowNode.id] = rowNode;
        }
        else {
            this.selectedNodes[rowNode.id] = undefined;
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
        const oldNodeHasDifferentId = exists(oldNode) && (rowNode.id !== oldNode.id);
        if (oldNodeHasDifferentId && oldNode) {
            const id = oldNode.id;
            const oldNodeSelected = this.selectedNodes[id] == rowNode;
            if (oldNodeSelected) {
                this.selectedNodes[oldNode.id] = oldNode;
            }
        }
    }
    syncInNewRowNode(rowNode) {
        if (exists(this.selectedNodes[rowNode.id])) {
            rowNode.setSelectedInitialValue(true);
            this.selectedNodes[rowNode.id] = rowNode;
        }
        else {
            rowNode.setSelectedInitialValue(false);
        }
    }
    reset() {
        this.logger.log('reset');
        this.selectedNodes = {};
        this.lastSelectedNode = null;
    }
    // returns a list of all nodes at 'best cost' - a feature to be used
    // with groups / trees. if a group has all it's children selected,
    // then the group appears in the result, but not the children.
    // Designed for use with 'children' as the group selection type,
    // where groups don't actually appear in the selection normally.
    getBestCostNodeSelection() {
        if (this.rowModel.getType() !== Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            console.warn('AG Grid: `getBestCostNodeSelection` is only available when using normal row model');
            return;
        }
        const clientSideRowModel = this.rowModel;
        const topLevelNodes = clientSideRowModel.getTopLevelNodes();
        if (topLevelNodes === null) {
            console.warn('AG Grid: `selectAll` not available doing `rowModel=virtual`');
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
    setRowModel(rowModel) {
        this.rowModel = rowModel;
    }
    isEmpty() {
        let count = 0;
        iterateObject(this.selectedNodes, (nodeId, rowNode) => {
            if (rowNode) {
                count++;
            }
        });
        return count === 0;
    }
    deselectAllRowNodes(justFiltered = false) {
        const callback = (rowNode) => rowNode.selectThisNode(false);
        const rowModelClientSide = this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
        if (justFiltered) {
            if (!rowModelClientSide) {
                console.error('AG Grid: selecting just filtered only works with In Memory Row Model');
                return;
            }
            const clientSideRowModel = this.rowModel;
            clientSideRowModel.forEachNodeAfterFilter(callback);
        }
        else {
            iterateObject(this.selectedNodes, (id, rowNode) => {
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
            this.updateGroupsFromChildrenSelections();
        }
        const event = {
            type: Events.EVENT_SELECTION_CHANGED,
        };
        this.eventService.dispatchEvent(event);
    }
    selectAllRowNodes(justFiltered = false) {
        if (this.rowModel.getType() !== Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            throw new Error(`selectAll only available with normal row model, ie not ${this.rowModel.getType()}`);
        }
        const clientSideRowModel = this.rowModel;
        const callback = (rowNode) => rowNode.selectThisNode(true);
        if (justFiltered) {
            clientSideRowModel.forEachNodeAfterFilter(callback);
        }
        else {
            clientSideRowModel.forEachNode(callback);
        }
        // the above does not clean up the parent rows if they are selected
        if (this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE && this.groupSelectsChildren) {
            this.updateGroupsFromChildrenSelections();
        }
        const event = {
            type: Events.EVENT_SELECTION_CHANGED,
        };
        this.eventService.dispatchEvent(event);
    }
    /**
     * @method
     * @deprecated
     */
    selectNode(rowNode, tryMulti) {
        if (rowNode) {
            rowNode.setSelectedParams({ newValue: true, clearSelection: !tryMulti });
        }
    }
    /**
     * @method
     * @deprecated
     */
    deselectIndex(rowIndex) {
        const node = this.rowModel.getRow(rowIndex);
        this.deselectNode(node);
    }
    /**
     * @method
     * @deprecated
     */
    deselectNode(rowNode) {
        if (rowNode) {
            rowNode.setSelectedParams({ newValue: false, clearSelection: false });
        }
    }
    /**
     * @method
     * @deprecated
     */
    selectIndex(index, tryMulti) {
        const node = this.rowModel.getRow(index);
        this.selectNode(node, tryMulti);
    }
};
__decorate([
    Autowired('rowModel')
], SelectionService.prototype, "rowModel", void 0);
__decorate([
    __param(0, Qualifier('loggerFactory'))
], SelectionService.prototype, "setBeans", null);
__decorate([
    PostConstruct
], SelectionService.prototype, "init", null);
SelectionService = __decorate([
    Bean('selectionService')
], SelectionService);
export { SelectionService };
