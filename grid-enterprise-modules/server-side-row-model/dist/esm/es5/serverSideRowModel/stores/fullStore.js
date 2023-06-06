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
import { _, Autowired, Events, NumberSequence, PostConstruct, PreDestroy, RowNodeBlock, ServerSideTransactionResultStatus } from "@ag-grid-community/core";
var FullStore = /** @class */ (function (_super) {
    __extends(FullStore, _super);
    function FullStore(ssrmParams, storeParams, parentRowNode) {
        var _this = 
        // finite block represents a cache with just one block, thus 0 is the id, it's the first block
        _super.call(this, 0) || this;
        _this.nodeIdSequence = new NumberSequence();
        _this.info = {};
        _this.ssrmParams = ssrmParams;
        _this.parentRowNode = parentRowNode;
        _this.level = parentRowNode.level + 1;
        _this.groupLevel = ssrmParams.rowGroupCols ? _this.level < ssrmParams.rowGroupCols.length : undefined;
        _this.leafGroup = ssrmParams.rowGroupCols ? _this.level === ssrmParams.rowGroupCols.length - 1 : false;
        return _this;
    }
    FullStore.prototype.postConstruct = function () {
        var _this = this;
        this.usingTreeData = this.gridOptionsService.isTreeData();
        this.nodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.parentRowNode);
        if (!this.usingTreeData && this.groupLevel) {
            var groupColVo = this.ssrmParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnModel.getRowGroupColumns()[this.level];
        }
        var initialRowCount = 1;
        var isRootStore = this.parentRowNode.level === -1;
        var userInitialRowCount = this.storeUtils.getServerSideInitialRowCount();
        if (isRootStore && userInitialRowCount !== undefined) {
            initialRowCount = userInitialRowCount;
        }
        this.initialiseRowNodes(initialRowCount);
        this.rowNodeBlockLoader.addBlock(this);
        this.addDestroyFunc(function () { return _this.rowNodeBlockLoader.removeBlock(_this); });
    };
    FullStore.prototype.destroyRowNodes = function () {
        this.blockUtils.destroyRowNodes(this.allRowNodes);
        this.allRowNodes = [];
        this.nodesAfterSort = [];
        this.nodesAfterFilter = [];
        this.allNodesMap = {};
    };
    FullStore.prototype.initialiseRowNodes = function (loadingRowsCount, failedLoad) {
        if (failedLoad === void 0) { failedLoad = false; }
        this.destroyRowNodes();
        for (var i = 0; i < loadingRowsCount; i++) {
            var loadingRowNode = this.blockUtils.createRowNode({
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
    };
    FullStore.prototype.getBlockStateJson = function () {
        return {
            id: this.nodeIdPrefix ? this.nodeIdPrefix : '',
            state: this.getState()
        };
    };
    FullStore.prototype.loadFromDatasource = function () {
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
    };
    FullStore.prototype.getStartRow = function () {
        return 0; // always zero as not in a cache
    };
    FullStore.prototype.getEndRow = function () {
        return this.nodesAfterSort.length;
    };
    FullStore.prototype.createDataNode = function (data, index) {
        var rowNode = this.blockUtils.createRowNode({
            field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
            level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn
        });
        if (index != null) {
            _.insertIntoArray(this.allRowNodes, rowNode, index);
        }
        else {
            this.allRowNodes.push(rowNode);
        }
        var defaultId = this.prefixId(this.nodeIdSequence.next());
        this.blockUtils.setDataIntoRowNode(rowNode, data, defaultId, undefined);
        this.nodeManager.addRowNode(rowNode);
        this.blockUtils.checkOpenByDefault(rowNode);
        this.allNodesMap[rowNode.id] = rowNode;
        return rowNode;
    };
    FullStore.prototype.prefixId = function (id) {
        if (this.nodeIdPrefix) {
            return this.nodeIdPrefix + '-' + id;
        }
        else {
            return id.toString();
        }
    };
    FullStore.prototype.processServerFail = function () {
        this.initialiseRowNodes(1, true);
        this.fireStoreUpdatedEvent();
        this.flushAsyncTransactions();
    };
    FullStore.prototype.processServerResult = function (params) {
        if (!this.isAlive()) {
            return;
        }
        var info = params.storeInfo || params.groupLevelInfo;
        if (info) {
            Object.assign(this.info, info);
        }
        var nodesToRecycle = this.allRowNodes.length > 0 ? this.allNodesMap : undefined;
        this.allRowNodes = [];
        this.nodesAfterSort = [];
        this.nodesAfterFilter = [];
        this.allNodesMap = {};
        if (!params.rowData) {
            var message_1 = 'AG Grid: "params.data" is missing from Server-Side Row Model success() callback. Please use the "data" attribute. If no data is returned, set an empty list.';
            _.doOnce(function () { return console.warn(message_1, params); }, 'FullStore.noData');
        }
        this.createOrRecycleNodes(nodesToRecycle, params.rowData);
        if (nodesToRecycle) {
            this.blockUtils.destroyRowNodes(_.getAllValuesInObject(nodesToRecycle));
        }
        this.filterAndSortNodes();
        this.fireStoreUpdatedEvent();
        this.flushAsyncTransactions();
    };
    FullStore.prototype.createOrRecycleNodes = function (nodesToRecycle, rowData) {
        var _this = this;
        if (!rowData) {
            return;
        }
        var lookupNodeToRecycle = function (data) {
            if (!nodesToRecycle) {
                return undefined;
            }
            var getRowIdFunc = _this.gridOptionsService.getCallback('getRowId');
            if (!getRowIdFunc) {
                return undefined;
            }
            var parentKeys = _this.parentRowNode.getGroupKeys();
            var level = _this.level;
            var id = getRowIdFunc({
                data: data,
                parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
                level: level,
            });
            var foundNode = nodesToRecycle[id];
            if (!foundNode) {
                return undefined;
            }
            delete nodesToRecycle[id];
            return foundNode;
        };
        var recycleNode = function (rowNode, dataItem) {
            _this.allNodesMap[rowNode.id] = rowNode;
            _this.blockUtils.updateDataIntoRowNode(rowNode, dataItem);
            _this.allRowNodes.push(rowNode);
        };
        rowData.forEach(function (dataItem) {
            var nodeToRecycle = lookupNodeToRecycle(dataItem);
            if (nodeToRecycle) {
                recycleNode(nodeToRecycle, dataItem);
            }
            else {
                _this.createDataNode(dataItem);
            }
        });
    };
    FullStore.prototype.flushAsyncTransactions = function () {
        var _this = this;
        // we want to update the store with any outstanding transactions straight away,
        // as otherwise if waitTimeMillis is large (eg 5s), then the user could be looking
        // at old data for a few seconds before the transactions is applied, which isn't what
        // you would expect when we advertise 'transaction is applied when data is loaded'.
        // we do this in a timeout as flushAsyncTransactions expects the grid to be in a settled
        // state, not in the middle of loading rows! keeps the VM Turns more simple and deterministic.
        window.setTimeout(function () { return _this.transactionManager.flushAsyncTransactions(); }, 0);
    };
    FullStore.prototype.filterAndSortNodes = function () {
        this.filterRowNodes();
        this.sortRowNodes();
    };
    FullStore.prototype.sortRowNodes = function () {
        var serverIsSorting = this.storeUtils.isServerSideSortAllLevels() || this.storeUtils.isServerSideSortOnServer();
        var sortOptions = this.sortController.getSortOptions();
        var noSortApplied = !sortOptions || sortOptions.length == 0;
        if (serverIsSorting || noSortApplied) {
            this.nodesAfterSort = this.nodesAfterFilter;
            return;
        }
        this.nodesAfterSort = this.rowNodeSorter.doFullSort(this.nodesAfterFilter, sortOptions);
    };
    FullStore.prototype.filterRowNodes = function () {
        var _this = this;
        var serverIsFiltering = !this.storeUtils.isServerSideOnlyRefreshFilteredGroups() || this.storeUtils.isServerSideFilterOnServer();
        // filtering for InFullStore only works at lowest level details.
        // reason is the logic for group filtering was to difficult to work out how it should work at time of writing.
        var groupLevel = this.groupLevel;
        if (serverIsFiltering || groupLevel) {
            this.nodesAfterFilter = this.allRowNodes;
            return;
        }
        this.nodesAfterFilter = this.allRowNodes.filter(function (rowNode) { return _this.filterManager.doesRowPassFilter({ rowNode: rowNode }); });
    };
    FullStore.prototype.clearDisplayIndexes = function () {
        var _this = this;
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.allRowNodes.forEach(function (rowNode) { return _this.blockUtils.clearDisplayIndex(rowNode); });
    };
    FullStore.prototype.getDisplayIndexEnd = function () {
        return this.displayIndexEnd;
    };
    FullStore.prototype.isDisplayIndexInStore = function (displayIndex) {
        if (this.getRowCount() === 0) {
            return false;
        }
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    };
    FullStore.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
        var _this = this;
        this.displayIndexStart = displayIndexSeq.peek();
        this.topPx = nextRowTop.value;
        var visibleNodeIds = {};
        // set on all visible nodes
        this.nodesAfterSort.forEach(function (rowNode) {
            _this.blockUtils.setDisplayIndex(rowNode, displayIndexSeq, nextRowTop);
            visibleNodeIds[rowNode.id] = true;
        });
        // and clear on all non-visible nodes
        this.allRowNodes.forEach(function (rowNode) {
            if (!visibleNodeIds[rowNode.id]) {
                _this.blockUtils.clearDisplayIndex(rowNode);
            }
        });
        this.displayIndexEnd = displayIndexSeq.peek();
        this.heightPx = nextRowTop.value - this.topPx;
    };
    FullStore.prototype.forEachStoreDeep = function (callback, sequence) {
        if (sequence === void 0) { sequence = new NumberSequence(); }
        callback(this, sequence.next());
        this.allRowNodes.forEach(function (rowNode) {
            var childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachStoreDeep(callback, sequence);
            }
        });
    };
    FullStore.prototype.forEachNodeDeep = function (callback, sequence) {
        if (sequence === void 0) { sequence = new NumberSequence(); }
        this.allRowNodes.forEach(function (rowNode) {
            callback(rowNode, sequence.next());
            var childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeep(callback, sequence);
            }
        });
    };
    FullStore.prototype.forEachNodeDeepAfterFilterAndSort = function (callback, sequence) {
        if (sequence === void 0) { sequence = new NumberSequence(); }
        this.nodesAfterSort.forEach(function (rowNode) {
            callback(rowNode, sequence.next());
            var childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeepAfterFilterAndSort(callback, sequence);
            }
        });
    };
    FullStore.prototype.getRowUsingDisplayIndex = function (displayRowIndex) {
        // this can happen if asking for a row that doesn't exist in the model,
        // eg if a cell range is selected, and the user filters so rows no longer exists
        if (!this.isDisplayIndexInStore(displayRowIndex)) {
            return undefined;
        }
        var res = this.blockUtils.binarySearchForDisplayIndex(displayRowIndex, this.nodesAfterSort);
        return res;
    };
    FullStore.prototype.getRowBounds = function (index) {
        for (var i = 0; i < this.nodesAfterSort.length; i++) {
            var rowNode = this.nodesAfterSort[i];
            var res = this.blockUtils.extractRowBounds(rowNode, index);
            if (res) {
                return res;
            }
        }
        return null;
    };
    FullStore.prototype.isPixelInRange = function (pixel) {
        return pixel >= this.topPx && pixel < (this.topPx + this.heightPx);
    };
    FullStore.prototype.getRowIndexAtPixel = function (pixel) {
        var _this = this;
        // if pixel before block, return first row
        var pixelBeforeThisStore = pixel <= this.topPx;
        if (pixelBeforeThisStore) {
            var firstNode = this.nodesAfterSort[0];
            return firstNode.rowIndex;
        }
        // if pixel after store, return last row, however the last
        // row could be a child store
        var pixelAfterThisStore = pixel >= (this.topPx + this.heightPx);
        if (pixelAfterThisStore) {
            var lastRowNode = this.nodesAfterSort[this.nodesAfterSort.length - 1];
            var lastRowNodeBottomPx = lastRowNode.rowTop + lastRowNode.rowHeight;
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
        var res = null;
        this.nodesAfterSort.forEach(function (rowNode) {
            var res2 = _this.blockUtils.getIndexAtPixel(rowNode, pixel);
            if (res2 != null) {
                res = res2;
            }
        });
        var pixelIsPastLastRow = res == null;
        if (pixelIsPastLastRow) {
            return this.displayIndexEnd - 1;
        }
        return res;
    };
    FullStore.prototype.getChildStore = function (keys) {
        var _this = this;
        return this.storeUtils.getChildStore(keys, this, function (key) {
            var rowNode = _this.allRowNodes.find(function (currentRowNode) {
                return currentRowNode.key == key;
            });
            return rowNode;
        });
    };
    FullStore.prototype.forEachChildStoreShallow = function (callback) {
        this.allRowNodes.forEach(function (rowNode) {
            var childStore = rowNode.childStore;
            if (childStore) {
                callback(childStore);
            }
        });
    };
    FullStore.prototype.refreshAfterFilter = function (params) {
        var serverIsFiltering = this.storeUtils.isServerSideFilterOnServer();
        var storeIsImpacted = this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params);
        var serverIsFilteringAllLevels = !this.storeUtils.isServerSideOnlyRefreshFilteredGroups();
        if (serverIsFilteringAllLevels || (serverIsFiltering && storeIsImpacted)) {
            this.refreshStore(true);
            this.sortRowNodes();
            return;
        }
        this.filterRowNodes();
        this.sortRowNodes();
        this.forEachChildStoreShallow(function (store) { return store.refreshAfterFilter(params); });
    };
    FullStore.prototype.refreshAfterSort = function (params) {
        var serverIsSorting = this.storeUtils.isServerSideSortOnServer();
        var storeIsImpacted = this.storeUtils.isServerRefreshNeeded(this.parentRowNode, this.ssrmParams.rowGroupCols, params);
        var serverIsSortingAllLevels = this.storeUtils.isServerSideSortAllLevels();
        if (serverIsSortingAllLevels || (serverIsSorting && storeIsImpacted)) {
            this.refreshStore(true);
            this.filterRowNodes();
            return;
        }
        this.filterRowNodes();
        this.sortRowNodes();
        this.forEachChildStoreShallow(function (store) { return store.refreshAfterSort(params); });
    };
    FullStore.prototype.applyTransaction = function (transaction) {
        // we only apply transactions to loaded state
        switch (this.getState()) {
            case RowNodeBlock.STATE_FAILED:
                return { status: ServerSideTransactionResultStatus.StoreLoadingFailed };
            case RowNodeBlock.STATE_LOADING:
                return { status: ServerSideTransactionResultStatus.StoreLoading };
            case RowNodeBlock.STATE_WAITING_TO_LOAD:
                return { status: ServerSideTransactionResultStatus.StoreWaitingToLoad };
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
        var res = {
            status: ServerSideTransactionResultStatus.Applied,
            remove: [],
            update: [],
            add: []
        };
        var nodesToUnselect = [];
        this.executeAdd(transaction, res);
        this.executeRemove(transaction, res, nodesToUnselect);
        this.executeUpdate(transaction, res, nodesToUnselect);
        this.filterAndSortNodes();
        this.updateSelection(nodesToUnselect);
        return res;
    };
    FullStore.prototype.updateSelection = function (nodesToUnselect) {
        var selectionChanged = nodesToUnselect.length > 0;
        if (selectionChanged) {
            this.selectionService.setNodesSelected({
                newValue: false,
                nodes: nodesToUnselect,
                suppressFinishActions: true,
                clearSelection: false,
                source: 'rowDataChanged',
            });
            var event_1 = {
                type: Events.EVENT_SELECTION_CHANGED,
                source: 'rowDataChanged'
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    FullStore.prototype.executeAdd = function (rowDataTran, rowNodeTransaction) {
        var _this = this;
        var add = rowDataTran.add, addIndex = rowDataTran.addIndex;
        if (_.missingOrEmpty(add)) {
            return;
        }
        var useIndex = typeof addIndex === 'number' && addIndex >= 0;
        if (useIndex) {
            // items get inserted in reverse order for index insertion
            add.reverse().forEach(function (item) {
                var newRowNode = _this.createDataNode(item, addIndex);
                rowNodeTransaction.add.push(newRowNode);
            });
        }
        else {
            add.forEach(function (item) {
                var newRowNode = _this.createDataNode(item);
                rowNodeTransaction.add.push(newRowNode);
            });
        }
    };
    FullStore.prototype.executeRemove = function (rowDataTran, rowNodeTransaction, nodesToUnselect) {
        var _this = this;
        var remove = rowDataTran.remove;
        if (remove == null) {
            return;
        }
        var rowIdsRemoved = {};
        remove.forEach(function (item) {
            var rowNode = _this.lookupRowNode(item);
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
            delete _this.allNodesMap[rowNode.id];
            rowNodeTransaction.remove.push(rowNode);
            _this.nodeManager.removeNode(rowNode);
        });
        this.allRowNodes = this.allRowNodes.filter(function (rowNode) { return !rowIdsRemoved[rowNode.id]; });
    };
    FullStore.prototype.executeUpdate = function (rowDataTran, rowNodeTransaction, nodesToUnselect) {
        var _this = this;
        var update = rowDataTran.update;
        if (update == null) {
            return;
        }
        update.forEach(function (item) {
            var rowNode = _this.lookupRowNode(item);
            if (!rowNode) {
                return;
            }
            _this.blockUtils.updateDataIntoRowNode(rowNode, item);
            if (!rowNode.selectable && rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }
            rowNodeTransaction.update.push(rowNode);
        });
    };
    FullStore.prototype.lookupRowNode = function (data) {
        var getRowIdFunc = this.gridOptionsService.getCallback('getRowId');
        var rowNode;
        if (getRowIdFunc != null) {
            // find rowNode using id
            var level = this.level;
            var parentKeys = this.parentRowNode.getGroupKeys();
            var id = getRowIdFunc({
                data: data,
                parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
                level: level,
            });
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                console.error("AG Grid: could not find row id=" + id + ", data item was not found for this id");
                return null;
            }
        }
        else {
            // find rowNode using object references
            rowNode = this.allRowNodes.find(function (currentRowNode) { return currentRowNode.data === data; });
            if (!rowNode) {
                console.error("AG Grid: could not find data item as object was not found", data);
                return null;
            }
        }
        return rowNode;
    };
    FullStore.prototype.addStoreStates = function (result) {
        result.push({
            suppressInfiniteScroll: true,
            route: this.parentRowNode.getGroupKeys(),
            rowCount: this.allRowNodes.length,
            info: this.info
        });
        this.forEachChildStoreShallow(function (childStore) { return childStore.addStoreStates(result); });
    };
    FullStore.prototype.refreshStore = function (purge) {
        if (purge) {
            var loadingRowsToShow = this.nodesAfterSort ? this.nodesAfterSort.length : 1;
            this.initialiseRowNodes(loadingRowsToShow);
        }
        this.scheduleLoad();
        this.fireStoreUpdatedEvent();
    };
    FullStore.prototype.retryLoads = function () {
        if (this.getState() === RowNodeBlock.STATE_FAILED) {
            this.initialiseRowNodes(1);
            this.scheduleLoad();
        }
        this.forEachChildStoreShallow(function (store) { return store.retryLoads(); });
    };
    FullStore.prototype.scheduleLoad = function () {
        this.setStateWaitingToLoad();
        this.rowNodeBlockLoader.checkBlockToLoad();
    };
    // gets called 1) row count changed 2) cache purged 3) items inserted
    FullStore.prototype.fireStoreUpdatedEvent = function () {
        // this results in row model firing ModelUpdated.
        // server side row model also updates the row indexes first
        var event = {
            type: Events.EVENT_STORE_UPDATED
        };
        this.eventService.dispatchEvent(event);
    };
    FullStore.prototype.getRowCount = function () {
        return this.nodesAfterSort.length;
    };
    FullStore.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        var rowNode = this.nodesAfterSort[topLevelIndex];
        return rowNode.rowIndex;
    };
    FullStore.prototype.isLastRowIndexKnown = function () {
        return this.getState() == RowNodeBlock.STATE_LOADED;
    };
    FullStore.prototype.getRowNodesInRange = function (firstInRange, lastInRange) {
        var result = [];
        var inActiveRange = false;
        // if only one node passed, we start the selection at the top
        if (_.missing(firstInRange)) {
            inActiveRange = true;
        }
        this.nodesAfterSort.forEach(function (rowNode) {
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
    FullStore.prototype.getStoreBounds = function () {
        return {
            topPx: this.topPx,
            heightPx: this.heightPx,
        };
    };
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
    return FullStore;
}(RowNodeBlock));
export { FullStore };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVsbFN0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3NlcnZlclNpZGVSb3dNb2RlbC9zdG9yZXMvZnVsbFN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsU0FBUyxFQUdULE1BQU0sRUFJTixjQUFjLEVBQ2QsYUFBYSxFQUNiLFVBQVUsRUFHVixZQUFZLEVBUVosaUNBQWlDLEVBUXBDLE1BQU0seUJBQXlCLENBQUM7QUFPakM7SUFBK0IsNkJBQVk7SUEwQ3ZDLG1CQUFZLFVBQXNCLEVBQUUsV0FBdUMsRUFBRSxhQUFzQjtRQUFuRztRQUNJLDhGQUE4RjtRQUM5RixrQkFBTSxDQUFDLENBQUMsU0FNWDtRQS9CTyxvQkFBYyxHQUFtQixJQUFJLGNBQWMsRUFBRSxDQUFDO1FBcUJ0RCxVQUFJLEdBQVEsRUFBRSxDQUFDO1FBS25CLEtBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLEtBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBQ25DLEtBQUksQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDckMsS0FBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDcEcsS0FBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsS0FBSyxLQUFLLFVBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDOztJQUN6RyxDQUFDO0lBR08saUNBQWEsR0FBckI7UUFEQSxpQkFzQkM7UUFwQkcsSUFBSSxDQUFDLGFB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