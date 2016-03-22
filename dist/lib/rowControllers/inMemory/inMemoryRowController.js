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
var utils_1 = require('../../utils');
var constants_1 = require('../../constants');
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var columnController_1 = require("../../columnController/columnController");
var filterManager_1 = require("../../filter/filterManager");
var rowNode_1 = require("../../entities/rowNode");
var eventService_1 = require("../../eventService");
var events_1 = require("../../events");
var context_1 = require("../../context/context");
var selectionController_1 = require("../../selectionController");
var context_2 = require("../../context/context");
var constants_2 = require("../../constants");
var context_3 = require("../../context/context");
var context_4 = require("../../context/context");
var RecursionType;
(function (RecursionType) {
    RecursionType[RecursionType["Normal"] = 0] = "Normal";
    RecursionType[RecursionType["AfterFilter"] = 1] = "AfterFilter";
    RecursionType[RecursionType["AfterFilterAndSort"] = 2] = "AfterFilterAndSort";
})(RecursionType || (RecursionType = {}));
;
var InMemoryRowController = (function () {
    function InMemoryRowController() {
        // the rows go through a pipeline of steps, each array below is the result
        // after a certain step.
        this.allRows = []; // the rows, in a list, as provided by the user, but wrapped in RowNode objects
    }
    InMemoryRowController.prototype.init = function () {
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.refreshModel.bind(this, constants_2.Constants.STEP_EVERYTHING));
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.refreshModel.bind(this, constants_2.Constants.STEP_EVERYTHING));
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_COLUMN_VALUE_CHANGE, this.refreshModel.bind(this, constants_2.Constants.STEP_AGGREGATE));
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_FILTER_CHANGED, this.refreshModel.bind(this, constants_1.Constants.STEP_FILTER));
        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_SORT_CHANGED, this.refreshModel.bind(this, constants_1.Constants.STEP_SORT));
        if (this.gridOptionsWrapper.isRowModelDefault()) {
            this.setRowData(this.gridOptionsWrapper.getRowData(), this.columnController.isReady());
        }
    };
    InMemoryRowController.prototype.refreshModel = function (step, fromIndex, groupState) {
        // this goes through the pipeline of stages. what's in my head is similar
        // to the diagram on this page:
        // http://commons.apache.org/sandbox/commons-pipeline/pipeline_basics.html
        // however we want to keep the results of each stage, hence we manually call
        // each step rather than have them chain each other.
        var _this = this;
        // fallthrough in below switch is on purpose,
        // eg if STEP_FILTER, then all steps below this
        // step get done
        switch (step) {
            case constants_1.Constants.STEP_EVERYTHING:
                this.doRowGrouping(groupState);
            case constants_1.Constants.STEP_FILTER:
                this.doFilter();
            case constants_1.Constants.STEP_AGGREGATE:
                this.doAggregate();
            case constants_1.Constants.STEP_SORT:
                this.doSort();
            case constants_1.Constants.STEP_MAP:
                this.doRowsToDisplay();
        }
        this.eventService.dispatchEvent(events_1.Events.EVENT_MODEL_UPDATED, { fromIndex: fromIndex });
        if (this.$scope) {
            setTimeout(function () {
                _this.$scope.$apply();
            }, 0);
        }
    };
    InMemoryRowController.prototype.isEmpty = function () {
        return this.allRows === null || this.allRows.length === 0 || !this.columnController.isReady();
    };
    InMemoryRowController.prototype.isRowsToRender = function () {
        return utils_1.Utils.exists(this.rowsToDisplay) && this.rowsToDisplay.length > 0;
    };
    InMemoryRowController.prototype.setDatasource = function (datasource) {
        console.error('ag-Grid: should never call setDatasource on inMemoryRowController');
    };
    InMemoryRowController.prototype.getTopLevelNodes = function () {
        return this.rowsAfterGroup;
    };
    InMemoryRowController.prototype.getRow = function (index) {
        return this.rowsToDisplay[index];
    };
    InMemoryRowController.prototype.getVirtualRowCount = function () {
        console.warn('ag-Grid: rowModel.getVirtualRowCount() is not longer a function, use rowModel.getRowCount() instead');
        return this.getRowCount();
    };
    InMemoryRowController.prototype.getRowCount = function () {
        if (this.rowsToDisplay) {
            return this.rowsToDisplay.length;
        }
        else {
            return 0;
        }
    };
    InMemoryRowController.prototype.getRowAtPixel = function (pixelToMatch) {
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
    InMemoryRowController.prototype.isRowInPixel = function (rowNode, pixelToMatch) {
        var topPixel = rowNode.rowTop;
        var bottomPixel = rowNode.rowTop + rowNode.rowHeight;
        var pixelInRow = topPixel <= pixelToMatch && bottomPixel > pixelToMatch;
        return pixelInRow;
    };
    InMemoryRowController.prototype.getRowCombinedHeight = function () {
        if (this.rowsToDisplay && this.rowsToDisplay.length > 0) {
            var lastRow = this.rowsToDisplay[this.rowsToDisplay.length - 1];
            var lastPixel = lastRow.rowTop + lastRow.rowHeight;
            return lastPixel;
        }
        else {
            return 0;
        }
    };
    InMemoryRowController.prototype.forEachNode = function (callback) {
        this.recursivelyWalkNodesAndCallback(this.rowsAfterGroup, callback, RecursionType.Normal, 0);
    };
    InMemoryRowController.prototype.forEachNodeAfterFilter = function (callback) {
        this.recursivelyWalkNodesAndCallback(this.rowsAfterFilter, callback, RecursionType.AfterFilter, 0);
    };
    InMemoryRowController.prototype.forEachNodeAfterFilterAndSort = function (callback) {
        this.recursivelyWalkNodesAndCallback(this.rowsAfterSort, callback, RecursionType.AfterFilterAndSort, 0);
    };
    // iterates through each item in memory, and calls the callback function
    // nodes - the rowNodes to traverse
    // callback - the user provided callback
    // recursion type - need this to know what child nodes to recurse, eg if looking at all nodes, or filtered notes etc
    // index - works similar to the index in forEach in javascripts array function
    InMemoryRowController.prototype.recursivelyWalkNodesAndCallback = function (nodes, callback, recursionType, index) {
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
                            nodeChildren = node.children;
                            break;
                        case RecursionType.AfterFilter:
                            nodeChildren = node.childrenAfterFilter;
                            break;
                        case RecursionType.AfterFilterAndSort:
                            nodeChildren = node.childrenAfterSort;
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
    InMemoryRowController.prototype.doAggregate = function () {
        if (this.aggregationStage) {
            this.aggregationStage.execute(this.rowsAfterFilter);
        }
    };
    // + gridApi.expandAll()
    // + gridApi.collapseAll()
    InMemoryRowController.prototype.expandOrCollapseAll = function (expand) {
        recursiveExpandOrCollapse(this.rowsAfterGroup);
        function recursiveExpandOrCollapse(rowNodes) {
            if (!rowNodes) {
                return;
            }
            rowNodes.forEach(function (rowNode) {
                if (rowNode.group) {
                    rowNode.expanded = expand;
                    recursiveExpandOrCollapse(rowNode.children);
                }
            });
        }
        this.refreshModel(constants_2.Constants.STEP_MAP);
    };
    InMemoryRowController.prototype.doSort = function () {
        this.rowsAfterSort = this.sortStage.execute(this.rowsAfterFilter);
    };
    InMemoryRowController.prototype.doRowGrouping = function (groupState) {
        // grouping is enterprise only, so if service missing, skip the step
        var rowsAlreadyGrouped = utils_1.Utils.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (this.groupStage && !rowsAlreadyGrouped) {
            // remove old groups from the selection model, as we are about to replace them
            // with new groups
            this.selectionController.removeGroupsFromSelection();
            this.rowsAfterGroup = this.groupStage.execute(this.allRows);
            this.restoreGroupState(groupState);
            if (this.gridOptionsWrapper.isGroupSelectsChildren()) {
                this.selectionController.updateGroupsFromChildrenSelections();
            }
        }
        else {
            this.rowsAfterGroup = this.allRows;
        }
    };
    InMemoryRowController.prototype.restoreGroupState = function (groupState) {
        if (!groupState) {
            return;
        }
        utils_1.Utils.traverseNodesWithKey(this.rowsAfterGroup, function (node, key) {
            node.expanded = groupState[key] === true;
        });
    };
    InMemoryRowController.prototype.doFilter = function () {
        this.rowsAfterFilter = this.filterStage.execute(this.rowsAfterGroup);
    };
    // rows: the rows to put into the model
    // firstId: the first id to use, used for paging, where we are not on the first page
    InMemoryRowController.prototype.setRowData = function (rowData, refresh, firstId) {
        // remember group state, so we can expand groups that should be expanded
        var groupState = this.getGroupState();
        // place each row into a wrapper
        this.allRows = this.createRowNodesFromData(rowData, firstId);
        this.eventService.dispatchEvent(events_1.Events.EVENT_ROW_DATA_CHANGED);
        if (refresh) {
            this.refreshModel(constants_2.Constants.STEP_EVERYTHING, null, groupState);
        }
    };
    InMemoryRowController.prototype.getGroupState = function () {
        if (!this.rowsAfterGroup || !this.gridOptionsWrapper.isRememberGroupStateWhenNewData()) {
            return null;
        }
        var result = {};
        utils_1.Utils.traverseNodesWithKey(this.rowsAfterGroup, function (node, key) { return result[key] = node.expanded; });
        return result;
    };
    InMemoryRowController.prototype.createRowNodesFromData = function (rowData, firstId) {
        if (!rowData) {
            return [];
        }
        var rowNodeId = utils_1.Utils.exists(firstId) ? firstId : 0;
        // func below doesn't have 'this' pointer, so need to pull out these bits
        var nodeChildDetailsFunc = this.gridOptionsWrapper.getNodeChildDetailsFunc();
        var suppressParentsInRowNodes = this.gridOptionsWrapper.isSuppressParentsInRowNodes();
        var eventService = this.eventService;
        var gridOptionsWrapper = this.gridOptionsWrapper;
        var selectionController = this.selectionController;
        // kick off recursion
        var result = recursiveFunction(rowData, null, 0);
        return result;
        function recursiveFunction(rowData, parent, level) {
            var rowNodes = [];
            rowData.forEach(function (dataItem) {
                var node = new rowNode_1.RowNode(eventService, gridOptionsWrapper, selectionController);
                var nodeChildDetails = nodeChildDetailsFunc ? nodeChildDetailsFunc(dataItem) : null;
                if (nodeChildDetails && nodeChildDetails.group) {
                    node.group = true;
                    node.children = recursiveFunction(nodeChildDetails.children, node, level + 1);
                    node.expanded = nodeChildDetails.expanded === true;
                    node.field = nodeChildDetails.field;
                    node.key = nodeChildDetails.key;
                }
                if (parent && !suppressParentsInRowNodes) {
                    node.parent = parent;
                }
                node.level = level;
                node.id = rowNodeId++;
                node.data = dataItem;
                rowNodes.push(node);
            });
            return rowNodes;
        }
    };
    InMemoryRowController.prototype.doRowsToDisplay = function () {
        this.rowsToDisplay = this.flattenStage.execute(this.rowsAfterSort);
    };
    __decorate([
        context_2.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], InMemoryRowController.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_2.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], InMemoryRowController.prototype, "columnController", void 0);
    __decorate([
        context_2.Autowired('filterManager'), 
        __metadata('design:type', filterManager_1.FilterManager)
    ], InMemoryRowController.prototype, "filterManager", void 0);
    __decorate([
        context_2.Autowired('$scope'), 
        __metadata('design:type', Object)
    ], InMemoryRowController.prototype, "$scope", void 0);
    __decorate([
        context_2.Autowired('selectionController'), 
        __metadata('design:type', selectionController_1.SelectionController)
    ], InMemoryRowController.prototype, "selectionController", void 0);
    __decorate([
        context_2.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], InMemoryRowController.prototype, "eventService", void 0);
    __decorate([
        context_2.Autowired('filterStage'), 
        __metadata('design:type', Object)
    ], InMemoryRowController.prototype, "filterStage", void 0);
    __decorate([
        context_2.Autowired('sortStage'), 
        __metadata('design:type', Object)
    ], InMemoryRowController.prototype, "sortStage", void 0);
    __decorate([
        context_2.Autowired('flattenStage'), 
        __metadata('design:type', Object)
    ], InMemoryRowController.prototype, "flattenStage", void 0);
    __decorate([
        context_4.Optional('groupStage'), 
        __metadata('design:type', Object)
    ], InMemoryRowController.prototype, "groupStage", void 0);
    __decorate([
        context_4.Optional('aggregationStage'), 
        __metadata('design:type', Object)
    ], InMemoryRowController.prototype, "aggregationStage", void 0);
    __decorate([
        // the rows mapped to rows to display
        context_3.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], InMemoryRowController.prototype, "init", null);
    InMemoryRowController = __decorate([
        context_1.Bean('rowModel'), 
        __metadata('design:paramtypes', [])
    ], InMemoryRowController);
    return InMemoryRowController;
})();
exports.InMemoryRowController = InMemoryRowController;
