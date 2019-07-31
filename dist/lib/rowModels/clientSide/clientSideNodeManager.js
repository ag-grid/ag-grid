/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rowNode_1 = require("../../entities/rowNode");
var events_1 = require("../../events");
var utils_1 = require("../../utils");
var ClientSideNodeManager = /** @class */ (function () {
    function ClientSideNodeManager(rootNode, gridOptionsWrapper, context, eventService, columnController, gridApi, columnApi, selectionController) {
        this.nextId = 0;
        // when user is provide the id's, we also keep a map of ids to row nodes for convenience
        this.allNodesMap = {};
        this.rootNode = rootNode;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.context = context;
        this.eventService = eventService;
        this.columnController = columnController;
        this.gridApi = gridApi;
        this.columnApi = columnApi;
        this.selectionController = selectionController;
        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.rootNode.id = ClientSideNodeManager.ROOT_NODE_ID;
        this.rootNode.allLeafChildren = [];
        this.rootNode.childrenAfterGroup = [];
        this.rootNode.childrenAfterSort = [];
        this.rootNode.childrenAfterFilter = [];
        // if we make this class a bean, then can annotate postConstruct
        this.postConstruct();
    }
    // @PostConstruct - this is not a bean, so postConstruct called by constructor
    ClientSideNodeManager.prototype.postConstruct = function () {
        // func below doesn't have 'this' pointer, so need to pull out these bits
        this.getNodeChildDetails = this.gridOptionsWrapper.getNodeChildDetailsFunc();
        this.suppressParentsInRowNodes = this.gridOptionsWrapper.isSuppressParentsInRowNodes();
        this.doesDataFlower = this.gridOptionsWrapper.getDoesDataFlowerFunc();
        this.isRowMasterFunc = this.gridOptionsWrapper.getIsRowMasterFunc();
        this.doingLegacyTreeData = utils_1._.exists(this.getNodeChildDetails);
        this.doingMasterDetail = this.gridOptionsWrapper.isMasterDetail();
        if (this.getNodeChildDetails) {
            console.warn("ag-Grid: the callback nodeChildDetailsFunc() is now deprecated. The new way of doing\n                                    tree data in ag-Grid was introduced in v14 (released November 2017). In the next\n                                    major release of ag-Grid we will be dropping support for the old version of\n                                    tree data. If you are reading this message, please go to the docs to see how\n                                    to implement Tree Data without using nodeChildDetailsFunc().");
        }
    };
    ClientSideNodeManager.prototype.getCopyOfNodesMap = function () {
        var result = utils_1._.cloneObject(this.allNodesMap);
        return result;
    };
    ClientSideNodeManager.prototype.getRowNode = function (id) {
        return this.allNodesMap[id];
    };
    ClientSideNodeManager.prototype.setRowData = function (rowData) {
        this.rootNode.childrenAfterFilter = null;
        this.rootNode.childrenAfterGroup = null;
        this.rootNode.childrenAfterSort = null;
        this.rootNode.childrenMapped = null;
        this.nextId = 0;
        this.allNodesMap = {};
        if (!rowData) {
            this.rootNode.allLeafChildren = [];
            this.rootNode.childrenAfterGroup = [];
            return;
        }
        // kick off recursion
        // we add rootNode as the parent, however if using ag-grid-enterprise, the grouping stage
        // sets the parent node on each row (even if we are not grouping). so setting parent node
        // here is for benefit of ag-grid-community users
        var result = this.recursiveFunction(rowData, this.rootNode, ClientSideNodeManager.TOP_LEVEL);
        if (this.doingLegacyTreeData) {
            this.rootNode.childrenAfterGroup = result;
            this.setLeafChildren(this.rootNode);
        }
        else {
            this.rootNode.allLeafChildren = result;
        }
    };
    ClientSideNodeManager.prototype.updateRowData = function (rowDataTran, rowNodeOrder) {
        if (this.isLegacyTreeData()) {
            return null;
        }
        var add = rowDataTran.add, addIndex = rowDataTran.addIndex, remove = rowDataTran.remove, update = rowDataTran.update;
        var rowNodeTransaction = {
            remove: [],
            update: [],
            add: []
        };
        this.executeAdd(rowDataTran, rowNodeTransaction);
        this.executeRemove(rowDataTran, rowNodeTransaction);
        this.executeUpdate(rowDataTran, rowNodeTransaction);
        if (rowNodeOrder) {
            utils_1._.sortRowNodesByOrder(this.rootNode.allLeafChildren, rowNodeOrder);
        }
        return rowNodeTransaction;
    };
    ClientSideNodeManager.prototype.executeAdd = function (rowDataTran, rowNodeTransaction) {
        var _this = this;
        var add = rowDataTran.add, addIndex = rowDataTran.addIndex;
        if (!add) {
            return;
        }
        var useIndex = typeof addIndex === 'number' && addIndex >= 0;
        if (useIndex) {
            // items get inserted in reverse order for index insertion
            add.reverse().forEach(function (item) {
                var newRowNode = _this.addRowNode(item, addIndex);
                rowNodeTransaction.add.push(newRowNode);
            });
        }
        else {
            add.forEach(function (item) {
                var newRowNode = _this.addRowNode(item);
                rowNodeTransaction.add.push(newRowNode);
            });
        }
    };
    ClientSideNodeManager.prototype.executeRemove = function (rowDataTran, rowNodeTransaction) {
        var _this = this;
        var remove = rowDataTran.remove;
        if (!remove) {
            return;
        }
        var rowIdsRemoved = {};
        var anyNodesSelected = false;
        remove.forEach(function (item) {
            var rowNode = _this.lookupRowNode(item);
            if (!rowNode) {
                return;
            }
            if (rowNode.isSelected()) {
                anyNodesSelected = true;
            }
            // do delete - setting 'tailingNodeInSequence = true' to ensure EVENT_SELECTION_CHANGED is not raised for
            // each row node updated, instead it is raised once by the calling code if any selected nodes exist.
            rowNode.setSelected(false, false, true);
            // so row renderer knows to fade row out (and not reposition it)
            rowNode.clearRowTop();
            // NOTE: were we could remove from allLeaveChildren, however _.removeFromArray() is expensive, especially
            // if called multiple times (eg deleting lots of rows) and if allLeafChildren is a large list
            rowIdsRemoved[rowNode.id] = true;
            // _.removeFromArray(this.rootNode.allLeafChildren, rowNode);
            delete _this.allNodesMap[rowNode.id];
            rowNodeTransaction.remove.push(rowNode);
        });
        this.rootNode.allLeafChildren = this.rootNode.allLeafChildren.filter(function (rowNode) { return !rowIdsRemoved[rowNode.id]; });
        if (anyNodesSelected) {
            this.selectionController.updateGroupsFromChildrenSelections();
            var event_1 = {
                type: events_1.Events.EVENT_SELECTION_CHANGED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    ClientSideNodeManager.prototype.executeUpdate = function (rowDataTran, rowNodeTransaction) {
        var _this = this;
        var update = rowDataTran.update;
        if (!update) {
            return;
        }
        update.forEach(function (item) {
            var rowNode = _this.lookupRowNode(item);
            if (!rowNode) {
                return;
            }
            rowNode.updateData(item);
            rowNodeTransaction.update.push(rowNode);
        });
    };
    ClientSideNodeManager.prototype.addRowNode = function (data, index) {
        var newNode = this.createNode(data, this.rootNode, ClientSideNodeManager.TOP_LEVEL);
        if (utils_1._.exists(index)) {
            utils_1._.insertIntoArray(this.rootNode.allLeafChildren, newNode, index);
        }
        else {
            this.rootNode.allLeafChildren.push(newNode);
        }
        return newNode;
    };
    ClientSideNodeManager.prototype.lookupRowNode = function (data) {
        var rowNodeIdFunc = this.gridOptionsWrapper.getRowNodeIdFunc();
        var rowNode;
        if (utils_1._.exists(rowNodeIdFunc)) {
            // find rowNode using id
            var id = rowNodeIdFunc(data);
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                console.error("ag-Grid: could not find row id=" + id + ", data item was not found for this id");
                return null;
            }
        }
        else {
            // find rowNode using object references
            rowNode = utils_1._.find(this.rootNode.allLeafChildren, function (rowNode) { return rowNode.data === data; });
            if (!rowNode) {
                console.error("ag-Grid: could not find data item as object was not found", data);
                return null;
            }
        }
        return rowNode;
    };
    ClientSideNodeManager.prototype.recursiveFunction = function (rowData, parent, level) {
        var _this = this;
        // make sure the rowData is an array and not a string of json - this was a commonly reported problem on the forum
        if (typeof rowData === 'string') {
            console.warn('ag-Grid: rowData must be an array, however you passed in a string. If you are loading JSON, make sure you convert the JSON string to JavaScript objects first');
            return;
        }
        var rowNodes = [];
        rowData.forEach(function (dataItem) {
            var node = _this.createNode(dataItem, parent, level);
            rowNodes.push(node);
        });
        return rowNodes;
    };
    ClientSideNodeManager.prototype.createNode = function (dataItem, parent, level) {
        var node = new rowNode_1.RowNode();
        this.context.wireBean(node);
        var doingTreeData = this.gridOptionsWrapper.isTreeData();
        var doingLegacyTreeData = !doingTreeData && utils_1._.exists(this.getNodeChildDetails);
        var nodeChildDetails = doingLegacyTreeData ? this.getNodeChildDetails(dataItem) : null;
        if (nodeChildDetails && nodeChildDetails.group) {
            node.group = true;
            node.childrenAfterGroup = this.recursiveFunction(nodeChildDetails.children, node, level + 1);
            node.expanded = nodeChildDetails.expanded === true;
            node.field = nodeChildDetails.field;
            node.key = nodeChildDetails.key;
            /** @deprecated is now 'master' */
            node.canFlower = node.master;
            // pull out all the leaf children and add to our node
            this.setLeafChildren(node);
        }
        else {
            node.group = false;
            if (doingTreeData) {
                node.master = false;
                node.expanded = false;
            }
            else {
                // this is the default, for when doing grid data
                if (this.doesDataFlower) {
                    node.master = this.doesDataFlower(dataItem);
                }
                else if (this.doingMasterDetail) {
                    // if we are doing master detail, then the
                    // default is that everything can flower.
                    if (this.isRowMasterFunc) {
                        node.master = this.isRowMasterFunc(dataItem);
                    }
                    else {
                        node.master = true;
                    }
                }
                else {
                    node.master = false;
                }
                var rowGroupColumns = this.columnController.getRowGroupColumns();
                var numRowGroupColumns = rowGroupColumns ? rowGroupColumns.length : 0;
                // need to take row group into account when determining level
                var masterRowLevel = level + numRowGroupColumns;
                node.expanded = node.master ? this.isExpanded(masterRowLevel) : false;
            }
        }
        // support for backwards compatibility, canFlow is now called 'master'
        node.canFlower = node.master;
        if (parent && !this.suppressParentsInRowNodes) {
            node.parent = parent;
        }
        node.level = level;
        node.setDataAndId(dataItem, this.nextId.toString());
        if (this.allNodesMap[node.id]) {
            console.warn("ag-grid: duplicate node id '" + node.id + "' detected from getRowNodeId callback, this could cause issues in your grid.");
        }
        this.allNodesMap[node.id] = node;
        this.nextId++;
        return node;
    };
    ClientSideNodeManager.prototype.isExpanded = function (level) {
        var expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
        if (expandByDefault === -1) {
            return true;
        }
        else {
            return level < expandByDefault;
        }
    };
    // this is only used for doing legacy tree data
    ClientSideNodeManager.prototype.setLeafChildren = function (node) {
        node.allLeafChildren = [];
        if (node.childrenAfterGroup) {
            node.childrenAfterGroup.forEach(function (childAfterGroup) {
                if (childAfterGroup.group) {
                    if (childAfterGroup.allLeafChildren) {
                        childAfterGroup.allLeafChildren.forEach(function (leafChild) { return node.allLeafChildren.push(leafChild); });
                    }
                }
                else {
                    node.allLeafChildren.push(childAfterGroup);
                }
            });
        }
    };
    ClientSideNodeManager.prototype.isLegacyTreeData = function () {
        var rowsAlreadyGrouped = utils_1._.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (rowsAlreadyGrouped) {
            console.warn('ag-Grid: adding and removing rows is not supported when using nodeChildDetailsFunc, ie it is not ' +
                'supported for legacy tree data. Please see the docs on the new preferred way of providing tree data that works with delta updates.');
            return true;
        }
        else {
            return false;
        }
    };
    ClientSideNodeManager.TOP_LEVEL = 0;
    ClientSideNodeManager.ROOT_NODE_ID = 'ROOT_NODE_ID';
    return ClientSideNodeManager;
}());
exports.ClientSideNodeManager = ClientSideNodeManager;
