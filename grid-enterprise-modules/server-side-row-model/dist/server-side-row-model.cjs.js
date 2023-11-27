/**
          * @ag-grid-enterprise/server-side-row-model - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v31.0.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');
var core$1 = require('@ag-grid-enterprise/core');

var __extends$e = (undefined && undefined.__extends) || (function () {
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
var __decorate$h = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FullStore = /** @class */ (function (_super) {
    __extends$e(FullStore, _super);
    function FullStore(ssrmParams, storeParams, parentRowNode) {
        var _this = 
        // finite block represents a cache with just one block, thus 0 is the id, it's the first block
        _super.call(this, 0) || this;
        _this.nodeIdSequence = new core.NumberSequence();
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
        this.usingTreeData = this.gridOptionsService.get('treeData');
        this.nodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.parentRowNode);
        if (!this.usingTreeData && this.groupLevel) {
            var groupColVo = this.ssrmParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnModel.getRowGroupColumns()[this.level];
        }
        var initialRowCount = 1;
        var isRootStore = this.parentRowNode.level === -1;
        var userInitialRowCount = this.storeUtils.getServerSideInitialRowCount();
        if (isRootStore && userInitialRowCount != null) {
            initialRowCount = userInitialRowCount;
        }
        this.initialiseRowNodes(initialRowCount);
        this.rowNodeBlockLoader.addBlock(this);
        this.addDestroyFunc(function () { return _this.rowNodeBlockLoader.removeBlock(_this); });
        this.postSortFunc = this.gridOptionsService.getCallback('postSortRows');
        if (userInitialRowCount != null) {
            this.eventService.dispatchEventOnce({
                type: core.Events.EVENT_ROW_COUNT_READY
            });
        }
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
            success: this.success.bind(this, this.getVersion()),
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
            core._.insertIntoArray(this.allRowNodes, rowNode, index);
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
        var info = params.groupLevelInfo;
        if (info) {
            Object.assign(this.info, info);
        }
        if (params.pivotResultFields) {
            this.serverSideRowModel.generateSecondaryColumns(params.pivotResultFields);
        }
        var nodesToRecycle = this.allRowNodes.length > 0 ? this.allNodesMap : undefined;
        this.allRowNodes = [];
        this.nodesAfterSort = [];
        this.nodesAfterFilter = [];
        this.allNodesMap = {};
        if (!params.rowData) {
            core._.warnOnce('"params.data" is missing from Server-Side Row Model success() callback. Please use the "data" attribute. If no data is returned, set an empty list.');
        }
        this.createOrRecycleNodes(nodesToRecycle, params.rowData);
        if (nodesToRecycle) {
            this.blockUtils.destroyRowNodes(core._.getAllValuesInObject(nodesToRecycle));
        }
        if (this.level === 0) {
            this.eventService.dispatchEventOnce({
                type: core.Events.EVENT_ROW_COUNT_READY
            });
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
        if (this.postSortFunc) {
            var params = { nodes: this.nodesAfterSort };
            this.postSortFunc(params);
        }
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
        if (sequence === void 0) { sequence = new core.NumberSequence(); }
        callback(this, sequence.next());
        this.allRowNodes.forEach(function (rowNode) {
            var childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachStoreDeep(callback, sequence);
            }
        });
    };
    FullStore.prototype.forEachNodeDeep = function (callback, sequence) {
        if (sequence === void 0) { sequence = new core.NumberSequence(); }
        this.allRowNodes.forEach(function (rowNode) {
            callback(rowNode, sequence.next());
            var childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeep(callback, sequence);
            }
        });
    };
    FullStore.prototype.forEachNodeDeepAfterFilterAndSort = function (callback, sequence, includeFooterNodes) {
        if (sequence === void 0) { sequence = new core.NumberSequence(); }
        if (includeFooterNodes === void 0) { includeFooterNodes = false; }
        this.nodesAfterSort.forEach(function (rowNode) {
            callback(rowNode, sequence.next());
            var childCache = rowNode.childStore;
            if (childCache) {
                childCache.forEachNodeDeepAfterFilterAndSort(callback, sequence, includeFooterNodes);
            }
        });
        if (includeFooterNodes && this.parentRowNode.sibling) {
            callback(this.parentRowNode.sibling, sequence.next());
        }
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
            case core.RowNodeBlock.STATE_FAILED:
                return { status: core.ServerSideTransactionResultStatus.StoreLoadingFailed };
            case core.RowNodeBlock.STATE_LOADING:
                return { status: core.ServerSideTransactionResultStatus.StoreLoading };
            case core.RowNodeBlock.STATE_WAITING_TO_LOAD:
                return { status: core.ServerSideTransactionResultStatus.StoreWaitingToLoad };
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
                return { status: core.ServerSideTransactionResultStatus.Cancelled };
            }
        }
        var res = {
            status: core.ServerSideTransactionResultStatus.Applied,
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
                type: core.Events.EVENT_SELECTION_CHANGED,
                source: 'rowDataChanged'
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    FullStore.prototype.executeAdd = function (rowDataTran, rowNodeTransaction) {
        var _this = this;
        var add = rowDataTran.add, addIndex = rowDataTran.addIndex;
        if (core._.missingOrEmpty(add)) {
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
                console.error("AG Grid: could not find row id=".concat(id, ", data item was not found for this id"));
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
        if (this.getState() === core.RowNodeBlock.STATE_FAILED) {
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
            type: core.Events.EVENT_STORE_UPDATED
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
        return this.getState() == core.RowNodeBlock.STATE_LOADED;
    };
    FullStore.prototype.getRowNodesInRange = function (firstInRange, lastInRange) {
        var result = [];
        var inActiveRange = false;
        // if only one node passed, we start the selection at the top
        if (core._.missing(firstInRange)) {
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
    __decorate$h([
        core.Autowired('ssrmStoreUtils')
    ], FullStore.prototype, "storeUtils", void 0);
    __decorate$h([
        core.Autowired('ssrmBlockUtils')
    ], FullStore.prototype, "blockUtils", void 0);
    __decorate$h([
        core.Autowired('columnModel')
    ], FullStore.prototype, "columnModel", void 0);
    __decorate$h([
        core.Autowired('rowNodeBlockLoader')
    ], FullStore.prototype, "rowNodeBlockLoader", void 0);
    __decorate$h([
        core.Autowired('rowNodeSorter')
    ], FullStore.prototype, "rowNodeSorter", void 0);
    __decorate$h([
        core.Autowired('sortController')
    ], FullStore.prototype, "sortController", void 0);
    __decorate$h([
        core.Autowired('selectionService')
    ], FullStore.prototype, "selectionService", void 0);
    __decorate$h([
        core.Autowired('ssrmNodeManager')
    ], FullStore.prototype, "nodeManager", void 0);
    __decorate$h([
        core.Autowired('filterManager')
    ], FullStore.prototype, "filterManager", void 0);
    __decorate$h([
        core.Autowired('ssrmTransactionManager')
    ], FullStore.prototype, "transactionManager", void 0);
    __decorate$h([
        core.Autowired('rowModel')
    ], FullStore.prototype, "serverSideRowModel", void 0);
    __decorate$h([
        core.PostConstruct
    ], FullStore.prototype, "postConstruct", null);
    __decorate$h([
        core.PreDestroy
    ], FullStore.prototype, "destroyRowNodes", null);
    return FullStore;
}(core.RowNodeBlock));

var __extends$d = (undefined && undefined.__extends) || (function () {
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
var __decorate$g = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read$5 = (undefined && undefined.__read) || function (o, n) {
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
var LazyBlockLoader = /** @class */ (function (_super) {
    __extends$d(LazyBlockLoader, _super);
    function LazyBlockLoader(cache, parentNode, storeParams) {
        var _this = _super.call(this) || this;
        _this.loadingNodes = new Set();
        _this.checkForLoadQueued = false;
        _this.loaderTimeout = undefined;
        _this.nextBlockToLoad = undefined;
        _this.parentNode = parentNode;
        _this.cache = cache;
        _this.storeParams = storeParams;
        return _this;
    }
    LazyBlockLoader.prototype.init = function () {
        var _this = this;
        this.addManagedListener(this.rowNodeBlockLoader, core.RowNodeBlockLoader.BLOCK_LOADED_EVENT, function () { return _this.queueLoadAction(); });
    };
    LazyBlockLoader.prototype.isRowLoading = function (index) {
        return this.loadingNodes.has(index);
    };
    LazyBlockLoader.prototype.getBlockToLoad = function () {
        var _this = this;
        var _a;
        var firstRowInViewport = this.api.getFirstDisplayedRow();
        var lastRowInViewport = this.api.getLastDisplayedRow();
        // quick look-up for priority rows needing loading in viewport.
        for (var i = firstRowInViewport; i <= lastRowInViewport; i++) {
            var node = this.cache.getNodeCachedByDisplayIndex(i);
            if (!node) {
                // if no row details, ignore, as row hasn't been created
                // and it's too expensive to work out its location here
                continue;
            }
            var lazyNode = this.cache.getNodes().getBy('node', node);
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
        var nodesToRefresh = this.cache.getNodesToRefresh();
        var nodeToRefresh = null;
        var nodeToRefreshDist = Number.MAX_SAFE_INTEGER;
        nodesToRefresh.forEach(function (node) {
            if (node.rowIndex == null) {
                nodeToRefresh = node;
                return;
            }
            if (_this.isRowLoading(node.rowIndex)) {
                return;
            }
            var distToViewportTop = Math.abs(firstRowInViewport - node.rowIndex);
            var distToViewportBottom = Math.abs(node.rowIndex - lastRowInViewport);
            if (distToViewportTop < nodeToRefreshDist) {
                nodeToRefresh = node;
                nodeToRefreshDist = distToViewportTop;
            }
            if (distToViewportBottom < nodeToRefreshDist) {
                nodeToRefresh = node;
                nodeToRefreshDist = distToViewportBottom;
            }
        });
        var lazyIndex = (_a = this.cache.getNodes().getBy('node', nodeToRefresh)) === null || _a === void 0 ? void 0 : _a.index;
        return lazyIndex == null ? undefined : this.getBlockStartIndexForIndex(lazyIndex);
    };
    LazyBlockLoader.prototype.reset = function () {
        this.loadingNodes.clear();
        clearTimeout(this.loaderTimeout);
        this.loaderTimeout = undefined;
    };
    LazyBlockLoader.prototype.executeLoad = function (startRow, endRow) {
        var _this = this;
        var _a;
        var ssrmParams = this.cache.getSsrmParams();
        var request = {
            startRow: startRow,
            endRow: endRow,
            rowGroupCols: ssrmParams.rowGroupCols,
            valueCols: ssrmParams.valueCols,
            pivotCols: ssrmParams.pivotCols,
            pivotMode: ssrmParams.pivotMode,
            groupKeys: this.parentNode.getGroupKeys(),
            filterModel: ssrmParams.filterModel,
            sortModel: ssrmParams.sortModel,
        };
        var removeNodesFromLoadingMap = function () {
            for (var i = 0; i < endRow - startRow; i++) {
                _this.loadingNodes.delete(startRow + i);
            }
        };
        var addNodesToLoadingMap = function () {
            for (var i = 0; i < endRow - startRow; i++) {
                _this.loadingNodes.add(startRow + i);
            }
        };
        var success = function (params) {
            _this.rowNodeBlockLoader.loadComplete();
            _this.cache.onLoadSuccess(startRow, endRow - startRow, params);
            removeNodesFromLoadingMap();
            _this.queueLoadAction();
        };
        var fail = function () {
            _this.rowNodeBlockLoader.loadComplete();
            _this.cache.onLoadFailed(startRow, endRow - startRow);
            removeNodesFromLoadingMap();
            _this.queueLoadAction();
        };
        var params = {
            request: request,
            success: success,
            fail: fail,
            parentNode: this.parentNode,
            api: this.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context
        };
        addNodesToLoadingMap();
        (_a = this.cache.getSsrmParams().datasource) === null || _a === void 0 ? void 0 : _a.getRows(params);
    };
    LazyBlockLoader.prototype.getNextBlockToLoad = function () {
        var result = this.getBlockToLoad();
        if (result != null) {
            return [String(result), result + this.getBlockSize()];
        }
        return null;
    };
    LazyBlockLoader.prototype.queueLoadCheck = function () {
        var _this = this;
        // already going to check next cycle, ignore.
        if (this.checkForLoadQueued) {
            return;
        }
        this.checkForLoadQueued = true;
        window.queueMicrotask(function () {
            _this.checkForLoadQueued = false;
            _this.queueLoadAction();
        });
    };
    LazyBlockLoader.prototype.queueLoadAction = function () {
        var _this = this;
        var nextBlockToLoad = this.getNextBlockToLoad();
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
            var _a = __read$5(this.nextBlockToLoad, 2), startRowString = _a[0], endRow_1 = _a[1];
            var startRow_1 = Number(startRowString);
            this.loaderTimeout = window.setTimeout(function () {
                if (!_this.cache.isAlive()) {
                    return;
                }
                _this.loaderTimeout = undefined;
                _this.attemptLoad(startRow_1, endRow_1);
                _this.nextBlockToLoad = undefined;
            }, this.gridOptionsService.get('blockLoadDebounceMillis'));
        }
    };
    LazyBlockLoader.prototype.attemptLoad = function (start, end) {
        var availableLoadingCount = this.rowNodeBlockLoader.getAvailableLoadingCount();
        // too many loads already, ignore the request as a successful request will requeue itself anyway
        if (availableLoadingCount != null && availableLoadingCount === 0) {
            return;
        }
        this.rowNodeBlockLoader.registerLoads(1);
        this.executeLoad(start, end);
        this.queueLoadAction();
    };
    LazyBlockLoader.prototype.getBlockSize = function () {
        return this.storeParams.cacheBlockSize || LazyBlockLoader.DEFAULT_BLOCK_SIZE;
    };
    LazyBlockLoader.prototype.getBlockStartIndexForIndex = function (storeIndex) {
        var blockSize = this.getBlockSize();
        return storeIndex - (storeIndex % blockSize);
    };
    LazyBlockLoader.prototype.getBlockBoundsForIndex = function (storeIndex) {
        var startOfBlock = this.getBlockStartIndexForIndex(storeIndex);
        var blockSize = this.getBlockSize();
        return [startOfBlock, startOfBlock + blockSize];
    };
    LazyBlockLoader.DEFAULT_BLOCK_SIZE = 100;
    __decorate$g([
        core.Autowired('gridApi')
    ], LazyBlockLoader.prototype, "api", void 0);
    __decorate$g([
        core.Autowired('rowNodeBlockLoader')
    ], LazyBlockLoader.prototype, "rowNodeBlockLoader", void 0);
    __decorate$g([
        core.PostConstruct
    ], LazyBlockLoader.prototype, "init", null);
    return LazyBlockLoader;
}(core.BeanStub));

var MultiIndexMap = /** @class */ (function () {
    function MultiIndexMap() {
        var indexes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            indexes[_i] = arguments[_i];
        }
        if (indexes.length < 1) {
            throw new Error('AG Grid: At least one index must be provided.');
        }
        this.indexes = indexes;
        this.maps = new Map(this.indexes.map(function (index) { return [index, new Map()]; }));
    }
    MultiIndexMap.prototype.getBy = function (index, key) {
        var map = this.maps.get(index);
        if (!map) {
            throw new Error("AG Grid: ".concat(String(index), " not found"));
        }
        return map.get(key);
    };
    MultiIndexMap.prototype.set = function (item) {
        var _this = this;
        this.indexes.forEach(function (index) {
            var map = _this.maps.get(index);
            if (!map) {
                throw new Error("AG Grid: ".concat(String(index), " not found"));
            }
            map.set(item[index], item);
        });
    };
    MultiIndexMap.prototype.delete = function (item) {
        var _this = this;
        this.indexes.forEach(function (index) {
            var map = _this.maps.get(index);
            if (!map) {
                throw new Error("AG Grid: ".concat(String(index), " not found"));
            }
            map.delete(item[index]);
        });
    };
    MultiIndexMap.prototype.clear = function () {
        this.maps.forEach(function (map) { return map.clear(); });
    };
    MultiIndexMap.prototype.getIterator = function (index) {
        var map = this.maps.get(index);
        if (!map) {
            throw new Error("AG Grid: ".concat(String(index), " not found"));
        }
        return map.values();
    };
    MultiIndexMap.prototype.forEach = function (callback) {
        var iterator = this.getIterator(this.indexes[0]);
        var pointer;
        while (pointer = iterator.next()) {
            if (pointer.done)
                break;
            callback(pointer.value);
        }
    };
    MultiIndexMap.prototype.find = function (callback) {
        var iterator = this.getIterator(this.indexes[0]);
        var pointer;
        while (pointer = iterator.next()) {
            if (pointer.done)
                break;
            if (callback(pointer.value)) {
                return pointer.value;
            }
        }
    };
    MultiIndexMap.prototype.filter = function (predicate) {
        var iterator = this.getIterator(this.indexes[0]);
        var pointer;
        var result = [];
        while (pointer = iterator.next()) {
            if (pointer.done)
                break;
            if (predicate(pointer.value)) {
                result.push(pointer.value);
            }
        }
        return result;
    };
    return MultiIndexMap;
}());

var __extends$c = (undefined && undefined.__extends) || (function () {
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
var __decorate$f = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read$4 = (undefined && undefined.__read) || function (o, n) {
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
var __spreadArray$3 = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var LazyCache = /** @class */ (function (_super) {
    __extends$c(LazyCache, _super);
    function LazyCache(store, numberOfRows, storeParams) {
        var _this = _super.call(this) || this;
        /**
         * Indicates whether this is still the live dataset for this store (used for ignoring old requests after purge)
         */
        _this.live = true;
        /**
         * A cache of removed group nodes, this is retained for preserving group
         * state when the node moves in and out of the cache. Generally caused by
         * rows moving blocks.
         */
        _this.removedNodeCache = new Map();
        _this.store = store;
        _this.numberOfRows = numberOfRows;
        _this.isLastRowKnown = false;
        _this.storeParams = storeParams;
        return _this;
    }
    LazyCache.prototype.init = function () {
        // initiate the node map to be indexed at 'index', 'id' and 'node' for quick look-up.
        // it's important id isn't first, as stub nodes overwrite each-other, and the first index is
        // used for iteration.
        this.nodeMap = new MultiIndexMap('index', 'id', 'node');
        this.nodeDisplayIndexMap = new Map();
        this.nodesToRefresh = new Set();
        this.defaultNodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.store.getParentNode());
        this.rowLoader = this.createManagedBean(new LazyBlockLoader(this, this.store.getParentNode(), this.storeParams));
        this.getRowIdFunc = this.gridOptionsService.getCallback('getRowId');
        this.isMasterDetail = this.gridOptionsService.get('masterDetail');
    };
    LazyCache.prototype.destroyRowNodes = function () {
        var _this = this;
        this.numberOfRows = 0;
        this.nodeMap.forEach(function (node) { return _this.blockUtils.destroyRowNode(node.node); });
        this.nodeMap.clear();
        this.nodeDisplayIndexMap.clear();
        this.nodesToRefresh.clear();
        this.live = false;
    };
    /**
     * Get the row node for a specific display index from this store
     * @param displayIndex the display index of the node to find
     * @returns undefined if the node is not in the store bounds, otherwise will always return a node
     */
    LazyCache.prototype.getRowByDisplayIndex = function (displayIndex) {
        var _a, _b, _c, _d;
        // if index isn't in store, nothing to return
        if (!this.store.isDisplayIndexInStore(displayIndex)) {
            return undefined;
        }
        // first try to directly look this node up in the display index map
        var node = this.nodeDisplayIndexMap.get(displayIndex);
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
        var contiguouslyPreviousNode = this.nodeDisplayIndexMap.get(displayIndex - 1);
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
            var lazyCacheNode = this.nodeMap.getBy('node', contiguouslyPreviousNode);
            return this.createStubNode(lazyCacheNode.index + 1, displayIndex);
        }
        var adjacentNodes = this.getSurroundingNodesByDisplayIndex(displayIndex);
        // if no bounds skipped includes this, calculate from end index
        if (adjacentNodes == null) {
            var storeIndexFromEndIndex_1 = this.store.getRowCount() - (this.store.getDisplayIndexEnd() - displayIndex);
            return this.createStubNode(storeIndexFromEndIndex_1, displayIndex);
        }
        var previousNode = adjacentNodes.previousNode, nextNode = adjacentNodes.nextNode;
        // if the node before this node is expanded, this node might be a child of that node
        if (previousNode && previousNode.node.expanded && ((_c = previousNode.node.childStore) === null || _c === void 0 ? void 0 : _c.isDisplayIndexInStore(displayIndex))) {
            return (_d = previousNode.node.childStore) === null || _d === void 0 ? void 0 : _d.getRowUsingDisplayIndex(displayIndex);
        }
        // if we have the node after this node, we can calculate the store index of this node by the difference
        // in display indexes between the two nodes.
        if (nextNode) {
            var displayIndexDiff = nextNode.node.rowIndex - displayIndex;
            var newStoreIndex = nextNode.index - displayIndexDiff;
            return this.createStubNode(newStoreIndex, displayIndex);
        }
        // if no next node, calculate from end index of this store
        var storeIndexFromEndIndex = this.store.getRowCount() - (this.store.getDisplayIndexEnd() - displayIndex);
        return this.createStubNode(storeIndexFromEndIndex, displayIndex);
    };
    /**
     * Used for creating and positioning a stub node without firing a store updated event
     */
    LazyCache.prototype.createStubNode = function (storeIndex, displayIndex) {
        var _this = this;
        // bounds are acquired before creating the node, as otherwise it'll use it's own empty self to calculate
        var rowBounds = this.store.getRowBounds(displayIndex);
        var newNode = this.createRowAtIndex(storeIndex, null, function (node) {
            node.setRowIndex(displayIndex);
            node.setRowTop(rowBounds.rowTop);
            _this.nodeDisplayIndexMap.set(displayIndex, node);
        });
        this.rowLoader.queueLoadCheck();
        return newNode;
    };
    /**
     * @param index The row index relative to this store
     * @returns A rowNode at the given store index
     */
    LazyCache.prototype.getRowByStoreIndex = function (index) {
        var _a;
        return (_a = this.nodeMap.getBy('index', index)) === null || _a === void 0 ? void 0 : _a.node;
    };
    /**
     * Given a number of rows, skips through the given sequence & row top reference (using default row height)
     * @param numberOfRowsToSkip number of rows to skip over in the given sequence
     * @param displayIndexSeq the sequence in which to skip
     * @param nextRowTop the row top reference in which to skip
     */
    LazyCache.prototype.skipDisplayIndexes = function (numberOfRowsToSkip, displayIndexSeq, nextRowTop) {
        if (numberOfRowsToSkip === 0) {
            return;
        }
        var defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        displayIndexSeq.skip(numberOfRowsToSkip);
        nextRowTop.value += numberOfRowsToSkip * defaultRowHeight;
    };
    /**
     * @param displayIndexSeq the number sequence for generating the display index of each row
     * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
     */
    LazyCache.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
        // Create a map of display index nodes for access speed
        this.nodeDisplayIndexMap.clear();
        // create an object indexed by store index, as this will sort all of the nodes when we iterate
        // the object
        var orderedMap = {};
        this.nodeMap.forEach(function (lazyNode) {
            orderedMap[lazyNode.index] = lazyNode.node;
        });
        var lastIndex = -1;
        // iterate over the nodes in order, setting the display index on each node.
        for (var stringIndex in orderedMap) {
            var node = orderedMap[stringIndex];
            var numericIndex = Number(stringIndex);
            // if any nodes aren't currently in the store, skip the display indexes too
            var numberOfRowsToSkip_1 = (numericIndex - 1) - lastIndex;
            this.skipDisplayIndexes(numberOfRowsToSkip_1, displayIndexSeq, nextRowTop);
            // set this nodes index and row top
            this.blockUtils.setDisplayIndex(node, displayIndexSeq, nextRowTop);
            this.nodeDisplayIndexMap.set(node.rowIndex, node);
            // store this index for skipping after this
            lastIndex = numericIndex;
        }
        // need to skip rows until the end of this store
        var numberOfRowsToSkip = (this.numberOfRows - 1) - lastIndex;
        this.skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop);
        // this is not terribly efficient, and could probs be improved
        this.purgeExcessRows();
    };
    LazyCache.prototype.getRowCount = function () {
        return this.numberOfRows;
    };
    LazyCache.prototype.setRowCount = function (rowCount, isLastRowIndexKnown) {
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
    };
    LazyCache.prototype.getNodes = function () {
        return this.nodeMap;
    };
    LazyCache.prototype.getNodeCachedByDisplayIndex = function (displayIndex) {
        var _a;
        return (_a = this.nodeDisplayIndexMap.get(displayIndex)) !== null && _a !== void 0 ? _a : null;
    };
    LazyCache.prototype.getNodesToRefresh = function () {
        return this.nodesToRefresh;
    };
    /**
     * @returns the previous and next loaded row nodes surrounding the given display index
     */
    LazyCache.prototype.getSurroundingNodesByDisplayIndex = function (displayIndex) {
        var nextNode;
        var previousNode;
        this.nodeMap.forEach(function (lazyNode) {
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
        return { previousNode: previousNode, nextNode: nextNode };
    };
    /**
     * Get or calculate the display index for a given store index
     * @param storeIndex the rows index within this store
     * @returns the rows visible display index relative to the grid
     */
    LazyCache.prototype.getDisplayIndexFromStoreIndex = function (storeIndex) {
        var _a, _b;
        var nodeAtIndex = this.nodeMap.getBy('index', storeIndex);
        if (nodeAtIndex) {
            return nodeAtIndex.node.rowIndex;
        }
        var nextNode;
        var previousNode;
        this.nodeMap.forEach(function (lazyNode) {
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
        var storeIndexDiff = storeIndex - previousNode.index;
        var previousDisplayIndex = ((_b = (_a = previousNode.node.childStore) === null || _a === void 0 ? void 0 : _a.getDisplayIndexEnd()) !== null && _b !== void 0 ? _b : previousNode.node.rowIndex);
        return previousDisplayIndex + storeIndexDiff;
    };
    /**
     * Creates a new row and inserts it at the given index
     * @param atStoreIndex the node index relative to this store
     * @param data the data object to populate the node with
     * @returns the new row node
     */
    LazyCache.prototype.createRowAtIndex = function (atStoreIndex, data, createNodeCallback) {
        var _a, _b;
        // make sure an existing node isn't being overwritten
        var lazyNode = this.nodeMap.getBy('index', atStoreIndex);
        // if node already exists, update it or destroy it
        if (lazyNode) {
            var node = lazyNode.node;
            node.__needsRefreshWhenVisible = false;
            // if the node is the same, just update the content
            if (this.doesNodeMatch(data, node)) {
                this.blockUtils.updateDataIntoRowNode(node, data);
                this.nodesToRefresh.delete(node);
                return node;
            }
            // if there's no id and this is an open group, protect this node from changes
            // hasChildren also checks for tree data and master detail
            if (this.getRowIdFunc == null && node.hasChildren() && node.expanded) {
                this.nodesToRefresh.delete(node);
                return node;
            }
            // destroy the old node, might be worth caching state here
            this.destroyRowAtIndex(atStoreIndex);
        }
        // if the node already exists elsewhere, update it and move it to the new location
        if (data && this.getRowIdFunc != null) {
            var id = this.getRowId(data);
            // the node was deleted at some point, but as we're refreshing
            // it's been cached and we can retrieve it for reuse.
            var deletedNode = id && ((_a = this.removedNodeCache) === null || _a === void 0 ? void 0 : _a.get(id));
            if (deletedNode) {
                (_b = this.removedNodeCache) === null || _b === void 0 ? void 0 : _b.delete(id);
                this.blockUtils.updateDataIntoRowNode(deletedNode, data);
                this.nodeMap.set({
                    id: deletedNode.id,
                    node: deletedNode,
                    index: atStoreIndex
                });
                return deletedNode;
            }
            var lazyNode_1 = this.nodeMap.getBy('id', id);
            if (lazyNode_1) {
                // delete old lazy node so we can insert it at different location
                this.nodeMap.delete(lazyNode_1);
                var node = lazyNode_1.node, index = lazyNode_1.index;
                this.blockUtils.updateDataIntoRowNode(node, data);
                this.nodeMap.set({
                    id: node.id,
                    node: node,
                    index: atStoreIndex
                });
                this.nodesToRefresh.delete(node);
                if (this.rowLoader.getBlockStartIndexForIndex(index) === this.rowLoader.getBlockStartIndexForIndex(atStoreIndex)) {
                    // if the block hasn't changed and we have a nodes map, we don't need to refresh the original block, as this block
                    // has just been refreshed.
                    return node;
                }
                // mark all of the old block as needsVerify to trigger it for a refresh, as nodes
                // should not be out of place
                this.markBlockForVerify(index);
                return node;
            }
        }
        // node doesn't exist, create a new one
        var newNode = this.blockUtils.createRowNode(this.store.getRowDetails());
        if (data != null) {
            var defaultId = this.getPrefixedId(this.store.getIdSequence().next());
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
    };
    LazyCache.prototype.getBlockStates = function () {
        var _this = this;
        var blockCounts = {};
        var blockStates = {};
        this.nodeMap.forEach(function (_a) {
            var _b;
            var node = _a.node, index = _a.index;
            var blockStart = _this.rowLoader.getBlockStartIndexForIndex(index);
            if (!node.stub && !node.failedLoad) {
                blockCounts[blockStart] = ((_b = blockCounts[blockStart]) !== null && _b !== void 0 ? _b : 0) + 1;
            }
            var rowState = 'loaded';
            if (node.failedLoad) {
                rowState = 'failed';
            }
            else if (_this.rowLoader.isRowLoading(blockStart)) {
                rowState = 'loading';
            }
            else if (_this.nodesToRefresh.has(node) || node.stub) {
                rowState = 'needsLoading';
            }
            if (!blockStates[blockStart]) {
                blockStates[blockStart] = new Set();
            }
            blockStates[blockStart].add(rowState);
        });
        var statePriorityMap = {
            loading: 4,
            failed: 3,
            needsLoading: 2,
            loaded: 1,
        };
        var blockPrefix = this.blockUtils.createNodeIdPrefix(this.store.getParentNode());
        var results = {};
        Object.entries(blockStates).forEach(function (_a) {
            var _b;
            var _c = __read$4(_a, 2), blockStart = _c[0], uniqueStates = _c[1];
            var sortedStates = __spreadArray$3([], __read$4(uniqueStates), false).sort(function (a, b) { var _a, _b; return ((_a = statePriorityMap[a]) !== null && _a !== void 0 ? _a : 0) - ((_b = statePriorityMap[b]) !== null && _b !== void 0 ? _b : 0); });
            var priorityState = sortedStates[0];
            var blockNumber = Number(blockStart) / _this.rowLoader.getBlockSize();
            var blockId = blockPrefix ? "".concat(blockPrefix, "-").concat(blockNumber) : String(blockNumber);
            results[blockId] = {
                blockNumber: blockNumber,
                startRow: Number(blockStart),
                endRow: Number(blockStart) + _this.rowLoader.getBlockSize(),
                pageStatus: priorityState,
                loadedRowCount: (_b = blockCounts[blockStart]) !== null && _b !== void 0 ? _b : 0,
            };
        });
        return results;
    };
    LazyCache.prototype.destroyRowAtIndex = function (atStoreIndex) {
        var lazyNode = this.nodeMap.getBy('index', atStoreIndex);
        if (!lazyNode) {
            return;
        }
        this.nodeMap.delete(lazyNode);
        this.nodeDisplayIndexMap.delete(lazyNode.node.rowIndex);
        if (lazyNode.node.hasChildren() && this.nodesToRefresh.size > 0) {
            // while refreshing, we retain the group nodes so they can be moved
            // without losing state
            this.removedNodeCache.set(lazyNode.node.id, lazyNode.node);
        }
        else {
            this.blockUtils.destroyRowNode(lazyNode.node);
        }
        this.nodesToRefresh.delete(lazyNode.node);
    };
    LazyCache.prototype.getSsrmParams = function () {
        return this.store.getSsrmParams();
    };
    /**
     * @param id the base id to be prefixed
     * @returns a node id with prefix if required
     */
    LazyCache.prototype.getPrefixedId = function (id) {
        if (this.defaultNodeIdPrefix) {
            return this.defaultNodeIdPrefix + '-' + id;
        }
        else {
            return id.toString();
        }
    };
    LazyCache.prototype.markBlockForVerify = function (rowIndex) {
        var _a = __read$4(this.rowLoader.getBlockBoundsForIndex(rowIndex), 2), start = _a[0], end = _a[1];
        var lazyNodesInRange = this.nodeMap.filter(function (lazyNode) { return lazyNode.index >= start && lazyNode.index < end; });
        lazyNodesInRange.forEach(function (_a) {
            var node = _a.node;
            node.__needsRefreshWhenVisible = true;
        });
    };
    LazyCache.prototype.doesNodeMatch = function (data, node) {
        if (node.stub) {
            return false;
        }
        if (this.getRowIdFunc != null) {
            var id = this.getRowId(data);
            return node.id === id;
        }
        return node.data === data;
    };
    /**
     * Deletes any stub nodes not within the given range
     */
    LazyCache.prototype.purgeStubsOutsideOfViewport = function () {
        var _this = this;
        var firstRow = this.api.getFirstDisplayedRow();
        var lastRow = this.api.getLastDisplayedRow();
        var firstRowBlockStart = this.rowLoader.getBlockStartIndexForIndex(firstRow);
        var _a = __read$4(this.rowLoader.getBlockBoundsForIndex(lastRow), 2); _a[0]; var lastRowBlockEnd = _a[1];
        this.nodeMap.forEach(function (lazyNode) {
            // failed loads are still useful, so we don't purge them
            if (_this.rowLoader.isRowLoading(lazyNode.index) || lazyNode.node.failedLoad) {
                return;
            }
            if (lazyNode.node.stub && (lazyNode.index < firstRowBlockStart || lazyNode.index > lastRowBlockEnd)) {
                _this.destroyRowAtIndex(lazyNode.index);
            }
        });
    };
    LazyCache.prototype.getBlocksDistanceFromRow = function (nodes, otherDisplayIndex) {
        var _this = this;
        var blockDistanceToMiddle = {};
        nodes.forEach(function (_a) {
            var node = _a.node, index = _a.index;
            var _b = __read$4(_this.rowLoader.getBlockBoundsForIndex(index), 2), blockStart = _b[0], blockEnd = _b[1];
            if (blockStart in blockDistanceToMiddle) {
                return;
            }
            var distStart = Math.abs(node.rowIndex - otherDisplayIndex);
            var distEnd;
            // may not have an end node if the block came back small 
            var lastLazyNode = _this.nodeMap.getBy('index', [blockEnd - 1]);
            if (lastLazyNode)
                distEnd = Math.abs(lastLazyNode.node.rowIndex - otherDisplayIndex);
            var farthest = distEnd == null || distStart < distEnd ? distStart : distEnd;
            blockDistanceToMiddle[blockStart] = farthest;
        });
        return Object.entries(blockDistanceToMiddle);
    };
    LazyCache.prototype.purgeExcessRows = function () {
        var _this = this;
        var _a;
        // Delete all stub nodes which aren't in the viewport or already loading
        this.purgeStubsOutsideOfViewport();
        if (this.store.getDisplayIndexEnd() == null || this.storeParams.maxBlocksInCache == null) {
            // if group is collapsed, or max blocks missing, ignore the event
            return;
        }
        var firstRowInViewport = this.api.getFirstDisplayedRow();
        var lastRowInViewport = this.api.getLastDisplayedRow();
        // the start storeIndex of every block in this store
        var allLoadedBlocks = new Set();
        // the start storeIndex of every displayed block in this store
        var blocksInViewport = new Set();
        this.nodeMap.forEach(function (_a) {
            var index = _a.index, node = _a.node;
            var blockStart = _this.rowLoader.getBlockStartIndexForIndex(index);
            allLoadedBlocks.add(blockStart);
            var isInViewport = node.rowIndex >= firstRowInViewport && node.rowIndex <= lastRowInViewport;
            if (isInViewport) {
                blocksInViewport.add(blockStart);
            }
        });
        // if the viewport is larger than the max blocks, then the viewport size is minimum cache size
        var numberOfBlocksToRetain = Math.max(blocksInViewport.size, (_a = this.storeParams.maxBlocksInCache) !== null && _a !== void 0 ? _a : 0);
        // ensure there is blocks that can be removed
        var loadedBlockCount = allLoadedBlocks.size;
        var blocksToRemove = loadedBlockCount - numberOfBlocksToRetain;
        if (blocksToRemove <= 0) {
            return;
        }
        // the first and last block in the viewport
        var firstRowBlockStart = Number.MAX_SAFE_INTEGER;
        var lastRowBlockStart = Number.MIN_SAFE_INTEGER;
        blocksInViewport.forEach(function (blockStart) {
            if (firstRowBlockStart > blockStart) {
                firstRowBlockStart = blockStart;
            }
            if (lastRowBlockStart < blockStart) {
                lastRowBlockStart = blockStart;
            }
        });
        // all nodes which aren't cached or in the viewport, and so can be removed
        var disposableNodes = this.nodeMap.filter(function (_a) {
            var node = _a.node, index = _a.index;
            var rowBlockStart = _this.rowLoader.getBlockStartIndexForIndex(index);
            var rowBlockInViewport = rowBlockStart >= firstRowBlockStart && rowBlockStart <= lastRowBlockStart;
            return !rowBlockInViewport && !_this.isNodeCached(node);
        });
        if (disposableNodes.length === 0) {
            return;
        }
        var midViewportRow = firstRowInViewport + ((lastRowInViewport - firstRowInViewport) / 2);
        var blockDistanceArray = this.getBlocksDistanceFromRow(disposableNodes, midViewportRow);
        var blockSize = this.rowLoader.getBlockSize();
        // sort the blocks by distance from middle of viewport
        blockDistanceArray.sort(function (a, b) { return Math.sign(b[1] - a[1]); });
        // remove excess blocks, starting from furthest from viewport
        for (var i = 0; i < Math.min(blocksToRemove, blockDistanceArray.length); i++) {
            var blockStart = Number(blockDistanceArray[i][0]);
            for (var x = blockStart; x < blockStart + blockSize; x++) {
                var lazyNode = this.nodeMap.getBy('index', x);
                if (!lazyNode || this.isNodeCached(lazyNode.node)) {
                    continue;
                }
                this.destroyRowAtIndex(x);
            }
        }
    };
    LazyCache.prototype.isNodeFocused = function (node) {
        var focusedCell = this.focusService.getFocusCellToUseAfterRefresh();
        if (!focusedCell) {
            return false;
        }
        if (focusedCell.rowPinned != null) {
            return false;
        }
        var hasFocus = focusedCell.rowIndex === node.rowIndex;
        return hasFocus;
    };
    LazyCache.prototype.isNodeCached = function (node) {
        return (node.isExpandable() && node.expanded) || this.isNodeFocused(node);
    };
    LazyCache.prototype.extractDuplicateIds = function (rows) {
        var _this = this;
        if (this.getRowIdFunc != null) {
            return [];
        }
        var newIds = new Set();
        var duplicates = new Set();
        rows.forEach(function (data) {
            var id = _this.getRowId(data);
            if (newIds.has(id)) {
                duplicates.add(id);
                return;
            }
            newIds.add(id);
        });
        return __spreadArray$3([], __read$4(duplicates), false);
    };
    LazyCache.prototype.onLoadSuccess = function (firstRowIndex, numberOfRowsExpected, response) {
        var _this = this;
        if (!this.live)
            return;
        var info = response.groupLevelInfo;
        this.store.setStoreInfo(info);
        if (this.getRowIdFunc != null) {
            var duplicates = this.extractDuplicateIds(response.rowData);
            if (duplicates.length > 0) {
                var duplicateIdText = duplicates.join(', ');
                console.warn("AG Grid: Unable to display rows as duplicate row ids (".concat(duplicateIdText, ") were returned by the getRowId callback. Please modify the getRowId callback to provide unique ids."));
                this.onLoadFailed(firstRowIndex, numberOfRowsExpected);
                return;
            }
        }
        if (response.pivotResultFields) {
            this.serverSideRowModel.generateSecondaryColumns(response.pivotResultFields);
        }
        var wasRefreshing = this.nodesToRefresh.size > 0;
        response.rowData.forEach(function (data, responseRowIndex) {
            var _a;
            var rowIndex = firstRowIndex + responseRowIndex;
            var nodeFromCache = _this.nodeMap.getBy('index', rowIndex);
            // if stub, overwrite
            if ((_a = nodeFromCache === null || nodeFromCache === void 0 ? void 0 : nodeFromCache.node) === null || _a === void 0 ? void 0 : _a.stub) {
                _this.createRowAtIndex(rowIndex, data);
                return;
            }
            // node already exists, and same as node at designated position, update data
            if (nodeFromCache && _this.doesNodeMatch(data, nodeFromCache.node)) {
                _this.blockUtils.updateDataIntoRowNode(nodeFromCache.node, data);
                _this.nodesToRefresh.delete(nodeFromCache.node);
                nodeFromCache.node.__needsRefreshWhenVisible = false;
                return;
            }
            // create row will handle deleting the overwritten row
            _this.createRowAtIndex(rowIndex, data);
        });
        var finishedRefreshing = this.nodesToRefresh.size === 0;
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
            var lastInferredRow = firstRowIndex + response.rowData.length + 1;
            if (lastInferredRow > this.numberOfRows) {
                this.numberOfRows = lastInferredRow;
            }
        }
        if (this.isLastRowKnown) {
            // delete any rows after the last index
            var lazyNodesAfterStoreEnd = this.nodeMap.filter(function (lazyNode) { return lazyNode.index >= _this.numberOfRows; });
            lazyNodesAfterStoreEnd.forEach(function (lazyNode) { return _this.destroyRowAtIndex(lazyNode.index); });
        }
        this.fireStoreUpdatedEvent();
    };
    LazyCache.prototype.fireRefreshFinishedEvent = function () {
        var _this = this;
        var finishedRefreshing = this.nodesToRefresh.size === 0;
        // if anything refreshing currently, skip.
        if (!finishedRefreshing) {
            return;
        }
        // any nodes left in the map need to be cleaned up, this prevents us preserving nodes
        // indefinitely
        this.removedNodeCache.forEach(function (node) {
            _this.blockUtils.destroyRowNode(node);
        });
        this.removedNodeCache = new Map();
        this.store.fireRefreshFinishedEvent();
    };
    LazyCache.prototype.isLastRowIndexKnown = function () {
        return this.isLastRowKnown;
    };
    LazyCache.prototype.onLoadFailed = function (firstRowIndex, numberOfRowsExpected) {
        var _a;
        if (!this.live)
            return;
        var wasRefreshing = this.nodesToRefresh.size > 0;
        for (var i = firstRowIndex; i < firstRowIndex + numberOfRowsExpected && i < this.getRowCount(); i++) {
            var node = ((_a = this.nodeMap.getBy('index', i)) !== null && _a !== void 0 ? _a : {}).node;
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
        var finishedRefreshing = this.nodesToRefresh.size === 0;
        if (wasRefreshing && finishedRefreshing) {
            this.fireRefreshFinishedEvent();
        }
        this.fireStoreUpdatedEvent();
    };
    LazyCache.prototype.markNodesForRefresh = function () {
        var _this = this;
        this.nodeMap.forEach(function (lazyNode) {
            if (lazyNode.node.stub && !lazyNode.node.failedLoad) {
                return;
            }
            _this.nodesToRefresh.add(lazyNode.node);
        });
        this.rowLoader.queueLoadCheck();
        if (this.isLastRowKnown && this.numberOfRows === 0) {
            this.numberOfRows = 1;
            this.isLastRowKnown = false;
            this.fireStoreUpdatedEvent();
        }
    };
    LazyCache.prototype.isNodeInCache = function (id) {
        return !!this.nodeMap.getBy('id', id);
    };
    // gets called 1) row count changed 2) cache purged 3) items inserted
    LazyCache.prototype.fireStoreUpdatedEvent = function () {
        if (!this.live) {
            return;
        }
        this.store.fireStoreUpdatedEvent();
    };
    LazyCache.prototype.getRowId = function (data) {
        if (this.getRowIdFunc == null) {
            return null;
        }
        // find rowNode using id
        var level = this.store.getRowDetails().level;
        var parentKeys = this.store.getParentNode().getGroupKeys();
        var id = this.getRowIdFunc({
            data: data,
            parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
            level: level,
        });
        return String(id);
    };
    LazyCache.prototype.updateRowNodes = function (updates) {
        var _this = this;
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Transactions can only be applied when row ids are supplied.');
        }
        var updatedNodes = [];
        updates.forEach(function (data) {
            var id = _this.getRowId(data);
            var lazyNode = _this.nodeMap.getBy('id', id);
            if (lazyNode) {
                _this.blockUtils.updateDataIntoRowNode(lazyNode.node, data);
                updatedNodes.push(lazyNode.node);
            }
        });
        return updatedNodes;
    };
    LazyCache.prototype.insertRowNodes = function (inserts, indexToAdd) {
        var _this = this;
        // adjust row count to allow for footer row
        var realRowCount = this.store.getRowCount() - (this.store.getParentNode().sibling ? 1 : 0);
        // if missing and we know the last row, we're inserting at the end
        var addIndex = indexToAdd == null && this.isLastRowKnown ? realRowCount : indexToAdd;
        // can't insert nodes past the end of the store
        if (addIndex == null || realRowCount < addIndex) {
            return [];
        }
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Transactions can only be applied when row ids are supplied.');
        }
        var uniqueInsertsMap = {};
        inserts.forEach(function (data) {
            var dataId = _this.getRowId(data);
            if (dataId && _this.isNodeInCache(dataId)) {
                return;
            }
            uniqueInsertsMap[dataId] = data;
        });
        var uniqueInserts = Object.values(uniqueInsertsMap);
        var numberOfInserts = uniqueInserts.length;
        if (numberOfInserts === 0) {
            return [];
        }
        var nodesToMove = this.nodeMap.filter(function (node) { return node.index >= addIndex; });
        // delete all nodes which need moved first, so they don't get overwritten
        nodesToMove.forEach(function (lazyNode) { return _this.nodeMap.delete(lazyNode); });
        // then move the nodes to their new locations
        nodesToMove.forEach(function (lazyNode) {
            _this.nodeMap.set({
                node: lazyNode.node,
                index: lazyNode.index + numberOfInserts,
                id: lazyNode.id,
            });
        });
        // increase the store size to accommodate
        this.numberOfRows += numberOfInserts;
        // finally insert the new rows
        return uniqueInserts.map(function (data, uniqueInsertOffset) { return _this.createRowAtIndex(addIndex + uniqueInsertOffset, data); });
    };
    LazyCache.prototype.getOrderedNodeMap = function () {
        var obj = {};
        this.nodeMap.forEach(function (node) { return obj[node.index] = node; });
        return obj;
    };
    LazyCache.prototype.clearDisplayIndexes = function () {
        this.nodeDisplayIndexMap.clear();
    };
    LazyCache.prototype.removeRowNodes = function (idsToRemove) {
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Transactions can only be applied when row ids are supplied.');
        }
        var removedNodes = [];
        var nodesToVerify = [];
        // track how many nodes have been deleted, as when we pass other nodes we need to shift them up
        var deletedNodeCount = 0;
        var remainingIdsToRemove = __spreadArray$3([], __read$4(idsToRemove), false);
        var allNodes = this.getOrderedNodeMap();
        var contiguousIndex = -1;
        var _loop_1 = function (stringIndex) {
            contiguousIndex += 1;
            var node = allNodes[stringIndex];
            // finding the index allows the use of splice which should be slightly faster than both a check and filter
            var matchIndex = remainingIdsToRemove.findIndex(function (idToRemove) { return idToRemove === node.id; });
            if (matchIndex !== -1) {
                // found node, remove it from nodes to remove
                remainingIdsToRemove.splice(matchIndex, 1);
                this_1.destroyRowAtIndex(Number(stringIndex));
                removedNodes.push(node.node);
                deletedNodeCount += 1;
                return "continue";
            }
            // no nodes removed and this node doesn't match, so no need to shift
            if (deletedNodeCount === 0) {
                return "continue";
            }
            var numericStoreIndex = Number(stringIndex);
            if (contiguousIndex !== numericStoreIndex) {
                nodesToVerify.push(node.node);
            }
            // shift normal node up by number of deleted prior to this point
            this_1.nodeMap.delete(allNodes[stringIndex]);
            this_1.nodeMap.set({
                id: node.id,
                node: node.node,
                index: numericStoreIndex - deletedNodeCount,
            });
        };
        var this_1 = this;
        for (var stringIndex in allNodes) {
            _loop_1(stringIndex);
        }
        this.numberOfRows -= this.isLastRowIndexKnown() ? idsToRemove.length : deletedNodeCount;
        if (remainingIdsToRemove.length > 0 && nodesToVerify.length > 0) {
            nodesToVerify.forEach(function (node) { return node.__needsRefreshWhenVisible = true; });
            this.rowLoader.queueLoadCheck();
        }
        return removedNodes;
    };
    __decorate$f([
        core.Autowired('gridApi')
    ], LazyCache.prototype, "api", void 0);
    __decorate$f([
        core.Autowired('ssrmBlockUtils')
    ], LazyCache.prototype, "blockUtils", void 0);
    __decorate$f([
        core.Autowired('focusService')
    ], LazyCache.prototype, "focusService", void 0);
    __decorate$f([
        core.Autowired('ssrmNodeManager')
    ], LazyCache.prototype, "nodeManager", void 0);
    __decorate$f([
        core.Autowired('rowModel')
    ], LazyCache.prototype, "serverSideRowModel", void 0);
    __decorate$f([
        core.PostConstruct
    ], LazyCache.prototype, "init", null);
    __decorate$f([
        core.PreDestroy
    ], LazyCache.prototype, "destroyRowNodes", null);
    return LazyCache;
}(core.BeanStub));

var __extends$b = (undefined && undefined.__extends) || (function () {
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
var __decorate$e = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read$3 = (undefined && undefined.__read) || function (o, n) {
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
var __spreadArray$2 = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var LazyStore = /** @class */ (function (_super) {
    __extends$b(LazyStore, _super);
    function LazyStore(ssrmParams, storeParams, parentRowNode) {
        var _this = _super.call(this) || this;
        _this.idSequence = new core.NumberSequence();
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
                type: core.Events.EVENT_ROW_COUNT_READY
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
                status: core.ServerSideTransactionResultStatus.Cancelled,
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
                return { status: core.ServerSideTransactionResultStatus.Cancelled };
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
            var allUniqueIdsToRemove = __spreadArray$2([], __read$3(new Set(allIdsToRemove)), false);
            removedNodes = this.cache.removeRowNodes(allUniqueIdsToRemove);
        }
        this.updateSelectionAfterTransaction(updatedNodes, removedNodes);
        return {
            status: core.ServerSideTransactionResultStatus.Applied,
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
        if (sequence === void 0) { sequence = new core.NumberSequence(); }
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
        if (sequence === void 0) { sequence = new core.NumberSequence(); }
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
        if (sequence === void 0) { sequence = new core.NumberSequence(); }
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
        // if only one node passed, we start the selection at the top
        if (core._.missing(firstInRange)) ;
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
            type: core.Events.EVENT_STORE_UPDATED
        };
        this.eventService.dispatchEvent(event);
    };
    // gets called when row data updated, and no more refreshing needed
    LazyStore.prototype.fireRefreshFinishedEvent = function () {
        var event = {
            type: core.Events.EVENT_STORE_REFRESHED,
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
    __decorate$e([
        core.Autowired('ssrmBlockUtils')
    ], LazyStore.prototype, "blockUtils", void 0);
    __decorate$e([
        core.Autowired('ssrmStoreUtils')
    ], LazyStore.prototype, "storeUtils", void 0);
    __decorate$e([
        core.Autowired('columnModel')
    ], LazyStore.prototype, "columnModel", void 0);
    __decorate$e([
        core.Autowired('selectionService')
    ], LazyStore.prototype, "selectionService", void 0);
    __decorate$e([
        core.PostConstruct
    ], LazyStore.prototype, "init", null);
    __decorate$e([
        core.PreDestroy
    ], LazyStore.prototype, "destroyRowNodes", null);
    return LazyStore;
}(core.BeanStub));

var __extends$a = (undefined && undefined.__extends) || (function () {
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
var __decorate$d = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read$2 = (undefined && undefined.__read) || function (o, n) {
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
var ServerSideRowModel = /** @class */ (function (_super) {
    __extends$a(ServerSideRowModel, _super);
    function ServerSideRowModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onRowHeightChanged_debounced = core._.debounce(_this.onRowHeightChanged.bind(_this), 100);
        _this.pauseStoreUpdateListening = false;
        _this.started = false;
        _this.managingPivotResultColumns = false;
        return _this;
    }
    // we don't implement as lazy row heights is not supported in this row model
    ServerSideRowModel.prototype.ensureRowHeightsValid = function () { return false; };
    ServerSideRowModel.prototype.start = function () {
        this.started = true;
        this.updateDatasource();
    };
    ServerSideRowModel.prototype.destroyDatasource = function () {
        if (!this.datasource) {
            return;
        }
        if (this.datasource.destroy) {
            this.datasource.destroy();
        }
        this.rowRenderer.datasourceChanged();
        this.datasource = undefined;
    };
    ServerSideRowModel.prototype.addEventListeners = function () {
        var _this = this;
        this.addManagedListener(this.eventService, core.Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnEverything.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_STORE_UPDATED, this.onStoreUpdated.bind(this));
        var resetListener = this.resetRootStore.bind(this);
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_VALUE_CHANGED, resetListener);
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_PIVOT_CHANGED, resetListener);
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, resetListener);
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, resetListener);
        this.addManagedPropertyListeners([
            /**
             * Following properties omitted as they are likely to come with undesired  side effects.
             * 'getRowId', 'isRowMaster', 'getRowHeight', 'isServerSideGroup', 'getServerSideGroupKey',
             * */
            'masterDetail', 'treeData', 'removePivotHeaderRowWhenSingleValueColumn',
            'suppressServerSideInfiniteScroll', 'cacheBlockSize',
        ], resetListener);
        this.addManagedPropertyListener('rowHeight', function () { return _this.resetRowHeights(); });
        this.verifyProps();
        this.addManagedPropertyListener('serverSideDatasource', function () { return _this.updateDatasource(); });
    };
    ServerSideRowModel.prototype.updateDatasource = function () {
        var datasource = this.gridOptionsService.get('serverSideDatasource');
        if (datasource) {
            this.setDatasource(datasource);
        }
    };
    ServerSideRowModel.prototype.verifyProps = function () {
        if (this.gridOptionsService.exists('initialGroupOrderComparator')) {
            core._.warnOnce("initialGroupOrderComparator cannot be used with Server Side Row Model.");
        }
        if (this.gridOptionsService.isRowSelection() && !this.gridOptionsService.exists('getRowId')) {
            core._.warnOnce("getRowId callback must be provided for Server Side Row Model selection to work correctly.");
        }
    };
    ServerSideRowModel.prototype.setDatasource = function (datasource) {
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
    };
    ServerSideRowModel.prototype.applyRowData = function (rowDataParams, startRow, route) {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        var storeToExecuteOn = rootStore.getChildStore(route);
        if (!storeToExecuteOn) {
            return;
        }
        if (storeToExecuteOn instanceof LazyStore) {
            storeToExecuteOn.applyRowData(rowDataParams, startRow, rowDataParams.rowData.length);
        }
        else if (storeToExecuteOn instanceof FullStore) {
            storeToExecuteOn.processServerResult(rowDataParams);
        }
    };
    ServerSideRowModel.prototype.isLastRowIndexKnown = function () {
        var cache = this.getRootStore();
        if (!cache) {
            return false;
        }
        return cache.isLastRowIndexKnown();
    };
    ServerSideRowModel.prototype.onColumnEverything = function () {
        // if first time, always reset
        if (!this.storeParams) {
            this.resetRootStore();
            return;
        }
        // check if anything pertaining to fetching data has changed, and if it has, reset, but if
        // it has not, don't reset
        var rowGroupColumnVos = this.columnsToValueObjects(this.columnModel.getRowGroupColumns());
        var valueColumnVos = this.columnsToValueObjects(this.columnModel.getValueColumns());
        var pivotColumnVos = this.columnsToValueObjects(this.columnModel.getPivotColumns());
        // compares two sets of columns, ensuring no columns have been added or removed (unless specified via allowRemovedColumns)
        // if the columns are found, also ensures the field and aggFunc properties have not been changed.
        var areColsSame = function (params) {
            var oldColsMap = {};
            params.oldCols.forEach(function (col) { return oldColsMap[col.id] = col; });
            var allColsUnchanged = params.newCols.every(function (col) {
                var equivalentCol = oldColsMap[col.id];
                if (equivalentCol) {
                    delete oldColsMap[col.id];
                }
                return equivalentCol && equivalentCol.field === col.field && equivalentCol.aggFunc === col.aggFunc;
            });
            var missingCols = !params.allowRemovedColumns && !!Object.values(oldColsMap).length;
            return allColsUnchanged && !missingCols;
        };
        var sortModelDifferent = !core._.jsonEquals(this.storeParams.sortModel, this.sortController.getSortModel());
        var rowGroupDifferent = !areColsSame({
            oldCols: this.storeParams.rowGroupCols,
            newCols: rowGroupColumnVos,
        });
        var pivotDifferent = !areColsSame({
            oldCols: this.storeParams.pivotCols,
            newCols: pivotColumnVos,
        });
        var valuesDifferent = !!(rowGroupColumnVos === null || rowGroupColumnVos === void 0 ? void 0 : rowGroupColumnVos.length) && !areColsSame({
            oldCols: this.storeParams.valueCols,
            newCols: valueColumnVos,
            allowRemovedColumns: true,
        });
        var resetRequired = sortModelDifferent || rowGroupDifferent || pivotDifferent || valuesDifferent;
        if (resetRequired) {
            this.resetRootStore();
        }
        else {
            // cols may have changed even if we didn't do a reset. storeParams ref will be provided when getRows
            // is called, so it's important to keep it up to date.
            var newParams = this.createStoreParams();
            this.storeParams.rowGroupCols = newParams.rowGroupCols;
            this.storeParams.pivotCols = newParams.pivotCols;
            this.storeParams.valueCols = newParams.valueCols;
        }
    };
    ServerSideRowModel.prototype.destroyRootStore = function () {
        if (!this.rootNode || !this.rootNode.childStore) {
            return;
        }
        this.rootNode.childStore = this.destroyBean(this.rootNode.childStore);
        this.nodeManager.clear();
    };
    ServerSideRowModel.prototype.refreshAfterSort = function (newSortModel, params) {
        if (this.storeParams) {
            this.storeParams.sortModel = newSortModel;
        }
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.refreshAfterSort(params);
        this.onStoreUpdated();
    };
    ServerSideRowModel.prototype.generateSecondaryColumns = function (pivotFields) {
        var pivotColumnGroupDefs = this.pivotColDefService.createColDefsFromFields(pivotFields);
        this.managingPivotResultColumns = true;
        this.columnModel.setSecondaryColumns(pivotColumnGroupDefs, "rowModelUpdated");
    };
    ServerSideRowModel.prototype.resetRowHeights = function () {
        var atLeastOne = this.resetRowHeightsForAllRowNodes();
        var rootNodeHeight = this.gridOptionsService.getRowHeightForNode(this.rootNode);
        this.rootNode.setRowHeight(rootNodeHeight.height, rootNodeHeight.estimated);
        if (this.rootNode.sibling) {
            var rootNodeSibling = this.gridOptionsService.getRowHeightForNode(this.rootNode.sibling);
            this.rootNode.sibling.setRowHeight(rootNodeSibling.height, rootNodeSibling.estimated);
        }
        // when pivotMode but pivot not active, root node is displayed on its own
        // because it's only ever displayed alone, refreshing the model (onRowHeightChanged) is not required
        if (atLeastOne) {
            this.onRowHeightChanged();
        }
    };
    ServerSideRowModel.prototype.resetRowHeightsForAllRowNodes = function () {
        var _this = this;
        var atLeastOne = false;
        this.forEachNode(function (rowNode) {
            var rowHeightForNode = _this.gridOptionsService.getRowHeightForNode(rowNode);
            rowNode.setRowHeight(rowHeightForNode.height, rowHeightForNode.estimated);
            // we keep the height each row is at, however we set estimated=true rather than clear the height.
            // this means the grid will not reset the row heights back to defaults, rather it will re-calc
            // the height for each row as the row is displayed. otherwise the scroll will jump when heights are reset.
            var detailNode = rowNode.detailNode;
            if (detailNode) {
                var detailRowHeight = _this.gridOptionsService.getRowHeightForNode(detailNode);
                detailNode.setRowHeight(detailRowHeight.height, detailRowHeight.estimated);
            }
            if (rowNode.sibling) {
                var siblingRowHeight = _this.gridOptionsService.getRowHeightForNode(rowNode.sibling);
                detailNode.setRowHeight(siblingRowHeight.height, siblingRowHeight.estimated);
            }
            atLeastOne = true;
        });
        return atLeastOne;
    };
    ServerSideRowModel.prototype.resetRootStore = function () {
        this.destroyRootStore();
        this.rootNode = new core.RowNode(this.beans);
        this.rootNode.group = true;
        this.rootNode.level = -1;
        if (this.datasource) {
            this.storeParams = this.createStoreParams();
            this.rootNode.childStore = this.createBean(this.storeFactory.createStore(this.storeParams, this.rootNode));
            this.updateRowIndexesAndBounds();
        }
        if (this.managingPivotResultColumns) {
            // if managing pivot columns, also reset secondary columns.
            this.columnModel.setSecondaryColumns(null);
            this.managingPivotResultColumns = false;
        }
        // this gets the row to render rows (or remove the previously rendered rows, as it's blank to start).
        // important to NOT pass in an event with keepRenderedRows or animate, as we want the renderer
        // to treat the rows as new rows, as it's all new data
        this.dispatchModelUpdated(true);
    };
    ServerSideRowModel.prototype.columnsToValueObjects = function (columns) {
        var _this = this;
        return columns.map(function (col) { return ({
            id: col.getId(),
            aggFunc: col.getAggFunc(),
            displayName: _this.columnModel.getDisplayNameForColumn(col, 'model'),
            field: col.getColDef().field
        }); });
    };
    ServerSideRowModel.prototype.createStoreParams = function () {
        var rowGroupColumnVos = this.columnsToValueObjects(this.columnModel.getRowGroupColumns());
        var valueColumnVos = this.columnsToValueObjects(this.columnModel.getValueColumns());
        var pivotColumnVos = this.columnsToValueObjects(this.columnModel.getPivotColumns());
        var dynamicRowHeight = this.gridOptionsService.isGetRowHeightFunction();
        var params = {
            // the columns the user has grouped and aggregated by
            valueCols: valueColumnVos,
            rowGroupCols: rowGroupColumnVos,
            pivotCols: pivotColumnVos,
            pivotMode: this.columnModel.isPivotMode(),
            // sort and filter model
            filterModel: this.filterManager.isAdvancedFilterEnabled()
                ? this.filterManager.getAdvancedFilterModel()
                : this.filterManager.getFilterModel(),
            sortModel: this.sortController.getSortModel(),
            datasource: this.datasource,
            lastAccessedSequence: new core.NumberSequence(),
            // blockSize: blockSize == null ? 100 : blockSize,
            dynamicRowHeight: dynamicRowHeight
        };
        return params;
    };
    ServerSideRowModel.prototype.getParams = function () {
        return this.storeParams;
    };
    ServerSideRowModel.prototype.dispatchModelUpdated = function (reset) {
        if (reset === void 0) { reset = false; }
        var modelUpdatedEvent = {
            type: core.Events.EVENT_MODEL_UPDATED,
            animate: !reset,
            keepRenderedRows: !reset,
            newPage: false,
            newData: false
        };
        this.eventService.dispatchEvent(modelUpdatedEvent);
    };
    ServerSideRowModel.prototype.onStoreUpdated = function () {
        // sometimes if doing a batch update, we do the batch first,
        // then call onStoreUpdated manually. eg expandAll() method.
        if (this.pauseStoreUpdateListening) {
            return;
        }
        this.updateRowIndexesAndBounds();
        this.dispatchModelUpdated();
    };
    /** This method is debounced. It is used for row auto-height. If we don't debounce,
     * then the Row Models will end up recalculating each row position
     * for each row height change and result in the Row Renderer laying out rows.
     * This is particularly bad if using print layout, and showing eg 1,000 rows,
     * each row will change it's height, causing Row Model to update 1,000 times.
     */
    ServerSideRowModel.prototype.onRowHeightChangedDebounced = function () {
        this.onRowHeightChanged_debounced();
    };
    ServerSideRowModel.prototype.onRowHeightChanged = function () {
        this.updateRowIndexesAndBounds();
        this.dispatchModelUpdated();
    };
    ServerSideRowModel.prototype.updateRowIndexesAndBounds = function () {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.setDisplayIndexes(new core.NumberSequence(), { value: 0 });
    };
    ServerSideRowModel.prototype.retryLoads = function () {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.retryLoads();
        this.onStoreUpdated();
    };
    ServerSideRowModel.prototype.getRow = function (index) {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return undefined;
        }
        return rootStore.getRowUsingDisplayIndex(index);
    };
    ServerSideRowModel.prototype.expandAll = function (value) {
        // if we don't pause store updating, we are needlessly
        // recalculating row-indexes etc, and also getting rendering
        // engine to re-render (listens on ModelUpdated event)
        this.pauseStoreUpdateListening = true;
        this.forEachNode(function (node) {
            if (node.stub) {
                return;
            }
            if (node.hasChildren()) {
                node.setExpanded(value);
            }
        });
        this.pauseStoreUpdateListening = false;
        this.onStoreUpdated();
    };
    ServerSideRowModel.prototype.refreshAfterFilter = function (newFilterModel, params) {
        if (this.storeParams) {
            this.storeParams.filterModel = newFilterModel;
        }
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.refreshAfterFilter(params);
        this.onStoreUpdated();
    };
    ServerSideRowModel.prototype.getRootStore = function () {
        if (this.rootNode && this.rootNode.childStore) {
            return this.rootNode.childStore;
        }
    };
    ServerSideRowModel.prototype.getRowCount = function () {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return 0;
        }
        return rootStore.getDisplayIndexEnd();
    };
    ServerSideRowModel.prototype.getTopLevelRowCount = function () {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return 1;
        }
        return rootStore.getRowCount();
    };
    ServerSideRowModel.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return topLevelIndex;
        }
        return rootStore.getTopLevelRowDisplayedIndex(topLevelIndex);
    };
    ServerSideRowModel.prototype.getRowBounds = function (index) {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            var rowHeight = this.gridOptionsService.getRowHeightAsNumber();
            return {
                rowTop: 0,
                rowHeight: rowHeight
            };
        }
        return rootStore.getRowBounds(index);
    };
    ServerSideRowModel.prototype.getBlockStates = function () {
        var root = this.getRootStore();
        if (!root) {
            return undefined;
        }
        var states = {};
        root.forEachStoreDeep(function (store) {
            if (store instanceof FullStore) {
                var _a = store.getBlockStateJson(), id = _a.id, state = _a.state;
                states[id] = state;
            }
            else if (store instanceof LazyStore) {
                Object.entries(store.getBlockStates()).forEach(function (_a) {
                    var _b = __read$2(_a, 2), block = _b[0], state = _b[1];
                    states[block] = state;
                });
            }
            else {
                throw new Error('AG Grid: Unsupported store type');
            }
        });
        return states;
    };
    ServerSideRowModel.prototype.getRowIndexAtPixel = function (pixel) {
        var rootStore = this.getRootStore();
        if (pixel <= 0 || !rootStore) {
            return 0;
        }
        return rootStore.getRowIndexAtPixel(pixel);
    };
    ServerSideRowModel.prototype.isEmpty = function () {
        return false;
    };
    ServerSideRowModel.prototype.isRowsToRender = function () {
        return this.getRootStore() != null && this.getRowCount() > 0;
    };
    ServerSideRowModel.prototype.getType = function () {
        return 'serverSide';
    };
    ServerSideRowModel.prototype.forEachNode = function (callback) {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.forEachNodeDeep(callback);
    };
    ServerSideRowModel.prototype.forEachNodeAfterFilterAndSort = function (callback, includeFooterNodes) {
        if (includeFooterNodes === void 0) { includeFooterNodes = false; }
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.forEachNodeDeepAfterFilterAndSort(callback, undefined, includeFooterNodes);
    };
    /** @return false if store hasn't started */
    ServerSideRowModel.prototype.executeOnStore = function (route, callback) {
        if (!this.started) {
            return false;
        }
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return true;
        }
        var storeToExecuteOn = rootStore.getChildStore(route);
        if (storeToExecuteOn) {
            callback(storeToExecuteOn);
        }
        return true;
    };
    ServerSideRowModel.prototype.refreshStore = function (params) {
        if (params === void 0) { params = {}; }
        var route = params.route ? params.route : [];
        this.executeOnStore(route, function (store) { return store.refreshStore(params.purge == true); });
    };
    ServerSideRowModel.prototype.getStoreState = function () {
        var res = [];
        var rootStore = this.getRootStore();
        if (rootStore) {
            rootStore.addStoreStates(res);
        }
        return res;
    };
    ServerSideRowModel.prototype.getNodesInRangeForSelection = function (firstInRange, lastInRange) {
        if (!core._.exists(firstInRange)) {
            return [];
        }
        if (!lastInRange) {
            return [firstInRange];
        }
        var startIndex = firstInRange.rowIndex;
        var endIndex = lastInRange.rowIndex;
        if (startIndex === null || endIndex === null) {
            return [firstInRange];
        }
        var nodeRange = [];
        var _a = __read$2([startIndex, endIndex].sort(function (a, b) { return a - b; }), 2), firstIndex = _a[0], lastIndex = _a[1];
        this.forEachNode(function (node) {
            var thisRowIndex = node.rowIndex;
            if (thisRowIndex == null || node.stub) {
                return;
            }
            if (thisRowIndex >= firstIndex && thisRowIndex <= lastIndex) {
                nodeRange.push(node);
            }
        });
        // don't allow range selection if we don't have the full range of rows
        if (nodeRange.length !== (lastIndex - firstIndex + 1)) {
            return [firstInRange];
        }
        return nodeRange;
    };
    ServerSideRowModel.prototype.getRowNode = function (id) {
        var result;
        this.forEachNode(function (rowNode) {
            if (rowNode.id === id) {
                result = rowNode;
            }
            if (rowNode.detailNode && rowNode.detailNode.id === id) {
                result = rowNode.detailNode;
            }
        });
        return result;
    };
    ServerSideRowModel.prototype.isRowPresent = function (rowNode) {
        var foundRowNode = this.getRowNode(rowNode.id);
        return !!foundRowNode;
    };
    ServerSideRowModel.prototype.setRowCount = function (rowCount, lastRowIndexKnown) {
        var rootStore = this.getRootStore();
        if (rootStore) {
            if (rootStore instanceof LazyStore) {
                rootStore.setRowCount(rowCount, lastRowIndexKnown);
                return;
            }
            console.error('AG Grid: Infinite scrolling must be enabled in order to set the row count.');
        }
    };
    __decorate$d([
        core.Autowired('columnModel')
    ], ServerSideRowModel.prototype, "columnModel", void 0);
    __decorate$d([
        core.Autowired('filterManager')
    ], ServerSideRowModel.prototype, "filterManager", void 0);
    __decorate$d([
        core.Autowired('sortController')
    ], ServerSideRowModel.prototype, "sortController", void 0);
    __decorate$d([
        core.Autowired('rowRenderer')
    ], ServerSideRowModel.prototype, "rowRenderer", void 0);
    __decorate$d([
        core.Autowired('ssrmSortService')
    ], ServerSideRowModel.prototype, "sortListener", void 0);
    __decorate$d([
        core.Autowired('ssrmNodeManager')
    ], ServerSideRowModel.prototype, "nodeManager", void 0);
    __decorate$d([
        core.Autowired('ssrmStoreFactory')
    ], ServerSideRowModel.prototype, "storeFactory", void 0);
    __decorate$d([
        core.Autowired('beans')
    ], ServerSideRowModel.prototype, "beans", void 0);
    __decorate$d([
        core.Optional('pivotColDefService')
    ], ServerSideRowModel.prototype, "pivotColDefService", void 0);
    __decorate$d([
        core.PreDestroy
    ], ServerSideRowModel.prototype, "destroyDatasource", null);
    __decorate$d([
        core.PostConstruct
    ], ServerSideRowModel.prototype, "addEventListeners", null);
    __decorate$d([
        core.PreDestroy
    ], ServerSideRowModel.prototype, "destroyRootStore", null);
    ServerSideRowModel = __decorate$d([
        core.Bean('rowModel')
    ], ServerSideRowModel);
    return ServerSideRowModel;
}(core.BeanStub));

var __extends$9 = (undefined && undefined.__extends) || (function () {
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
var __decorate$c = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StoreUtils = /** @class */ (function (_super) {
    __extends$9(StoreUtils, _super);
    function StoreUtils() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StoreUtils.prototype.loadFromDatasource = function (p) {
        var storeParams = p.storeParams, parentBlock = p.parentBlock, parentNode = p.parentNode;
        var groupKeys = parentNode.getGroupKeys();
        if (!storeParams.datasource) {
            return;
        }
        var request = {
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
        var getRowsParams = {
            success: p.success,
            fail: p.fail,
            request: request,
            parentNode: p.parentNode,
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context
        };
        window.setTimeout(function () {
            if (!storeParams.datasource || !parentBlock.isAlive()) {
                // failCallback() is important, to reduce the 'RowNodeBlockLoader.activeBlockLoadsCount' count
                p.fail();
                return;
            }
            storeParams.datasource.getRows(getRowsParams);
        }, 0);
    };
    StoreUtils.prototype.getChildStore = function (keys, currentCache, findNodeFunc) {
        if (core._.missingOrEmpty(keys)) {
            return currentCache;
        }
        var nextKey = keys[0];
        var nextNode = findNodeFunc(nextKey);
        if (nextNode) {
            // if we have the final node, but not the final store, we create it to allow
            // early population of data
            if (keys.length === 1 && !nextNode.childStore) {
                var storeParams = this.serverSideRowModel.getParams();
                nextNode.childStore = this.createBean(this.storeFactory.createStore(storeParams, nextNode));
            }
            var keyListForNextLevel = keys.slice(1, keys.length);
            var nextStore = nextNode.childStore;
            return nextStore ? nextStore.getChildStore(keyListForNextLevel) : null;
        }
        return null;
    };
    StoreUtils.prototype.isServerRefreshNeeded = function (parentRowNode, rowGroupCols, params) {
        if (params.valueColChanged || params.secondaryColChanged) {
            return true;
        }
        var level = parentRowNode.level + 1;
        var grouping = level < rowGroupCols.length;
        var leafNodes = !grouping;
        if (leafNodes) {
            return true;
        }
        var colIdThisGroup = rowGroupCols[level].id;
        var actionOnThisGroup = params.changedColumns.indexOf(colIdThisGroup) > -1;
        if (actionOnThisGroup) {
            return true;
        }
        var allCols = this.columnModel.getAllGridColumns();
        var affectedGroupCols = allCols
            // find all impacted cols which also a group display column
            .filter(function (col) { return col.getColDef().showRowGroup && params.changedColumns.includes(col.getId()); })
            .map(function (col) { return col.getColDef().showRowGroup; })
            // if displaying all groups, or displaying the effected col for this group, refresh
            .some(function (group) { return group === true || group === colIdThisGroup; });
        return affectedGroupCols;
    };
    StoreUtils.prototype.getServerSideInitialRowCount = function () {
        return this.gridOptionsService.get('serverSideInitialRowCount');
    };
    StoreUtils.prototype.assertRowModelIsServerSide = function (key) {
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            core._.warnOnce("The '".concat(key, "' property can only be used with the Server Side Row Model."));
            return false;
        }
        return true;
    };
    StoreUtils.prototype.assertNotTreeData = function (key) {
        if (this.gridOptionsService.get('treeData')) {
            core._.warnOnce("The '".concat(key, "' property cannot be used while using tree data."));
            return false;
        }
        return true;
    };
    StoreUtils.prototype.isServerSideSortAllLevels = function () {
        return this.gridOptionsService.get('serverSideSortAllLevels') && this.assertRowModelIsServerSide('serverSideSortAllLevels');
    };
    StoreUtils.prototype.isServerSideOnlyRefreshFilteredGroups = function () {
        return this.gridOptionsService.get('serverSideOnlyRefreshFilteredGroups') && this.assertRowModelIsServerSide('serverSideOnlyRefreshFilteredGroups');
    };
    StoreUtils.prototype.isServerSideSortOnServer = function () {
        return this.gridOptionsService.get('serverSideSortOnServer') && this.assertRowModelIsServerSide('serverSideSortOnServer') && this.assertNotTreeData('serverSideSortOnServer');
    };
    StoreUtils.prototype.isServerSideFilterOnServer = function () {
        return this.gridOptionsService.get('serverSideFilterOnServer') && this.assertRowModelIsServerSide('serverSideFilterOnServer') && this.assertNotTreeData('serverSideFilterOnServer');
    };
    __decorate$c([
        core.Autowired('columnModel')
    ], StoreUtils.prototype, "columnModel", void 0);
    __decorate$c([
        core.Autowired('rowModel')
    ], StoreUtils.prototype, "serverSideRowModel", void 0);
    __decorate$c([
        core.Autowired('ssrmStoreFactory')
    ], StoreUtils.prototype, "storeFactory", void 0);
    StoreUtils = __decorate$c([
        core.Bean('ssrmStoreUtils')
    ], StoreUtils);
    return StoreUtils;
}(core.BeanStub));

var __extends$8 = (undefined && undefined.__extends) || (function () {
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
var __decorate$b = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GROUP_MISSING_KEY_ID = 'ag-Grid-MissingKey';
var BlockUtils = /** @class */ (function (_super) {
    __extends$8(BlockUtils, _super);
    function BlockUtils() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BlockUtils.prototype.createRowNode = function (params) {
        var rowNode = new core.RowNode(this.beans);
        var rowHeight = params.rowHeight != null ? params.rowHeight : this.gridOptionsService.getRowHeightAsNumber();
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
    };
    BlockUtils.prototype.destroyRowNodes = function (rowNodes) {
        var _this = this;
        if (rowNodes) {
            rowNodes.forEach(function (row) { return _this.destroyRowNode(row); });
        }
    };
    BlockUtils.prototype.destroyRowNode = function (rowNode, preserveStore) {
        if (preserveStore === void 0) { preserveStore = false; }
        if (rowNode.childStore && !preserveStore) {
            this.destroyBean(rowNode.childStore);
            rowNode.childStore = null;
        }
        // if this has a footer, destroy that too
        if (rowNode.sibling && !rowNode.footer) {
            this.destroyRowNode(rowNode.sibling, false);
        }
        // this is needed, so row render knows to fade out the row, otherwise it
        // sees row top is present, and thinks the row should be shown. maybe
        // rowNode should have a flag on whether it is visible???
        rowNode.clearRowTopAndRowIndex();
        if (rowNode.id != null) {
            this.nodeManager.removeNode(rowNode);
        }
    };
    BlockUtils.prototype.setTreeGroupInfo = function (rowNode) {
        rowNode.updateHasChildren();
        var getKeyFunc = this.gridOptionsService.get('getServerSideGroupKey');
        if (rowNode.hasChildren() && getKeyFunc != null) {
            rowNode.key = getKeyFunc(rowNode.data);
        }
        if (!rowNode.hasChildren() && rowNode.childStore != null) {
            this.destroyBean(rowNode.childStore);
            rowNode.childStore = null;
            rowNode.expanded = false;
        }
    };
    BlockUtils.prototype.setRowGroupInfo = function (rowNode) {
        rowNode.key = this.valueService.getValue(rowNode.rowGroupColumn, rowNode);
        if (rowNode.key === null || rowNode.key === undefined) {
            core._.doOnce(function () {
                console.warn("AG Grid: null and undefined values are not allowed for server side row model keys");
                if (rowNode.rowGroupColumn) {
                    console.warn("column = ".concat(rowNode.rowGroupColumn.getId()));
                }
                console.warn("data is ", rowNode.data);
            }, 'ServerSideBlock-CannotHaveNullOrUndefinedForKey');
        }
        var getGroupIncludeFooter = this.beans.gridOptionsService.getGroupIncludeFooter();
        var doesRowShowFooter = getGroupIncludeFooter({ node: rowNode });
        if (doesRowShowFooter) {
            rowNode.createFooter();
            if (rowNode.sibling) {
                rowNode.sibling.uiLevel = rowNode.uiLevel + 1;
            }
        }
    };
    BlockUtils.prototype.setMasterDetailInfo = function (rowNode) {
        var isMasterFunc = this.gridOptionsService.get('isRowMaster');
        if (isMasterFunc != null) {
            rowNode.master = isMasterFunc(rowNode.data);
        }
        else {
            rowNode.master = true;
        }
    };
    BlockUtils.prototype.updateDataIntoRowNode = function (rowNode, data) {
        rowNode.updateData(data);
        if (this.gridOptionsService.get('treeData')) {
            this.setTreeGroupInfo(rowNode);
            this.setChildCountIntoRowNode(rowNode);
        }
        else if (rowNode.group) {
            this.setChildCountIntoRowNode(rowNode);
            if (!rowNode.footer) {
                var getGroupIncludeFooter = this.beans.gridOptionsService.getGroupIncludeFooter();
                var doesRowShowFooter = getGroupIncludeFooter({ node: rowNode });
                if (doesRowShowFooter) {
                    if (rowNode.sibling) {
                        rowNode.sibling.updateData(data);
                    }
                    else {
                        rowNode.createFooter();
                    }
                }
                else if (rowNode.sibling) {
                    rowNode.destroyFooter();
                }
            }
            // it's not possible for a node to change whether it's a group or not
            // when doing row grouping (as only rows at certain levels are groups),
            // so nothing to do here
        }
        else if (this.gridOptionsService.get('masterDetail')) ;
    };
    BlockUtils.prototype.setDataIntoRowNode = function (rowNode, data, defaultId, cachedRowHeight) {
        var _a;
        rowNode.stub = false;
        var treeData = this.gridOptionsService.get('treeData');
        if (core._.exists(data)) {
            rowNode.setDataAndId(data, defaultId);
            if (treeData) {
                this.setTreeGroupInfo(rowNode);
            }
            else if (rowNode.group) {
                this.setRowGroupInfo(rowNode);
            }
            else if (this.gridOptionsService.get('masterDetail')) {
                this.setMasterDetailInfo(rowNode);
            }
        }
        else {
            rowNode.setDataAndId(undefined, undefined);
            rowNode.key = null;
        }
        if (treeData || rowNode.group) {
            this.setGroupDataIntoRowNode(rowNode);
            this.setChildCountIntoRowNode(rowNode);
        }
        // this needs to be done AFTER setGroupDataIntoRowNode(), as the height can depend on the group data
        // getting set, if it's a group node and colDef.autoHeight=true
        if (core._.exists(data)) {
            rowNode.setRowHeight(this.gridOptionsService.getRowHeightForNode(rowNode, false, cachedRowHeight).height);
            (_a = rowNode.sibling) === null || _a === void 0 ? void 0 : _a.setRowHeight(this.gridOptionsService.getRowHeightForNode(rowNode.sibling, false, cachedRowHeight).height);
        }
    };
    BlockUtils.prototype.setChildCountIntoRowNode = function (rowNode) {
        var getChildCount = this.gridOptionsService.get('getChildCount');
        if (getChildCount) {
            rowNode.setAllChildrenCount(getChildCount(rowNode.data));
        }
    };
    BlockUtils.prototype.setGroupDataIntoRowNode = function (rowNode) {
        var _this = this;
        var groupDisplayCols = this.columnModel.getGroupDisplayColumns();
        var usingTreeData = this.gridOptionsService.get('treeData');
        groupDisplayCols.forEach(function (col) {
            if (rowNode.groupData == null) {
                rowNode.groupData = {};
            }
            if (usingTreeData) {
                rowNode.groupData[col.getColId()] = rowNode.key;
            }
            else if (col.isRowGroupDisplayed(rowNode.rowGroupColumn.getId())) {
                var groupValue = _this.valueService.getValue(rowNode.rowGroupColumn, rowNode);
                rowNode.groupData[col.getColId()] = groupValue;
            }
        });
    };
    BlockUtils.prototype.clearDisplayIndex = function (rowNode) {
        rowNode.clearRowTopAndRowIndex();
        var hasChildStore = rowNode.hasChildren() && core._.exists(rowNode.childStore);
        if (hasChildStore) {
            var childStore = rowNode.childStore;
            childStore.clearDisplayIndexes();
        }
        var hasDetailNode = rowNode.master && rowNode.detailNode;
        if (hasDetailNode) {
            rowNode.detailNode.clearRowTopAndRowIndex();
        }
    };
    BlockUtils.prototype.setDisplayIndex = function (rowNode, displayIndexSeq, nextRowTop) {
        // set this row
        rowNode.setRowIndex(displayIndexSeq.next());
        rowNode.setRowTop(nextRowTop.value);
        nextRowTop.value += rowNode.rowHeight;
        if (rowNode.footer) {
            return;
        }
        // set child for master / detail
        var hasDetailRow = rowNode.master;
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
        var hasChildStore = rowNode.hasChildren() && core._.exists(rowNode.childStore);
        if (hasChildStore) {
            var childStore = rowNode.childStore;
            if (rowNode.expanded) {
                childStore.setDisplayIndexes(displayIndexSeq, nextRowTop);
            }
            else {
                // we need to clear the row tops, as the row renderer depends on
                // this to know if the row should be faded out
                childStore.clearDisplayIndexes();
            }
        }
    };
    BlockUtils.prototype.binarySearchForDisplayIndex = function (displayRowIndex, rowNodes) {
        var bottomPointer = 0;
        var topPointer = rowNodes.length - 1;
        if (core._.missing(topPointer) || core._.missing(bottomPointer)) {
            console.warn("AG Grid: error: topPointer = ".concat(topPointer, ", bottomPointer = ").concat(bottomPointer));
            return undefined;
        }
        while (true) {
            var midPointer = Math.floor((bottomPointer + topPointer) / 2);
            var currentRowNode = rowNodes[midPointer];
            // first check current row for index
            if (currentRowNode.rowIndex === displayRowIndex) {
                return currentRowNode;
            }
            // then check if current row contains a detail row with the index
            var expandedMasterRow = currentRowNode.master && currentRowNode.expanded;
            var detailNode = currentRowNode.detailNode;
            if (expandedMasterRow && detailNode && detailNode.rowIndex === displayRowIndex) {
                return currentRowNode.detailNode;
            }
            // then check if child cache contains index
            var childStore = currentRowNode.childStore;
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
                console.warn("AG Grid: error: unable to locate rowIndex = ".concat(displayRowIndex, " in cache"));
                return undefined;
            }
        }
    };
    BlockUtils.prototype.extractRowBounds = function (rowNode, index) {
        var extractRowBounds = function (currentRowNode) { return ({
            rowHeight: currentRowNode.rowHeight,
            rowTop: currentRowNode.rowTop
        }); };
        if (rowNode.rowIndex === index) {
            return extractRowBounds(rowNode);
        }
        if (rowNode.hasChildren() && rowNode.expanded && core._.exists(rowNode.childStore)) {
            var childStore = rowNode.childStore;
            if (childStore.isDisplayIndexInStore(index)) {
                return childStore.getRowBounds(index);
            }
        }
        else if (rowNode.master && rowNode.expanded && core._.exists(rowNode.detailNode)) {
            if (rowNode.detailNode.rowIndex === index) {
                return extractRowBounds(rowNode.detailNode);
            }
        }
    };
    BlockUtils.prototype.getIndexAtPixel = function (rowNode, pixel) {
        // first check if pixel is in range of current row
        if (rowNode.isPixelInRange(pixel)) {
            return rowNode.rowIndex;
        }
        // then check if current row contains a detail row with pixel in range
        var expandedMasterRow = rowNode.master && rowNode.expanded;
        var detailNode = rowNode.detailNode;
        if (expandedMasterRow && detailNode && detailNode.isPixelInRange(pixel)) {
            return rowNode.detailNode.rowIndex;
        }
        // then check if it's a group row with a child cache with pixel in range
        if (rowNode.hasChildren() && rowNode.expanded && core._.exists(rowNode.childStore)) {
            var childStore = rowNode.childStore;
            if (childStore.isPixelInRange(pixel)) {
                return childStore.getRowIndexAtPixel(pixel);
            }
        }
        return null;
        // pixel is not within this row node or it's children / detail, so return undefined
    };
    BlockUtils.prototype.createNodeIdPrefix = function (parentRowNode) {
        var parts = [];
        var rowNode = parentRowNode;
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
    };
    BlockUtils.prototype.checkOpenByDefault = function (rowNode) {
        return this.expansionService.checkOpenByDefault(rowNode);
    };
    __decorate$b([
        core.Autowired('valueService')
    ], BlockUtils.prototype, "valueService", void 0);
    __decorate$b([
        core.Autowired('columnModel')
    ], BlockUtils.prototype, "columnModel", void 0);
    __decorate$b([
        core.Autowired('ssrmNodeManager')
    ], BlockUtils.prototype, "nodeManager", void 0);
    __decorate$b([
        core.Autowired('beans')
    ], BlockUtils.prototype, "beans", void 0);
    __decorate$b([
        core.Autowired('expansionService')
    ], BlockUtils.prototype, "expansionService", void 0);
    BlockUtils = __decorate$b([
        core.Bean('ssrmBlockUtils')
    ], BlockUtils);
    return BlockUtils;
}(core.BeanStub));

var __decorate$a = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NodeManager = /** @class */ (function () {
    function NodeManager() {
        this.rowNodes = {};
    }
    NodeManager.prototype.addRowNode = function (rowNode) {
        var id = rowNode.id;
        if (this.rowNodes[id]) {
            console.warn("AG Grid: Duplicate node id ".concat(rowNode.id, ". Row ID's are provided via the getRowId() callback. Please modify the getRowId() callback code to provide unique row id values."));
            console.warn('first instance', this.rowNodes[id].data);
            console.warn('second instance', rowNode.data);
        }
        this.rowNodes[id] = rowNode;
    };
    NodeManager.prototype.removeNode = function (rowNode) {
        var id = rowNode.id;
        if (this.rowNodes[id]) {
            this.rowNodes[id] = undefined;
        }
    };
    NodeManager.prototype.clear = function () {
        this.rowNodes = {};
    };
    __decorate$a([
        core.PreDestroy
    ], NodeManager.prototype, "clear", null);
    NodeManager = __decorate$a([
        core.Bean('ssrmNodeManager')
    ], NodeManager);
    return NodeManager;
}());

var __extends$7 = (undefined && undefined.__extends) || (function () {
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
var __decorate$9 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TransactionManager = /** @class */ (function (_super) {
    __extends$7(TransactionManager, _super);
    function TransactionManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.asyncTransactions = [];
        return _this;
    }
    TransactionManager.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
    };
    TransactionManager.prototype.applyTransactionAsync = function (transaction, callback) {
        if (this.asyncTransactionsTimeout == null) {
            this.scheduleExecuteAsync();
        }
        this.asyncTransactions.push({ transaction: transaction, callback: callback });
    };
    TransactionManager.prototype.scheduleExecuteAsync = function () {
        var _this = this;
        var waitMillis = this.gridOptionsService.getAsyncTransactionWaitMillis();
        this.asyncTransactionsTimeout = window.setTimeout(function () {
            _this.executeAsyncTransactions();
        }, waitMillis);
    };
    TransactionManager.prototype.executeAsyncTransactions = function () {
        var _this = this;
        if (!this.asyncTransactions) {
            return;
        }
        var resultFuncs = [];
        var resultsForEvent = [];
        var transactionsToRetry = [];
        var atLeastOneTransactionApplied = false;
        this.asyncTransactions.forEach(function (txWrapper) {
            var result;
            var hasStarted = _this.serverSideRowModel.executeOnStore(txWrapper.transaction.route, function (cache) {
                result = cache.applyTransaction(txWrapper.transaction);
            });
            if (!hasStarted) {
                result = { status: core.ServerSideTransactionResultStatus.StoreNotStarted };
            }
            else if (result == undefined) {
                result = { status: core.ServerSideTransactionResultStatus.StoreNotFound };
            }
            resultsForEvent.push(result);
            var retryTransaction = result.status == core.ServerSideTransactionResultStatus.StoreLoading;
            if (retryTransaction) {
                transactionsToRetry.push(txWrapper);
                return;
            }
            if (txWrapper.callback) {
                resultFuncs.push(function () { return txWrapper.callback(result); });
            }
            if (result.status === core.ServerSideTransactionResultStatus.Applied) {
                atLeastOneTransactionApplied = true;
            }
        });
        // do callbacks in next VM turn so it's async
        if (resultFuncs.length > 0) {
            window.setTimeout(function () {
                resultFuncs.forEach(function (func) { return func(); });
            }, 0);
        }
        this.asyncTransactionsTimeout = undefined;
        // this will be empty list if nothing to retry
        this.asyncTransactions = transactionsToRetry;
        if (atLeastOneTransactionApplied) {
            this.valueCache.onDataChanged();
            this.eventService.dispatchEvent({ type: core.Events.EVENT_STORE_UPDATED });
        }
        if (resultsForEvent.length > 0) {
            var event_1 = {
                type: core.Events.EVENT_ASYNC_TRANSACTIONS_FLUSHED,
                results: resultsForEvent
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    TransactionManager.prototype.flushAsyncTransactions = function () {
        // the timeout could be missing, if we are flushing due to row data loaded
        if (this.asyncTransactionsTimeout != null) {
            clearTimeout(this.asyncTransactionsTimeout);
        }
        this.executeAsyncTransactions();
    };
    TransactionManager.prototype.applyTransaction = function (transaction) {
        var res;
        var hasStarted = this.serverSideRowModel.executeOnStore(transaction.route, function (store) {
            res = store.applyTransaction(transaction);
        });
        if (!hasStarted) {
            return { status: core.ServerSideTransactionResultStatus.StoreNotStarted };
        }
        else if (res) {
            this.valueCache.onDataChanged();
            if (res.remove) {
                var removedRowIds = res.remove.map(function (row) { return row.id; });
                this.selectionService.deleteSelectionStateFromParent(transaction.route || [], removedRowIds);
            }
            this.eventService.dispatchEvent({ type: core.Events.EVENT_STORE_UPDATED });
            return res;
        }
        else {
            return { status: core.ServerSideTransactionResultStatus.StoreNotFound };
        }
    };
    __decorate$9([
        core.Autowired('rowNodeBlockLoader')
    ], TransactionManager.prototype, "rowNodeBlockLoader", void 0);
    __decorate$9([
        core.Autowired('valueCache')
    ], TransactionManager.prototype, "valueCache", void 0);
    __decorate$9([
        core.Autowired('rowModel')
    ], TransactionManager.prototype, "serverSideRowModel", void 0);
    __decorate$9([
        core.Autowired('rowRenderer')
    ], TransactionManager.prototype, "rowRenderer", void 0);
    __decorate$9([
        core.Autowired('selectionService')
    ], TransactionManager.prototype, "selectionService", void 0);
    __decorate$9([
        core.PostConstruct
    ], TransactionManager.prototype, "postConstruct", null);
    TransactionManager = __decorate$9([
        core.Bean('ssrmTransactionManager')
    ], TransactionManager);
    return TransactionManager;
}(core.BeanStub));

var __extends$6 = (undefined && undefined.__extends) || (function () {
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
var __decorate$8 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ExpandListener = /** @class */ (function (_super) {
    __extends$6(ExpandListener, _super);
    function ExpandListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExpandListener.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
        this.addManagedListener(this.eventService, core.Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
    };
    ExpandListener.prototype.onRowGroupOpened = function (event) {
        var rowNode = event.node;
        if (rowNode.expanded) {
            if (rowNode.master) {
                this.createDetailNode(rowNode);
            }
            else if (core._.missing(rowNode.childStore)) {
                var storeParams = this.serverSideRowModel.getParams();
                rowNode.childStore = this.createBean(this.storeFactory.createStore(storeParams, rowNode));
            }
        }
        else if (this.gridOptionsService.get('purgeClosedRowNodes') && core._.exists(rowNode.childStore)) {
            rowNode.childStore = this.destroyBean(rowNode.childStore);
        }
        var storeUpdatedEvent = { type: core.Events.EVENT_STORE_UPDATED };
        this.eventService.dispatchEvent(storeUpdatedEvent);
    };
    ExpandListener.prototype.createDetailNode = function (masterNode) {
        if (core._.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        }
        var detailNode = new core.RowNode(this.beans);
        detailNode.detail = true;
        detailNode.selectable = false;
        detailNode.parent = masterNode;
        if (core._.exists(masterNode.id)) {
            detailNode.id = 'detail_' + masterNode.id;
        }
        detailNode.data = masterNode.data;
        detailNode.level = masterNode.level + 1;
        var defaultDetailRowHeight = 200;
        var rowHeight = this.gridOptionsService.getRowHeightForNode(detailNode).height;
        detailNode.rowHeight = rowHeight ? rowHeight : defaultDetailRowHeight;
        masterNode.detailNode = detailNode;
        return detailNode;
    };
    __decorate$8([
        core.Autowired('rowModel')
    ], ExpandListener.prototype, "serverSideRowModel", void 0);
    __decorate$8([
        core.Autowired('ssrmStoreFactory')
    ], ExpandListener.prototype, "storeFactory", void 0);
    __decorate$8([
        core.Autowired('beans')
    ], ExpandListener.prototype, "beans", void 0);
    __decorate$8([
        core.PostConstruct
    ], ExpandListener.prototype, "postConstruct", null);
    ExpandListener = __decorate$8([
        core.Bean('ssrmExpandListener')
    ], ExpandListener);
    return ExpandListener;
}(core.BeanStub));

var __extends$5 = (undefined && undefined.__extends) || (function () {
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
var __decorate$7 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SortListener = /** @class */ (function (_super) {
    __extends$5(SortListener, _super);
    function SortListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SortListener.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
        this.addManagedListener(this.eventService, core.Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
    };
    SortListener.prototype.onSortChanged = function () {
        var storeParams = this.serverSideRowModel.getParams();
        if (!storeParams) {
            return;
        } // params is undefined if no datasource set
        var newSortModel = this.sortController.getSortModel();
        var oldSortModel = storeParams.sortModel;
        var changedColumns = this.findChangedColumnsInSort(newSortModel, oldSortModel);
        var valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
        var secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);
        var params = {
            valueColChanged: valueColChanged,
            secondaryColChanged: secondaryColChanged,
            changedColumns: changedColumns
        };
        this.serverSideRowModel.refreshAfterSort(newSortModel, params);
    };
    // returns back all the cols that were effected by the sorting. eg if we were sorting by col A,
    // and now we are sorting by col B, the list of impacted cols should be A and B. so if a cache
    // is impacted by sorting on A or B then it needs to be refreshed. this includes where the cache
    // was previously sorted by A and then the A sort now needs to be cleared.
    SortListener.prototype.findChangedColumnsInSort = function (newSortModel, oldSortModel) {
        var allColsInBothSorts = [];
        [newSortModel, oldSortModel].forEach(function (sortModel) {
            if (sortModel) {
                var ids = sortModel.map(function (sm) { return sm.colId; });
                allColsInBothSorts = allColsInBothSorts.concat(ids);
            }
        });
        var differentSorts = function (oldSortItem, newSortItem) {
            var oldSort = oldSortItem ? oldSortItem.sort : null;
            var newSort = newSortItem ? newSortItem.sort : null;
            return oldSort !== newSort;
        };
        var differentIndexes = function (oldSortItem, newSortItem) {
            var oldIndex = oldSortItem ? oldSortModel.indexOf(oldSortItem) : -1;
            var newIndex = newSortItem ? newSortModel.indexOf(newSortItem) : -1;
            return oldIndex !== newIndex;
        };
        return allColsInBothSorts.filter(function (colId) {
            var oldSortItem = oldSortModel.find(function (sm) { return sm.colId === colId; });
            var newSortItem = newSortModel.find(function (sm) { return sm.colId === colId; });
            return differentSorts(oldSortItem, newSortItem) || differentIndexes(oldSortItem, newSortItem);
        });
    };
    __decorate$7([
        core.Autowired('sortController')
    ], SortListener.prototype, "sortController", void 0);
    __decorate$7([
        core.Autowired('rowModel')
    ], SortListener.prototype, "serverSideRowModel", void 0);
    __decorate$7([
        core.Autowired('ssrmListenerUtils')
    ], SortListener.prototype, "listenerUtils", void 0);
    __decorate$7([
        core.PostConstruct
    ], SortListener.prototype, "postConstruct", null);
    SortListener = __decorate$7([
        core.Bean('ssrmSortService')
    ], SortListener);
    return SortListener;
}(core.BeanStub));

var __extends$4 = (undefined && undefined.__extends) || (function () {
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
var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FilterListener = /** @class */ (function (_super) {
    __extends$4(FilterListener, _super);
    function FilterListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterListener.prototype.postConstruct = function () {
        var _this = this;
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
        this.addManagedListener(this.eventService, core.Events.EVENT_ADVANCED_FILTER_ENABLED_CHANGED, function () { return _this.onFilterChanged(true); });
        this.addManagedListener(this.eventService, core.Events.EVENT_FILTER_CHANGED, function () { return _this.onFilterChanged(); });
    };
    FilterListener.prototype.onFilterChanged = function (advancedFilterEnabledChanged) {
        var storeParams = this.serverSideRowModel.getParams();
        if (!storeParams) {
            return;
        } // params is undefined if no datasource set
        var oldModel = storeParams.filterModel;
        var newModel;
        var changedColumns;
        if (this.filterManager.isAdvancedFilterEnabled()) {
            newModel = this.filterManager.getAdvancedFilterModel();
            // if advancedFilterEnabledChanged, old model is of type `FilterModel`
            var oldColumns = advancedFilterEnabledChanged ? Object.keys(oldModel !== null && oldModel !== void 0 ? oldModel : {}) : this.getAdvancedFilterColumns(oldModel);
            var newColumns_1 = this.getAdvancedFilterColumns(newModel);
            oldColumns.forEach(function (column) { return newColumns_1.add(column); });
            changedColumns = Array.from(newColumns_1);
        }
        else {
            newModel = this.filterManager.getFilterModel();
            if (advancedFilterEnabledChanged) {
                // old model is of type `AdvancedFilterModel | null`
                var oldColumns_1 = this.getAdvancedFilterColumns(oldModel);
                Object.keys(newModel).forEach(function (column) { return oldColumns_1.add(column); });
                changedColumns = Array.from(oldColumns_1);
            }
            else {
                changedColumns = this.findChangedColumns(oldModel, newModel);
            }
        }
        var valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
        var secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);
        var params = {
            valueColChanged: valueColChanged,
            secondaryColChanged: secondaryColChanged,
            changedColumns: changedColumns
        };
        this.serverSideRowModel.refreshAfterFilter(newModel, params);
    };
    FilterListener.prototype.findChangedColumns = function (oldModel, newModel) {
        var allColKeysMap = {};
        Object.keys(oldModel).forEach(function (key) { return allColKeysMap[key] = true; });
        Object.keys(newModel).forEach(function (key) { return allColKeysMap[key] = true; });
        var res = [];
        Object.keys(allColKeysMap).forEach(function (key) {
            var oldJson = JSON.stringify(oldModel[key]);
            var newJson = JSON.stringify(newModel[key]);
            var filterChanged = oldJson != newJson;
            if (filterChanged) {
                res.push(key);
            }
        });
        return res;
    };
    FilterListener.prototype.getAdvancedFilterColumns = function (model) {
        var columns = new Set();
        if (!model) {
            return columns;
        }
        var processAdvancedFilterModel = function (filterModel) {
            if (filterModel.filterType === 'join') {
                filterModel.conditions.forEach(function (condition) { return processAdvancedFilterModel(condition); });
            }
            else {
                columns.add(filterModel.colId);
            }
        };
        processAdvancedFilterModel(model);
        return columns;
    };
    __decorate$6([
        core.Autowired('rowModel')
    ], FilterListener.prototype, "serverSideRowModel", void 0);
    __decorate$6([
        core.Autowired('filterManager')
    ], FilterListener.prototype, "filterManager", void 0);
    __decorate$6([
        core.Autowired('ssrmListenerUtils')
    ], FilterListener.prototype, "listenerUtils", void 0);
    __decorate$6([
        core.PostConstruct
    ], FilterListener.prototype, "postConstruct", null);
    FilterListener = __decorate$6([
        core.Bean('ssrmFilterListener')
    ], FilterListener);
    return FilterListener;
}(core.BeanStub));

var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StoreFactory = /** @class */ (function () {
    function StoreFactory() {
    }
    StoreFactory.prototype.createStore = function (ssrmParams, parentNode) {
        var storeParams = this.getStoreParams(ssrmParams, parentNode);
        var CacheClass = storeParams.suppressInfiniteScroll ? FullStore : LazyStore;
        return new CacheClass(ssrmParams, storeParams, parentNode);
    };
    StoreFactory.prototype.getStoreParams = function (ssrmParams, parentNode) {
        var userStoreParams = this.getLevelSpecificParams(parentNode);
        // if user provided overrideParams, we take infiniteScroll from there if it exists
        var infiniteScroll = this.isInfiniteScroll(userStoreParams);
        var cacheBlockSize = this.getBlockSize(infiniteScroll, userStoreParams);
        var maxBlocksInCache = this.getMaxBlocksInCache(infiniteScroll, ssrmParams, userStoreParams);
        var storeParams = {
            suppressInfiniteScroll: !infiniteScroll,
            cacheBlockSize: cacheBlockSize,
            maxBlocksInCache: maxBlocksInCache
        };
        return storeParams;
    };
    StoreFactory.prototype.getMaxBlocksInCache = function (infiniteScroll, ssrmParams, userStoreParams) {
        if (!infiniteScroll) {
            return undefined;
        }
        var maxBlocksInCache = (userStoreParams && userStoreParams.maxBlocksInCache != null)
            ? userStoreParams.maxBlocksInCache
            : this.gridOptionsService.get('maxBlocksInCache');
        var maxBlocksActive = maxBlocksInCache != null && maxBlocksInCache >= 0;
        if (!maxBlocksActive) {
            return undefined;
        }
        if (ssrmParams.dynamicRowHeight) {
            var message = 'Server Side Row Model does not support Dynamic Row Height and Cache Purging. ' +
                'Either a) remove getRowHeight() callback or b) remove maxBlocksInCache property. Purging has been disabled.';
            core._.warnOnce(message);
            return undefined;
        }
        if (this.columnModel.isAutoRowHeightActive()) {
            var message = 'Server Side Row Model does not support Auto Row Height and Cache Purging. ' +
                'Either a) remove colDef.autoHeight or b) remove maxBlocksInCache property. Purging has been disabled.';
            core._.warnOnce(message);
            return undefined;
        }
        return maxBlocksInCache;
    };
    StoreFactory.prototype.getBlockSize = function (infiniteScroll, userStoreParams) {
        if (!infiniteScroll) {
            return undefined;
        }
        var blockSize = (userStoreParams && userStoreParams.cacheBlockSize != null)
            ? userStoreParams.cacheBlockSize
            : this.gridOptionsService.get('cacheBlockSize');
        if (blockSize != null && blockSize > 0) {
            return blockSize;
        }
        else {
            return 100;
        }
    };
    StoreFactory.prototype.getLevelSpecificParams = function (parentNode) {
        var callback = this.gridOptionsService.getCallback('getServerSideGroupLevelParams');
        if (!callback) {
            return undefined;
        }
        var params = {
            level: parentNode.level + 1,
            parentRowNode: parentNode.level >= 0 ? parentNode : undefined,
            rowGroupColumns: this.columnModel.getRowGroupColumns(),
            pivotColumns: this.columnModel.getPivotColumns(),
            pivotMode: this.columnModel.isPivotMode()
        };
        var res = callback(params);
        return res;
    };
    StoreFactory.prototype.isInfiniteScroll = function (storeParams) {
        var res = (storeParams && storeParams.suppressInfiniteScroll != null)
            ? storeParams.suppressInfiniteScroll
            : this.isSuppressServerSideInfiniteScroll();
        return !res;
    };
    StoreFactory.prototype.isSuppressServerSideInfiniteScroll = function () {
        return this.gridOptionsService.get('suppressServerSideInfiniteScroll');
    };
    __decorate$5([
        core.Autowired('gridOptionsService')
    ], StoreFactory.prototype, "gridOptionsService", void 0);
    __decorate$5([
        core.Autowired('columnModel')
    ], StoreFactory.prototype, "columnModel", void 0);
    StoreFactory = __decorate$5([
        core.Bean('ssrmStoreFactory')
    ], StoreFactory);
    return StoreFactory;
}());

var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ListenerUtils = /** @class */ (function () {
    function ListenerUtils() {
    }
    ListenerUtils.prototype.isSortingWithValueColumn = function (changedColumnsInSort) {
        var valueColIds = this.columnModel.getValueColumns().map(function (col) { return col.getColId(); });
        for (var i = 0; i < changedColumnsInSort.length; i++) {
            if (valueColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }
        return false;
    };
    ListenerUtils.prototype.isSortingWithSecondaryColumn = function (changedColumnsInSort) {
        if (!this.columnModel.getSecondaryColumns()) {
            return false;
        }
        var secondaryColIds = this.columnModel.getSecondaryColumns().map(function (col) { return col.getColId(); });
        for (var i = 0; i < changedColumnsInSort.length; i++) {
            if (secondaryColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }
        return false;
    };
    __decorate$4([
        core.Autowired('columnModel')
    ], ListenerUtils.prototype, "columnModel", void 0);
    ListenerUtils = __decorate$4([
        core.Bean('ssrmListenerUtils')
    ], ListenerUtils);
    return ListenerUtils;
}());

var __extends$3 = (undefined && undefined.__extends) || (function () {
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
var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read$1 = (undefined && undefined.__read) || function (o, n) {
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
var __spreadArray$1 = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var DefaultStrategy = /** @class */ (function (_super) {
    __extends$3(DefaultStrategy, _super);
    function DefaultStrategy() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.selectedState = { selectAll: false, toggledNodes: new Set() };
        _this.lastSelected = null;
        _this.selectAllUsed = false;
        // this is to prevent regressions, default selectionService retains reference of clicked nodes.
        _this.selectedNodes = {};
        return _this;
    }
    DefaultStrategy.prototype.init = function () {
        var _this = this;
        this.rowSelection = this.gridOptionsService.get('rowSelection');
        this.addManagedPropertyListener('rowSelection', function (propChange) {
            _this.rowSelection = propChange.currentValue;
        });
    };
    DefaultStrategy.prototype.getSelectedState = function () {
        return {
            selectAll: this.selectedState.selectAll,
            toggledNodes: __spreadArray$1([], __read$1(this.selectedState.toggledNodes), false),
        };
    };
    DefaultStrategy.prototype.setSelectedState = function (state) {
        // fire selection changed event
        var newState = {
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
            state.toggledNodes.forEach(function (key) {
                if (typeof key === 'string') {
                    newState.toggledNodes.add(key);
                }
                else {
                    console.warn("AG Grid: Provided ids must be of string type. Invalid id provided: ".concat(key));
                }
            });
        }
        else {
            console.error('AG Grid: `toggledNodes` must be an array of string ids.');
            return;
        }
        this.selectedState = newState;
    };
    DefaultStrategy.prototype.deleteSelectionStateFromParent = function (parentPath, removedNodeIds) {
        var _this = this;
        if (this.selectedState.toggledNodes.size === 0) {
            return false;
        }
        var anyNodesToggled = false;
        removedNodeIds.forEach(function (id) {
            if (_this.selectedState.toggledNodes.delete(id)) {
                anyNodesToggled = true;
            }
        });
        return anyNodesToggled;
    };
    DefaultStrategy.prototype.setNodesSelected = function (params) {
        var _a;
        var _this = this;
        if (params.nodes.length === 0)
            return 0;
        var onlyThisNode = params.clearSelection && params.newValue && !params.rangeSelect;
        if (this.rowSelection !== 'multiple' || onlyThisNode) {
            if (params.nodes.length > 1) {
                throw new Error('AG Grid: cannot select multiple rows when rowSelection is set to \'single\'');
            }
            var node = params.nodes[0];
            if (params.newValue) {
                this.selectedNodes = (_a = {}, _a[node.id] = node, _a);
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
        var updateNodeState = function (node) {
            if (params.newValue) {
                _this.selectedNodes[node.id] = node;
            }
            else {
                delete _this.selectedNodes[node.id];
            }
            var isNodeSelectable = node.selectable;
            var doesNodeConform = params.newValue === _this.selectedState.selectAll;
            if (doesNodeConform || !isNodeSelectable) {
                _this.selectedState.toggledNodes.delete(node.id);
                return;
            }
            _this.selectedState.toggledNodes.add(node.id);
        };
        if (params.rangeSelect && this.lastSelected) {
            if (params.nodes.length > 1) {
                throw new Error('AG Grid: cannot select multiple rows when using rangeSelect');
            }
            var node = params.nodes[0];
            var lastSelectedNode = this.rowModel.getRowNode(this.lastSelected);
            this.rowModel.getNodesInRangeForSelection(node, lastSelectedNode !== null && lastSelectedNode !== void 0 ? lastSelectedNode : null).forEach(updateNodeState);
            this.lastSelected = node.id;
            return 1;
        }
        params.nodes.forEach(updateNodeState);
        this.lastSelected = params.nodes[params.nodes.length - 1].id;
        return 1;
    };
    DefaultStrategy.prototype.processNewRow = function (node) {
        if (this.selectedNodes[node.id]) {
            this.selectedNodes[node.id] = node;
        }
    };
    DefaultStrategy.prototype.isNodeSelected = function (node) {
        var isToggled = this.selectedState.toggledNodes.has(node.id);
        return this.selectedState.selectAll ? !isToggled : isToggled;
    };
    DefaultStrategy.prototype.getSelectedNodes = function () {
        if (this.selectAllUsed) {
            console.warn("AG Grid: getSelectedNodes and getSelectedRows functions cannot be used with select all functionality with the server-side row model.\n                Use `api.getServerSideSelectionState()` instead.");
        }
        return Object.values(this.selectedNodes);
    };
    DefaultStrategy.prototype.getSelectedRows = function () {
        return this.getSelectedNodes().map(function (node) { return node.data; });
    };
    DefaultStrategy.prototype.getSelectionCount = function () {
        if (this.selectedState.selectAll) {
            return -1;
        }
        return this.selectedState.toggledNodes.size;
    };
    DefaultStrategy.prototype.clearOtherNodes = function (rowNodeToKeepSelected, source) {
        var clearedRows = this.selectedState.selectAll ? 1 : this.selectedState.toggledNodes.size - 1;
        this.selectedState = {
            selectAll: false,
            toggledNodes: new Set([rowNodeToKeepSelected.id]),
        };
        this.rowModel.forEachNode(function (node) {
            if (node !== rowNodeToKeepSelected) {
                node.selectThisNode(false, undefined, source);
            }
        });
        var event = {
            type: core.Events.EVENT_SELECTION_CHANGED,
            source: source,
        };
        this.eventService.dispatchEvent(event);
        return clearedRows;
    };
    DefaultStrategy.prototype.isEmpty = function () {
        var _a;
        return !this.selectedState.selectAll && !((_a = this.selectedState.toggledNodes) === null || _a === void 0 ? void 0 : _a.size);
    };
    DefaultStrategy.prototype.selectAllRowNodes = function (params) {
        this.selectedState = { selectAll: true, toggledNodes: new Set() };
        this.selectedNodes = {};
        this.selectAllUsed = true;
    };
    DefaultStrategy.prototype.deselectAllRowNodes = function (params) {
        this.selectedState = { selectAll: false, toggledNodes: new Set() };
        this.selectedNodes = {};
    };
    DefaultStrategy.prototype.getSelectAllState = function (justFiltered, justCurrentPage) {
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
    };
    __decorate$3([
        core.Autowired('rowModel')
    ], DefaultStrategy.prototype, "rowModel", void 0);
    __decorate$3([
        core.PostConstruct
    ], DefaultStrategy.prototype, "init", null);
    return DefaultStrategy;
}(core.BeanStub));

var __extends$2 = (undefined && undefined.__extends) || (function () {
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
var __assign$1 = (undefined && undefined.__assign) || function () {
    __assign$1 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$1.apply(this, arguments);
};
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest$1 = (undefined && undefined.__rest) || function (s, e) {
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
var __read = (undefined && undefined.__read) || function (o, n) {
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
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var GroupSelectsChildrenStrategy = /** @class */ (function (_super) {
    __extends$2(GroupSelectsChildrenStrategy, _super);
    function GroupSelectsChildrenStrategy() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.selectedState = { selectAllChildren: false, toggledNodes: new Map() };
        _this.lastSelected = null;
        return _this;
    }
    GroupSelectsChildrenStrategy.prototype.init = function () {
        var _this = this;
        // if model has updated, a store may now be fully loaded to clean up indeterminate states
        this.addManagedListener(this.eventService, core.Events.EVENT_MODEL_UPDATED, function () { return _this.removeRedundantState(); });
        // when the grouping changes, the state no longer makes sense, so reset the state.
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, function () { return _this.selectionService.reset('rowGroupChanged'); });
    };
    GroupSelectsChildrenStrategy.prototype.getSelectedState = function () {
        var _this = this;
        var recursivelySerializeState = function (state, level, nodeId) {
            var normalisedState = {
                nodeId: nodeId,
            };
            if (level <= _this.columnModel.getRowGroupColumns().length) {
                normalisedState.selectAllChildren = state.selectAllChildren;
            }
            // omit toggledNodes if empty
            if (state.toggledNodes.size) {
                var toggledNodes_1 = [];
                state.toggledNodes.forEach(function (value, key) {
                    var newState = recursivelySerializeState(value, level + 1, key);
                    toggledNodes_1.push(newState);
                });
                normalisedState.toggledNodes = toggledNodes_1;
            }
            return normalisedState;
        };
        return recursivelySerializeState(this.selectedState, 0);
    };
    GroupSelectsChildrenStrategy.prototype.setSelectedState = function (state) {
        var recursivelyDeserializeState = function (normalisedState, parentSelected) {
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
                var allHaveIds = normalisedState.toggledNodes.every(function (innerState) { return (typeof innerState === 'object' && 'nodeId' in innerState && typeof innerState.nodeId === 'string'); });
                if (!allHaveIds) {
                    throw new Error('AG Grid: Every `toggledNode` requires an associated string id.');
                }
            }
            var isThisNodeSelected = (_a = normalisedState.selectAllChildren) !== null && _a !== void 0 ? _a : !parentSelected;
            var convertedChildren = (_b = normalisedState.toggledNodes) === null || _b === void 0 ? void 0 : _b.map(function (innerState) { return ([innerState.nodeId, recursivelyDeserializeState(innerState, isThisNodeSelected)]); });
            var doesRedundantStateExist = convertedChildren === null || convertedChildren === void 0 ? void 0 : convertedChildren.some(function (_a) {
                var _b = __read(_a, 2); _b[0]; var innerState = _b[1];
                return isThisNodeSelected === innerState.selectAllChildren && innerState.toggledNodes.size === 0;
            });
            if (doesRedundantStateExist) {
                throw new Error("\n                    AG Grid: AG Grid: Row selection state could not be parsed due to invalid data. Ensure all child state has toggledNodes or does not conform with the parent rule.\n                    Please rebuild the selection state and reapply it.\n                ");
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
    };
    GroupSelectsChildrenStrategy.prototype.deleteSelectionStateFromParent = function (parentRoute, removedNodeIds) {
        var parentState = this.selectedState;
        var remainingRoute = __spreadArray([], __read(parentRoute), false);
        while (parentState && remainingRoute.length) {
            parentState = parentState.toggledNodes.get(remainingRoute.pop());
        }
        // parent has no explicit state, nothing to remove
        if (!parentState) {
            return false;
        }
        var anyStateChanged = false;
        removedNodeIds.forEach(function (id) {
            if (parentState === null || parentState === void 0 ? void 0 : parentState.toggledNodes.delete(id)) {
                anyStateChanged = true;
            }
        });
        if (anyStateChanged) {
            this.removeRedundantState();
        }
        return anyStateChanged;
    };
    GroupSelectsChildrenStrategy.prototype.setNodesSelected = function (params) {
        var _this = this;
        var nodes = params.nodes, other = __rest$1(params, ["nodes"]);
        if (nodes.length === 0)
            return 0;
        if (params.rangeSelect) {
            if (nodes.length > 1) {
                throw new Error('AG Grid: cannot select multiple rows when using rangeSelect');
            }
            var node_1 = nodes[0];
            var rangeOfNodes = this.rowModel.getNodesInRangeForSelection(node_1, this.lastSelected);
            // sort the routes by route length, high to low, this means we can do the lowest level children first
            var routes = rangeOfNodes.map(this.getRouteToNode).sort(function (a, b) { return b.length - a.length; });
            // skip routes if we've already done a descendent
            var completedRoutes_1 = new Set();
            routes.forEach(function (route) {
                // skip routes if we've already selected a descendent
                if (completedRoutes_1.has(route[route.length - 1])) {
                    return;
                }
                route.forEach(function (part) { return completedRoutes_1.add(part); });
                _this.recursivelySelectNode(route, _this.selectedState, __assign$1({ node: node_1 }, other));
            });
            this.removeRedundantState();
            this.lastSelected = node_1;
            return 1;
        }
        params.nodes.forEach(function (node) {
            var idPathToNode = _this.getRouteToNode(node);
            _this.recursivelySelectNode(idPathToNode, _this.selectedState, __assign$1(__assign$1({}, other), { node: node }));
        });
        this.removeRedundantState();
        this.lastSelected = params.nodes[params.nodes.length - 1];
        return 1;
    };
    GroupSelectsChildrenStrategy.prototype.isNodeSelected = function (node) {
        var path = this.getRouteToNode(node);
        return this.isNodePathSelected(path, this.selectedState);
    };
    GroupSelectsChildrenStrategy.prototype.isNodePathSelected = function (_a, state) {
        var _b = __read(_a), nextNode = _b[0], nodes = _b.slice(1);
        if (nodes.length === 0) {
            var isToggled = state.toggledNodes.has(nextNode.id);
            if (nextNode.hasChildren()) {
                var groupState = state.toggledNodes.get(nextNode.id);
                if (groupState && groupState.toggledNodes.size) {
                    return undefined;
                }
            }
            return state.selectAllChildren ? !isToggled : isToggled;
        }
        // if there's a deeper level, check recursively
        if (state.toggledNodes.has(nextNode.id)) {
            var nextState = state.toggledNodes.get(nextNode.id);
            if (nextState) {
                return this.isNodePathSelected(nodes, nextState);
            }
        }
        // no deeper custom state, respect the closest default
        return !!state.selectAllChildren;
    };
    GroupSelectsChildrenStrategy.prototype.getRouteToNode = function (node) {
        var pathToNode = [];
        var tempNode = node;
        while (tempNode.parent) {
            pathToNode.push(tempNode);
            tempNode = tempNode.parent;
        }
        return pathToNode.reverse();
    };
    GroupSelectsChildrenStrategy.prototype.removeRedundantState = function () {
        var _this = this;
        if (this.filterManager.isAnyFilterPresent()) {
            return;
        }
        var recursivelyRemoveState = function (selectedState, store, node) {
            if (selectedState === void 0) { selectedState = _this.selectedState; }
            if (store === void 0) { store = _this.serverSideRowModel.getRootStore(); }
            var allChildNodesFound = true;
            var noIndeterminateChildren = true;
            selectedState.toggledNodes.forEach(function (state, id) {
                var parentNode = _this.rowModel.getRowNode(id);
                if (!parentNode) {
                    allChildNodesFound = false;
                }
                var nextStore = parentNode === null || parentNode === void 0 ? void 0 : parentNode.childStore;
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
    };
    GroupSelectsChildrenStrategy.prototype.recursivelySelectNode = function (_a, selectedState, params) {
        var _b = __read(_a), nextNode = _b[0], nodes = _b.slice(1);
        if (!nextNode) {
            return;
        }
        // if this is the last node, hard add/remove based on its selectAllChildren state
        var isLastNode = !nodes.length;
        if (isLastNode) {
            // if the node is not selectable, we should never have it in selection state
            var isNodeSelectable = nextNode.selectable;
            var doesNodeConform = selectedState.selectAllChildren === params.newValue;
            if (doesNodeConform || !isNodeSelectable) {
                selectedState.toggledNodes.delete(nextNode.id);
                return;
            }
            var newState = {
                selectAllChildren: params.newValue,
                toggledNodes: new Map(),
            };
            selectedState.toggledNodes.set(nextNode.id, newState);
            return;
        }
        var doesStateAlreadyExist = selectedState.toggledNodes.has(nextNode.id);
        var childState = doesStateAlreadyExist ? (selectedState.toggledNodes.get(nextNode.id)) : {
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
    };
    GroupSelectsChildrenStrategy.prototype.getSelectedNodes = function () {
        console.warn("AG Grid: `getSelectedNodes` and `getSelectedRows` functions cannot be used with `groupSelectsChildren` and the server-side row model.\n            Use `api.getServerSideSelectionState()` instead.");
        var selectedNodes = [];
        this.rowModel.forEachNode(function (node) {
            if (node.isSelected()) {
                selectedNodes.push(node);
            }
        });
        return selectedNodes;
    };
    GroupSelectsChildrenStrategy.prototype.processNewRow = function (node) {
        // This is used for updating outdated node refs, as this model entirely uses ids it's irrelevant
    };
    GroupSelectsChildrenStrategy.prototype.getSelectedRows = function () {
        return this.getSelectedNodes().map(function (node) { return node.data; });
    };
    GroupSelectsChildrenStrategy.prototype.getSelectionCount = function () {
        return -1;
    };
    GroupSelectsChildrenStrategy.prototype.isEmpty = function () {
        var _a;
        return !this.selectedState.selectAllChildren && !((_a = this.selectedState.toggledNodes) === null || _a === void 0 ? void 0 : _a.size);
    };
    GroupSelectsChildrenStrategy.prototype.selectAllRowNodes = function (params) {
        this.selectedState = { selectAllChildren: true, toggledNodes: new Map() };
    };
    GroupSelectsChildrenStrategy.prototype.deselectAllRowNodes = function (params) {
        this.selectedState = { selectAllChildren: false, toggledNodes: new Map() };
    };
    GroupSelectsChildrenStrategy.prototype.getSelectAllState = function (justFiltered, justCurrentPage) {
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
    };
    __decorate$2([
        core.Autowired('rowModel')
    ], GroupSelectsChildrenStrategy.prototype, "rowModel", void 0);
    __decorate$2([
        core.Autowired('columnModel')
    ], GroupSelectsChildrenStrategy.prototype, "columnModel", void 0);
    __decorate$2([
        core.Autowired('filterManager')
    ], GroupSelectsChildrenStrategy.prototype, "filterManager", void 0);
    __decorate$2([
        core.Autowired('rowModel')
    ], GroupSelectsChildrenStrategy.prototype, "serverSideRowModel", void 0);
    __decorate$2([
        core.Autowired('selectionService')
    ], GroupSelectsChildrenStrategy.prototype, "selectionService", void 0);
    __decorate$2([
        core.PostConstruct
    ], GroupSelectsChildrenStrategy.prototype, "init", null);
    return GroupSelectsChildrenStrategy;
}(core.BeanStub));

var __extends$1 = (undefined && undefined.__extends) || (function () {
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
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var ServerSideSelectionService = /** @class */ (function (_super) {
    __extends$1(ServerSideSelectionService, _super);
    function ServerSideSelectionService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ServerSideSelectionService.prototype.init = function () {
        var _this = this;
        var groupSelectsChildren = this.gridOptionsService.get('groupSelectsChildren');
        this.addManagedPropertyListener('groupSelectsChildren', function (propChange) {
            _this.destroyBean(_this.selectionStrategy);
            var StrategyClazz = !propChange.currentValue ? DefaultStrategy : GroupSelectsChildrenStrategy;
            _this.selectionStrategy = _this.createManagedBean(new StrategyClazz());
            _this.shotgunResetNodeSelectionState();
            var event = {
                type: core.Events.EVENT_SELECTION_CHANGED,
                source: 'api',
            };
            _this.eventService.dispatchEvent(event);
        });
        this.addManagedPropertyListener('rowSelection', function () { return _this.deselectAllRowNodes({ source: 'api' }); });
        var StrategyClazz = !groupSelectsChildren ? DefaultStrategy : GroupSelectsChildrenStrategy;
        this.selectionStrategy = this.createManagedBean(new StrategyClazz());
    };
    ServerSideSelectionService.prototype.getSelectionState = function () {
        return this.selectionStrategy.getSelectedState();
    };
    ServerSideSelectionService.prototype.setSelectionState = function (state, source) {
        if (Array.isArray(state)) {
            return;
        }
        this.selectionStrategy.setSelectedState(state);
        this.shotgunResetNodeSelectionState();
        var event = {
            type: core.Events.EVENT_SELECTION_CHANGED,
            source: source,
        };
        this.eventService.dispatchEvent(event);
    };
    ServerSideSelectionService.prototype.setNodesSelected = function (params) {
        var nodes = params.nodes, otherParams = __rest(params, ["nodes"]);
        var rowSelection = this.gridOptionsService.get('rowSelection');
        if (nodes.length > 1 && rowSelection !== 'multiple') {
            console.warn("AG Grid: cannot multi select while rowSelection='single'");
            return 0;
        }
        if (nodes.length > 1 && params.rangeSelect) {
            console.warn("AG Grid: cannot use range selection when multi selecting rows");
            return 0;
        }
        var adjustedParams = __assign({ nodes: nodes.filter(function (node) { return node.selectable; }) }, otherParams);
        // if no selectable nodes, then return 0
        if (!adjustedParams.nodes.length) {
            return 0;
        }
        var changedNodes = this.selectionStrategy.setNodesSelected(adjustedParams);
        this.shotgunResetNodeSelectionState(adjustedParams.source);
        var event = {
            type: core.Events.EVENT_SELECTION_CHANGED,
            source: adjustedParams.source,
        };
        this.eventService.dispatchEvent(event);
        return changedNodes;
    };
    /**
     * Deletes the selection state for a set of nodes, for use after deleting nodes via
     * transaction. As this is designed for transactions, all nodes should belong to the same group.
     */
    ServerSideSelectionService.prototype.deleteSelectionStateFromParent = function (storeRoute, removedNodeIds) {
        var stateChanged = this.selectionStrategy.deleteSelectionStateFromParent(storeRoute, removedNodeIds);
        if (!stateChanged) {
            return;
        }
        this.shotgunResetNodeSelectionState();
        var event = {
            type: core.Events.EVENT_SELECTION_CHANGED,
            source: 'api',
        };
        this.eventService.dispatchEvent(event);
    };
    ServerSideSelectionService.prototype.shotgunResetNodeSelectionState = function (source) {
        var _this = this;
        this.rowModel.forEachNode(function (node) {
            if (node.stub) {
                return;
            }
            var isNodeSelected = _this.selectionStrategy.isNodeSelected(node);
            if (isNodeSelected !== node.isSelected()) {
                node.selectThisNode(isNodeSelected, undefined, source);
            }
        });
    };
    ServerSideSelectionService.prototype.getSelectedNodes = function () {
        return this.selectionStrategy.getSelectedNodes();
    };
    ServerSideSelectionService.prototype.getSelectedRows = function () {
        return this.selectionStrategy.getSelectedRows();
    };
    ServerSideSelectionService.prototype.getSelectionCount = function () {
        return this.selectionStrategy.getSelectionCount();
    };
    ServerSideSelectionService.prototype.syncInRowNode = function (rowNode, oldNode) {
        // update any refs being held in the strategies
        this.selectionStrategy.processNewRow(rowNode);
        var isNodeSelected = this.selectionStrategy.isNodeSelected(rowNode);
        // if the node was selected but node is not selectable, we deselect the node.
        // (could be due to user applying selected state directly, or a change in selectable)
        if (isNodeSelected != false && !rowNode.selectable) {
            this.selectionStrategy.setNodesSelected({
                nodes: [rowNode],
                newValue: false,
                source: 'api',
            });
            // we need to shotgun reset here as if this was hierarchical, some group nodes
            // may be changing from indeterminate to unchecked.
            this.shotgunResetNodeSelectionState();
            var event_1 = {
                type: core.Events.EVENT_SELECTION_CHANGED,
                source: 'api',
            };
            this.eventService.dispatchEvent(event_1);
            return;
        }
        rowNode.setSelectedInitialValue(isNodeSelected);
    };
    ServerSideSelectionService.prototype.reset = function () {
        this.selectionStrategy.deselectAllRowNodes({ source: 'api' });
    };
    ServerSideSelectionService.prototype.isEmpty = function () {
        return this.selectionStrategy.isEmpty();
    };
    ServerSideSelectionService.prototype.selectAllRowNodes = function (params) {
        if (params.justCurrentPage || params.justFiltered) {
            console.warn("AG Grid: selecting just filtered only works when gridOptions.rowModelType='clientSide'");
        }
        this.selectionStrategy.selectAllRowNodes(params);
        this.rowModel.forEachNode(function (node) {
            if (node.stub) {
                return;
            }
            node.selectThisNode(true, undefined, params.source);
        });
        var event = {
            type: core.Events.EVENT_SELECTION_CHANGED,
            source: params.source,
        };
        this.eventService.dispatchEvent(event);
    };
    ServerSideSelectionService.prototype.deselectAllRowNodes = function (params) {
        if (params.justCurrentPage || params.justFiltered) {
            console.warn("AG Grid: selecting just filtered only works when gridOptions.rowModelType='clientSide'");
        }
        this.selectionStrategy.deselectAllRowNodes(params);
        this.rowModel.forEachNode(function (node) {
            if (node.stub) {
                return;
            }
            node.selectThisNode(false, undefined, params.source);
        });
        var event = {
            type: core.Events.EVENT_SELECTION_CHANGED,
            source: params.source,
        };
        this.eventService.dispatchEvent(event);
    };
    ServerSideSelectionService.prototype.getSelectAllState = function (justFiltered, justCurrentPage) {
        return this.selectionStrategy.getSelectAllState(justFiltered, justCurrentPage);
    };
    // used by CSRM
    ServerSideSelectionService.prototype.updateGroupsFromChildrenSelections = function (source, changedPath) {
        return false;
    };
    // used by CSRM
    ServerSideSelectionService.prototype.getBestCostNodeSelection = function () {
        console.warn('AG Grid: calling gridApi.getBestCostNodeSelection() is only possible when using rowModelType=`clientSide`.');
        return undefined;
    };
    // used by CSRM
    ServerSideSelectionService.prototype.filterFromSelection = function () {
        return;
    };
    __decorate$1([
        core.Autowired('rowModel')
    ], ServerSideSelectionService.prototype, "rowModel", void 0);
    __decorate$1([
        core.PostConstruct
    ], ServerSideSelectionService.prototype, "init", null);
    ServerSideSelectionService = __decorate$1([
        core.Bean('selectionService')
    ], ServerSideSelectionService);
    return ServerSideSelectionService;
}(core.BeanStub));

// DO NOT UPDATE MANUALLY: Generated from script during build time
var VERSION = '31.0.0';

var __extends = (undefined && undefined.__extends) || (function () {
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
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ServerSideExpansionService = /** @class */ (function (_super) {
    __extends(ServerSideExpansionService, _super);
    function ServerSideExpansionService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.queuedRowIds = new Set();
        return _this;
    }
    ServerSideExpansionService.prototype.postConstruct = function () {
        var _this = this;
        _super.prototype.postConstruct.call(this);
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, function () {
            _this.queuedRowIds.clear();
        });
    };
    ServerSideExpansionService.prototype.checkOpenByDefault = function (rowNode) {
        if (!rowNode.isExpandable()) {
            return;
        }
        var expandRowNode = function () {
            // we do this in a timeout, so that we don't expand a row node while in the middle
            // of setting up rows, setting up rows is complex enough without another chunk of work
            // getting added to the call stack. this is also helpful as openByDefault may or may
            // not happen (so makes setting up rows more deterministic by expands never happening)
            // and also checkOpenByDefault is shard with both store types, so easier control how it
            // impacts things by keeping it in new VM turn.
            window.setTimeout(function () { return rowNode.setExpanded(true); }, 0);
        };
        if (this.queuedRowIds.has(rowNode.id)) {
            this.queuedRowIds.delete(rowNode.id);
            expandRowNode();
            return;
        }
        var userFunc = this.gridOptionsService.getCallback('isServerSideGroupOpenByDefault');
        if (!userFunc) {
            return;
        }
        var params = {
            data: rowNode.data,
            rowNode: rowNode
        };
        var userFuncRes = userFunc(params);
        if (userFuncRes) {
            expandRowNode();
        }
    };
    ServerSideExpansionService.prototype.expandRows = function (rowIds) {
        var _this = this;
        rowIds.forEach(function (rowId) {
            var rowNode = _this.serverSideRowModel.getRowNode(rowId);
            if (rowNode) {
                rowNode.setExpanded(true);
            }
            else {
                _this.queuedRowIds.add(rowId);
            }
        });
    };
    ServerSideExpansionService.prototype.expandAll = function (value) {
        this.serverSideRowModel.expandAll(value);
    };
    ServerSideExpansionService.prototype.onGroupExpandedOrCollapsed = function () {
        // do nothing
    };
    __decorate([
        core.Autowired('rowModel')
    ], ServerSideExpansionService.prototype, "serverSideRowModel", void 0);
    ServerSideExpansionService = __decorate([
        core.Bean('expansionService')
    ], ServerSideExpansionService);
    return ServerSideExpansionService;
}(core.ExpansionService));

var ServerSideRowModelModule = {
    version: VERSION,
    moduleName: core.ModuleNames.ServerSideRowModelModule,
    rowModel: 'serverSide',
    beans: [ServerSideRowModel, ExpandListener, SortListener, StoreUtils, BlockUtils, NodeManager, TransactionManager,
        FilterListener, StoreFactory, ListenerUtils, ServerSideSelectionService, ServerSideExpansionService],
    dependantModules: [
        core$1.EnterpriseCoreModule
    ]
};

exports.ServerSideRowModelModule = ServerSideRowModelModule;
