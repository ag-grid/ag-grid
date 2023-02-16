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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullStore = void 0;
var core_1 = require("@ag-grid-community/core");
var FullStore = /** @class */ (function (_super) {
    __extends(FullStore, _super);
    function FullStore(ssrmParams, storeParams, parentRowNode) {
        var _this = 
        // finite block represents a cache with just one block, thus 0 is the id, it's the first block
        _super.call(this, 0) || this;
        _this.nodeIdSequence = new core_1.NumberSequence();
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
            core_1._.doOnce(function () { return console.warn(message_1, params); }, 'FullStore.noData');
        }
        this.createOrRecycleNodes(nodesToRecycle, params.rowData);
        if (nodesToRecycle) {
            this.blockUtils.destroyRowNodes(core_1._.getAllValuesInObject(nodesToRecycle));
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
            var getRowIdFunc = _this.gridOptionsService.getRowIdFunc();
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
        var serverIsFiltering = this.storeUtils.isServerSideFilterAllLevels() || this.storeUtils.isServerSideFilterOnServer();
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
        if (sequence === void 0) { sequence = new core_1.NumberSequence(); }
        callback(this, sequence.next());
        this.allRowNodes.forEach(function (rowNode) {
            var childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachStoreDeep(callback, sequence);
            }
        });
    };
    FullStore.prototype.forEachNodeDeep = function (callback, sequence) {
        if (sequence === void 0) { sequence = new core_1.NumberSequence(); }
        this.allRowNodes.forEach(function (rowNode) {
            callback(rowNode, sequence.next());
            var childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeep(callback, sequence);
            }
        });
    };
    FullStore.prototype.forEachNodeDeepAfterFilterAndSort = function (callback, sequence) {
        if (sequence === void 0) { sequence = new core_1.NumberSequence(); }
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
        var serverIsFilteringAllLevels = this.storeUtils.isServerSideFilterAllLevels();
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
            case core_1.RowNodeBlock.STATE_FAILED:
                return { status: core_1.ServerSideTransactionResultStatus.StoreLoadingFailed };
            case core_1.RowNodeBlock.STATE_LOADING:
                return { status: core_1.ServerSideTransactionResultStatus.StoreLoading };
            case core_1.RowNodeBlock.STATE_WAITING_TO_LOAD:
                return { status: core_1.ServerSideTransactionResultStatus.StoreWaitingToLoad };
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
        var res = {
            status: core_1.ServerSideTransactionResultStatus.Applied,
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
            nodesToUnselect.forEach(function (rowNode) {
                rowNode.setSelected(false, false, true, 'rowDataChanged');
            });
            var event_1 = {
                type: core_1.Events.EVENT_SELECTION_CHANGED,
                source: 'rowDataChanged'
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    FullStore.prototype.executeAdd = function (rowDataTran, rowNodeTransaction) {
        var _this = this;
        var add = rowDataTran.add, addIndex = rowDataTran.addIndex;
        if (core_1._.missingOrEmpty(add)) {
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
        var getRowIdFunc = this.gridOptionsService.getRowIdFunc();
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
        if (this.getState() === core_1.RowNodeBlock.STATE_FAILED) {
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
            type: core_1.Events.EVENT_STORE_UPDATED
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
        return this.getState() == core_1.RowNodeBlock.STATE_LOADED;
    };
    FullStore.prototype.getRowNodesInRange = function (firstInRange, lastInRange) {
        var result = [];
        var inActiveRange = false;
        // if only one node passed, we start the selection at the top
        if (core_1._.missing(firstInRange)) {
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
    return FullStore;
}(core_1.RowNodeBlock));
exports.FullStore = FullStore;
