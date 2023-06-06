/**
          * @ag-grid-enterprise/server-side-row-model - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v30.0.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
import { Autowired, PostConstruct, PreDestroy, RowNodeBlock, NumberSequence, _, ServerSideTransactionResultStatus, Events, BeanStub, RowNodeBlockLoader, Bean, RowNode, GROUP_AUTO_COLUMN_ID, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

var __decorate$g = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class FullStore extends RowNodeBlock {
    constructor(ssrmParams, storeParams, parentRowNode) {
        // finite block represents a cache with just one block, thus 0 is the id, it's the first block
        super(0);
        this.nodeIdSequence = new NumberSequence();
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
                field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
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
            field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
            level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn
        });
        if (index != null) {
            _.insertIntoArray(this.allRowNodes, rowNode, index);
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
            _.doOnce(() => console.warn(message, params), 'FullStore.noData');
        }
        this.createOrRecycleNodes(nodesToRecycle, params.rowData);
        if (nodesToRecycle) {
            this.blockUtils.destroyRowNodes(_.getAllValuesInObject(nodesToRecycle));
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
            const getRowIdFunc = this.gridOptionsService.getCallback('getRowId');
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
        const serverIsFiltering = !this.storeUtils.isServerSideOnlyRefreshFilteredGroups() || this.storeUtils.isServerSideFilterOnServer();
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
    forEachStoreDeep(callback, sequence = new NumberSequence()) {
        callback(this, sequence.next());
        this.allRowNodes.forEach(rowNode => {
            const childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachStoreDeep(callback, sequence);
            }
        });
    }
    forEachNodeDeep(callback, sequence = new NumberSequence()) {
        this.allRowNodes.forEach(rowNode => {
            callback(rowNode, sequence.next());
            const childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeep(callback, sequence);
            }
        });
    }
    forEachNodeDeepAfterFilterAndSort(callback, sequence = new NumberSequence()) {
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
        const serverIsFilteringAllLevels = !this.storeUtils.isServerSideOnlyRefreshFilteredGroups();
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
            case RowNodeBlock.STATE_FAILED:
                return { status: ServerSideTransactionResultStatus.StoreLoadingFailed };
            case RowNodeBlock.STATE_LOADING:
                return { status: ServerSideTransactionResultStatus.StoreLoading };
            case RowNodeBlock.STATE_WAITING_TO_LOAD:
                return { status: ServerSideTransactionResultStatus.StoreWaitingToLoad };
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
                return { status: ServerSideTransactionResultStatus.Cancelled };
            }
        }
        const res = {
            status: ServerSideTransactionResultStatus.Applied,
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
            this.selectionService.setNodesSelected({
                newValue: false,
                nodes: nodesToUnselect,
                suppressFinishActions: true,
                clearSelection: false,
                source: 'rowDataChanged',
            });
            const event = {
                type: Events.EVENT_SELECTION_CHANGED,
                source: 'rowDataChanged'
            };
            this.eventService.dispatchEvent(event);
        }
    }
    executeAdd(rowDataTran, rowNodeTransaction) {
        const { add, addIndex } = rowDataTran;
        if (_.missingOrEmpty(add)) {
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
        const getRowIdFunc = this.gridOptionsService.getCallback('getRowId');
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
        if (this.getState() === RowNodeBlock.STATE_FAILED) {
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
            type: Events.EVENT_STORE_UPDATED
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
        return this.getState() == RowNodeBlock.STATE_LOADED;
    }
    getRowNodesInRange(firstInRange, lastInRange) {
        const result = [];
        let inActiveRange = false;
        // if only one node passed, we start the selection at the top
        if (_.missing(firstInRange)) {
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
    getStoreBounds() {
        return {
            topPx: this.topPx,
            heightPx: this.heightPx,
        };
    }
}
__decorate$g([
    Autowired('ssrmStoreUtils')
], FullStore.prototype, "storeUtils", void 0);
__decorate$g([
    Autowired('ssrmBlockUtils')
], FullStore.prototype, "blockUtils", void 0);
__decorate$g([
    Autowired('columnModel')
], FullStore.prototype, "columnModel", void 0);
__decorate$g([
    Autowired('rowNodeBlockLoader')
], FullStore.prototype, "rowNodeBlockLoader", void 0);
__decorate$g([
    Autowired('rowNodeSorter')
], FullStore.prototype, "rowNodeSorter", void 0);
__decorate$g([
    Autowired('sortController')
], FullStore.prototype, "sortController", void 0);
__decorate$g([
    Autowired('selectionService')
], FullStore.prototype, "selectionService", void 0);
__decorate$g([
    Autowired('ssrmNodeManager')
], FullStore.prototype, "nodeManager", void 0);
__decorate$g([
    Autowired('filterManager')
], FullStore.prototype, "filterManager", void 0);
__decorate$g([
    Autowired('ssrmTransactionManager')
], FullStore.prototype, "transactionManager", void 0);
__decorate$g([
    PostConstruct
], FullStore.prototype, "postConstruct", null);
__decorate$g([
    PreDestroy
], FullStore.prototype, "destroyRowNodes", null);

var __decorate$f = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class LazyBlockLoader extends BeanStub {
    constructor(cache, parentNode, storeParams) {
        super();
        this.loadingNodes = new Set();
        this.checkForLoadQueued = false;
        this.loaderTimeout = undefined;
        this.nextBlockToLoad = undefined;
        this.parentNode = parentNode;
        this.cache = cache;
        this.storeParams = storeParams;
    }
    init() {
        this.addManagedListener(this.rowNodeBlockLoader, RowNodeBlockLoader.BLOCK_LOADED_EVENT, () => this.queueLoadAction());
    }
    isRowLoading(index) {
        return this.loadingNodes.has(index);
    }
    getBlockToLoad() {
        var _a;
        const firstRowInViewport = this.api.getFirstDisplayedRow();
        const lastRowInViewport = this.api.getLastDisplayedRow();
        // quick look-up for priority rows needing loading in viewport.
        for (let i = firstRowInViewport; i <= lastRowInViewport; i++) {
            const node = this.cache.getNodeCachedByDisplayIndex(i);
            if (!node) {
                // if no row details, ignore, as row hasn't been created
                // and it's too expensive to work out its location here
                continue;
            }
            const lazyNode = this.cache.getNodes().getBy('node', node);
            if (!lazyNode) {
                continue;
            }
            if (this.isRowLoading(lazyNode.index)) {
                continue;
            }
            if (node.__needsRefreshWhenVisible || (node.stub && !node.failedLoad)) {
                return this.getBlockStartIndexForIndex(lazyNode.index);
            }
        }
        const nodesToRefresh = this.cache.getNodesToRefresh();
        let nodeToRefresh = null;
        let nodeToRefreshDist = Number.MAX_SAFE_INTEGER;
        nodesToRefresh.forEach(node => {
            if (node.rowIndex == null) {
                nodeToRefresh = node;
                return;
            }
            const distToViewportTop = Math.abs(firstRowInViewport - node.rowIndex);
            const distToViewportBottom = Math.abs(node.rowIndex - lastRowInViewport);
            if (distToViewportTop < nodeToRefreshDist) {
                nodeToRefresh = node;
                nodeToRefreshDist = distToViewportTop;
            }
            if (distToViewportBottom < nodeToRefreshDist) {
                nodeToRefresh = node;
                nodeToRefreshDist = distToViewportBottom;
            }
        });
        const lazyIndex = (_a = this.cache.getNodes().getBy('node', nodeToRefresh)) === null || _a === void 0 ? void 0 : _a.index;
        return lazyIndex == null ? undefined : this.getBlockStartIndexForIndex(lazyIndex);
    }
    reset() {
        this.loadingNodes.clear();
        clearTimeout(this.loaderTimeout);
        this.loaderTimeout = undefined;
    }
    executeLoad(startRow, endRow) {
        var _a;
        const ssrmParams = this.cache.getSsrmParams();
        const request = {
            startRow,
            endRow,
            rowGroupCols: ssrmParams.rowGroupCols,
            valueCols: ssrmParams.valueCols,
            pivotCols: ssrmParams.pivotCols,
            pivotMode: ssrmParams.pivotMode,
            groupKeys: this.parentNode.getGroupKeys(),
            filterModel: ssrmParams.filterModel,
            sortModel: ssrmParams.sortModel,
        };
        const removeNodesFromLoadingMap = () => {
            for (let i = 0; i < endRow - startRow; i++) {
                this.loadingNodes.delete(startRow + i);
            }
        };
        const addNodesToLoadingMap = () => {
            for (let i = 0; i < endRow - startRow; i++) {
                this.loadingNodes.add(startRow + i);
            }
        };
        const success = (params) => {
            this.rowNodeBlockLoader.loadComplete();
            this.cache.onLoadSuccess(startRow, endRow - startRow, params);
            removeNodesFromLoadingMap();
            this.queueLoadAction();
        };
        const fail = () => {
            this.rowNodeBlockLoader.loadComplete();
            this.cache.onLoadFailed(startRow, endRow - startRow);
            removeNodesFromLoadingMap();
            this.queueLoadAction();
        };
        const params = {
            request,
            successCallback: (rowData, rowCount) => success({ rowData, rowCount }),
            success,
            failCallback: fail,
            fail,
            parentNode: this.parentNode,
            api: this.api,
            columnApi: this.columnApi,
            context: this.gridOptionsService.context
        };
        addNodesToLoadingMap();
        (_a = this.cache.getSsrmParams().datasource) === null || _a === void 0 ? void 0 : _a.getRows(params);
    }
    getNextBlockToLoad() {
        const result = this.getBlockToLoad();
        if (result != null && result < 0) {
            this.getBlockToLoad();
        }
        if (result != null) {
            return [String(result), result + this.getBlockSize()];
        }
        return null;
    }
    queueLoadCheck() {
        // already going to check next cycle, ignore.
        if (this.checkForLoadQueued) {
            return;
        }
        this.checkForLoadQueued = true;
        window.queueMicrotask(() => {
            this.checkForLoadQueued = false;
            this.queueLoadAction();
        });
    }
    queueLoadAction() {
        var _a;
        const nextBlockToLoad = this.getNextBlockToLoad();
        if (!nextBlockToLoad) {
            // there's no block we should be loading right now, clear the timeouts
            window.clearTimeout(this.loaderTimeout);
            this.loaderTimeout = undefined;
            this.nextBlockToLoad = undefined;
            return;
        }
        // if the next required block has changed, reset the loading timeout
        if (!this.nextBlockToLoad || (this.nextBlockToLoad[0] !== nextBlockToLoad[0] && this.nextBlockToLoad[1] !== nextBlockToLoad[1])) {
            this.nextBlockToLoad = nextBlockToLoad;
            window.clearTimeout(this.loaderTimeout);
            const [startRowString, endRow] = this.nextBlockToLoad;
            const startRow = Number(startRowString);
            this.loaderTimeout = window.setTimeout(() => {
                if (!this.cache.isAlive()) {
                    return;
                }
                this.loaderTimeout = undefined;
                this.attemptLoad(startRow, endRow);
                this.nextBlockToLoad = undefined;
            }, (_a = this.gridOptionsService.getNum('blockLoadDebounceMillis')) !== null && _a !== void 0 ? _a : 0);
        }
    }
    attemptLoad(start, end) {
        const availableLoadingCount = this.rowNodeBlockLoader.getAvailableLoadingCount();
        // too many loads already, ignore the request as a successful request will requeue itself anyway
        if (availableLoadingCount != null && availableLoadingCount === 0) {
            return;
        }
        this.rowNodeBlockLoader.registerLoads(1);
        this.executeLoad(start, end);
        this.queueLoadAction();
    }
    getBlockSize() {
        return this.storeParams.cacheBlockSize || LazyBlockLoader.DEFAULT_BLOCK_SIZE;
    }
    getBlockStartIndexForIndex(storeIndex) {
        const blockSize = this.getBlockSize();
        return storeIndex - (storeIndex % blockSize);
    }
    getBlockBoundsForIndex(storeIndex) {
        const startOfBlock = this.getBlockStartIndexForIndex(storeIndex);
        const blockSize = this.getBlockSize();
        return [startOfBlock, startOfBlock + blockSize];
    }
}
LazyBlockLoader.DEFAULT_BLOCK_SIZE = 100;
__decorate$f([
    Autowired('gridApi')
], LazyBlockLoader.prototype, "api", void 0);
__decorate$f([
    Autowired('columnApi')
], LazyBlockLoader.prototype, "columnApi", void 0);
__decorate$f([
    Autowired('rowNodeBlockLoader')
], LazyBlockLoader.prototype, "rowNodeBlockLoader", void 0);
__decorate$f([
    PostConstruct
], LazyBlockLoader.prototype, "init", null);

class MultiIndexMap {
    constructor(...indexes) {
        if (indexes.length < 1) {
            throw new Error('AG Grid: At least one index must be provided.');
        }
        this.indexes = indexes;
        this.maps = new Map(this.indexes.map(index => [index, new Map()]));
    }
    getBy(index, key) {
        const map = this.maps.get(index);
        if (!map) {
            throw new Error(`AG Grid: ${String(index)} not found`);
        }
        return map.get(key);
    }
    set(item) {
        this.indexes.forEach(index => {
            const map = this.maps.get(index);
            if (!map) {
                throw new Error(`AG Grid: ${String(index)} not found`);
            }
            map.set(item[index], item);
        });
    }
    delete(item) {
        this.indexes.forEach(index => {
            const map = this.maps.get(index);
            if (!map) {
                throw new Error(`AG Grid: ${String(index)} not found`);
            }
            map.delete(item[index]);
        });
    }
    clear() {
        this.maps.forEach(map => map.clear());
    }
    getIterator(index) {
        const map = this.maps.get(index);
        if (!map) {
            throw new Error(`AG Grid: ${String(index)} not found`);
        }
        return map.values();
    }
    forEach(callback) {
        const iterator = this.getIterator(this.indexes[0]);
        let pointer;
        while (pointer = iterator.next()) {
            if (pointer.done)
                break;
            callback(pointer.value);
        }
    }
    find(callback) {
        const iterator = this.getIterator(this.indexes[0]);
        let pointer;
        while (pointer = iterator.next()) {
            if (pointer.done)
                break;
            if (callback(pointer.value)) {
                return pointer.value;
            }
        }
    }
    filter(predicate) {
        const iterator = this.getIterator(this.indexes[0]);
        let pointer;
        const result = [];
        while (pointer = iterator.next()) {
            if (pointer.done)
                break;
            if (predicate(pointer.value)) {
                result.push(pointer.value);
            }
        }
        return result;
    }
}

var __decorate$e = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class LazyCache extends BeanStub {
    constructor(store, numberOfRows, storeParams) {
        super();
        /**
         * Indicates whether this is still the live dataset for this store (used for ignoring old requests after purge)
         */
        this.live = true;
        this.store = store;
        this.numberOfRows = numberOfRows;
        this.isLastRowKnown = false;
        this.storeParams = storeParams;
    }
    init() {
        // initiate the node map to be indexed at 'index', 'id' and 'node' for quick look-up.
        // it's important id isn't first, as stub nodes overwrite each-other, and the first index is
        // used for iteration.
        this.nodeMap = new MultiIndexMap('index', 'id', 'node');
        this.nodeDisplayIndexMap = new Map();
        this.nodesToRefresh = new Set();
        this.defaultNodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.store.getParentNode());
        this.rowLoader = this.createManagedBean(new LazyBlockLoader(this, this.store.getParentNode(), this.storeParams));
        this.getRowIdFunc = this.gridOptionsService.getCallback('getRowId');
        this.isMasterDetail = this.gridOptionsService.isMasterDetail();
    }
    destroyRowNodes() {
        this.numberOfRows = 0;
        this.nodeMap.forEach(node => this.blockUtils.destroyRowNode(node.node));
        this.nodeMap.clear();
        this.nodeDisplayIndexMap.clear();
        this.nodesToRefresh.clear();
        this.live = false;
    }
    /**
     * Get the row node for a specific display index from this store
     * @param displayIndex the display index of the node to find
     * @returns undefined if the node is not in the store bounds, otherwise will always return a node
     */
    getRowByDisplayIndex(displayIndex) {
        var _a, _b, _c, _d;
        // if index isn't in store, nothing to return
        if (!this.store.isDisplayIndexInStore(displayIndex)) {
            return undefined;
        }
        // first try to directly look this node up in the display index map
        const node = this.nodeDisplayIndexMap.get(displayIndex);
        if (node) {
            // if we have the node, check if it needs refreshed when rendered
            if (node.stub || node.__needsRefreshWhenVisible) {
                this.rowLoader.queueLoadCheck();
            }
            return node;
        }
        // next check if this is the first row, if so return a stub node
        // this is a performance optimisation, as it is the most common scenario
        // and enables the node - 1 check to kick in more often.
        if (displayIndex === this.store.getDisplayIndexStart()) {
            return this.createStubNode(0, displayIndex);
        }
        // check if the row immediately prior is available in the store
        const contiguouslyPreviousNode = this.nodeDisplayIndexMap.get(displayIndex - 1);
        if (contiguouslyPreviousNode) {
            // if previous row is master detail, and expanded, this node must be detail
            if (this.isMasterDetail && contiguouslyPreviousNode.master && contiguouslyPreviousNode.expanded) {
                return contiguouslyPreviousNode.detailNode;
            }
            // if previous row is expanded group, this node will belong to that group.
            if (contiguouslyPreviousNode.expanded && ((_a = contiguouslyPreviousNode.childStore) === null || _a === void 0 ? void 0 : _a.isDisplayIndexInStore(displayIndex))) {
                return (_b = contiguouslyPreviousNode.childStore) === null || _b === void 0 ? void 0 : _b.getRowUsingDisplayIndex(displayIndex);
            }
            // otherwise, row must be a stub node
            const lazyCacheNode = this.nodeMap.getBy('node', contiguouslyPreviousNode);
            return this.createStubNode(lazyCacheNode.index + 1, displayIndex);
        }
        const adjacentNodes = this.getSurroundingNodesByDisplayIndex(displayIndex);
        // if no bounds skipped includes this, calculate from end index
        if (adjacentNodes == null) {
            const storeIndexFromEndIndex = this.store.getRowCount() - (this.store.getDisplayIndexEnd() - displayIndex);
            return this.createStubNode(storeIndexFromEndIndex, displayIndex);
        }
        const { previousNode, nextNode } = adjacentNodes;
        // if the node before this node is expanded, this node might be a child of that node
        if (previousNode && previousNode.node.expanded && ((_c = previousNode.node.childStore) === null || _c === void 0 ? void 0 : _c.isDisplayIndexInStore(displayIndex))) {
            return (_d = previousNode.node.childStore) === null || _d === void 0 ? void 0 : _d.getRowUsingDisplayIndex(displayIndex);
        }
        // if we have the node after this node, we can calculate the store index of this node by the difference
        // in display indexes between the two nodes.
        if (nextNode) {
            const displayIndexDiff = nextNode.node.rowIndex - displayIndex;
            const newStoreIndex = nextNode.index - displayIndexDiff;
            return this.createStubNode(newStoreIndex, displayIndex);
        }
        // if no next node, calculate from end index of this store
        const storeIndexFromEndIndex = this.store.getRowCount() - (this.store.getDisplayIndexEnd() - displayIndex);
        return this.createStubNode(storeIndexFromEndIndex, displayIndex);
    }
    /**
     * Used for creating and positioning a stub node without firing a store updated event
     */
    createStubNode(storeIndex, displayIndex) {
        // bounds are acquired before creating the node, as otherwise it'll use it's own empty self to calculate
        const rowBounds = this.store.getRowBounds(displayIndex);
        const newNode = this.createRowAtIndex(storeIndex, null, node => {
            node.setRowIndex(displayIndex);
            node.setRowTop(rowBounds.rowTop);
            this.nodeDisplayIndexMap.set(displayIndex, node);
        });
        this.rowLoader.queueLoadCheck();
        return newNode;
    }
    /**
     * @param index The row index relative to this store
     * @returns A rowNode at the given store index
     */
    getRowByStoreIndex(index) {
        var _a;
        return (_a = this.nodeMap.getBy('index', index)) === null || _a === void 0 ? void 0 : _a.node;
    }
    /**
     * Given a number of rows, skips through the given sequence & row top reference (using default row height)
     * @param numberOfRowsToSkip number of rows to skip over in the given sequence
     * @param displayIndexSeq the sequence in which to skip
     * @param nextRowTop the row top reference in which to skip
     */
    skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop) {
        if (numberOfRowsToSkip === 0) {
            return;
        }
        const defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        displayIndexSeq.skip(numberOfRowsToSkip);
        nextRowTop.value += numberOfRowsToSkip * defaultRowHeight;
    }
    /**
     * @param displayIndexSeq the number sequence for generating the display index of each row
     * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
     */
    setDisplayIndexes(displayIndexSeq, nextRowTop) {
        // Create a map of display index nodes for access speed
        this.nodeDisplayIndexMap.clear();
        // create an object indexed by store index, as this will sort all of the nodes when we iterate
        // the object
        const orderedMap = {};
        this.nodeMap.forEach(lazyNode => {
            orderedMap[lazyNode.index] = lazyNode.node;
        });
        let lastIndex = -1;
        // iterate over the nodes in order, setting the display index on each node.
        for (const stringIndex in orderedMap) {
            const node = orderedMap[stringIndex];
            const numericIndex = Number(stringIndex);
            // if any nodes aren't currently in the store, skip the display indexes too
            const numberOfRowsToSkip = (numericIndex - 1) - lastIndex;
            this.skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop);
            // set this nodes index and row top
            this.blockUtils.setDisplayIndex(node, displayIndexSeq, nextRowTop);
            this.nodeDisplayIndexMap.set(node.rowIndex, node);
            // store this index for skipping after this
            lastIndex = numericIndex;
        }
        // need to skip rows until the end of this store
        const numberOfRowsToSkip = (this.numberOfRows - 1) - lastIndex;
        this.skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop);
        // this is not terribly efficient, and could probs be improved
        this.purgeExcessRows();
    }
    getRowCount() {
        return this.numberOfRows;
    }
    setRowCount(rowCount, isLastRowIndexKnown) {
        if (rowCount < 0) {
            throw new Error('AG Grid: setRowCount can only accept a positive row count.');
        }
        this.numberOfRows = rowCount;
        if (isLastRowIndexKnown != null) {
            this.isLastRowKnown = isLastRowIndexKnown;
            if (isLastRowIndexKnown === false) {
                this.numberOfRows += 1;
            }
        }
        this.fireStoreUpdatedEvent();
    }
    getNodes() {
        return this.nodeMap;
    }
    getNodeCachedByDisplayIndex(displayIndex) {
        var _a;
        return (_a = this.nodeDisplayIndexMap.get(displayIndex)) !== null && _a !== void 0 ? _a : null;
    }
    getNodesToRefresh() {
        return this.nodesToRefresh;
    }
    /**
     * @returns the previous and next loaded row nodes surrounding the given display index
     */
    getSurroundingNodesByDisplayIndex(displayIndex) {
        let nextNode;
        let previousNode;
        this.nodeMap.forEach(lazyNode => {
            // previous node
            if (displayIndex > lazyNode.node.rowIndex) {
                // get the largest previous node
                if (previousNode == null || previousNode.node.rowIndex < lazyNode.node.rowIndex) {
                    previousNode = lazyNode;
                }
                return;
            }
            // next node
            // get the smallest next node
            if (nextNode == null || nextNode.node.rowIndex > lazyNode.node.rowIndex) {
                nextNode = lazyNode;
                return;
            }
        });
        if (!previousNode && !nextNode)
            return null;
        return { previousNode, nextNode };
    }
    /**
     * Get or calculate the display index for a given store index
     * @param storeIndex the rows index within this store
     * @returns the rows visible display index relative to the grid
     */
    getDisplayIndexFromStoreIndex(storeIndex) {
        var _a, _b;
        const nodeAtIndex = this.nodeMap.getBy('index', storeIndex);
        if (nodeAtIndex) {
            return nodeAtIndex.node.rowIndex;
        }
        let nextNode;
        let previousNode;
        this.nodeMap.forEach(lazyNode => {
            // previous node
            if (storeIndex > lazyNode.index) {
                // get the largest previous node
                if (previousNode == null || previousNode.index < lazyNode.index) {
                    previousNode = lazyNode;
                }
                return;
            }
            // next node
            // get the smallest next node
            if (nextNode == null || nextNode.index > lazyNode.index) {
                nextNode = lazyNode;
                return;
            }
        });
        if (!nextNode) {
            return this.store.getDisplayIndexEnd() - (this.numberOfRows - storeIndex);
        }
        if (!previousNode) {
            return this.store.getDisplayIndexStart() + storeIndex;
        }
        const storeIndexDiff = storeIndex - previousNode.index;
        const previousDisplayIndex = ((_b = (_a = previousNode.node.childStore) === null || _a === void 0 ? void 0 : _a.getDisplayIndexEnd()) !== null && _b !== void 0 ? _b : previousNode.node.rowIndex);
        return previousDisplayIndex + storeIndexDiff;
    }
    /**
     * Creates a new row and inserts it at the given index
     * @param atStoreIndex the node index relative to this store
     * @param data the data object to populate the node with
     * @returns the new row node
     */
    createRowAtIndex(atStoreIndex, data, createNodeCallback) {
        // make sure an existing node isn't being overwritten
        const lazyNode = this.nodeMap.getBy('index', atStoreIndex);
        // if node already exists, update it or destroy it
        if (lazyNode) {
            const { node } = lazyNode;
            this.nodesToRefresh.delete(node);
            node.__needsRefreshWhenVisible = false;
            // if the node is the same, just update the content
            if (this.doesNodeMatch(data, node)) {
                this.blockUtils.updateDataIntoRowNode(node, data);
                return node;
            }
            // if there's no id and this is an open group, protect this node from changes
            if (this.getRowIdFunc == null && node.group && node.expanded) {
                return node;
            }
            // destroy the old node, might be worth caching state here
            this.destroyRowAtIndex(atStoreIndex);
        }
        // if the node already exists elsewhere, update it and move it to the new location
        if (data && this.getRowIdFunc != null) {
            const id = this.getRowId(data);
            const lazyNode = this.nodeMap.getBy('id', id);
            if (lazyNode) {
                // delete old lazy node so we can insert it at different location
                this.nodeMap.delete(lazyNode);
                const { node, index } = lazyNode;
                this.blockUtils.updateDataIntoRowNode(node, data);
                this.nodeMap.set({
                    id: node.id,
                    node,
                    index: atStoreIndex
                });
                // mark all of the old block as needsVerify to trigger it for a refresh, as nodes
                // should not be out of place
                this.markBlockForVerify(index);
                return node;
            }
        }
        // node doesn't exist, create a new one
        const newNode = this.blockUtils.createRowNode(this.store.getRowDetails());
        if (data != null) {
            const defaultId = this.getPrefixedId(this.store.getIdSequence().next());
            this.blockUtils.setDataIntoRowNode(newNode, data, defaultId, undefined);
            this.blockUtils.checkOpenByDefault(newNode);
            this.nodeManager.addRowNode(newNode);
        }
        // add the new node to the store, has to be done after the display index is calculated so it doesn't take itself into account
        this.nodeMap.set({
            id: newNode.id,
            node: newNode,
            index: atStoreIndex,
        });
        if (createNodeCallback) {
            createNodeCallback(newNode);
        }
        return newNode;
    }
    getBlockStates() {
        const blockCounts = {};
        const blockStates = {};
        this.nodeMap.forEach(({ node, index }) => {
            var _a;
            const blockStart = this.rowLoader.getBlockStartIndexForIndex(index);
            if (!node.stub && !node.failedLoad) {
                blockCounts[blockStart] = ((_a = blockCounts[blockStart]) !== null && _a !== void 0 ? _a : 0) + 1;
            }
            let rowState = 'loaded';
            if (node.failedLoad) {
                rowState = 'failed';
            }
            else if (this.rowLoader.isRowLoading(blockStart)) {
                rowState = 'loading';
            }
            else if (this.nodesToRefresh.has(node) || node.stub) {
                rowState = 'needsLoading';
            }
            if (!blockStates[blockStart]) {
                blockStates[blockStart] = new Set();
            }
            blockStates[blockStart].add(rowState);
        });
        const statePriorityMap = {
            loading: 4,
            failed: 3,
            needsLoading: 2,
            loaded: 1,
        };
        const blockPrefix = this.blockUtils.createNodeIdPrefix(this.store.getParentNode());
        const results = {};
        Object.entries(blockStates).forEach(([blockStart, uniqueStates]) => {
            var _a;
            const sortedStates = [...uniqueStates].sort((a, b) => { var _a, _b; return ((_a = statePriorityMap[a]) !== null && _a !== void 0 ? _a : 0) - ((_b = statePriorityMap[b]) !== null && _b !== void 0 ? _b : 0); });
            const priorityState = sortedStates[0];
            const blockNumber = Number(blockStart) / this.rowLoader.getBlockSize();
            const blockId = blockPrefix ? `${blockPrefix}-${blockNumber}` : String(blockNumber);
            results[blockId] = {
                blockNumber,
                startRow: Number(blockStart),
                endRow: Number(blockStart) + this.rowLoader.getBlockSize(),
                pageStatus: priorityState,
                loadedRowCount: (_a = blockCounts[blockStart]) !== null && _a !== void 0 ? _a : 0,
            };
        });
        return results;
    }
    destroyRowAtIndex(atStoreIndex) {
        const lazyNode = this.nodeMap.getBy('index', atStoreIndex);
        if (!lazyNode) {
            return;
        }
        this.nodeMap.delete(lazyNode);
        this.nodeDisplayIndexMap.delete(lazyNode.node.rowIndex);
        this.nodesToRefresh.delete(lazyNode.node);
        this.blockUtils.destroyRowNode(lazyNode.node);
    }
    getSsrmParams() {
        return this.store.getSsrmParams();
    }
    /**
     * @param id the base id to be prefixed
     * @returns a node id with prefix if required
     */
    getPrefixedId(id) {
        if (this.defaultNodeIdPrefix) {
            return this.defaultNodeIdPrefix + '-' + id;
        }
        else {
            return id.toString();
        }
    }
    markBlockForVerify(rowIndex) {
        const [start, end] = this.rowLoader.getBlockBoundsForIndex(rowIndex);
        const lazyNodesInRange = this.nodeMap.filter((lazyNode) => lazyNode.index >= start && lazyNode.index < end);
        lazyNodesInRange.forEach(({ node }) => {
            node.__needsRefreshWhenVisible = true;
        });
    }
    doesNodeMatch(data, node) {
        if (node.stub) {
            return false;
        }
        if (this.getRowIdFunc != null) {
            const id = this.getRowId(data);
            return node.id === id;
        }
        return node.data === data;
    }
    /**
     * Deletes any stub nodes not within the given range
     */
    purgeStubsOutsideOfViewport() {
        const firstRow = this.api.getFirstDisplayedRow();
        const lastRow = this.api.getLastDisplayedRow();
        const firstRowBlockStart = this.rowLoader.getBlockStartIndexForIndex(firstRow);
        const [_, lastRowBlockEnd] = this.rowLoader.getBlockBoundsForIndex(lastRow);
        this.nodeMap.forEach(lazyNode => {
            // failed loads are still useful, so we don't purge them
            if (this.rowLoader.isRowLoading(lazyNode.index) || lazyNode.node.failedLoad) {
                return;
            }
            if (lazyNode.node.stub && (lazyNode.index < firstRowBlockStart || lazyNode.index > lastRowBlockEnd)) {
                this.destroyRowAtIndex(lazyNode.index);
            }
        });
    }
    getBlocksDistanceFromRow(nodes, otherDisplayIndex) {
        const blockDistanceToMiddle = {};
        nodes.forEach(({ node, index }) => {
            const [blockStart, blockEnd] = this.rowLoader.getBlockBoundsForIndex(index);
            if (blockStart in blockDistanceToMiddle) {
                return;
            }
            const distStart = Math.abs(node.rowIndex - otherDisplayIndex);
            let distEnd;
            // may not have an end node if the block came back small 
            const lastLazyNode = this.nodeMap.getBy('index', [blockEnd - 1]);
            if (lastLazyNode)
                distEnd = Math.abs(lastLazyNode.node.rowIndex - otherDisplayIndex);
            const farthest = distEnd == null || distStart < distEnd ? distStart : distEnd;
            blockDistanceToMiddle[blockStart] = farthest;
        });
        return Object.entries(blockDistanceToMiddle);
    }
    purgeExcessRows() {
        var _a;
        // Delete all stub nodes which aren't in the viewport or already loading
        this.purgeStubsOutsideOfViewport();
        if (this.store.getDisplayIndexEnd() == null || this.storeParams.maxBlocksInCache == null) {
            // if group is collapsed, or max blocks missing, ignore the event
            return;
        }
        const firstRowInViewport = this.api.getFirstDisplayedRow();
        const lastRowInViewport = this.api.getLastDisplayedRow();
        // the start storeIndex of every block in this store
        const allLoadedBlocks = new Set();
        // the start storeIndex of every displayed block in this store
        const blocksInViewport = new Set();
        this.nodeMap.forEach(({ index, node }) => {
            const blockStart = this.rowLoader.getBlockStartIndexForIndex(index);
            allLoadedBlocks.add(blockStart);
            const isInViewport = node.rowIndex >= firstRowInViewport && node.rowIndex <= lastRowInViewport;
            if (isInViewport) {
                blocksInViewport.add(blockStart);
            }
        });
        // if the viewport is larger than the max blocks, then the viewport size is minimum cache size
        const numberOfBlocksToRetain = Math.max(blocksInViewport.size, (_a = this.storeParams.maxBlocksInCache) !== null && _a !== void 0 ? _a : 0);
        // ensure there is blocks that can be removed
        const loadedBlockCount = allLoadedBlocks.size;
        const blocksToRemove = loadedBlockCount - numberOfBlocksToRetain;
        if (blocksToRemove <= 0) {
            return;
        }
        // the first and last block in the viewport
        let firstRowBlockStart = Number.MAX_SAFE_INTEGER;
        let lastRowBlockStart = Number.MIN_SAFE_INTEGER;
        blocksInViewport.forEach(blockStart => {
            if (firstRowBlockStart > blockStart) {
                firstRowBlockStart = blockStart;
            }
            if (lastRowBlockStart < blockStart) {
                lastRowBlockStart = blockStart;
            }
        });
        // all nodes which aren't cached or in the viewport, and so can be removed
        const disposableNodes = this.nodeMap.filter(({ node, index }) => {
            const rowBlockStart = this.rowLoader.getBlockStartIndexForIndex(index);
            const rowBlockInViewport = rowBlockStart >= firstRowBlockStart && rowBlockStart <= lastRowBlockStart;
            return !rowBlockInViewport && !this.isNodeCached(node);
        });
        if (disposableNodes.length === 0) {
            return;
        }
        const midViewportRow = firstRowInViewport + ((lastRowInViewport - firstRowInViewport) / 2);
        const blockDistanceArray = this.getBlocksDistanceFromRow(disposableNodes, midViewportRow);
        const blockSize = this.rowLoader.getBlockSize();
        // sort the blocks by distance from middle of viewport
        blockDistanceArray.sort((a, b) => Math.sign(b[1] - a[1]));
        // remove excess blocks, starting from furthest from viewport
        for (let i = 0; i < Math.min(blocksToRemove, blockDistanceArray.length); i++) {
            const blockStart = Number(blockDistanceArray[i][0]);
            for (let x = blockStart; x < blockStart + blockSize; x++) {
                const lazyNode = this.nodeMap.getBy('index', x);
                if (!lazyNode || this.isNodeCached(lazyNode.node)) {
                    continue;
                }
                this.destroyRowAtIndex(x);
            }
        }
    }
    isNodeFocused(node) {
        const focusedCell = this.focusService.getFocusCellToUseAfterRefresh();
        if (!focusedCell) {
            return false;
        }
        if (focusedCell.rowPinned != null) {
            return false;
        }
        const hasFocus = focusedCell.rowIndex === node.rowIndex;
        return hasFocus;
    }
    isNodeCached(node) {
        return (node.isExpandable() && node.expanded) || this.isNodeFocused(node);
    }
    extractDuplicateIds(rows) {
        if (!this.getRowIdFunc == null) {
            return [];
        }
        const newIds = new Set();
        const duplicates = new Set();
        rows.forEach(data => {
            const id = this.getRowId(data);
            if (newIds.has(id)) {
                duplicates.add(id);
                return;
            }
            newIds.add(id);
        });
        return [...duplicates];
    }
    onLoadSuccess(firstRowIndex, numberOfRowsExpected, response) {
        var _a;
        if (!this.live)
            return;
        const info = (_a = response.groupLevelInfo) !== null && _a !== void 0 ? _a : response.storeInfo;
        this.store.setStoreInfo(info);
        if (this.getRowIdFunc != null) {
            const duplicates = this.extractDuplicateIds(response.rowData);
            if (duplicates.length > 0) {
                const duplicateIdText = duplicates.join(', ');
                console.warn(`AG Grid: Unable to display rows as duplicate row ids (${duplicateIdText}) were returned by the getRowId callback. Please modify the getRowId callback to provide unique ids.`);
                this.onLoadFailed(firstRowIndex, numberOfRowsExpected);
                return;
            }
        }
        const wasRefreshing = this.nodesToRefresh.size > 0;
        response.rowData.forEach((data, responseRowIndex) => {
            var _a;
            const rowIndex = firstRowIndex + responseRowIndex;
            const nodeFromCache = this.nodeMap.getBy('index', rowIndex);
            // if stub, overwrite
            if ((_a = nodeFromCache === null || nodeFromCache === void 0 ? void 0 : nodeFromCache.node) === null || _a === void 0 ? void 0 : _a.stub) {
                this.createRowAtIndex(rowIndex, data);
                return;
            }
            if (nodeFromCache && this.doesNodeMatch(data, nodeFromCache.node)) {
                this.blockUtils.updateDataIntoRowNode(nodeFromCache.node, data);
                this.nodesToRefresh.delete(nodeFromCache.node);
                nodeFromCache.node.__needsRefreshWhenVisible = false;
                return;
            }
            // create row will handle deleting the overwritten row
            this.createRowAtIndex(rowIndex, data);
        });
        const finishedRefreshing = this.nodesToRefresh.size === 0;
        if (wasRefreshing && finishedRefreshing) {
            this.fireRefreshFinishedEvent();
        }
        if (response.rowCount != undefined && response.rowCount !== -1) {
            // if the rowCount has been provided, set the row count
            this.numberOfRows = response.rowCount;
            this.isLastRowKnown = true;
        }
        else if (numberOfRowsExpected > response.rowData.length) {
            // infer the last row as the response came back short
            this.numberOfRows = firstRowIndex + response.rowData.length;
            this.isLastRowKnown = true;
        }
        else if (!this.isLastRowKnown) {
            // add 1 for loading row, as we don't know the last row
            const lastInferredRow = firstRowIndex + response.rowData.length + 1;
            if (lastInferredRow > this.numberOfRows) {
                this.numberOfRows = lastInferredRow;
            }
        }
        if (this.isLastRowKnown) {
            // delete any rows after the last index
            const lazyNodesAfterStoreEnd = this.nodeMap.filter(lazyNode => lazyNode.index >= this.numberOfRows);
            lazyNodesAfterStoreEnd.forEach(lazyNode => this.destroyRowAtIndex(lazyNode.index));
        }
        this.fireStoreUpdatedEvent();
    }
    fireRefreshFinishedEvent() {
        const finishedRefreshing = this.nodesToRefresh.size === 0;
        // if anything refreshing currently, skip.
        if (!finishedRefreshing) {
            return;
        }
        this.store.fireRefreshFinishedEvent();
    }
    isLastRowIndexKnown() {
        return this.isLastRowKnown;
    }
    onLoadFailed(firstRowIndex, numberOfRowsExpected) {
        var _a;
        if (!this.live)
            return;
        const wasRefreshing = this.nodesToRefresh.size > 0;
        for (let i = firstRowIndex; i < firstRowIndex + numberOfRowsExpected && i < this.getRowCount(); i++) {
            let { node } = (_a = this.nodeMap.getBy('index', i)) !== null && _a !== void 0 ? _a : {};
            if (node) {
                this.nodesToRefresh.delete(node);
            }
            if (!node || !node.stub) {
                if (node && !node.stub) {
                    // if node is not a stub, we destroy it and recreate as nodes can't go from data to stub
                    this.destroyRowAtIndex(i);
                }
                node = this.createRowAtIndex(i);
            }
            // this node has been refreshed, even if it wasn't successful
            node.__needsRefreshWhenVisible = false;
            node.failedLoad = true;
        }
        const finishedRefreshing = this.nodesToRefresh.size === 0;
        if (wasRefreshing && finishedRefreshing) {
            this.fireRefreshFinishedEvent();
        }
        this.fireStoreUpdatedEvent();
    }
    markNodesForRefresh() {
        this.nodeMap.forEach(lazyNode => {
            if (lazyNode.node.stub && !lazyNode.node.failedLoad) {
                return;
            }
            this.nodesToRefresh.add(lazyNode.node);
        });
        this.rowLoader.queueLoadCheck();
        if (this.isLastRowKnown && this.numberOfRows === 0) {
            this.numberOfRows = 1;
            this.isLastRowKnown = false;
            this.fireStoreUpdatedEvent();
        }
    }
    isNodeInCache(id) {
        return !!this.nodeMap.getBy('id', id);
    }
    // gets called 1) row count changed 2) cache purged 3) items inserted
    fireStoreUpdatedEvent() {
        if (!this.live) {
            return;
        }
        this.store.fireStoreUpdatedEvent();
    }
    getRowId(data) {
        if (this.getRowIdFunc == null) {
            return null;
        }
        // find rowNode using id
        const { level } = this.store.getRowDetails();
        const parentKeys = this.store.getParentNode().getGroupKeys();
        const id = this.getRowIdFunc({
            data,
            parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
            level,
        });
        return String(id);
    }
    updateRowNodes(updates) {
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }
        const updatedNodes = [];
        updates.forEach(data => {
            const id = this.getRowId(data);
            const lazyNode = this.nodeMap.getBy('id', id);
            if (lazyNode) {
                this.blockUtils.updateDataIntoRowNode(lazyNode.node, data);
                updatedNodes.push(lazyNode.node);
            }
        });
        return updatedNodes;
    }
    insertRowNodes(inserts, indexToAdd) {
        // if missing and we know the last row, we're inserting at the end
        const addIndex = indexToAdd == null && this.isLastRowKnown ? this.store.getRowCount() : indexToAdd;
        // can't insert nodes past the end of the store
        if (addIndex == null || this.store.getRowCount() < addIndex) {
            return [];
        }
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }
        const uniqueInsertsMap = {};
        inserts.forEach(data => {
            const dataId = this.getRowId(data);
            if (dataId && this.isNodeInCache(dataId)) {
                return;
            }
            uniqueInsertsMap[dataId] = data;
        });
        const uniqueInserts = Object.values(uniqueInsertsMap);
        let numberOfInserts = uniqueInserts.length;
        if (numberOfInserts === 0) {
            return [];
        }
        const nodesToMove = this.nodeMap.filter(node => node.index >= addIndex);
        // delete all nodes which need moved first, so they don't get overwritten
        nodesToMove.forEach(lazyNode => this.nodeMap.delete(lazyNode));
        // then move the nodes to their new locations
        nodesToMove.forEach(lazyNode => {
            this.nodeMap.set({
                node: lazyNode.node,
                index: lazyNode.index + numberOfInserts,
                id: lazyNode.id,
            });
        });
        // increase the store size to accommodate
        this.numberOfRows += numberOfInserts;
        // finally insert the new rows
        return uniqueInserts.map((data, uniqueInsertOffset) => this.createRowAtIndex(addIndex + uniqueInsertOffset, data));
    }
    getOrderedNodeMap() {
        const obj = {};
        this.nodeMap.forEach(node => obj[node.index] = node);
        return obj;
    }
    clearDisplayIndexes() {
        this.nodeDisplayIndexMap.clear();
    }
    removeRowNodes(idsToRemove) {
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }
        const removedNodes = [];
        const nodesToVerify = [];
        // track how many nodes have been deleted, as when we pass other nodes we need to shift them up
        let deletedNodeCount = 0;
        const remainingIdsToRemove = [...idsToRemove];
        const allNodes = this.getOrderedNodeMap();
        let contiguousIndex = -1;
        for (let stringIndex in allNodes) {
            contiguousIndex += 1;
            const node = allNodes[stringIndex];
            // finding the index allows the use of splice which should be slightly faster than both a check and filter
            const matchIndex = remainingIdsToRemove.findIndex(idToRemove => idToRemove === node.id);
            if (matchIndex !== -1) {
                // found node, remove it from nodes to remove
                remainingIdsToRemove.splice(matchIndex, 1);
                this.destroyRowAtIndex(Number(stringIndex));
                removedNodes.push(node.node);
                deletedNodeCount += 1;
                continue;
            }
            // no nodes removed and this node doesn't match, so no need to shift
            if (deletedNodeCount === 0) {
                continue;
            }
            const numericStoreIndex = Number(stringIndex);
            if (contiguousIndex !== numericStoreIndex) {
                nodesToVerify.push(node.node);
            }
            // shift normal node up by number of deleted prior to this point
            this.nodeMap.delete(allNodes[stringIndex]);
            this.nodeMap.set({
                id: node.id,
                node: node.node,
                index: numericStoreIndex - deletedNodeCount,
            });
        }
        this.numberOfRows -= this.isLastRowIndexKnown() ? idsToRemove.length : deletedNodeCount;
        if (remainingIdsToRemove.length > 0 && nodesToVerify.length > 0) {
            nodesToVerify.forEach(node => node.__needsRefreshWhenVisible = true);
            this.rowLoader.queueLoadCheck();
        }
        return removedNodes;
    }
}
__decorate$e([
    Autowired('gridApi')
], LazyCache.prototype, "api", void 0);
__decorate$e([
    Autowired('ssrmBlockUtils')
], LazyCache.prototype, "blockUtils", void 0);
__decorate$e([
    Autowired('focusService')
], LazyCache.prototype, "focusService", void 0);
__decorate$e([
    Autowired('ssrmNodeManager')
], LazyCache.prototype, "nodeManager", void 0);
__decorate$e([
    PostConstruct
], LazyCache.prototype, "init", null);
__decorate$e([
    PreDestroy
], LazyCache.prototype, "destroyRowNodes", null);

