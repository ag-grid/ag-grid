"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSideNodeManager = void 0;
var core_1 = require("@ag-grid-community/core");
var ClientSideNodeManager = /** @class */ (function () {
    function ClientSideNodeManager(rootNode, gridOptionsService, eventService, columnModel, selectionService, beans) {
        this.nextId = 0;
        // when user is provide the id's, we also keep a map of ids to row nodes for convenience
        this.allNodesMap = {};
        this.rootNode = rootNode;
        this.gridOptionsService = gridOptionsService;
        this.eventService = eventService;
        this.columnModel = columnModel;
        this.beans = beans;
        this.selectionService = selectionService;
        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.rootNode.id = ClientSideNodeManager.ROOT_NODE_ID;
        this.rootNode.allLeafChildren = [];
        this.rootNode.childrenAfterGroup = [];
        this.rootNode.childrenAfterSort = [];
        this.rootNode.childrenAfterAggFilter = [];
        this.rootNode.childrenAfterFilter = [];
        // if we make this class a bean, then can annotate postConstruct
        this.postConstruct();
    }
    // @PostConstruct - this is not a bean, so postConstruct called by constructor
    ClientSideNodeManager.prototype.postConstruct = function () {
        // func below doesn't have 'this' pointer, so need to pull out these bits
        this.suppressParentsInRowNodes = this.gridOptionsService.is('suppressParentsInRowNodes');
        this.isRowMasterFunc = this.gridOptionsService.get('isRowMaster');
        this.doingTreeData = this.gridOptionsService.isTreeData();
        this.doingMasterDetail = this.gridOptionsService.isMasterDetail();
    };
    ClientSideNodeManager.prototype.getCopyOfNodesMap = function () {
        return core_1._.cloneObject(this.allNodesMap);
    };
    ClientSideNodeManager.prototype.getRowNode = function (id) {
        return this.allNodesMap[id];
    };
    ClientSideNodeManager.prototype.setRowData = function (rowData) {
        var _this = this;
        if (typeof rowData === 'string') {
            console.warn('AG Grid: rowData must be an array, however you passed in a string. If you are loading JSON, make sure you convert the JSON string to JavaScript objects first');
            return;
        }
        var rootNode = this.rootNode;
        var sibling = this.rootNode.sibling;
        rootNode.childrenAfterFilter = null;
        rootNode.childrenAfterGroup = null;
        rootNode.childrenAfterAggFilter = null;
        rootNode.childrenAfterSort = null;
        rootNode.childrenMapped = null;
        rootNode.updateHasChildren();
        this.nextId = 0;
        this.allNodesMap = {};
        if (rowData) {
            // we use rootNode as the parent, however if using ag-grid-enterprise, the grouping stage
            // sets the parent node on each row (even if we are not grouping). so setting parent node
            // here is for benefit of ag-grid-community users
            rootNode.allLeafChildren = rowData.map(function (dataItem) { return _this.createNode(dataItem, _this.rootNode, ClientSideNodeManager.TOP_LEVEL); });
        }
        else {
            rootNode.allLeafChildren = [];
            rootNode.childrenAfterGroup = [];
        }
        if (sibling) {
            sibling.childrenAfterFilter = rootNode.childrenAfterFilter;
            sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
            sibling.childrenAfterAggFilter = rootNode.childrenAfterAggFilter;
            sibling.childrenAfterSort = rootNode.childrenAfterSort;
            sibling.childrenMapped = rootNode.childrenMapped;
            sibling.allLeafChildren = rootNode.allLeafChildren;
        }
    };
    ClientSideNodeManager.prototype.updateRowData = function (rowDataTran, rowNodeOrder) {
        var rowNodeTransaction = {
            remove: [],
            update: [],
            add: []
        };
        var nodesToUnselect = [];
        this.executeRemove(rowDataTran, rowNodeTransaction, nodesToUnselect);
        this.executeUpdate(rowDataTran, rowNodeTransaction, nodesToUnselect);
        this.executeAdd(rowDataTran, rowNodeTransaction);
        this.updateSelection(nodesToUnselect, 'rowDataChanged');
        if (rowNodeOrder) {
            core_1._.sortRowNodesByOrder(this.rootNode.allLeafChildren, rowNodeOrder);
        }
        return rowNodeTransaction;
    };
    ClientSideNodeManager.prototype.updateSelection = function (nodesToUnselect, source) {
        var selectionChanged = nodesToUnselect.length > 0;
        if (selectionChanged) {
            nodesToUnselect.forEach(function (rowNode) {
                rowNode.setSelected(false, false, true, source);
            });
        }
        // we do this regardless of nodes to unselect or not, as it's possible
        // a new node was inserted, so a parent that was previously selected (as all
        // children were selected) should not be tri-state (as new one unselected against
        // all other selected children).
        this.selectionService.updateGroupsFromChildrenSelections(source);
        if (selectionChanged) {
            var event_1 = {
                type: core_1.Events.EVENT_SELECTION_CHANGED,
                source: source
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    ClientSideNodeManager.prototype.executeAdd = function (rowDataTran, rowNodeTransaction) {
        var _this = this;
        var _a;
        var add = rowDataTran.add, addIndex = rowDataTran.addIndex;
        if (core_1._.missingOrEmpty(add)) {
            return;
        }
        // create new row nodes for each data item
        var newNodes = add.map(function (item) { return _this.createNode(item, _this.rootNode, ClientSideNodeManager.TOP_LEVEL); });
        if (typeof addIndex === 'number' && addIndex >= 0) {
            // new rows are inserted in one go by concatenating them in between the existing rows at the desired index.
            // this is much faster than splicing them individually into 'allLeafChildren' when there are large inserts.
            var allLeafChildren = this.rootNode.allLeafChildren;
            var len = allLeafChildren.length;
            var normalisedAddIndex = addIndex;
            if (this.doingTreeData && addIndex > 0 && len > 0) {
                for (var i = 0; i < len; i++) {
                    if (((_a = allLeafChildren[i]) === null || _a === void 0 ? void 0 : _a.rowIndex) == addIndex - 1) {
                        normalisedAddIndex = i + 1;
                        break;
                    }
                }
            }
            var nodesBeforeIndex = allLeafChildren.slice(0, normalisedAddIndex);
            var nodesAfterIndex = allLeafChildren.slice(normalisedAddIndex, allLeafChildren.length);
            this.rootNode.allLeafChildren = __spread(nodesBeforeIndex, newNodes, nodesAfterIndex);
        }
        else {
            this.rootNode.allLeafChildren = __spread(this.rootNode.allLeafChildren, newNodes);
        }
        if (this.rootNode.sibling) {
            this.rootNode.sibling.allLeafChildren = this.rootNode.allLeafChildren;
        }
        // add new row nodes to the transaction add items
        rowNodeTransaction.add = newNodes;
    };
    ClientSideNodeManager.prototype.executeRemove = function (rowDataTran, rowNodeTransaction, nodesToUnselect) {
        var _this = this;
        var remove = rowDataTran.remove;
        if (core_1._.missingOrEmpty(remove)) {
            return;
        }
        var rowIdsRemoved = {};
        remove.forEach(function (item) {
            var rowNode = _this.lookupRowNode(item);
            if (!rowNode) {
                return;
            }
            // do delete - setting 'suppressFinishActions = true' to ensure EVENT_SELECTION_CHANGED is not raised for
            // each row node updated, instead it is raised once by the calling code if any selected nodes exist.
            if (rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }
            // so row renderer knows to fade row out (and not reposition it)
            rowNode.clearRowTopAndRowIndex();
            // NOTE: were we could remove from allLeaveChildren, however _.removeFromArray() is expensive, especially
            // if called multiple times (eg deleting lots of rows) and if allLeafChildren is a large list
            rowIdsRemoved[rowNode.id] = true;
            // _.removeFromArray(this.rootNode.allLeafChildren, rowNode);
            delete _this.allNodesMap[rowNode.id];
            rowNodeTransaction.remove.push(rowNode);
        });
        this.rootNode.allLeafChildren = this.rootNode.allLeafChildren.filter(function (rowNode) { return !rowIdsRemoved[rowNode.id]; });
        if (this.rootNode.sibling) {
            this.rootNode.sibling.allLeafChildren = this.rootNode.allLeafChildren;
        }
    };
    ClientSideNodeManager.prototype.executeUpdate = function (rowDataTran, rowNodeTransaction, nodesToUnselect) {
        var _this = this;
        var update = rowDataTran.update;
        if (core_1._.missingOrEmpty(update)) {
            return;
        }
        update.forEach(function (item) {
            var rowNode = _this.lookupRowNode(item);
            if (!rowNode) {
                return;
            }
            rowNode.updateData(item);
            if (!rowNode.selectable && rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }
            _this.setMasterForRow(rowNode, item, ClientSideNodeManager.TOP_LEVEL, false);
            rowNodeTransaction.update.push(rowNode);
        });
    };
    ClientSideNodeManager.prototype.lookupRowNode = function (data) {
        var getRowIdFunc = this.gridOptionsService.getRowIdFunc();
        var rowNode;
        if (getRowIdFunc) {
            // find rowNode using id
            var id = getRowIdFunc({ data: data, level: 0 });
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                console.error("AG Grid: could not find row id=" + id + ", data item was not found for this id");
                return null;
            }
        }
        else {
            // find rowNode using object references
            rowNode = this.rootNode.allLeafChildren.find(function (node) { return node.data === data; });
            if (!rowNode) {
                console.error("AG Grid: could not find data item as object was not found", data);
                console.error("Consider using getRowId to help the Grid find matching row data");
                return null;
            }
        }
        return rowNode || null;
    };
    ClientSideNodeManager.prototype.createNode = function (dataItem, parent, level) {
        var node = new core_1.RowNode(this.beans);
        node.group = false;
        this.setMasterForRow(node, dataItem, level, true);
        if (parent && !this.suppressParentsInRowNodes) {
            node.parent = parent;
        }
        node.level = level;
        node.setDataAndId(dataItem, this.nextId.toString());
        if (this.allNodesMap[node.id]) {
            console.warn("AG Grid: duplicate node id '" + node.id + "' detected from getRowId callback, this could cause issues in your grid.");
        }
        this.allNodesMap[node.id] = node;
        this.nextId++;
        return node;
    };
    ClientSideNodeManager.prototype.setMasterForRow = function (rowNode, data, level, setExpanded) {
        if (this.doingTreeData) {
            rowNode.setMaster(false);
            if (setExpanded) {
                rowNode.expanded = false;
            }
        }
        else {
            // this is the default, for when doing grid data
            if (this.doingMasterDetail) {
                // if we are doing master detail, then the
                // default is that everything can be a Master Row.
                if (this.isRowMasterFunc) {
                    rowNode.setMaster(this.isRowMasterFunc(data));
                }
                else {
                    rowNode.setMaster(true);
                }
            }
            else {
                rowNode.setMaster(false);
            }
            if (setExpanded) {
                var rowGroupColumns = this.columnModel.getRowGroupColumns();
                var numRowGroupColumns = rowGroupColumns ? rowGroupColumns.length : 0;
                // need to take row group into account when determining level
                var masterRowLevel = level + numRowGroupColumns;
                rowNode.expanded = rowNode.master ? this.isExpanded(masterRowLevel) : false;
            }
        }
    };
    ClientSideNodeManager.prototype.isExpanded = function (level) {
        var expandByDefault = this.gridOptionsService.getNum('groupDefaultExpanded');
        if (expandByDefault === -1) {
            return true;
        }
        return level < expandByDefault;
    };
    ClientSideNodeManager.TOP_LEVEL = 0;
    ClientSideNodeManager.ROOT_NODE_ID = 'ROOT_NODE_ID';
    return ClientSideNodeManager;
}());
exports.ClientSideNodeManager = ClientSideNodeManager;
