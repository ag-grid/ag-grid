/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v12.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rowNode_1 = require("../../entities/rowNode");
var utils_1 = require("../../utils");
var InMemoryNodeManager = (function () {
    function InMemoryNodeManager(rootNode, gridOptionsWrapper, context, eventService, columnController) {
        this.nextId = 0;
        // when user is provide the id's, we also keep a map of ids to row nodes for convenience
        this.allNodesMap = {};
        this.rootNode = rootNode;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.context = context;
        this.eventService = eventService;
        this.columnController = columnController;
        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.rootNode.id = InMemoryNodeManager.ROOT_NODE_ID;
        this.rootNode.allLeafChildren = [];
        this.rootNode.childrenAfterGroup = [];
        this.rootNode.childrenAfterSort = [];
        this.rootNode.childrenAfterFilter = [];
    }
    InMemoryNodeManager.prototype.getCopyOfNodesMap = function () {
        var result = utils_1.Utils.cloneObject(this.allNodesMap);
        return result;
    };
    InMemoryNodeManager.prototype.getRowNode = function (id) {
        return this.allNodesMap[id];
    };
    InMemoryNodeManager.prototype.setRowData = function (rowData) {
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
        // func below doesn't have 'this' pointer, so need to pull out these bits
        this.getNodeChildDetails = this.gridOptionsWrapper.getNodeChildDetailsFunc();
        this.suppressParentsInRowNodes = this.gridOptionsWrapper.isSuppressParentsInRowNodes();
        this.doesDataFlower = this.gridOptionsWrapper.getDoesDataFlowerFunc();
        var rowsAlreadyGrouped = utils_1.Utils.exists(this.getNodeChildDetails);
        // kick off recursion
        var result = this.recursiveFunction(rowData, null, InMemoryNodeManager.TOP_LEVEL);
        if (rowsAlreadyGrouped) {
            this.rootNode.childrenAfterGroup = result;
            this.setLeafChildren(this.rootNode);
        }
        else {
            this.rootNode.allLeafChildren = result;
        }
    };
    InMemoryNodeManager.prototype.updateRowData = function (rowDataTran) {
        var _this = this;
        if (this.isRowsAlreadyGrouped()) {
            return null;
        }
        var add = rowDataTran.add, addIndex = rowDataTran.addIndex, remove = rowDataTran.remove, update = rowDataTran.update;
        var rowNodeTransaction = {
            remove: [],
            update: [],
            add: []
        };
        if (utils_1.Utils.exists(add)) {
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
        }
        if (utils_1.Utils.exists(remove)) {
            remove.forEach(function (item) {
                var removedRowNode = _this.updatedRowNode(item, false);
                if (removedRowNode) {
                    rowNodeTransaction.remove.push(removedRowNode);
                }
            });
        }
        if (utils_1.Utils.exists(update)) {
            update.forEach(function (item) {
                var updatedRowNode = _this.updatedRowNode(item, true);
                if (updatedRowNode) {
                    rowNodeTransaction.update.push(updatedRowNode);
                }
            });
        }
        return rowNodeTransaction;
    };
    InMemoryNodeManager.prototype.addRowNode = function (data, index) {
        var newNode = this.createNode(data, null, InMemoryNodeManager.TOP_LEVEL);
        if (utils_1.Utils.exists(index)) {
            utils_1.Utils.insertIntoArray(this.rootNode.allLeafChildren, newNode, index);
        }
        else {
            this.rootNode.allLeafChildren.push(newNode);
        }
        return newNode;
    };
    InMemoryNodeManager.prototype.updatedRowNode = function (data, update) {
        var rowNodeIdFunc = this.gridOptionsWrapper.getRowNodeIdFunc();
        var rowNode;
        if (utils_1.Utils.exists(rowNodeIdFunc)) {
            // find rowNode us id
            var id = rowNodeIdFunc(data);
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                console.error("ag-Grid: could not find row id=" + id + ", data item was not found for this id");
                return null;
            }
        }
        else {
            // find rowNode using object references
            rowNode = utils_1.Utils.find(this.rootNode.allLeafChildren, function (rowNode) { return rowNode.data === data; });
            if (!rowNode) {
                console.error("ag-Grid: could not find data item as object was not found", data);
                return null;
            }
        }
        if (update) {
            // do update
            rowNode.updateData(data);
        }
        else {
            // do delete
            rowNode.setSelected(false);
            utils_1.Utils.removeFromArray(this.rootNode.allLeafChildren, rowNode);
            this.allNodesMap[rowNode.id] = undefined;
        }
        return rowNode;
    };
    InMemoryNodeManager.prototype.recursiveFunction = function (rowData, parent, level) {
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
    InMemoryNodeManager.prototype.createNode = function (dataItem, parent, level) {
        var node = new rowNode_1.RowNode();
        this.context.wireBean(node);
        var nodeChildDetails = this.getNodeChildDetails ? this.getNodeChildDetails(dataItem) : null;
        if (nodeChildDetails && nodeChildDetails.group) {
            node.group = true;
            node.childrenAfterGroup = this.recursiveFunction(nodeChildDetails.children, node, level + 1);
            node.expanded = nodeChildDetails.expanded === true;
            node.field = nodeChildDetails.field;
            node.key = nodeChildDetails.key;
            node.canFlower = false;
            // pull out all the leaf children and add to our node
            this.setLeafChildren(node);
        }
        else {
            node.group = false;
            node.canFlower = this.doesDataFlower ? this.doesDataFlower(dataItem) : false;
            if (node.canFlower) {
                node.expanded = this.isExpanded(level);
            }
        }
        if (parent && !this.suppressParentsInRowNodes) {
            node.parent = parent;
        }
        node.level = level;
        node.setDataAndId(dataItem, this.nextId.toString());
        this.allNodesMap[node.id] = node;
        this.nextId++;
        return node;
    };
    InMemoryNodeManager.prototype.isExpanded = function (level) {
        var expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
        if (expandByDefault === -1) {
            return true;
        }
        else {
            return level < expandByDefault;
        }
    };
    InMemoryNodeManager.prototype.setLeafChildren = function (node) {
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
    InMemoryNodeManager.prototype.insertItemsAtIndex = function (index, rowData) {
        if (this.isRowsAlreadyGrouped()) {
            return null;
        }
        var nodeList = this.rootNode.allLeafChildren;
        if (index > nodeList.length) {
            console.warn("ag-Grid: invalid index " + index + ", max index is " + nodeList.length);
            return;
        }
        var newNodes = [];
        // go through the items backwards, otherwise they get added in reverse order
        for (var i = rowData.length - 1; i >= 0; i--) {
            var data = rowData[i];
            var newNode = this.createNode(data, null, InMemoryNodeManager.TOP_LEVEL);
            utils_1.Utils.insertIntoArray(nodeList, newNode, index);
            newNodes.push(newNode);
        }
        return newNodes.length > 0 ? newNodes : null;
    };
    InMemoryNodeManager.prototype.removeItems = function (rowNodes) {
        var _this = this;
        if (this.isRowsAlreadyGrouped()) {
            return;
        }
        var nodeList = this.rootNode.allLeafChildren;
        var removedNodes = [];
        rowNodes.forEach(function (rowNode) {
            var indexOfNode = nodeList.indexOf(rowNode);
            if (indexOfNode >= 0) {
                rowNode.setSelected(false);
                nodeList.splice(indexOfNode, 1);
                _this.allNodesMap[rowNode.id] = undefined;
            }
            removedNodes.push(rowNode);
        });
        return removedNodes.length > 0 ? removedNodes : null;
    };
    InMemoryNodeManager.prototype.addItems = function (items) {
        var nodeList = this.rootNode.allLeafChildren;
        return this.insertItemsAtIndex(nodeList.length, items);
    };
    InMemoryNodeManager.prototype.isRowsAlreadyGrouped = function () {
        var rowsAlreadyGrouped = utils_1.Utils.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (rowsAlreadyGrouped) {
            console.warn('ag-Grid: adding and removing rows is not supported when using nodeChildDetailsFunc, ie it is not ' +
                'supported if providing groups');
            return true;
        }
        else {
            return false;
        }
    };
    InMemoryNodeManager.TOP_LEVEL = 0;
    InMemoryNodeManager.ROOT_NODE_ID = 'ROOT_NODE_ID';
    return InMemoryNodeManager;
}());
exports.InMemoryNodeManager = InMemoryNodeManager;