var __decorate$d = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class LazyStore extends BeanStub {
    constructor(ssrmParams, storeParams, parentRowNode) {
        super();
        this.idSequence = new NumberSequence();
        this.ssrmParams = ssrmParams;
        this.parentRowNode = parentRowNode;
        this.storeParams = storeParams;
        this.level = parentRowNode.level + 1;
        this.group = ssrmParams.rowGroupCols ? this.level < ssrmParams.rowGroupCols.length : false;
        this.leafGroup = ssrmParams.rowGroupCols ? this.level === ssrmParams.rowGroupCols.length - 1 : false;
        this.info = {};
    }
    init() {
        let numberOfRows = 1;
        if (this.level === 0) {
            numberOfRows = this.storeUtils.getServerSideInitialRowCount();
        }
        this.cache = this.createManagedBean(new LazyCache(this, numberOfRows, this.storeParams));
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
        const idFunc = this.gridOptionsService.getCallback('getRowId');
        if (!idFunc) {
            console.warn('AG Grid: getRowId callback must be implemented for transactions to work. Transaction was ignored.');
            return {
                status: ServerSideTransactionResultStatus.Cancelled,
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
                return { status: ServerSideTransactionResultStatus.Cancelled };
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
            status: ServerSideTransactionResultStatus.Applied,
            update: updatedNodes,
            add: insertedNodes,
            remove: removedNodes,
        };
    }
    updateSelectionAfterTransaction(updatedNodes, removedNodes) {
        const nodesToDeselect = [];
        updatedNodes === null || updatedNodes === void 0 ? void 0 : updatedNodes.forEach(node => {
            if (node.isSelected() && !node.selectable) {
                nodesToDeselect.push(node);
            }
        });
        removedNodes === null || removedNodes === void 0 ? void 0 : removedNodes.forEach(node => {
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
    }
    /**
     * Clear the display indexes, used for fading rows out when stores are not being destroyed
     */
    clearDisplayIndexes() {
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.cache.getNodes().forEach(lazyNode => this.blockUtils.clearDisplayIndex(lazyNode.node));
        if (this.parentRowNode.sibling) {
            this.blockUtils.clearDisplayIndex(this.parentRowNode.sibling);
        }
        this.cache.clearDisplayIndexes();
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
        if (this.parentRowNode.sibling) {
            return this.cache.getRowCount() + 1;
        }
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
        if (this.parentRowNode.sibling) {
            this.blockUtils.setDisplayIndex(this.parentRowNode.sibling, displayIndexSeq, nextRowTop);
        }
        this.displayIndexEnd = displayIndexSeq.peek();
        this.heightPx = nextRowTop.value - this.topPx;
    }
    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively server side filtered stores, this is the same as getNodes().forEachDeepAfterFilterAndSort
     */
    forEachStoreDeep(callback, sequence = new NumberSequence()) {
        callback(this, sequence.next());
        this.cache.getNodes().forEach(lazyNode => {
            const childCache = lazyNode.node.childStore;
            if (childCache) {
                childCache.forEachStoreDeep(callback, sequence);
            }
        });
    }
    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively server side filtered stores, this is the same as getNodes().forEachDeepAfterFilterAndSort
     */
    forEachNodeDeep(callback, sequence = new NumberSequence()) {
        this.cache.getNodes().forEach(lazyNode => {
            callback(lazyNode.node, sequence.next());
            const childCache = lazyNode.node.childStore;
            if (childCache) {
                childCache.forEachNodeDeep(callback, sequence);
            }
        });
    }
    /**
     * Recursively applies a provided function to every node
     *
     * For the purpose of exclusively server side filtered stores, this is the same as getNodes().forEachDeep
     */
    forEachNodeDeepAfterFilterAndSort(callback, sequence = new NumberSequence()) {
        const orderedNodes = this.cache.getOrderedNodeMap();
        for (let key in orderedNodes) {
            const lazyNode = orderedNodes[key];
            callback(lazyNode.node, sequence.next());
            const childCache = lazyNode.node.childStore;
            if (childCache) {
                childCache.forEachNodeDeepAfterFilterAndSort(callback, sequence);
            }
        }
    }
    /**
     * Removes the failed status from all nodes, and marks them as stub to encourage reloading
     */
    retryLoads() {
        this.cache.getNodes().forEach(({ node }) => {
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
        if (this.parentRowNode.sibling && displayRowIndex === this.parentRowNode.sibling.rowIndex) {
            return this.parentRowNode.sibling;
        }
        return this.cache.getRowByDisplayIndex(displayRowIndex);
    }
    /**
     * Given a display index, returns the row top and height for the row at that index.
     *
     * @param displayIndex the display index of the node
     * @returns an object containing the rowTop and rowHeight of the node at the given displayIndex
     */
    getRowBounds(displayIndex) {
        var _a;
        if (!this.isDisplayIndexInStore(displayIndex)) {
            return null;
        }
        const thisNode = this.cache.getNodeCachedByDisplayIndex(displayIndex);
        if (thisNode) {
            const boundsFromRow = this.blockUtils.extractRowBounds(thisNode, displayIndex);
            if (boundsFromRow) {
                return boundsFromRow;
            }
        }
        const { previousNode, nextNode } = (_a = this.cache.getSurroundingNodesByDisplayIndex(displayIndex)) !== null && _a !== void 0 ? _a : {};
        // previous node may equal, or catch via detail node or child of group
        if (previousNode) {
            const boundsFromRow = this.blockUtils.extractRowBounds(previousNode.node, displayIndex);
            if (boundsFromRow != null) {
                return boundsFromRow;
            }
        }
        const defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        // if node after this, can calculate backwards (and ignore detail/grouping)
        if (nextNode) {
            const numberOfRowDiff = (nextNode.node.rowIndex - displayIndex) * defaultRowHeight;
            return {
                rowTop: nextNode.node.rowTop - numberOfRowDiff,
                rowHeight: defaultRowHeight,
            };
        }
        // otherwise calculate from end of store
        const lastTop = this.topPx + this.heightPx;
        const numberOfRowDiff = (this.getDisplayIndexEnd() - displayIndex) * defaultRowHeight;
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
        let distToPreviousNodeTop = Number.MAX_SAFE_INTEGER;
        let previousNode = null;
        let distToNextNodeTop = Number.MAX_SAFE_INTEGER;
        let nextNode = null;
        this.cache.getNodes().forEach(({ node }) => {
            const distBetween = Math.abs(pixel - node.rowTop);
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
            const lazyNode = this.cache.getNodes().find(lazyNode => lazyNode.node.key == key);
            if (!lazyNode) {
                return null;
            }
            return lazyNode.node;
        });
    }
    /**
     * Executes a provided callback on each child store belonging to this store
     *
     * @param cb the callback to execute
     */
    forEachChildStoreShallow(cb) {
        this.cache.getNodes().forEach(({ node }) => {
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
            this.cache = this.createManagedBean(new LazyCache(this, oldCount, this.storeParams));
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
        const serverFiltersAllLevels = !this.storeUtils.isServerSideOnlyRefreshFilteredGroups();
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
            this.cache = this.createManagedBean(new LazyCache(this, 1, this.storeParams));
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
        // if only one node passed, we start the selection at the top
        if (_.missing(firstInRange)) ;
        return this.cache.getNodes().filter(({ node }) => {
            return node.rowIndex >= firstInRange.rowIndex && node.rowIndex <= lastInRange.rowIndex;
        }).map(({ node }) => node);
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
        if (info) {
            Object.assign(this.info, info);
        }
    }
    // gets called 1) row count changed 2) cache purged
    fireStoreUpdatedEvent() {
        // this results in row model firing ModelUpdated.
        // server side row model also updates the row indexes first
        const event = {
            type: Events.EVENT_STORE_UPDATED
        };
        this.eventService.dispatchEvent(event);
    }
    // gets called when row data updated, and no more refreshing needed
    fireRefreshFinishedEvent() {
        const event = {
            type: Events.EVENT_STORE_REFRESHED,
            route: this.parentRowNode.getRoute(),
        };
        this.eventService.dispatchEvent(event);
    }
    getBlockStates() {
        return this.cache.getBlockStates();
    }
    getStoreBounds() {
        return {
            topPx: this.topPx,
            heightPx: this.heightPx,
        };
    }
}
__decorate$d([
    Autowired('ssrmBlockUtils')
], LazyStore.prototype, "blockUtils", void 0);
__decorate$d([
    Autowired('ssrmStoreUtils')
], LazyStore.prototype, "storeUtils", void 0);
__decorate$d([
    Autowired('columnModel')
], LazyStore.prototype, "columnModel", void 0);
__decorate$d([
    Autowired('selectionService')
], LazyStore.prototype, "selectionService", void 0);
__decorate$d([
    PostConstruct
], LazyStore.prototype, "init", null);
__decorate$d([
    PreDestroy
], LazyStore.prototype, "destroyRowNodes", null);

var __decorate$c = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let ServerSideRowModel = class ServerSideRowModel extends BeanStub {
    constructor() {
        super(...arguments);
        this.onRowHeightChanged_debounced = _.debounce(this.onRowHeightChanged.bind(this), 100);
        this.pauseStoreUpdateListening = false;
        this.started = false;
    }
    // we don't implement as lazy row heights is not supported in this row model
    ensureRowHeightsValid() { return false; }
    start() {
        this.started = true;
        const datasource = this.gridOptionsService.get('serverSideDatasource');
        if (datasource) {
            this.setDatasource(datasource);
        }
    }
    destroyDatasource() {
        if (!this.datasource) {
            return;
        }
        if (this.datasource.destroy) {
            this.datasource.destroy();
        }
        this.rowRenderer.datasourceChanged();
        this.datasource = undefined;
    }
    addEventListeners() {
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnEverything.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_STORE_UPDATED, this.onStoreUpdated.bind(this));
        const resetListener = this.resetRootStore.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, resetListener);
        this.verifyProps();
    }
    verifyProps() {
        if (this.gridOptionsService.exists('initialGroupOrderComparator')) {
            const message = `AG Grid: initialGroupOrderComparator cannot be used with Server Side Row Model. If using Full Store, then provide the rows to the grid in the desired sort order. If using Infinite Scroll, then sorting is done on the server side, nothing to do with the client.`;
            _.doOnce(() => console.warn(message), 'SSRM.InitialGroupOrderComparator');
        }
        if (this.gridOptionsService.isRowSelection() && !this.gridOptionsService.exists('getRowId')) {
            const message = `AG Grid: getRowId callback must be provided for Server Side Row Model selection to work correctly.`;
            _.doOnce(() => console.warn(message), 'SSRM.SelectionNeedsRowNodeIdFunc');
        }
    }
    setDatasource(datasource) {
        // sometimes React, due to async, can call gridApi.setDatasource() before we have started.
        // this happens when React app does this:
        //      useEffect(() => setDatasource(ds), []);
        // thus if we set the datasource before the grid UI has finished initialising, we do not set it,
        // and the ssrm.start() method will set the datasoure when the grid is ready.
        if (!this.started) {
            return;
        }
        this.destroyDatasource();
        this.datasource = datasource;
        this.resetRootStore();
    }
    isLastRowIndexKnown() {
        const cache = this.getRootStore();
        if (!cache) {
            return false;
        }
        return cache.isLastRowIndexKnown();
    }
    onColumnEverything() {
        // if first time, always reset
        if (!this.storeParams) {
            this.resetRootStore();
            return;
        }
        // check if anything pertaining to fetching data has changed, and if it has, reset, but if
        // it has not, don't reset
        const rowGroupColumnVos = this.columnsToValueObjects(this.columnModel.getRowGroupColumns());
        const valueColumnVos = this.columnsToValueObjects(this.columnModel.getValueColumns());
        const pivotColumnVos = this.columnsToValueObjects(this.columnModel.getPivotColumns());
        // compares two sets of columns, ensuring no columns have been added or removed (unless specified via allowRemovedColumns)
        // if the columns are found, also ensures the field and aggFunc properties have not been changed.
        const areColsSame = (params) => {
            const oldColsMap = {};
            params.oldCols.forEach(col => oldColsMap[col.id] = col);
            const allColsUnchanged = params.newCols.every(col => {
                const equivalentCol = oldColsMap[col.id];
                if (equivalentCol) {
                    delete oldColsMap[col.id];
                }
                return equivalentCol && equivalentCol.field === col.field && equivalentCol.aggFunc === col.aggFunc;
            });
            const missingCols = !params.allowRemovedColumns && !!Object.values(oldColsMap).length;
            return allColsUnchanged && !missingCols;
        };
        const sortModelDifferent = !_.jsonEquals(this.storeParams.sortModel, this.sortListener.extractSortModel());
        const rowGroupDifferent = !areColsSame({
            oldCols: this.storeParams.rowGroupCols,
            newCols: rowGroupColumnVos,
        });
        const pivotDifferent = !areColsSame({
            oldCols: this.storeParams.pivotCols,
            newCols: pivotColumnVos,
        });
        const valuesDifferent = !!(rowGroupColumnVos === null || rowGroupColumnVos === void 0 ? void 0 : rowGroupColumnVos.length) && !areColsSame({
            oldCols: this.storeParams.valueCols,
            newCols: valueColumnVos,
            allowRemovedColumns: true,
        });
        const resetRequired = sortModelDifferent || rowGroupDifferent || pivotDifferent || valuesDifferent;
        if (resetRequired) {
            this.resetRootStore();
        }
        else {
            // cols may have changed even if we didn't do a reset. storeParams ref will be provided when getRows
            // is called, so it's important to keep it up to date.
            const newParams = this.createStoreParams();
            this.storeParams.rowGroupCols = newParams.rowGroupCols;
            this.storeParams.pivotCols = newParams.pivotCols;
            this.storeParams.valueCols = newParams.valueCols;
        }
    }
    destroyRootStore() {
        if (!this.rootNode || !this.rootNode.childStore) {
            return;
        }
        this.rootNode.childStore = this.destroyBean(this.rootNode.childStore);
        this.nodeManager.clear();
    }
    refreshAfterSort(newSortModel, params) {
        if (this.storeParams) {
            this.storeParams.sortModel = newSortModel;
        }
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.refreshAfterSort(params);
        this.onStoreUpdated();
    }
    resetRootStore() {
        this.destroyRootStore();
        this.rootNode = new RowNode(this.beans);
        this.rootNode.group = true;
        this.rootNode.level = -1;
        if (this.datasource) {
            this.storeParams = this.createStoreParams();
            this.rootNode.childStore = this.createBean(this.storeFactory.createStore(this.storeParams, this.rootNode));
            this.updateRowIndexesAndBounds();
        }
        // this event shows/hides 'no rows' overlay
        const rowDataChangedEvent = {
            type: Events.EVENT_ROW_DATA_UPDATED
        };
        this.eventService.dispatchEvent(rowDataChangedEvent);
        // this gets the row to render rows (or remove the previously rendered rows, as it's blank to start).
        // important to NOT pass in an event with keepRenderedRows or animate, as we want the renderer
        // to treat the rows as new rows, as it's all new data
        this.dispatchModelUpdated(true);
    }
    columnsToValueObjects(columns) {
        return columns.map(col => ({
            id: col.getId(),
            aggFunc: col.getAggFunc(),
            displayName: this.columnModel.getDisplayNameForColumn(col, 'model'),
            field: col.getColDef().field
        }));
    }
    createStoreParams() {
        const rowGroupColumnVos = this.columnsToValueObjects(this.columnModel.getRowGroupColumns());
        const valueColumnVos = this.columnsToValueObjects(this.columnModel.getValueColumns());
        const pivotColumnVos = this.columnsToValueObjects(this.columnModel.getPivotColumns());
        const dynamicRowHeight = this.gridOptionsService.isGetRowHeightFunction();
        const params = {
            // the columns the user has grouped and aggregated by
            valueCols: valueColumnVos,
            rowGroupCols: rowGroupColumnVos,
            pivotCols: pivotColumnVos,
            pivotMode: this.columnModel.isPivotMode(),
            // sort and filter model
            filterModel: this.filterManager.getFilterModel(),
            sortModel: this.sortListener.extractSortModel(),
            datasource: this.datasource,
            lastAccessedSequence: new NumberSequence(),
            // blockSize: blockSize == null ? 100 : blockSize,
            dynamicRowHeight: dynamicRowHeight
        };
        return params;
    }
    getParams() {
        return this.storeParams;
    }
    dispatchModelUpdated(reset = false) {
        const modelUpdatedEvent = {
            type: Events.EVENT_MODEL_UPDATED,
            animate: !reset,
            keepRenderedRows: !reset,
            newPage: false,
            newData: false
        };
        this.eventService.dispatchEvent(modelUpdatedEvent);
    }
    onStoreUpdated() {
        // sometimes if doing a batch update, we do the batch first,
        // then call onStoreUpdated manually. eg expandAll() method.
        if (this.pauseStoreUpdateListening) {
            return;
        }
        this.updateRowIndexesAndBounds();
        this.dispatchModelUpdated();
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
    onRowHeightChanged() {
        this.updateRowIndexesAndBounds();
        this.dispatchModelUpdated();
    }
    updateRowIndexesAndBounds() {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.setDisplayIndexes(new NumberSequence(), { value: 0 });
    }
    retryLoads() {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.retryLoads();
        this.onStoreUpdated();
    }
    getRow(index) {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return undefined;
        }
        return rootStore.getRowUsingDisplayIndex(index);
    }
    expandAll(value) {
        // if we don't pause store updating, we are needlessly
        // recalculating row-indexes etc, and also getting rendering
        // engine to re-render (listens on ModelUpdated event)
        this.pauseStoreUpdateListening = true;
        this.forEachNode(node => {
            if (node.stub) {
                return;
            }
            if (node.hasChildren()) {
                node.setExpanded(value);
            }
        });
        this.pauseStoreUpdateListening = false;
        this.onStoreUpdated();
    }
    refreshAfterFilter(newFilterModel, params) {
        if (this.storeParams) {
            this.storeParams.filterModel = newFilterModel;
        }
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.refreshAfterFilter(params);
        this.onStoreUpdated();
    }
    getRootStore() {
        if (this.rootNode && this.rootNode.childStore) {
            return this.rootNode.childStore;
        }
    }
    getRowCount() {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return 0;
        }
        return rootStore.getDisplayIndexEnd();
    }
    getTopLevelRowCount() {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return 1;
        }
        return rootStore.getRowCount();
    }
    getTopLevelRowDisplayedIndex(topLevelIndex) {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return topLevelIndex;
        }
        return rootStore.getTopLevelRowDisplayedIndex(topLevelIndex);
    }
    getRowBounds(index) {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            const rowHeight = this.gridOptionsService.getRowHeightAsNumber();
            return {
                rowTop: 0,
                rowHeight: rowHeight
            };
        }
        return rootStore.getRowBounds(index);
    }
    getBlockStates() {
        const root = this.getRootStore();
        if (!root) {
            return undefined;
        }
        const states = {};
        root.forEachStoreDeep(store => {
            if (store instanceof FullStore) {
                const { id, state } = store.getBlockStateJson();
                states[id] = state;
            }
            else if (store instanceof LazyStore) {
                Object.entries(store.getBlockStates()).forEach(([block, state]) => {
                    states[block] = state;
                });
            }
            else {
                throw new Error('AG Grid: Unsupported store type');
            }
        });
        return states;
    }
    getRowIndexAtPixel(pixel) {
        const rootStore = this.getRootStore();
        if (pixel <= 0 || !rootStore) {
            return 0;
        }
        return rootStore.getRowIndexAtPixel(pixel);
    }
    isEmpty() {
        return false;
    }
    isRowsToRender() {
        return this.getRootStore() != null && this.getRowCount() > 0;
    }
    getType() {
        return 'serverSide';
    }
    forEachNode(callback) {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.forEachNodeDeep(callback);
    }
    forEachNodeAfterFilterAndSort(callback) {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.forEachNodeDeepAfterFilterAndSort(callback);
    }
    executeOnStore(route, callback) {
        const rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        const storeToExecuteOn = rootStore.getChildStore(route);
        if (storeToExecuteOn) {
            callback(storeToExecuteOn);
        }
    }
    refreshStore(params = {}) {
        const route = params.route ? params.route : [];
        this.executeOnStore(route, store => store.refreshStore(params.purge == true));
    }
    getStoreState() {
        const res = [];
        const rootStore = this.getRootStore();
        if (rootStore) {
            rootStore.addStoreStates(res);
        }
        return res;
    }
    getNodesInRangeForSelection(firstInRange, lastInRange) {
        if (!_.exists(firstInRange)) {
            return [];
        }
        if (!lastInRange) {
            return [firstInRange];
        }
        const startIndex = firstInRange.rowIndex;
        const endIndex = lastInRange.rowIndex;
        if (startIndex === null || endIndex === null) {
            return [firstInRange];
        }
        const nodeRange = [];
        const [firstIndex, lastIndex] = [startIndex, endIndex].sort((a, b) => a - b);
        this.forEachNode((node) => {
            const thisRowIndex = node.rowIndex;
            if (thisRowIndex == null || node.stub) {
                return;
            }
            if (thisRowIndex >= firstIndex && thisRowIndex <= lastIndex) {
                nodeRange.push(node);
            }
        });
        const rowsAreContiguous = nodeRange.every((node, idx, all) => {
            if (idx === 0) {
                return node.rowIndex === firstIndex;
            }
            return all[idx - 1].rowIndex === (node.rowIndex - 1);
        });
        // don't allow range selection if we don't have the full range of rows
        if (!rowsAreContiguous || nodeRange.length !== (lastIndex - firstIndex + 1)) {
            return [firstInRange];
        }
        return nodeRange;
    }
    getRowNode(id) {
        let result;
        this.forEachNode(rowNode => {
            if (rowNode.id === id) {
                result = rowNode;
            }
            if (rowNode.detailNode && rowNode.detailNode.id === id) {
                result = rowNode.detailNode;
            }
        });
        return result;
    }
    isRowPresent(rowNode) {
        const foundRowNode = this.getRowNode(rowNode.id);
        return !!foundRowNode;
    }
    setRowCount(rowCount, lastRowIndexKnown) {
        const rootStore = this.getRootStore();
        if (rootStore) {
            if (rootStore instanceof LazyStore) {
                rootStore.setRowCount(rowCount, lastRowIndexKnown);
                return;
            }
            console.error('AG Grid: Infinite scrolling must be enabled in order to set the row count.');
        }
    }
};
__decorate$c([
    Autowired('columnModel')
], ServerSideRowModel.prototype, "columnModel", void 0);
__decorate$c([
    Autowired('filterManager')
], ServerSideRowModel.prototype, "filterManager", void 0);
__decorate$c([
    Autowired('rowRenderer')
], ServerSideRowModel.prototype, "rowRenderer", void 0);
__decorate$c([
    Autowired('ssrmSortService')
], ServerSideRowModel.prototype, "sortListener", void 0);
__decorate$c([
    Autowired('ssrmNodeManager')
], ServerSideRowModel.prototype, "nodeManager", void 0);
__decorate$c([
    Autowired('ssrmStoreFactory')
], ServerSideRowModel.prototype, "storeFactory", void 0);
__decorate$c([
    Autowired('beans')
], ServerSideRowModel.prototype, "beans", void 0);
__decorate$c([
    PreDestroy
], ServerSideRowModel.prototype, "destroyDatasource", null);
__decorate$c([
    PostConstruct
], ServerSideRowModel.prototype, "addEventListeners", null);
__decorate$c([
    PreDestroy
], ServerSideRowModel.prototype, "destroyRootStore", null);
ServerSideRowModel = __decorate$c([
    Bean('rowModel')
], ServerSideRowModel);

var __decorate$b = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let StoreUtils = class StoreUtils extends BeanStub {
    loadFromDatasource(p) {
        const { storeParams, parentBlock, parentNode } = p;
        const groupKeys = parentNode.getGroupKeys();
        if (!storeParams.datasource) {
            return;
        }
        const request = {
            startRow: p.startRow,
            endRow: p.endRow,
            rowGroupCols: storeParams.rowGroupCols,
            valueCols: storeParams.valueCols,
            pivotCols: storeParams.pivotCols,
            pivotMode: storeParams.pivotMode,
            groupKeys: groupKeys,
            filterModel: storeParams.filterModel,
            sortModel: storeParams.sortModel
        };
        const getRowsParams = {
            successCallback: p.successCallback,
            success: p.success,
            failCallback: p.failCallback,
            fail: p.fail,
            request: request,
            parentNode: p.parentNode,
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.context
        };
        window.setTimeout(() => {
            if (!storeParams.datasource || !parentBlock.isAlive()) {
                // failCallback() is important, to reduce the 'RowNodeBlockLoader.activeBlockLoadsCount' count
                p.failCallback();
                return;
            }
            storeParams.datasource.getRows(getRowsParams);
        }, 0);
    }
    getChildStore(keys, currentCache, findNodeFunc) {
        if (_.missingOrEmpty(keys)) {
            return currentCache;
        }
        const nextKey = keys[0];
        const nextNode = findNodeFunc(nextKey);
        if (nextNode) {
            const keyListForNextLevel = keys.slice(1, keys.length);
            const nextStore = nextNode.childStore;
            return nextStore ? nextStore.getChildStore(keyListForNextLevel) : null;
        }
        return null;
    }
    isServerRefreshNeeded(parentRowNode, rowGroupCols, params) {
        if (params.valueColChanged || params.secondaryColChanged) {
            return true;
        }
        const level = parentRowNode.level + 1;
        const grouping = level < rowGroupCols.length;
        const leafNodes = !grouping;
        if (leafNodes) {
            return true;
        }
        const colIdThisGroup = rowGroupCols[level].id;
        const actionOnThisGroup = params.changedColumns.indexOf(colIdThisGroup) > -1;
        if (actionOnThisGroup) {
            return true;
        }
        const allCols = this.columnModel.getAllGridColumns();
        const affectedGroupCols = allCols
            // find all impacted cols which also a group display column
            .filter(col => col.getColDef().showRowGroup && params.changedColumns.includes(col.getId()))
            .map(col => col.getColDef().showRowGroup)
            // if displaying all groups, or displaying the effected col for this group, refresh
            .some(group => group === true || group === colIdThisGroup);
        return affectedGroupCols;
    }
    getServerSideInitialRowCount() {
        const rowCount = this.gridOptionsService.getNum('serverSideInitialRowCount');
        if (typeof rowCount === 'number' && rowCount > 0) {
            return rowCount;
        }
        return 1;
    }
    assertRowModelIsServerSide(key) {
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            _.doOnce(() => console.warn(`AG Grid: The '${key}' property can only be used with the Server Side Row Model.`), key);
            return false;
        }
        return true;
    }
    assertNotTreeData(key) {
        if (this.gridOptionsService.is('treeData')) {
            _.doOnce(() => console.warn(`AG Grid: The '${key}' property cannot be used while using tree data.`), key + '_TreeData');
            return false;
        }
        return true;
    }
    isServerSideSortAllLevels() {
        return this.gridOptionsService.is('serverSideSortAllLevels') && this.assertRowModelIsServerSide('serverSideSortAllLevels');
    }
    isServerSideOnlyRefreshFilteredGroups() {
        return this.gridOptionsService.is('serverSideOnlyRefreshFilteredGroups') && this.assertRowModelIsServerSide('serverSideOnlyRefreshFilteredGroups');
    }
    isServerSideSortOnServer() {
        return this.gridOptionsService.is('serverSideSortOnServer') && this.assertRowModelIsServerSide('serverSideSortOnServer') && this.assertNotTreeData('serverSideSortOnServer');
    }
    isServerSideFilterOnServer() {
        return this.gridOptionsService.is('serverSideFilterOnServer') && this.assertRowModelIsServerSide('serverSideFilterOnServer') && this.assertNotTreeData('serverSideFilterOnServer');
    }
};
__decorate$b([
    Autowired('columnApi')
], StoreUtils.prototype, "columnApi", void 0);
__decorate$b([
    Autowired('columnModel')
], StoreUtils.prototype, "columnModel", void 0);
__decorate$b([
    Autowired('gridApi')
], StoreUtils.prototype, "gridApi", void 0);
StoreUtils = __decorate$b([
    Bean('ssrmStoreUtils')
], StoreUtils);

