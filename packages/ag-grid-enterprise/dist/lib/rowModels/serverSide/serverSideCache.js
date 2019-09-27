// ag-grid-enterprise v21.2.2
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var serverSideBlock_1 = require("./serverSideBlock");
var ServerSideCache = /** @class */ (function (_super) {
    __extends(ServerSideCache, _super);
    function ServerSideCache(cacheParams, parentRowNode) {
        var _this = _super.call(this, cacheParams) || this;
        // this will always be zero for the top level cache only,
        // all the other ones change as the groups open and close
        _this.displayIndexStart = 0;
        _this.displayIndexEnd = 0; // not sure if setting this one to zero is necessary
        _this.cacheTop = 0;
        _this.blockHeights = {};
        _this.parentRowNode = parentRowNode;
        return _this;
    }
    ServerSideCache.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('ServerSideCache');
    };
    ServerSideCache.prototype.init = function () {
        _super.prototype.init.call(this);
    };
    ServerSideCache.prototype.getRowBounds = function (index) {
        var _this = this;
        this.logger.log("getRowBounds(" + index + ")");
        // we return null if row not found
        // note - cast to "any" due to https://github.com/Microsoft/TypeScript/issues/11498
        // should be RowBounds
        var result;
        var blockFound = false;
        // note - cast to "any" due to https://github.com/Microsoft/TypeScript/issues/11498
        // should be ServerSideBlock
        var lastBlock = null;
        this.forEachBlockInOrder(function (block) {
            if (blockFound) {
                return;
            }
            if (block.isDisplayIndexInBlock(index)) {
                result = block.getRowBounds(index, _this.getVirtualRowCount());
                blockFound = true;
            }
            else if (block.isBlockBefore(index)) {
                lastBlock = block;
            }
        });
        if (!blockFound) {
            var nextRowTop = void 0;
            var nextRowIndex = void 0;
            if (lastBlock !== null) {
                nextRowTop = lastBlock.getBlockTop() + lastBlock.getBlockHeight();
                nextRowIndex = lastBlock.getDisplayIndexEnd();
            }
            else {
                nextRowTop = this.cacheTop;
                nextRowIndex = this.displayIndexStart;
            }
            var rowsBetween = index - nextRowIndex;
            result = {
                rowHeight: this.cacheParams.rowHeight,
                rowTop: nextRowTop + rowsBetween * this.cacheParams.rowHeight
            };
        }
        // NOTE: what about purged blocks
        this.logger.log("getRowBounds(" + index + "), result = " + result);
        return result;
    };
    ServerSideCache.prototype.destroyBlock = function (block) {
        _super.prototype.destroyBlock.call(this, block);
    };
    ServerSideCache.prototype.getRowIndexAtPixel = function (pixel) {
        var _this = this;
        this.logger.log("getRowIndexAtPixel(" + pixel + ")");
        // we return null if row not found
        // note - cast to "any" due to https://github.com/Microsoft/TypeScript/issues/11498
        // should be number
        var result;
        var blockFound = false;
        // note - cast to "any" due to https://github.com/Microsoft/TypeScript/issues/11498
        // should be ServerSideBlock
        var lastBlock;
        this.forEachBlockInOrder(function (block) {
            if (blockFound) {
                return;
            }
            if (block.isPixelInRange(pixel)) {
                result = block.getRowIndexAtPixel(pixel, _this.getVirtualRowCount());
                blockFound = true;
            }
            else if (block.getBlockTop() < pixel) {
                lastBlock = block;
            }
        });
        if (!blockFound) {
            var nextRowTop = void 0;
            var nextRowIndex = void 0;
            if (lastBlock) {
                nextRowTop = lastBlock.getBlockTop() + lastBlock.getBlockHeight();
                nextRowIndex = lastBlock.getDisplayIndexEnd();
            }
            else {
                nextRowTop = this.cacheTop;
                nextRowIndex = this.displayIndexStart;
            }
            var pixelsBetween = pixel - nextRowTop;
            var rowsBetween = (pixelsBetween / this.cacheParams.rowHeight) | 0;
            result = nextRowIndex + rowsBetween;
        }
        var lastAllowedIndex = this.getDisplayIndexEnd() - 1;
        if (result > lastAllowedIndex) {
            result = lastAllowedIndex;
        }
        //NOTE: purged
        this.logger.log("getRowIndexAtPixel(" + pixel + ") result = " + result);
        return result;
    };
    ServerSideCache.prototype.clearRowTops = function () {
        var _this = this;
        this.forEachBlockInOrder(function (block) { return block.clearRowTops(_this.getVirtualRowCount()); });
    };
    ServerSideCache.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
        var _this = this;
        this.displayIndexStart = displayIndexSeq.peek();
        this.cacheTop = nextRowTop.value;
        var lastBlockId = -1;
        var blockSize = this.getBlockSize();
        this.forEachBlockInOrder(function (currentBlock, blockId) {
            // if we skipped blocks, then we need to skip the row indexes. we assume that all missing
            // blocks are made up of closed RowNodes only (if they were groups), as we never expire from
            // the cache if any row nodes are open.
            var blocksSkippedCount = blockId - lastBlockId - 1;
            var rowsSkippedCount = blocksSkippedCount * blockSize;
            if (rowsSkippedCount > 0) {
                displayIndexSeq.skip(rowsSkippedCount);
            }
            for (var i = 1; i <= blocksSkippedCount; i++) {
                var blockToAddId = blockId - i;
                if (ag_grid_community_1._.exists(_this.blockHeights[blockToAddId])) {
                    nextRowTop.value += _this.blockHeights[blockToAddId];
                }
                else {
                    nextRowTop.value += blockSize * _this.cacheParams.rowHeight;
                }
            }
            lastBlockId = blockId;
            currentBlock.setDisplayIndexes(displayIndexSeq, _this.getVirtualRowCount(), nextRowTop);
            _this.blockHeights[blockId] = currentBlock.getBlockHeight();
        });
        // if any blocks missing at the end, need to increase the row index for them also
        // eg if block size = 10, we have total rows of 25 (indexes 0 .. 24), but first 2 blocks loaded (because
        // last row was ejected from cache), then:
        // lastVisitedRow = 19, virtualRowCount = 25, rows not accounted for = 5 (24 - 19)
        var lastVisitedRow = ((lastBlockId + 1) * blockSize) - 1;
        var rowCount = this.getVirtualRowCount();
        var rowsNotAccountedFor = rowCount - lastVisitedRow - 1;
        if (rowsNotAccountedFor > 0) {
            displayIndexSeq.skip(rowsNotAccountedFor);
            nextRowTop.value += rowsNotAccountedFor * this.cacheParams.rowHeight;
        }
        this.displayIndexEnd = displayIndexSeq.peek();
        this.cacheHeight = nextRowTop.value - this.cacheTop;
    };
    // gets called in a) init() above and b) by the grid
    ServerSideCache.prototype.getRow = function (displayRowIndex, dontCreateBlock) {
        if (dontCreateBlock === void 0) { dontCreateBlock = false; }
        // this can happen if asking for a row that doesn't exist in the model,
        // eg if a cell range is selected, and the user filters so rows no longer
        // exist
        if (!this.isDisplayIndexInCache(displayRowIndex)) {
            return null;
        }
        // if we have the block, then this is the block
        var block = null;
        // this is the last block that we have BEFORE the right block
        // note - cast to "any" due to https://github.com/Microsoft/TypeScript/issues/11498
        // should be ServerSideBlock
        var beforeBlock = null;
        this.forEachBlockInOrder(function (currentBlock) {
            if (currentBlock.isDisplayIndexInBlock(displayRowIndex)) {
                block = currentBlock;
            }
            else if (currentBlock.isBlockBefore(displayRowIndex)) {
                // this will get assigned many times, but the last time will
                // be the closest block to the required block that is BEFORE
                beforeBlock = currentBlock;
            }
        });
        // when we are moving rows around, we don't want to trigger loads
        if (ag_grid_community_1._.missing(block) && dontCreateBlock) {
            return null;
        }
        var blockSize = this.getBlockSize();
        // if block not found, we need to load it
        if (ag_grid_community_1._.missing(block)) {
            var blockNumber = void 0;
            var displayIndexStart_1;
            var nextRowTop = void 0;
            // because missing blocks are always fully closed, we can work out
            // the start index of the block we want by hopping from the closest block,
            // as we know the row count in closed blocks is equal to the page size
            if (beforeBlock) {
                blockNumber = beforeBlock.getBlockNumber() + 1;
                displayIndexStart_1 = beforeBlock.getDisplayIndexEnd();
                nextRowTop = beforeBlock.getBlockHeight() + beforeBlock.getBlockTop();
                var isInRange = function () {
                    return displayRowIndex >= displayIndexStart_1 && displayRowIndex < (displayIndexStart_1 + blockSize);
                };
                while (!isInRange()) {
                    displayIndexStart_1 += blockSize;
                    var cachedBlockHeight = this.blockHeights[blockNumber];
                    if (ag_grid_community_1._.exists(cachedBlockHeight)) {
                        nextRowTop += cachedBlockHeight;
                    }
                    else {
                        nextRowTop += this.cacheParams.rowHeight * blockSize;
                    }
                    blockNumber++;
                }
            }
            else {
                var localIndex = displayRowIndex - this.displayIndexStart;
                blockNumber = Math.floor(localIndex / blockSize);
                displayIndexStart_1 = this.displayIndexStart + (blockNumber * blockSize);
                nextRowTop = this.cacheTop + (blockNumber * blockSize * this.cacheParams.rowHeight);
            }
            block = this.createBlock(blockNumber, displayIndexStart_1, { value: nextRowTop });
            this.logger.log("block missing, rowIndex = " + displayRowIndex + ", creating #" + blockNumber + ", displayIndexStart = " + displayIndexStart_1);
        }
        return block ? block.getRow(displayRowIndex) : null;
    };
    ServerSideCache.prototype.getBlockSize = function () {
        return this.cacheParams.blockSize ? this.cacheParams.blockSize : serverSideBlock_1.ServerSideBlock.DefaultBlockSize;
    };
    ServerSideCache.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        var blockSize = this.getBlockSize();
        var blockId = Math.floor(topLevelIndex / blockSize);
        var block = this.getBlock(blockId);
        if (block) {
            // if we found a block, means row is in memory, so we can report the row index directly
            var rowNode = block.getRowUsingLocalIndex(topLevelIndex, true);
            return rowNode.rowIndex;
        }
        else {
            // otherwise we need to calculate it from the previous block
            var blockBefore_1;
            this.forEachBlockInOrder(function (currentBlock, currentId) {
                if (blockId > currentId) {
                    // this will get assigned many times, but the last time will
                    // be the closest block to the required block that is BEFORE
                    blockBefore_1 = currentBlock;
                }
            });
            if (blockBefore_1) {
                // note: the local index is the same as the top level index, two terms for same thing
                //
                // get index of the last row before this row
                // eg if blocksize = 100, then:
                //   last row of first block is 99 (100 * 1) -1;
                //   last row of second block is 199 (100 * 2) -1;
                var lastRowTopLevelIndex = (blockSize * (blockBefore_1.getBlockNumber() + 1)) - 1;
                // this is the last loaded rownode in the cache that is before the row we are interested in.
                // we are guaranteed no rows are open. so the difference between the topTopIndex will be the
                // same as the difference between the displayed index
                var indexDiff = topLevelIndex - lastRowTopLevelIndex;
                var lastRowNode = blockBefore_1.getRowUsingLocalIndex(lastRowTopLevelIndex, true);
                return lastRowNode.rowIndex + indexDiff;
            }
            else {
                return topLevelIndex;
            }
        }
    };
    ServerSideCache.prototype.createBlock = function (blockNumber, displayIndex, nextRowTop) {
        var newBlock = new serverSideBlock_1.ServerSideBlock(blockNumber, this.parentRowNode, this.cacheParams, this);
        this.getContext().wireBean(newBlock);
        var displayIndexSequence = new ag_grid_community_1.NumberSequence(displayIndex);
        newBlock.setDisplayIndexes(displayIndexSequence, this.getVirtualRowCount(), nextRowTop);
        this.postCreateBlock(newBlock);
        return newBlock;
    };
    ServerSideCache.prototype.getDisplayIndexEnd = function () {
        return this.displayIndexEnd;
    };
    ServerSideCache.prototype.isDisplayIndexInCache = function (displayIndex) {
        if (this.getVirtualRowCount() === 0) {
            return false;
        }
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    };
    ServerSideCache.prototype.getChildCache = function (keys) {
        var _this = this;
        if (ag_grid_community_1._.missingOrEmpty(keys)) {
            return this;
        }
        var nextKey = keys[0];
        var nextServerSideCache = null;
        this.forEachBlockInOrder(function (block) {
            // callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number
            block.forEachNodeShallow(function (rowNode) {
                if (rowNode.key === nextKey) {
                    nextServerSideCache = rowNode.childrenCache;
                }
            }, new ag_grid_community_1.NumberSequence(), _this.getVirtualRowCount());
        });
        if (nextServerSideCache) {
            var keyListForNextLevel = keys.slice(1, keys.length);
            return nextServerSideCache ? nextServerSideCache.getChildCache(keyListForNextLevel) : null;
        }
        else {
            return null;
        }
    };
    ServerSideCache.prototype.isPixelInRange = function (pixel) {
        if (this.getVirtualRowCount() === 0) {
            return false;
        }
        return pixel >= this.cacheTop && pixel < (this.cacheTop + this.cacheHeight);
    };
    ServerSideCache.prototype.refreshCacheAfterSort = function (changedColumnsInSort, rowGroupColIds) {
        var _this = this;
        var level = this.parentRowNode.level + 1;
        var grouping = level < this.cacheParams.rowGroupCols.length;
        var shouldPurgeCache;
        if (grouping) {
            var groupColVo = this.cacheParams.rowGroupCols[level];
            var groupField = groupColVo.field;
            var rowGroupBlock = rowGroupColIds.indexOf(groupField) > -1;
            var sortingByGroup = changedColumnsInSort.indexOf(groupField) > -1;
            shouldPurgeCache = rowGroupBlock && sortingByGroup;
        }
        else {
            shouldPurgeCache = true;
        }
        if (shouldPurgeCache) {
            this.purgeCache();
        }
        else {
            this.forEachBlockInOrder(function (block) {
                if (block.isGroupLevel()) {
                    var callback = function (rowNode) {
                        var nextCache = rowNode.childrenCache;
                        if (nextCache) {
                            nextCache.refreshCacheAfterSort(changedColumnsInSort, rowGroupColIds);
                        }
                    };
                    block.forEachNodeShallow(callback, new ag_grid_community_1.NumberSequence(), _this.getVirtualRowCount());
                }
            });
        }
    };
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], ServerSideCache.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], ServerSideCache.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        __param(0, ag_grid_community_1.Qualifier('loggerFactory')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [ag_grid_community_1.LoggerFactory]),
        __metadata("design:returntype", void 0)
    ], ServerSideCache.prototype, "setBeans", null);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ServerSideCache.prototype, "init", null);
    return ServerSideCache;
}(ag_grid_community_1.RowNodeCache));
exports.ServerSideCache = ServerSideCache;
