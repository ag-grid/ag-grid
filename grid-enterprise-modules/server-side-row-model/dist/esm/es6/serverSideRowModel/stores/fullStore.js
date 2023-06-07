var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Events, NumberSequence, PostConstruct, PreDestroy, RowNodeBlock, ServerSideTransactionResultStatus } from "@ag-grid-community/core";
export class FullStore extends RowNodeBlock {
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
__decorate([
    Autowired('ssrmStoreUtils')
], FullStore.prototype, "storeUtils", void 0);
__decorate([
    Autowired('ssrmBlockUtils')
], FullStore.prototype, "blockUtils", void 0);
__decorate([
    Autowired('columnModel')
], FullStore.prototype, "columnModel", void 0);
__decorate([
    Autowired('rowNodeBlockLoader')
], FullStore.prototype, "rowNodeBlockLoader", void 0);
__decorate([
    Autowired('rowNodeSorter')
], FullStore.prototype, "rowNodeSorter", void 0);
__decorate([
    Autowired('sortController')
], FullStore.prototype, "sortController", void 0);
__decorate([
    Autowired('selectionService')
], FullStore.prototype, "selectionService", void 0);
__decorate([
    Autowired('ssrmNodeManager')
], FullStore.prototype, "nodeManager", void 0);
__decorate([
    Autowired('filterManager')
], FullStore.prototype, "filterManager", void 0);
__decorate([
    Autowired('ssrmTransactionManager')
], FullStore.prototype, "transactionManager", void 0);
__decorate([
    PostConstruct
], FullStore.prototype, "postConstruct", null);
__decorate([
    PreDestroy
], FullStore.prototype, "destroyRowNodes", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVsbFN0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3NlcnZlclNpZGVSb3dNb2RlbC9zdG9yZXMvZnVsbFN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsU0FBUyxFQUdULE1BQU0sRUFJTixjQUFjLEVBQ2QsYUFBYSxFQUNiLFVBQVUsRUFHVixZQUFZLEVBUVosaUNBQWlDLEVBUXBDLE1BQU0seUJBQXlCLENBQUM7QUFPakMsTUFBTSxPQUFPLFNBQVUsU0FBUSxZQUFZO0lBMEN2QyxZQUFZLFVBQXNCLEVBQUUsV0FBdUMsRUFBRSxhQUFzQjtRQUMvRiw4RkFBOEY7UUFDOUYsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBekJMLG1CQUFjLEdBQW1CLElBQUksY0FBYyxFQUFFLENBQUM7UUFxQnRELFNBQUksR0FBUSxFQUFFLENBQUM7UUFLbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDbkMsSUFBSSxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNwRyxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssVUFBVSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDekcsQ0FBQztJQUdPLGFBQWE7UUFDakIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsa0JBQWtC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