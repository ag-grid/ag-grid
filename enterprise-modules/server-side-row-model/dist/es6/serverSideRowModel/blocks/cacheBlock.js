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
import { _, Autowired, NumberSequence, PostConstruct, PreDestroy, Qualifier, RowNodeBlock } from "@ag-grid-community/core";
var CacheBlock = /** @class */ (function (_super) {
    __extends(CacheBlock, _super);
    function CacheBlock(blockNumber, parentRowNode, ssrmParams, storeParams, parentStore) {
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
    CacheBlock.prototype.postConstruct = function () {
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
        this.usingMasterDetail = this.gridOptionsWrapper.isMasterDetail();
        this.defaultRowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        if (!this.usingTreeData && this.groupLevel) {
            var groupColVo = this.ssrmParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnController.getRowGroupColumns()[this.level];
        }
        this.nodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.parentRowNode);
        this.setData([]);
    };
    CacheBlock.prototype.isDisplayIndexInBlock = function (displayIndex) {
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    };
    CacheBlock.prototype.isBlockBefore = function (displayIndex) {
        return displayIndex >= this.displayIndexEnd;
    };
    CacheBlock.prototype.getDisplayIndexStart = function () {
        return this.displayIndexStart;
    };
    CacheBlock.prototype.getDisplayIndexEnd = function () {
        return this.displayIndexEnd;
    };
    CacheBlock.prototype.getBlockHeightPx = function () {
        return this.blockHeightPx;
    };
    CacheBlock.prototype.getBlockTopPx = function () {
        return this.blockTopPx;
    };
    CacheBlock.prototype.isGroupLevel = function () {
        return this.groupLevel;
    };
    CacheBlock.prototype.getGroupField = function () {
        return this.groupField;
    };
    CacheBlock.prototype.getBlockStateJson = function () {
        return {
            id: this.nodeIdPrefix + this.getId(),
            state: {
                blockNumber: this.getId(),
                startRow: this.startRow,
                endRow: this.startRow + this.storeParams.cacheBlockSize,
                pageStatus: this.getState()
            }
        };
    };
    CacheBlock.prototype.isAnyNodeOpen = function () {
        var openNodeCount = this.rowNodes.filter(function (node) { return node.expanded; }).length;
        return openNodeCount > 0;
    };
    // this method is repeated, see forEachRowNode, why?
    CacheBlock.prototype.forEachNode = function (callback, sequence, includeChildren) {
        if (sequence === void 0) { sequence = new NumberSequence(); }
        this.rowNodes.forEach(function (rowNode) {
            callback(rowNode, sequence.next());
            // this will only every happen for server side row model, as infinite
            // row model doesn't have groups
            if (includeChildren && rowNode.childrenCache) {
                var childStore = rowNode.childrenCache;
                childStore.forEachNodeDeep(callback, sequence);
            }
        });
    };
    CacheBlock.prototype.forEachNodeDeep = function (callback, sequence) {
        this.forEachNode(callback, sequence, true);
    };
    CacheBlock.prototype.forEachNodeShallow = function (callback, sequence) {
        this.forEachNode(callback, sequence, false);
    };
    CacheBlock.prototype.getLastAccessed = function () {
        return this.lastAccessed;
    };
    CacheBlock.prototype.getRowUsingLocalIndex = function (rowIndex) {
        return this.rowNodes[rowIndex - this.startRow];
    };
    CacheBlock.prototype.touchLastAccessed = function () {
        this.lastAccessed = this.ssrmParams.lastAccessedSequence.next();
    };
    CacheBlock.prototype.processServerResult = function (params) {
        this.parentStore.onBlockLoaded(this, params);
    };
    CacheBlock.prototype.setData = function (rows) {
        if (rows === void 0) { rows = []; }
        this.destroyRowNodes();
        var storeRowCount = this.parentStore.getRowCount();
        var startRow = this.getId() * this.storeParams.cacheBlockSize;
        var endRow = Math.min(startRow + this.storeParams.cacheBlockSize, storeRowCount);
        var rowsToCreate = endRow - startRow;
        for (var i = 0; i < rowsToCreate; i++) {
            var rowNode = this.blockUtils.createRowNode({ field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
                level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn });
            var dataLoadedForThisRow = i < rows.length;
            if (dataLoadedForThisRow) {
                var data = rows[i];
                var defaultId = this.nodeIdPrefix + (this.startRow + i);
                this.blockUtils.setDataIntoRowNode(rowNode, data, defaultId);
                this.nodeManager.addRowNode(rowNode);
            }
            this.rowNodes.push(rowNode);
        }
    };
    CacheBlock.prototype.destroyRowNodes = function () {
        var _this = this;
        if (this.rowNodes) {
            this.rowNodes.forEach(function (rowNode) {
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
        this.rowNodes = [];
    };
    CacheBlock.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('ServerSideBlock');
    };
    CacheBlock.prototype.getRowUsingDisplayIndex = function (displayRowIndex) {
        this.touchLastAccessed();
        var res = this.blockUtils.binarySearchForDisplayIndex(displayRowIndex, this.rowNodes);
        return res;
    };
    CacheBlock.prototype.loadFromDatasource = function () {
        this.cacheUtils.loadFromDatasource({
            startRow: this.startRow,
            endRow: this.startRow + this.storeParams.cacheBlockSize,
            parentNode: this.parentRowNode,
            storeParams: this.ssrmParams,
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            success: this.success.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this),
            fail: this.pageLoadFailed.bind(this)
        });
    };
    CacheBlock.prototype.isPixelInRange = function (pixel) {
        return pixel >= this.blockTopPx && pixel < (this.blockTopPx + this.blockHeightPx);
    };
    CacheBlock.prototype.getRowBounds = function (index) {
        var _this = this;
        this.touchLastAccessed();
        var res;
        _.find(this.rowNodes, function (rowNode) {
            res = _this.blockUtils.extractRowBounds(rowNode, index);
            return res != null;
        });
        return res;
    };
    CacheBlock.prototype.getRowIndexAtPixel = function (pixel) {
        var _this = this;
        this.touchLastAccessed();
        var res;
        _.find(this.rowNodes, function (rowNode) {
            res = _this.blockUtils.getIndexAtPixel(rowNode, pixel);
            return res != null;
        });
        return res;
    };
    CacheBlock.prototype.clearDisplayIndexes = function () {
        var _this = this;
        this.displayIndexEnd = undefined;
        this.displayIndexStart = undefined;
        this.rowNodes.forEach(function (rowNode) { return _this.blockUtils.clearDisplayIndex(rowNode); });
    };
    CacheBlock.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
        var _this = this;
        this.displayIndexStart = displayIndexSeq.peek();
        this.blockTopPx = nextRowTop.value;
        this.rowNodes.forEach(function (rowNode) { return _this.blockUtils.setDisplayIndex(rowNode, displayIndexSeq, nextRowTop); });
        this.displayIndexEnd = displayIndexSeq.peek();
        this.blockHeightPx = nextRowTop.value - this.blockTopPx;
    };
    __decorate([
        Autowired('rowRenderer')
    ], CacheBlock.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired('columnController')
    ], CacheBlock.prototype, "columnController", void 0);
    __decorate([
        Autowired('valueService')
    ], CacheBlock.prototype, "valueService", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], CacheBlock.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('columnApi')
    ], CacheBlock.prototype, "columnApi", void 0);
    __decorate([
        Autowired('gridApi')
    ], CacheBlock.prototype, "gridApi", void 0);
    __decorate([
        Autowired('ssrmCacheUtils')
    ], CacheBlock.prototype, "cacheUtils", void 0);
    __decorate([
        Autowired('ssrmBlockUtils')
    ], CacheBlock.prototype, "blockUtils", void 0);
    __decorate([
        Autowired('ssrmNodeManager')
    ], CacheBlock.prototype, "nodeManager", void 0);
    __decorate([
        PostConstruct
    ], CacheBlock.prototype, "postConstruct", null);
    __decorate([
        PreDestroy
    ], CacheBlock.prototype, "destroyRowNodes", null);
    __decorate([
        __param(0, Qualifier('loggerFactory'))
    ], CacheBlock.prototype, "setBeans", null);
    return CacheBlock;
}(RowNodeBlock));
export { CacheBlock };