var __decorate$a = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const GROUP_MISSING_KEY_ID = 'ag-Grid-MissingKey';
let BlockUtils = class BlockUtils extends BeanStub {
    postConstruct() {
        this.rowHeight = this.gridOptionsService.getRowHeightAsNumber();
        this.usingTreeData = this.gridOptionsService.isTreeData();
        this.usingMasterDetail = this.gridOptionsService.isMasterDetail();
    }
    createRowNode(params) {
        const rowNode = new RowNode(this.beans);
        const rowHeight = params.rowHeight != null ? params.rowHeight : this.rowHeight;
        rowNode.setRowHeight(rowHeight);
        rowNode.group = params.group;
        rowNode.leafGroup = params.leafGroup;
        rowNode.level = params.level;
        rowNode.uiLevel = params.level;
        rowNode.parent = params.parent;
        // stub gets set to true here, and then false when this rowNode gets it's data
        rowNode.stub = true;
        rowNode.__needsRefreshWhenVisible = false;
        if (rowNode.group) {
            rowNode.expanded = false;
            rowNode.field = params.field;
            rowNode.rowGroupColumn = params.rowGroupColumn;
        }
        return rowNode;
    }
    destroyRowNodes(rowNodes) {
        if (rowNodes) {
            rowNodes.forEach((row) => this.destroyRowNode(row));
        }
    }
    destroyRowNode(rowNode, preserveStore = false) {
        if (rowNode.childStore && !preserveStore) {
            this.destroyBean(rowNode.childStore);
            rowNode.childStore = null;
        }
        if (rowNode.sibling) {
            this.destroyRowNode(rowNode.sibling, false);
        }
        // this is needed, so row render knows to fade out the row, otherwise it
        // sees row top is present, and thinks the row should be shown. maybe
        // rowNode should have a flag on whether it is visible???
        rowNode.clearRowTopAndRowIndex();
        if (rowNode.id != null) {
            this.nodeManager.removeNode(rowNode);
        }
    }
    setTreeGroupInfo(rowNode) {
        rowNode.updateHasChildren();
        const getKeyFunc = this.gridOptionsService.get('getServerSideGroupKey');
        if (rowNode.hasChildren() && getKeyFunc != null) {
            rowNode.key = getKeyFunc(rowNode.data);
        }
        if (!rowNode.hasChildren() && rowNode.childStore != null) {
            this.destroyBean(rowNode.childStore);
            rowNode.childStore = null;
            rowNode.expanded = false;
        }
    }
    setRowGroupInfo(rowNode) {
        rowNode.key = this.valueService.getValue(rowNode.rowGroupColumn, rowNode);
        if (rowNode.key === null || rowNode.key === undefined) {
            _.doOnce(() => {
                console.warn(`AG Grid: null and undefined values are not allowed for server side row model keys`);
                if (rowNode.rowGroupColumn) {
                    console.warn(`column = ${rowNode.rowGroupColumn.getId()}`);
                }
                console.warn(`data is `, rowNode.data);
            }, 'ServerSideBlock-CannotHaveNullOrUndefinedForKey');
        }
        if (this.beans.gridOptionsService.is('groupIncludeFooter')) {
            rowNode.createFooter();
            if (rowNode.sibling) {
                rowNode.sibling.uiLevel = rowNode.uiLevel + 1;
            }
        }
    }
    setMasterDetailInfo(rowNode) {
        const isMasterFunc = this.gridOptionsService.get('isRowMaster');
        if (isMasterFunc != null) {
            rowNode.master = isMasterFunc(rowNode.data);
        }
        else {
            rowNode.master = true;
        }
    }
    updateDataIntoRowNode(rowNode, data) {
        rowNode.updateData(data);
        if (this.usingTreeData) {
            this.setTreeGroupInfo(rowNode);
            this.setChildCountIntoRowNode(rowNode);
        }
        else if (rowNode.group) {
            this.setChildCountIntoRowNode(rowNode);
            // it's not possible for a node to change whether it's a group or not
            // when doing row grouping (as only rows at certain levels are groups),
            // so nothing to do here
        }
        else if (this.usingMasterDetail) ;
    }
    setDataIntoRowNode(rowNode, data, defaultId, cachedRowHeight) {
        var _a;
        rowNode.stub = false;
        if (_.exists(data)) {
            rowNode.setDataAndId(data, defaultId);
            if (this.usingTreeData) {
                this.setTreeGroupInfo(rowNode);
            }
            else if (rowNode.group) {
                this.setRowGroupInfo(rowNode);
            }
            else if (this.usingMasterDetail) {
                this.setMasterDetailInfo(rowNode);
            }
        }
        else {
            rowNode.setDataAndId(undefined, undefined);
            rowNode.key = null;
        }
        if (this.usingTreeData || rowNode.group) {
            this.setGroupDataIntoRowNode(rowNode);
            this.setChildCountIntoRowNode(rowNode);
        }
        // this needs to be done AFTER setGroupDataIntoRowNode(), as the height can depend on the group data
        // getting set, if it's a group node and colDef.autoHeight=true
        if (_.exists(data)) {
            rowNode.setRowHeight(this.gridOptionsService.getRowHeightForNode(rowNode, false, cachedRowHeight).height);
            (_a = rowNode.sibling) === null || _a === void 0 ? void 0 : _a.setRowHeight(this.gridOptionsService.getRowHeightForNode(rowNode.sibling, false, cachedRowHeight).height);
        }
    }
    setChildCountIntoRowNode(rowNode) {
        const getChildCount = this.gridOptionsService.get('getChildCount');
        if (getChildCount) {
            rowNode.setAllChildrenCount(getChildCount(rowNode.data));
        }
    }
    setGroupDataIntoRowNode(rowNode) {
        const groupDisplayCols = this.columnModel.getGroupDisplayColumns();
        const usingTreeData = this.gridOptionsService.isTreeData();
        groupDisplayCols.forEach(col => {
            if (rowNode.groupData == null) {
                rowNode.groupData = {};
            }
            if (usingTreeData) {
                rowNode.groupData[col.getColId()] = rowNode.key;
            }
            else if (col.isRowGroupDisplayed(rowNode.rowGroupColumn.getId())) {
                const groupValue = this.valueService.getValue(rowNode.rowGroupColumn, rowNode);
                rowNode.groupData[col.getColId()] = groupValue;
            }
        });
    }
    clearDisplayIndex(rowNode) {
        rowNode.clearRowTopAndRowIndex();
        const hasChildStore = rowNode.hasChildren() && _.exists(rowNode.childStore);
        if (hasChildStore) {
            const childStore = rowNode.childStore;
            childStore.clearDisplayIndexes();
        }
        const hasDetailNode = rowNode.master && rowNode.detailNode;
        if (hasDetailNode) {
            rowNode.detailNode.clearRowTopAndRowIndex();
        }
    }
    setDisplayIndex(rowNode, displayIndexSeq, nextRowTop) {
        // set this row
        rowNode.setRowIndex(displayIndexSeq.next());
        rowNode.setRowTop(nextRowTop.value);
        nextRowTop.value += rowNode.rowHeight;
        // set child for master / detail
        const hasDetailRow = rowNode.master;
        if (hasDetailRow) {
            if (rowNode.expanded && rowNode.detailNode) {
                rowNode.detailNode.setRowIndex(displayIndexSeq.next());
                rowNode.detailNode.setRowTop(nextRowTop.value);
                nextRowTop.value += rowNode.detailNode.rowHeight;
            }
            else if (rowNode.detailNode) {
                rowNode.detailNode.clearRowTopAndRowIndex();
            }
        }
        // set children for SSRM child rows
        const hasChildStore = rowNode.hasChildren() && _.exists(rowNode.childStore);
        if (hasChildStore) {
            const childStore = rowNode.childStore;
            if (rowNode.expanded) {
                childStore.setDisplayIndexes(displayIndexSeq, nextRowTop);
            }
            else {
                // we need to clear the row tops, as the row renderer depends on
                // this to know if the row should be faded out
                childStore.clearDisplayIndexes();
            }
        }
    }
    binarySearchForDisplayIndex(displayRowIndex, rowNodes) {
        let bottomPointer = 0;
        let topPointer = rowNodes.length - 1;
        if (_.missing(topPointer) || _.missing(bottomPointer)) {
            console.warn(`AG Grid: error: topPointer = ${topPointer}, bottomPointer = ${bottomPointer}`);
            return undefined;
        }
        while (true) {
            const midPointer = Math.floor((bottomPointer + topPointer) / 2);
            const currentRowNode = rowNodes[midPointer];
            // first check current row for index
            if (currentRowNode.rowIndex === displayRowIndex) {
                return currentRowNode;
            }
            // then check if current row contains a detail row with the index
            const expandedMasterRow = currentRowNode.master && currentRowNode.expanded;
            const detailNode = currentRowNode.detailNode;
            if (expandedMasterRow && detailNode && detailNode.rowIndex === displayRowIndex) {
                return currentRowNode.detailNode;
            }
            // then check if child cache contains index
            const childStore = currentRowNode.childStore;
            if (currentRowNode.expanded && childStore && childStore.isDisplayIndexInStore(displayRowIndex)) {
                return childStore.getRowUsingDisplayIndex(displayRowIndex);
            }
            // otherwise adjust pointers to continue searching for index
            if (currentRowNode.rowIndex < displayRowIndex) {
                bottomPointer = midPointer + 1;
            }
            else if (currentRowNode.rowIndex > displayRowIndex) {
                topPointer = midPointer - 1;
            }
            else {
                console.warn(`AG Grid: error: unable to locate rowIndex = ${displayRowIndex} in cache`);
                return undefined;
            }
        }
    }
    extractRowBounds(rowNode, index) {
        const extractRowBounds = (currentRowNode) => ({
            rowHeight: currentRowNode.rowHeight,
            rowTop: currentRowNode.rowTop
        });
        if (rowNode.rowIndex === index) {
            return extractRowBounds(rowNode);
        }
        if (rowNode.hasChildren() && rowNode.expanded && _.exists(rowNode.childStore)) {
            const childStore = rowNode.childStore;
            if (childStore.isDisplayIndexInStore(index)) {
                return childStore.getRowBounds(index);
            }
        }
        else if (rowNode.master && rowNode.expanded && _.exists(rowNode.detailNode)) {
            if (rowNode.detailNode.rowIndex === index) {
                return extractRowBounds(rowNode.detailNode);
            }
        }
    }
    getIndexAtPixel(rowNode, pixel) {
        // first check if pixel is in range of current row
        if (rowNode.isPixelInRange(pixel)) {
            return rowNode.rowIndex;
        }
        // then check if current row contains a detail row with pixel in range
        const expandedMasterRow = rowNode.master && rowNode.expanded;
        const detailNode = rowNode.detailNode;
        if (expandedMasterRow && detailNode && detailNode.isPixelInRange(pixel)) {
            return rowNode.detailNode.rowIndex;
        }
        // then check if it's a group row with a child cache with pixel in range
        if (rowNode.hasChildren() && rowNode.expanded && _.exists(rowNode.childStore)) {
            const childStore = rowNode.childStore;
            if (childStore.isPixelInRange(pixel)) {
                return childStore.getRowIndexAtPixel(pixel);
            }
        }
        return null;
        // pixel is not within this row node or it's children / detail, so return undefined
    }
    createNodeIdPrefix(parentRowNode) {
        const parts = [];
        let rowNode = parentRowNode;
        // pull keys from all parent nodes, but do not include the root node
        while (rowNode && rowNode.level >= 0) {
            if (rowNode.key === '') {
                parts.push(GROUP_MISSING_KEY_ID);
            }
            else {
                parts.push(rowNode.key);
            }
            rowNode = rowNode.parent;
        }
        if (parts.length > 0) {
            return parts.reverse().join('-');
        }
        // no prefix, so node id's are left as they are
        return undefined;
    }
    checkOpenByDefault(rowNode) {
        if (!rowNode.isExpandable()) {
            return;
        }
        const userFunc = this.gridOptionsService.getCallback('isServerSideGroupOpenByDefault');
        if (!userFunc) {
            return;
        }
        const params = {
            data: rowNode.data,
            rowNode
        };
        const userFuncRes = userFunc(params);
        if (userFuncRes) {
            // we do this in a timeout, so that we don't expand a row node while in the middle
            // of setting up rows, setting up rows is complex enough without another chunk of work
            // getting added to the call stack. this is also helpful as openByDefault may or may
            // not happen (so makes setting up rows more deterministic by expands never happening)
            // and also checkOpenByDefault is shard with both store types, so easier control how it
            // impacts things by keeping it in new VM turn.
            window.setTimeout(() => rowNode.setExpanded(true), 0);
        }
    }
};
__decorate$a([
    Autowired('valueService')
], BlockUtils.prototype, "valueService", void 0);
__decorate$a([
    Autowired('columnModel')
], BlockUtils.prototype, "columnModel", void 0);
__decorate$a([
    Autowired('ssrmNodeManager')
], BlockUtils.prototype, "nodeManager", void 0);
__decorate$a([
    Autowired('beans')
], BlockUtils.prototype, "beans", void 0);
__decorate$a([
    PostConstruct
], BlockUtils.prototype, "postConstruct", null);
BlockUtils = __decorate$a([
    Bean('ssrmBlockUtils')
], BlockUtils);

