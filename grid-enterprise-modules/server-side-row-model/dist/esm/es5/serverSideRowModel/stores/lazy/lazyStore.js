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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { _, Autowired, BeanStub, Events, NumberSequence, PostConstruct, PreDestroy, ServerSideTransactionResultStatus } from "@ag-grid-community/core";
import { LazyCache } from "./lazyCache";
var LazyStore = /** @class */ (function (_super) {
    __extends(LazyStore, _super);
    function LazyStore(ssrmParams, storeParams, parentRowNode) {
        var _this = _super.call(this) || this;
        _this.idSequence = new NumberSequence();
        _this.ssrmParams = ssrmParams;
        _this.parentRowNode = parentRowNode;
        _this.storeParams = storeParams;
        _this.level = parentRowNode.level + 1;
        _this.group = ssrmParams.rowGroupCols ? _this.level < ssrmParams.rowGroupCols.length : false;
        _this.leafGroup = ssrmParams.rowGroupCols ? _this.level === ssrmParams.rowGroupCols.length - 1 : false;
        _this.info = {};
        return _this;
    }
    LazyStore.prototype.init = function () {
        var _a;
        var numberOfRows = 1;
        if (this.level === 0) {
            numberOfRows = (_a = this.storeUtils.getServerSideInitialRowCount()) !== null && _a !== void 0 ? _a : 1;
            this.eventService.dispatchEventOnce({
                type: Events.EVENT_ROW_COUNT_READY
            });
        }
        this.cache = this.createManagedBean(new LazyCache(this, numberOfRows, this.storeParams));
        var usingTreeData = this.gridOptionsService.get('treeData');
        if (!usingTreeData && this.group) {
            var groupColVo = this.ssrmParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnModel.getRowGroupColumns()[this.level];
        }
    };
    LazyStore.prototype.destroyRowNodes = function () {
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.destroyBean(this.cache);
    };
    /**
     * Given a server response, ingest the rows outside of the data source lifecycle.
     *
     * @param rowDataParams the server response containing the rows to ingest
     * @param startRow the index to start ingesting rows
     * @param expectedRows the expected number of rows in the response (used to determine if the last row index is known)
     */
    LazyStore.prototype.applyRowData = function (rowDataParams, startRow, expectedRows) {
        this.cache.onLoadSuccess(startRow, expectedRows, rowDataParams);
    };
    /**
     * Applies a given transaction to the data set within this store
     *
     * @param transaction an object containing delta instructions determining the changes to apply to this store
     * @returns an object determining the status of this transaction and effected nodes
     */
    LazyStore.prototype.applyTransaction = function (transaction) {
        var _this = this;
        var _a, _b, _c;
        var idFunc = this.gridOptionsService.getCallback('getRowId');
        if (!idFunc) {
            console.warn('AG Grid: getRowId callback must be implemented for transactions to work. Transaction was ignored.');
            return {
                status: ServerSideTransactionResultStatus.Cancelled,
            };
        }
        var applyCallback = this.gridOptionsService.getCallback('isApplyServerSideTransaction');
        if (applyCallback) {
            var params = {
                transaction: transaction,
                parentNode: this.parentRowNode,
                groupLevelInfo: this.info
            };
            var apply = applyCallback(params);
            if (!apply) {
                return { status: ServerSideTransactionResultStatus.Cancelled };
            }
        }
        var updatedNodes = undefined;
        if ((_a = transaction.update) === null || _a === void 0 ? void 0 : _a.length) {
            updatedNodes = this.cache.updateRowNodes(transaction.update);
        }
        var insertedNodes = undefined;
        if ((_b = transaction.add) === null || _b === void 0 ? void 0 : _b.length) {
            var addIndex = transaction.addIndex;
            if (addIndex != null && addIndex < 0) {
                addIndex = undefined;
            }
            insertedNodes = this.cache.insertRowNodes(transaction.add, addIndex);
        }
        var removedNodes = undefined;
        if ((_c = transaction.remove) === null || _c === void 0 ? void 0 : _c.length) {
            var allIdsToRemove = transaction.remove.map(function (data) { return (idFunc({ level: _this.level, parentKeys: _this.parentRowNode.getGroupKeys(), data: data })); });
            var allUniqueIdsToRemove = __spreadArray([], __read(new Set(allIdsToRemove)), false);
            removedNodes = this.cache.removeRowNodes(allUniqueIdsToRemove);
        }
        this.updateSelectionAfterTransaction(updatedNodes, removedNodes);
        return {
            status: ServerSideTransactionResultStatus.Applied,
            update: updatedNodes,
            add: insertedNodes,
            remove: removedNodes,
        };
    };
    LazyStore.prototype.updateSelectionAfterTransaction = function (updatedNodes, removedNodes) {
        var nodesToDeselect = [];
        updatedNodes === null || updatedNodes === void 0 ? void 0 : updatedNodes.forEach(function (node) {
            if (node.isSelected() && !node.selectable) {
                nodesToDeselect.push(node);
            }
        });
        removedNodes === null || removedNodes === void 0 ? void 0 : removedNodes.forEach(function (node) {
            if (node.isSelected()) {
                nodesToDeselect.push(node);
            }
        });
        if (nodesToDeselect.length) {
            this.selectionService.setNodesSelected({
                newValue: false,
                clearSelection: false,
                nodes: nodesToDeselect,
                source: 'rowDataChanged',
            });
        }
    };
    /**
     * Clear the display indexes, used for fading rows out when stores are not being destroyed
     */
    LazyStore.prototype.clearDisplayIndexes = function () {
        var _this = this;
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.cache.getNodes().forEach(function (lazyNode) { return _this.blockUtils.clearDisplayIndex(lazyNode.node); });
        if (this.parentRowNode.sibling) {
            this.blockUtils.clearDisplayIndex(this.parentRowNode.sibling);
        }
        this.cache.clearDisplayIndexes();
    };
    /**
     * @returns an index representing the last sequentially displayed row in the grid for this store
     */
    LazyStore.prototype.getDisplayIndexStart = function () {
        return this.displayIndexStart;
    };
    /**
     * @returns the index representing one after the last sequentially displayed row in the grid for this store
     */
    LazyStore.prototype.getDisplayIndexEnd = function () {
        return this.displayIndexEnd;
    };
    /**
     * @returns the virtual size of this store
     */
    LazyStore.prototype.getRowCount = function () {
        if (this.parentRowNode.sibling) {
            return this.cache.getRowCount() + 1;
        }
        return this.cache.getRowCount();
    };
    /**
     * Sets the current row count of the store, and whether the last row index is known
     */
    LazyStore.prototype.setRowCount = function (rowCount, isLastRowIndexKnown) {
        this.cache.setRowCount(rowCount, isLastRowIndexKnown);
    };
    /**
     * Given a display index, returns whether that row is within this store or a child store of this store
     *
     * @param displayIndex the visible index of a row
     * @returns whether or not the row exists within this store
     */
    LazyStore.prototype.isDisplayIndexInStore = function (displayIndex) {
        if (this.cache.getRowCount() === 0)
            return false;
        return this.displayIndexStart <= displayIndex && displayIndex < this.getDisplayIndexEnd();
    };
    /**
     * Recursively sets up the display indexes and top position of every node belonging to this store.
     *
     * Called after a row height changes, or a store updated event.
     *
     * @param displayIndexSeq the number sequence for generating the display index of each row
     * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
     */
    LazyStore.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
        this.displayIndexStart = displayIndexSeq.peek();
        this.topPx = nextRowTop.value;
        // delegate to the store to set the row display indexes
        this.cache.setDisplayIndexes(displayIndexSeq, nextRowTop);
        if (this.parentRowNode.sibling) {
            this.blockUtils.setDisplayIndex(this.parentRowNode.sibling, displayIndexSeq, nextRowTop);
        }
        this.displayIndexEnd = displayIndexSeq.peek();
        this.heightPx = nextRowTop.value - this.topPx;
    };
    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively server side filtered stores, this is the same as getNodes().forEachDeepAfterFilterAndSort
     */
    LazyStore.prototype.forEachStoreDeep = function (callback, sequence) {
        if (sequence === void 0) { sequence = new NumberSequence(); }
        callback(this, sequence.next());
        this.cache.getNodes().forEach(function (lazyNode) {
            var childCache = lazyNode.node.childStore;
            if (childCache) {
                childCache.forEachStoreDeep(callback, sequence);
            }
        });
    };
    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively server side filtered stores, this is the same as getNodes().forEachDeepAfterFilterAndSort
     */
    LazyStore.prototype.forEachNodeDeep = function (callback, sequence) {
        if (sequence === void 0) { sequence = new NumberSequence(); }
        this.cache.getNodes().forEach(function (lazyNode) {
            callback(lazyNode.node, sequence.next());
            var childCache = lazyNode.node.childStore;
            if (childCache) {
                childCache.forEachNodeDeep(callback, sequence);
            }
        });
    };
    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively server side filtered stores, this is the same as getNodes().forEachDeep
     */
    LazyStore.prototype.forEachNodeDeepAfterFilterAndSort = function (callback, sequence, includeFooterNodes) {
        if (sequence === void 0) { sequence = new NumberSequence(); }
        if (includeFooterNodes === void 0) { includeFooterNodes = false; }
        var orderedNodes = this.cache.getOrderedNodeMap();
        for (var key in orderedNodes) {
            var lazyNode = orderedNodes[key];
            callback(lazyNode.node, sequence.next());
            var childCache = lazyNode.node.childStore;
            if (childCache) {
                childCache.forEachNodeDeepAfterFilterAndSort(callback, sequence, includeFooterNodes);
            }
        }
        if (includeFooterNodes && this.parentRowNode.sibling) {
            callback(this.parentRowNode.sibling, sequence.next());
        }
    };
    /**
     * Removes the failed status from all nodes, and marks them as stub to encourage reloading
     */
    LazyStore.prototype.retryLoads = function () {
        this.cache.getNodes().forEach(function (_a) {
            var node = _a.node;
            if (node.failedLoad) {
                node.failedLoad = false;
                node.__needsRefreshWhenVisible = true;
                node.stub = true;
            }
        });
        this.forEachChildStoreShallow(function (store) { return store.retryLoads(); });
        this.fireStoreUpdatedEvent();
    };
    /**
     * Given a display index, returns the row at that location.
     *
     * @param displayRowIndex the displayed index within the grid to search for
     * @returns the row node if the display index falls within the store, if it didn't exist this will create a new stub to return
     */
    LazyStore.prototype.getRowUsingDisplayIndex = function (displayRowIndex) {
        if (this.parentRowNode.sibling && displayRowIndex === this.parentRowNode.sibling.rowIndex) {
            return this.parentRowNode.sibling;
        }
        return this.cache.getRowByDisplayIndex(displayRowIndex);
    };
    /**
     * Given a display index, returns the row top and height for the row at that index.
     *
     * @param displayIndex the display index of the node
     * @returns an object containing the rowTop and rowHeight of the node at the given displayIndex
     */
    LazyStore.prototype.getRowBounds = function (displayIndex) {
        var _a;
        if (!this.isDisplayIndexInStore(displayIndex)) {
            return null;
        }
        var thisNode = this.cache.getNodeCachedByDisplayIndex(displayIndex);
        if (thisNode) {
            var boundsFromRow = this.blockUtils.extractRowBounds(thisNode, displayIndex);
            if (boundsFromRow) {
                return boundsFromRow;
            }
        }
        var _b = (_a = this.cache.getSurroundingNodesByDisplayIndex(displayIndex)) !== null && _a !== void 0 ? _a : {}, previousNode = _b.previousNode, nextNode = _b.nextNode;
        // previous node may equal, or catch via detail node or child of group
        if (previousNode) {
            var boundsFromRow = this.blockUtils.extractRowBounds(previousNode.node, displayIndex);
            if (boundsFromRow != null) {
                return boundsFromRow;
            }
        }
        var defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        // if node after this, can calculate backwards (and ignore detail/grouping)
        if (nextNode) {
            var numberOfRowDiff_1 = (nextNode.node.rowIndex - displayIndex) * defaultRowHeight;
            return {
                rowTop: nextNode.node.rowTop - numberOfRowDiff_1,
                rowHeight: defaultRowHeight,
            };
        }
        // otherwise calculate from end of store
        var lastTop = this.topPx + this.heightPx;
        var numberOfRowDiff = (this.getDisplayIndexEnd() - displayIndex) * defaultRowHeight;
        return {
            rowTop: lastTop - numberOfRowDiff,
            rowHeight: defaultRowHeight,
        };
    };
    /**
     * Given a vertical pixel, determines whether this store contains a row at that pixel
     *
     * @param pixel a vertical pixel position from the grid
     * @returns whether that pixel points to a virtual space belonging to this store
     */
    LazyStore.prototype.isPixelInRange = function (pixel) {
        return pixel >= this.topPx && pixel < (this.topPx + this.heightPx);
    };
    /**
     * Given a vertical pixel, returns the row existing at that pixel location
     *
     * @param pixel a vertical pixel position from the grid
     * @returns the display index at the given pixel location
     */
    LazyStore.prototype.getRowIndexAtPixel = function (pixel) {
        if (pixel < this.topPx) {
            return this.getDisplayIndexStart();
        }
        if (pixel >= this.topPx + this.heightPx) {
            return this.getDisplayIndexEnd() - 1;
        }
        var distToPreviousNodeTop = Number.MAX_SAFE_INTEGER;
        var previousNode = null;
        var distToNextNodeTop = Number.MAX_SAFE_INTEGER;
        var nextNode = null;
        this.cache.getNodes().forEach(function (_a) {
            var node = _a.node;
            var distBetween = Math.abs(pixel - node.rowTop);
            // previous node
            if (node.rowTop < pixel) {
                if (distBetween < distToPreviousNodeTop) {
                    distToPreviousNodeTop = distBetween;
                    previousNode = node;
                }
                return;
            }
            // next node
            if (distBetween < distToNextNodeTop) {
                distToNextNodeTop = distBetween;
                nextNode = node;
            }
        });
        // cast these back as typescript doesn't understand the forEach above
        previousNode = previousNode;
        nextNode = nextNode;
        // previous node may equal, or catch via detail node or child of group
        if (previousNode) {
            var indexOfRow = this.blockUtils.getIndexAtPixel(previousNode, pixel);
            if (indexOfRow != null) {
                return indexOfRow;
            }
        }
        var defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        // if node after this, can calculate backwards (and ignore detail/grouping)
        if (nextNode) {
            var nextTop_1 = nextNode.rowTop;
            var numberOfRowDiff_2 = Math.ceil((nextTop_1 - pixel) / defaultRowHeight);
            return nextNode.rowIndex - numberOfRowDiff_2;
        }
        // otherwise calculate from end of store
        var nextTop = this.topPx + this.heightPx;
        var numberOfRowDiff = Math.floor((nextTop - pixel) / defaultRowHeight);
        return this.getDisplayIndexEnd() - numberOfRowDiff;
    };
    /**
     * Given a path of group keys, returns the child store for that group.
     *
     * @param keys the grouping path to the desired store
     * @returns the child store for the given keys, or null if not found
     */
    LazyStore.prototype.getChildStore = function (keys) {
        var _this = this;
        return this.storeUtils.getChildStore(keys, this, function (key) {
            var lazyNode = _this.cache.getNodes().find(function (lazyNode) { return lazyNode.node.key == key; });
            if (!lazyNode) {
                return null;
            }
            return lazyNode.node;
        });
    };
    /**
     * Executes a provided callback on each child store belonging to this store
     *
     * @param cb the callback to execute
     */
    LazyStore.prototype.forEachChildStoreShallow = function (cb) {
        this.cache.getNodes().forEach(function (_a) {
            var node = _a.node;
            if (node.childStore) {
                cb(node.childStore);
            }
        });
    };
    /**
     * Executes after a change to sorting, determines recursively whether this store or a child requires refreshed.
     *
     * If a purge refresh occurs, the row count is preserved.
     *
     * @param params a set of properties pertaining to the sort changes
     */
    LazyStore.prototype.refreshAfterSort = function (params) {
        var serverSortsAllLevels = this.storeUtils.isServerSideSortAllLevels();
        if (serverSortsAllLevels || this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params)) {
            var oldCount = this.cache.getRowCount();
            this.destroyBean(this.cache);
            this.cache = this.createManagedBean(new LazyCache(this, oldCount, this.storeParams));
            this.fireStoreUpdatedEvent();
            return;
        }
        // call refreshAfterSort on children, as we did not purge.
        // if we did purge, no need to do this as all children were destroyed
        this.forEachChildStoreShallow(function (store) { return store.refreshAfterSort(params); });
    };
    /**
     * Executes after a change to filtering, determines recursively whether this store or a child requires refreshed.
     *
     * If a refresh occurs, the row count is reset.
     *
     * @param params a set of properties pertaining to the filter changes
     */
    LazyStore.prototype.refreshAfterFilter = function (params) {
        var serverFiltersAllLevels = !this.storeUtils.isServerSideOnlyRefreshFilteredGroups();
        if (serverFiltersAllLevels || this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params)) {
            this.refreshStore(true);
            return;
        }
        // call refreshAfterSort on children, as we did not purge.
        // if we did purge, no need to do this as all children were destroyed
        this.forEachChildStoreShallow(function (store) { return store.refreshAfterFilter(params); });
    };
    /**
     * Marks all existing nodes as requiring reloaded, and triggers a load check
     *
     * @param purge whether to remove all nodes and data in favour of stub nodes
     */
    LazyStore.prototype.refreshStore = function (purge) {
        if (purge) {
            this.destroyBean(this.cache);
            this.cache = this.createManagedBean(new LazyCache(this, 1, this.storeParams));
            this.fireStoreUpdatedEvent();
            return;
        }
        this.cache.markNodesForRefresh();
    };
    /**
     * Used for pagination, given a local/store index, returns the display index of that row
     *
     * @param topLevelIndex the store index of a row
     * @returns the display index for the given store index
     */
    LazyStore.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        var displayIndex = this.cache.getDisplayIndexFromStoreIndex(topLevelIndex);
        return displayIndex !== null && displayIndex !== void 0 ? displayIndex : topLevelIndex;
    };
    /**
     * Used for pagination to determine if the last page is known, and for aria to determine if the last grid row is known
     *
     * @returns whether the last index of this store is known, or if lazy loading still required
     */
    LazyStore.prototype.isLastRowIndexKnown = function () {
        return this.cache.isLastRowIndexKnown();
    };
    /**
     * Used by the selection service to select a range of nodes
     *
     * @param firstInRange the first node in the range to find
     * @param lastInRange the last node in the range to find
     * @returns a range of nodes between firstInRange and lastInRange inclusive
     */
    LazyStore.prototype.getRowNodesInRange = function (firstInRange, lastInRange) {
        var result = [];
        var inActiveRange = false;
        // if only one node passed, we start the selection at the top
        if (_.missing(firstInRange)) {
            inActiveRange = true;
        }
        return this.cache.getNodes().filter(function (_a) {
            var node = _a.node;
            return node.rowIndex >= firstInRange.rowIndex && node.rowIndex <= lastInRange.rowIndex;
        }).map(function (_a) {
            var node = _a.node;
            return node;
        });
    };
    /**
     * Mutates a given array to add this stores state, and recursively add all the children store states.
     *
     * @param result a mutable results array
     */
    LazyStore.prototype.addStoreStates = function (result) {
        result.push({
            suppressInfiniteScroll: false,
            route: this.parentRowNode.getGroupKeys(),
            rowCount: this.getRowCount(),
            lastRowIndexKnown: this.isLastRowIndexKnown(),
            info: this.info,
            maxBlocksInCache: this.storeParams.maxBlocksInCache,
            cacheBlockSize: this.storeParams.cacheBlockSize,
        });
        this.forEachChildStoreShallow(function (childStore) { return childStore.addStoreStates(result); });
    };
    LazyStore.prototype.getIdSequence = function () {
        return this.idSequence;
    };
    LazyStore.prototype.getParentNode = function () {
        return this.parentRowNode;
    };
    LazyStore.prototype.getRowDetails = function () {
        return {
            field: this.groupField,
            group: this.group,
            leafGroup: this.leafGroup,
            level: this.level,
            parent: this.parentRowNode,
            rowGroupColumn: this.rowGroupColumn,
        };
    };
    LazyStore.prototype.getSsrmParams = function () {
        return this.ssrmParams;
    };
    LazyStore.prototype.setStoreInfo = function (info) {
        if (info) {
            Object.assign(this.info, info);
        }
    };
    // gets called 1) row count changed 2) cache purged
    LazyStore.prototype.fireStoreUpdatedEvent = function () {
        // this results in row model firing ModelUpdated.
        // server side row model also updates the row indexes first
        var event = {
            type: Events.EVENT_STORE_UPDATED
        };
        this.eventService.dispatchEvent(event);
    };
    // gets called when row data updated, and no more refreshing needed
    LazyStore.prototype.fireRefreshFinishedEvent = function () {
        var event = {
            type: Events.EVENT_STORE_REFRESHED,
            route: this.parentRowNode.getRoute(),
        };
        this.eventService.dispatchEvent(event);
    };
    LazyStore.prototype.getBlockStates = function () {
        return this.cache.getBlockStates();
    };
    LazyStore.prototype.getStoreBounds = function () {
        return {
            topPx: this.topPx,
            heightPx: this.heightPx,
        };
    };
    __decorate([
        Autowired('ssrmBlockUtils')
    ], LazyStore.prototype, "blockUtils", void 0);
    __decorate([
        Autowired('ssrmStoreUtils')
    ], LazyStore.prototype, "storeUtils", void 0);
    __decorate([
        Autowired('columnModel')
    ], LazyStore.prototype, "columnModel", void 0);
    __decorate([
        Autowired('selectionService')
    ], LazyStore.prototype, "selectionService", void 0);
    __decorate([
        PostConstruct
    ], LazyStore.prototype, "init", null);
    __decorate([
        PreDestroy
    ], LazyStore.prototype, "destroyRowNodes", null);
    return LazyStore;
}(BeanStub));
export { LazyStore };
