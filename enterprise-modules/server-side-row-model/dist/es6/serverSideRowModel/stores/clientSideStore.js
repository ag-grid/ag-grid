var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
import { _, Autowired, Events, NumberSequence, PostConstruct, PreDestroy, RowNodeBlock, ServerSideTransactionResultStatus } from "@ag-grid-community/core";
var ClientSideStore = /** @class */ (function (_super) {
    __extends(ClientSideStore, _super);
    function ClientSideStore(ssrmParams, storeParams, parentRowNode) {
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
    ClientSideStore.prototype.postConstruct = function () {
        var _this = this;
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
        this.usingMasterDetail = this.gridOptionsWrapper.isMasterDetail();
        this.nodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.parentRowNode);
        if (!this.usingTreeData && this.groupLevel) {
            var groupColVo = this.ssrmParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnController.getRowGroupColumns()[this.level];
        }
        this.initialiseRowNodes();
        this.rowNodeBlockLoader.addBlock(this);
        this.addDestroyFunc(function () { return _this.rowNodeBlockLoader.removeBlock(_this); });
    };
    ClientSideStore.prototype.destroyRowNodes = function () {
        var _this = this;
        if (this.allRowNodes) {
            this.allRowNodes.forEach(function (rowNode) {
                if (rowNode.childrenCache) {
                    _this.destroyBean(rowNode.childrenCache);
                    rowNode.childrenCache = null;
                }
                // this is needed, so row render knows to fade out the row, otherwise it
                // sees row top is present, and thinks the row should be shown. maybe
                // rowNode should have a flag on whether it is visible???
                rowNode.clearRowTop();
                if (rowNode.id != null) {
                    _this.nodeManager.removeNode(rowNode);
                }
            });
        }
        this.allRowNodes = [];
        this.nodesAfterSort = [];
        this.nodesAfterFilter = [];
        this.allNodesMap = {};
    };
    ClientSideStore.prototype.initialiseRowNodes = function () {
        this.destroyRowNodes();
        var loadingRowNode = this.blockUtils.createRowNode({ field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
            level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn });
        this.allRowNodes.push(loadingRowNode);
        this.nodesAfterSort.push(loadingRowNode);
        this.nodesAfterFilter.push(loadingRowNode);
    };
    ClientSideStore.prototype.getBlockStateJson = function () {
        return {
            id: this.nodeIdPrefix,
            state: this.getState()
        };
    };
    ClientSideStore.prototype.loadFromDatasource = function () {
        this.cacheUtils.loadFromDatasource({
            startRow: undefined,
            endRow: undefined,
            parentNode: this.parentRowNode,
            storeParams: this.ssrmParams,
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            success: this.success.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this),
            fail: this.pageLoadFailed.bind(this)
        });
    };
    ClientSideStore.prototype.getStartRow = function () {
        return 0; // always zero as not in a cache
    };
    ClientSideStore.prototype.getEndRow = function () {
        return this.nodesAfterSort.length;
    };
    ClientSideStore.prototype.createDataNode = function (data, index) {
        var rowNode = this.blockUtils.createRowNode({ field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
            level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn });
        if (index != null) {
            _.insertIntoArray(this.allRowNodes, rowNode, index);
        }
        else {
            this.allRowNodes.push(rowNode);
        }
        var defaultId = this.nodeIdPrefix + this.nodeIdSequence.next();
        this.blockUtils.setDataIntoRowNode(rowNode, data, defaultId);
        this.nodeManager.addRowNode(rowNode);
        this.allNodesMap[rowNode.id] = rowNode;
        return rowNode;
    };
    ClientSideStore.prototype.processServerResult = function (params) {
        if (!this.isAlive()) {
            return;
        }
        if (params.info) {
            _.assign(this.info, params.info);
        }
        this.destroyRowNodes();
        var rowData = params.data ? params.data : [];
        rowData.forEach(this.createDataNode.bind(this));
        this.filterAndSortNodes();
        this.fireStoreUpdatedEvent();
    };
    ClientSideStore.prototype.filterAndSortNodes = function () {
        this.filterRowNodes();
        this.sortRowNodes();
    };
    ClientSideStore.prototype.sortRowNodes = function () {
        var sortOptions = this.sortController.getSortOptions();
        var noSort = !sortOptions || sortOptions.length == 0;
        if (noSort) {
            this.nodesAfterSort = this.nodesAfterFilter;
            return;
        }
        this.nodesAfterSort = this.rowNodeSorter.doFullSort(this.nodesAfterFilter, sortOptions);
    };
    ClientSideStore.prototype.filterRowNodes = function () {
        var _this = this;
        // filtering for ClientSideStore only words at lowest level details.
        // reason is the logic for group filtering was to difficult to work out how it should work at time of writing.
        if (this.groupLevel) {
            this.nodesAfterFilter = this.allRowNodes;
            return;
        }
        this.nodesAfterFilter = this.allRowNodes.filter(function (rowNode) { return _this.filterManager.doesRowPassFilter({ rowNode: rowNode }); });
    };
    ClientSideStore.prototype.clearDisplayIndexes = function () {
        var _this = this;
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.allRowNodes.forEach(function (rowNode) { return _this.blockUtils.clearDisplayIndex(rowNode); });
    };
    ClientSideStore.prototype.getDisplayIndexEnd = function () {
        return this.displayIndexEnd;
    };
    ClientSideStore.prototype.isDisplayIndexInStore = function (displayIndex) {
        if (this.getRowCount() === 0) {
            return false;
        }
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    };
    ClientSideStore.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
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
    ClientSideStore.prototype.forEachNodeDeep = function (callback, sequence) {
        if (sequence === void 0) { sequence = new NumberSequence(); }
        this.allRowNodes.forEach(function (rowNode) {
            callback(rowNode, sequence.next());
            var childCache = rowNode.childrenCache;
            if (childCache) {
                childCache.forEachNodeDeep(callback, sequence);
            }
        });
    };
    ClientSideStore.prototype.getRowUsingDisplayIndex = function (displayRowIndex) {
        var res = this.blockUtils.binarySearchForDisplayIndex(displayRowIndex, this.nodesAfterSort);
        return res;
    };
    ClientSideStore.prototype.getRowBounds = function (index) {
        for (var i = 0; i < this.nodesAfterSort.length; i++) {
            var rowNode = this.nodesAfterSort[i];
            var res = this.blockUtils.extractRowBounds(rowNode, index);
            if (res) {
                return res;
            }
        }
        return null;
    };
    ClientSideStore.prototype.isPixelInRange = function (pixel) {
        return pixel >= this.topPx && pixel < (this.topPx + this.heightPx);
    };
    ClientSideStore.prototype.getRowIndexAtPixel = function (pixel) {
        var _this = this;
        if (pixel <= this.topPx) {
            return this.nodesAfterSort[0].rowIndex;
        }
        if (pixel >= (this.topPx + this.heightPx)) {
            return this.nodesAfterSort[this.nodesAfterSort.length - 1].rowIndex;
        }
        var res;
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
    ClientSideStore.prototype.getChildStore = function (keys) {
        var _this = this;
        return this.cacheUtils.getChildStore(keys, this, function (key) {
            var rowNode = _.find(_this.allRowNodes, function (currentRowNode) { return currentRowNode.key === key; });
            return rowNode;
        });
    };
    ClientSideStore.prototype.forEachChildStore = function (callback) {
        this.allRowNodes.forEach(function (rowNode) {
            var childStore = rowNode.childrenCache;
            if (childStore) {
                callback(childStore);
            }
        });
    };
    ClientSideStore.prototype.refreshAfterFilter = function () {
        this.filterAndSortNodes();
        this.forEachChildStore(function (store) { return store.refreshAfterFilter(); });
    };
    ClientSideStore.prototype.refreshAfterSort = function (params) {
        this.sortRowNodes();
        this.forEachChildStore(function (store) { return store.refreshAfterSort(params); });
    };
    ClientSideStore.prototype.applyTransaction = function (transaction) {
        // we only apply transactions to loaded state
        switch (this.getState()) {
            case RowNodeBlock.STATE_FAILED:
                return { status: ServerSideTransactionResultStatus.StoreLoadingFailed };
            case RowNodeBlock.STATE_LOADING:
                return { status: ServerSideTransactionResultStatus.StoreLoading };
            case RowNodeBlock.STATE_WAITING_TO_LOAD:
                return { status: ServerSideTransactionResultStatus.StoreWaitingToLoad };
        }
        var applyCallback = this.gridOptionsWrapper.getIsApplyServerSideTransactionFunc();
        if (applyCallback) {
            var params = {
                transaction: transaction,
                parentNode: this.parentRowNode,
                info: this.info
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
    ClientSideStore.prototype.updateSelection = function (nodesToUnselect) {
        var selectionChanged = nodesToUnselect.length > 0;
        if (selectionChanged) {
            nodesToUnselect.forEach(function (rowNode) {
                rowNode.setSelected(false, false, true);
            });
            var event_1 = {
                type: Events.EVENT_SELECTION_CHANGED,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi()
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    ClientSideStore.prototype.executeAdd = function (rowDataTran, rowNodeTransaction) {
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
    ClientSideStore.prototype.executeRemove = function (rowDataTran, rowNodeTransaction, nodesToUnselect) {
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
            rowNode.clearRowTop();
            // NOTE: were we could remove from allLeaveChildren, however _.removeFromArray() is expensive, especially
            // if called multiple times (eg deleting lots of rows) and if allLeafChildren is a large list
            rowIdsRemoved[rowNode.id] = true;
            // _.removeFromArray(this.rootNode.allLeafChildren, rowNode);
            delete _this.allNodesMap[rowNode.id];
            rowNodeTransaction.remove.push(rowNode);
        });
        this.allRowNodes = this.allRowNodes.filter(function (rowNode) { return !rowIdsRemoved[rowNode.id]; });
    };
    ClientSideStore.prototype.executeUpdate = function (rowDataTran, rowNodeTransaction, nodesToUnselect) {
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
            rowNode.updateData(item);
            if (!rowNode.selectable && rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }
            rowNodeTransaction.update.push(rowNode);
        });
    };
    ClientSideStore.prototype.lookupRowNode = function (data) {
        var rowNodeIdFunc = this.gridOptionsWrapper.getRowNodeIdFunc();
        var rowNode;
        if (_.exists(rowNodeIdFunc)) {
            // find rowNode using id
            var id = rowNodeIdFunc(data);
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                console.error("ag-Grid: could not find row id=" + id + ", data item was not found for this id");
                return null;
            }
        }
        else {
            // find rowNode using object references
            rowNode = _.find(this.allRowNodes, function (currentRowNode) { return currentRowNode.data === data; });
            if (!rowNode) {
                console.error("ag-Grid: could not find data item as object was not found", data);
                return null;
            }
        }
        return rowNode;
    };
    ClientSideStore.prototype.purgeStore = function () {
        this.initialiseRowNodes();
        this.setStateWaitingToLoad();
        this.rowNodeBlockLoader.checkBlockToLoad();
        this.fireStoreUpdatedEvent();
    };
    // gets called 1) row count changed 2) cache purged 3) items inserted
    ClientSideStore.prototype.fireStoreUpdatedEvent = function () {
        // this results in row model firing ModelUpdated.
        // server side row model also updates the row indexes first
        var event = {
            type: Events.EVENT_STORE_UPDATED
        };
        this.eventService.dispatchEvent(event);
    };
    ClientSideStore.prototype.getRowCount = function () {
        return this.nodesAfterSort.length;
    };
    ClientSideStore.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        var rowNode = this.nodesAfterSort[topLevelIndex];
        return rowNode.rowIndex;
    };
    ClientSideStore.prototype.isLastRowIndexKnown = function () {
        return this.getState() == RowNodeBlock.STATE_LOADED;
    };
    ClientSideStore.prototype.getRowNodesInRange = function (firstInRange, lastInRange) {
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
    __decorate([
        Autowired('ssrmCacheUtils')
    ], ClientSideStore.prototype, "cacheUtils", void 0);
    __decorate([
        Autowired('ssrmBlockUtils')
    ], ClientSideStore.prototype, "blockUtils", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], ClientSideStore.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('columnController')
    ], ClientSideStore.prototype, "columnController", void 0);
    __decorate([
        Autowired('rowRenderer')
    ], ClientSideStore.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired('rowNodeBlockLoader')
    ], ClientSideStore.prototype, "rowNodeBlockLoader", void 0);
    __decorate([
        Autowired('rowNodeSorter')
    ], ClientSideStore.prototype, "rowNodeSorter", void 0);
    __decorate([
        Autowired('sortController')
    ], ClientSideStore.prototype, "sortController", void 0);
    __decorate([
        Autowired('ssrmNodeManager')
    ], ClientSideStore.prototype, "nodeManager", void 0);
    __decorate([
        Autowired('filterManager')
    ], ClientSideStore.prototype, "filterManager", void 0);
    __decorate([
        PostConstruct
    ], ClientSideStore.prototype, "postConstruct", null);
    __decorate([
        PreDestroy
    ], ClientSideStore.prototype, "destroyRowNodes", null);
    return ClientSideStore;
}(RowNodeBlock));
export { ClientSideStore };
