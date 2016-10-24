/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v6.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var rowNode_1 = require("../../entities/rowNode");
var utils_1 = require("../../utils");
var InMemoryNodeManager = (function () {
    function InMemoryNodeManager(rootNode, gridOptionsWrapper, context, eventService) {
        this.nextId = 0;
        this.rootNode = rootNode;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.context = context;
        this.eventService = eventService;
        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.rootNode.allLeafChildren = [];
        this.rootNode.childrenAfterGroup = [];
        this.rootNode.childrenAfterSort = [];
        this.rootNode.childrenAfterFilter = [];
    }
    InMemoryNodeManager.prototype.setRowData = function (rowData, firstId) {
        this.rootNode.childrenAfterFilter = null;
        this.rootNode.childrenAfterGroup = null;
        this.rootNode.childrenAfterSort = null;
        this.rootNode.childrenMapped = null;
        this.nextId = utils_1.Utils.exists(firstId) ? firstId : 0;
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
            var nodeChildDetails = _this.getNodeChildDetails ? _this.getNodeChildDetails(dataItem) : null;
            if (nodeChildDetails && nodeChildDetails.group) {
                node.group = true;
                node.childrenAfterGroup = _this.recursiveFunction(nodeChildDetails.children, node, level + 1);
                node.expanded = nodeChildDetails.expanded === true;
                node.field = nodeChildDetails.field;
                node.key = nodeChildDetails.key;
                // pull out all the leaf children and add to our node
                _this.setLeafChildren(node);
            }
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
                node.expanded = false;
            }
        }
        if (parent && !this.suppressParentsInRowNodes) {
            node.parent = parent;
        }
        node.level = level;
        node.setDataAndId(dataItem, this.nextId.toString());
        this.nextId++;
        return node;
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
        var _this = this;
        if (this.isRowsAlreadyGrouped()) {
            return null;
        }
        var nodeList = this.rootNode.allLeafChildren;
        if (index > nodeList.length) {
            console.warn("ag-Grid: invalid index " + index + ", max index is " + nodeList.length);
            return;
        }
        var newNodes = [];
        rowData.forEach(function (data) {
            var newNode = _this.createNode(data, null, InMemoryNodeManager.TOP_LEVEL);
            utils_1.Utils.insertIntoArray(nodeList, newNode, index);
            newNodes.push(newNode);
        });
        return newNodes.length > 0 ? newNodes : null;
    };
    InMemoryNodeManager.prototype.removeItems = function (rowNodes) {
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
    return InMemoryNodeManager;
})();
exports.InMemoryNodeManager = InMemoryNodeManager;
