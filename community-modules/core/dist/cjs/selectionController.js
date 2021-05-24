/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var context_1 = require("./context/context");
var beanStub_1 = require("./context/beanStub");
var context_2 = require("./context/context");
var events_1 = require("./events");
var context_3 = require("./context/context");
var context_4 = require("./context/context");
var constants_1 = require("./constants/constants");
var changedPath_1 = require("./utils/changedPath");
var object_1 = require("./utils/object");
var generic_1 = require("./utils/generic");
var SelectionController = /** @class */ (function (_super) {
    __extends(SelectionController, _super);
    function SelectionController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SelectionController.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('SelectionController');
        this.reset();
        if (this.gridOptionsWrapper.isRowModelDefault()) {
            this.addManagedListener(this.eventService, events_1.Events.EVENT_ROW_DATA_CHANGED, this.reset.bind(this));
        }
    };
    SelectionController.prototype.init = function () {
        this.groupSelectsChildren = this.gridOptionsWrapper.isGroupSelectsChildren();
        this.addManagedListener(this.eventService, events_1.Events.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
    };
    SelectionController.prototype.setLastSelectedNode = function (rowNode) {
        this.lastSelectedNode = rowNode;
    };
    SelectionController.prototype.getLastSelectedNode = function () {
        return this.lastSelectedNode;
    };
    SelectionController.prototype.getSelectedNodes = function () {
        var selectedNodes = [];
        object_1.iterateObject(this.selectedNodes, function (key, rowNode) {
            if (rowNode) {
                selectedNodes.push(rowNode);
            }
        });
        return selectedNodes;
    };
    SelectionController.prototype.getSelectedRows = function () {
        var selectedRows = [];
        object_1.iterateObject(this.selectedNodes, function (key, rowNode) {
            if (rowNode && rowNode.data) {
                selectedRows.push(rowNode.data);
            }
        });
        return selectedRows;
    };
    SelectionController.prototype.removeGroupsFromSelection = function () {
        var _this = this;
        object_1.iterateObject(this.selectedNodes, function (key, rowNode) {
            if (rowNode && rowNode.group) {
                _this.selectedNodes[rowNode.id] = undefined;
            }
        });
    };
    // should only be called if groupSelectsChildren=true
    SelectionController.prototype.updateGroupsFromChildrenSelections = function (changedPath) {
        // we only do this when group selection state depends on selected children
        if (!this.gridOptionsWrapper.isGroupSelectsChildren()) {
            return;
        }
        // also only do it if CSRM (code should never allow this anyway)
        if (this.rowModel.getType() !== constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            return;
        }
        var clientSideRowModel = this.rowModel;
        var rootNode = clientSideRowModel.getRootNode();
        if (!changedPath) {
            changedPath = new changedPath_1.ChangedPath(true, rootNode);
            changedPath.setInactive();
        }
        changedPath.forEachChangedNodeDepthFirst(function (rowNode) {
            if (rowNode !== rootNode) {
                rowNode.calculateSelectedFromChildren();
            }
        });
        // clientSideRowModel.getTopLevelNodes()!.forEach((rowNode: RowNode) => {
        //     rowNode.depthFirstSearch((node) => {
        //         if (node.group) {
        //         }
        //     });
        // });
    };
    SelectionController.prototype.getNodeForIdIfSelected = function (id) {
        return this.selectedNodes[id];
    };
    SelectionController.prototype.clearOtherNodes = function (rowNodeToKeepSelected) {
        var _this = this;
        var groupsToRefresh = {};
        var updatedCount = 0;
        object_1.iterateObject(this.selectedNodes, function (key, otherRowNode) {
            if (otherRowNode && otherRowNode.id !== rowNodeToKeepSelected.id) {
                var rowNode = _this.selectedNodes[otherRowNode.id];
                updatedCount += rowNode.setSelectedParams({
                    newValue: false,
                    clearSelection: false,
                    suppressFinishActions: true
                });
                if (_this.groupSelectsChildren && otherRowNode.parent) {
                    groupsToRefresh[otherRowNode.parent.id] = otherRowNode.parent;
                }
            }
        });
        object_1.iterateObject(groupsToRefresh, function (key, group) {
            group.calculateSelectedFromChildren();
        });
        return updatedCount;
    };
    SelectionController.prototype.onRowSelected = function (event) {
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
    SelectionController.prototype.syncInRowNode = function (rowNode, oldNode) {
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
    SelectionController.prototype.syncInOldRowNode = function (rowNode, oldNode) {
        var oldNodeHasDifferentId = generic_1.exists(oldNode) && (rowNode.id !== oldNode.id);
        if (oldNodeHasDifferentId && oldNode) {
            var oldNodeSelected = generic_1.exists(this.selectedNodes[oldNode.id]);
            if (oldNodeSelected) {
                this.selectedNodes[oldNode.id] = oldNode;
            }
        }
    };
    SelectionController.prototype.syncInNewRowNode = function (rowNode) {
        if (generic_1.exists(this.selectedNodes[rowNode.id])) {
            rowNode.setSelectedInitialValue(true);
            this.selectedNodes[rowNode.id] = rowNode;
        }
        else {
            rowNode.setSelectedInitialValue(false);
        }
    };
    SelectionController.prototype.reset = function () {
        this.logger.log('reset');
        this.selectedNodes = {};
        this.lastSelectedNode = null;
    };
    // returns a list of all nodes at 'best cost' - a feature to be used
    // with groups / trees. if a group has all it's children selected,
    // then the group appears in the result, but not the children.
    // Designed for use with 'children' as the group selection type,
    // where groups don't actually appear in the selection normally.
    SelectionController.prototype.getBestCostNodeSelection = function () {
        if (this.rowModel.getType() !== constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            console.warn('getBestCostNodeSelection is only available when using normal row model');
            return;
        }
        var clientSideRowModel = this.rowModel;
        var topLevelNodes = clientSideRowModel.getTopLevelNodes();
        if (topLevelNodes === null) {
            console.warn('selectAll not available doing rowModel=virtual');
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
                    if (node.group && node.children) {
                        traverse(node.children);
                    }
                }
            }
        }
        traverse(topLevelNodes);
        return result;
    };
    SelectionController.prototype.setRowModel = function (rowModel) {
        this.rowModel = rowModel;
    };
    SelectionController.prototype.isEmpty = function () {
        var count = 0;
        object_1.iterateObject(this.selectedNodes, function (nodeId, rowNode) {
            if (rowNode) {
                count++;
            }
        });
        return count === 0;
    };
    SelectionController.prototype.deselectAllRowNodes = function (justFiltered) {
        if (justFiltered === void 0) { justFiltered = false; }
        var callback = function (rowNode) { return rowNode.selectThisNode(false); };
        var rowModelClientSide = this.rowModel.getType() === constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
        if (justFiltered) {
            if (!rowModelClientSide) {
                console.error('AG Grid: selecting just filtered only works with In Memory Row Model');
                return;
            }
            var clientSideRowModel = this.rowModel;
            clientSideRowModel.forEachNodeAfterFilter(callback);
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
            this.updateGroupsFromChildrenSelections();
        }
        var event = {
            type: events_1.Events.EVENT_SELECTION_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    };
    SelectionController.prototype.selectAllRowNodes = function (justFiltered) {
        if (justFiltered === void 0) { justFiltered = false; }
        if (this.rowModel.getType() !== constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            throw new Error("selectAll only available with normal row model, ie not " + this.rowModel.getType());
        }
        var clientSideRowModel = this.rowModel;
        var callback = function (rowNode) { return rowNode.selectThisNode(true); };
        if (justFiltered) {
            clientSideRowModel.forEachNodeAfterFilter(callback);
        }
        else {
            clientSideRowModel.forEachNode(callback);
        }
        // the above does not clean up the parent rows if they are selected
        if (this.rowModel.getType() === constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE && this.groupSelectsChildren) {
            this.updateGroupsFromChildrenSelections();
        }
        var event = {
            type: events_1.Events.EVENT_SELECTION_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    };
    /**
     * @method
     * @deprecated
     */
    SelectionController.prototype.selectNode = function (rowNode, tryMulti) {
        if (rowNode) {
            rowNode.setSelectedParams({ newValue: true, clearSelection: !tryMulti });
        }
    };
    /**
     * @method
     * @deprecated
     */
    SelectionController.prototype.deselectIndex = function (rowIndex) {
        var node = this.rowModel.getRow(rowIndex);
        this.deselectNode(node);
    };
    /**
     * @method
     * @deprecated
     */
    SelectionController.prototype.deselectNode = function (rowNode) {
        if (rowNode) {
            rowNode.setSelectedParams({ newValue: false, clearSelection: false });
        }
    };
    /**
     * @method
     * @deprecated
     */
    SelectionController.prototype.selectIndex = function (index, tryMulti) {
        var node = this.rowModel.getRow(index);
        this.selectNode(node, tryMulti);
    };
    __decorate([
        context_3.Autowired('rowModel')
    ], SelectionController.prototype, "rowModel", void 0);
    __decorate([
        context_3.Autowired('columnApi')
    ], SelectionController.prototype, "columnApi", void 0);
    __decorate([
        context_3.Autowired('gridApi')
    ], SelectionController.prototype, "gridApi", void 0);
    __decorate([
        __param(0, context_2.Qualifier('loggerFactory'))
    ], SelectionController.prototype, "setBeans", null);
    __decorate([
        context_4.PostConstruct
    ], SelectionController.prototype, "init", null);
    SelectionController = __decorate([
        context_1.Bean('selectionController')
    ], SelectionController);
    return SelectionController;
}(beanStub_1.BeanStub));
exports.SelectionController = SelectionController;

//# sourceMappingURL=selectionController.js.map
