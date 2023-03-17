"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyStore = void 0;
const core_1 = require("@ag-grid-community/core");
const lazyCache_1 = require("./lazyCache");
class LazyStore extends core_1.BeanStub {
    constructor(ssrmParams, storeParams, parentRowNode) {
        super();
        this.idSequence = new core_1.NumberSequence();
        this.ssrmParams = ssrmParams;
        this.parentRowNode = parentRowNode;
        this.storeParams = storeParams;
        this.level = parentRowNode.level + 1;
        this.group = ssrmParams.rowGroupCols ? this.level < ssrmParams.rowGroupCols.length : false;
        this.leafGroup = ssrmParams.rowGroupCols ? this.level === ssrmParams.rowGroupCols.length - 1 : false;
    }
    init() {
        let numberOfRows = 1;
        if (this.level === 0) {
            numberOfRows = this.storeUtils.getServerSideInitialRowCount();
        }
        this.cache = this.createManagedBean(new lazyCache_1.LazyCache(this, numberOfRows, this.storeParams));
        const usingTreeData = this.gridOptionsService.isTreeData();
        if (!usingTreeData && this.group) {
            const groupColVo = this.ssrmParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnModel.getRowGroupColumns()[this.level];
        }
    }
    destroyRowNodes() {
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.destroyBean(this.cache);
    }
    /**
     * Applies a given transaction to the data set within this store
     *
     * @param transaction an object containing delta instructions determining the changes to apply to this store
     * @returns an object determining the status of this transaction and effected nodes
     */
    applyTransaction(transaction) {
        var _a, _b, _c;
        const idFunc = this.gridOptionsService.getRowIdFunc();
        if (!idFunc) {
            console.warn('AG Grid: getRowId callback must be implemented for transactions to work. Transaction was ignored.');
            return {
                status: core_1.ServerSideTransactionResultStatus.Cancelled,
            };
        }
        const applyCallback = this.gridOptionsService.getCallback('isApplyServerSideTransaction');
        if (applyCallback) {
            const params = {
                transaction: transaction,
                parentNode: this.parentRowNode,
                storeInfo: this.info,
                groupLevelInfo: this.info
            };
            const apply = applyCallback(params);
            if (!apply) {
                return { status: core_1.ServerSideTransactionResultStatus.Cancelled };
            }
        }
        let updatedNodes = undefined;
        if ((_a = transaction.update) === null || _a === void 0 ? void 0 : _a.length) {
            updatedNodes = this.cache.updateRowNodes(transaction.update);
        }
        let insertedNodes = undefined;
        if ((_b = transaction.add) === null || _b === void 0 ? void 0 : _b.length) {
            let addIndex = transaction.addIndex;
            if (addIndex != null && addIndex < 0) {
                addIndex = undefined;
            }
            insertedNodes = this.cache.insertRowNodes(transaction.add, addIndex);
        }
        let removedNodes = undefined;
        if ((_c = transaction.remove) === null || _c === void 0 ? void 0 : _c.length) {
            const allIdsToRemove = transaction.remove.map(data => (idFunc({ level: this.level, parentKeys: this.parentRowNode.getGroupKeys(), data })));
            const allUniqueIdsToRemove = [...new Set(allIdsToRemove)];
            removedNodes = this.cache.removeRowNodes(allUniqueIdsToRemove);
        }
        this.updateSelectionAfterTransaction(updatedNodes, removedNodes);
        return {
            status: core_1.ServerSideTransactionResultStatus.Applied,
            update: updatedNodes,
            add: insertedNodes,
            remove: removedNodes,
        };
    }
    updateSelectionAfterTransaction(updatedNodes, removedNodes) {
        let fireSelectionUpdatedEvent = false;
        updatedNodes === null || updatedNodes === void 0 ? void 0 : updatedNodes.forEach(node => {
            if (node.isSelected() && !node.selectable) {
                node.setSelected(false, false, true, 'rowDataChanged');
                fireSelectionUpdatedEvent = true;
            }
        });
        removedNodes === null || removedNodes === void 0 ? void 0 : removedNodes.forEach(node => {
            if (node.isSelected()) {
                node.setSelected(false, false, true, 'rowDataChanged');
                fireSelectionUpdatedEvent = true;
            }
        });
        if (fireSelectionUpdatedEvent) {
            const event = {
                type: core_1.Events.EVENT_SELECTION_CHANGED,
                source: 'rowDataChanged'
            };
            this.eventService.dispatchEvent(event);
        }
    }
    /**
     * Clear the display indexes, used for fading rows out when stores are not being destroyed
     */
    clearDisplayIndexes() {
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.cache.getAllNodes().forEach(rowNode => this.blockUtils.clearDisplayIndex(rowNode));
    }
    /**
     * @returns an index representing the last sequentially displayed row in the grid for this store
     */
    getDisplayIndexStart() {
        return this.displayIndexStart;
    }
    /**
     * @returns the index representing one after the last sequentially displayed row in the grid for this store
     */
    getDisplayIndexEnd() {
        return this.displayIndexEnd;
    }
    /**
     * @returns the virtual size of this store
     */
    getRowCount() {
        return this.cache.getRowCount();
    }
    /**
     * Sets the current row count of the store, and whether the last row index is known
     */
    setRowCount(rowCount, isLastRowIndexKnown) {
        this.cache.setRowCount(rowCount, isLastRowIndexKnown);
    }
    /**
     * Given a display index, returns whether that row is within this store or a child store of this store
     *
     * @param displayIndex the visible index of a row
     * @returns whether or not the row exists within this store
     */
    isDisplayIndexInStore(displayIndex) {
        if (this.cache.getRowCount() === 0)
            return false;
        return this.displayIndexStart <= displayIndex && displayIndex < this.getDisplayIndexEnd();
    }
    /**
     * Recursively sets up the display indexes and top position of every node belonging to this store.
     *
     * Called after a row height changes, or a store updated event.
     *
     * @param displayIndexSeq the number sequence for generating the display index of each row
     * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
     */
    setDisplayIndexes(displayIndexSeq, nextRowTop) {
        this.displayIndexStart = displayIndexSeq.peek();
        this.topPx = nextRowTop.value;
        // delegate to the store to set the row display indexes
        this.cache.setDisplayIndexes(displayIndexSeq, nextRowTop);
        this.displayIndexEnd = displayIndexSeq.peek();
        this.heightPx = nextRowTop.value - this.topPx;
    }
    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively server side filtered stores, this is the same as forEachNodeDeepAfterFilterAndSort
     */
    forEachStoreDeep(callback, sequence = new core_1.NumberSequence()) {
        callback(this, sequence.next());
        this.cache.getAllNodes().forEach(rowNode => {
            const childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachStoreDeep(callback, sequence);
            }
        });
    }
    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively server side filtered stores, this is the same as forEachNodeDeepAfterFilterAndSort
     */
    forEachNodeDeep(callback, sequence = new core_1.NumberSequence()) {
        this.cache.getAllNodes().forEach(rowNode => {
            callback(rowNode, sequence.next());
            const childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeep(callback, sequence);
            }
        });
    }
    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively server side filtered stores, this is the same as forEachNodeDeep
     */
    forEachNodeDeepAfterFilterAndSort(callback, sequence = new core_1.NumberSequence()) {
        this.cache.getAllNodes().forEach(rowNode => {
            callback(rowNode, sequence.next());
            const childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeepAfterFilterAndSort(callback, sequence);
            }
        });
    }
    /**
     * Removes the failed status from all nodes, and marks them as stub to encourage reloading
     */
    retryLoads() {
        this.cache.getAllNodes().forEach(node => {
            if (node.failedLoad) {
                node.failedLoad = false;
                node.__needsRefreshWhenVisible = true;
                node.stub = true;
            }
        });
        this.forEachChildStoreShallow(store => store.retryLoads());
        this.fireStoreUpdatedEvent();
    }
    /**
     * Given a display index, returns the row at that location.
     *
     * @param displayRowIndex the displayed index within the grid to search for
     * @returns the row node if the display index falls within the store, if it didn't exist this will create a new stub to return
     */
    getRowUsingDisplayIndex(displayRowIndex) {
        return this.cache.getRowByDisplayIndex(displayRowIndex);
    }
    /**
     * Given a display index, returns the row top and height for the row at that index.
     *
     * @param displayIndex the display index of the node
     * @returns an object containing the rowTop and rowHeight of the node at the given displayIndex
     */
    getRowBounds(displayIndex) {
        if (!this.isDisplayIndexInStore(displayIndex)) {
            return null;
        }
        const allNodes = this.cache.getAllNodes();
        let previousNode = null;
        let nextNode = null;
        for (let i = 0; i < allNodes.length; i++) {
            const node = allNodes[i];
            if (node.rowIndex > displayIndex) {
                nextNode = node;
                break;
            }
            previousNode = node;
        }
        // previous node may equal, or catch via detail node or child of group
        if (previousNode) {
            const boundsFromRow = this.blockUtils.extractRowBounds(previousNode, displayIndex);
            if (boundsFromRow != null) {
                return boundsFromRow;
            }
        }
        const defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        // if node after this, can calculate backwards (and ignore detail/grouping)
        if (nextNode) {
            const numberOfRowDiff = Math.floor((nextNode.rowIndex - displayIndex) * defaultRowHeight);
            return {
                rowTop: nextNode.rowTop - numberOfRowDiff,
                rowHeight: defaultRowHeight,
            };
        }
        // otherwise calculate from end of store
        const lastTop = this.topPx + this.heightPx;
        const numberOfRowDiff = Math.floor((this.getDisplayIndexEnd() - displayIndex) * defaultRowHeight);
        return {
            rowTop: lastTop - numberOfRowDiff,
            rowHeight: defaultRowHeight,
        };
    }
    /**
     * Given a vertical pixel, determines whether this store contains a row at that pixel
     *
     * @param pixel a vertical pixel position from the grid
     * @returns whether that pixel points to a virtual space belonging to this store
     */
    isPixelInRange(pixel) {
        return pixel >= this.topPx && pixel < (this.topPx + this.heightPx);
    }
    /**
     * Given a vertical pixel, returns the row existing at that pixel location
     *
     * @param pixel a vertical pixel position from the grid
     * @returns the display index at the given pixel location
     */
    getRowIndexAtPixel(pixel) {
        if (pixel < this.topPx) {
            return this.getDisplayIndexStart();
        }
        if (pixel >= this.topPx + this.heightPx) {
            return this.getDisplayIndexEnd() - 1;
        }
        const allNodes = this.cache.getAllNodes();
        let previousNode = null;
        let nextNode = null;
        for (let i = 0; i < allNodes.length; i++) {
            const node = allNodes[i];
            if (node.rowTop > pixel) {
                nextNode = node;
                break;
            }
            previousNode = node;
        }
        // previous node may equal, or catch via detail node or child of group
        if (previousNode) {
            const indexOfRow = this.blockUtils.getIndexAtPixel(previousNode, pixel);
            if (indexOfRow != null) {
                return indexOfRow;
            }
        }
        const defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        // if node after this, can calculate backwards (and ignore detail/grouping)
        if (nextNode) {
            const nextTop = nextNode.rowTop;
            const numberOfRowDiff = Math.ceil((nextTop - pixel) / defaultRowHeight);
            return nextNode.rowIndex - numberOfRowDiff;
        }
        // otherwise calculate from end of store
        const nextTop = this.topPx + this.heightPx;
        const numberOfRowDiff = Math.floor((nextTop - pixel) / defaultRowHeight);
        return this.getDisplayIndexEnd() - numberOfRowDiff;
    }
    /**
     * Given a path of group keys, returns the child store for that group.
     *
     * @param keys the grouping path to the desired store
     * @returns the child store for the given keys, or null if not found
     */
    getChildStore(keys) {
        return this.storeUtils.getChildStore(keys, this, (key) => {
            const allNodes = this.cache.getAllNodes();
            return allNodes.find(currentRowNode => currentRowNode.key == key);
        });
    }
    /**
     * Executes a provided callback on each child store belonging to this store
     *
     * @param cb the callback to execute
     */
    forEachChildStoreShallow(cb) {
        this.cache.getAllNodes().forEach(node => {
            if (node.childStore) {
                cb(node.childStore);
            }
        });
    }
    /**
     * Executes after a change to sorting, determines recursively whether this store or a child requires refreshed.
     *
     * If a purge refresh occurs, the row count is preserved.
     *
     * @param params a set of properties pertaining to the sort changes
     */
    refreshAfterSort(params) {
        const serverSortsAllLevels = this.storeUtils.isServerSideSortAllLevels();
        if (serverSortsAllLevels || this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params)) {
            const oldCount = this.cache.getRowCount();
            this.destroyBean(this.cache);
            this.cache = this.createManagedBean(new lazyCache_1.LazyCache(this, oldCount, this.storeParams));
            this.fireStoreUpdatedEvent();
            return;
        }
        // call refreshAfterSort on children, as we did not purge.
        // if we did purge, no need to do this as all children were destroyed
        this.forEachChildStoreShallow(store => store.refreshAfterSort(params));
    }
    /**
     * Executes after a change to filtering, determines recursively whether this store or a child requires refreshed.
     *
     * If a refresh occurs, the row count is reset.
     *
     * @param params a set of properties pertaining to the filter changes
     */
    refreshAfterFilter(params) {
        const serverFiltersAllLevels = this.storeUtils.isServerSideFilterAllLevels();
        if (serverFiltersAllLevels || this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params)) {
            this.refreshStore(true);
            return;
        }
        // call refreshAfterSort on children, as we did not purge.
        // if we did purge, no need to do this as all children were destroyed
        this.forEachChildStoreShallow(store => store.refreshAfterFilter(params));
    }
    /**
     * Marks all existing nodes as requiring reloaded, and triggers a load check
     *
     * @param purge whether to remove all nodes and data in favour of stub nodes
     */
    refreshStore(purge) {
        if (purge) {
            this.destroyBean(this.cache);
            this.cache = this.createManagedBean(new lazyCache_1.LazyCache(this, 1, this.storeParams));
            this.fireStoreUpdatedEvent();
            return;
        }
        this.cache.markNodesForRefresh();
    }
    /**
     * Used for pagination, given a local/store index, returns the display index of that row
     *
     * @param topLevelIndex the store index of a row
     * @returns the display index for the given store index
     */
    getTopLevelRowDisplayedIndex(topLevelIndex) {
        const displayIndex = this.cache.getDisplayIndexFromStoreIndex(topLevelIndex);
        return displayIndex !== null && displayIndex !== void 0 ? displayIndex : topLevelIndex;
    }
    /**
     * Used for pagination to determine if the last page is known, and for aria to determine if the last grid row is known
     *
     * @returns whether the last index of this store is known, or if lazy loading still required
     */
    isLastRowIndexKnown() {
        return this.cache.isLastRowIndexKnown();
    }
    /**
     * Used by the selection service to select a range of nodes
     *
     * @param firstInRange the first node in the range to find
     * @param lastInRange the last node in the range to find
     * @returns a range of nodes between firstInRange and lastInRange inclusive
     */
    getRowNodesInRange(firstInRange, lastInRange) {
        const result = [];
        let inActiveRange = false;
        // if only one node passed, we start the selection at the top
        if (core_1._.missing(firstInRange)) {
            inActiveRange = true;
        }
        this.cache.getAllNodes().forEach(rowNode => {
            const hitFirstOrLast = rowNode === firstInRange || rowNode === lastInRange;
            if (inActiveRange || hitFirstOrLast) {
                result.push(rowNode);
            }
            if (hitFirstOrLast) {
                inActiveRange = !inActiveRange;
            }
        });
        // inActiveRange will be still true if we never hit the second rowNode
        const invalidRange = inActiveRange;
        return invalidRange ? [] : result;
    }
    /**
     * Mutates a given array to add this stores state, and recursively add all the children store states.
     *
     * @param result a mutable results array
     */
    addStoreStates(result) {
        result.push({
            suppressInfiniteScroll: false,
            route: this.parentRowNode.getGroupKeys(),
            rowCount: this.getRowCount(),
            lastRowIndexKnown: this.isLastRowIndexKnown(),
            info: this.info,
            maxBlocksInCache: this.storeParams.maxBlocksInCache,
            cacheBlockSize: this.storeParams.cacheBlockSize,
        });
        this.forEachChildStoreShallow(childStore => childStore.addStoreStates(result));
    }
    getIdSequence() {
        return this.idSequence;
    }
    getParentNode() {
        return this.parentRowNode;
    }
    getRowDetails() {
        return {
            field: this.groupField,
            group: this.group,
            leafGroup: this.leafGroup,
            level: this.level,
            parent: this.parentRowNode,
            rowGroupColumn: this.rowGroupColumn,
        };
    }
    getSsrmParams() {
        return this.ssrmParams;
    }
    setStoreInfo(info) {
        this.info = info;
    }
    // gets called 1) row count changed 2) cache purged
    fireStoreUpdatedEvent() {
        // this results in row model firing ModelUpdated.
        // server side row model also updates the row indexes first
        const event = {
            type: core_1.Events.EVENT_STORE_UPDATED
        };
        this.eventService.dispatchEvent(event);
    }
    getBlockStates() {
        return this.cache.getBlockStates();
    }
}
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
exports.LazyStore = LazyStore;
