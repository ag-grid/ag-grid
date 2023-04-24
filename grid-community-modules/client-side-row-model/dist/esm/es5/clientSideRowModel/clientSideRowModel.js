var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
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
        var firstRowHit = !lastInRange;
        var lastRowHit = false;
        var lastRow;
        var result = [];
        var groupsSelectChildren = this.gridOptionsService.is('groupSelectsChildren');
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
            nodes: __spread((this.rootNode.childrenAfterGroup || [])),
            callback: callback,
            recursionType: RecursionType.Normal,
            index: 0,
            includeFooterNodes: includeFooterNodes
        });
    };
    ClientSideRowModel.prototype.forEachNodeAfterFilter = function (callback, includeFooterNodes) {
        if (includeFooterNodes === void 0) { includeFooterNodes = false; }
        this.recursivelyWalkNodesAndCallback({
            nodes: __spread((this.rootNode.childrenAfterAggFilter || [])),
            callback: callback,
            recursionType: RecursionType.AfterFilter,
            index: 0,
            includeFooterNodes: includeFooterNodes
        });
    };
    ClientSideRowModel.prototype.forEachNodeAfterFilterAndSort = function (callback, includeFooterNodes) {
        if (includeFooterNodes === void 0) { includeFooterNodes = false; }
        this.recursivelyWalkNodesAndCallback({
            nodes: __spread((this.rootNode.childrenAfterSort || [])),
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
                        nodes: __spread(nodeChildren),
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