var __decorate$9 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let NodeManager = class NodeManager {
    constructor() {
        this.rowNodes = {};
    }
    addRowNode(rowNode) {
        const id = rowNode.id;
        if (this.rowNodes[id]) {
            console.warn(`AG Grid: Duplicate node id ${rowNode.id}. Row ID's are provided via the getRowId() callback. Please modify the getRowId() callback code to provide unique row id values.`);
            console.warn('first instance', this.rowNodes[id].data);
            console.warn('second instance', rowNode.data);
        }
        this.rowNodes[id] = rowNode;
    }
    removeNode(rowNode) {
        const id = rowNode.id;
        if (this.rowNodes[id]) {
            this.rowNodes[id] = undefined;
        }
    }
    clear() {
        this.rowNodes = {};
    }
};
__decorate$9([
    PreDestroy
], NodeManager.prototype, "clear", null);
NodeManager = __decorate$9([
    Bean('ssrmNodeManager')
], NodeManager);

var __decorate$8 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let TransactionManager = class TransactionManager extends BeanStub {
    constructor() {
        super(...arguments);
        this.asyncTransactions = [];
    }
    postConstruct() {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
    }
    applyTransactionAsync(transaction, callback) {
        if (this.asyncTransactionsTimeout == null) {
            this.scheduleExecuteAsync();
        }
        this.asyncTransactions.push({ transaction: transaction, callback: callback });
    }
    scheduleExecuteAsync() {
        const waitMillis = this.gridOptionsService.getAsyncTransactionWaitMillis();
        this.asyncTransactionsTimeout = window.setTimeout(() => {
            this.executeAsyncTransactions();
        }, waitMillis);
    }
    executeAsyncTransactions() {
        if (!this.asyncTransactions) {
            return;
        }
        const resultFuncs = [];
        const resultsForEvent = [];
        const transactionsToRetry = [];
        let atLeastOneTransactionApplied = false;
        this.asyncTransactions.forEach(txWrapper => {
            let result;
            this.serverSideRowModel.executeOnStore(txWrapper.transaction.route, cache => {
                result = cache.applyTransaction(txWrapper.transaction);
            });
            if (result == undefined) {
                result = { status: ServerSideTransactionResultStatus.StoreNotFound };
            }
            resultsForEvent.push(result);
            const retryTransaction = result.status == ServerSideTransactionResultStatus.StoreLoading;
            if (retryTransaction) {
                transactionsToRetry.push(txWrapper);
                return;
            }
            if (txWrapper.callback) {
                resultFuncs.push(() => txWrapper.callback(result));
            }
            if (result.status === ServerSideTransactionResultStatus.Applied) {
                atLeastOneTransactionApplied = true;
            }
        });
        // do callbacks in next VM turn so it's async
        if (resultFuncs.length > 0) {
            window.setTimeout(() => {
                resultFuncs.forEach(func => func());
            }, 0);
        }
        this.asyncTransactionsTimeout = undefined;
        // this will be empty list if nothing to retry
        this.asyncTransactions = transactionsToRetry;
        if (atLeastOneTransactionApplied) {
            this.valueCache.onDataChanged();
            this.eventService.dispatchEvent({ type: Events.EVENT_STORE_UPDATED });
        }
        if (resultsForEvent.length > 0) {
            const event = {
                type: Events.EVENT_ASYNC_TRANSACTIONS_FLUSHED,
                results: resultsForEvent
            };
            this.eventService.dispatchEvent(event);
        }
    }
    flushAsyncTransactions() {
        // the timeout could be missing, if we are flushing due to row data loaded
        if (this.asyncTransactionsTimeout != null) {
            clearTimeout(this.asyncTransactionsTimeout);
        }
        this.executeAsyncTransactions();
    }
    applyTransaction(transaction) {
        let res;
        this.serverSideRowModel.executeOnStore(transaction.route, store => {
            res = store.applyTransaction(transaction);
        });
        if (res) {
            this.valueCache.onDataChanged();
            if (res.remove) {
                const removedRowIds = res.remove.map(row => row.id);
                this.selectionService.deleteSelectionStateFromParent(transaction.route || [], removedRowIds);
            }
            this.eventService.dispatchEvent({ type: Events.EVENT_STORE_UPDATED });
            return res;
        }
        else {
            return { status: ServerSideTransactionResultStatus.StoreNotFound };
        }
    }
};
__decorate$8([
    Autowired('rowNodeBlockLoader')
], TransactionManager.prototype, "rowNodeBlockLoader", void 0);
__decorate$8([
    Autowired('valueCache')
], TransactionManager.prototype, "valueCache", void 0);
__decorate$8([
    Autowired('rowModel')
], TransactionManager.prototype, "serverSideRowModel", void 0);
__decorate$8([
    Autowired('rowRenderer')
], TransactionManager.prototype, "rowRenderer", void 0);
__decorate$8([
    Autowired('selectionService')
], TransactionManager.prototype, "selectionService", void 0);
__decorate$8([
    PostConstruct
], TransactionManager.prototype, "postConstruct", null);
TransactionManager = __decorate$8([
    Bean('ssrmTransactionManager')
], TransactionManager);

