/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v6.2.1
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
var utils_1 = require("../../utils");
var constants_1 = require("../../constants");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var columnController_1 = require("../../columnController/columnController");
var filterManager_1 = require("../../filter/filterManager");
var rowNode_1 = require("../../entities/rowNode");
var eventService_1 = require("../../eventService");
var events_1 = require("../../events");
var context_1 = require("../../context/context");
var selectionController_1 = require("../../selectionController");
var inMemoryNodeManager_1 = require("./inMemoryNodeManager");
var RecursionType;
(function (RecursionType) {
    RecursionType[RecursionType["Normal"] = 0] = "Normal";
    RecursionType[RecursionType["AfterFilter"] = 1] = "AfterFilter";
    RecursionType[RecursionType["AfterFilterAndSort"] = 2] = "AfterFilterAndSort";
    RecursionType[RecursionType["PivotNodes"] = 3] = "PivotNodes";
})(RecursionType || (RecursionType = {}));
;
var InMemoryRowModel = (function () {
    function InMemoryRowModel() {
    }
    InMemoryRowModel.prototype.init = function () {
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.refreshModel.bind(this, constants_1.Constants.STEP_EVERYTHING));
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.refreshModel.bind(this, constants_1.Constants.STEP_EVERYTHING));
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_COLUMN_PIVOT_CHANGED, this.refreshModel.bind(this, constants_1.Constants.STEP_PIVOT));
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_FILTER_CHANGED, this.refreshModel.bind(this, constants_1.Constants.STEP_FILTER));
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_SORT_CHANGED, this.refreshModel.bind(this, constants_1.Constants.STEP_SORT));
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.refreshModel.bind(this, constants_1.Constants.STEP_PIVOT));
        this.rootNode = new rowNode_1.RowNode();
        this.nodeManager = new inMemoryNodeManager_1.InMemoryNodeManager(this.rootNode, this.gridOptionsWrapper, this.context, this.eventService);
        this.context.wireBean(this.rootNode);
        if (this.gridOptionsWrapper.isRowModelDefault()) {
            this.setRowData(this.gridOptionsWrapper.getRowData(), this.columnController.isReady());
        }
    };
    InMemoryRowModel.prototype.getType = function () {
        return constants_1.Constants.ROW_MODEL_TYPE_NORMAL;
    };
    InMemoryRowModel.prototype.onValueChanged = function () {
        if (this.columnController.isPivotActive()) {
            this.refreshModel(constants_1.Constants.STEP_PIVOT);
        }
        else {
            this.refreshModel(constants_1.Constants.STEP_AGGREGATE);
        }
    };
    InMemoryRowModel.prototype.refreshModel = function (step, fromIndex, groupState) {
        // this goes through the pipeline of stages. what's in my head is similar
        // to the diagram on this page:
        // http://commons.apache.org/sandbox/commons-pipeline/pipeline_basics.html
        // however we want to keep the results of each stage, hence we manually call
        // each step rather than have them chain each other.
        var _this = this;
        // fallthrough in below switch is on purpose,
        // eg if STEP_FILTER, then all steps below this
        // step get done
        // var start: number;
        // console.log('======= start =======');
        switch (step) {
            case constants_1.Constants.STEP_EVERYTHING:
                // start = new Date().getTime();
                this.doRowGrouping(groupState);
            // console.log('rowGrouping = ' + (new Date().getTime() - start));
            case constants_1.Constants.STEP_FILTER:
                // start = new Date().getTime();
                this.doFilter();
            // console.log('filter = ' + (new Date().getTime() - start));
            case constants_1.Constants.STEP_PIVOT:
                this.doPivot();
            case constants_1.Constants.STEP_AGGREGATE:
                // start = new Date().getTime();
                this.doAggregate();
            // console.log('aggregation = ' + (new Date().getTime() - start));
            case constants_1.Constants.STEP_SORT:
                // start = new Date().getTime();
                this.doSort();
            // console.log('sort = ' + (new Date().getTime() - start));
            case constants_1.Constants.STEP_MAP:
                // start = new Date().getTime();
                this.doRowsToDisplay();
        }
        this.eventService.dispatchEvent(events_1.Events.EVENT_MODEL_UPDATED, { fromIndex: fromIndex });
        if (this.$scope) {
            setTimeout(function () {
                _this.$scope.$apply();
            }, 0);
        }
    };
    InMemoryRowModel.prototype.isEmpty = function () {
        return utils_1.Utils.missing(this.rootNode) || utils_1.Utils.missing(this.rootNode.allLeafChildren)
            || this.rootNode.allLeafChildren.length === 0 || !this.columnController.isReady();
    };
    InMemoryRowModel.prototype.isRowsToRender = function () {
        return utils_1.Utils.exists(this.rowsToDisplay) && this.rowsToDisplay.length > 0;
    };
    InMemoryRowModel.prototype.setDatasource = function (datasource) {
        console.error('ag-Grid: should never call setDatasource on inMemoryRowController');
    };
    InMemoryRowModel.prototype.getTopLevelNodes = function () {
        return this.rootNode ? this.rootNode.childrenAfterGroup : null;
    };
    InMemoryRowModel.prototype.getRow = function (index) {
        return this.rowsToDisplay[index];
    };
    InMemoryRowModel.prototype.getVirtualRowCount = function () {
        console.warn('ag-Grid: rowModel.getVirtualRowCount() is not longer a function, use rowModel.getRowCount() instead');
        return this.getRowCount();
    };
    InMemoryRowModel.prototype.getRowCount = function () {
        if (this.rowsToDisplay) {
            return this.rowsToDisplay.length;
        }
        else {
            return 0;
        }
    };
    InMemoryRowModel.prototype.getRowIndexAtPixel = function (pixelToMatch) {
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
        var lastNode = this.rowsToDisplay[this.rowsToDisplay.length - 1];
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
    InMemoryRowModel.prototype.isRowInPixel = function (rowNode, pixelToMatch) {
        var topPixel = rowNode.rowTop;
        var bottomPixel = rowNode.rowTop + rowNode.rowHeight;
        var pixelInRow = topPixel <= pixelToMatch && bottomPixel > pixelToMatch;
        return pixelInRow;
    };
    InMemoryRowModel.prototype.getRowCombinedHeight = function () {
        if (this.rowsToDisplay && this.rowsToDisplay.length > 0) {
            var lastRow = this.rowsToDisplay[this.rowsToDisplay.length - 1];
            var lastPixel = lastRow.rowTop + lastRow.rowHeight;
            return lastPixel;
        }
        else {
            return 0;
        }
    };
    InMemoryRowModel.prototype.forEachLeafNode = function (callback) {
        if (this.rootNode.allLeafChildren) {
            this.rootNode.allLeafChildren.forEach(function (rowNode, index) { return callback(rowNode, index); });
        }
    };
    InMemoryRowModel.prototype.forEachNode = function (callback) {
        this.recursivelyWalkNodesAndCallback(this.rootNode.childrenAfterGroup, callback, RecursionType.Normal, 0);
    };
    InMemoryRowModel.prototype.forEachNodeAfterFilter = function (callback) {
        this.recursivelyWalkNodesAndCallback(this.rootNode.childrenAfterFilter, callback, RecursionType.AfterFilter, 0);
    };
    InMemoryRowModel.prototype.forEachNodeAfterFilterAndSort = function (callback) {
        this.recursivelyWalkNodesAndCallback(this.rootNode.childrenAfterSort, callback, RecursionType.AfterFilterAndSort, 0);
    };
    InMemoryRowModel.prototype.forEachPivotNode = function (callback) {
        this.recursivelyWalkNodesAndCallback([this.rootNode], callback, RecursionType.PivotNodes, 0);
    };
    // iterates through each item in memory, and calls the callback function
    // nodes - the rowNodes to traverse
    // callback - the user provided callback
    // recursion type - need this to know what child nodes to recurse, eg if looking at all nodes, or filtered notes etc
    // index - works similar to the index in forEach in javascripts array function
    InMemoryRowModel.prototype.recursivelyWalkNodesAndCallback = function (nodes, callback, recursionType, index) {
        if (nodes) {
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                callback(node, index++);
                // go to the next level if it is a group
                if (node.group) {
                    // depending on the recursion type, we pick a difference set of children
                    var nodeChildren;
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
    InMemoryRowModel.prototype.doAggregate = function () {
        if (this.aggregationStage) {
            this.aggregationStage.execute(this.rootNode);
        }
    };
    // + gridApi.expandAll()
    // + gridApi.collapseAll()
    InMemoryRowModel.prototype.expandOrCollapseAll = function (expand) {
        if (this.rootNode) {
            recursiveExpandOrCollapse(this.rootNode.childrenAfterGroup);
        }
        function recursiveExpandOrCollapse(rowNodes) {
            if (!rowNodes) {
                return;
            }
            rowNodes.forEach(function (rowNode) {
                if (rowNode.group) {
                    rowNode.expanded = expand;
                    recursiveExpandOrCollapse(rowNode.childrenAfterGroup);
                }
            });
        }
        this.refreshModel(constants_1.Constants.STEP_MAP);
    };
    InMemoryRowModel.prototype.doSort = function () {
        this.sortStage.execute(this.rootNode);
    };
    InMemoryRowModel.prototype.doRowGrouping = function (groupState) {
        // grouping is enterprise only, so if service missing, skip the step
        var rowsAlreadyGrouped = utils_1.Utils.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (rowsAlreadyGrouped) {
            return;
        }
        if (this.groupStage) {
            // remove old groups from the selection model, as we are about to replace them
            // with new groups
            this.selectionController.removeGroupsFromSelection();
            this.groupStage.execute(this.rootNode);
            this.restoreGroupState(groupState);
            if (this.gridOptionsWrapper.isGroupSelectsChildren()) {
                this.selectionController.updateGroupsFromChildrenSelections();
            }
        }
        else {
            this.rootNode.childrenAfterGroup = this.rootNode.allLeafChildren;
        }
    };
    InMemoryRowModel.prototype.restoreGroupState = function (groupState) {
        if (!groupState) {
            return;
        }
        utils_1.Utils.traverseNodesWithKey(this.rootNode.childrenAfterGroup, function (node, key) {
            // if the group was open last time, then open it this time. however
            // if was not open last time, then don't touch the group, so the 'groupDefaultExpanded'
            // setting will take effect.
            if (typeof groupState[key] === 'boolean') {
                node.expanded = groupState[key];
            }
        });
    };
    InMemoryRowModel.prototype.doFilter = function () {
        this.filterStage.execute(this.rootNode);
    };
    InMemoryRowModel.prototype.doPivot = function () {
        if (this.pivotStage) {
            this.pivotStage.execute(this.rootNode);
        }
    };
    InMemoryRowModel.prototype.getGroupState = function () {
        if (!this.rootNode.childrenAfterGroup || !this.gridOptionsWrapper.isRememberGroupStateWhenNewData()) {
            return null;
        }
        var result = {};
        utils_1.Utils.traverseNodesWithKey(this.rootNode.childrenAfterGroup, function (node, key) { return result[key] = node.expanded; });
        return result;
    };
    // rows: the rows to put into the model
    // firstId: the first id to use, used for paging, where we are not on the first page
    InMemoryRowModel.prototype.setRowData = function (rowData, refresh, firstId) {
        // remember group state, so we can expand groups that should be expanded
        var groupState = this.getGroupState();
        this.nodeManager.setRowData(rowData, firstId);
        // this event kicks off:
        // - clears selection
        // - updates filters
        // - shows 'no rows' overlay if needed
        this.eventService.dispatchEvent(events_1.Events.EVENT_ROW_DATA_CHANGED);
        if (refresh) {
            this.refreshModel(constants_1.Constants.STEP_EVERYTHING, null, groupState);
        }
    };
    InMemoryRowModel.prototype.doRowsToDisplay = function () {
        this.rowsToDisplay = this.flattenStage.execute(this.rootNode);
    };
    InMemoryRowModel.prototype.insertItemsAtIndex = function (index, items) {
        // remember group state, so we can expand groups that should be expanded
        var groupState = this.getGroupState();
        var newNodes = this.nodeManager.insertItemsAtIndex(index, items);
        this.refreshAndFireEvent(events_1.Events.EVENT_ITEMS_ADDED, newNodes, groupState);
    };
    InMemoryRowModel.prototype.removeItems = function (rowNodes) {
        var groupState = this.getGroupState();
        var removedNodes = this.nodeManager.removeItems(rowNodes);
        this.refreshAndFireEvent(events_1.Events.EVENT_ITEMS_REMOVED, removedNodes, groupState);
    };
    InMemoryRowModel.prototype.addItems = function (items) {
        var groupState = this.getGroupState();
        var newNodes = this.nodeManager.addItems(items);
        this.refreshAndFireEvent(events_1.Events.EVENT_ITEMS_ADDED, newNodes, groupState);
    };
    InMemoryRowModel.prototype.refreshAndFireEvent = function (eventName, rowNodes, groupState) {
        if (rowNodes) {
            this.refreshModel(constants_1.Constants.STEP_EVERYTHING, null, groupState);
            this.eventService.dispatchEvent(eventName, { rowNodes: rowNodes });
        }
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], InMemoryRowModel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], InMemoryRowModel.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('filterManager'), 
        __metadata('design:type', filterManager_1.FilterManager)
    ], InMemoryRowModel.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('$scope'), 
        __metadata('design:type', Object)
    ], InMemoryRowModel.prototype, "$scope", void 0);
    __decorate([
        context_1.Autowired('selectionController'), 
        __metadata('design:type', selectionController_1.SelectionController)
    ], InMemoryRowModel.prototype, "selectionController", void 0);
    __decorate([
        context_1.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], InMemoryRowModel.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('context'), 
        __metadata('design:type', context_1.Context)
    ], InMemoryRowModel.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('filterStage'), 
        __metadata('design:type', Object)
    ], InMemoryRowModel.prototype, "filterStage", void 0);
    __decorate([
        context_1.Autowired('sortStage'), 
        __metadata('design:type', Object)
    ], InMemoryRowModel.prototype, "sortStage", void 0);
    __decorate([
        context_1.Autowired('flattenStage'), 
        __metadata('design:type', Object)
    ], InMemoryRowModel.prototype, "flattenStage", void 0);
    __decorate([
        context_1.Optional('groupStage'), 
        __metadata('design:type', Object)
    ], InMemoryRowModel.prototype, "groupStage", void 0);
    __decorate([
        context_1.Optional('aggregationStage'), 
        __metadata('design:type', Object)
    ], InMemoryRowModel.prototype, "aggregationStage", void 0);
    __decorate([
        context_1.Optional('pivotStage'), 
        __metadata('design:type', Object)
    ], InMemoryRowModel.prototype, "pivotStage", void 0);
    __decorate([
        context_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], InMemoryRowModel.prototype, "init", null);
    InMemoryRowModel = __decorate([
        context_1.Bean('rowModel'), 
        __metadata('design:paramtypes', [])
    ], InMemoryRowModel);
    return InMemoryRowModel;
})();
exports.InMemoryRowModel = InMemoryRowModel;
