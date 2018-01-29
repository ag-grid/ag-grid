// ag-grid-enterprise v16.0.1
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var ag_grid_1 = require("ag-grid");
var enterpriseBlock_1 = require("./enterpriseBlock");
var EnterpriseCache = (function (_super) {
    __extends(EnterpriseCache, _super);
    function EnterpriseCache(cacheParams, parentRowNode) {
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
    EnterpriseCache.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('EnterpriseCache');
    };
    EnterpriseCache.prototype.init = function () {
        _super.prototype.init.call(this);
    };
    EnterpriseCache.prototype.getRowBounds = function (index) {
        var _this = this;
        this.logger.log("getRowBounds(" + index + ")");
        // we return null if row not found
        var result;
        var blockFound = false;
        var lastBlock;
        this.forEachBlockInOrder(function (block) {
            if (blockFound)
                return;
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
            if (lastBlock) {
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
        //TODO: what about purged blocks
        this.logger.log("getRowBounds(" + index + "), result = " + result);
        return result;
    };
    EnterpriseCache.prototype.destroyBlock = function (block) {
        _super.prototype.destroyBlock.call(this, block);
    };
    EnterpriseCache.prototype.getRowIndexAtPixel = function (pixel) {
        var _this = this;
        this.logger.log("getRowIndexAtPixel(" + pixel + ")");
        // we return null if row not found
        var result;
        var blockFound = false;
        var lastBlock;
        this.forEachBlockInOrder(function (block) {
            if (blockFound)
                return;
            if (block.isPixelInRange(pixel)) {
                result = block.getRowIndexAtPixel(pixel, _this.getVirtualRowCount());
                blockFound = true;
            }
            else if (block.getBlockTop() > pixel) {
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
        //TODO: purged
        this.logger.log("getRowIndexAtPixel(" + pixel + ") result = " + result);
        return result;
    };
    EnterpriseCache.prototype.clearRowTops = function () {
        var _this = this;
        this.forEachBlockInOrder(function (block) { return block.clearRowTops(_this.getVirtualRowCount()); });
    };
    EnterpriseCache.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
        var _this = this;
        this.displayIndexStart = displayIndexSeq.peek();
        this.cacheTop = nextRowTop.value;
        var lastBlockId = -1;
        this.forEachBlockInOrder(function (currentBlock, blockId) {
            // if we skipped blocks, then we need to skip the row indexes. we assume that all missing
            // blocks are made up of closed RowNodes only (if they were groups), as we never expire from
            // the cache if any row nodes are open.
            var blocksSkippedCount = blockId - lastBlockId - 1;
            var rowsSkippedCount = blocksSkippedCount * _this.cacheParams.blockSize;
            if (rowsSkippedCount > 0) {
                displayIndexSeq.skip(rowsSkippedCount);
            }
            for (var i = 1; i <= blocksSkippedCount; i++) {
                var blockToAddId = blockId - i;
                if (ag_grid_1._.exists(_this.blockHeights[blockToAddId])) {
                    nextRowTop.value += _this.blockHeights[blockToAddId];
                }
                else {
                    nextRowTop.value += _this.cacheParams.blockSize * _this.cacheParams.rowHeight;
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
        var lastVisitedRow = ((lastBlockId + 1) * this.cacheParams.blockSize) - 1;
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
    EnterpriseCache.prototype.getRow = function (displayRowIndex) {
        var _this = this;
        // this can happen if asking for a row that doesn't exist in the model,
        // eg if a cell range is selected, and the user filters so rows no longer
        // exist
        if (!this.isDisplayIndexInCache(displayRowIndex)) {
            return null;
        }
        // if we have the block, then this is the block
        var block = null;
        // this is the last block that we have BEFORE the right block
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
        // if block not found, we need to load it
        if (ag_grid_1._.missing(block)) {
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
                    return displayRowIndex >= displayIndexStart_1 && displayRowIndex < (displayIndexStart_1 + _this.cacheParams.blockSize);
                };
                while (!isInRange()) {
                    displayIndexStart_1 += this.cacheParams.blockSize;
                    var cachedBlockHeight = this.blockHeights[blockNumber];
                    if (ag_grid_1._.exists(cachedBlockHeight)) {
                        nextRowTop += cachedBlockHeight;
                    }
                    else {
                        nextRowTop += this.cacheParams.rowHeight * this.cacheParams.blockSize;
                    }
                    blockNumber++;
                }
            }
            else {
                var localIndex = displayRowIndex - this.displayIndexStart;
                blockNumber = Math.floor(localIndex / this.cacheParams.blockSize);
                displayIndexStart_1 = this.displayIndexStart + (blockNumber * this.cacheParams.blockSize);
                nextRowTop = this.cacheTop + (blockNumber * this.cacheParams.blockSize * this.cacheParams.rowHeight);
            }
            block = this.createBlock(blockNumber, displayIndexStart_1, { value: nextRowTop });
            this.logger.log("block missing, rowIndex = " + displayRowIndex + ", creating #" + blockNumber + ", displayIndexStart = " + displayIndexStart_1);
        }
        var rowNode = block.getRow(displayRowIndex);
        return rowNode;
    };
    EnterpriseCache.prototype.createBlock = function (blockNumber, displayIndex, nextRowTop) {
        var newBlock = new enterpriseBlock_1.EnterpriseBlock(blockNumber, this.parentRowNode, this.cacheParams, this);
        this.context.wireBean(newBlock);
        var displayIndexSequence = new ag_grid_1.NumberSequence(displayIndex);
        newBlock.setDisplayIndexes(displayIndexSequence, this.getVirtualRowCount(), nextRowTop);
        this.postCreateBlock(newBlock);
        return newBlock;
    };
    EnterpriseCache.prototype.getDisplayIndexEnd = function () {
        return this.displayIndexEnd;
    };
    EnterpriseCache.prototype.isDisplayIndexInCache = function (displayIndex) {
        if (this.getVirtualRowCount() === 0) {
            return false;
        }
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    };
    EnterpriseCache.prototype.getChildCache = function (keys) {
        var _this = this;
        if (ag_grid_1._.missingOrEmpty(keys)) {
            return this;
        }
        var nextKey = keys[0];
        var nextEnterpriseCache = null;
        this.forEachBlockInOrder(function (block) {
            // callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number
            block.forEachNodeShallow(function (rowNode) {
                if (rowNode.key === nextKey) {
                    nextEnterpriseCache = rowNode.childrenCache;
                }
            }, new ag_grid_1.NumberSequence(), _this.getVirtualRowCount());
        });
        if (nextEnterpriseCache) {
            var keyListForNextLevel = keys.slice(1, keys.length);
            return nextEnterpriseCache.getChildCache(keyListForNextLevel);
        }
        else {
            return null;
        }
    };
    EnterpriseCache.prototype.isPixelInRange = function (pixel) {
        if (this.getVirtualRowCount() === 0) {
            return false;
        }
        return pixel >= this.cacheTop && pixel < (this.cacheTop + this.cacheHeight);
    };
    __decorate([
        ag_grid_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_1.EventService)
    ], EnterpriseCache.prototype, "eventService", void 0);
    __decorate([
        ag_grid_1.Autowired('context'),
        __metadata("design:type", ag_grid_1.Context)
    ], EnterpriseCache.prototype, "context", void 0);
    __decorate([
        __param(0, ag_grid_1.Qualifier('loggerFactory')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [ag_grid_1.LoggerFactory]),
        __metadata("design:returntype", void 0)
    ], EnterpriseCache.prototype, "setBeans", null);
    __decorate([
        ag_grid_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], EnterpriseCache.prototype, "init", null);
    return EnterpriseCache;
}(ag_grid_1.RowNodeCache));
exports.EnterpriseCache = EnterpriseCache;
