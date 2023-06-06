var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { _, Autowired, Bean, BeanStub, ChangedPath, Events, Optional, PostConstruct, ClientSideRowModelSteps, RowNode, RowHighlightPosition, } from "@ag-grid-community/core";
import { ClientSideNodeManager } from "./clientSideNodeManager";
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
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onRowHeightChanged_debounced = _.debounce(_this.onRowHeightChanged.bind(_this), 100);
        _this.rowsToDisplay = []; // the rows mapped to rows to display
        return _this;
    }
    ClientSideRowModel.prototype.init = function () {
        var refreshEverythingFunc = this.refreshModel.bind(this, { step: ClientSideRowModelSteps.EVERYTHING });
        var animate = !this.gridOptionsService.is('suppressAnimationFrame');
        var refreshEverythingAfterColsChangedFunc = this.refreshModel.bind(this, {
            step: ClientSideRowModelSteps.EVERYTHING,
            afterColumnsChanged: true,
            keepRenderedRows: true,
            animate: animate
        });
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refreshEverythingAfterColsChangedFunc);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, refreshEverythingFunc);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.refreshModel.bind(this, { step: ClientSideRowModelSteps.PIVOT }));
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, refreshEverythingFunc);
        this.addManagedListener(this.eventService, Events.EVENT_GRID_STYLES_CHANGED, this.onGridStylesChanges.bind(this));
        var refreshMapListener = this.refreshModel.bind(this, {
            step: ClientSideRowModelSteps.MAP,
            keepRenderedRows: true,
            animate: animate
        });
        this.addManagedPropertyListener('groupRemoveSingleChildren', refreshMapListener);
        this.addManagedPropertyListener('groupRemoveLowestSingleChildren', refreshMapListener);
        this.rootNode = new RowNode(this.beans);
        this.nodeManager = new ClientSideNodeManager(this.rootNode, this.gridOptionsService, this.eventService, this.columnModel, this.selectionService, this.beans);
    };
    ClientSideRowModel.prototype.start = function () {
        var rowData = this.gridOptionsService.get('rowData');
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
                    var rowHeight = this.gridOptionsService.getRowHeightForNode(rowNode);
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
        var defaultRowHeight = this.environment.getDefaultRowHeight();
        var nextRowTop = 0;
        // mapping displayed rows is not needed for this method, however it's used in
        // clearRowTopAndRowIndex(), and given we are looping through this.rowsToDisplay here,
        // we create the map here for performance reasons, so we don't loop a second time
        // in clearRowTopAndRowIndex()
        var displayedRowsMapped = new Set();
        // we don't estimate if doing fullHeight or autoHeight, as all rows get rendered all the time
        // with these two layouts.
        var allowEstimate = this.gridOptionsService.isDomLayout('normal');
        for (var i = 0; i < this.rowsToDisplay.length; i++) {
            var rowNode = this.rowsToDisplay[i];
            if (rowNode.id != null) {
                displayedRowsMapped.add(rowNode.id);
            }
            if (rowNode.rowHeight == null) {
                var rowHeight = this.gridOptionsService.getRowHeightForNode(rowNode, allowEstimate, defaultRowHeight);
                rowNode.setRowHeight(rowHeight.height, rowHeight.estimated);
            }
            rowNode.setRowTop(nextRowTop);
            rowNode.setRowIndex(i);
            nextRowTop += rowNode.rowHeight;
        }
        return displayedRowsMapped;
    };
    ClientSideRowModel.prototype.clearRowTopAndRowIndex = function (changedPath, displayedRowsMapped) {
        var changedPathActive = changedPath.isActive();
        var clearIfNotDisplayed = function (rowNode) {
            if (rowNode && rowNode.id != null && !displayedRowsMapped.has(rowNode.id)) {
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
                    var skipChildren = changedPathActive && !isRootNode && !rowNode.expanded;
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
        var animate = !this.gridOptionsService.is('suppressAnimationFrame');
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
            keepEditingRows: true,
            animate: animate
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
        var filteredChildren = this.rootNode.childrenAfterAggFilter;
        return filteredChildren ? filteredChildren.length : 0;
    };
    ClientSideRowModel.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        var showingRootNode = this.rowsToDisplay && this.rowsToDisplay[0] === this.rootNode;
        if (showingRootNode) {
            return topLevelIndex;
        }
        var rowNode = this.rootNode.childrenAfterSort[topLevelIndex];
        if (this.gridOptionsService.is('groupHideOpenParents')) {
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
        var animate = this.gridOptionsService.isAnimateRows();
        this.refreshModel({ step: ClientSideRowModelSteps.MAP, keepRenderedRows: true, animate: animate });
    };
    ClientSideRowModel.prototype.onFilterChanged = function (event) {
        if (event.afterDataChange) {
            return;
        }
        var animate = this.gridOptionsService.isAnimateRows();
        var primaryOrQuickFilterChanged = event.columns.length === 0 || event.columns.some(function (col) { return col.isPrimary(); });
        var step = primaryOrQuickFilterChanged ? ClientSideRowModelSteps.FILTER : ClientSideRowModelSteps.FILTER_AGGREGATES;
        this.refreshModel({ step: step, keepRenderedRows: true, animate: animate });
    };
    ClientSideRowModel.prototype.onSortChanged = function () {
        var animate = this.gridOptionsService.isAnimateRows();
        this.refreshModel({ step: ClientSideRowModelSteps.SORT, keepRenderedRows: true, animate: animate, keepEditingRows: true });
    };
    ClientSideRowModel.prototype.getType = function () {
        return 'clientSide';
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
        if (noTransactions || this.gridOptionsService.isTreeData()) {
            changedPath.setInactive();
        }
        return changedPath;
    };
    ClientSideRowModel.prototype.isSuppressModelUpdateAfterUpdateTransaction = function (params) {
        if (!this.gridOptionsService.is('suppressModelUpdateAfterUpdateTransaction')) {
            return false;
        }
        // return true if we are only doing update transactions
        if (params.rowNodeTransactions == null) {
            return false;
        }
        var transWithAddsOrDeletes = params.rowNodeTransactions.filter(function (tx) {
            return (tx.add != null && tx.add.length > 0) || (tx.remove != null && tx.remove.length > 0);
        });
        var transactionsContainUpdatesOnly = transWithAddsOrDeletes == null || transWithAddsOrDeletes.length == 0;
        return transactionsContainUpdatesOnly;
    };
    ClientSideRowModel.prototype.buildRefreshModelParams = function (step) {
        var paramsStep = ClientSideRowModelSteps.EVERYTHING;
        var stepsMapped = {
            everything: ClientSideRowModelSteps.EVERYTHING,
            group: ClientSideRowModelSteps.EVERYTHING,
            filter: ClientSideRowModelSteps.FILTER,
            map: ClientSideRowModelSteps.MAP,
            aggregate: ClientSideRowModelSteps.AGGREGATE,
            sort: ClientSideRowModelSteps.SORT,
            pivot: ClientSideRowModelSteps.PIVOT
        };
        if (_.exists(step)) {
            paramsStep = stepsMapped[step];
        }
        if (_.missing(paramsStep)) {
            console.error("AG Grid: invalid step " + step + ", available steps are " + Object.keys(stepsMapped).join(', '));
            return undefined;
        }
        var animate = !this.gridOptionsService.is('suppressAnimationFrame');
        var modelParams = {
            step: paramsStep,
            keepRenderedRows: true,
            keepEditingRows: true,
            animate: animate
        };
        return modelParams;
    };
    ClientSideRowModel.prototype.refreshModel = function (paramsOrStep) {
        var params = typeof paramsOrStep === 'object' && "step" in paramsOrStep ? paramsOrStep : this.buildRefreshModelParams(paramsOrStep);
        if (!params) {
            return;
        }
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
            case ClientSideRowModelSteps.FILTER_AGGREGATES:
                this.doFilterAggregates(changedPath);
            case ClientSideRowModelSteps.SORT:
                this.doSort(params.rowNodeTransactions, changedPath);
            case ClientSideRowModelSteps.MAP:
                this.doRowsToDisplay();
        }
        // set all row tops to null, then set row tops on all visible rows. if we don't
        // do this, then the algorithm below only sets row tops, old row tops from old rows
        // will still lie around
        var displayedNodesMapped = this.setRowTopAndRowIndex();
        this.clearRowTopAndRowIndex(changedPath, displayedNodesMapped);
        var event = {
            type: Events.EVENT_MODEL_UPDATED,
            animate: params.animate,
            keepRenderedRows: params.keepRenderedRows,
            newData: params.newData,
            newPage: false,
            keepUndoRedoStack: params.keepUndoRedoStack
        };
        this.eventService.dispatchEvent(event);
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
        var started = !lastInRange;
        var finished = false;
        var result = [];
        var groupsSelectChildren = this.gridOptionsService.is('groupSelectsChildren');
        this.forEachNodeAfterFilterAndSort(function (rowNode) {
            // range has been closed, skip till end
            if (finished) {
                return;
            }
            if (started) {
                if (rowNode === lastInRange || rowNode === firstInRange) {
                    // check if this is the last node we're going to be adding
                    finished = true;
                    // if the final node was a group node, and we're doing groupSelectsChildren
                    // make the exception to select all of it's descendants too
                    if (rowNode.group && groupsSelectChildren) {
                        result.push.apply(result, __spreadArray([], __read(rowNode.allLeafChildren)));
                        return;
                    }
                }
            }
            if (!started) {
                if (rowNode !== lastInRange && rowNode !== firstInRange) {
                    // still haven't hit a boundary node, keep searching
                    return;
                }
                started = true;
            }
            // only select leaf nodes if groupsSelectChildren
            var includeThisNode = !rowNode.group || !groupsSelectChildren;
            if (includeThisNode) {
                result.push(rowNode);
                return;
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
        if (this.isEmpty() || this.rowsToDisplay.length === 0) {
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
        var oldBottomPointer = -1;
        var oldTopPointer = -1;
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
            // infinite loops happen when there is space between rows. this can happen
            // when Auto Height is active, cos we re-calculate row tops asyncronously
            // when row heights change, which can temporarly result in gaps between rows.
            var caughtInInfiniteLoop = oldBottomPointer === bottomPointer
                && oldTopPointer === topPointer;
            if (caughtInInfiniteLoop) {
                return midPointer;
            }
            oldBottomPointer = bottomPointer;
            oldTopPointer = topPointer;
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
    ClientSideRowModel.prototype.forEachNode = function (callback, includeFooterNodes) {
        if (includeFooterNodes === void 0) { includeFooterNodes = false; }
        this.recursivelyWalkNodesAndCallback({
            nodes: __spreadArray([], __read((this.rootNode.childrenAfterGroup || []))),
            callback: callback,
            recursionType: RecursionType.Normal,
            index: 0,
            includeFooterNodes: includeFooterNodes
        });
    };
    ClientSideRowModel.prototype.forEachNodeAfterFilter = function (callback, includeFooterNodes) {
        if (includeFooterNodes === void 0) { includeFooterNodes = false; }
        this.recursivelyWalkNodesAndCallback({
            nodes: __spreadArray([], __read((this.rootNode.childrenAfterAggFilter || []))),
            callback: callback,
            recursionType: RecursionType.AfterFilter,
            index: 0,
            includeFooterNodes: includeFooterNodes
        });
    };
    ClientSideRowModel.prototype.forEachNodeAfterFilterAndSort = function (callback, includeFooterNodes) {
        if (includeFooterNodes === void 0) { includeFooterNodes = false; }
        this.recursivelyWalkNodesAndCallback({
            nodes: __spreadArray([], __read((this.rootNode.childrenAfterSort || []))),
            callback: callback,
            recursionType: RecursionType.AfterFilterAndSort,
            index: 0,
            includeFooterNodes: includeFooterNodes
        });
    };
    ClientSideRowModel.prototype.forEachPivotNode = function (callback, includeFooterNodes) {
        if (includeFooterNodes === void 0) { includeFooterNodes = false; }
        this.recursivelyWalkNodesAndCallback({
            nodes: [this.rootNode],
            callback: callback,
            recursionType: RecursionType.PivotNodes,
            index: 0,
            includeFooterNodes: includeFooterNodes
        });
    };
    // iterates through each item in memory, and calls the callback function
    // nodes - the rowNodes to traverse
    // callback - the user provided callback
    // recursion type - need this to know what child nodes to recurse, eg if looking at all nodes, or filtered notes etc
    // index - works similar to the index in forEach in javascript's array function
    ClientSideRowModel.prototype.recursivelyWalkNodesAndCallback = function (params) {
        var _a;
        var nodes = params.nodes, callback = params.callback, recursionType = params.recursionType, includeFooterNodes = params.includeFooterNodes;
        var index = params.index;
        var firstNode = nodes[0];
        if (includeFooterNodes && ((_a = firstNode === null || firstNode === void 0 ? void 0 : firstNode.parent) === null || _a === void 0 ? void 0 : _a.sibling)) {
            nodes.push(firstNode.parent.sibling);
        }
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            callback(node, index++);
            // go to the next level if it is a group
            if (node.hasChildren() && !node.footer) {
                // depending on the recursion type, we pick a difference set of children
                var nodeChildren = null;
                switch (recursionType) {
                    case RecursionType.Normal:
                        nodeChildren = node.childrenAfterGroup;
                        break;
                    case RecursionType.AfterFilter:
                        nodeChildren = node.childrenAfterAggFilter;
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
                    index = this.recursivelyWalkNodesAndCallback({
                        nodes: __spreadArray([], __read(nodeChildren)),
                        callback: callback,
                        recursionType: recursionType,
                        index: index,
                        includeFooterNodes: includeFooterNodes
                    });
                }
            }
        }
        return index;
    };
    // it's possible to recompute the aggregate without doing the other parts
    // + api.refreshClientSideRowModel('aggregate')
    ClientSideRowModel.prototype.doAggregate = function (changedPath) {
        if (this.aggregationStage) {
            this.aggregationStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
        }
    };
    ClientSideRowModel.prototype.doFilterAggregates = function (changedPath) {
        if (this.filterAggregatesStage) {
            this.filterAggregatesStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
        }
        else {
            // If filterAggregatesStage is undefined, then so is the grouping stage, so all children should be on the rootNode.
            this.rootNode.childrenAfterAggFilter = this.rootNode.childrenAfterFilter;
        }
    };
    // + gridApi.expandAll()
    // + gridApi.collapseAll()
    ClientSideRowModel.prototype.expandOrCollapseAll = function (expand) {
        var usingTreeData = this.gridOptionsService.isTreeData();
        var usingPivotMode = this.columnModel.isPivotActive();
        var recursiveExpandOrCollapse = function (rowNodes) {
            if (!rowNodes) {
                return;
            }
            rowNodes.forEach(function (rowNode) {
                var actionRow = function () {
                    rowNode.expanded = expand;
                    recursiveExpandOrCollapse(rowNode.childrenAfterGroup);
                };
                if (usingTreeData) {
                    var hasChildren = _.exists(rowNode.childrenAfterGroup);
                    if (hasChildren) {
                        actionRow();
                    }
                    return;
                }
                if (usingPivotMode) {
                    var notLeafGroup = !rowNode.leafGroup;
                    if (notLeafGroup) {
                        actionRow();
                    }
                    return;
                }
                var isRowGroup = rowNode.group;
                if (isRowGroup) {
                    actionRow();
                }
            });
        };
        if (this.rootNode) {
            recursiveExpandOrCollapse(this.rootNode.childrenAfterGroup);
        }
        this.refreshModel({ step: ClientSideRowModelSteps.MAP });
        var eventSource = expand ? 'expandAll' : 'collapseAll';
        var event = {
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
                this.groupStage.execute({
                    rowNode: this.rootNode,
                    changedPath: changedPath,
                    afterColumnsChanged: afterColumnsChanged
                });
                // set open/closed state on groups
                this.restoreGroupState(groupState);
            }
            if (this.gridOptionsService.is('groupSelectsChildren')) {
                var selectionChanged = this.selectionService.updateGroupsFromChildrenSelections('rowGroupChanged', changedPath);
                if (selectionChanged) {
                    var event_1 = {
                        type: Events.EVENT_SELECTION_CHANGED,
                        source: 'rowGroupChanged'
                    };
                    this.eventService.dispatchEvent(event_1);
                }
            }
        }
        else {
            this.rootNode.childrenAfterGroup = this.rootNode.allLeafChildren;
            if (this.rootNode.sibling) {
                this.rootNode.sibling.childrenAfterGroup = this.rootNode.childrenAfterGroup;
            }
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
        if (!this.rootNode.childrenAfterGroup || !this.gridOptionsService.is('rememberGroupStateWhenNewData')) {
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
        return this.nodeManager.getRowNode(id);
    };
    // rows: the rows to put into the model
    ClientSideRowModel.prototype.setRowData = function (rowData) {
        // no need to invalidate cache, as the cache is stored on the rowNode,
        // so new rowNodes means the cache is wiped anyway.
        // remember group state, so we can expand groups that should be expanded
        var groupState = this.getGroupState();
        this.nodeManager.setRowData(rowData);
        // - clears selection
        this.selectionService.reset();
        // - updates filters
        this.filterManager.onNewRowsLoaded('rowDataUpdated');
        // this event kicks off:
        // - shows 'no rows' overlay if needed
        var rowDataUpdatedEvent = {
            type: Events.EVENT_ROW_DATA_UPDATED
        };
        this.eventService.dispatchEvent(rowDataUpdatedEvent);
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
            var waitMillis = this.gridOptionsService.getAsyncTransactionWaitMillis();
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
            var event_2 = {
                type: Events.EVENT_ASYNC_TRANSACTIONS_FLUSHED,
                results: rowNodeTrans
            };
            this.eventService.dispatchEvent(event_2);
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
        var suppressSortOrder = this.gridOptionsService.is('suppressMaintainUnsortedOrder');
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
        var animate = !this.gridOptionsService.is('suppressAnimationFrame');
        if (forceRowNodeOrder) {
            rowNodeOrder = this.createRowNodeOrder();
        }
        this.refreshModel({
            step: ClientSideRowModelSteps.EVERYTHING,
            rowNodeTransactions: rowNodeTrans,
            rowNodeOrder: rowNodeOrder,
            keepRenderedRows: true,
            keepEditingRows: true,
            animate: animate
        });
        // - updates filters
        this.filterManager.onNewRowsLoaded('rowDataUpdated');
        var event = {
            type: Events.EVENT_ROW_DATA_UPDATED
        };
        this.eventService.dispatchEvent(event);
    };
    ClientSideRowModel.prototype.doRowsToDisplay = function () {
        this.rowsToDisplay = this.flattenStage.execute({ rowNode: this.rootNode });
    };
    ClientSideRowModel.prototype.onRowHeightChanged = function () {
        this.refreshModel({ step: ClientSideRowModelSteps.MAP, keepRenderedRows: true, keepEditingRows: true, keepUndoRedoStack: true });
    };
    /** This method is debounced. It is used for row auto-height. If we don't debounce,
     * then the Row Models will end up recalculating each row position
     * for each row height change and result in the Row Renderer laying out rows.
     * This is particularly bad if using print layout, and showing eg 1,000 rows,
     * each row will change it's height, causing Row Model to update 1,000 times.
     */
    ClientSideRowModel.prototype.onRowHeightChangedDebounced = function () {
        this.onRowHeightChanged_debounced();
    };
    ClientSideRowModel.prototype.resetRowHeights = function () {
        var atLeastOne = this.resetRowHeightsForAllRowNodes();
        this.rootNode.setRowHeight(this.rootNode.rowHeight, true);
        // when pivotMode but pivot not active, root node is displayed on its own
        // because it's only ever displayed alone, refreshing the model (onRowHeightChanged) is not required
        if (atLeastOne) {
            this.onRowHeightChanged();
        }
    };
    ClientSideRowModel.prototype.resetRowHeightsForAllRowNodes = function () {
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
        return atLeastOne;
    };
    ClientSideRowModel.prototype.onGridStylesChanges = function () {
        if (this.columnModel.isAutoRowHeightActive()) {
            return;
        }
        this.resetRowHeights();
    };
    __decorate([
        Autowired('columnModel')
    ], ClientSideRowModel.prototype, "columnModel", void 0);
    __decorate([
        Autowired('selectionService')
    ], ClientSideRowModel.prototype, "selectionService", void 0);
    __decorate([
        Autowired('filterManager')
    ], ClientSideRowModel.prototype, "filterManager", void 0);
    __decorate([
        Autowired('valueCache')
    ], ClientSideRowModel.prototype, "valueCache", void 0);
    __decorate([
        Autowired('beans')
    ], ClientSideRowModel.prototype, "beans", void 0);
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
        Optional('filterAggregatesStage')
    ], ClientSideRowModel.prototype, "filterAggregatesStage", void 0);
    __decorate([
        PostConstruct
    ], ClientSideRowModel.prototype, "init", null);
    ClientSideRowModel = __decorate([
        Bean('rowModel')
    ], ClientSideRowModel);
    return ClientSideRowModel;
}(BeanStub));
export { ClientSideRowModel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50U2lkZVJvd01vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NsaWVudFNpZGVSb3dNb2RlbC9jbGllbnRTaWRlUm93TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFDUixXQUFXLEVBRVgsTUFBTSxFQU1OLFFBQVEsRUFDUixhQUFhLEVBRWIsdUJBQXVCLEVBS3ZCLE9BQU8sRUFDUCxvQkFBb0IsR0FVdkIsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVoRSxJQUFLLGFBQXFFO0FBQTFFLFdBQUssYUFBYTtJQUFHLHFEQUFNLENBQUE7SUFBRSwrREFBVyxDQUFBO0lBQUUsNkVBQWtCLENBQUE7SUFBRSw2REFBVSxDQUFBO0FBQUMsQ0FBQyxFQUFyRSxhQUFhLEtBQWIsYUFBYSxRQUF3RDtBQVkxRTtJQUF3QyxzQ0FBUTtJQUFoRDtRQUFBLHFFQTJqQ0M7UUF4aUNXLGtDQUE0QixHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUluRixtQkFBYSxHQUFjLEVBQUUsQ0FBQyxDQUFDLHFDQUFxQzs7SUFvaUNoRixDQUFDO0lBN2hDVSxpQ0FBSSxHQUFYO1FBQ0ksSUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUN6RyxJQUFNLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMs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