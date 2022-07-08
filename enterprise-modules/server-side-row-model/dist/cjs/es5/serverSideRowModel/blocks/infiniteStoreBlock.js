"use strict";
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var InfiniteStoreBlock = /** @class */ (function (_super) {
    __extends(InfiniteStoreBlock, _super);
    function InfiniteStoreBlock(blockNumber, parentRowNode, ssrmParams, storeParams, parentStore) {
        var _this = _super.call(this, blockNumber) || this;
        _this.ssrmParams = ssrmParams;
        _this.storeParams = storeParams;
        _this.parentRowNode = parentRowNode;
        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        _this.startRow = blockNumber * storeParams.cacheBlockSize;
        _this.parentStore = parentStore;
        _this.level = parentRowNode.level + 1;
        _this.groupLevel = ssrmParams.rowGroupCols ? _this.level < ssrmParams.rowGroupCols.length : undefined;
        _this.leafGroup = ssrmParams.rowGroupCols ? _this.level === ssrmParams.rowGroupCols.length - 1 : false;
        return _this;
    }
    InfiniteStoreBlock.prototype.postConstruct = function () {
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
        if (!this.usingTreeData && this.groupLevel) {
            var groupColVo = this.ssrmParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnModel.getRowGroupColumns()[this.level];
        }
        this.nodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.parentRowNode);
        this.setData([]);
    };
    InfiniteStoreBlock.prototype.isDisplayIndexInBlock = function (displayIndex) {
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    };
    InfiniteStoreBlock.prototype.isBlockBefore = function (displayIndex) {
        return displayIndex >= this.displayIndexEnd;
    };
    InfiniteStoreBlock.prototype.getDisplayIndexStart = function () {
        return this.displayIndexStart;
    };
    InfiniteStoreBlock.prototype.getDisplayIndexEnd = function () {
        return this.displayIndexEnd;
    };
    InfiniteStoreBlock.prototype.getBlockHeightPx = function () {
        return this.blockHeightPx;
    };
    InfiniteStoreBlock.prototype.getBlockTopPx = function () {
        return this.blockTopPx;
    };
    InfiniteStoreBlock.prototype.isGroupLevel = function () {
        return this.groupLevel;
    };
    InfiniteStoreBlock.prototype.getGroupField = function () {
        return this.groupField;
    };
    InfiniteStoreBlock.prototype.prefixId = function (id) {
        if (this.nodeIdPrefix != null) {
            return this.nodeIdPrefix + '-' + id;
        }
        else {
            return id.toString();
        }
    };
    InfiniteStoreBlock.prototype.getBlockStateJson = function () {
        return {
            id: this.prefixId(this.getId()),
            state: {
                blockNumber: this.getId(),
                startRow: this.startRow,
                endRow: this.startRow + this.storeParams.cacheBlockSize,
                pageStatus: this.getState()
            }
        };
    };
    InfiniteStoreBlock.prototype.isAnyNodeOpen = function () {
        var openNodeCount = this.rowNodes.filter(function (node) { return node.expanded; }).length;
        return openNodeCount > 0;
    };
    // this method is repeated, see forEachRowNode, why?
    InfiniteStoreBlock.prototype.forEachNode = function (callback, sequence, includeChildren, filterAndSort) {
        if (sequence === void 0) { sequence = new core_1.NumberSequence(); }
        this.rowNodes.forEach(function (rowNode) {
            callback(rowNode, sequence.next());
            // this will only every happen for server side row model, as infinite
            // row model doesn't have groups
            if (includeChildren && rowNode.childStore) {
                var childStore = rowNode.childStore;
                if (filterAndSort) {
                    childStore.forEachNodeDeepAfterFilterAndSort(callback, sequence);
                }
                else {
                    childStore.forEachNodeDeep(callback, sequence);
                }
            }
        });
    };
    InfiniteStoreBlock.prototype.forEachNodeDeep = function (callback, sequence) {
        this.forEachNode(callback, sequence, true, false);
    };
    InfiniteStoreBlock.prototype.forEachNodeAfterFilterAndSort = function (callback, sequence) {
        this.forEachNode(callback, sequence, true, true);
    };
    InfiniteStoreBlock.prototype.forEachNodeShallow = function (callback, sequence) {
        this.forEachNode(callback, sequence, false, false);
    };
    InfiniteStoreBlock.prototype.getLastAccessed = function () {
        return this.lastAccessed;
    };
    InfiniteStoreBlock.prototype.getRowUsingLocalIndex = function (rowIndex) {
        return this.rowNodes[rowIndex - this.startRow];
    };
    InfiniteStoreBlock.prototype.touchLastAccessed = function () {
        this.lastAccessed = this.ssrmParams.lastAccessedSequence.next();
    };
    InfiniteStoreBlock.prototype.processServerFail = function () {
        this.parentStore.onBlockLoadFailed(this);
    };
    InfiniteStoreBlock.prototype.retryLoads = function () {
        if (this.getState() === core_1.RowNodeBlock.STATE_FAILED) {
            this.setStateWaitingToLoad();
            this.rowNodeBlockLoader.checkBlockToLoad();
            this.setData();
        }
        this.forEachNodeShallow(function (node) {
            if (node.childStore) {
                node.childStore.retryLoads();
            }
        });
    };
    InfiniteStoreBlock.prototype.processServerResult = function (params) {
        this.parentStore.onBlockLoaded(this, params);
    };
    InfiniteStoreBlock.prototype.setData = function (rows, failedLoad) {
        var _this = this;
        if (rows === void 0) { rows = []; }
        if (failedLoad === void 0) { failedLoad = false; }
        this.destroyRowNodes();
        var storeRowCount = this.parentStore.getRowCount();
        var startRow = this.getId() * this.storeParams.cacheBlockSize;
        var endRow = Math.min(startRow + this.storeParams.cacheBlockSize, storeRowCount);
        var rowsToCreate = endRow - startRow;
        // when using autoHeight, we default the row heights to a height to fill the old height of the block.
        // we only ever do this to autoHeight, as we could be setting invalid heights (especially if different
        // number of rows in the block due to a filter, less rows would mean bigger rows), and autoHeight is
        // the only pattern that will automatically correct this. we check for visible autoHeight cols,
        // to omit the case where all autoHeight cols are hidden.
        var showingAutoHeightCols = this.columnModel.getAllDisplayedAutoHeightCols().length > 0;
        var cachedBlockHeight = showingAutoHeightCols ? this.parentStore.getCachedBlockHeight(this.getId()) : undefined;
        var cachedRowHeight = cachedBlockHeight ? Math.round(cachedBlockHeight / rowsToCreate) : undefined;
        var _loop_1 = function (i) {
            var dataLoadedForThisRow = i < rows.length;
            var getNodeWithData = function (existingNode) {
                // if there's not an existing node to reuse, create a fresh node
                var rowNode = (existingNode !== null && existingNode !== void 0 ? existingNode : _this.blockUtils.createRowNode({
                    field: _this.groupField,
                    group: _this.groupLevel,
                    leafGroup: _this.leafGroup,
                    level: _this.level,
                    parent: _this.parentRowNode,
                    rowGroupColumn: _this.rowGroupColumn,
                    rowHeight: cachedRowHeight
                }));
                if (dataLoadedForThisRow) {
                    var data = rows[i];
                    if (!!existingNode) {
                        _this.blockUtils.updateDataIntoRowNode(rowNode, data);
                    }
                    else {
                        var defaultId = _this.prefixId(_this.startRow + i);
                        _this.blockUtils.setDataIntoRowNode(rowNode, data, defaultId, cachedRowHeight);
                        _this.blockUtils.checkOpenByDefault(rowNode);
                    }
                    _this.parentStore.removeDuplicateNode(rowNode.id);
                    _this.nodeManager.addRowNode(rowNode);
                    _this.allNodesMap[rowNode.id] = rowNode;
                }
                if (failedLoad) {
                    rowNode.failedLoad = true;
                }
                return rowNode;
            };
            var getRowIdFunc = this_1.gridOptionsWrapper.getRowIdFunc();
            var row = void 0;
            if (getRowIdFunc && dataLoadedForThisRow) {
                var data = rows[i];
                var parentKeys = this_1.parentRowNode.getGroupKeys();
                var id = getRowIdFunc({
                    data: data,
                    level: this_1.level,
                    parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
                });
                var cachedRow = this_1.parentStore.retrieveNodeFromCache(id);
                row = getNodeWithData(cachedRow);
            }
            if (!row) {
                row = getNodeWithData();
            }
            this_1.rowNodes.push(row);
        };
        var this_1 = this;
        for (var i = 0; i < rowsToCreate; i++) {
            _loop_1(i);
        }
    };
    // to safeguard the grid against duplicate nodes, when a row is loaded, we check
    // for another row in the same cache. if another row does exist, we delete it.
    // this covers for when user refreshes the store (which typically happens after a
    // data change) and the same row ends up coming back in a different block, and the
    // new block finishes refreshing before the old block has finished refreshing.
    InfiniteStoreBlock.prototype.removeDuplicateNode = function (id) {
        // we don't remove duplicates if this block is loaded, as that's a duplicate ID.
        // we are only interested in removing rows in blocks that are in the middle of a refresh,
        // ie two blocks, A and B, both are refreshed (as in the same cache) but A comes back
        // first and some rows have moved from B to A, we must remove the old rows from B.
        // however if B is not also getting refreshed (ie it's loaded) this is a bug
        // we need to tell the application about, as they provided duplicate ID's (done in Node Manager)
        if (this.getState() == core_1.RowNodeBlock.STATE_LOADED) {
            return;
        }
        var rowNode = this.allNodesMap[id];
        if (!rowNode) {
            return;
        }
        this.blockUtils.destroyRowNode(rowNode);
        var index = this.rowNodes.indexOf(rowNode);
        var stubRowNode = this.blockUtils.createRowNode({ field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
            level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn });
        this.rowNodes[index] = stubRowNode;
    };
    InfiniteStoreBlock.prototype.refresh = function () {
        if (this.getState() !== core_1.RowNodeBlock.STATE_WAITING_TO_LOAD) {
            this.setStateWaitingToLoad();
        }
    };
    InfiniteStoreBlock.prototype.destroyRowNodes = function () {
        var _this = this;
        var _a;
        (_a = this.rowNodes) === null || _a === void 0 ? void 0 : _a.forEach(function (row) {
            var isStoreCachingNode = _this.parentStore.isNodeCached(row.id);
            _this.blockUtils.destroyRowNode(row, isStoreCachingNode);
        });
        this.rowNodes = [];
        this.allNodesMap = {};
    };
    InfiniteStoreBlock.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('ServerSideBlock');
    };
    InfiniteStoreBlock.prototype.getRowUsingDisplayIndex = function (displayRowIndex) {
        this.touchLastAccessed();
        var res = this.blockUtils.binarySearchForDisplayIndex(displayRowIndex, this.rowNodes);
        return res;
    };
    InfiniteStoreBlock.prototype.loadFromDatasource = function () {
        this.storeUtils.loadFromDatasource({
            startRow: this.startRow,
            endRow: this.startRow + this.storeParams.cacheBlockSize,
            parentBlock: this,
            parentNode: this.parentRowNode,
            storeParams: this.ssrmParams,
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            success: this.success.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this, this.getVersion()),
            fail: this.pageLoadFailed.bind(this, this.getVersion())
        });
    };
    InfiniteStoreBlock.prototype.isPixelInRange = function (pixel) {
        return pixel >= this.blockTopPx && pixel < (this.blockTopPx + this.blockHeightPx);
    };
    InfiniteStoreBlock.prototype.getRowBounds = function (index) {
        var e_1, _a;
        this.touchLastAccessed();
        var res;
        try {
            for (var _b = __values(this.rowNodes), _c = _b.next(); !_c.done; _c = _b.next()) {
                var rowNode = _c.value;
                res = this.blockUtils.extractRowBounds(rowNode, index);
                if (res != null) {
                    break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return res;
    };
    InfiniteStoreBlock.prototype.getRowIndexAtPixel = function (pixel) {
        var e_2, _a;
        this.touchLastAccessed();
        var res = null;
        try {
            for (var _b = __values(this.rowNodes), _c = _b.next(); !_c.done; _c = _b.next()) {
                var rowNode = _c.value;
                res = this.blockUtils.getIndexAtPixel(rowNode, pixel);
                if (res != null) {
                    break;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return res;
    };
    InfiniteStoreBlock.prototype.clearDisplayIndexes = function () {
        var _this = this;
        this.displayIndexEnd = undefined;
        this.displayIndexStart = undefined;
        this.rowNodes.forEach(function (rowNode) { return _this.blockUtils.clearDisplayIndex(rowNode); });
    };
    InfiniteStoreBlock.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
        var _this = this;
        this.displayIndexStart = displayIndexSeq.peek();
        this.blockTopPx = nextRowTop.value;
        this.rowNodes.forEach(function (rowNode) { return _this.blockUtils.setDisplayIndex(rowNode, displayIndexSeq, nextRowTop); });
        this.displayIndexEnd = displayIndexSeq.peek();
        this.blockHeightPx = nextRowTop.value - this.blockTopPx;
    };
    __decorate([
        core_1.Autowired('columnModel')
    ], InfiniteStoreBlock.prototype, "columnModel", void 0);
    __decorate([
        core_1.Autowired('ssrmStoreUtils')
    ], InfiniteStoreBlock.prototype, "storeUtils", void 0);
    __decorate([
        core_1.Autowired('ssrmBlockUtils')
    ], InfiniteStoreBlock.prototype, "blockUtils", void 0);
    __decorate([
        core_1.Autowired('ssrmNodeManager')
    ], InfiniteStoreBlock.prototype, "nodeManager", void 0);
    __decorate([
        core_1.Autowired('rowNodeBlockLoader')
    ], InfiniteStoreBlock.prototype, "rowNodeBlockLoader", void 0);
    __decorate([
        core_1.PostConstruct
    ], InfiniteStoreBlock.prototype, "postConstruct", null);
    __decorate([
        core_1.PreDestroy
    ], InfiniteStoreBlock.prototype, "destroyRowNodes", null);
    __decorate([
        __param(0, core_1.Qualifier('loggerFactory'))
    ], InfiniteStoreBlock.prototype, "setBeans", null);
    return InfiniteStoreBlock;
}(core_1.RowNodeBlock));
exports.InfiniteStoreBlock = InfiniteStoreBlock;