var __decorate$7 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let ExpandListener = class ExpandListener extends BeanStub {
    postConstruct() {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
        this.addManagedListener(this.eventService, Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
    }
    onRowGroupOpened(event) {
        const rowNode = event.node;
        if (rowNode.expanded) {
            if (rowNode.master) {
                this.createDetailNode(rowNode);
            }
            else if (_.missing(rowNode.childStore)) {
                const storeParams = this.serverSideRowModel.getParams();
                rowNode.childStore = this.createBean(this.storeFactory.createStore(storeParams, rowNode));
            }
        }
        else if (this.gridOptionsService.is('purgeClosedRowNodes') && _.exists(rowNode.childStore)) {
            rowNode.childStore = this.destroyBean(rowNode.childStore);
        }
        const storeUpdatedEvent = { type: Events.EVENT_STORE_UPDATED };
        this.eventService.dispatchEvent(storeUpdatedEvent);
    }
    createDetailNode(masterNode) {
        if (_.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        }
        const detailNode = new RowNode(this.beans);
        detailNode.detail = true;
        detailNode.selectable = false;
        detailNode.parent = masterNode;
        if (_.exists(masterNode.id)) {
            detailNode.id = 'detail_' + masterNode.id;
        }
        detailNode.data = masterNode.data;
        detailNode.level = masterNode.level + 1;
        const defaultDetailRowHeight = 200;
        const rowHeight = this.gridOptionsService.getRowHeightForNode(detailNode).height;
        detailNode.rowHeight = rowHeight ? rowHeight : defaultDetailRowHeight;
        masterNode.detailNode = detailNode;
        return detailNode;
    }
};
__decorate$7([
    Autowired('rowModel')
], ExpandListener.prototype, "serverSideRowModel", void 0);
__decorate$7([
    Autowired('ssrmStoreFactory')
], ExpandListener.prototype, "storeFactory", void 0);
__decorate$7([
    Autowired('beans')
], ExpandListener.prototype, "beans", void 0);
__decorate$7([
    PostConstruct
], ExpandListener.prototype, "postConstruct", null);
ExpandListener = __decorate$7([
    Bean('ssrmExpandListener')
], ExpandListener);

var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let SortListener = class SortListener extends BeanStub {
    postConstruct() {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
    }
    extractSortModel() {
        const sortModel = this.sortController.getSortModel();
        // when using tree data we just return the sort model with the 'ag-Grid-AutoColumn' as is, i.e not broken out
        // into it's constitute group columns as they are not defined up front and can vary per node.
        if (this.gridOptionsService.isTreeData()) {
            return sortModel;
        }
        // it autoCol is active, we don't want to send this to the server. instead we want to
        // send the
        this.replaceAutoGroupColumnWithActualRowGroupColumns(sortModel);
        this.removeMultiColumnPrefixOnColumnIds(sortModel);
        return sortModel;
    }
    removeMultiColumnPrefixOnColumnIds(sortModel) {
        if (this.gridOptionsService.isGroupMultiAutoColumn()) {
            const multiColumnPrefix = GROUP_AUTO_COLUMN_ID + "-";
            for (let i = 0; i < sortModel.length; ++i) {
                if (sortModel[i].colId.indexOf(multiColumnPrefix) > -1) {
                    sortModel[i].colId = sortModel[i].colId.substr(multiColumnPrefix.length);
                }
            }
        }
    }
    replaceAutoGroupColumnWithActualRowGroupColumns(sortModel) {
        // find index of auto group column in sort model
        const autoGroupSortModel = sortModel.find(sm => sm.colId == GROUP_AUTO_COLUMN_ID);
        // replace auto column with individual group columns
        if (autoGroupSortModel) {
            // remove auto group column
            const autoGroupIndex = sortModel.indexOf(autoGroupSortModel);
            _.removeFromArray(sortModel, autoGroupSortModel);
            const isNotInSortModel = (col) => sortModel.filter(sm => sm.colId === col.getColId()).length == 0;
            const mapColumnToSortModel = (col) => ({ colId: col.getId(), sort: autoGroupSortModel.sort });
            const newModels = this.columnModel.getRowGroupColumns()
                .filter(isNotInSortModel)
                .map(mapColumnToSortModel);
            _.insertArrayIntoArray(sortModel, newModels, autoGroupIndex);
        }
    }
    onSortChanged() {
        const storeParams = this.serverSideRowModel.getParams();
        if (!storeParams) {
            return;
        } // params is undefined if no datasource set
        const newSortModel = this.extractSortModel();
        const oldSortModel = storeParams.sortModel;
        const changedColumns = this.findChangedColumnsInSort(newSortModel, oldSortModel);
        const valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
        const secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);
        const params = {
            valueColChanged,
            secondaryColChanged,
            changedColumns
        };
        this.serverSideRowModel.refreshAfterSort(newSortModel, params);
    }
    // returns back all the cols that were effected by the sorting. eg if we were sorting by col A,
    // and now we are sorting by col B, the list of impacted cols should be A and B. so if a cache
    // is impacted by sorting on A or B then it needs to be refreshed. this includes where the cache
    // was previously sorted by A and then the A sort now needs to be cleared.
    findChangedColumnsInSort(newSortModel, oldSortModel) {
        let allColsInBothSorts = [];
        [newSortModel, oldSortModel].forEach(sortModel => {
            if (sortModel) {
                const ids = sortModel.map(sm => sm.colId);
                allColsInBothSorts = allColsInBothSorts.concat(ids);
            }
        });
        const differentSorts = (oldSortItem, newSortItem) => {
            const oldSort = oldSortItem ? oldSortItem.sort : null;
            const newSort = newSortItem ? newSortItem.sort : null;
            return oldSort !== newSort;
        };
        const differentIndexes = (oldSortItem, newSortItem) => {
            const oldIndex = oldSortItem ? oldSortModel.indexOf(oldSortItem) : -1;
            const newIndex = newSortItem ? newSortModel.indexOf(newSortItem) : -1;
            return oldIndex !== newIndex;
        };
        return allColsInBothSorts.filter(colId => {
            const oldSortItem = oldSortModel.find(sm => sm.colId === colId);
            const newSortItem = newSortModel.find(sm => sm.colId === colId);
            return differentSorts(oldSortItem, newSortItem) || differentIndexes(oldSortItem, newSortItem);
        });
    }
};
__decorate$6([
    Autowired('sortController')
], SortListener.prototype, "sortController", void 0);
__decorate$6([
    Autowired('columnModel')
], SortListener.prototype, "columnModel", void 0);
__decorate$6([
    Autowired('rowModel')
], SortListener.prototype, "serverSideRowModel", void 0);
__decorate$6([
    Autowired('ssrmListenerUtils')
], SortListener.prototype, "listenerUtils", void 0);
__decorate$6([
    PostConstruct
], SortListener.prototype, "postConstruct", null);
SortListener = __decorate$6([
    Bean('ssrmSortService')
], SortListener);

