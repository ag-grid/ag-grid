/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var context_1 = require("./context/context");
var beanStub_1 = require("./context/beanStub");
var context_2 = require("./context/context");
var events_1 = require("./events");
var context_3 = require("./context/context");
var context_4 = require("./context/context");
var changedPath_1 = require("./utils/changedPath");
var object_1 = require("./utils/object");
var generic_1 = require("./utils/generic");
var SelectionService = /** @class */ (function (_super) {
    __extends(SelectionService, _super);
    function SelectionService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SelectionService.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('selectionService');
        this.reset();
    };
    SelectionService.prototype.init = function () {
        this.groupSelectsChildren = this.gridOptionsService.is('groupSelectsChildren');
        this.addManagedListener(this.eventService, events_1.Events.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
    };
    SelectionService.prototype.setLastSelectedNode = function (rowNode) {
        this.lastSelectedNode = rowNode;
    };
    SelectionService.prototype.getLastSelectedNode = function () {
        return this.lastSelectedNode;
    };
    SelectionService.prototype.getSelectedNodes = function () {
        var selectedNodes = [];
        object_1.iterateObject(this.selectedNodes, function (key, rowNode) {
            if (rowNode) {
                selectedNodes.push(rowNode);
            }
        });
        return selectedNodes;
    };
    SelectionService.prototype.getSelectedRows = function () {
        var selectedRows = [];
        object_1.iterateObject(this.selectedNodes, function (key, rowNode) {
            if (rowNode && rowNode.data) {
                selectedRows.push(rowNode.data);
            }
        });
        return selectedRows;
    };
    SelectionService.prototype.removeGroupsFromSelection = function () {
        var _this = this;
        object_1.iterateObject(this.selectedNodes, function (key, rowNode) {
            if (rowNode && rowNode.group) {
                _this.selectedNodes[rowNode.id] = undefined;
            }
        });
    };
    // should only be called if groupSelectsChildren=true
    SelectionService.prototype.updateGroupsFromChildrenSelections = function (source, changedPath) {
        // we only do this when group selection state depends on selected children
        if (!this.gridOptionsService.is('groupSelectsChildren')) {
            return false;
        }
        // also only do it if CSRM (code should never allow this anyway)
        if (this.rowModel.getType() !== 'clientSide') {
            return false;
        }
        var clientSideRowModel = this.rowModel;
        var rootNode = clientSideRowModel.getRootNode();
        if (!changedPath) {
            changedPath = new changedPath_1.ChangedPath(true, rootNode);
            changedPath.setInactive();
        }
        var selectionChanged = false;
        changedPath.forEachChangedNodeDepthFirst(function (rowNode) {
            if (rowNode !== rootNode) {
                var selected = rowNode.calculateSelectedFromChildren();
                selectionChanged = rowNode.selectThisNode(selected === null ? false : selected, undefined, source) || selectionChanged;
            }
        });
        return selectionChanged;
    };
    SelectionService.prototype.getNodeForIdIfSelected = function (id) {
        return this.selectedNodes[id];
    };
    SelectionService.prototype.clearOtherNodes = function (rowNodeToKeepSelected, source) {
        var _this = this;
        var groupsToRefresh = {};
        var updatedCount = 0;
        object_1.iterateObject(this.selectedNodes, function (key, otherRowNode) {
            if (otherRowNode && otherRowNode.id !== rowNodeToKeepSelected.id) {
                var rowNode = _this.selectedNodes[otherRowNode.id];
                updatedCount += rowNode.setSelectedParams({
                    newValue: false,
                    clearSelection: false,
                    suppressFinishActions: true,
                    source: source
                });
                if (_this.groupSelectsChildren && otherRowNode.parent) {
                    groupsToRefresh[otherRowNode.parent.id] = otherRowNode.parent;
                }
            }
        });
        object_1.iterateObject(groupsToRefresh, function (key, group) {
            var selected = group.calculateSelectedFromChildren();
            group.selectThisNode(selected === null ? false : selected, undefined, source);
        });
        return updatedCount;
    };
    SelectionService.prototype.onRowSelected = function (event) {
        var rowNode = event.node;
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
    };
    SelectionService.prototype.syncInRowNode = function (rowNode, oldNode) {
        this.syncInOldRowNode(rowNode, oldNode);
        this.syncInNewRowNode(rowNode);
    };
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
    SelectionService.prototype.syncInOldRowNode = function (rowNode, oldNode) {
        var oldNodeHasDifferentId = generic_1.exists(oldNode) && (rowNode.id !== oldNode.id);
        if (oldNodeHasDifferentId && oldNode) {
            var id = oldNode.id;
            var oldNodeSelected = this.selectedNodes[id] == rowNode;
            if (oldNodeSelected) {
                this.selectedNodes[oldNode.id] = oldNode;
            }
        }
    };
    SelectionService.prototype.syncInNewRowNode = function (rowNode) {
        if (generic_1.exists(this.selectedNodes[rowNode.id])) {
            rowNode.setSelectedInitialValue(true);
            this.selectedNodes[rowNode.id] = rowNode;
        }
        else {
            rowNode.setSelectedInitialValue(false);
        }
    };
    SelectionService.prototype.reset = function () {
        this.logger.log('reset');
        this.selectedNodes = {};
        this.lastSelectedNode = null;
    };
    // returns a list of all nodes at 'best cost' - a feature to be used
    // with groups / trees. if a group has all it's children selected,
    // then the group appears in the result, but not the children.
    // Designed for use with 'children' as the group selection type,
    // where groups don't actually appear in the selection normally.
    SelectionService.prototype.getBestCostNodeSelection = function () {
        if (this.rowModel.getType() !== 'clientSide') {
            // Error logged as part of gridApi as that is only call point for this method.
            return;
        }
        var clientSideRowModel = this.rowModel;
        var topLevelNodes = clientSideRowModel.getTopLevelNodes();
        if (topLevelNodes === null) {
            return;
        }
        var result = [];
        // recursive function, to find the selected nodes
        function traverse(nodes) {
            for (var i = 0, l = nodes.length; i < l; i++) {
                var node = nodes[i];
                if (node.isSelected()) {
                    result.push(node);
                }
                else {
                    // if not selected, then if it's a group, and the group
                    // has children, continue to search for selections
                    var maybeGroup = node;
                    if (maybeGroup.group && maybeGroup.children) {
                        traverse(maybeGroup.children);
                    }
                }
            }
        }
        traverse(topLevelNodes);
        return result;
    };
    SelectionService.prototype.setRowModel = function (rowModel) {
        this.rowModel = rowModel;
    };
    SelectionService.prototype.isEmpty = function () {
        var count = 0;
        object_1.iterateObject(this.selectedNodes, function (nodeId, rowNode) {
            if (rowNode) {
                count++;
            }
        });
        return count === 0;
    };
    SelectionService.prototype.deselectAllRowNodes = function (params) {
        var callback = function (rowNode) { return rowNode.selectThisNode(false, undefined, source); };
        var rowModelClientSide = this.rowModel.getType() === 'clientSide';
        var source = params.source, justFiltered = params.justFiltered, justCurrentPage = params.justCurrentPage;
        if (justCurrentPage || justFiltered) {
            if (!rowModelClientSide) {
                console.error("AG Grid: selecting just filtered only works when gridOptions.rowModelType='clientSide'");
                return;
            }
            this.getNodesToSelect(justFiltered, justCurrentPage).forEach(callback);
        }
        else {
            object_1.iterateObject(this.selectedNodes, function (id, rowNode) {
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
        var event = {
            type: events_1.Events.EVENT_SELECTION_CHANGED,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    /**
     * @param justFiltered whether to just include nodes which have passed the filter
     * @param justCurrentPage whether to just include nodes on the current page
     * @returns all nodes including unselectable nodes which are the target of this selection attempt
     */
    SelectionService.prototype.getNodesToSelect = function (justFiltered, justCurrentPage) {
        var _this = this;
        if (justFiltered === void 0) { justFiltered = false; }
        if (justCurrentPage === void 0) { justCurrentPage = false; }
        if (this.rowModel.getType() !== 'clientSide') {
            throw new Error("selectAll only available when rowModelType='clientSide', ie not " + this.rowModel.getType());
        }
        var nodes = [];
        if (justCurrentPage) {
            this.paginationProxy.forEachNodeOnPage(function (node) {
                if (!node.group) {
                    nodes.push(node);
                    return;
                }
                if (!node.expanded) {
                    // even with groupSelectsChildren, do this recursively as only the filtered children
                    // are considered as the current page
                    var recursivelyAddChildren_1 = function (child) {
                        var _a;
                        nodes.push(child);
                        if ((_a = child.childrenAfterFilter) === null || _a === void 0 ? void 0 : _a.length) {
                            child.childrenAfterFilter.forEach(recursivelyAddChildren_1);
                        }
                    };
                    recursivelyAddChildren_1(node);
                    return;
                }
                // if the group node is expanded, the pagination proxy will include the visible nodes to select
                if (!_this.groupSelectsChildren) {
                    nodes.push(node);
                }
            });
            return nodes;
        }
        var clientSideRowModel = this.rowModel;
        if (justFiltered) {
            clientSideRowModel.forEachNodeAfterFilter(function (node) {
                nodes.push(node);
            });
            return nodes;
        }
        clientSideRowModel.forEachNode(function (node) {
            nodes.push(node);
        });
        return nodes;
    };
    SelectionService.prototype.selectAllRowNodes = function (params) {
        if (this.rowModel.getType() !== 'clientSide') {
            throw new Error("selectAll only available when rowModelType='clientSide', ie not " + this.rowModel.getType());
        }
        var source = params.source, justFiltered = params.justFiltered, justCurrentPage = params.justCurrentPage;
        var callback = function (rowNode) { return rowNode.selectThisNode(true, undefined, source); };
        this.getNodesToSelect(justFiltered, justCurrentPage).forEach(callback);
        // the above does not clean up the parent rows if they are selected
        if (this.rowModel.getType() === 'clientSide' && this.groupSelectsChildren) {
            this.updateGroupsFromChildrenSelections(source);
        }
        var event = {
            type: events_1.Events.EVENT_SELECTION_CHANGED,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    __decorate([
        context_3.Autowired('rowModel')
    ], SelectionService.prototype, "rowModel", void 0);
    __decorate([
        context_3.Autowired('paginationProxy')
    ], SelectionService.prototype, "paginationProxy", void 0);
    __decorate([
        __param(0, context_2.Qualifier('loggerFactory'))
    ], SelectionService.prototype, "setBeans", null);
    __decorate([
        context_4.PostConstruct
    ], SelectionService.prototype, "init", null);
    SelectionService = __decorate([
        context_1.Bean('selectionService')
    ], SelectionService);
    return SelectionService;
}(beanStub_1.BeanStub));
exports.SelectionService = SelectionService;
