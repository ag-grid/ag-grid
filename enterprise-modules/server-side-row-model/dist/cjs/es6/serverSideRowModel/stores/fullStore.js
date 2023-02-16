"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullStore = void 0;
const core_1 = require("@ag-grid-community/core");
class FullStore extends core_1.RowNodeBlock {
    constructor(ssrmParams, storeParams, parentRowNode) {
        // finite block represents a cache with just one block, thus 0 is the id, it's the first block
        super(0);
        this.nodeIdSequence = new core_1.NumberSequence();
        this.info = {};
        this.ssrmParams = ssrmParams;
        this.parentRowNode = parentRowNode;
        this.level = parentRowNode.level + 1;
        this.groupLevel = ssrmParams.rowGroupCols ? this.level < ssrmParams.rowGroupCols.length : undefined;
        this.leafGroup = ssrmParams.rowGroupCols ? this.level === ssrmParams.rowGroupCols.length - 1 : false;
    }
    postConstruct() {
        this.usingTreeData = this.gridOptionsService.isTreeData();
        this.nodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.parentRowNode);
        if (!this.usingTreeData && this.groupLevel) {
            const groupColVo = this.ssrmParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnModel.getRowGroupColumns()[this.level];
        }
        let initialRowCount = 1;
        const isRootStore = this.parentRowNode.level === -1;
        const userInitialRowCount = this.storeUtils.getServerSideInitialRowCount();
        if (isRootStore && userInitialRowCount !== undefined) {
            initialRowCount = userInitialRowCount;
        }
        this.initialiseRowNodes(initialRowCount);
        this.rowNodeBlockLoader.addBlock(this);
        this.addDestroyFunc(() => this.rowNodeBlockLoader.removeBlock(this));
    }
    destroyRowNodes() {
        this.blockUtils.destroyRowNodes(this.allRowNodes);
        this.allRowNodes = [];
        this.nodesAfterSort = [];
        this.nodesAfterFilter = [];
        this.allNodesMap = {};
    }
    initialiseRowNodes(loadingRowsCount, failedLoad = false) {
        this.destroyRowNodes();
        for (let i = 0; i < loadingRowsCount; i++) {
            const loadingRowNode = this.blockUtils.createRowNode({
                field: this.groupField,
                group: this.groupLevel,
                leafGroup: this.leafGroup,
                level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn
            });
            if (failedLoad) {
                loadingRowNode.failedLoad = true;
            }
            this.allRowNodes.push(loadingRowNode);
            this.nodesAfterFilter.push(loadingRowNode);
            this.nodesAfterSort.push(loadingRowNode);
        }
    }
    getBlockStateJson() {
        return {
            id: this.nodeIdPrefix ? this.nodeIdPrefix : '',
            state: this.getState()
        };
    }
    loadFromDatasource() {
        this.storeUtils.loadFromDatasource({
            startRow: undefined,
            endRow: undefined,
            parentBlock: this,
            parentNode: this.parentRowNode,
            storeParams: this.ssrmParams,
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            success: this.success.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this, this.getVersion()),
            fail: this.pageLoadFailed.bind(this, this.getVersion())
        });
    }
    getStartRow() {
        return 0; // always zero as not in a cache
    }
    getEndRow() {
        return this.nodesAfterSort.length;
    }
    createDataNode(data, index) {
        const rowNode = this.blockUtils.createRowNode({
            field: this.groupField,
            group: this.groupLevel,
            leafGroup: this.leafGroup,
            level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn
        });
        if (index != null) {
            core_1._.insertIntoArray(this.allRowNodes, rowNode, index);
        }
        else {
            this.allRowNodes.push(rowNode);
        }
        const defaultId = this.prefixId(this.nodeIdSequence.next());
        this.blockUtils.setDataIntoRowNode(rowNode, data, defaultId, undefined);
        this.nodeManager.addRowNode(rowNode);
        this.blockUtils.checkOpenByDefault(rowNode);
        this.allNodesMap[rowNode.id] = rowNode;
        return rowNode;
    }
    prefixId(id) {
        if (this.nodeIdPrefix) {
            return this.nodeIdPrefix + '-' + id;
        }
        else {
            return id.toString();
        }
    }
    processServerFail() {
        this.initialiseRowNodes(1, true);
        this.fireStoreUpdatedEvent();
        this.flushAsyncTransactions();
    }
    processServerResult(params) {
        if (!this.isAlive()) {
            return;
        }
        const info = params.storeInfo || params.groupLevelInfo;
        if (info) {
            Object.assign(this.info, info);
        }
        const nodesToRecycle = this.allRowNodes.length > 0 ? this.allNodesMap : undefined;
        this.allRowNodes = [];
        this.nodesAfterSort = [];
        this.nodesAfterFilter = [];
        this.allNodesMap = {};
        if (!params.rowData) {
            const message = 'AG Grid: "params.data" is missing from Server-Side Row Model success() callback. Please use the "data" attribute. If no data is returned, set an empty list.';
            core_1._.doOnce(() => console.warn(message, params), 'FullStore.noData');
        }
        this.createOrRecycleNodes(nodesToRecycle, params.rowData);
        if (nodesToRecycle) {
            this.blockUtils.destroyRowNodes(core_1._.getAllValuesInObject(nodesToRecycle));
        }
        this.filterAndSortNodes();
        this.fireStoreUpdatedEvent();
        this.flushAsyncTransactions();
    }
    createOrRecycleNodes(nodesToRecycle, rowData) {
        if (!rowData) {
            return;
        }
        const lookupNodeToRecycle = (data) => {
            if (!nodesToRecycle) {
                return undefined;
            }
            const getRowIdFunc = this.gridOptionsService.getRowIdFunc();
            if (!getRowIdFunc) {
                return undefined;
            }
            const parentKeys = this.parentRowNode.getGroupKeys();
            const level = this.level;
            const id = getRowIdFunc({
                data,
                parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
                level,
            });
            const foundNode = nodesToRecycle[id];
            if (!foundNode) {
                return undefined;
            }
            delete nodesToRecycle[id];
            return foundNode;
        };
        const recycleNode = (rowNode, dataItem) => {
            this.allNodesMap[rowNode.id] = rowNode;
            this.blockUtils.updateDataIntoRowNode(rowNode, dataItem);
            this.allRowNodes.push(rowNode);
        };
        rowData.forEach(dataItem => {
            const nodeToRecycle = lookupNodeToRecycle(dataItem);
            if (nodeToRecycle) {
                recycleNode(nodeToRecycle, dataItem);
            }
            else {
                this.createDataNode(dataItem);
            }
        });
    }
    flushAsyncTransactions() {
        // we want to update the store with any outstanding transactions straight away,
        // as otherwise if waitTimeMillis is large (eg 5s), then the user could be looking
        // at old data for a few seconds before the transactions is applied, which isn't what
        // you would expect when we advertise 'transaction is applied when data is loaded'.
        // we do this in a timeout as flushAsyncTransactions expects the grid to be in a settled
        // state, not in the middle of loading rows! keeps the VM Turns more simple and deterministic.
        window.setTimeout(() => this.transactionManager.flushAsyncTransactions(), 0);
    }
    filterAndSortNodes() {
        this.filterRowNodes();
        this.sortRowNodes();
    }
    sortRowNodes() {
        const serverIsSorting = this.storeUtils.isServerSideSortAllLevels() || this.storeUtils.isServerSideSortOnServer();
        const sortOptions = this.sortController.getSortOptions();
        const noSortApplied = !sortOptions || sortOptions.length == 0;
        if (serverIsSorting || noSortApplied) {
            this.nodesAfterSort = this.nodesAfterFilter;
            return;
        }
        this.nodesAfterSort = this.rowNodeSorter.doFullSort(this.nodesAfterFilter, sortOptions);
    }
    filterRowNodes() {
        const serverIsFiltering = this.storeUtils.isServerSideFilterAllLevels() || this.storeUtils.isServerSideFilterOnServer();
        // filtering for InFullStore only works at lowest level details.
        // reason is the logic for group filtering was to difficult to work out how it should work at time of writing.
        const groupLevel = this.groupLevel;
        if (serverIsFiltering || groupLevel) {
            this.nodesAfterFilter = this.allRowNodes;
            return;
        }
        this.nodesAfterFilter = this.allRowNodes.filter(rowNode => this.filterManager.doesRowPassFilter({ rowNode: rowNode }));
    }
    clearDisplayIndexes() {
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.allRowNodes.forEach(rowNode => this.blockUtils.clearDisplayIndex(rowNode));
    }
    getDisplayIndexEnd() {
        return this.displayIndexEnd;
    }
    isDisplayIndexInStore(displayIndex) {
        if (this.getRowCount() === 0) {
            return false;
        }
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    }
    setDisplayIndexes(displayIndexSeq, nextRowTop) {
        this.displayIndexStart = displayIndexSeq.peek();
        this.topPx = nextRowTop.value;
        const visibleNodeIds = {};
        // set on all visible nodes
        this.nodesAfterSort.forEach(rowNode => {
            this.blockUtils.setDisplayIndex(rowNode, displayIndexSeq, nextRowTop);
            visibleNodeIds[rowNode.id] = true;
        });
        // and clear on all non-visible nodes
        this.allRowNodes.forEach(rowNode => {
            if (!visibleNodeIds[rowNode.id]) {
                this.blockUtils.clearDisplayIndex(rowNode);
            }
        });
        this.displayIndexEnd = displayIndexSeq.peek();
        this.heightPx = nextRowTop.value - this.topPx;
    }
    forEachStoreDeep(callback, sequence = new core_1.NumberSequence()) {
        callback(this, sequence.next());
        this.allRowNodes.forEach(rowNode => {
            const childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachStoreDeep(callback, sequence);
            }
        });
    }
    forEachNodeDeep(callback, sequence = new core_1.NumberSequence()) {
        this.allRowNodes.forEach(rowNode => {
            callback(rowNode, sequence.next());
            const childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeep(callback, sequence);
            }
        });
    }
    forEachNodeDeepAfterFilterAndSort(callback, sequence = new core_1.NumberSequence()) {
        this.nodesAfterSort.forEach(rowNode => {
            callback(rowNode, sequence.next());
            const childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeepAfterFilterAndSort(callback, sequence);
            }
        });
    }
    getRowUsingDisplayIndex(displayRowIndex) {
        // this can happen if asking for a row that doesn't exist in the model,
        // eg if a cell range is selected, and the user filters so rows no longer exists
        if (!this.isDisplayIndexInStore(displayRowIndex)) {
            return undefined;
        }
        const res = this.blockUtils.binarySearchForDisplayIndex(displayRowIndex, this.nodesAfterSort);
        return res;
    }
    getRowBounds(index) {
        for (let i = 0; i < this.nodesAfterSort.length; i++) {
            const rowNode = this.nodesAfterSort[i];
            const res = this.blockUtils.extractRowBounds(rowNode, index);
            if (res) {
                return res;
            }
        }
        return null;
    }
    isPixelInRange(pixel) {
        return pixel >= this.topPx && pixel < (this.topPx + this.heightPx);
    }
    getRowIndexAtPixel(pixel) {
        // if pixel before block, return first row
        const pixelBeforeThisStore = pixel <= this.topPx;
        if (pixelBeforeThisStore) {
            const firstNode = this.nodesAfterSort[0];
            return firstNode.rowIndex;
        }
        // if pixel after store, return last row, however the last
        // row could be a child store
        const pixelAfterThisStore = pixel >= (this.topPx + this.heightPx);
        if (pixelAfterThisStore) {
            const lastRowNode = this.nodesAfterSort[this.nodesAfterSort.length - 1];
            const lastRowNodeBottomPx = lastRowNode.rowTop + lastRowNode.rowHeight;
            if (pixel >= lastRowNodeBottomPx && lastRowNode.expanded) {
                if (lastRowNode.childStore && lastRowNode.childStore.getRowCount() > 0) {
                    return lastRowNode.childStore.getRowIndexAtPixel(pixel);
                }
                if (lastRowNode.detailNode) {
                    return lastRowNode.detailNode.rowIndex;
                }
            }
            return lastRowNode.rowIndex;
        }
        let res = null;
        this.nodesAfterSort.forEach(rowNode => {
            const res2 = this.blockUtils.getIndexAtPixel(rowNode, pixel);
            if (res2 != null) {
                res = res2;
            }
        });
        const pixelIsPastLastRow = res == null;
        if (pixelIsPastLastRow) {
            return this.displayIndexEnd - 1;
        }
        return res;
    }
    getChildStore(keys) {
        return this.storeUtils.getChildStore(keys, this, (key) => {
            const rowNode = this.allRowNodes.find(currentRowNode => {
                return currentRowNode.key == key;
            });
            return rowNode;
        });
    }
    forEachChildStoreShallow(callback) {
        this.allRowNodes.forEach(rowNode => {
            const childStore = rowNode.childStore;
            if (childStore) {
                callback(childStore);
            }
        });
    }
    refreshAfterFilter(params) {
        const serverIsFiltering = this.storeUtils.isServerSideFilterOnServer();
        const storeIsImpacted = this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params);
        const serverIsFilteringAllLevels = this.storeUtils.isServerSideFilterAllLevels();
        if (serverIsFilteringAllLevels || (serverIsFiltering && storeIsImpacted)) {
            this.refreshStore(true);
            this.sortRowNodes();
            return;
        }
        this.filterRowNodes();
        this.sortRowNodes();
        this.forEachChildStoreShallow(store => store.refreshAfterFilter(params));
    }
    refreshAfterSort(params) {
        const serverIsSorting = this.storeUtils.isServerSideSortOnServer();
        const storeIsImpacted = this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params);
        const serverIsSortingAllLevels = this.storeUtils.isServerSideSortAllLevels();
        if (serverIsSortingAllLevels || (serverIsSorting && storeIsImpacted)) {
            this.refreshStore(true);
            this.filterRowNodes();
            return;
        }
        this.filterRowNodes();
        this.sortRowNodes();
        this.forEachChildStoreShallow(store => store.refreshAfterSort(params));
    }
    applyTransaction(transaction) {
        // we only apply transactions to loaded state
        switch (this.getState()) {
            case core_1.RowNodeBlock.STATE_FAILED:
                return { status: core_1.ServerSideTransactionResultStatus.StoreLoadingFailed };
            case core_1.RowNodeBlock.STATE_LOADING:
                return { status: core_1.ServerSideTransactionResultStatus.StoreLoading };
            case core_1.RowNodeBlock.STATE_WAITING_TO_LOAD:
                return { status: core_1.ServerSideTransactionResultStatus.StoreWaitingToLoad };
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
        const res = {
            status: core_1.ServerSideTransactionResultStatus.Applied,
            remove: [],
            update: [],
            add: []
        };
        const nodesToUnselect = [];
        this.executeAdd(transaction, res);
        this.executeRemove(transaction, res, nodesToUnselect);
        this.executeUpdate(transaction, res, nodesToUnselect);
        this.filterAndSortNodes();
        this.updateSelection(nodesToUnselect);
        return res;
    }
    updateSelection(nodesToUnselect) {
        const selectionChanged = nodesToUnselect.length > 0;
        if (selectionChanged) {
            nodesToUnselect.forEach(rowNode => {
                rowNode.setSelected(false, false, true, 'rowDataChanged');
            });
            const event = {
                type: core_1.Events.EVENT_SELECTION_CHANGED,
                source: 'rowDataChanged'
            };
            this.eventService.dispatchEvent(event);
        }
    }
    executeAdd(rowDataTran, rowNodeTransaction) {
        const { add, addIndex } = rowDataTran;
        if (core_1._.missingOrEmpty(add)) {
            return;
        }
        const useIndex = typeof addIndex === 'number' && addIndex >= 0;
        if (useIndex) {
            // items get inserted in reverse order for index insertion
            add.reverse().forEach(item => {
                const newRowNode = this.createDataNode(item, addIndex);
                rowNodeTransaction.add.push(newRowNode);
            });
        }
        else {
            add.forEach(item => {
                const newRowNode = this.createDataNode(item);
                rowNodeTransaction.add.push(newRowNode);
            });
        }
    }
    executeRemove(rowDataTran, rowNodeTransaction, nodesToUnselect) {
        const { remove } = rowDataTran;
        if (remove == null) {
            return;
        }
        const rowIdsRemoved = {};
        remove.forEach(item => {
            const rowNode = this.lookupRowNode(item);
            if (!rowNode) {
                return;
            }
            // do delete - setting 'suppressFinishActions = true' to ensure EVENT_SELECTION_CHANGED is not raised for
            // each row node updated, instead it is raised once by the calling code if any selected nodes exist.
            if (rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }
            // so row renderer knows to fade row out (and not reposition it)
            rowNode.clearRowTopAndRowIndex();
            // NOTE: were we could remove from allLeaveChildren, however _.removeFromArray() is expensive, especially
            // if called multiple times (eg deleting lots of rows) and if allLeafChildren is a large list
            rowIdsRemoved[rowNode.id] = true;
            // _.removeFromArray(this.rootNode.allLeafChildren, rowNode);
            delete this.allNodesMap[rowNode.id];
            rowNodeTransaction.remove.push(rowNode);
            this.nodeManager.removeNode(rowNode);
        });
        this.allRowNodes = this.allRowNodes.filter(rowNode => !rowIdsRemoved[rowNode.id]);
    }
    executeUpdate(rowDataTran, rowNodeTransaction, nodesToUnselect) {
        const { update } = rowDataTran;
        if (update == null) {
            return;
        }
        update.forEach(item => {
            const rowNode = this.lookupRowNode(item);
            if (!rowNode) {
                return;
            }
            this.blockUtils.updateDataIntoRowNode(rowNode, item);
            if (!rowNode.selectable && rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }
            rowNodeTransaction.update.push(rowNode);
        });
    }
    lookupRowNode(data) {
        const getRowIdFunc = this.gridOptionsService.getRowIdFunc();
        let rowNode;
        if (getRowIdFunc != null) {
            // find rowNode using id
            const level = this.level;
            const parentKeys = this.parentRowNode.getGroupKeys();
            const id = getRowIdFunc({
                data,
                parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
                level,
            });
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                console.error(`AG Grid: could not find row id=${id}, data item was not found for this id`);
                return null;
            }
        }
        else {
            // find rowNode using object references
            rowNode = this.allRowNodes.find(currentRowNode => currentRowNode.data === data);
            if (!rowNode) {
                console.error(`AG Grid: could not find data item as object was not found`, data);
                return null;
            }
        }
        return rowNode;
    }
    addStoreStates(result) {
        result.push({
            suppressInfiniteScroll: true,
            route: this.parentRowNode.getGroupKeys(),
            rowCount: this.allRowNodes.length,
            info: this.info
        });
        this.forEachChildStoreShallow(childStore => childStore.addStoreStates(result));
    }
    refreshStore(purge) {
        if (purge) {
            const loadingRowsToShow = this.nodesAfterSort ? this.nodesAfterSort.length : 1;
            this.initialiseRowNodes(loadingRowsToShow);
        }
        this.scheduleLoad();
        this.fireStoreUpdatedEvent();
    }
    retryLoads() {
        if (this.getState() === core_1.RowNodeBlock.STATE_FAILED) {
            this.initialiseRowNodes(1);
            this.scheduleLoad();
        }
        this.forEachChildStoreShallow(store => store.retryLoads());
    }
    scheduleLoad() {
        this.setStateWaitingToLoad();
        this.rowNodeBlockLoader.checkBlockToLoad();
    }
    // gets called 1) row count changed 2) cache purged 3) items inserted
    fireStoreUpdatedEvent() {
        // this results in row model firing ModelUpdated.
        // server side row model also updates the row indexes first
        const event = {
            type: core_1.Events.EVENT_STORE_UPDATED
        };
        this.eventService.dispatchEvent(event);
    }
    getRowCount() {
        return this.nodesAfterSort.length;
    }
    getTopLevelRowDisplayedIndex(topLevelIndex) {
        const rowNode = this.nodesAfterSort[topLevelIndex];
        return rowNode.rowIndex;
    }
    isLastRowIndexKnown() {
        return this.getState() == core_1.RowNodeBlock.STATE_LOADED;
    }
    getRowNodesInRange(firstInRange, lastInRange) {
        const result = [];
        let inActiveRange = false;
        // if only one node passed, we start the selection at the top
        if (core_1._.missing(firstInRange)) {
            inActiveRange = true;
        }
        this.nodesAfterSort.forEach(rowNode => {
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
}
__decorate([
    core_1.Autowired('ssrmStoreUtils')
], FullStore.prototype, "storeUtils", void 0);
__decorate([
    core_1.Autowired('ssrmBlockUtils')
], FullStore.prototype, "blockUtils", void 0);
__decorate([
    core_1.Autowired('columnModel')
], FullStore.prototype, "columnModel", void 0);
__decorate([
    core_1.Autowired('rowNodeBlockLoader')
], FullStore.prototype, "rowNodeBlockLoader", void 0);
__decorate([
    core_1.Autowired('rowNodeSorter')
], FullStore.prototype, "rowNodeSorter", void 0);
__decorate([
    core_1.Autowired('sortController')
], FullStore.prototype, "sortController", void 0);
__decorate([
    core_1.Autowired('ssrmNodeManager')
], FullStore.prototype, "nodeManager", void 0);
__decorate([
    core_1.Autowired('filterManager')
], FullStore.prototype, "filterManager", void 0);
__decorate([
    core_1.Autowired('ssrmTransactionManager')
], FullStore.prototype, "transactionManager", void 0);
__decorate([
    core_1.PostConstruct
], FullStore.prototype, "postConstruct", null);
__decorate([
    core_1.PreDestroy
], FullStore.prototype, "destroyRowNodes", null);
exports.FullStore = FullStore;
