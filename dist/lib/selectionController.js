/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var context_1 = require("./context/context");
var context_2 = require("./context/context");
var logger_1 = require("./logger");
var eventService_1 = require("./eventService");
var events_1 = require("./events");
var context_3 = require("./context/context");
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var context_4 = require("./context/context");
var constants_1 = require("./constants");
var SelectionController = (function () {
    function SelectionController() {
    }
    SelectionController.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('SelectionController');
        this.reset();
        if (this.gridOptionsWrapper.isRowModelDefault()) {
            this.eventService.addEventListener(events_1.Events.EVENT_ROW_DATA_CHANGED, this.reset.bind(this));
        }
        else {
            this.logger.log('dont know what to do here');
        }
    };
    SelectionController.prototype.init = function () {
        this.groupSelectsChildren = this.gridOptionsWrapper.isGroupSelectsChildren();
        this.eventService.addEventListener(events_1.Events.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
    };
    SelectionController.prototype.setLastSelectedNode = function (rowNode) {
        this.lastSelectedNode = rowNode;
    };
    SelectionController.prototype.getLastSelectedNode = function () {
        return this.lastSelectedNode;
    };
    SelectionController.prototype.getSelectedNodes = function () {
        var selectedNodes = [];
        utils_1.Utils.iterateObject(this.selectedNodes, function (key, rowNode) {
            if (rowNode) {
                selectedNodes.push(rowNode);
            }
        });
        return selectedNodes;
    };
    SelectionController.prototype.getSelectedRows = function () {
        var selectedRows = [];
        utils_1.Utils.iterateObject(this.selectedNodes, function (key, rowNode) {
            if (rowNode) {
                selectedRows.push(rowNode.data);
            }
        });
        return selectedRows;
    };
    SelectionController.prototype.removeGroupsFromSelection = function () {
        var _this = this;
        utils_1.Utils.iterateObject(this.selectedNodes, function (key, rowNode) {
            if (rowNode && rowNode.group) {
                _this.selectedNodes[rowNode.id] = undefined;
            }
        });
    };
    // should only be called if groupSelectsChildren=true
    SelectionController.prototype.updateGroupsFromChildrenSelections = function () {
        if (this.rowModel.getType() !== constants_1.Constants.ROW_MODEL_TYPE_NORMAL) {
            console.warn('updateGroupsFromChildrenSelections not available when rowModel is not normal');
        }
        var inMemoryRowModel = this.rowModel;
        inMemoryRowModel.getTopLevelNodes().forEach(function (rowNode) {
            rowNode.depthFirstSearch(function (rowNode) {
                if (rowNode.group) {
                    rowNode.calculateSelectedFromChildren();
                }
            });
        });
    };
    SelectionController.prototype.getNodeForIdIfSelected = function (id) {
        return this.selectedNodes[id];
    };
    SelectionController.prototype.clearOtherNodes = function (rowNodeToKeepSelected) {
        var _this = this;
        var groupsToRefresh = {};
        var updatedCount = 0;
        utils_1.Utils.iterateObject(this.selectedNodes, function (key, otherRowNode) {
            if (otherRowNode && otherRowNode.id !== rowNodeToKeepSelected.id) {
                var rowNode = _this.selectedNodes[otherRowNode.id];
                updatedCount += rowNode.setSelectedParams({ newValue: false, clearSelection: false, tailingNodeInSequence: true });
                if (_this.groupSelectsChildren && otherRowNode.parent) {
                    groupsToRefresh[otherRowNode.parent.id] = otherRowNode.parent;
                }
            }
        });
        utils_1.Utils.iterateObject(groupsToRefresh, function (key, group) {
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
        var oldNodeHasDifferentId = utils_1.Utils.exists(oldNode) && (rowNode.id !== oldNode.id);
        if (oldNodeHasDifferentId) {
            var oldNodeSelected = utils_1.Utils.exists(this.selectedNodes[oldNode.id]);
            if (oldNodeSelected) {
                this.selectedNodes[oldNode.id] = oldNode;
            }
        }
    };
    SelectionController.prototype.syncInNewRowNode = function (rowNode) {
        if (utils_1.Utils.exists(this.selectedNodes[rowNode.id])) {
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
        if (this.rowModel.getType() !== constants_1.Constants.ROW_MODEL_TYPE_NORMAL) {
            console.warn('getBestCostNodeSelection is only avilable when using normal row model');
        }
        var inMemoryRowModel = this.rowModel;
        var topLevelNodes = inMemoryRowModel.getTopLevelNodes();
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
        utils_1.Utils.iterateObject(this.selectedNodes, function (nodeId, rowNode) {
            if (rowNode) {
                count++;
            }
        });
        return count === 0;
    };
    SelectionController.prototype.deselectAllRowNodes = function (justFiltered) {
        if (justFiltered === void 0) { justFiltered = false; }
        var inMemoryRowModel = this.rowModel;
        var callback = function (rowNode) { return rowNode.selectThisNode(false); };
        // execute on all nodes in the model. if we are doing pagination, only
        // the current page is used, thus if we 'deselect all' while on page 2,
        // any selections on page 1 are left as is.
        if (justFiltered) {
            inMemoryRowModel.forEachNodeAfterFilter(callback);
        }
        else {
            inMemoryRowModel.forEachNode(callback);
        }
        // the above does not clean up the parent rows if they are selected
        if (this.rowModel.getType() === constants_1.Constants.ROW_MODEL_TYPE_NORMAL && this.groupSelectsChildren) {
            this.updateGroupsFromChildrenSelections();
        }
        this.eventService.dispatchEvent(events_1.Events.EVENT_SELECTION_CHANGED);
    };
    SelectionController.prototype.selectAllRowNodes = function (justFiltered) {
        if (justFiltered === void 0) { justFiltered = false; }
        if (this.rowModel.getType() !== constants_1.Constants.ROW_MODEL_TYPE_NORMAL) {
            throw "selectAll only available with normal row model, ie not " + this.rowModel.getType();
        }
        var inMemoryRowModel = this.rowModel;
        var callback = function (rowNode) { return rowNode.selectThisNode(true); };
        if (justFiltered) {
            inMemoryRowModel.forEachNodeAfterFilter(callback);
        }
        else {
            inMemoryRowModel.forEachNode(callback);
        }
        // the above does not clean up the parent rows if they are selected
        if (this.rowModel.getType() === constants_1.Constants.ROW_MODEL_TYPE_NORMAL && this.groupSelectsChildren) {
            this.updateGroupsFromChildrenSelections();
        }
        this.eventService.dispatchEvent(events_1.Events.EVENT_SELECTION_CHANGED);
    };
    // Deprecated method
    SelectionController.prototype.selectNode = function (rowNode, tryMulti) {
        rowNode.setSelectedParams({ newValue: true, clearSelection: !tryMulti });
    };
    // Deprecated method
    SelectionController.prototype.deselectIndex = function (rowIndex) {
        var node = this.rowModel.getRow(rowIndex);
        this.deselectNode(node);
    };
    // Deprecated method
    SelectionController.prototype.deselectNode = function (rowNode) {
        rowNode.setSelectedParams({ newValue: false, clearSelection: false });
    };
    // Deprecated method
    SelectionController.prototype.selectIndex = function (index, tryMulti) {
        var node = this.rowModel.getRow(index);
        this.selectNode(node, tryMulti);
    };
    return SelectionController;
}());
__decorate([
    context_3.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], SelectionController.prototype, "eventService", void 0);
__decorate([
    context_3.Autowired('rowModel'),
    __metadata("design:type", Object)
], SelectionController.prototype, "rowModel", void 0);
__decorate([
    context_3.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], SelectionController.prototype, "gridOptionsWrapper", void 0);
__decorate([
    __param(0, context_2.Qualifier('loggerFactory')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [logger_1.LoggerFactory]),
    __metadata("design:returntype", void 0)
], SelectionController.prototype, "setBeans", null);
__decorate([
    context_4.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SelectionController.prototype, "init", null);
SelectionController = __decorate([
    context_1.Bean('selectionController')
], SelectionController);
exports.SelectionController = SelectionController;
