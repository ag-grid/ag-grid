var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
let ClientSideRowModel = class ClientSideRowModel extends BeanStub {
    constructor() {
        super(...arguments);
        this.onRowHeightChanged_debounced = _.debounce(this.onRowHeightChanged.bind(this), 100);
        this.rowsToDisplay = []; // the rows mapped to rows to display
    }
    init() {
        const refreshEverythingFunc = this.refreshModel.bind(this, { step: ClientSideRowModelSteps.EVERYTHING });
        const animate = !this.gridOptionsService.is('suppressAnimationFrame');
        const refreshEverythingAfterColsChangedFunc = this.refreshModel.bind(this, {
            step: ClientSideRowModelSteps.EVERYTHING,
            afterColumnsChanged: true,
            keepRenderedRows: true,
            animate
        });
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refreshEverythingAfterColsChangedFunc);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, refreshEverythingFunc);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.refreshModel.bind(this, { step: ClientSideRowModelSteps.PIVOT }));
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, refreshEverythingFunc);
        this.addManagedListener(this.eventService, Events.EVENT_GRID_STYLES_CHANGED, this.onGridStylesChanges.bind(this));
        const refreshMapListener = this.refreshModel.bind(this, {
            step: ClientSideRowModelSteps.MAP,
            keepRenderedRows: true,
            animate
        });
        this.addManagedPropertyListener('groupRemoveSingleChildren', refreshMapListener);
        this.addManagedPropertyListener('groupRemoveLowestSingleChildren', refreshMapListener);
        this.rootNode = new RowNode(this.beans);
        this.nodeManager = new ClientSideNodeManager(this.rootNode, this.gridOptionsService, this.eventService, this.columnModel, this.selectionService, this.beans);
    }
    start() {
        const rowData = this.gridOptionsService.get('rowData');
        if (rowData) {
            this.setRowData(rowData);
        }
    }
    ensureRowHeightsValid(startPixel, endPixel, startLimitIndex, endLimitIndex) {
        let atLeastOneChange;
        let res = false;
        // we do this multiple times as changing the row heights can also change the first and last rows,
        // so the first pass can make lots of rows smaller, which means the second pass we end up changing
        // more rows.
        do {
            atLeastOneChange = false;
            const rowAtStartPixel = this.getRowIndexAtPixel(startPixel);
            const rowAtEndPixel = this.getRowIndexAtPixel(endPixel);
            // keep check to current page if doing pagination
            const firstRow = Math.max(rowAtStartPixel, startLimitIndex);
            const lastRow = Math.min(rowAtEndPixel, endLimitIndex);
            for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
                const rowNode = this.getRow(rowIndex);
                if (rowNode.rowHeightEstimated) {
                    const rowHeight = this.gridOptionsService.getRowHeightForNode(rowNode);
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
    }
    setRowTopAndRowIndex() {
        const defaultRowHeight = this.environment.getDefaultRowHeight();
        let nextRowTop = 0;
        // mapping displayed rows is not needed for this method, however it's used in
        // clearRowTopAndRowIndex(), and given we are looping through this.rowsToDisplay here,
        // we create the map here for performance reasons, so we don't loop a second time
        // in clearRowTopAndRowIndex()
        const displayedRowsMapped = new Set();
        // we don't estimate if doing fullHeight or autoHeight, as all rows get rendered all the time
        // with these two layouts.
        const allowEstimate = this.gridOptionsService.isDomLayout('normal');
        for (let i = 0; i < this.rowsToDisplay.length; i++) {
            const rowNode = this.rowsToDisplay[i];
            if (rowNode.id != null) {
                displayedRowsMapped.add(rowNode.id);
            }
            if (rowNode.rowHeight == null) {
                const rowHeight = this.gridOptionsService.getRowHeightForNode(rowNode, allowEstimate, defaultRowHeight);
                rowNode.setRowHeight(rowHeight.height, rowHeight.estimated);
            }
            rowNode.setRowTop(nextRowTop);
            rowNode.setRowIndex(i);
            nextRowTop += rowNode.rowHeight;
        }
        return displayedRowsMapped;
    }
    clearRowTopAndRowIndex(changedPath, displayedRowsMapped) {
        const changedPathActive = changedPath.isActive();
        const clearIfNotDisplayed = (rowNode) => {
            if (rowNode && rowNode.id != null && !displayedRowsMapped.has(rowNode.id)) {
                rowNode.clearRowTopAndRowIndex();
            }
        };
        const recurse = (rowNode) => {
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
                    const isRootNode = rowNode.level == -1; // we need to give special consideration for root node,
                    // as expanded=undefined for root node
                    const skipChildren = changedPathActive && !isRootNode && !rowNode.expanded;
                    if (!skipChildren) {
                        rowNode.childrenAfterGroup.forEach(recurse);
                    }
                }
            }
        };
        recurse(this.rootNode);
    }
    // returns false if row was moved, otherwise true
    ensureRowsAtPixel(rowNodes, pixel, increment = 0) {
        const indexAtPixelNow = this.getRowIndexAtPixel(pixel);
        const rowNodeAtPixelNow = this.getRow(indexAtPixelNow);
        const animate = !this.gridOptionsService.is('suppressAnimationFrame');
        if (rowNodeAtPixelNow === rowNodes[0]) {
            return false;
        }
        rowNodes.forEach(rowNode => {
            _.removeFromArray(this.rootNode.allLeafChildren, rowNode);
        });
        rowNodes.forEach((rowNode, idx) => {
            _.insertIntoArray(this.rootNode.allLeafChildren, rowNode, Math.max(indexAtPixelNow + increment, 0) + idx);
        });
        this.refreshModel({
            step: ClientSideRowModelSteps.EVERYTHING,
            keepRenderedRows: true,
            keepEditingRows: true,
            animate
        });
        return true;
    }
    highlightRowAtPixel(rowNode, pixel) {
        const indexAtPixelNow = pixel != null ? this.getRowIndexAtPixel(pixel) : null;
        const rowNodeAtPixelNow = indexAtPixelNow != null ? this.getRow(indexAtPixelNow) : null;
        if (!rowNodeAtPixelNow || !rowNode || rowNodeAtPixelNow === rowNode || pixel == null) {
            if (this.lastHighlightedRow) {
                this.lastHighlightedRow.setHighlighted(null);
                this.lastHighlightedRow = null;
            }
            return;
        }
        const highlight = this.getHighlightPosition(pixel, rowNodeAtPixelNow);
        if (this.lastHighlightedRow && this.lastHighlightedRow !== rowNodeAtPixelNow) {
            this.lastHighlightedRow.setHighlighted(null);
            this.lastHighlightedRow = null;
        }
        rowNodeAtPixelNow.setHighlighted(highlight);
        this.lastHighlightedRow = rowNodeAtPixelNow;
    }
    getHighlightPosition(pixel, rowNode) {
        if (!rowNode) {
            const index = this.getRowIndexAtPixel(pixel);
            rowNode = this.getRow(index || 0);
            if (!rowNode) {
                return RowHighlightPosition.Below;
            }
        }
        const { rowTop, rowHeight } = rowNode;
        return pixel - rowTop < rowHeight / 2 ? RowHighlightPosition.Above : RowHighlightPosition.Below;
    }
    getLastHighlightedRowNode() {
        return this.lastHighlightedRow;
    }
    isLastRowIndexKnown() {
        return true;
    }
    getRowCount() {
        if (this.rowsToDisplay) {
            return this.rowsToDisplay.length;
        }
        return 0;
    }
    getTopLevelRowCount() {
        const showingRootNode = this.rowsToDisplay && this.rowsToDisplay[0] === this.rootNode;
        if (showingRootNode) {
            return 1;
        }
        const filteredChildren = this.rootNode.childrenAfterAggFilter;
        return filteredChildren ? filteredChildren.length : 0;
    }
    getTopLevelRowDisplayedIndex(topLevelIndex) {
        const showingRootNode = this.rowsToDisplay && this.rowsToDisplay[0] === this.rootNode;
        if (showingRootNode) {
            return topLevelIndex;
        }
        let rowNode = this.rootNode.childrenAfterSort[topLevelIndex];
        if (this.gridOptionsService.is('groupHideOpenParents')) {
            // if hideOpenParents, and this row open, then this row is now displayed at this index, first child is
            while (rowNode.expanded && rowNode.childrenAfterSort && rowNode.childrenAfterSort.length > 0) {
                rowNode = rowNode.childrenAfterSort[0];
            }
        }
        return rowNode.rowIndex;
    }
    getRowBounds(index) {
        if (_.missing(this.rowsToDisplay)) {
            return null;
        }
        const rowNode = this.rowsToDisplay[index];
        if (rowNode) {
            return {
                rowTop: rowNode.rowTop,
                rowHeight: rowNode.rowHeight
            };
        }
        return null;
    }
    onRowGroupOpened() {
        const animate = this.gridOptionsService.isAnimateRows();
        this.refreshModel({ step: ClientSideRowModelSteps.MAP, keepRenderedRows: true, animate: animate });
    }
    onFilterChanged(event) {
        if (event.afterDataChange) {
            return;
        }
        const animate = this.gridOptionsService.isAnimateRows();
        const primaryOrQuickFilterChanged = event.columns.length === 0 || event.columns.some(col => col.isPrimary());
        const step = primaryOrQuickFilterChanged ? ClientSideRowModelSteps.FILTER : ClientSideRowModelSteps.FILTER_AGGREGATES;
        this.refreshModel({ step: step, keepRenderedRows: true, animate: animate });
    }
    onSortChanged() {
        const animate = this.gridOptionsService.isAnimateRows();
        this.refreshModel({ step: ClientSideRowModelSteps.SORT, keepRenderedRows: true, animate: animate, keepEditingRows: true });
    }
    getType() {
        return 'clientSide';
    }
    onValueChanged() {
        if (this.columnModel.isPivotActive()) {
            this.refreshModel({ step: ClientSideRowModelSteps.PIVOT });
        }
        else {
            this.refreshModel({ step: ClientSideRowModelSteps.AGGREGATE });
        }
    }
    createChangePath(rowNodeTransactions) {
        // for updates, if the row is updated at all, then we re-calc all the values
        // in that row. we could compare each value to each old value, however if we
        // did this, we would be calling the valueService twice, once on the old value
        // and once on the new value. so it's less valueGetter calls if we just assume
        // each column is different. that way the changedPath is used so that only
        // the impacted parent rows are recalculated, parents who's children have
        // not changed are not impacted.
        const noTransactions = _.missingOrEmpty(rowNodeTransactions);
        const changedPath = new ChangedPath(false, this.rootNode);
        if (noTransactions || this.gridOptionsService.isTreeData()) {
            changedPath.setInactive();
        }
        return changedPath;
    }
    isSuppressModelUpdateAfterUpdateTransaction(params) {
        if (!this.gridOptionsService.is('suppressModelUpdateAfterUpdateTransaction')) {
            return false;
        }
        // return true if we are only doing update transactions
        if (params.rowNodeTransactions == null) {
            return false;
        }
        const transWithAddsOrDeletes = params.rowNodeTransactions.filter(tx => (tx.add != null && tx.add.length > 0) || (tx.remove != null && tx.remove.length > 0));
        const transactionsContainUpdatesOnly = transWithAddsOrDeletes == null || transWithAddsOrDeletes.length == 0;
        return transactionsContainUpdatesOnly;
    }
    buildRefreshModelParams(step) {
        let paramsStep = ClientSideRowModelSteps.EVERYTHING;
        const stepsMapped = {
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
            console.error(`AG Grid: invalid step ${step}, available steps are ${Object.keys(stepsMapped).join(', ')}`);
            return undefined;
        }
        const animate = !this.gridOptionsService.is('suppressAnimationFrame');
        const modelParams = {
            step: paramsStep,
            keepRenderedRows: true,
            keepEditingRows: true,
            animate
        };
        return modelParams;
    }
    refreshModel(paramsOrStep) {
        let params = typeof paramsOrStep === 'object' && "step" in paramsOrStep ? paramsOrStep : this.buildRefreshModelParams(paramsOrStep);
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
        const changedPath = this.createChangePath(params.rowNodeTransactions);
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
        const displayedNodesMapped = this.setRowTopAndRowIndex();
        this.clearRowTopAndRowIndex(changedPath, displayedNodesMapped);
        const event = {
            type: Events.EVENT_MODEL_UPDATED,
            animate: params.animate,
            keepRenderedRows: params.keepRenderedRows,
            newData: params.newData,
            newPage: false,
            keepUndoRedoStack: params.keepUndoRedoStack
        };
        this.eventService.dispatchEvent(event);
    }
    isEmpty() {
        const rowsMissing = _.missing(this.rootNode.allLeafChildren) || this.rootNode.allLeafChildren.length === 0;
        return _.missing(this.rootNode) || rowsMissing || !this.columnModel.isReady();
    }
    isRowsToRender() {
        return _.exists(this.rowsToDisplay) && this.rowsToDisplay.length > 0;
    }
    getNodesInRangeForSelection(firstInRange, lastInRange) {
        // if lastSelectedNode is missing, we start at the first row
        let started = !lastInRange;
        let finished = false;
        const result = [];
        const groupsSelectChildren = this.gridOptionsService.is('groupSelectsChildren');
        this.forEachNodeAfterFilterAndSort(rowNode => {
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
                        result.push(...rowNode.allLeafChildren);
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
            const includeThisNode = !rowNode.group || !groupsSelectChildren;
            if (includeThisNode) {
                result.push(rowNode);
                return;
            }
        });
        return result;
    }
    setDatasource(datasource) {
        console.error('AG Grid: should never call setDatasource on clientSideRowController');
    }
    getTopLevelNodes() {
        return this.rootNode ? this.rootNode.childrenAfterGroup : null;
    }
    getRootNode() {
        return this.rootNode;
    }
    getRow(index) {
        return this.rowsToDisplay[index];
    }
    isRowPresent(rowNode) {
        return this.rowsToDisplay.indexOf(rowNode) >= 0;
    }
    getRowIndexAtPixel(pixelToMatch) {
        if (this.isEmpty() || this.rowsToDisplay.length === 0) {
            return -1;
        }
        // do binary search of tree
        // http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/
        let bottomPointer = 0;
        let topPointer = this.rowsToDisplay.length - 1;
        // quick check, if the pixel is out of bounds, then return last row
        if (pixelToMatch <= 0) {
            // if pixel is less than or equal zero, it's always the first row
            return 0;
        }
        const lastNode = _.last(this.rowsToDisplay);
        if (lastNode.rowTop <= pixelToMatch) {
            return this.rowsToDisplay.length - 1;
        }
        let oldBottomPointer = -1;
        let oldTopPointer = -1;
        while (true) {
            const midPointer = Math.floor((bottomPointer + topPointer) / 2);
            const currentRowNode = this.rowsToDisplay[midPointer];
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
            const caughtInInfiniteLoop = oldBottomPointer === bottomPointer
                && oldTopPointer === topPointer;
            if (caughtInInfiniteLoop) {
                return midPointer;
            }
            oldBottomPointer = bottomPointer;
            oldTopPointer = topPointer;
        }
    }
    isRowInPixel(rowNode, pixelToMatch) {
        const topPixel = rowNode.rowTop;
        const bottomPixel = rowNode.rowTop + rowNode.rowHeight;
        const pixelInRow = topPixel <= pixelToMatch && bottomPixel > pixelToMatch;
        return pixelInRow;
    }
    forEachLeafNode(callback) {
        if (this.rootNode.allLeafChildren) {
            this.rootNode.allLeafChildren.forEach((rowNode, index) => callback(rowNode, index));
        }
    }
    forEachNode(callback, includeFooterNodes = false) {
        this.recursivelyWalkNodesAndCallback({
            nodes: [...(this.rootNode.childrenAfterGroup || [])],
            callback,
            recursionType: RecursionType.Normal,
            index: 0,
            includeFooterNodes
        });
    }
    forEachNodeAfterFilter(callback, includeFooterNodes = false) {
        this.recursivelyWalkNodesAndCallback({
            nodes: [...(this.rootNode.childrenAfterAggFilter || [])],
            callback,
            recursionType: RecursionType.AfterFilter,
            index: 0,
            includeFooterNodes
        });
    }
    forEachNodeAfterFilterAndSort(callback, includeFooterNodes = false) {
        this.recursivelyWalkNodesAndCallback({
            nodes: [...(this.rootNode.childrenAfterSort || [])],
            callback,
            recursionType: RecursionType.AfterFilterAndSort,
            index: 0,
            includeFooterNodes
        });
    }
    forEachPivotNode(callback, includeFooterNodes = false) {
        this.recursivelyWalkNodesAndCallback({
            nodes: [this.rootNode],
            callback,
            recursionType: RecursionType.PivotNodes,
            index: 0,
            includeFooterNodes
        });
    }
    // iterates through each item in memory, and calls the callback function
    // nodes - the rowNodes to traverse
    // callback - the user provided callback
    // recursion type - need this to know what child nodes to recurse, eg if looking at all nodes, or filtered notes etc
    // index - works similar to the index in forEach in javascript's array function
    recursivelyWalkNodesAndCallback(params) {
        var _a;
        const { nodes, callback, recursionType, includeFooterNodes } = params;
        let { index } = params;
        const firstNode = nodes[0];
        if (includeFooterNodes && ((_a = firstNode === null || firstNode === void 0 ? void 0 : firstNode.parent) === null || _a === void 0 ? void 0 : _a.sibling)) {
            nodes.push(firstNode.parent.sibling);
        }
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            callback(node, index++);
            // go to the next level if it is a group
            if (node.hasChildren() && !node.footer) {
                // depending on the recursion type, we pick a difference set of children
                let nodeChildren = null;
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
                        nodes: [...nodeChildren],
                        callback,
                        recursionType,
                        index,
                        includeFooterNodes
                    });
                }
            }
        }
        return index;
    }
    // it's possible to recompute the aggregate without doing the other parts
    // + api.refreshClientSideRowModel('aggregate')
    doAggregate(changedPath) {
        if (this.aggregationStage) {
            this.aggregationStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
        }
    }
    doFilterAggregates(changedPath) {
        if (this.filterAggregatesStage) {
            this.filterAggregatesStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
        }
        else {
            // If filterAggregatesStage is undefined, then so is the grouping stage, so all children should be on the rootNode.
            this.rootNode.childrenAfterAggFilter = this.rootNode.childrenAfterFilter;
        }
    }
    // + gridApi.expandAll()
    // + gridApi.collapseAll()
    expandOrCollapseAll(expand) {
        const usingTreeData = this.gridOptionsService.isTreeData();
        const usingPivotMode = this.columnModel.isPivotActive();
        const recursiveExpandOrCollapse = (rowNodes) => {
            if (!rowNodes) {
                return;
            }
            rowNodes.forEach(rowNode => {
                const actionRow = () => {
                    rowNode.expanded = expand;
                    recursiveExpandOrCollapse(rowNode.childrenAfterGroup);
                };
                if (usingTreeData) {
                    const hasChildren = _.exists(rowNode.childrenAfterGroup);
                    if (hasChildren) {
                        actionRow();
                    }
                    return;
                }
                if (usingPivotMode) {
                    const notLeafGroup = !rowNode.leafGroup;
                    if (notLeafGroup) {
                        actionRow();
                    }
                    return;
                }
                const isRowGroup = rowNode.group;
                if (isRowGroup) {
                    actionRow();
                }
            });
        };
        if (this.rootNode) {
            recursiveExpandOrCollapse(this.rootNode.childrenAfterGroup);
        }
        this.refreshModel({ step: ClientSideRowModelSteps.MAP });
        const eventSource = expand ? 'expandAll' : 'collapseAll';
        const event = {
            type: Events.EVENT_EXPAND_COLLAPSE_ALL,
            source: eventSource
        };
        this.eventService.dispatchEvent(event);
    }
    doSort(rowNodeTransactions, changedPath) {
        this.sortStage.execute({
            rowNode: this.rootNode,
            rowNodeTransactions: rowNodeTransactions,
            changedPath: changedPath
        });
    }
    doRowGrouping(groupState, rowNodeTransactions, rowNodeOrder, changedPath, afterColumnsChanged) {
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
                const selectionChanged = this.selectionService.updateGroupsFromChildrenSelections('rowGroupChanged', changedPath);
                if (selectionChanged) {
                    const event = {
                        type: Events.EVENT_SELECTION_CHANGED,
                        source: 'rowGroupChanged'
                    };
                    this.eventService.dispatchEvent(event);
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
    }
    restoreGroupState(groupState) {
        if (!groupState) {
            return;
        }
        _.traverseNodesWithKey(this.rootNode.childrenAfterGroup, (node, key) => {
            // if the group was open last time, then open it this time. however
            // if was not open last time, then don't touch the group, so the 'groupDefaultExpanded'
            // setting will take effect.
            if (typeof groupState[key] === 'boolean') {
                node.expanded = groupState[key];
            }
        });
    }
    doFilter(changedPath) {
        this.filterStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
    }
    doPivot(changedPath) {
        if (this.pivotStage) {
            this.pivotStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
        }
    }
    getGroupState() {
        if (!this.rootNode.childrenAfterGroup || !this.gridOptionsService.is('rememberGroupStateWhenNewData')) {
            return null;
        }
        const result = {};
        _.traverseNodesWithKey(this.rootNode.childrenAfterGroup, (node, key) => result[key] = node.expanded);
        return result;
    }
    getCopyOfNodesMap() {
        return this.nodeManager.getCopyOfNodesMap();
    }
    getRowNode(id) {
        // although id is typed a string, this could be called by the user, and they could have passed a number
        const idIsGroup = typeof id == 'string' && id.indexOf(RowNode.ID_PREFIX_ROW_GROUP) == 0;
        if (idIsGroup) {
            // only one users complained about getRowNode not working for groups, after years of
            // this working for normal rows. so have done quick implementation. if users complain
            // about performance, then GroupStage should store / manage created groups in a map,
            // which is a chunk of work.
            let res = undefined;
            this.forEachNode(node => {
                if (node.id === id) {
                    res = node;
                }
            });
            return res;
        }
        return this.nodeManager.getRowNode(id);
    }
    // rows: the rows to put into the model
    setRowData(rowData) {
        // no need to invalidate cache, as the cache is stored on the rowNode,
        // so new rowNodes means the cache is wiped anyway.
        // remember group state, so we can expand groups that should be expanded
        const groupState = this.getGroupState();
        this.nodeManager.setRowData(rowData);
        // - clears selection
        this.selectionService.reset();
        // - updates filters
        this.filterManager.onNewRowsLoaded('rowDataUpdated');
        // this event kicks off:
        // - shows 'no rows' overlay if needed
        const rowDataUpdatedEvent = {
            type: Events.EVENT_ROW_DATA_UPDATED
        };
        this.eventService.dispatchEvent(rowDataUpdatedEvent);
        this.refreshModel({
            step: ClientSideRowModelSteps.EVERYTHING,
            groupState: groupState,
            newData: true
        });
    }
    batchUpdateRowData(rowDataTransaction, callback) {
        if (this.applyAsyncTransactionsTimeout == null) {
            this.rowDataTransactionBatch = [];
            const waitMillis = this.gridOptionsService.getAsyncTransactionWaitMillis();
            this.applyAsyncTransactionsTimeout = window.setTimeout(() => {
                this.executeBatchUpdateRowData();
            }, waitMillis);
        }
        this.rowDataTransactionBatch.push({ rowDataTransaction: rowDataTransaction, callback: callback });
    }
    flushAsyncTransactions() {
        if (this.applyAsyncTransactionsTimeout != null) {
            clearTimeout(this.applyAsyncTransactionsTimeout);
            this.executeBatchUpdateRowData();
        }
    }
    executeBatchUpdateRowData() {
        this.valueCache.onDataChanged();
        const callbackFuncsBound = [];
        const rowNodeTrans = [];
        // The rowGroup stage uses rowNodeOrder if order was provided. if we didn't pass 'true' to
        // commonUpdateRowData, using addIndex would have no effect when grouping.
        let forceRowNodeOrder = false;
        if (this.rowDataTransactionBatch) {
            this.rowDataTransactionBatch.forEach(tranItem => {
                const rowNodeTran = this.nodeManager.updateRowData(tranItem.rowDataTransaction, undefined);
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
            window.setTimeout(() => {
                callbackFuncsBound.forEach(func => func());
            }, 0);
        }
        if (rowNodeTrans.length > 0) {
            const event = {
                type: Events.EVENT_ASYNC_TRANSACTIONS_FLUSHED,
                results: rowNodeTrans
            };
            this.eventService.dispatchEvent(event);
        }
        this.rowDataTransactionBatch = null;
        this.applyAsyncTransactionsTimeout = undefined;
    }
    updateRowData(rowDataTran, rowNodeOrder) {
        this.valueCache.onDataChanged();
        const rowNodeTran = this.nodeManager.updateRowData(rowDataTran, rowNodeOrder);
        // if doing immutableData, addIndex is never present. however if doing standard transaction, and user
        // provided addIndex, then this is used in updateRowData. However if doing Enterprise, then the rowGroup
        // stage also uses the
        const forceRowNodeOrder = typeof rowDataTran.addIndex === 'number';
        this.commonUpdateRowData([rowNodeTran], rowNodeOrder, forceRowNodeOrder);
        return rowNodeTran;
    }
    createRowNodeOrder() {
        const suppressSortOrder = this.gridOptionsService.is('suppressMaintainUnsortedOrder');
        if (suppressSortOrder) {
            return;
        }
        const orderMap = {};
        if (this.rootNode && this.rootNode.allLeafChildren) {
            for (let index = 0; index < this.rootNode.allLeafChildren.length; index++) {
                const node = this.rootNode.allLeafChildren[index];
                orderMap[node.id] = index;
            }
        }
        return orderMap;
    }
    // common to updateRowData and batchUpdateRowData
    commonUpdateRowData(rowNodeTrans, rowNodeOrder, forceRowNodeOrder) {
        const animate = !this.gridOptionsService.is('suppressAnimationFrame');
        if (forceRowNodeOrder) {
            rowNodeOrder = this.createRowNodeOrder();
        }
        this.refreshModel({
            step: ClientSideRowModelSteps.EVERYTHING,
            rowNodeTransactions: rowNodeTrans,
            rowNodeOrder: rowNodeOrder,
            keepRenderedRows: true,
            keepEditingRows: true,
            animate
        });
        // - updates filters
        this.filterManager.onNewRowsLoaded('rowDataUpdated');
        const event = {
            type: Events.EVENT_ROW_DATA_UPDATED
        };
        this.eventService.dispatchEvent(event);
    }
    doRowsToDisplay() {
        this.rowsToDisplay = this.flattenStage.execute({ rowNode: this.rootNode });
    }
    onRowHeightChanged() {
        this.refreshModel({ step: ClientSideRowModelSteps.MAP, keepRenderedRows: true, keepEditingRows: true, keepUndoRedoStack: true });
    }
    /** This method is debounced. It is used for row auto-height. If we don't debounce,
     * then the Row Models will end up recalculating each row position
     * for each row height change and result in the Row Renderer laying out rows.
     * This is particularly bad if using print layout, and showing eg 1,000 rows,
     * each row will change it's height, causing Row Model to update 1,000 times.
     */
    onRowHeightChangedDebounced() {
        this.onRowHeightChanged_debounced();
    }
    resetRowHeights() {
        const atLeastOne = this.resetRowHeightsForAllRowNodes();
        this.rootNode.setRowHeight(this.rootNode.rowHeight, true);
        // when pivotMode but pivot not active, root node is displayed on its own
        // because it's only ever displayed alone, refreshing the model (onRowHeightChanged) is not required
        if (atLeastOne) {
            this.onRowHeightChanged();
        }
    }
    resetRowHeightsForAllRowNodes() {
        let atLeastOne = false;
        this.forEachNode(rowNode => {
            rowNode.setRowHeight(rowNode.rowHeight, true);
            // we keep the height each row is at, however we set estimated=true rather than clear the height.
            // this means the grid will not reset the row heights back to defaults, rather it will re-calc
            // the height for each row as the row is displayed. otherwise the scroll will jump when heights are reset.
            const detailNode = rowNode.detailNode;
            if (detailNode) {
                detailNode.setRowHeight(detailNode.rowHeight, true);
            }
            atLeastOne = true;
        });
        return atLeastOne;
    }
    onGridStylesChanges() {
        if (this.columnModel.isAutoRowHeightActive()) {
            return;
        }
        this.resetRowHeights();
    }
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
export { ClientSideRowModel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50U2lkZVJvd01vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NsaWVudFNpZGVSb3dNb2RlbC9jbGllbnRTaWRlUm93TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFDUixXQUFXLEVBRVgsTUFBTSxFQU1OLFFBQVEsRUFDUixhQUFhLEVBRWIsdUJBQXVCLEVBS3ZCLE9BQU8sRUFDUCxvQkFBb0IsR0FVdkIsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVoRSxJQUFLLGFBQXFFO0FBQTFFLFdBQUssYUFBYTtJQUFHLHFEQUFNLENBQUE7SUFBRSwrREFBVyxDQUFBO0lBQUUsNkVBQWtCLENBQUE7SUFBRSw2REFBVSxDQUFBO0FBQUMsQ0FBQyxFQUFyRSxhQUFhLEtBQWIsYUFBYSxRQUF3RDtBQVkxRSxJQUFhLGtCQUFrQixHQUEvQixNQUFhLGtCQUFtQixTQUFRLFFBQVE7SUFBaEQ7O1FBbUJZLGlDQUE0QixHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUluRixrQkFBYSxHQUFjLEVBQUUsQ0FBQyxDQUFDLHFDQUFxQztJQW9pQ2hGLENBQUM7SUE3aENVLElBQUk7UUFDUCxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSx1QkFBdUIsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQ3pHLE1BQU0sT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3RFLE1BQU0s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