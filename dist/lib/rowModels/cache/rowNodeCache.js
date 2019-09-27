/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
var beanStub_1 = require("../../context/beanStub");
var rowNodeBlock_1 = require("./rowNodeBlock");
var utils_1 = require("../../utils");
var RowNodeCache = /** @class */ (function (_super) {
    __extends(RowNodeCache, _super);
    function RowNodeCache(cacheParams) {
        var _this = _super.call(this) || this;
        _this.maxRowFound = false;
        _this.blocks = {};
        _this.blockCount = 0;
        _this.virtualRowCount = cacheParams.initialRowCount;
        _this.cacheParams = cacheParams;
        return _this;
    }
    RowNodeCache.prototype.destroy = function () {
        var _this = this;
        _super.prototype.destroy.call(this);
        this.forEachBlockInOrder(function (block) { return _this.destroyBlock(block); });
    };
    RowNodeCache.prototype.init = function () {
        var _this = this;
        this.active = true;
        this.addDestroyFunc(function () { return _this.active = false; });
    };
    RowNodeCache.prototype.isActive = function () {
        return this.active;
    };
    RowNodeCache.prototype.getVirtualRowCount = function () {
        return this.virtualRowCount;
    };
    RowNodeCache.prototype.hack_setVirtualRowCount = function (virtualRowCount) {
        this.virtualRowCount = virtualRowCount;
    };
    RowNodeCache.prototype.isMaxRowFound = function () {
        return this.maxRowFound;
    };
    // listener on EVENT_LOAD_COMPLETE
    RowNodeCache.prototype.onPageLoaded = function (event) {
        this.cacheParams.rowNodeBlockLoader.loadComplete();
        this.checkBlockToLoad();
        // if we are not active, then we ignore all events, otherwise we could end up getting the
        // grid to refresh even though we are no longer the active cache
        if (!this.isActive()) {
            return;
        }
        this.logger.log("onPageLoaded: page = " + event.page.getBlockNumber() + ", lastRow = " + event.lastRow);
        if (event.success) {
            this.checkVirtualRowCount(event.page, event.lastRow);
        }
    };
    RowNodeCache.prototype.purgeBlocksIfNeeded = function (blockToExclude) {
        var _this = this;
        // put all candidate blocks into a list for sorting
        var blocksForPurging = [];
        this.forEachBlockInOrder(function (block) {
            // we exclude checking for the page just created, as this has yet to be accessed and hence
            // the lastAccessed stamp will not be updated for the first time yet
            if (block === blockToExclude) {
                return;
            }
            blocksForPurging.push(block);
        });
        // note: need to verify that this sorts items in the right order
        blocksForPurging.sort(function (a, b) { return b.getLastAccessed() - a.getLastAccessed(); });
        // we remove (maxBlocksInCache - 1) as we already excluded the 'just created' page.
        // in other words, after the splice operation below, we have taken out the blocks
        // we want to keep, which means we are left with blocks that we can potentially purge
        var maxBlocksProvided = this.cacheParams.maxBlocksInCache > 0;
        var blocksToKeep = maxBlocksProvided ? this.cacheParams.maxBlocksInCache - 1 : null;
        var emptyBlocksToKeep = RowNodeCache.MAX_EMPTY_BLOCKS_TO_KEEP - 1;
        blocksForPurging.forEach(function (block, index) {
            var purgeBecauseBlockEmpty = block.getState() === rowNodeBlock_1.RowNodeBlock.STATE_DIRTY && index >= emptyBlocksToKeep;
            var purgeBecauseCacheFull = maxBlocksProvided ? index >= blocksToKeep : false;
            if (purgeBecauseBlockEmpty || purgeBecauseCacheFull) {
                // we never purge blocks if they are open, as purging them would mess up with
                // our indexes, it would be very messy to restore the purged block to it's
                // previous state if it had open children (and what if open children of open
                // children, jeeeesus, just thinking about it freaks me out) so best is have a
                // rule, if block is open, we never purge.
                if (block.isAnyNodeOpen(_this.virtualRowCount)) {
                    return;
                }
                // at this point, block is not needed, and no open nodes, so burn baby burn
                _this.removeBlockFromCache(block);
            }
        });
    };
    RowNodeCache.prototype.postCreateBlock = function (newBlock) {
        newBlock.addEventListener(rowNodeBlock_1.RowNodeBlock.EVENT_LOAD_COMPLETE, this.onPageLoaded.bind(this));
        this.setBlock(newBlock.getBlockNumber(), newBlock);
        this.purgeBlocksIfNeeded(newBlock);
        this.checkBlockToLoad();
    };
    RowNodeCache.prototype.removeBlockFromCache = function (blockToRemove) {
        if (!blockToRemove) {
            return;
        }
        this.destroyBlock(blockToRemove);
        // we do not want to remove the 'loaded' event listener, as the
        // concurrent loads count needs to be updated when the load is complete
        // if the purged page is in loading state
    };
    // gets called after: 1) block loaded 2) block created 3) cache refresh
    RowNodeCache.prototype.checkBlockToLoad = function () {
        this.cacheParams.rowNodeBlockLoader.checkBlockToLoad();
    };
    RowNodeCache.prototype.checkVirtualRowCount = function (block, lastRow) {
        // if client provided a last row, we always use it, as it could change between server calls
        // if user deleted data and then called refresh on the grid.
        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.virtualRowCount = lastRow;
            this.maxRowFound = true;
            this.onCacheUpdated();
        }
        else if (!this.maxRowFound) {
            // otherwise, see if we need to add some virtual rows
            var lastRowIndex = (block.getBlockNumber() + 1) * this.cacheParams.blockSize;
            var lastRowIndexPlusOverflow = lastRowIndex + this.cacheParams.overflowSize;
            if (this.virtualRowCount < lastRowIndexPlusOverflow) {
                this.virtualRowCount = lastRowIndexPlusOverflow;
                this.onCacheUpdated();
            }
            else if (this.cacheParams.dynamicRowHeight) {
                // the only other time is if dynamic row height, as loading rows
                // will change the height of the block, given the height of the rows
                // is only known after the row is loaded.
                this.onCacheUpdated();
            }
        }
    };
    RowNodeCache.prototype.setVirtualRowCount = function (rowCount, maxRowFound) {
        this.virtualRowCount = rowCount;
        // if undefined is passed, we do not set this value, if one of {true,false}
        // is passed, we do set the value.
        if (utils_1._.exists(maxRowFound)) {
            this.maxRowFound = maxRowFound;
        }
        // if we are still searching, then the row count must not end at the end
        // of a particular page, otherwise the searching will not pop into the
        // next page
        if (!this.maxRowFound) {
            if (this.virtualRowCount % this.cacheParams.blockSize === 0) {
                this.virtualRowCount++;
            }
        }
        this.onCacheUpdated();
    };
    RowNodeCache.prototype.forEachNodeDeep = function (callback, sequence) {
        var _this = this;
        if (sequence === void 0) { sequence = new utils_1.NumberSequence(); }
        this.forEachBlockInOrder(function (block) {
            block.forEachNodeDeep(callback, sequence, _this.virtualRowCount);
        });
    };
    RowNodeCache.prototype.forEachBlockInOrder = function (callback) {
        var ids = this.getBlockIdsSorted();
        this.forEachBlockId(ids, callback);
    };
    RowNodeCache.prototype.forEachBlockInReverseOrder = function (callback) {
        var ids = this.getBlockIdsSorted().reverse();
        this.forEachBlockId(ids, callback);
    };
    RowNodeCache.prototype.forEachBlockId = function (ids, callback) {
        var _this = this;
        ids.forEach(function (id) {
            var block = _this.blocks[id];
            callback(block, id);
        });
    };
    RowNodeCache.prototype.getBlockIdsSorted = function () {
        // get all page id's as NUMBERS (not strings, as we need to sort as numbers) and in descending order
        var numberComparator = function (a, b) { return a - b; }; // default comparator for array is string comparison
        var blockIds = Object.keys(this.blocks).map(function (idStr) { return parseInt(idStr, 10); }).sort(numberComparator);
        return blockIds;
    };
    RowNodeCache.prototype.getBlock = function (blockId) {
        return this.blocks[blockId];
    };
    RowNodeCache.prototype.setBlock = function (id, block) {
        this.blocks[id] = block;
        this.blockCount++;
        this.cacheParams.rowNodeBlockLoader.addBlock(block);
    };
    RowNodeCache.prototype.destroyBlock = function (block) {
        delete this.blocks[block.getBlockNumber()];
        block.destroy();
        this.blockCount--;
        this.cacheParams.rowNodeBlockLoader.removeBlock(block);
    };
    // gets called 1) row count changed 2) cache purged 3) items inserted
    RowNodeCache.prototype.onCacheUpdated = function () {
        if (this.isActive()) {
            // this results in both row models (infinite and server side) firing ModelUpdated,
            // however server side row model also updates the row indexes first
            var event_1 = {
                type: RowNodeCache.EVENT_CACHE_UPDATED
            };
            this.dispatchEvent(event_1);
        }
    };
    RowNodeCache.prototype.purgeCache = function () {
        var _this = this;
        this.forEachBlockInOrder(function (block) { return _this.removeBlockFromCache(block); });
        // re-initialise cache - this ensures a cache with no rows can reload when purged!
        this.virtualRowCount = this.cacheParams.initialRowCount;
        this.maxRowFound = false;
        this.onCacheUpdated();
    };
    RowNodeCache.prototype.getRowNodesInRange = function (firstInRange, lastInRange) {
        var _this = this;
        var result = [];
        var lastBlockId = -1;
        var inActiveRange = false;
        var numberSequence = new utils_1.NumberSequence();
        // if only one node passed, we start the selection at the top
        if (utils_1._.missing(firstInRange)) {
            inActiveRange = true;
        }
        var foundGapInSelection = false;
        this.forEachBlockInOrder(function (block, id) {
            if (foundGapInSelection) {
                return;
            }
            if (inActiveRange && (lastBlockId + 1 !== id)) {
                foundGapInSelection = true;
                return;
            }
            lastBlockId = id;
            block.forEachNodeShallow(function (rowNode) {
                var hitFirstOrLast = rowNode === firstInRange || rowNode === lastInRange;
                if (inActiveRange || hitFirstOrLast) {
                    result.push(rowNode);
                }
                if (hitFirstOrLast) {
                    inActiveRange = !inActiveRange;
                }
            }, numberSequence, _this.virtualRowCount);
        });
        // inActiveRange will be still true if we never hit the second rowNode
        var invalidRange = foundGapInSelection || inActiveRange;
        return invalidRange ? [] : result;
    };
    RowNodeCache.EVENT_CACHE_UPDATED = 'cacheUpdated';
    // this property says how many empty blocks should be in a cache, eg if scrolls down fast and creates 10
    // blocks all for loading, the grid will only load the last 2 - it will assume the blocks the user quickly
    // scrolled over are not needed to be loaded.
    RowNodeCache.MAX_EMPTY_BLOCKS_TO_KEEP = 2;
    return RowNodeCache;
}(beanStub_1.BeanStub));
exports.RowNodeCache = RowNodeCache;
