/**
 * @ag-grid-community/client-side-row-model - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components * @version v26.0.0
 * @link http://www.ag-grid.com/
' * @license MIT
 */

import { _, Events, RowNode, ClientSideRowModelSteps, GridOptionsWrapper, Constants, RowHighlightPosition, ChangedPath, Autowired, Optional, PostConstruct, Bean, BeanStub, ModuleNames } from '@ag-grid-community/core';

var __spreadArrays = (undefined && undefined.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var ClientSideNodeManager = /** @class */ (function () {
    function ClientSideNodeManager(rootNode, gridOptionsWrapper, context, eventService, columnModel, gridApi, columnApi, selectionService) {
        this.nextId = 0;
        // when user is provide the id's, we also keep a map of ids to row nodes for convenience
        this.allNodesMap = {};
        this.rootNode = rootNode;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.context = context;
        this.eventService = eventService;
        this.columnModel = columnModel;
        this.gridApi = gridApi;
        this.columnApi = columnApi;
        this.selectionService = selectionService;
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
        this.suppressParentsInRowNodes = this.gridOptionsWrapper.isSuppressParentsInRowNodes();
        this.isRowMasterFunc = this.gridOptionsWrapper.getIsRowMasterFunc();
        this.doingTreeData = this.gridOptionsWrapper.isTreeData();
        this.doingMasterDetail = this.gridOptionsWrapper.isMasterDetail();
    };
    ClientSideNodeManager.prototype.getCopyOfNodesMap = function () {
        return _.cloneObject(this.allNodesMap);
    };
    ClientSideNodeManager.prototype.getRowNode = function (id) {
        return this.allNodesMap[id];
    };
    ClientSideNodeManager.prototype.setRowData = function (rowData) {
        this.rootNode.childrenAfterFilter = null;
        this.rootNode.childrenAfterGroup = null;
        this.rootNode.childrenAfterSort = null;
        this.rootNode.childrenMapped = null;
        this.rootNode.updateHasChildren();
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
        this.rootNode.allLeafChildren = this.recursiveFunction(rowData, this.rootNode, ClientSideNodeManager.TOP_LEVEL);
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
        this.updateSelection(nodesToUnselect);
        if (rowNodeOrder) {
            _.sortRowNodesByOrder(this.rootNode.allLeafChildren, rowNodeOrder);
        }
        return rowNodeTransaction;
    };
    ClientSideNodeManager.prototype.updateSelection = function (nodesToUnselect) {
        var selectionChanged = nodesToUnselect.length > 0;
        if (selectionChanged) {
            nodesToUnselect.forEach(function (rowNode) {
                rowNode.setSelected(false, false, true);
            });
        }
        // we do this regardless of nodes to unselect or not, as it's possible
        // a new node was inserted, so a parent that was previously selected (as all
        // children were selected) should not be tri-state (as new one unselected against
        // all other selected children).
        this.selectionService.updateGroupsFromChildrenSelections();
        if (selectionChanged) {
            var event_1 = {
                type: Events.EVENT_SELECTION_CHANGED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    ClientSideNodeManager.prototype.executeAdd = function (rowDataTran, rowNodeTransaction) {
        var _this = this;
        var add = rowDataTran.add, addIndex = rowDataTran.addIndex;
        if (_.missingOrEmpty(add)) {
            return;
        }
        // create new row nodes for each data item
        var newNodes = add.map(function (item) { return _this.createNode(item, _this.rootNode, ClientSideNodeManager.TOP_LEVEL); });
        // add new row nodes to the root nodes 'allLeafChildren'
        var useIndex = typeof addIndex === 'number' && addIndex >= 0;
        if (useIndex) {
            // new rows are inserted in one go by concatenating them in between the existing rows at the desired index.
            // this is much faster than splicing them individually into 'allLeafChildren' when there are large inserts.
            var existingLeafChildren = this.rootNode.allLeafChildren;
            var nodesBeforeIndex = existingLeafChildren.slice(0, addIndex);
            var nodesAfterIndex = existingLeafChildren.slice(addIndex, existingLeafChildren.length);
            this.rootNode.allLeafChildren = __spreadArrays(nodesBeforeIndex, newNodes, nodesAfterIndex);
        }
        else {
            this.rootNode.allLeafChildren = __spreadArrays(this.rootNode.allLeafChildren, newNodes);
        }
        // add new row nodes to the transaction add items
        rowNodeTransaction.add = newNodes;
    };
    ClientSideNodeManager.prototype.executeRemove = function (rowDataTran, rowNodeTransaction, nodesToUnselect) {
        var _this = this;
        var remove = rowDataTran.remove;
        if (_.missingOrEmpty(remove)) {
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
    };
    ClientSideNodeManager.prototype.executeUpdate = function (rowDataTran, rowNodeTransaction, nodesToUnselect) {
        var _this = this;
        var update = rowDataTran.update;
        if (_.missingOrEmpty(update)) {
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
        var rowNodeIdFunc = this.gridOptionsWrapper.getRowNodeIdFunc();
        var rowNode;
        if (_.exists(rowNodeIdFunc)) {
            // find rowNode using id
            var id = rowNodeIdFunc(data);
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                console.error("AG Grid: could not find row id=" + id + ", data item was not found for this id");
                return null;
            }
        }
        else {
            // find rowNode using object references
            rowNode = _.find(this.rootNode.allLeafChildren, function (node) { return node.data === data; });
            if (!rowNode) {
                console.error("AG Grid: could not find data item as object was not found", data);
                console.error("Consider using getRowNodeId to help the Grid find matching row data");
                return null;
            }
        }
        return rowNode;
    };
    ClientSideNodeManager.prototype.recursiveFunction = function (rowData, parent, level) {
        var _this = this;
        // make sure the rowData is an array and not a string of json - this was a commonly reported problem on the forum
        if (typeof rowData === 'string') {
            console.warn('AG Grid: rowData must be an array, however you passed in a string. If you are loading JSON, make sure you convert the JSON string to JavaScript objects first');
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
        var node = new RowNode();
        this.context.createBean(node);
        node.group = false;
        this.setMasterForRow(node, dataItem, level, true);
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
        var expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
        if (expandByDefault === -1) {
            return true;
        }
        return level < expandByDefault;
    };
    ClientSideNodeManager.TOP_LEVEL = 0;
    ClientSideNodeManager.ROOT_NODE_ID = 'ROOT_NODE_ID';
    return ClientSideNodeManager;
}());

var __extends = (undefined && undefined.__extends) || (function () {
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
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RecursionType;
(function (RecursionType) {
    RecursionType[RecursionType["Normal"] = 0] = "Normal";
    RecursionType[RecursionType["AfterFilter"] = 1] = "AfterFilter";
    RecursionType[RecursionType["AfterFilterAndSort"] = 2] = "AfterFilterAndSort";
    RecursionType[RecursionType["PivotNodes"] = 3] = "PivotNodes";
})(RecursionType || (RecursionType = {}));
var ClientSideRowModel = /** @class */ (function (_super) {
    __extends(ClientSideRowModel, _super);
    function ClientSideRowModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClientSideRowModel.prototype.init = function () {
        var refreshEverythingFunc = this.refreshModel.bind(this, { step: ClientSideRowModelSteps.EVERYTHING });
        var refreshEverythingAfterColsChangedFunc = this.refreshModel.bind(this, {
            step: ClientSideRowModelSteps.EVERYTHING,
            afterColumnsChanged: true,
            keepRenderedRows: true,
            animate: true
        });
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refreshEverythingAfterColsChangedFunc);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, refreshEverythingFunc);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.refreshModel.bind(this, { step: ClientSideRowModelSteps.PIVOT }));
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, refreshEverythingFunc);
        var refreshMapListener = this.refreshModel.bind(this, {
            step: ClientSideRowModelSteps.MAP,
            keepRenderedRows: true,
            animate: true
        });
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_GROUP_REMOVE_SINGLE_CHILDREN, refreshMapListener);
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_GROUP_REMOVE_LOWEST_SINGLE_CHILDREN, refreshMapListener);
        this.rootNode = new RowNode();
        this.nodeManager = new ClientSideNodeManager(this.rootNode, this.gridOptionsWrapper, this.getContext(), this.eventService, this.columnModel, this.gridApi, this.columnApi, this.selectionService);
        this.createBean(this.rootNode);
    };
    ClientSideRowModel.prototype.start = function () {
        var rowData = this.gridOptionsWrapper.getRowData();
        if (rowData) {
            this.setRowData(rowData);
        }
    };
    ClientSideRowModel.prototype.ensureRowHeightsValid = function (startPixel, endPixel, startLimitIndex, endLimitIndex) {
        var atLeastOneChange;
        var res = false;
        // we do this multiple times as changing the row heights can also change the first and last rows,
        // so the first pass can make lots of rows smaller, which means the second pass we end up changing
        // more rows.
        do {
            atLeastOneChange = false;
            var rowAtStartPixel = this.getRowIndexAtPixel(startPixel);
            var rowAtEndPixel = this.getRowIndexAtPixel(endPixel);
            // keep check to current page if doing pagination
            var firstRow = Math.max(rowAtStartPixel, startLimitIndex);
            var lastRow = Math.min(rowAtEndPixel, endLimitIndex);
            for (var rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
                var rowNode = this.getRow(rowIndex);
                if (rowNode.rowHeightEstimated) {
                    var rowHeight = this.gridOptionsWrapper.getRowHeightForNode(rowNode);
                    rowNode.setRowHeight(rowHeight.height);
                    atLeastOneChange = true;
                    res = true;
                }
            }
            if (atLeastOneChange) {
                this.setRowTopAndRowIndex();
            }
        } while (atLeastOneChange);
        return res;
    };
    ClientSideRowModel.prototype.setRowTopAndRowIndex = function () {
        var nextRowTop = 0;
        for (var i = 0; i < this.rowsToDisplay.length; i++) {
            // we don't estimate if doing fullHeight or autoHeight, as all rows get rendered all the time
            // with these two layouts.
            var allowEstimate = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_NORMAL;
            var rowNode = this.rowsToDisplay[i];
            if (_.missing(rowNode.rowHeight)) {
                var rowHeight = this.gridOptionsWrapper.getRowHeightForNode(rowNode, allowEstimate);
                rowNode.setRowHeight(rowHeight.height, rowHeight.estimated);
            }
            rowNode.setRowTop(nextRowTop);
            rowNode.setRowIndex(i);
            nextRowTop += rowNode.rowHeight;
        }
    };
    ClientSideRowModel.prototype.clearRowTopAndRowIndex = function (changedPath) {
        var displayedRowsMapped = {};
        this.rowsToDisplay.forEach(function (rowNode) {
            if (rowNode.id != null) {
                displayedRowsMapped[rowNode.id] = rowNode;
            }
        });
        var clearIfNotDisplayed = function (rowNode) {
            if (rowNode && rowNode.id != null && displayedRowsMapped[rowNode.id] == null) {
                rowNode.clearRowTopAndRowIndex();
            }
        };
        var recurse = function (rowNode) {
            clearIfNotDisplayed(rowNode);
            clearIfNotDisplayed(rowNode.detailNode);
            clearIfNotDisplayed(rowNode.sibling);
            if (rowNode.hasChildren()) {
                if (rowNode.childrenAfterGroup) {
                    // if a changedPath is active, it means we are here because of a transaction update or
                    // a change detection. neither of these impacts the open/closed state of groups. so if
                    // a group is not open this time, it was not open last time. so we know all closed groups
                    // already have their top positions cleared. so there is no need to traverse all the way
                    // when changedPath is active and the rowNode is not expanded.
                    var isRootNode = rowNode.level == -1; // we need to give special consideration for root node,
                    // as expanded=undefined for root node
                    var skipChildren = changedPath.isActive() && !isRootNode && !rowNode.expanded;
                    if (!skipChildren) {
                        rowNode.childrenAfterGroup.forEach(recurse);
                    }
                }
            }
        };
        recurse(this.rootNode);
    };
    // returns false if row was moved, otherwise true
    ClientSideRowModel.prototype.ensureRowsAtPixel = function (rowNodes, pixel, increment) {
        var _this = this;
        if (increment === void 0) { increment = 0; }
        var indexAtPixelNow = this.getRowIndexAtPixel(pixel);
        var rowNodeAtPixelNow = this.getRow(indexAtPixelNow);
        if (rowNodeAtPixelNow === rowNodes[0]) {
            return false;
        }
        rowNodes.forEach(function (rowNode) {
            _.removeFromArray(_this.rootNode.allLeafChildren, rowNode);
        });
        rowNodes.forEach(function (rowNode, idx) {
            _.insertIntoArray(_this.rootNode.allLeafChildren, rowNode, Math.max(indexAtPixelNow + increment, 0) + idx);
        });
        this.refreshModel({
            step: ClientSideRowModelSteps.EVERYTHING,
            keepRenderedRows: true,
            animate: true,
            keepEditingRows: true
        });
        return true;
    };
    ClientSideRowModel.prototype.highlightRowAtPixel = function (rowNode, pixel) {
        var indexAtPixelNow = pixel != null ? this.getRowIndexAtPixel(pixel) : null;
        var rowNodeAtPixelNow = indexAtPixelNow != null ? this.getRow(indexAtPixelNow) : null;
        if (!rowNodeAtPixelNow || !rowNode || rowNodeAtPixelNow === rowNode || pixel == null) {
            if (this.lastHighlightedRow) {
                this.lastHighlightedRow.setHighlighted(null);
                this.lastHighlightedRow = null;
            }
            return;
        }
        var highlight = this.getHighlightPosition(pixel, rowNodeAtPixelNow);
        if (this.lastHighlightedRow && this.lastHighlightedRow !== rowNodeAtPixelNow) {
            this.lastHighlightedRow.setHighlighted(null);
            this.lastHighlightedRow = null;
        }
        rowNodeAtPixelNow.setHighlighted(highlight);
        this.lastHighlightedRow = rowNodeAtPixelNow;
    };
    ClientSideRowModel.prototype.getHighlightPosition = function (pixel, rowNode) {
        if (!rowNode) {
            var index = this.getRowIndexAtPixel(pixel);
            rowNode = this.getRow(index || 0);
            if (!rowNode) {
                return RowHighlightPosition.Below;
            }
        }
        var rowTop = rowNode.rowTop, rowHeight = rowNode.rowHeight;
        return pixel - rowTop < rowHeight / 2 ? RowHighlightPosition.Above : RowHighlightPosition.Below;
    };
    ClientSideRowModel.prototype.getLastHighlightedRowNode = function () {
        return this.lastHighlightedRow;
    };
    ClientSideRowModel.prototype.isLastRowIndexKnown = function () {
        return true;
    };
    ClientSideRowModel.prototype.getRowCount = function () {
        if (this.rowsToDisplay) {
            return this.rowsToDisplay.length;
        }
        return 0;
    };
    ClientSideRowModel.prototype.getTopLevelRowCount = function () {
        var showingRootNode = this.rowsToDisplay && this.rowsToDisplay[0] === this.rootNode;
        if (showingRootNode) {
            return 1;
        }
        return this.rootNode.childrenAfterFilter ? this.rootNode.childrenAfterFilter.length : 0;
    };
    ClientSideRowModel.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        var showingRootNode = this.rowsToDisplay && this.rowsToDisplay[0] === this.rootNode;
        if (showingRootNode) {
            return topLevelIndex;
        }
        var rowNode = this.rootNode.childrenAfterSort[topLevelIndex];
        if (this.gridOptionsWrapper.isGroupHideOpenParents()) {
            // if hideOpenParents, and this row open, then this row is now displayed at this index, first child is
            while (rowNode.expanded && rowNode.childrenAfterSort && rowNode.childrenAfterSort.length > 0) {
                rowNode = rowNode.childrenAfterSort[0];
            }
        }
        return rowNode.rowIndex;
    };
    ClientSideRowModel.prototype.getRowBounds = function (index) {
        if (_.missing(this.rowsToDisplay)) {
            return null;
        }
        var rowNode = this.rowsToDisplay[index];
        if (rowNode) {
            return {
                rowTop: rowNode.rowTop,
                rowHeight: rowNode.rowHeight
            };
        }
        return null;
    };
    ClientSideRowModel.prototype.onRowGroupOpened = function () {
        var animate = this.gridOptionsWrapper.isAnimateRows();
        this.refreshModel({ step: ClientSideRowModelSteps.MAP, keepRenderedRows: true, animate: animate });
    };
    ClientSideRowModel.prototype.onFilterChanged = function (event) {
        if (event.afterDataChange) {
            return;
        }
        var animate = this.gridOptionsWrapper.isAnimateRows();
        this.refreshModel({ step: ClientSideRowModelSteps.FILTER, keepRenderedRows: true, animate: animate });
    };
    ClientSideRowModel.prototype.onSortChanged = function () {
        var animate = this.gridOptionsWrapper.isAnimateRows();
        this.refreshModel({ step: ClientSideRowModelSteps.SORT, keepRenderedRows: true, animate: animate, keepEditingRows: true });
    };
    ClientSideRowModel.prototype.getType = function () {
        return Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
    };
    ClientSideRowModel.prototype.onValueChanged = function () {
        if (this.columnModel.isPivotActive()) {
            this.refreshModel({ step: ClientSideRowModelSteps.PIVOT });
        }
        else {
            this.refreshModel({ step: ClientSideRowModelSteps.AGGREGATE });
        }
    };
    ClientSideRowModel.prototype.createChangePath = function (rowNodeTransactions) {
        // for updates, if the row is updated at all, then we re-calc all the values
        // in that row. we could compare each value to each old value, however if we
        // did this, we would be calling the valueService twice, once on the old value
        // and once on the new value. so it's less valueGetter calls if we just assume
        // each column is different. that way the changedPath is used so that only
        // the impacted parent rows are recalculated, parents who's children have
        // not changed are not impacted.
        var noTransactions = _.missingOrEmpty(rowNodeTransactions);
        var changedPath = new ChangedPath(false, this.rootNode);
        if (noTransactions || this.gridOptionsWrapper.isTreeData()) {
            changedPath.setInactive();
        }
        return changedPath;
    };
    ClientSideRowModel.prototype.isSuppressModelUpdateAfterUpdateTransaction = function (params) {
        if (!this.gridOptionsWrapper.isSuppressModelUpdateAfterUpdateTransaction()) {
            return false;
        }
        // return true if we are only doing update transactions
        if (params.rowNodeTransactions == null) {
            return false;
        }
        var transWithAddsOrDeletes = _.filter(params.rowNodeTransactions, function (tx) {
            return (tx.add != null && tx.add.length > 0) || (tx.remove != null && tx.remove.length > 0);
        });
        var transactionsContainUpdatesOnly = transWithAddsOrDeletes == null || transWithAddsOrDeletes.length == 0;
        return transactionsContainUpdatesOnly;
    };
    ClientSideRowModel.prototype.refreshModel = function (params) {
        var _this = this;
        if (this.isSuppressModelUpdateAfterUpdateTransaction(params)) {
            return;
        }
        // this goes through the pipeline of stages. what's in my head is similar
        // to the diagram on this page:
        // http://commons.apache.org/sandbox/commons-pipeline/pipeline_basics.html
        // however we want to keep the results of each stage, hence we manually call
        // each step rather than have them chain each other.
        // fallthrough in below switch is on purpose,
        // eg if STEP_FILTER, then all steps below this
        // step get done
        // let start: number;
        // console.log('======= start =======');
        var changedPath = this.createChangePath(params.rowNodeTransactions);
        switch (params.step) {
            case ClientSideRowModelSteps.EVERYTHING:
                this.doRowGrouping(params.groupState, params.rowNodeTransactions, params.rowNodeOrder, changedPath, !!params.afterColumnsChanged);
            case ClientSideRowModelSteps.FILTER:
                this.doFilter(changedPath);
            case ClientSideRowModelSteps.PIVOT:
                this.doPivot(changedPath);
            case ClientSideRowModelSteps.AGGREGATE: // depends on agg fields
                this.doAggregate(changedPath);
            case ClientSideRowModelSteps.SORT:
                this.doSort(params.rowNodeTransactions, changedPath);
            case ClientSideRowModelSteps.MAP:
                this.doRowsToDisplay();
        }
        // set all row tops to null, then set row tops on all visible rows. if we don't
        // do this, then the algorithm below only sets row tops, old row tops from old rows
        // will still lie around
        this.setRowTopAndRowIndex();
        this.clearRowTopAndRowIndex(changedPath);
        var event = {
            type: Events.EVENT_MODEL_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi,
            animate: params.animate,
            keepRenderedRows: params.keepRenderedRows,
            newData: params.newData,
            newPage: false
        };
        this.eventService.dispatchEvent(event);
        if (this.$scope) {
            window.setTimeout(function () {
                _this.$scope.$apply();
            }, 0);
        }
    };
    ClientSideRowModel.prototype.isEmpty = function () {
        var rowsMissing = _.missing(this.rootNode.allLeafChildren) || this.rootNode.allLeafChildren.length === 0;
        return _.missing(this.rootNode) || rowsMissing || !this.columnModel.isReady();
    };
    ClientSideRowModel.prototype.isRowsToRender = function () {
        return _.exists(this.rowsToDisplay) && this.rowsToDisplay.length > 0;
    };
    ClientSideRowModel.prototype.getNodesInRangeForSelection = function (firstInRange, lastInRange) {
        // if lastSelectedNode is missing, we start at the first row
        var firstRowHit = !lastInRange;
        var lastRowHit = false;
        var lastRow;
        var result = [];
        var groupsSelectChildren = this.gridOptionsWrapper.isGroupSelectsChildren();
        this.forEachNodeAfterFilterAndSort(function (rowNode) {
            var lookingForLastRow = firstRowHit && !lastRowHit;
            // check if we need to flip the select switch
            if (!firstRowHit) {
                if (rowNode === lastInRange || rowNode === firstInRange) {
                    firstRowHit = true;
                }
            }
            var skipThisGroupNode = rowNode.group && groupsSelectChildren;
            if (!skipThisGroupNode) {
                var inRange = firstRowHit && !lastRowHit;
                var childOfLastRow = rowNode.isParentOfNode(lastRow);
                if (inRange || childOfLastRow) {
                    result.push(rowNode);
                }
            }
            if (lookingForLastRow) {
                if (rowNode === lastInRange || rowNode === firstInRange) {
                    lastRowHit = true;
                    if (rowNode === lastInRange) {
                        lastRow = lastInRange;
                    }
                    else {
                        lastRow = firstInRange;
                    }
                }
            }
        });
        return result;
    };
    ClientSideRowModel.prototype.setDatasource = function (datasource) {
        console.error('AG Grid: should never call setDatasource on clientSideRowController');
    };
    ClientSideRowModel.prototype.getTopLevelNodes = function () {
        return this.rootNode ? this.rootNode.childrenAfterGroup : null;
    };
    ClientSideRowModel.prototype.getRootNode = function () {
        return this.rootNode;
    };
    ClientSideRowModel.prototype.getRow = function (index) {
        return this.rowsToDisplay[index];
    };
    ClientSideRowModel.prototype.isRowPresent = function (rowNode) {
        return this.rowsToDisplay.indexOf(rowNode) >= 0;
    };
    ClientSideRowModel.prototype.getRowIndexAtPixel = function (pixelToMatch) {
        if (this.isEmpty()) {
            return -1;
        }
        // do binary search of tree
        // http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/
        var bottomPointer = 0;
        var topPointer = this.rowsToDisplay.length - 1;
        // quick check, if the pixel is out of bounds, then return last row
        if (pixelToMatch <= 0) {
            // if pixel is less than or equal zero, it's always the first row
            return 0;
        }
        var lastNode = _.last(this.rowsToDisplay);
        if (lastNode.rowTop <= pixelToMatch) {
            return this.rowsToDisplay.length - 1;
        }
        while (true) {
            var midPointer = Math.floor((bottomPointer + topPointer) / 2);
            var currentRowNode = this.rowsToDisplay[midPointer];
            if (this.isRowInPixel(currentRowNode, pixelToMatch)) {
                return midPointer;
            }
            if (currentRowNode.rowTop < pixelToMatch) {
                bottomPointer = midPointer + 1;
            }
            else if (currentRowNode.rowTop > pixelToMatch) {
                topPointer = midPointer - 1;
            }
        }
    };
    ClientSideRowModel.prototype.isRowInPixel = function (rowNode, pixelToMatch) {
        var topPixel = rowNode.rowTop;
        var bottomPixel = rowNode.rowTop + rowNode.rowHeight;
        var pixelInRow = topPixel <= pixelToMatch && bottomPixel > pixelToMatch;
        return pixelInRow;
    };
    ClientSideRowModel.prototype.forEachLeafNode = function (callback) {
        if (this.rootNode.allLeafChildren) {
            this.rootNode.allLeafChildren.forEach(function (rowNode, index) { return callback(rowNode, index); });
        }
    };
    ClientSideRowModel.prototype.forEachNode = function (callback) {
        this.recursivelyWalkNodesAndCallback(this.rootNode.childrenAfterGroup, callback, RecursionType.Normal, 0);
    };
    ClientSideRowModel.prototype.forEachNodeAfterFilter = function (callback) {
        this.recursivelyWalkNodesAndCallback(this.rootNode.childrenAfterFilter, callback, RecursionType.AfterFilter, 0);
    };
    ClientSideRowModel.prototype.forEachNodeAfterFilterAndSort = function (callback) {
        this.recursivelyWalkNodesAndCallback(this.rootNode.childrenAfterSort, callback, RecursionType.AfterFilterAndSort, 0);
    };
    ClientSideRowModel.prototype.forEachPivotNode = function (callback) {
        this.recursivelyWalkNodesAndCallback([this.rootNode], callback, RecursionType.PivotNodes, 0);
    };
    // iterates through each item in memory, and calls the callback function
    // nodes - the rowNodes to traverse
    // callback - the user provided callback
    // recursion type - need this to know what child nodes to recurse, eg if looking at all nodes, or filtered notes etc
    // index - works similar to the index in forEach in javascript's array function
    ClientSideRowModel.prototype.recursivelyWalkNodesAndCallback = function (nodes, callback, recursionType, index) {
        if (!nodes) {
            return index;
        }
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            callback(node, index++);
            // go to the next level if it is a group
            if (node.hasChildren()) {
                // depending on the recursion type, we pick a difference set of children
                var nodeChildren = null;
                switch (recursionType) {
                    case RecursionType.Normal:
                        nodeChildren = node.childrenAfterGroup;
                        break;
                    case RecursionType.AfterFilter:
                        nodeChildren = node.childrenAfterFilter;
                        break;
                    case RecursionType.AfterFilterAndSort:
                        nodeChildren = node.childrenAfterSort;
                        break;
                    case RecursionType.PivotNodes:
                        // for pivot, we don't go below leafGroup levels
                        nodeChildren = !node.leafGroup ? node.childrenAfterSort : null;
                        break;
                }
                if (nodeChildren) {
                    index = this.recursivelyWalkNodesAndCallback(nodeChildren, callback, recursionType, index);
                }
            }
        }
        return index;
    };
    // it's possible to recompute the aggregate without doing the other parts
    // + gridApi.recomputeAggregates()
    ClientSideRowModel.prototype.doAggregate = function (changedPath) {
        if (this.aggregationStage) {
            this.aggregationStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
        }
    };
    // + gridApi.expandAll()
    // + gridApi.collapseAll()
    ClientSideRowModel.prototype.expandOrCollapseAll = function (expand) {
        var usingTreeData = this.gridOptionsWrapper.isTreeData();
        if (this.rootNode) {
            recursiveExpandOrCollapse(this.rootNode.childrenAfterGroup);
        }
        function recursiveExpandOrCollapse(rowNodes) {
            if (!rowNodes) {
                return;
            }
            rowNodes.forEach(function (rowNode) {
                var shouldExpandOrCollapse = usingTreeData ? _.exists(rowNode.childrenAfterGroup) : rowNode.group;
                if (shouldExpandOrCollapse) {
                    rowNode.expanded = expand;
                    recursiveExpandOrCollapse(rowNode.childrenAfterGroup);
                }
            });
        }
        this.refreshModel({ step: ClientSideRowModelSteps.MAP });
        var eventSource = expand ? 'expandAll' : 'collapseAll';
        var event = {
            api: this.gridApi,
            columnApi: this.columnApi,
            type: Events.EVENT_EXPAND_COLLAPSE_ALL,
            source: eventSource
        };
        this.eventService.dispatchEvent(event);
    };
    ClientSideRowModel.prototype.doSort = function (rowNodeTransactions, changedPath) {
        this.sortStage.execute({
            rowNode: this.rootNode,
            rowNodeTransactions: rowNodeTransactions,
            changedPath: changedPath
        });
    };
    ClientSideRowModel.prototype.doRowGrouping = function (groupState, rowNodeTransactions, rowNodeOrder, changedPath, afterColumnsChanged) {
        if (this.groupStage) {
            if (rowNodeTransactions) {
                this.groupStage.execute({
                    rowNode: this.rootNode,
                    rowNodeTransactions: rowNodeTransactions,
                    rowNodeOrder: rowNodeOrder,
                    changedPath: changedPath
                });
            }
            else {
                // groups are about to get disposed, so need to deselect any that are selected
                this.selectionService.removeGroupsFromSelection();
                this.groupStage.execute({
                    rowNode: this.rootNode,
                    changedPath: changedPath,
                    afterColumnsChanged: afterColumnsChanged
                });
                // set open/closed state on groups
                this.restoreGroupState(groupState);
            }
            if (this.gridOptionsWrapper.isGroupSelectsChildren()) {
                this.selectionService.updateGroupsFromChildrenSelections(changedPath);
            }
        }
        else {
            this.rootNode.childrenAfterGroup = this.rootNode.allLeafChildren;
            this.rootNode.updateHasChildren();
        }
    };
    ClientSideRowModel.prototype.restoreGroupState = function (groupState) {
        if (!groupState) {
            return;
        }
        _.traverseNodesWithKey(this.rootNode.childrenAfterGroup, function (node, key) {
            // if the group was open last time, then open it this time. however
            // if was not open last time, then don't touch the group, so the 'groupDefaultExpanded'
            // setting will take effect.
            if (typeof groupState[key] === 'boolean') {
                node.expanded = groupState[key];
            }
        });
    };
    ClientSideRowModel.prototype.doFilter = function (changedPath) {
        this.filterStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
    };
    ClientSideRowModel.prototype.doPivot = function (changedPath) {
        if (this.pivotStage) {
            this.pivotStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
        }
    };
    ClientSideRowModel.prototype.getGroupState = function () {
        if (!this.rootNode.childrenAfterGroup || !this.gridOptionsWrapper.isRememberGroupStateWhenNewData()) {
            return null;
        }
        var result = {};
        _.traverseNodesWithKey(this.rootNode.childrenAfterGroup, function (node, key) { return result[key] = node.expanded; });
        return result;
    };
    ClientSideRowModel.prototype.getCopyOfNodesMap = function () {
        return this.nodeManager.getCopyOfNodesMap();
    };
    ClientSideRowModel.prototype.getRowNode = function (id) {
        // although id is typed a string, this could be called by the user, and they could have passed a number
        var idIsGroup = typeof id == 'string' && id.indexOf(RowNode.ID_PREFIX_ROW_GROUP) == 0;
        if (idIsGroup) {
            // only one users complained about getRowNode not working for groups, after years of
            // this working for normal rows. so have done quick implementation. if users complain
            // about performance, then GroupStage should store / manage created groups in a map,
            // which is a chunk of work.
            var res_1 = undefined;
            this.forEachNode(function (node) {
                if (node.id === id) {
                    res_1 = node;
                }
            });
            return res_1;
        }
        else {
            return this.nodeManager.getRowNode(id);
        }
    };
    // rows: the rows to put into the model
    ClientSideRowModel.prototype.setRowData = function (rowData) {
        // no need to invalidate cache, as the cache is stored on the rowNode,
        // so new rowNodes means the cache is wiped anyway.
        // remember group state, so we can expand groups that should be expanded
        var groupState = this.getGroupState();
        this.nodeManager.setRowData(rowData);
        // this event kicks off:
        // - clears selection
        // - updates filters
        // - shows 'no rows' overlay if needed
        var rowDataChangedEvent = {
            type: Events.EVENT_ROW_DATA_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(rowDataChangedEvent);
        this.refreshModel({
            step: ClientSideRowModelSteps.EVERYTHING,
            groupState: groupState,
            newData: true
        });
    };
    ClientSideRowModel.prototype.batchUpdateRowData = function (rowDataTransaction, callback) {
        var _this = this;
        if (this.applyAsyncTransactionsTimeout == null) {
            this.rowDataTransactionBatch = [];
            var waitMillis = this.gridOptionsWrapper.getAsyncTransactionWaitMillis();
            this.applyAsyncTransactionsTimeout = window.setTimeout(function () {
                _this.executeBatchUpdateRowData();
            }, waitMillis);
        }
        this.rowDataTransactionBatch.push({ rowDataTransaction: rowDataTransaction, callback: callback });
    };
    ClientSideRowModel.prototype.flushAsyncTransactions = function () {
        if (this.applyAsyncTransactionsTimeout != null) {
            clearTimeout(this.applyAsyncTransactionsTimeout);
            this.executeBatchUpdateRowData();
        }
    };
    ClientSideRowModel.prototype.executeBatchUpdateRowData = function () {
        var _this = this;
        this.valueCache.onDataChanged();
        var callbackFuncsBound = [];
        var rowNodeTrans = [];
        // The rowGroup stage uses rowNodeOrder if order was provided. if we didn't pass 'true' to
        // commonUpdateRowData, using addIndex would have no effect when grouping.
        var forceRowNodeOrder = false;
        if (this.rowDataTransactionBatch) {
            this.rowDataTransactionBatch.forEach(function (tranItem) {
                var rowNodeTran = _this.nodeManager.updateRowData(tranItem.rowDataTransaction, undefined);
                rowNodeTrans.push(rowNodeTran);
                if (tranItem.callback) {
                    callbackFuncsBound.push(tranItem.callback.bind(null, rowNodeTran));
                }
                if (typeof tranItem.rowDataTransaction.addIndex === 'number') {
                    forceRowNodeOrder = true;
                }
            });
        }
        this.commonUpdateRowData(rowNodeTrans, undefined, forceRowNodeOrder);
        // do callbacks in next VM turn so it's async
        if (callbackFuncsBound.length > 0) {
            window.setTimeout(function () {
                callbackFuncsBound.forEach(function (func) { return func(); });
            }, 0);
        }
        if (rowNodeTrans.length > 0) {
            var event_1 = {
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                type: Events.EVENT_ASYNC_TRANSACTIONS_FLUSHED,
                results: rowNodeTrans
            };
            this.eventService.dispatchEvent(event_1);
        }
        this.rowDataTransactionBatch = null;
        this.applyAsyncTransactionsTimeout = undefined;
    };
    ClientSideRowModel.prototype.updateRowData = function (rowDataTran, rowNodeOrder) {
        this.valueCache.onDataChanged();
        var rowNodeTran = this.nodeManager.updateRowData(rowDataTran, rowNodeOrder);
        // if doing immutableData, addIndex is never present. however if doing standard transaction, and user
        // provided addIndex, then this is used in updateRowData. However if doing Enterprise, then the rowGroup
        // stage also uses the
        var forceRowNodeOrder = typeof rowDataTran.addIndex === 'number';
        this.commonUpdateRowData([rowNodeTran], rowNodeOrder, forceRowNodeOrder);
        return rowNodeTran;
    };
    ClientSideRowModel.prototype.createRowNodeOrder = function () {
        var suppressSortOrder = this.gridOptionsWrapper.isSuppressMaintainUnsortedOrder();
        if (suppressSortOrder) {
            return;
        }
        var orderMap = {};
        if (this.rootNode && this.rootNode.allLeafChildren) {
            for (var index = 0; index < this.rootNode.allLeafChildren.length; index++) {
                var node = this.rootNode.allLeafChildren[index];
                orderMap[node.id] = index;
            }
        }
        return orderMap;
    };
    // common to updateRowData and batchUpdateRowData
    ClientSideRowModel.prototype.commonUpdateRowData = function (rowNodeTrans, rowNodeOrder, forceRowNodeOrder) {
        if (forceRowNodeOrder) {
            rowNodeOrder = this.createRowNodeOrder();
        }
        this.refreshModel({
            step: ClientSideRowModelSteps.EVERYTHING,
            rowNodeTransactions: rowNodeTrans,
            rowNodeOrder: rowNodeOrder,
            keepRenderedRows: true,
            animate: true,
            keepEditingRows: true
        });
        var event = {
            type: Events.EVENT_ROW_DATA_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    };
    ClientSideRowModel.prototype.doRowsToDisplay = function () {
        this.rowsToDisplay = this.flattenStage.execute({ rowNode: this.rootNode });
    };
    ClientSideRowModel.prototype.onRowHeightChanged = function () {
        this.refreshModel({ step: ClientSideRowModelSteps.MAP, keepRenderedRows: true, keepEditingRows: true });
    };
    ClientSideRowModel.prototype.resetRowHeights = function () {
        var atLeastOne = false;
        this.forEachNode(function (rowNode) {
            rowNode.setRowHeight(rowNode.rowHeight, true);
            // we keep the height each row is at, however we set estimated=true rather than clear the height.
            // this means the grid will not reset the row heights back to defaults, rather it will re-calc
            // the height for each row as the row is displayed. otherwise the scroll will jump when heights are reset.
            var detailNode = rowNode.detailNode;
            if (detailNode) {
                detailNode.setRowHeight(detailNode.rowHeight, true);
            }
            atLeastOne = true;
        });
        if (atLeastOne) {
            this.onRowHeightChanged();
        }
    };
    __decorate([
        Autowired('columnModel')
    ], ClientSideRowModel.prototype, "columnModel", void 0);
    __decorate([
        Autowired('$scope')
    ], ClientSideRowModel.prototype, "$scope", void 0);
    __decorate([
        Autowired('selectionService')
    ], ClientSideRowModel.prototype, "selectionService", void 0);
    __decorate([
        Autowired('valueCache')
    ], ClientSideRowModel.prototype, "valueCache", void 0);
    __decorate([
        Autowired('columnApi')
    ], ClientSideRowModel.prototype, "columnApi", void 0);
    __decorate([
        Autowired('gridApi')
    ], ClientSideRowModel.prototype, "gridApi", void 0);
    __decorate([
        Autowired('animationFrameService')
    ], ClientSideRowModel.prototype, "animationFrameService", void 0);
    __decorate([
        Autowired('filterStage')
    ], ClientSideRowModel.prototype, "filterStage", void 0);
    __decorate([
        Autowired('sortStage')
    ], ClientSideRowModel.prototype, "sortStage", void 0);
    __decorate([
        Autowired('flattenStage')
    ], ClientSideRowModel.prototype, "flattenStage", void 0);
    __decorate([
        Optional('groupStage')
    ], ClientSideRowModel.prototype, "groupStage", void 0);
    __decorate([
        Optional('aggregationStage')
    ], ClientSideRowModel.prototype, "aggregationStage", void 0);
    __decorate([
        Optional('pivotStage')
    ], ClientSideRowModel.prototype, "pivotStage", void 0);
    __decorate([
        PostConstruct
    ], ClientSideRowModel.prototype, "init", null);
    ClientSideRowModel = __decorate([
        Bean('rowModel')
    ], ClientSideRowModel);
    return ClientSideRowModel;
}(BeanStub));

var __extends$1 = (undefined && undefined.__extends) || (function () {
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
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FilterStage = /** @class */ (function (_super) {
    __extends$1(FilterStage, _super);
    function FilterStage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterStage.prototype.execute = function (params) {
        var rowNode = params.rowNode, changedPath = params.changedPath;
        this.filterService.filter(changedPath);
        this.selectableService.updateSelectableAfterFiltering(rowNode);
    };
    __decorate$1([
        Autowired('selectableService')
    ], FilterStage.prototype, "selectableService", void 0);
    __decorate$1([
        Autowired('filterService')
    ], FilterStage.prototype, "filterService", void 0);
    FilterStage = __decorate$1([
        Bean('filterStage')
    ], FilterStage);
    return FilterStage;
}(BeanStub));

var __extends$2 = (undefined && undefined.__extends) || (function () {
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
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SortStage = /** @class */ (function (_super) {
    __extends$2(SortStage, _super);
    function SortStage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SortStage.prototype.execute = function (params) {
        var sortOptions = this.sortController.getSortOptions();
        var sortActive = _.exists(sortOptions) && sortOptions.length > 0;
        var deltaSort = sortActive
            && _.exists(params.rowNodeTransactions)
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            && this.gridOptionsWrapper.isDeltaSort();
        // we only need dirty nodes if doing delta sort
        var dirtyLeafNodes = deltaSort ? this.calculateDirtyNodes(params.rowNodeTransactions) : null;
        var noAggregations = _.missingOrEmpty(this.columnModel.getValueColumns());
        var sortContainsGroupColumns = _.some(sortOptions, function (opt) { return !!opt.column.getColDef().showRowGroup; });
        this.sortService.sort(sortOptions, sortActive, deltaSort, dirtyLeafNodes, params.changedPath, noAggregations, sortContainsGroupColumns);
    };
    SortStage.prototype.calculateDirtyNodes = function (rowNodeTransactions) {
        var dirtyNodes = {};
        var addNodesFunc = function (rowNodes) {
            if (rowNodes) {
                rowNodes.forEach(function (rowNode) { return dirtyNodes[rowNode.id] = true; });
            }
        };
        // all leaf level nodes in the transaction were impacted
        if (rowNodeTransactions) {
            rowNodeTransactions.forEach(function (tran) {
                addNodesFunc(tran.add);
                addNodesFunc(tran.update);
                addNodesFunc(tran.remove);
            });
        }
        return dirtyNodes;
    };
    __decorate$2([
        Autowired('sortService')
    ], SortStage.prototype, "sortService", void 0);
    __decorate$2([
        Autowired('sortController')
    ], SortStage.prototype, "sortController", void 0);
    __decorate$2([
        Autowired('columnModel')
    ], SortStage.prototype, "columnModel", void 0);
    SortStage = __decorate$2([
        Bean('sortStage')
    ], SortStage);
    return SortStage;
}(BeanStub));

var __extends$3 = (undefined && undefined.__extends) || (function () {
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
var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FlattenStage = /** @class */ (function (_super) {
    __extends$3(FlattenStage, _super);
    function FlattenStage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FlattenStage.prototype.execute = function (params) {
        var rootNode = params.rowNode;
        // even if not doing grouping, we do the mapping, as the client might
        // of passed in data that already has a grouping in it somewhere
        var result = [];
        // putting value into a wrapper so it's passed by reference
        var nextRowTop = { value: 0 };
        var skipLeafNodes = this.columnModel.isPivotMode();
        // if we are reducing, and not grouping, then we want to show the root node, as that
        // is where the pivot values are
        var showRootNode = skipLeafNodes && rootNode.leafGroup;
        var topList = showRootNode ? [rootNode] : rootNode.childrenAfterSort;
        this.recursivelyAddToRowsToDisplay(topList, result, nextRowTop, skipLeafNodes, 0);
        // we do not want the footer total if the gris is empty
        var atLeastOneRowPresent = result.length > 0;
        var includeGroupTotalFooter = !showRootNode
            // don't show total footer when showRootNode is true (i.e. in pivot mode and no groups)
            && atLeastOneRowPresent
            && this.gridOptionsWrapper.isGroupIncludeTotalFooter();
        if (includeGroupTotalFooter) {
            this.ensureFooterNodeExists(rootNode);
            this.addRowNodeToRowsToDisplay(rootNode.sibling, result, nextRowTop, 0);
        }
        return result;
    };
    FlattenStage.prototype.recursivelyAddToRowsToDisplay = function (rowsToFlatten, result, nextRowTop, skipLeafNodes, uiLevel) {
        if (_.missingOrEmpty(rowsToFlatten)) {
            return;
        }
        var hideOpenParents = this.gridOptionsWrapper.isGroupHideOpenParents();
        // these two are mutually exclusive, so if first set, we don't set the second
        var groupRemoveSingleChildren = this.gridOptionsWrapper.isGroupRemoveSingleChildren();
        var groupRemoveLowestSingleChildren = !groupRemoveSingleChildren && this.gridOptionsWrapper.isGroupRemoveLowestSingleChildren();
        for (var i = 0; i < rowsToFlatten.length; i++) {
            var rowNode = rowsToFlatten[i];
            // check all these cases, for working out if this row should be included in the final mapped list
            var isParent = rowNode.hasChildren();
            var isSkippedLeafNode = skipLeafNodes && !isParent;
            var isRemovedSingleChildrenGroup = groupRemoveSingleChildren &&
                isParent &&
                rowNode.childrenAfterGroup.length === 1;
            var isRemovedLowestSingleChildrenGroup = groupRemoveLowestSingleChildren &&
                isParent &&
                rowNode.leafGroup &&
                rowNode.childrenAfterGroup.length === 1;
            // hide open parents means when group is open, we don't show it. we also need to make sure the
            // group is expandable in the first place (as leaf groups are not expandable if pivot mode is on).
            // the UI will never allow expanding leaf  groups, however the user might via the API (or menu option 'expand all')
            var neverAllowToExpand = skipLeafNodes && rowNode.leafGroup;
            var isHiddenOpenParent = hideOpenParents && rowNode.expanded && (!neverAllowToExpand);
            var thisRowShouldBeRendered = !isSkippedLeafNode && !isHiddenOpenParent &&
                !isRemovedSingleChildrenGroup && !isRemovedLowestSingleChildrenGroup;
            if (thisRowShouldBeRendered) {
                this.addRowNodeToRowsToDisplay(rowNode, result, nextRowTop, uiLevel);
            }
            // if we are pivoting, we never map below the leaf group
            if (skipLeafNodes && rowNode.leafGroup) {
                continue;
            }
            if (isParent) {
                var excludedParent = isRemovedSingleChildrenGroup || isRemovedLowestSingleChildrenGroup;
                // we traverse the group if it is expended, however we always traverse if the parent node
                // was removed (as the group will never be opened if it is not displayed, we show the children instead)
                if (rowNode.expanded || excludedParent) {
                    // if the parent was excluded, then ui level is that of the parent
                    var uiLevelForChildren = excludedParent ? uiLevel : uiLevel + 1;
                    this.recursivelyAddToRowsToDisplay(rowNode.childrenAfterSort, result, nextRowTop, skipLeafNodes, uiLevelForChildren);
                    // put a footer in if user is looking for it
                    if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
                        this.ensureFooterNodeExists(rowNode);
                        this.addRowNodeToRowsToDisplay(rowNode.sibling, result, nextRowTop, uiLevel);
                    }
                }
            }
            else if (rowNode.master && rowNode.expanded) {
                var detailNode = this.createDetailNode(rowNode);
                this.addRowNodeToRowsToDisplay(detailNode, result, nextRowTop, uiLevel);
            }
        }
    };
    // duplicated method, it's also in floatingRowModel
    FlattenStage.prototype.addRowNodeToRowsToDisplay = function (rowNode, result, nextRowTop, uiLevel) {
        var isGroupMultiAutoColumn = this.gridOptionsWrapper.isGroupMultiAutoColumn();
        result.push(rowNode);
        rowNode.setUiLevel(isGroupMultiAutoColumn ? 0 : uiLevel);
    };
    FlattenStage.prototype.ensureFooterNodeExists = function (groupNode) {
        // only create footer node once, otherwise we have daemons and
        // the animate screws up with the daemons hanging around
        if (_.exists(groupNode.sibling)) {
            return;
        }
        var footerNode = new RowNode();
        this.context.createBean(footerNode);
        Object.keys(groupNode).forEach(function (key) {
            footerNode[key] = groupNode[key];
        });
        footerNode.footer = true;
        footerNode.setRowTop(null);
        footerNode.setRowIndex(null);
        // manually set oldRowTop to null so we discard any
        // previous information about its position.
        footerNode.oldRowTop = null;
        if (_.exists(footerNode.id)) {
            footerNode.id = 'rowGroupFooter_' + footerNode.id;
        }
        // get both header and footer to reference each other as siblings. this is never undone,
        // only overwritten. so if a group is expanded, then contracted, it will have a ghost
        // sibling - but that's fine, as we can ignore this if the header is contracted.
        footerNode.sibling = groupNode;
        groupNode.sibling = footerNode;
    };
    FlattenStage.prototype.createDetailNode = function (masterNode) {
        if (_.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        }
        var detailNode = new RowNode();
        this.context.createBean(detailNode);
        detailNode.detail = true;
        detailNode.selectable = false;
        detailNode.parent = masterNode;
        if (_.exists(masterNode.id)) {
            detailNode.id = 'detail_' + masterNode.id;
        }
        detailNode.data = masterNode.data;
        detailNode.level = masterNode.level + 1;
        masterNode.detailNode = detailNode;
        return detailNode;
    };
    __decorate$3([
        Autowired('columnModel')
    ], FlattenStage.prototype, "columnModel", void 0);
    FlattenStage = __decorate$3([
        Bean('flattenStage')
    ], FlattenStage);
    return FlattenStage;
}(BeanStub));

var __extends$4 = (undefined && undefined.__extends) || (function () {
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
var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SortService = /** @class */ (function (_super) {
    __extends$4(SortService, _super);
    function SortService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SortService.prototype.init = function () {
        this.postSortFunc = this.gridOptionsWrapper.getPostSortFunc();
    };
    SortService.prototype.sort = function (sortOptions, sortActive, deltaSort, dirtyLeafNodes, changedPath, noAggregations, sortContainsGroupColumns) {
        var _this = this;
        var groupMaintainOrder = this.gridOptionsWrapper.isGroupMaintainOrder();
        var callback = function (rowNode) {
            // we clear out the 'pull down open parents' first, as the values mix up the sorting
            _this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterFilter, true);
            // Javascript sort is non deterministic when all the array items are equals, ie Comparator always returns 0,
            // so to ensure the array keeps its order, add an additional sorting condition manually, in this case we
            // are going to inspect the original array position. This is what sortedRowNodes is for.
            if (sortActive) {
                // when 'groupMaintainOrder' is enabled we skip sorting groups unless we are sorting on group columns
                var skipSortingGroups = groupMaintainOrder && !rowNode.leafGroup && !sortContainsGroupColumns;
                if (skipSortingGroups) {
                    rowNode.childrenAfterSort = rowNode.childrenAfterSort.slice(0);
                }
                else {
                    rowNode.childrenAfterSort = deltaSort ?
                        _this.doDeltaSort(rowNode, sortOptions, dirtyLeafNodes, changedPath, noAggregations)
                        : _this.rowNodeSorter.doFullSort(rowNode.childrenAfterFilter, sortOptions);
                }
            }
            else {
                rowNode.childrenAfterSort = groupMaintainOrder && rowNode.childrenAfterSort ?
                    rowNode.childrenAfterSort.slice(0) : rowNode.childrenAfterFilter.slice(0);
            }
            _this.updateChildIndexes(rowNode);
            if (_this.postSortFunc) {
                _this.postSortFunc(rowNode.childrenAfterSort);
            }
        };
        if (changedPath) {
            changedPath.forEachChangedNodeDepthFirst(callback);
        }
        this.updateGroupDataForHideOpenParents(changedPath);
    };
    SortService.prototype.mapNodeToSortedNode = function (rowNode, pos) {
        return { currentPos: pos, rowNode: rowNode };
    };
    SortService.prototype.doDeltaSort = function (rowNode, sortOptions, dirtyLeafNodes, changedPath, noAggregations) {
        // clean nodes will be a list of all row nodes that remain in the set
        // and ordered. we start with the old sorted set and take out any nodes
        // that were removed or changed (but not added, added doesn't make sense,
        // if a node was added, there is no way it could be here from last time).
        var cleanNodes = rowNode.childrenAfterSort
            .filter(function (node) {
            // take out all nodes that were changed as part of the current transaction.
            // a changed node could a) be in a different sort position or b) may
            // no longer be in this set as the changed node may not pass filtering,
            // or be in a different group.
            var passesDirtyNodesCheck = !dirtyLeafNodes[node.id];
            // also remove group nodes in the changed path, as they can have different aggregate
            // values which could impact the sort order.
            // note: changed path is not active if a) no value columns or b) no transactions. it is never
            // (b) in deltaSort as we only do deltaSort for transactions. for (a) if no value columns, then
            // there is no value in the group that could of changed (ie no aggregate values)
            var passesChangedPathCheck = noAggregations || (changedPath && changedPath.canSkip(node));
            return passesDirtyNodesCheck && passesChangedPathCheck;
        })
            .map(this.mapNodeToSortedNode.bind(this));
        // for fast access below, we map them
        var cleanNodesMapped = {};
        cleanNodes.forEach(function (sortedRowNode) { return cleanNodesMapped[sortedRowNode.rowNode.id] = sortedRowNode.rowNode; });
        // these are all nodes that need to be placed
        var changedNodes = rowNode.childrenAfterFilter
            // ignore nodes in the clean list
            .filter(function (node) { return !cleanNodesMapped[node.id]; })
            .map(this.mapNodeToSortedNode.bind(this));
        // sort changed nodes. note that we don't need to sort cleanNodes as they are
        // already sorted from last time.
        changedNodes.sort(this.rowNodeSorter.compareRowNodes.bind(this, sortOptions));
        var result;
        if (changedNodes.length === 0) {
            result = cleanNodes;
        }
        else if (cleanNodes.length === 0) {
            result = changedNodes;
        }
        else {
            result = this.mergeSortedArrays(sortOptions, cleanNodes, changedNodes);
        }
        return result.map(function (item) { return item.rowNode; });
    };
    // Merge two sorted arrays into each other
    SortService.prototype.mergeSortedArrays = function (sortOptions, arr1, arr2) {
        var res = [];
        var i = 0;
        var j = 0;
        // Traverse both array, adding them in order
        while (i < arr1.length && j < arr2.length) {
            // Check if current element of first
            // array is smaller than current element
            // of second array. If yes, store first
            // array element and increment first array
            // index. Otherwise do same with second array
            var compareResult = this.rowNodeSorter.compareRowNodes(sortOptions, arr1[i], arr2[j]);
            if (compareResult < 0) {
                res.push(arr1[i++]);
            }
            else {
                res.push(arr2[j++]);
            }
        }
        // add remaining from arr1
        while (i < arr1.length) {
            res.push(arr1[i++]);
        }
        // add remaining from arr2
        while (j < arr2.length) {
            res.push(arr2[j++]);
        }
        return res;
    };
    SortService.prototype.updateChildIndexes = function (rowNode) {
        if (_.missing(rowNode.childrenAfterSort)) {
            return;
        }
        var listToSort = rowNode.childrenAfterSort;
        for (var i = 0; i < listToSort.length; i++) {
            var child = listToSort[i];
            var firstChild = i === 0;
            var lastChild = i === rowNode.childrenAfterSort.length - 1;
            child.setFirstChild(firstChild);
            child.setLastChild(lastChild);
            child.setChildIndex(i);
        }
    };
    SortService.prototype.updateGroupDataForHideOpenParents = function (changedPath) {
        var _this = this;
        if (!this.gridOptionsWrapper.isGroupHideOpenParents()) {
            return;
        }
        if (this.gridOptionsWrapper.isTreeData()) {
            var msg_1 = "AG Grid: The property hideOpenParents dose not work with Tree Data. This is because Tree Data has values at the group level, it doesn't make sense to hide them (as opposed to Row Grouping, which only has Aggregated Values at the group level).";
            _.doOnce(function () { return console.warn(msg_1); }, 'sortService.hideOpenParentsWithTreeData');
            return false;
        }
        // recurse breadth first over group nodes after sort to 'pull down' group data to child groups
        var callback = function (rowNode) {
            _this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterSort, false);
            rowNode.childrenAfterSort.forEach(function (child) {
                if (child.hasChildren()) {
                    callback(child);
                }
            });
        };
        if (changedPath) {
            changedPath.executeFromRootNode(function (rowNode) { return callback(rowNode); });
        }
    };
    SortService.prototype.pullDownGroupDataForHideOpenParents = function (rowNodes, clearOperation) {
        var _this = this;
        if (!this.gridOptionsWrapper.isGroupHideOpenParents() || _.missing(rowNodes)) {
            return;
        }
        rowNodes.forEach(function (childRowNode) {
            var groupDisplayCols = _this.columnModel.getGroupDisplayColumns();
            groupDisplayCols.forEach(function (groupDisplayCol) {
                var showRowGroup = groupDisplayCol.getColDef().showRowGroup;
                if (typeof showRowGroup !== 'string') {
                    console.error('AG Grid: groupHideOpenParents only works when specifying specific columns for colDef.showRowGroup');
                    return;
                }
                var displayingGroupKey = showRowGroup;
                var rowGroupColumn = _this.columnModel.getPrimaryColumn(displayingGroupKey);
                var thisRowNodeMatches = rowGroupColumn === childRowNode.rowGroupColumn;
                if (thisRowNodeMatches) {
                    return;
                }
                if (clearOperation) {
                    // if doing a clear operation, we clear down the value for every possible group column
                    childRowNode.setGroupValue(groupDisplayCol.getId(), undefined);
                }
                else {
                    // if doing a set operation, we set only where the pull down is to occur
                    var parentToStealFrom = childRowNode.getFirstChildOfFirstChild(rowGroupColumn);
                    if (parentToStealFrom) {
                        childRowNode.setGroupValue(groupDisplayCol.getId(), parentToStealFrom.key);
                    }
                }
            });
        });
    };
    __decorate$4([
        Autowired('columnModel')
    ], SortService.prototype, "columnModel", void 0);
    __decorate$4([
        Autowired('rowNodeSorter')
    ], SortService.prototype, "rowNodeSorter", void 0);
    __decorate$4([
        PostConstruct
    ], SortService.prototype, "init", null);
    SortService = __decorate$4([
        Bean('sortService')
    ], SortService);
    return SortService;
}(BeanStub));

var __extends$5 = (undefined && undefined.__extends) || (function () {
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
var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FilterService = /** @class */ (function (_super) {
    __extends$5(FilterService, _super);
    function FilterService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterService.prototype.postConstruct = function () {
        this.doingTreeData = this.gridOptionsWrapper.isTreeData();
    };
    FilterService.prototype.filter = function (changedPath) {
        var filterActive = this.filterManager.isAnyFilterPresent();
        this.filterNodes(filterActive, changedPath);
    };
    FilterService.prototype.filterNodes = function (filterActive, changedPath) {
        var _this = this;
        var filterCallback = function (rowNode, includeChildNodes) {
            // recursively get all children that are groups to also filter
            if (rowNode.hasChildren()) {
                // result of filter for this node. when filtering tree data, includeChildNodes = true when parent passes
                if (filterActive && !includeChildNodes) {
                    rowNode.childrenAfterFilter = rowNode.childrenAfterGroup.filter(function (childNode) {
                        // a group is included in the result if it has any children of it's own.
                        // by this stage, the child groups are already filtered
                        var passBecauseChildren = childNode.childrenAfterFilter && childNode.childrenAfterFilter.length > 0;
                        // both leaf level nodes and tree data nodes have data. these get added if
                        // the data passes the filter
                        var passBecauseDataPasses = childNode.data
                            && _this.filterManager.doesRowPassFilter({ rowNode: childNode });
                        // note - tree data nodes pass either if a) they pass themselves or b) any children of that node pass
                        return passBecauseChildren || passBecauseDataPasses;
                    });
                }
                else {
                    // if not filtering, the result is the original list
                    rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
                }
                _this.setAllChildrenCount(rowNode);
            }
            else {
                rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
                rowNode.setAllChildrenCount(null);
            }
        };
        if (this.doingTreeDataFiltering()) {
            var treeDataDepthFirstFilter_1 = function (rowNode, alreadyFoundInParent) {
                // tree data filter traverses the hierarchy depth first and includes child nodes if parent passes
                // filter, and parent nodes will be include if any children exist.
                if (rowNode.childrenAfterGroup) {
                    for (var i = 0; i < rowNode.childrenAfterGroup.length; i++) {
                        var childNode = rowNode.childrenAfterGroup[i];
                        // first check if current node passes filter before invoking child nodes
                        var foundInParent = alreadyFoundInParent
                            || _this.filterManager.doesRowPassFilter({ rowNode: childNode });
                        if (childNode.childrenAfterGroup) {
                            treeDataDepthFirstFilter_1(rowNode.childrenAfterGroup[i], foundInParent);
                        }
                        else {
                            filterCallback(childNode, foundInParent);
                        }
                    }
                }
                filterCallback(rowNode, alreadyFoundInParent);
            };
            var treeDataFilterCallback = function (rowNode) { return treeDataDepthFirstFilter_1(rowNode, false); };
            changedPath.executeFromRootNode(treeDataFilterCallback);
        }
        else {
            var defaultFilterCallback = function (rowNode) { return filterCallback(rowNode, false); };
            changedPath.forEachChangedNodeDepthFirst(defaultFilterCallback, true);
        }
    };
    FilterService.prototype.setAllChildrenCountTreeData = function (rowNode) {
        // for tree data, we include all children, groups and leafs
        var allChildrenCount = 0;
        rowNode.childrenAfterFilter.forEach(function (child) {
            // include child itself
            allChildrenCount++;
            // include children of children
            allChildrenCount += child.allChildrenCount;
        });
        rowNode.setAllChildrenCount(allChildrenCount);
    };
    FilterService.prototype.setAllChildrenCountGridGrouping = function (rowNode) {
        // for grid data, we only count the leafs
        var allChildrenCount = 0;
        rowNode.childrenAfterFilter.forEach(function (child) {
            if (child.group) {
                allChildrenCount += child.allChildrenCount;
            }
            else {
                allChildrenCount++;
            }
        });
        rowNode.setAllChildrenCount(allChildrenCount);
    };
    FilterService.prototype.setAllChildrenCount = function (rowNode) {
        if (this.doingTreeData) {
            this.setAllChildrenCountTreeData(rowNode);
        }
        else {
            this.setAllChildrenCountGridGrouping(rowNode);
        }
    };
    FilterService.prototype.doingTreeDataFiltering = function () {
        return this.gridOptionsWrapper.isTreeData() && !this.gridOptionsWrapper.isExcludeChildrenWhenTreeDataFiltering();
    };
    __decorate$5([
        Autowired('filterManager')
    ], FilterService.prototype, "filterManager", void 0);
    __decorate$5([
        PostConstruct
    ], FilterService.prototype, "postConstruct", null);
    FilterService = __decorate$5([
        Bean("filterService")
    ], FilterService);
    return FilterService;
}(BeanStub));

var __extends$6 = (undefined && undefined.__extends) || (function () {
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
var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ImmutableService = /** @class */ (function (_super) {
    __extends$6(ImmutableService, _super);
    function ImmutableService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImmutableService.prototype.postConstruct = function () {
        if (this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = this.rowModel;
        }
    };
    // converts the setRowData() command to a transaction
    ImmutableService.prototype.createTransactionForRowData = function (data) {
        if (_.missing(this.clientSideRowModel)) {
            console.error('AG Grid: ImmutableService only works with ClientSideRowModel');
            return;
        }
        var getRowNodeIdFunc = this.gridOptionsWrapper.getRowNodeIdFunc();
        if (!getRowNodeIdFunc || _.missing(getRowNodeIdFunc)) {
            console.error('AG Grid: ImmutableService requires getRowNodeId() callback to be implemented, your row data need IDs!');
            return;
        }
        // convert the data into a transaction object by working out adds, removes and updates
        var transaction = {
            remove: [],
            update: [],
            add: []
        };
        var existingNodesMap = this.clientSideRowModel.getCopyOfNodesMap();
        var suppressSortOrder = this.gridOptionsWrapper.isSuppressMaintainUnsortedOrder();
        var orderMap = suppressSortOrder ? null : {};
        if (_.exists(data)) {
            // split all the new data in the following:
            // if new, push to 'add'
            // if update, push to 'update'
            // if not changed, do not include in the transaction
            data.forEach(function (dataItem, index) {
                var id = getRowNodeIdFunc(dataItem);
                var existingNode = existingNodesMap[id];
                if (orderMap) {
                    orderMap[id] = index;
                }
                if (existingNode) {
                    var dataHasChanged = existingNode.data !== dataItem;
                    if (dataHasChanged) {
                        transaction.update.push(dataItem);
                    }
                    // otherwise, if data not changed, we just don't include it anywhere, as it's not a delta
                    // remove from list, so we know the item is not to be removed
                    existingNodesMap[id] = undefined;
                }
                else {
                    transaction.add.push(dataItem);
                }
            });
        }
        // at this point, all rows that are left, should be removed
        _.iterateObject(existingNodesMap, function (id, rowNode) {
            if (rowNode) {
                transaction.remove.push(rowNode.data);
            }
        });
        return [transaction, orderMap];
    };
    __decorate$6([
        Autowired('rowModel')
    ], ImmutableService.prototype, "rowModel", void 0);
    __decorate$6([
        PostConstruct
    ], ImmutableService.prototype, "postConstruct", null);
    ImmutableService = __decorate$6([
        Bean('immutableService')
    ], ImmutableService);
    return ImmutableService;
}(BeanStub));

var ClientSideRowModelModule = {
    moduleName: ModuleNames.ClientSideRowModelModule,
    beans: [FilterStage, SortStage, FlattenStage, SortService, FilterService, ImmutableService],
    rowModels: { clientSide: ClientSideRowModel }
};

export { ClientSideRowModelModule };