var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let FilterListener = class FilterListener extends BeanStub {
    postConstruct() {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
    }
    onFilterChanged() {
        const storeParams = this.serverSideRowModel.getParams();
        if (!storeParams) {
            return;
        } // params is undefined if no datasource set
        const newModel = this.filterManager.getFilterModel();
        const oldModel = storeParams ? storeParams.filterModel : {};
        const changedColumns = this.findChangedColumns(newModel, oldModel);
        const valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
        const secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);
        const params = {
            valueColChanged,
            secondaryColChanged,
            changedColumns
        };
        this.serverSideRowModel.refreshAfterFilter(newModel, params);
    }
    findChangedColumns(oldModel, newModel) {
        const allColKeysMap = {};
        Object.keys(oldModel).forEach(key => allColKeysMap[key] = true);
        Object.keys(newModel).forEach(key => allColKeysMap[key] = true);
        const res = [];
        Object.keys(allColKeysMap).forEach(key => {
            const oldJson = JSON.stringify(oldModel[key]);
            const newJson = JSON.stringify(newModel[key]);
            const filterChanged = oldJson != newJson;
            if (filterChanged) {
                res.push(key);
            }
        });
        return res;
    }
};
__decorate$5([
    Autowired('rowModel')
], FilterListener.prototype, "serverSideRowModel", void 0);
__decorate$5([
    Autowired('filterManager')
], FilterListener.prototype, "filterManager", void 0);
__decorate$5([
    Autowired('ssrmListenerUtils')
], FilterListener.prototype, "listenerUtils", void 0);
__decorate$5([
    PostConstruct
], FilterListener.prototype, "postConstruct", null);
FilterListener = __decorate$5([
    Bean('ssrmFilterListener')
], FilterListener);

