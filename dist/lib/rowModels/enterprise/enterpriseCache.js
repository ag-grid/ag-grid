// ag-grid-enterprise v10.1.0
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var ag_grid_1 = require("ag-grid");
var enterpriseBlock_1 = require("./enterpriseBlock");
var EnterpriseCache = (function (_super) {
    __extends(EnterpriseCache, _super);
    function EnterpriseCache(cacheParams, parentRowNode) {
        var _this = _super.call(this, cacheParams) || this;
        // this will always be zero for the top level cache only,
        // all the other ones chance as the groups open and close
        _this.firstDisplayIndex = 0;
        _this.parentRowNode = parentRowNode;
        return _this;
    }
    EnterpriseCache.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('EnterpriseCache');
    };
    EnterpriseCache.prototype.init = function () {
        _super.prototype.init.call(this);
    };
    EnterpriseCache.prototype.setDisplayIndexes = function (numberSequence) {
        var _this = this;
        this.firstDisplayIndex = numberSequence.peek();
        var lastBlockId = -1;
        this.forEachBlockInOrder(function (currentBlock, blockId) {
            // if we skipped blocks, then we need to skip the row indexes. we assume that all missing
            // blocks are made up of closed RowNodes only (if they were groups), as we never expire from
            // the cache if any row nodes are open.
            var blocksSkippedCount = blockId - lastBlockId - 1;
            var rowsSkippedCount = blocksSkippedCount * _this.cacheParams.blockSize;
            if (rowsSkippedCount > 0) {
                numberSequence.skip(rowsSkippedCount);
            }
            lastBlockId = blockId;
            currentBlock.setDisplayIndexes(numberSequence, _this.getVirtualRowCount());
        });
        // if any blocks missing at the end, need to increase the row index for them also
        // eg if block size = 10, we have total rows of 25 (indexes 0 .. 24), but first 2 blocks loaded (because
        // last row was ejected from cache), then:
        // lastVisitedRow = 19, virtualRowCount = 25, rows not accounted for = 5 (24 - 19)
        var lastVisitedRow = ((lastBlockId + 1) * this.cacheParams.blockSize) - 1;
        var rowCount = this.getVirtualRowCount();
        var rowsNotAccountedFor = rowCount - lastVisitedRow - 1;
        if (rowsNotAccountedFor > 0) {
            numberSequence.skip(rowsNotAccountedFor);
        }
        this.lastDisplayIndex = numberSequence.peek() - 1;
    };
    // gets called in a) init() above and b) by the grid
    EnterpriseCache.prototype.getRow = function (rowIndex) {
        var _this = this;
        // if we have the block, then this is the block
        var block = null;
        // this is the last block that we have BEFORE the right block
        var beforeBlock = null;
        this.forEachBlockInOrder(function (currentBlock) {
            if (currentBlock.isIndexInBlock(rowIndex)) {
                block = currentBlock;
            }
            else if (currentBlock.isBlockBefore(rowIndex)) {
                // this will get assigned many times, but the last time will
                // be the closest block to the required block that is BEFORE
                beforeBlock = currentBlock;
            }
        });
        // if block not found, we need to load it
        if (ag_grid_1._.missing(block)) {
            var blockNumber = void 0;
            var displayIndexStart_1;
            // because missing blocks are always fully closed, we can work out
            // the start index of the block we want by hopping from the closes block,
            // as we know the row count in closed blocks is equal to the page size
            if (beforeBlock) {
                blockNumber = beforeBlock.getPageNumber() + 1;
                displayIndexStart_1 = beforeBlock.getDisplayEndIndex();
                var isInRange = function () {
                    return rowIndex >= displayIndexStart_1 && rowIndex < (displayIndexStart_1 + _this.cacheParams.blockSize);
                };
                var count = 0;
                while (!isInRange()) {
                    displayIndexStart_1 += this.cacheParams.blockSize;
                    blockNumber++;
                    count++;
                    if (count > 1000) {
                        debugger;
                    }
                }
            }
            else {
                var localIndex = rowIndex - this.firstDisplayIndex;
                blockNumber = Math.floor(localIndex / this.cacheParams.blockSize);
                displayIndexStart_1 = this.firstDisplayIndex + (blockNumber * this.cacheParams.blockSize);
            }
            block = this.createBlock(blockNumber, displayIndexStart_1);
            this.logger.log("block missing, rowIndex = " + rowIndex + ", creating #" + blockNumber + ", displayIndexStart = " + displayIndexStart_1);
        }
        var rowNode = block.getRow(rowIndex);
        return rowNode;
    };
    EnterpriseCache.prototype.createBlock = function (blockNumber, displayIndex) {
        var newBlock = new enterpriseBlock_1.EnterpriseBlock(blockNumber, this.parentRowNode, this.cacheParams, this);
        this.context.wireBean(newBlock);
        var displayIndexSequence = new ag_grid_1.NumberSequence(displayIndex);
        newBlock.setDisplayIndexes(displayIndexSequence, this.getVirtualRowCount());
        this.postCreateBlock(newBlock);
        return newBlock;
    };
    EnterpriseCache.prototype.getLastDisplayedIndex = function () {
        return this.lastDisplayIndex;
    };
    EnterpriseCache.prototype.isIndexInCache = function (index) {
        return index >= this.firstDisplayIndex && index <= this.lastDisplayIndex;
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
    return EnterpriseCache;
}(ag_grid_1.RowNodeCache));
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
exports.EnterpriseCache = EnterpriseCache;
