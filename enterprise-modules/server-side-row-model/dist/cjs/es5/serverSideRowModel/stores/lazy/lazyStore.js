"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyStore = void 0;
var core_1 = require("@ag-grid-community/core");
var lazyCache_1 = require("./lazyCache");
var LazyStore = /** @class */ (function (_super) {
    __extends(LazyStore, _super);
    function LazyStore(ssrmParams, storeParams, parentRowNode) {
        var _this = _super.call(this) || this;
        _this.idSequence = new core_1.NumberSequence();
        _this.ssrmParams = ssrmParams;
        _this.parentRowNode = parentRowNode;
        _this.storeParams = storeParams;
        _this.level = parentRowNode.level + 1;
        _this.group = ssrmParams.rowGroupCols ? _this.level < ssrmParams.rowGroupCols.length : false;
        _this.leafGroup = ssrmParams.rowGroupCols ? _this.level === ssrmParams.rowGroupCols.length - 1 : false;
        return _this;
    }
    LazyStore.prototype.init = function () {
        var numberOfRows = 1;
        if (this.level === 0) {
            numberOfRows = this.storeUtils.getServerSideInitialRowCount();
        }
        this.cache = this.createManagedBean(new lazyCache_1.LazyCache(this, numberOfRows, this.storeParams));
        var usingTreeData = this.gridOptionsService.isTreeData();
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
     * Applies a given transaction to the data set within this store
     *
     * @param transaction an object containing delta instructions determining the changes to apply to this store
     * @returns an object determining the status of this transaction and effected nodes
     */
    LazyStore.prototype.applyTransaction = function (transaction) {
        var _this = this;
        var _a, _b, _c;
        var idFunc = this.gridOptionsService.getRowIdFunc();
        if (!idFunc) {
            console.warn('AG Grid: getRowId callback must be implemented for transactions to work. Transaction was ignored.');
            return {
                status: core_1.ServerSideTransactionResultStatus.Cancelled,
            };
        }
        var applyCallback = this.gridOptionsService.getCallback('isApplyServerSideTransaction');
        if (applyCallback) {
            var params = {
                transaction: transaction,
                parentNode: this.parentRowNode,
                storeInfo: this.info,
                groupLevelInfo: this.info
            };
            var apply = applyCallback(params);
            if (!apply) {
                return { status: core_1.ServerSideTransactionResultStatus.Cancelled };
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
            var allUniqueIdsToRemove = __spread(new Set(allIdsToRemove));
            removedNodes = this.cache.removeRowNodes(allUniqueIdsToRemove);
        }
        this.updateSelectionAfterTransaction(updatedNodes, removedNodes);
        return {
            status: core_1.ServerSideTransactionResultStatus.Applied,
            update: updatedNodes,
            add: insertedNodes,
            remove: removedNodes,
        };
    };
    LazyStore.prototype.updateSelectionAfterTransaction = function (updatedNodes, removedNodes) {
        var fireSelectionUpdatedEvent = false;
        updatedNodes === null || updatedNodes === void 0 ? void 0 : updatedNodes.forEach(function (node) {
            if (node.isSelected() && !node.selectable) {
                node.setSelected(false, false, true, 'rowDataChanged');
                fireSelectionUpdatedEvent = true;
            }
        });
        removedNodes === null || removedNodes === void 0 ? void 0 : removedNodes.forEach(function (node) {
            if (node.isSelected()) {
                node.setSelected(false, false, true, 'rowDataChanged');
                fireSelectionUpdatedEvent = true;
            }
        });
        if (fireSelectionUpdatedEvent) {
            var event_1 = {
                type: core_1.Events.EVENT_SELECTION_CHANGED,
                source: 'rowDataChanged'
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    /**
     * Clear the display indexes, used for fading rows out when stores are not being destroyed
     */
    LazyStore.prototype.clearDisplayIndexes = function () {
        var _this = this;
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.cache.getAllNodes().forEach(function (rowNode) { return _this.blockUtils.clearDisplayIndex(rowNode); });
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
        this.displayIndexEnd = displayIndexSeq.peek();
        this.heightPx = nextRowTop.value - this.topPx;
    };
    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively sever side filtered stores, this is the same as forEachNodeDeepAfterFilterAndSort
     */
    LazyStore.prototype.forEachStoreDeep = function (callback, sequence) {
        if (sequence === void 0) { sequence = new core_1.NumberSequence(); }
        callback(this, sequence.next());
        this.cache.getAllNodes().forEach(function (rowNode) {
            var childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachStoreDeep(callback, sequence);
            }
        });
    };
    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively sever side filtered stores, this is the same as forEachNodeDeepAfterFilterAndSort
     */
    LazyStore.prototype.forEachNodeDeep = function (callback, sequence) {
        if (sequence === void 0) { sequence = new core_1.NumberSequence(); }
        this.cache.getAllNodes().forEach(function (rowNode) {
            callback(rowNode, sequence.next());
            var childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeep(callback, sequence);
            }
        });
    };
    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively sever side filtered stores, this is the same as forEachNodeDeep
     */
    LazyStore.prototype.forEachNodeDeepAfterFilterAndSort = function (callback, sequence) {
        if (sequence === void 0) { sequence = new core_1.NumberSequence(); }
        this.cache.getAllNodes().forEach(function (rowNode) {
            callback(rowNode, sequence.next());
            var childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeepAfterFilterAndSort(callback, sequence);
            }
        });
    };
    /**
     * Removes the failed status from all nodes, and marks them as stub to encourage reloading
     */
    LazyStore.prototype.retryLoads = function () {
        this.cache.getAllNodes().forEach(function (node) {
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
        return this.cache.getRowByDisplayIndex(displayRowIndex);
    };
    /**
     * Given a display index, returns the row top and height for the row at that index.
     *
     * @param displayIndex the display index of the node
     * @returns an object containing the rowTop and rowHeight of the node at the given displayIndex
     */
    LazyStore.prototype.getRowBounds = function (displayIndex) {
        if (!this.isDisplayIndexInStore(displayIndex)) {
            return null;
        }
        var allNodes = this.cache.getAllNodes();
        var previousNode = null;
        var nextNode = null;
        for (var i = 0; i < allNodes.length; i++) {
            var node = allNodes[i];
            if (node.rowIndex > displayIndex) {
                nextNode = node;
                break;
            }
            previousNode = node;
        }
        // previous node may equal, or catch via detail node or child of group
        if (previousNode) {
            var boundsFromRow = this.blockUtils.extractRowBounds(previousNode, displayIndex);
            if (boundsFromRow != null) {
                return boundsFromRow;
            }
        }
        var defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        // if node after this, can calculate backwards (and ignore detail/grouping)
        if (nextNode) {
            var numberOfRowDiff_1 = Math.floor((nextNode.rowIndex - displayIndex) * defaultRowHeight);
            return {
                rowTop: nextNode.rowTop - numberOfRowDiff_1,
                rowHeight: defaultRowHeight,
            };
        }
        // otherwise calculate from end of store
        var lastTop = this.topPx + this.heightPx;
        var numberOfRowDiff = Math.floor((this.getDisplayIndexEnd() - displayIndex) * defaultRowHeight);
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
        var allNodes = this.cache.getAllNodes();
        var previousNode = null;
        var nextNode = null;
        for (var i = 0; i < allNodes.length; i++) {
            var node = allNodes[i];
            if (node.rowTop > pixel) {
                nextNode = node;
                break;
            }
            previousNode = node;
        }
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
            var allNodes = _this.cache.getAllNodes();
            return allNodes.find(function (currentRowNode) { return currentRowNode.key == key; });
        });
    };
    /**
     * Executes a provided callback on each child store belonging to this store
     *
     * @param cb the callback to execute
     */
    LazyStore.prototype.forEachChildStoreShallow = function (cb) {
        this.cache.getAllNodes().forEach(function (node) {
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
            this.cache = this.createManagedBean(new lazyCache_1.LazyCache(this, oldCount, this.storeParams));
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
        var serverFiltersAllLevels = this.storeUtils.isServerSideFilterAllLevels();
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
            this.cache = this.createManagedBean(new lazyCache_1.LazyCache(this, 1, this.storeParams));
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
        if (core_1._.missing(firstInRange)) {
            inActiveRange = true;
        }
        this.cache.getAllNodes().forEach(function (rowNode) {
            var hitFirstOrLast = rowNode === firstInRange || rowNode === lastInRange;
            if (inActiveRange || hitFirstOrLast) {
                result.push(rowNode);
            }
            if (hitFirstOrLast) {
                inActiveRange = !inActiveRange;
            }
        });
        // inActiveRange will be still true if we never hit the second rowNode
        var invalidRange = inActiveRange;
        return invalidRange ? [] : result;
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
        this.info = info;
    };
    // gets called 1) row count changed 2) cache purged
    LazyStore.prototype.fireStoreUpdatedEvent = function () {
        // this results in row model firing ModelUpdated.
        // server side row model also updates the row indexes first
        var event = {
            type: core_1.Events.EVENT_STORE_UPDATED
        };
        this.eventService.dispatchEvent(event);
    };
    LazyStore.prototype.getBlockStates = function () {
        return this.cache.getBlockStates();
    };
    __decorate([
        core_1.Autowired('ssrmBlockUtils')
    ], LazyStore.prototype, "blockUtils", void 0);
    __decorate([
        core_1.Autowired('ssrmStoreUtils')
    ], LazyStore.prototype, "storeUtils", void 0);
    __decorate([
        core_1.Autowired('columnModel')
    ], LazyStore.prototype, "columnModel", void 0);
    __decorate([
        core_1.PostConstruct
    ], LazyStore.prototype, "init", null);
    __decorate([
        core_1.PreDestroy
    ], LazyStore.prototype, "destroyRowNodes", null);
    return LazyStore;
}(core_1.BeanStub));
exports.LazyStore = LazyStore;