var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let StoreFactory = class StoreFactory {
    createStore(ssrmParams, parentNode) {
        const storeParams = this.getStoreParams(ssrmParams, parentNode);
        const CacheClass = storeParams.suppressInfiniteScroll ? FullStore : LazyStore;
        return new CacheClass(ssrmParams, storeParams, parentNode);
    }
    getStoreParams(ssrmParams, parentNode) {
        const userStoreParams = this.getLevelSpecificParams(parentNode);
        // if user provided overrideParams, we take infiniteScroll from there if it exists
        const infiniteScroll = this.isInfiniteScroll(userStoreParams);
        const cacheBlockSize = this.getBlockSize(infiniteScroll, userStoreParams);
        const maxBlocksInCache = this.getMaxBlocksInCache(infiniteScroll, ssrmParams, userStoreParams);
        const storeParams = {
            suppressInfiniteScroll: !infiniteScroll,
            cacheBlockSize,
            maxBlocksInCache
        };
        return storeParams;
    }
    getMaxBlocksInCache(infiniteScroll, ssrmParams, userStoreParams) {
        if (!infiniteScroll) {
            return undefined;
        }
        const maxBlocksInCache = (userStoreParams && userStoreParams.maxBlocksInCache != null)
            ? userStoreParams.maxBlocksInCache
            : this.gridOptionsService.getNum('maxBlocksInCache');
        const maxBlocksActive = maxBlocksInCache != null && maxBlocksInCache >= 0;
        if (!maxBlocksActive) {
            return undefined;
        }
        if (ssrmParams.dynamicRowHeight) {
            const message = 'AG Grid: Server Side Row Model does not support Dynamic Row Height and Cache Purging. ' +
                'Either a) remove getRowHeight() callback or b) remove maxBlocksInCache property. Purging has been disabled.';
            _.doOnce(() => console.warn(message), 'storeFactory.maxBlocksInCache.dynamicRowHeight');
            return undefined;
        }
        if (this.columnModel.isAutoRowHeightActive()) {
            const message = 'AG Grid: Server Side Row Model does not support Auto Row Height and Cache Purging. ' +
                'Either a) remove colDef.autoHeight or b) remove maxBlocksInCache property. Purging has been disabled.';
            _.doOnce(() => console.warn(message), 'storeFactory.maxBlocksInCache.autoRowHeightActive');
            return undefined;
        }
        return maxBlocksInCache;
    }
    getBlockSize(infiniteScroll, userStoreParams) {
        if (!infiniteScroll) {
            return undefined;
        }
        const blockSize = (userStoreParams && userStoreParams.cacheBlockSize != null)
            ? userStoreParams.cacheBlockSize
            : this.gridOptionsService.getNum('cacheBlockSize');
        if (blockSize != null && blockSize > 0) {
            return blockSize;
        }
        else {
            return 100;
        }
    }
    getLevelSpecificParams(parentNode) {
        const callback = this.gridOptionsService.getCallback('getServerSideGroupLevelParams');
        if (!callback) {
            return undefined;
        }
        const params = {
            level: parentNode.level + 1,
            parentRowNode: parentNode.level >= 0 ? parentNode : undefined,
            rowGroupColumns: this.columnModel.getRowGroupColumns(),
            pivotColumns: this.columnModel.getPivotColumns(),
            pivotMode: this.columnModel.isPivotMode()
        };
        const res = callback(params);
        if (res.storeType != null) {
            res.suppressInfiniteScroll = res.storeType !== "partial";
        }
        return res;
    }
    isInfiniteScroll(storeParams) {
        const res = (storeParams && storeParams.suppressInfiniteScroll != null)
            ? storeParams.suppressInfiniteScroll
            : this.isSuppressServerSideInfiniteScroll();
        return !res;
    }
    isSuppressServerSideInfiniteScroll() {
        return this.gridOptionsService.is('suppressServerSideInfiniteScroll');
    }
};
__decorate$4([
    Autowired('gridOptionsService')
], StoreFactory.prototype, "gridOptionsService", void 0);
__decorate$4([
    Autowired('columnModel')
], StoreFactory.prototype, "columnModel", void 0);
StoreFactory = __decorate$4([
    Bean('ssrmStoreFactory')
], StoreFactory);

