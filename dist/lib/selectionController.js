/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.5
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var utils_1 = require('./utils');
var context_1 = require("./context/context");
var context_2 = require("./context/context");
var logger_1 = require("./logger");
var eventService_1 = require("./eventService");
var events_1 = require("./events");
var context_3 = require("./context/context");
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var context_4 = require("./context/context");
var SelectionController = (function () {
    function SelectionController() {
    }
    SelectionController.prototype.agWire = function (loggerFactory) {
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
        this.eventService.addEventListener(events_1.Events.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
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
            if (rowNode) {
                _this.selectedNodes[rowNode.id] = undefined;
            }
        });
    };
    // should only be called if groupSelectsChildren=true
    SelectionController.prototype.updateGroupsFromChildrenSelections = function () {
        this.rowModel.getTopLevelNodes().forEach(function (rowNode) {
            rowNode.deptFirstSearch(function (rowNode) {
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
        utils_1.Utils.iterateObject(this.selectedNodes, function (key, otherRowNode) {
            if (otherRowNode && otherRowNode.id !== rowNodeToKeepSelected.id) {
                _this.selectedNodes[otherRowNode.id].setSelected(false, false, true);
            }
        });
    };
    SelectionController.prototype.onRowSelected = function (event) {
        var rowNode = event.node;
        if (rowNode.isSelected()) {
            this.selectedNodes[rowNode.id] = rowNode;
        }
        else {
            this.selectedNodes[rowNode.id] = undefined;
        }
    };
    SelectionController.prototype.syncInRowNode = function (rowNode) {
        if (this.selectedNodes[rowNode.id] !== undefined) {
            rowNode.setSelectedInitialValue(true);
            this.selectedNodes[rowNode.id] = rowNode;
        }
    };
    SelectionController.prototype.reset = function () {
        this.logger.log('reset');
        this.selectedNodes = {};
    };
    // returns a list of all nodes at 'best cost' - a feature to be used
    // with groups / trees. if a group has all it's children selected,
    // then the group appears in the result, but not the children.
    // Designed for use with 'children' as the group selection type,
    // where groups don't actually appear in the selection normally.
    SelectionController.prototype.getBestCostNodeSelection = function () {
        var topLevelNodes = this.rowModel.getTopLevelNodes();
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
    SelectionController.prototype.deselectAllRowNodes = function () {
        utils_1.Utils.iterateObject(this.selectedNodes, function (nodeId, rowNode) {
            if (rowNode) {
                rowNode.selectThisNode(false);
            }
        });
        // we should not have to do this, as deselecting the nodes fires events
        // that we pick up, however it's good to clean it down, as we are still
        // left with entries pointing to 'undefined'
        this.selectedNodes = {};
    };
    SelectionController.prototype.selectAllRowNodes = function () {
        if (this.rowModel.getTopLevelNodes() === null) {
            throw 'selectAll not available when doing virtual pagination';
        }
        this.rowModel.forEachNode(function (rowNode) {
            rowNode.setSelected(true, false, true);
        });
        // because we passed in 'false' as third parameter above, the
        // eventSelectionChanged event was not fired.
        this.eventService.dispatchEvent(events_1.Events.EVENT_SELECTION_CHANGED);
    };
    // Deprecated method
    SelectionController.prototype.selectNode = function (rowNode, tryMulti, suppressEvents) {
        rowNode.setSelected(true, !tryMulti, suppressEvents);
    };
    // Deprecated method
    SelectionController.prototype.deselectIndex = function (rowIndex, suppressEvents) {
        if (suppressEvents === void 0) { suppressEvents = false; }
        var node = this.rowModel.getRow(rowIndex);
        this.deselectNode(node, suppressEvents);
    };
    // Deprecated method
    SelectionController.prototype.deselectNode = function (rowNode, suppressEvents) {
        if (suppressEvents === void 0) { suppressEvents = false; }
        rowNode.setSelected(false, false, suppressEvents);
    };
    // Deprecated method
    SelectionController.prototype.selectIndex = function (index, tryMulti, suppressEvents) {
        if (suppressEvents === void 0) { suppressEvents = false; }
        var node = this.rowModel.getRow(index);
        this.selectNode(node, tryMulti, suppressEvents);
    };
    __decorate([
        context_3.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], SelectionController.prototype, "eventService", void 0);
    __decorate([
        context_3.Autowired('rowModel'), 
        __metadata('design:type', Object)
    ], SelectionController.prototype, "rowModel", void 0);
    __decorate([
        context_3.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], SelectionController.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        __param(0, context_2.Qualifier('loggerFactory')), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
        __metadata('design:returntype', void 0)
    ], SelectionController.prototype, "agWire", null);
    __decorate([
        context_4.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], SelectionController.prototype, "init", null);
    SelectionController = __decorate([
        context_1.Bean('selectionController'), 
        __metadata('design:paramtypes', [])
    ], SelectionController);
    return SelectionController;
})();
exports.SelectionController = SelectionController;
