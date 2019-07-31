/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
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
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../../constants");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var columnApi_1 = require("../../columnController/columnApi");
var columnController_1 = require("../../columnController/columnController");
var filterManager_1 = require("../../filter/filterManager");
var rowNode_1 = require("../../entities/rowNode");
var eventService_1 = require("../../eventService");
var events_1 = require("../../events");
var context_1 = require("../../context/context");
var selectionController_1 = require("../../selectionController");
var clientSideNodeManager_1 = require("./clientSideNodeManager");
var changedPath_1 = require("./changedPath");
var valueService_1 = require("../../valueService/valueService");
var valueCache_1 = require("../../valueService/valueCache");
var gridApi_1 = require("../../gridApi");
var utils_1 = require("../../utils");
var RecursionType;
(function (RecursionType) {
    RecursionType[RecursionType["Normal"] = 0] = "Normal";
    RecursionType[RecursionType["AfterFilter"] = 1] = "AfterFilter";
    RecursionType[RecursionType["AfterFilterAndSort"] = 2] = "AfterFilterAndSort";
    RecursionType[RecursionType["PivotNodes"] = 3] = "PivotNodes";
})(RecursionType || (RecursionType = {}));
var ClientSideRowModel = /** @class */ (function () {
    function ClientSideRowModel() {
    }
    ClientSideRowModel.prototype.init = function () {
        var refreshEverythingFunc = this.refreshModel.bind(this, { step: constants_1.Constants.STEP_EVERYTHING });
        var refreshEverythingAfterColsChangedFunc = this.refreshModel.bind(this, { step: constants_1.Constants.STEP_EVERYTHING, afterColumnsChanged: true });
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, refreshEverythingAfterColsChangedFunc);
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, refreshEverythingFunc);
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_COLUMN_PIVOT_CHANGED, this.refreshModel.bind(this, { step: constants_1.Constants.STEP_PIVOT }));
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, refreshEverythingFunc);
        var refreshMapFunc = this.refreshModel.bind(this, {
            step: constants_1.Constants.STEP_MAP,
            keepRenderedRows: true,
            animate: true
        });
        this.gridOptionsWrapper.addEventListener(gridOptionsWrapper_1.GridOptionsWrapper.PROP_GROUP_REMOVE_SINGLE_CHILDREN, refreshMapFunc);
        this.gridOptionsWrapper.addEventListener(gridOptionsWrapper_1.GridOptionsWrapper.PROP_GROUP_REMOVE_LOWEST_SINGLE_CHILDREN, refreshMapFunc);
        this.rootNode = new rowNode_1.RowNode();
        this.nodeManager = new clientSideNodeManager_1.ClientSideNodeManager(this.rootNode, this.gridOptionsWrapper, this.context, this.eventService, this.columnController, this.gridApi, this.columnApi, this.selectionController);
        this.context.wireBean(this.rootNode);
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
                this.setRowTops();
            }
        } while (atLeastOneChange);
        return res;
    };
    ClientSideRowModel.prototype.setRowTops = function () {
        var nextRowTop = 0;
        for (var i = 0; i < this.rowsToDisplay.length; i++) {
            // we don't estimate if doing fullHeight or autoHeight, as all rows get rendered all the time
            // with these two layouts.
            var allowEstimate = this.gridOptionsWrapper.getDomLayout() === constants_1.Constants.DOM_LAYOUT_NORMAL;
            var rowNode = this.rowsToDisplay[i];
            if (utils_1._.missing(rowNode.rowHeight)) {
                var rowHeight = this.gridOptionsWrapper.getRowHeightForNode(rowNode, allowEstimate);
                rowNode.setRowHeight(rowHeight.height, rowHeight.estimated);
            }
            rowNode.setRowTop(nextRowTop);
            rowNode.setRowIndex(i);
            nextRowTop += rowNode.rowHeight;
        }
    };
    ClientSideRowModel.prototype.resetRowTops = function (rowNode, changedPath) {
        rowNode.clearRowTop();
        if (rowNode.hasChildren()) {
            if (rowNode.childrenAfterGroup) {
                // if a changedPath is active, it means we are here because of a transaction update or
                // a change detection. neither of these impacts the open/closed state of groups. so if
                // a group is not open this time, it was not open last time. so we know all closed groups
                // already have their top positions cleared. so there is no need to traverse all the way
                // when changedPath is active and the rowNode is not expanded.
                var skipChildren = changedPath.isActive() && !rowNode.expanded;
                if (!skipChildren) {
                    for (var i = 0; i < rowNode.childrenAfterGroup.length; i++) {
                        this.resetRowTops(rowNode.childrenAfterGroup[i], changedPath);
                    }
                }
            }
            if (rowNode.sibling) {
                rowNode.sibling.clearRowTop();
            }
        }
        if (rowNode.detailNode) {
            rowNode.detailNode.clearRowTop();
        }
    };
    // returns false if row was moved, otherwise true
    ClientSideRowModel.prototype.ensureRowAtPixel = function (rowNode, pixel) {
        var indexAtPixelNow = this.getRowIndexAtPixel(pixel);
        var rowNodeAtPixelNow = this.getRow(indexAtPixelNow);
        if (rowNodeAtPixelNow === rowNode) {
            return false;
        }
        utils_1._.removeFromArray(this.rootNode.allLeafChildren, rowNode);
        utils_1._.insertIntoArray(this.rootNode.allLeafChildren, rowNode, indexAtPixelNow);
        this.refreshModel({
            step: constants_1.Constants.STEP_EVERYTHING,
            keepRenderedRows: true,
            animate: true,
            keepEditingRows: true
        });
        return true;
    };
    ClientSideRowModel.prototype.isLastRowFound = function () {
        return true;
    };
    ClientSideRowModel.prototype.getRowCount = function () {
        if (this.rowsToDisplay) {
            return this.rowsToDisplay.length;
        }
        else {
            return 0;
        }
    };
    ClientSideRowModel.prototype.getRowBounds = function (index) {
        if (utils_1._.missing(this.rowsToDisplay)) {
            return null;
        }
        var rowNode = this.rowsToDisplay[index];
        if (rowNode) {
            return {
                rowTop: rowNode.rowTop,
                rowHeight: rowNode.rowHeight
            };
        }
        else {
            return null;
        }
    };
    ClientSideRowModel.prototype.onRowGroupOpened = function () {
        var animate = this.gridOptionsWrapper.isAnimateRows();
        this.refreshModel({ step: constants_1.Constants.STEP_MAP, keepRenderedRows: true, animate: animate });
    };
    ClientSideRowModel.prototype.onFilterChanged = function () {
        var animate = this.gridOptionsWrapper.isAnimateRows();
        this.refreshModel({ step: constants_1.Constants.STEP_FILTER, keepRenderedRows: true, animate: animate });
    };
    ClientSideRowModel.prototype.onSortChanged = function () {
        var animate = this.gridOptionsWrapper.isAnimateRows();
        this.refreshModel({ step: constants_1.Constants.STEP_SORT, keepRenderedRows: true, animate: animate, keepEditingRows: true });
    };
    ClientSideRowModel.prototype.getType = function () {
        return constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
    };
    ClientSideRowModel.prototype.onValueChanged = function () {
        if (this.columnController.isPivotActive()) {
            this.refreshModel({ step: constants_1.Constants.STEP_PIVOT });
        }
        else {
            this.refreshModel({ step: constants_1.Constants.STEP_AGGREGATE });
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
        var noTransactions = utils_1._.missingOrEmpty(rowNodeTransactions);
        var changedPath = new changedPath_1.ChangedPath(false, this.rootNode);
        if (noTransactions || this.gridOptionsWrapper.isTreeData()) {
            changedPath.setInactive();
        }
        return changedPath;
    };
    ClientSideRowModel.prototype.refreshModel = function (params) {
        // this goes through the pipeline of stages. what's in my head is similar
        // to the diagram on this page:
        // http://commons.apache.org/sandbox/commons-pipeline/pipeline_basics.html
        // however we want to keep the results of each stage, hence we manually call
        // each step rather than have them chain each other.
        var _this = this;
        // fallthrough in below switch is on purpose,
        // eg if STEP_FILTER, then all steps below this
        // step get done
        // let start: number;
        // console.log('======= start =======');
        var changedPath = this.createChangePath(params.rowNodeTransactions);
        switch (params.step) {
            case constants_1.Constants.STEP_EVERYTHING:
                // start = new Date().getTime();
                this.doRowGrouping(params.groupState, params.rowNodeTransactions, params.rowNodeOrder, changedPath, params.afterColumnsChanged);
            // console.log('rowGrouping = ' + (new Date().getTime() - start));
            case constants_1.Constants.STEP_FILTER:
                // start = new Date().getTime();
                this.doFilter(changedPath);
            // console.log('filter = ' + (new Date().getTime() - start));
            case constants_1.Constants.STEP_PIVOT:
                this.doPivot(changedPath);
            case constants_1.Constants.STEP_AGGREGATE: // depends on agg fields
                // start = new Date().getTime();
                this.doAggregate(changedPath);
            // console.log('aggregation = ' + (new Date().getTime() - start));
            case constants_1.Constants.STEP_SORT:
                // start = new Date().getTime();
                this.doSort(params.rowNodeTransactions, changedPath);
            // console.log('sort = ' + (new Date().getTime() - start));
            case constants_1.Constants.STEP_MAP:
                // start = new Date().getTime();
                this.doRowsToDisplay();
            // console.log('rowsToDisplay = ' + (new Date().getTime() - start));
        }
        // set all row tops to null, then set row tops on all visible rows. if we don't
        // do this, then the algorithm below only sets row tops, old row tops from old rows
        // will still lie around
        this.resetRowTops(this.rootNode, changedPath);
        this.setRowTops();
        var event = {
            type: events_1.Events.EVENT_MODEL_UPDATED,
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
        var rowsMissing;
        var doingLegacyTreeData = utils_1._.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (doingLegacyTreeData) {
            rowsMissing = utils_1._.missing(this.rootNode.childrenAfterGroup) || this.rootNode.childrenAfterGroup.length === 0;
        }
        else {
            rowsMissing = utils_1._.missing(this.rootNode.allLeafChildren) || this.rootNode.allLeafChildren.length === 0;
        }
        var empty = utils_1._.missing(this.rootNode) || rowsMissing || !this.columnController.isReady();
        return empty;
    };
    ClientSideRowModel.prototype.isRowsToRender = function () {
        return utils_1._.exists(this.rowsToDisplay) && this.rowsToDisplay.length > 0;
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
        console.error('ag-Grid: should never call setDatasource on clientSideRowController');
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
    ClientSideRowModel.prototype.getVirtualRowCount = function () {
        console.warn('ag-Grid: rowModel.getVirtualRowCount() is not longer a function, use rowModel.getRowCount() instead');
        return this.getPageLastRow();
    };
    ClientSideRowModel.prototype.getPageFirstRow = function () {
        return 0;
    };
    ClientSideRowModel.prototype.getPageLastRow = function () {
        if (this.rowsToDisplay) {
            return this.rowsToDisplay.length - 1;
        }
        else {
            return 0;
        }
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
        var lastNode = utils_1._.last(this.rowsToDisplay);
        if (lastNode.rowTop <= pixelToMatch) {
            return this.rowsToDisplay.length - 1;
        }
        while (true) {
            var midPointer = Math.floor((bottomPointer + topPointer) / 2);
            var currentRowNode = this.rowsToDisplay[midPointer];
            if (this.isRowInPixel(currentRowNode, pixelToMatch)) {
                return midPointer;
            }
            else if (currentRowNode.rowTop < pixelToMatch) {
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
    ClientSideRowModel.prototype.getCurrentPageHeight = function () {
        if (this.rowsToDisplay && this.rowsToDisplay.length > 0) {
            var lastRow = utils_1._.last(this.rowsToDisplay);
            var lastPixel = lastRow.rowTop + lastRow.rowHeight;
            return lastPixel;
        }
        else {
            return 0;
        }
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
        if (nodes) {
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
                var shouldExpandOrCollapse = usingTreeData ? utils_1._.exists(rowNode.childrenAfterGroup) : rowNode.group;
                if (shouldExpandOrCollapse) {
                    rowNode.expanded = expand;
                    recursiveExpandOrCollapse(rowNode.childrenAfterGroup);
                }
            });
        }
        this.refreshModel({ step: constants_1.Constants.STEP_MAP });
        var eventSource = expand ? 'expandAll' : 'collapseAll';
        var event = {
            api: this.gridApi,
            columnApi: this.columnApi,
            type: events_1.Events.EVENT_EXPAND_COLLAPSE_ALL,
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
        var _this = this;
        // grouping is enterprise only, so if service missing, skip the step
        var doingLegacyTreeData = utils_1._.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (doingLegacyTreeData) {
            return;
        }
        if (this.groupStage) {
            if (rowNodeTransactions && utils_1._.exists(rowNodeTransactions)) {
                rowNodeTransactions.forEach(function (tran) {
                    _this.groupStage.execute({
                        rowNode: _this.rootNode,
                        rowNodeTransaction: tran,
                        rowNodeOrder: rowNodeOrder,
                        changedPath: changedPath
                    });
                });
            }
            else {
                // groups are about to get disposed, so need to deselect any that are selected
                this.selectionController.removeGroupsFromSelection();
                this.groupStage.execute({
                    rowNode: this.rootNode,
                    changedPath: changedPath,
                    afterColumnsChanged: afterColumnsChanged
                });
                // set open/closed state on groups
                this.restoreGroupState(groupState);
            }
            if (this.gridOptionsWrapper.isGroupSelectsChildren()) {
                this.selectionController.updateGroupsFromChildrenSelections(changedPath);
            }
        }
        else {
            this.rootNode.childrenAfterGroup = this.rootNode.allLeafChildren;
        }
    };
    ClientSideRowModel.prototype.restoreGroupState = function (groupState) {
        if (!groupState) {
            return;
        }
        utils_1._.traverseNodesWithKey(this.rootNode.childrenAfterGroup, function (node, key) {
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
        utils_1._.traverseNodesWithKey(this.rootNode.childrenAfterGroup, function (node, key) { return result[key] = node.expanded; });
        return result;
    };
    ClientSideRowModel.prototype.getCopyOfNodesMap = function () {
        return this.nodeManager.getCopyOfNodesMap();
    };
    ClientSideRowModel.prototype.getRowNode = function (id) {
        return this.nodeManager.getRowNode(id);
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
            type: events_1.Events.EVENT_ROW_DATA_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(rowDataChangedEvent);
        this.refreshModel({
            step: constants_1.Constants.STEP_EVERYTHING,
            groupState: groupState,
            newData: true
        });
    };
    ClientSideRowModel.prototype.batchUpdateRowData = function (rowDataTransaction, callback) {
        var _this = this;
        if (!this.rowDataTransactionBatch) {
            this.rowDataTransactionBatch = [];
            var waitMillis = this.gridOptionsWrapper.getBatchUpdateWaitMillis();
            window.setTimeout(function () {
                _this.executeBatchUpdateRowData();
                _this.rowDataTransactionBatch = null;
            }, waitMillis);
        }
        this.rowDataTransactionBatch.push({ rowDataTransaction: rowDataTransaction, callback: callback });
    };
    ClientSideRowModel.prototype.executeBatchUpdateRowData = function () {
        var _this = this;
        this.valueCache.onDataChanged();
        var callbackFuncsBound = [];
        var rowNodeTrans = [];
        if (this.rowDataTransactionBatch) {
            this.rowDataTransactionBatch.forEach(function (tranItem) {
                var rowNodeTran = _this.nodeManager.updateRowData(tranItem.rowDataTransaction, null);
                rowNodeTrans.push(rowNodeTran);
                if (tranItem.callback) {
                    callbackFuncsBound.push(tranItem.callback.bind(null, rowNodeTran));
                }
            });
        }
        this.commonUpdateRowData(rowNodeTrans);
        // do callbacks in next VM turn so it's async
        if (callbackFuncsBound.length > 0) {
            window.setTimeout(function () {
                callbackFuncsBound.forEach(function (func) { return func(); });
            }, 0);
        }
    };
    ClientSideRowModel.prototype.updateRowData = function (rowDataTran, rowNodeOrder) {
        this.valueCache.onDataChanged();
        var rowNodeTran = this.nodeManager.updateRowData(rowDataTran, rowNodeOrder);
        this.commonUpdateRowData([rowNodeTran], rowNodeOrder);
        return rowNodeTran;
    };
    // common to updateRowData and batchUpdateRowData
    ClientSideRowModel.prototype.commonUpdateRowData = function (rowNodeTrans, rowNodeOrder) {
        this.refreshModel({
            step: constants_1.Constants.STEP_EVERYTHING,
            rowNodeTransactions: rowNodeTrans,
            rowNodeOrder: rowNodeOrder,
            keepRenderedRows: true,
            animate: true,
            keepEditingRows: true
        });
        var event = {
            type: events_1.Events.EVENT_ROW_DATA_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    };
    ClientSideRowModel.prototype.doRowsToDisplay = function () {
        this.rowsToDisplay = this.flattenStage.execute({ rowNode: this.rootNode });
    };
    ClientSideRowModel.prototype.onRowHeightChanged = function () {
        this.refreshModel({ step: constants_1.Constants.STEP_MAP, keepRenderedRows: true, keepEditingRows: true });
    };
    ClientSideRowModel.prototype.resetRowHeights = function () {
        this.forEachNode(function (rowNode) { return rowNode.setRowHeight(null); });
        this.onRowHeightChanged();
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], ClientSideRowModel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], ClientSideRowModel.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('filterManager'),
        __metadata("design:type", filterManager_1.FilterManager)
    ], ClientSideRowModel.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('$scope'),
        __metadata("design:type", Object)
    ], ClientSideRowModel.prototype, "$scope", void 0);
    __decorate([
        context_1.Autowired('selectionController'),
        __metadata("design:type", selectionController_1.SelectionController)
    ], ClientSideRowModel.prototype, "selectionController", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], ClientSideRowModel.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], ClientSideRowModel.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('valueService'),
        __metadata("design:type", valueService_1.ValueService)
    ], ClientSideRowModel.prototype, "valueService", void 0);
    __decorate([
        context_1.Autowired('valueCache'),
        __metadata("design:type", valueCache_1.ValueCache)
    ], ClientSideRowModel.prototype, "valueCache", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], ClientSideRowModel.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], ClientSideRowModel.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('filterStage'),
        __metadata("design:type", Object)
    ], ClientSideRowModel.prototype, "filterStage", void 0);
    __decorate([
        context_1.Autowired('sortStage'),
        __metadata("design:type", Object)
    ], ClientSideRowModel.prototype, "sortStage", void 0);
    __decorate([
        context_1.Autowired('flattenStage'),
        __metadata("design:type", Object)
    ], ClientSideRowModel.prototype, "flattenStage", void 0);
    __decorate([
        context_1.Optional('groupStage'),
        __metadata("design:type", Object)
    ], ClientSideRowModel.prototype, "groupStage", void 0);
    __decorate([
        context_1.Optional('aggregationStage'),
        __metadata("design:type", Object)
    ], ClientSideRowModel.prototype, "aggregationStage", void 0);
    __decorate([
        context_1.Optional('pivotStage'),
        __metadata("design:type", Object)
    ], ClientSideRowModel.prototype, "pivotStage", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ClientSideRowModel.prototype, "init", null);
    ClientSideRowModel = __decorate([
        context_1.Bean('rowModel')
    ], ClientSideRowModel);
    return ClientSideRowModel;
}());
exports.ClientSideRowModel = ClientSideRowModel;