var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let ListenerUtils = class ListenerUtils {
    isSortingWithValueColumn(changedColumnsInSort) {
        const valueColIds = this.columnModel.getValueColumns().map(col => col.getColId());
        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (valueColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }
        return false;
    }
    isSortingWithSecondaryColumn(changedColumnsInSort) {
        if (!this.columnModel.getSecondaryColumns()) {
            return false;
        }
        const secondaryColIds = this.columnModel.getSecondaryColumns().map(col => col.getColId());
        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (secondaryColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }
        return false;
    }
};
__decorate$3([
    Autowired('columnModel')
], ListenerUtils.prototype, "columnModel", void 0);
ListenerUtils = __decorate$3([
    Bean('ssrmListenerUtils')
], ListenerUtils);

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class DefaultStrategy extends BeanStub {
    constructor() {
        super(...arguments);
        this.selectedState = { selectAll: false, toggledNodes: new Set() };
        this.lastSelected = null;
        this.selectAllUsed = false;
        // this is to prevent regressions, default selectionService retains reference of clicked nodes.
        this.selectedNodes = {};
    }
    init() {
        this.rowSelection = this.gridOptionsService.get('rowSelection');
        this.addManagedPropertyListener('rowSelection', (propChange) => {
            this.rowSelection = propChange.currentValue;
        });
    }
    getSelectedState() {
        return {
            selectAll: this.selectedState.selectAll,
            toggledNodes: [...this.selectedState.toggledNodes],
        };
    }
    setSelectedState(state) {
        // fire selection changed event
        const newState = {
            selectAll: false,
            toggledNodes: new Set(),
        };
        if (typeof state !== 'object') {
            console.error('AG Grid: The provided selection state should be an object.');
            return;
        }
        if ('selectAll' in state && typeof state.selectAll === 'boolean') {
            newState.selectAll = state.selectAll;
        }
        else {
            console.error('AG Grid: Select all status should be of boolean type.');
            return;
        }
        if ('toggledNodes' in state && Array.isArray(state.toggledNodes)) {
            state.toggledNodes.forEach((key) => {
                if (typeof key === 'string') {
                    newState.toggledNodes.add(key);
                }
                else {
                    console.warn(`AG Grid: Provided ids must be of string type. Invalid id provided: ${key}`);
                }
            });
        }
        else {
            console.error('AG Grid: `toggledNodes` must be an array of string ids.');
            return;
        }
        this.selectedState = newState;
    }
    deleteSelectionStateFromParent(parentPath, removedNodeIds) {
        if (this.selectedState.toggledNodes.size === 0) {
            return false;
        }
        let anyNodesToggled = false;
        removedNodeIds.forEach(id => {
            if (this.selectedState.toggledNodes.delete(id)) {
                anyNodesToggled = true;
            }
        });
        return anyNodesToggled;
    }
    setNodesSelected(params) {
        if (params.nodes.length === 0)
            return 0;
        const onlyThisNode = params.clearSelection && params.newValue && !params.rangeSelect;
        if (this.rowSelection !== 'multiple' || onlyThisNode) {
            if (params.nodes.length > 1) {
                throw new Error('AG Grid: cannot select multiple rows when rowSelection is set to \'single\'');
            }
            const node = params.nodes[0];
            if (params.newValue) {
                this.selectedNodes = { [node.id]: node };
                this.selectedState = {
                    selectAll: false,
                    toggledNodes: new Set([node.id]),
                };
            }
            else {
                this.selectedNodes = {};
                this.selectedState = {
                    selectAll: false,
                    toggledNodes: new Set(),
                };
            }
            this.lastSelected = node.id;
            return 1;
        }
        const updateNodeState = (node) => {
            if (params.newValue) {
                this.selectedNodes[node.id] = node;
            }
            else {
                delete this.selectedNodes[node.id];
            }
            const doesNodeConform = params.newValue === this.selectedState.selectAll;
            if (doesNodeConform) {
                this.selectedState.toggledNodes.delete(node.id);
                return;
            }
            this.selectedState.toggledNodes.add(node.id);
        };
        if (params.rangeSelect && this.lastSelected) {
            if (params.nodes.length > 1) {
                throw new Error('AG Grid: cannot select multiple rows when using rangeSelect');
            }
            const node = params.nodes[0];
            const lastSelectedNode = this.rowModel.getRowNode(this.lastSelected);
            this.rowModel.getNodesInRangeForSelection(node, lastSelectedNode !== null && lastSelectedNode !== void 0 ? lastSelectedNode : null).forEach(updateNodeState);
            this.lastSelected = node.id;
            return 1;
        }
        params.nodes.forEach(updateNodeState);
        this.lastSelected = params.nodes[params.nodes.length - 1].id;
        return 1;
    }
    processNewRow(node) {
        if (this.selectedNodes[node.id]) {
            this.selectedNodes[node.id] = node;
        }
    }
    isNodeSelected(node) {
        const isToggled = this.selectedState.toggledNodes.has(node.id);
        return this.selectedState.selectAll ? !isToggled : isToggled;
    }
    getSelectedNodes() {
        if (this.selectAllUsed) {
            console.warn(`AG Grid: getSelectedNodes and getSelectedRows functions cannot be used with select all functionality with the server-side row model.
                Use \`api.getServerSideSelectionState()\` instead.`);
        }
        return Object.values(this.selectedNodes);
    }
    getSelectedRows() {
        return this.getSelectedNodes().map(node => node.data);
    }
    getSelectionCount() {
        if (this.selectedState.selectAll) {
            return -1;
        }
        return this.selectedState.toggledNodes.size;
    }
    clearOtherNodes(rowNodeToKeepSelected, source) {
        const clearedRows = this.selectedState.selectAll ? 1 : this.selectedState.toggledNodes.size - 1;
        this.selectedState = {
            selectAll: false,
            toggledNodes: new Set([rowNodeToKeepSelected.id]),
        };
        this.rowModel.forEachNode(node => {
            if (node !== rowNodeToKeepSelected) {
                node.selectThisNode(false, undefined, source);
            }
        });
        const event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source,
        };
        this.eventService.dispatchEvent(event);
        return clearedRows;
    }
    isEmpty() {
        var _a;
        return !this.selectedState.selectAll && !((_a = this.selectedState.toggledNodes) === null || _a === void 0 ? void 0 : _a.size);
    }
    selectAllRowNodes(params) {
        this.selectedState = { selectAll: true, toggledNodes: new Set() };
        this.selectedNodes = {};
        this.selectAllUsed = true;
    }
    deselectAllRowNodes(params) {
        this.selectedState = { selectAll: false, toggledNodes: new Set() };
        this.selectedNodes = {};
    }
    getSelectAllState(justFiltered, justCurrentPage) {
        if (this.selectedState.selectAll) {
            if (this.selectedState.toggledNodes.size > 0) {
                return null;
            }
            return true;
        }
        if (this.selectedState.toggledNodes.size > 0) {
            return null;
        }
        return false;
    }
}
__decorate$2([
    Autowired('rowModel')
], DefaultStrategy.prototype, "rowModel", void 0);
__decorate$2([
    PostConstruct
], DefaultStrategy.prototype, "init", null);

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
class GroupSelectsChildrenStrategy extends BeanStub {
    constructor() {
        super(...arguments);
        this.selectedState = { selectAllChildren: false, toggledNodes: new Map() };
        this.lastSelected = null;
    }
    init() {
        // if model has updated, a store may now be fully loaded to clean up indeterminate states
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, () => this.removeRedundantState());
        // when the grouping changes, the state no longer makes sense, so reset the state.
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.selectionService.reset());
    }
    getSelectedState() {
        const recursivelySerializeState = (state, level, nodeId) => {
            const normalisedState = {
                nodeId,
            };
            if (level <= this.columnModel.getRowGroupColumns().length) {
                normalisedState.selectAllChildren = state.selectAllChildren;
            }
            // omit toggledNodes if empty
            if (state.toggledNodes.size) {
                const toggledNodes = [];
                state.toggledNodes.forEach((value, key) => {
                    const newState = recursivelySerializeState(value, level + 1, key);
                    toggledNodes.push(newState);
                });
                normalisedState.toggledNodes = toggledNodes;
            }
            return normalisedState;
        };
        return recursivelySerializeState(this.selectedState, 0);
    }
    setSelectedState(state) {
        const recursivelyDeserializeState = (normalisedState, parentSelected) => {
            var _a, _b;
            if (typeof normalisedState !== 'object') {
                throw new Error('AG Grid: Each provided state object must be an object.');
            }
            if ('selectAllChildren' in normalisedState && typeof normalisedState.selectAllChildren !== 'boolean') {
                throw new Error('AG Grid: `selectAllChildren` must be a boolean value or undefined.');
            }
            if ('toggledNodes' in normalisedState) {
                if (!Array.isArray(normalisedState.toggledNodes)) {
                    throw new Error('AG Grid: `toggledNodes` must be an array.');
                }
                const allHaveIds = normalisedState.toggledNodes.every(innerState => (typeof innerState === 'object' && 'nodeId' in innerState && typeof innerState.nodeId === 'string'));
                if (!allHaveIds) {
                    throw new Error('AG Grid: Every `toggledNode` requires an associated string id.');
                }
            }
            const isThisNodeSelected = (_a = normalisedState.selectAllChildren) !== null && _a !== void 0 ? _a : !parentSelected;
            const convertedChildren = (_b = normalisedState.toggledNodes) === null || _b === void 0 ? void 0 : _b.map(innerState => ([innerState.nodeId, recursivelyDeserializeState(innerState, isThisNodeSelected)]));
            const doesRedundantStateExist = convertedChildren === null || convertedChildren === void 0 ? void 0 : convertedChildren.some(([_, innerState]) => isThisNodeSelected === innerState.selectAllChildren && innerState.toggledNodes.size === 0);
            if (doesRedundantStateExist) {
                throw new Error(`
                    AG Grid: AG Grid: Row selection state could not be parsed due to invalid data. Ensure all child state has toggledNodes or does not conform with the parent rule.
                    Please rebuild the selection state and reapply it.
                `);
            }
            return {
                selectAllChildren: isThisNodeSelected,
                toggledNodes: new Map(convertedChildren),
            };
        };
        try {
            this.selectedState = recursivelyDeserializeState(state, !!state.selectAllChildren);
        }
        catch (e) {
            console.error(e.message);
        }
    }
    deleteSelectionStateFromParent(parentRoute, removedNodeIds) {
        let parentState = this.selectedState;
        const remainingRoute = [...parentRoute];
        while (parentState && remainingRoute.length) {
            parentState = parentState.toggledNodes.get(remainingRoute.pop());
        }
        // parent has no explicit state, nothing to remove
        if (!parentState) {
            return false;
        }
        let anyStateChanged = false;
        removedNodeIds.forEach(id => {
            if (parentState === null || parentState === void 0 ? void 0 : parentState.toggledNodes.delete(id)) {
                anyStateChanged = true;
            }
        });
        if (anyStateChanged) {
            this.removeRedundantState();
        }
        return anyStateChanged;
    }
    setNodesSelected(params) {
        const { nodes } = params, other = __rest(params, ["nodes"]);
        if (nodes.length === 0)
            return 0;
        if (params.rangeSelect) {
            if (nodes.length > 1) {
                throw new Error('AG Grid: cannot select multiple rows when using rangeSelect');
            }
            const node = nodes[0];
            const rangeOfNodes = this.rowModel.getNodesInRangeForSelection(node, this.lastSelected);
            // sort the routes by route length, high to low, this means we can do the lowest level children first
            const routes = rangeOfNodes.map(this.getRouteToNode).sort((a, b) => b.length - a.length);
            // skip routes if we've already done a descendent
            const completedRoutes = new Set();
            routes.forEach(route => {
                // skip routes if we've already selected a descendent
                if (completedRoutes.has(route[route.length - 1])) {
                    return;
                }
                route.forEach(part => completedRoutes.add(part));
                this.recursivelySelectNode(route, this.selectedState, Object.assign({ node }, other));
            });
            this.removeRedundantState();
            this.lastSelected = node;
            return 1;
        }
        params.nodes.forEach(node => {
            const idPathToNode = this.getRouteToNode(node);
            this.recursivelySelectNode(idPathToNode, this.selectedState, Object.assign(Object.assign({}, other), { node }));
        });
        this.removeRedundantState();
        this.lastSelected = params.nodes[params.nodes.length - 1];
        return 1;
    }
    isNodeSelected(node) {
        const path = this.getRouteToNode(node);
        return this.isNodePathSelected(path, this.selectedState);
    }
    isNodePathSelected([nextNode, ...nodes], state) {
        if (nodes.length === 0) {
            const isToggled = state.toggledNodes.has(nextNode.id);
            if (nextNode.hasChildren()) {
                const groupState = state.toggledNodes.get(nextNode.id);
                if (groupState && groupState.toggledNodes.size) {
                    return undefined;
                }
            }
            return state.selectAllChildren ? !isToggled : isToggled;
        }
        // if there's a deeper level, check recursively
        if (state.toggledNodes.has(nextNode.id)) {
            const nextState = state.toggledNodes.get(nextNode.id);
            if (nextState) {
                return this.isNodePathSelected(nodes, nextState);
            }
        }
        // no deeper custom state, respect the closest default
        return !!state.selectAllChildren;
    }
    getRouteToNode(node) {
        const pathToNode = [];
        let tempNode = node;
        while (tempNode.parent) {
            pathToNode.push(tempNode);
            tempNode = tempNode.parent;
        }
        return pathToNode.reverse();
    }
    removeRedundantState() {
        if (this.filterManager.isAnyFilterPresent()) {
            return;
        }
        const recursivelyRemoveState = (selectedState = this.selectedState, store = this.serverSideRowModel.getRootStore(), node) => {
            let allChildNodesFound = true;
            let noIndeterminateChildren = true;
            selectedState.toggledNodes.forEach((state, id) => {
                const parentNode = this.rowModel.getRowNode(id);
                if (!parentNode) {
                    allChildNodesFound = false;
                }
                const nextStore = parentNode === null || parentNode === void 0 ? void 0 : parentNode.childStore;
                if (!nextStore) {
                    if (state.toggledNodes.size > 0) {
                        noIndeterminateChildren = false;
                    }
                    return;
                }
                // if child was cleared, check if this state is still relevant
                if (recursivelyRemoveState(state, nextStore, parentNode)) {
                    // cleans out groups which have no toggled nodes and an equivalent default to its parent
                    if (selectedState.selectAllChildren === state.selectAllChildren) {
                        selectedState.toggledNodes.delete(id);
                    }
                }
                if (state.toggledNodes.size > 0) {
                    noIndeterminateChildren = false;
                }
            });
            if (!store || !store.isLastRowIndexKnown() || store.getRowCount() !== selectedState.toggledNodes.size) {
                // if row count unknown, or doesn't match the size of toggledNodes, ignore.
                return false;
            }
            if (noIndeterminateChildren && allChildNodesFound) {
                selectedState.toggledNodes.clear();
                selectedState.selectAllChildren = !selectedState.selectAllChildren;
                // if node was indeterminate, it's not any more.
                if (node && (node === null || node === void 0 ? void 0 : node.isSelected()) !== selectedState.selectAllChildren) {
                    node.selectThisNode(selectedState.selectAllChildren, undefined, 'api');
                }
                return true;
            }
            return false;
        };
        recursivelyRemoveState();
    }
    recursivelySelectNode([nextNode, ...nodes], selectedState, params) {
        if (!nextNode) {
            return;
        }
        // if this is the last node, hard add/remove based on its selectAllChildren state
        const isLastNode = !nodes.length;
        if (isLastNode) {
            const needsDeleted = selectedState.selectAllChildren === params.newValue;
            if (needsDeleted) {
                selectedState.toggledNodes.delete(nextNode.id);
                return;
            }
            const newState = {
                selectAllChildren: params.newValue,
                toggledNodes: new Map(),
            };
            selectedState.toggledNodes.set(nextNode.id, newState);
            return;
        }
        const doesStateAlreadyExist = selectedState.toggledNodes.has(nextNode.id);
        const childState = doesStateAlreadyExist ? (selectedState.toggledNodes.get(nextNode.id)) : {
            selectAllChildren: selectedState.selectAllChildren,
            toggledNodes: new Map(),
        };
        if (!doesStateAlreadyExist) {
            selectedState.toggledNodes.set(nextNode.id, childState);
        }
        this.recursivelySelectNode(nodes, childState, params);
        // cleans out groups which have no toggled nodes and an equivalent default to its parent
        if (selectedState.selectAllChildren === childState.selectAllChildren && childState.toggledNodes.size === 0) {
            selectedState.toggledNodes.delete(nextNode.id);
        }
    }
    getSelectedNodes() {
        console.warn(`AG Grid: \`getSelectedNodes\` and \`getSelectedRows\` functions cannot be used with \`groupSelectsChildren\` and the server-side row model.
            Use \`api.getServerSideSelectionState()\` instead.`);
        const selectedNodes = [];
        this.rowModel.forEachNode(node => {
            if (node.isSelected()) {
                selectedNodes.push(node);
            }
        });
        return selectedNodes;
    }
    processNewRow(node) {
        // This is used for updating outdated node refs, as this model entirely uses ids it's irrelevant
    }
    getSelectedRows() {
        return this.getSelectedNodes().map(node => node.data);
    }
    getSelectionCount() {
        return -1;
    }
    isEmpty() {
        var _a;
        return !this.selectedState.selectAllChildren && !((_a = this.selectedState.toggledNodes) === null || _a === void 0 ? void 0 : _a.size);
    }
    selectAllRowNodes(params) {
        this.selectedState = { selectAllChildren: true, toggledNodes: new Map() };
    }
    deselectAllRowNodes(params) {
        this.selectedState = { selectAllChildren: false, toggledNodes: new Map() };
    }
    getSelectAllState(justFiltered, justCurrentPage) {
        if (this.selectedState.selectAllChildren) {
            if (this.selectedState.toggledNodes.size > 0) {
                return null;
            }
            return true;
        }
        if (this.selectedState.toggledNodes.size > 0) {
            return null;
        }
        return false;
    }
}
__decorate$1([
    Autowired('rowModel')
], GroupSelectsChildrenStrategy.prototype, "rowModel", void 0);
__decorate$1([
    Autowired('columnModel')
], GroupSelectsChildrenStrategy.prototype, "columnModel", void 0);
__decorate$1([
    Autowired('filterManager')
], GroupSelectsChildrenStrategy.prototype, "filterManager", void 0);
__decorate$1([
    Autowired('rowModel')
], GroupSelectsChildrenStrategy.prototype, "serverSideRowModel", void 0);
__decorate$1([
    Autowired('selectionService')
], GroupSelectsChildrenStrategy.prototype, "selectionService", void 0);
__decorate$1([
    PostConstruct
], GroupSelectsChildrenStrategy.prototype, "init", null);

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let ServerSideSelectionService = class ServerSideSelectionService extends BeanStub {
    init() {
        const groupSelectsChildren = this.gridOptionsService.is('groupSelectsChildren');
        this.addManagedPropertyListener('groupSelectsChildren', (propChange) => {
            this.destroyBean(this.selectionStrategy);
            const StrategyClazz = !propChange.currentValue ? DefaultStrategy : GroupSelectsChildrenStrategy;
            this.selectionStrategy = this.createManagedBean(new StrategyClazz());
            this.shotgunResetNodeSelectionState();
            const event = {
                type: Events.EVENT_SELECTION_CHANGED,
                source: 'api',
            };
            this.eventService.dispatchEvent(event);
        });
        this.rowSelection = this.gridOptionsService.get('rowSelection');
        this.addManagedPropertyListener('rowSelection', (propChange) => this.rowSelection = propChange.currentValue);
        const StrategyClazz = !groupSelectsChildren ? DefaultStrategy : GroupSelectsChildrenStrategy;
        this.selectionStrategy = this.createManagedBean(new StrategyClazz());
    }
    getServerSideSelectionState() {
        return this.selectionStrategy.getSelectedState();
    }
    setServerSideSelectionState(state) {
        this.selectionStrategy.setSelectedState(state);
        this.shotgunResetNodeSelectionState();
        const event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: 'api',
        };
        this.eventService.dispatchEvent(event);
    }
    setNodesSelected(params) {
        if (params.nodes.length > 1 && this.rowSelection !== 'multiple') {
            console.warn(`AG Grid: cannot multi select while rowSelection='single'`);
            return 0;
        }
        if (params.nodes.length > 1 && params.rangeSelect) {
            console.warn(`AG Grid: cannot use range selection when multi selecting rows`);
            return 0;
        }
        const changedNodes = this.selectionStrategy.setNodesSelected(params);
        this.shotgunResetNodeSelectionState(params.source);
        const event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: params.source,
        };
        this.eventService.dispatchEvent(event);
        return changedNodes;
    }
    /**
     * Deletes the selection state for a set of nodes, for use after deleting nodes via
     * transaction. As this is designed for transactions, all nodes should belong to the same group.
     */
    deleteSelectionStateFromParent(storeRoute, removedNodeIds) {
        const stateChanged = this.selectionStrategy.deleteSelectionStateFromParent(storeRoute, removedNodeIds);
        if (!stateChanged) {
            return;
        }
        this.shotgunResetNodeSelectionState();
        const event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: 'api',
        };
        this.eventService.dispatchEvent(event);
    }
    shotgunResetNodeSelectionState(source) {
        this.rowModel.forEachNode(node => {
            if (node.stub) {
                return;
            }
            const isNodeSelected = this.selectionStrategy.isNodeSelected(node);
            if (isNodeSelected !== node.isSelected()) {
                node.selectThisNode(isNodeSelected, undefined, source);
            }
        });
    }
    getSelectedNodes() {
        return this.selectionStrategy.getSelectedNodes();
    }
    getSelectedRows() {
        return this.selectionStrategy.getSelectedRows();
    }
    getSelectionCount() {
        return this.selectionStrategy.getSelectionCount();
    }
    syncInRowNode(rowNode, oldNode) {
        // update any refs being held in the strategies
        this.selectionStrategy.processNewRow(rowNode);
        const isNodeSelected = this.selectionStrategy.isNodeSelected(rowNode);
        rowNode.setSelectedInitialValue(isNodeSelected);
    }
    reset() {
        this.selectionStrategy.deselectAllRowNodes({ source: 'api' });
    }
    isEmpty() {
        return this.selectionStrategy.isEmpty();
    }
    selectAllRowNodes(params) {
        if (params.justCurrentPage || params.justFiltered) {
            console.warn("AG Grid: selecting just filtered only works when gridOptions.rowModelType='clientSide'");
        }
        this.selectionStrategy.selectAllRowNodes(params);
        this.rowModel.forEachNode(node => {
            if (node.stub) {
                return;
            }
            node.selectThisNode(true, undefined, params.source);
        });
        const event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: params.source,
        };
        this.eventService.dispatchEvent(event);
    }
    deselectAllRowNodes(params) {
        if (params.justCurrentPage || params.justFiltered) {
            console.warn("AG Grid: selecting just filtered only works when gridOptions.rowModelType='clientSide'");
        }
        this.selectionStrategy.deselectAllRowNodes(params);
        this.rowModel.forEachNode(node => {
            if (node.stub) {
                return;
            }
            node.selectThisNode(false, undefined, params.source);
        });
        const event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: params.source,
        };
        this.eventService.dispatchEvent(event);
    }
    getSelectAllState(justFiltered, justCurrentPage) {
        return this.selectionStrategy.getSelectAllState(justFiltered, justCurrentPage);
    }
    // used by CSRM
    updateGroupsFromChildrenSelections(source, changedPath) {
        return false;
    }
    // used by CSRM
    getBestCostNodeSelection() {
        console.warn('AG Grid: calling gridApi.getBestCostNodeSelection() is only possible when using rowModelType=`clientSide`.');
        return undefined;
    }
    // used by CSRM
    filterFromSelection() {
        return;
    }
};
__decorate([
    Autowired('rowModel')
], ServerSideSelectionService.prototype, "rowModel", void 0);
__decorate([
    PostConstruct
], ServerSideSelectionService.prototype, "init", null);
ServerSideSelectionService = __decorate([
    Bean('selectionService')
], ServerSideSelectionService);

// DO NOT UPDATE MANUALLY: Generated from script during build time
const VERSION = '30.0.0';

const ServerSideRowModelModule = {
    version: VERSION,
    moduleName: ModuleNames.ServerSideRowModelModule,
    rowModel: 'serverSide',
    beans: [ServerSideRowModel, ExpandListener, SortListener, StoreUtils, BlockUtils, NodeManager, TransactionManager,
        FilterListener, StoreFactory, ListenerUtils, ServerSideSelectionService],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

export { ServerSideRowModelModule };
