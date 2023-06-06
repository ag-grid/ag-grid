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
        var numberOfRows = 1;
        if (this.level === 0) {
            numberOfRows = this.storeUtils.getServerSideInitialRowCount();
        }
        this.cache = this.createManagedBean(new LazyCache(this, numberOfRows, this.storeParams));
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
                storeInfo: this.info,
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
            var allUniqueIdsToRemove = __spreadArray([], __read(new Set(allIdsToRemove)));
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
    LazyStore.prototype.forEachNodeDeepAfterFilterAndSort = function (callback, sequence) {
        if (sequence === void 0) { sequence = new NumberSequence(); }
        var orderedNodes = this.cache.getOrderedNodeMap();
        for (var key in orderedNodes) {
            var lazyNode = orderedNodes[key];
            callback(lazyNode.node, sequence.next());
            var childCache = lazyNode.node.childStore;
            if (childCache) {
                childCache.forEachNodeDeepAfterFilterAndSort(callback, sequence);
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF6eVN0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3NlcnZlclNpZGVSb3dNb2RlbC9zdG9yZXMvbGF6eS9sYXp5U3RvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsUUFBUSxFQUNSLE1BQU0sRUFFTixjQUFjLEVBQ2QsYUFBYSxFQUNiLFVBQVUsRUFPVixpQ0FBaUMsRUFXcEMsTUFBTSx5QkFBeUIsQ0FBQztBQUlqQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBRXhDO0lBQStCLDZCQUFRO0lBNkJuQyxtQkFBWSxVQUFzQixFQUFFLFdBQXVDLEVBQUUsYUFBc0I7UUFBbkcsWUFDSSxpQkFBTyxTQVFWO1FBYk8sZ0JBQVUsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1FBTXRDLEtBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLEtBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBQ25DLEtBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLEtBQUksQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDckMsS0FBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDM0YsS0FBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsS0FBSyxLQUFLLFVBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3JH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