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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Autowired, BeanStub, Events, NumberSequence, PreDestroy, Qualifier, _ } from "@ag-grid-community/core";
import { InfiniteBlock } from "./infiniteBlock";
var InfiniteCache = /** @class */ (function (_super) {
    __extends(InfiniteCache, _super);
    function InfiniteCache(params) {
        var _this = _super.call(this) || this;
        _this.lastRowIndexKnown = false;
        _this.blocks = {};
        _this.blockCount = 0;
        _this.rowCount = params.initialRowCount;
        _this.params = params;
        return _this;
    }
    InfiniteCache.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('InfiniteCache');
    };
    // the rowRenderer will not pass dontCreatePage, meaning when rendering the grid,
    // it will want new pages in the cache as it asks for rows. only when we are inserting /
    // removing rows via the api is dontCreatePage set, where we move rows between the pages.
    InfiniteCache.prototype.getRow = function (rowIndex, dontCreatePage) {
        if (dontCreatePage === void 0) { dontCreatePage = false; }
        var blockId = Math.floor(rowIndex / this.params.blockSize);
        var block = this.blocks[blockId];
        if (!block) {
            if (dontCreatePage) {
                return undefined;
            }
            block = this.createBlock(blockId);
        }
        return block.getRow(rowIndex);
    };
    InfiniteCache.prototype.createBlock = function (blockNumber) {
        var newBlock = this.createBean(new InfiniteBlock(blockNumber, this, this.params));
        this.blocks[newBlock.getId()] = newBlock;
        this.blockCount++;
        this.purgeBlocksIfNeeded(newBlock);
        this.params.rowNodeBlockLoader.addBlock(newBlock);
        return newBlock;
    };
    // we have this on infinite row model only, not server side row model,
    // because for server side, it would leave the children in inconsistent
    // state - eg if a node had children, but after the refresh it had data
    // for a different row, then the children would be with the wrong row node.
    InfiniteCache.prototype.refreshCache = function () {
        var nothingToRefresh = this.blockCount == 0;
        if (nothingToRefresh) {
            this.purgeCache();
            return;
        }
        this.getBlocksInOrder().forEach(function (block) { return block.setStateWaitingToLoad(); });
        this.params.rowNodeBlockLoader.checkBlockToLoad();
    };
    InfiniteCache.prototype.destroyAllBlocks = function () {
        var _this = this;
        this.getBlocksInOrder().forEach(function (block) { return _this.destroyBlock(block); });
    };
    InfiniteCache.prototype.getRowCount = function () {
        return this.rowCount;
    };
    InfiniteCache.prototype.isLastRowIndexKnown = function () {
        return this.lastRowIndexKnown;
    };
    // block calls this, when page loaded
    InfiniteCache.prototype.pageLoaded = function (block, lastRow) {
        // if we are not active, then we ignore all events, otherwise we could end up getting the
        // grid to refresh even though we are no longer the active cache
        if (!this.isAlive()) {
            return;
        }
        this.logger.log("onPageLoaded: page = " + block.getId() + ", lastRow = " + lastRow);
        this.checkRowCount(block, lastRow);
        // we fire cacheUpdated even if the row count has not changed, as some items need updating even
        // if no new rows to render. for example the pagination panel has '?' as the total rows when loading
        // is underway, which would need to get updated when loading finishes.
        this.onCacheUpdated();
    };
    InfiniteCache.prototype.purgeBlocksIfNeeded = function (blockToExclude) {
        var _this = this;
        // we exclude checking for the page just created, as this has yet to be accessed and hence
        // the lastAccessed stamp will not be updated for the first time yet
        var blocksForPurging = this.getBlocksInOrder().filter(function (b) { return b != blockToExclude; });
        var lastAccessedComparator = function (a, b) { return b.getLastAccessed() - a.getLastAccessed(); };
        blocksForPurging.sort(lastAccessedComparator);
        // we remove (maxBlocksInCache - 1) as we already excluded the 'just created' page.
        // in other words, after the splice operation below, we have taken out the blocks
        // we want to keep, which means we are left with blocks that we can potentially purge
        var maxBlocksProvided = this.params.maxBlocksInCache > 0;
        var blocksToKeep = maxBlocksProvided ? this.params.maxBlocksInCache - 1 : null;
        var emptyBlocksToKeep = InfiniteCache.MAX_EMPTY_BLOCKS_TO_KEEP - 1;
        blocksForPurging.forEach(function (block, index) {
            var purgeBecauseBlockEmpty = block.getState() === InfiniteBlock.STATE_WAITING_TO_LOAD && index >= emptyBlocksToKeep;
            var purgeBecauseCacheFull = maxBlocksProvided ? index >= blocksToKeep : false;
            if (purgeBecauseBlockEmpty || purgeBecauseCacheFull) {
                // if the block currently has rows been displayed, then don't remove it either.
                // this can happen if user has maxBlocks=2, and blockSize=5 (thus 10 max rows in cache)
                // but the screen is showing 20 rows, so at least 4 blocks are needed.
                if (_this.isBlockCurrentlyDisplayed(block)) {
                    return;
                }
                // don't want to loose keyboard focus, so keyboard navigation can continue. so keep focused blocks.
                if (_this.isBlockFocused(block)) {
                    return;
                }
                // at this point, block is not needed, so burn baby burn
                _this.removeBlockFromCache(block);
            }
        });
    };
    InfiniteCache.prototype.isBlockFocused = function (block) {
        var focusedCell = this.focusService.getFocusCellToUseAfterRefresh();
        if (!focusedCell) {
            return false;
        }
        if (focusedCell.rowPinned != null) {
            return false;
        }
        var blockIndexStart = block.getStartRow();
        var blockIndexEnd = block.getEndRow();
        var hasFocus = focusedCell.rowIndex >= blockIndexStart && focusedCell.rowIndex < blockIndexEnd;
        return hasFocus;
    };
    InfiniteCache.prototype.isBlockCurrentlyDisplayed = function (block) {
        var startIndex = block.getStartRow();
        var endIndex = block.getEndRow() - 1;
        return this.rowRenderer.isRangeInRenderedViewport(startIndex, endIndex);
    };
    InfiniteCache.prototype.removeBlockFromCache = function (blockToRemove) {
        if (!blockToRemove) {
            return;
        }
        this.destroyBlock(blockToRemove);
        // we do not want to remove the 'loaded' event listener, as the
        // concurrent loads count needs to be updated when the load is complete
        // if the purged page is in loading state
    };
    InfiniteCache.prototype.checkRowCount = function (block, lastRow) {
        // if client provided a last row, we always use it, as it could change between server calls
        // if user deleted data and then called refresh on the grid.
        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.rowCount = lastRow;
            this.lastRowIndexKnown = true;
        }
        else if (!this.lastRowIndexKnown) {
            // otherwise, see if we need to add some virtual rows
            var lastRowIndex = (block.getId() + 1) * this.params.blockSize;
            var lastRowIndexPlusOverflow = lastRowIndex + this.params.overflowSize;
            if (this.rowCount < lastRowIndexPlusOverflow) {
                this.rowCount = lastRowIndexPlusOverflow;
            }
        }
    };
    InfiniteCache.prototype.setRowCount = function (rowCount, lastRowIndexKnown) {
        this.rowCount = rowCount;
        // if undefined is passed, we do not set this value, if one of {true,false}
        // is passed, we do set the value.
        if (_.exists(lastRowIndexKnown)) {
            this.lastRowIndexKnown = lastRowIndexKnown;
        }
        // if we are still searching, then the row count must not end at the end
        // of a particular page, otherwise the searching will not pop into the
        // next page
        if (!this.lastRowIndexKnown) {
            if (this.rowCount % this.params.blockSize === 0) {
                this.rowCount++;
            }
        }
        this.onCacheUpdated();
    };
    InfiniteCache.prototype.forEachNodeDeep = function (callback) {
        var _this = this;
        var sequence = new NumberSequence();
        this.getBlocksInOrder().forEach(function (block) { return block.forEachNode(callback, sequence, _this.rowCount); });
    };
    InfiniteCache.prototype.getBlocksInOrder = function () {
        // get all page id's as NUMBERS (not strings, as we need to sort as numbers) and in descending order
        var blockComparator = function (a, b) { return a.getId() - b.getId(); };
        var blocks = _.getAllValuesInObject(this.blocks).sort(blockComparator);
        return blocks;
    };
    InfiniteCache.prototype.destroyBlock = function (block) {
        delete this.blocks[block.getId()];
        this.destroyBean(block);
        this.blockCount--;
        this.params.rowNodeBlockLoader.removeBlock(block);
    };
    // gets called 1) row count changed 2) cache purged 3) items inserted
    InfiniteCache.prototype.onCacheUpdated = function () {
        if (this.isAlive()) {
            // if the virtualRowCount is shortened, then it's possible blocks exist that are no longer
            // in the valid range. so we must remove these. this can happen if user explicitly sets
            // the virtual row count, or the datasource returns a result and sets lastRow to something
            // less than virtualRowCount (can happen if user scrolls down, server reduces dataset size).
            this.destroyAllBlocksPastVirtualRowCount();
            // this results in both row models (infinite and server side) firing ModelUpdated,
            // however server side row model also updates the row indexes first
            var event_1 = {
                type: Events.EVENT_STORE_UPDATED
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    InfiniteCache.prototype.destroyAllBlocksPastVirtualRowCount = function () {
        var _this = this;
        var blocksToDestroy = [];
        this.getBlocksInOrder().forEach(function (block) {
            var startRow = block.getId() * _this.params.blockSize;
            if (startRow >= _this.rowCount) {
                blocksToDestroy.push(block);
            }
        });
        if (blocksToDestroy.length > 0) {
            blocksToDestroy.forEach(function (block) { return _this.destroyBlock(block); });
        }
    };
    InfiniteCache.prototype.purgeCache = function () {
        var _this = this;
        this.getBlocksInOrder().forEach(function (block) { return _this.removeBlockFromCache(block); });
        this.lastRowIndexKnown = false;
        // if zero rows in the cache, we need to get the SSRM to start asking for rows again.
        // otherwise if set to zero rows last time, and we don't update the row count, then after
        // the purge there will still be zero rows, meaning the SSRM won't request any rows.
        // to kick things off, at least one row needs to be asked for.
        if (this.rowCount === 0) {
            this.rowCount = this.params.initialRowCount;
        }
        this.onCacheUpdated();
    };
    InfiniteCache.prototype.getRowNodesInRange = function (firstInRange, lastInRange) {
        var _this = this;
        var result = [];
        var lastBlockId = -1;
        var inActiveRange = false;
        var numberSequence = new NumberSequence();
        // if only one node passed, we start the selection at the top
        if (_.missing(firstInRange)) {
            inActiveRange = true;
        }
        var foundGapInSelection = false;
        this.getBlocksInOrder().forEach(function (block) {
            if (foundGapInSelection) {
                return;
            }
            if (inActiveRange && (lastBlockId + 1 !== block.getId())) {
                foundGapInSelection = true;
                return;
            }
            lastBlockId = block.getId();
            block.forEachNode(function (rowNode) {
                var hitFirstOrLast = rowNode === firstInRange || rowNode === lastInRange;
                if (inActiveRange || hitFirstOrLast) {
                    result.push(rowNode);
                }
                if (hitFirstOrLast) {
                    inActiveRange = !inActiveRange;
                }
            }, numberSequence, _this.rowCount);
        });
        // inActiveRange will be still true if we never hit the second rowNode
        var invalidRange = foundGapInSelection || inActiveRange;
        return invalidRange ? [] : result;
    };
    // this property says how many empty blocks should be in a cache, eg if scrolls down fast and creates 10
    // blocks all for loading, the grid will only load the last 2 - it will assume the blocks the user quickly
    // scrolled over are not needed to be loaded.
    InfiniteCache.MAX_EMPTY_BLOCKS_TO_KEEP = 2;
    __decorate([
        Autowired('rowRenderer')
    ], InfiniteCache.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired("focusService")
    ], InfiniteCache.prototype, "focusService", void 0);
    __decorate([
        __param(0, Qualifier('loggerFactory'))
    ], InfiniteCache.prototype, "setBeans", null);
    __decorate([
        PreDestroy
    ], InfiniteCache.prototype, "destroyAllBlocks", null);
    return InfiniteCache;
}(BeanStub));
export { InfiniteCache };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5maW5pdGVDYWNoZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9pbmZpbml0ZVJvd01vZGVsL2luZmluaXRlQ2FjaGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFDVCxRQUFRLEVBRVIsTUFBTSxFQUlOLGNBQWMsRUFDZCxVQUFVLEVBQ1YsU0FBUyxFQUlULENBQUMsRUFJSixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQWdCaEQ7SUFBbUMsaUNBQVE7SUFvQnZDLHVCQUFZLE1BQTJCO1FBQXZDLFlBQ0ksaUJBQU8sU0FHVjtRQVhPLHVCQUFpQixHQUFHLEtBQUssQ0FBQztRQUUxQixZQUFNLEdBQThDLEVBQUUsQ0FBQztRQUN2RCxnQkFBVSxHQUFHLENBQUMsQ0FBQztRQU1uQixLQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUM7UUFDdkMsS0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7O0lBQ3pCLENBQUM7SUFFTyxnQ0FBUSxHQUFoQixVQUE2QyxhQUE0QjtRQUNyRSxJQUFJLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELGlGQUFpRjtJQUNqRix3RkFBd0Y7SUFDeEYseUZBQXlGO0lBQ2xGLDhCQUFNLEdBQWIsVUFBYyxRQUFnQixFQUFFLGNBQXNCO1FBQXRCLCtCQUFBLEVBQUEsc0JBQXNCO1FBQ2xELElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBVSxDQUFDLENBQUM7UUFDOUQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVqQyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1IsSUFBSSxjQUFjLEVBQUU7Z0JBQ2hCLE9BQU8sU0FBUyxDQUFDO2FBQ3BCO1lBQ0QsS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDckM7UUFFRCxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVPLG1DQUFXLEdBQW5CLFVBQW9CLFdBQW1CO1FBQ25DLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxhQUFhLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUVwRixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQztRQUN6QyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFbEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRW5DLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQW1CLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRW5ELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsdUVBQXVFO0lBQ3ZFLHVFQUF1RTtJQUN2RSwyRUFBMkU7SUFDcEUsb0NBQVksR0FBbkI7UUFDSSxJQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDO1FBQzlDLElBQUksZ0JBQWdCLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2xCLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxFQUE3QixDQUE2QixDQUFDLENBQUM7UUFDeEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ3ZELENBQUM7SUFHTyx3Q0FBZ0IsR0FBeEI7UUFEQSxpQkFHQztRQURHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQXhCLENBQXdCLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRU0sbUNBQVcsR0FBbEI7UUFDSSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVNLDJDQUFtQixHQUExQjtRQUNJLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO0lBQ2xDLENBQUM7SUFFRCxxQ0FBcUM7SUFDOUIsa0NBQVUsR0FBakIsVUFBa0IsS0FBb0IsRUFBRSxPQUFnQjtRQUNwRCx5RkFBeUY7UUFDekYsZ0VBQWdFO1FBQ2hFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDakIsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsMEJBQXdCLEtBQUssQ0FBQyxLQUFLLEVBQUUsb0JBQWUsT0FBUyxDQUFDLENBQUM7UUFFL0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkMsK0ZBQStGO1FBQy9GLG9HQUFvRztRQUNwRyxzRUFBc0U7UUFDdEUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFTywyQ0FBbUIsR0FBM0IsVUFBNEIsY0FBNkI7UUFBekQsaUJBa0NDO1FBakNHLDBGQUEwRjtRQUMxRixvRUFBb0U7UUFDcEUsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLElBQUksY0FBYyxFQUFuQixDQUFtQixDQUFDLENBQUM7UUFDbEYsSUFBTSxzQkFBc0IsR0FBRyxVQUFDLENBQWdCLEVBQUUsQ0FBZ0IsSUFBSyxPQUFBLENBQUMsQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUMsZUFBZSxFQUFFLEVBQXpDLENBQXlDLENBQUM7UUFDakgsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFFOUMsbUZBQW1GO1FBQ25GLGlGQUFpRjtRQUNqRixxRkFBcUY7UUFDckYsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFpQixHQUFHLENBQUMsQ0FBQztRQUM1RCxJQUFNLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBaUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNsRixJQUFNLGlCQUFpQixHQUFHLGFBQWEsQ0FBQyx3QkFBd0IsR0FBRyxDQUFDLENBQUM7UUFFckUsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBb0IsRUFBRSxLQUFhO1lBQ3pELElBQU0sc0JBQXNCLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLGFBQWEsQ0FBQyxxQkFBcUIsSUFBSSxLQUFLLElBQUksaUJBQWlCLENBQUM7WUFFdEgsSUFBTSxxQkFBcUIsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLFlBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBRWpGLElBQUksc0JBQXNCLElBQUkscUJBQXFCLEVBQUU7Z0JBRWpELCtFQUErRTtnQkFDL0UsdUZBQXVGO2dCQUN2RixzRUFBc0U7Z0JBQ3RFLElBQUksS0FBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUFFLE9BQU87aUJBQUU7Z0JBRXRELG1HQUFtRztnQkFDbkcsSUFBSSxLQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUFFLE9BQU87aUJBQUU7Z0JBRTNDLHdEQUF3RDtnQkFDeEQsS0FBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3BDO1FBRUwsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sc0NBQWMsR0FBdEIsVUFBdUIsS0FBb0I7UUFDdkMsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO1FBQ3RFLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFBRSxPQUFPLEtBQUssQ0FBQztTQUFFO1FBQ25DLElBQUksV0FBVyxDQUFDLFNBQVMsSUFBSSxJQUFJLEVBQUU7WUFBRSxPQUFPLEtBQUssQ0FBQztTQUFFO1FBRXBELElBQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM1QyxJQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFeEMsSUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLFFBQVEsSUFBSSxlQUFlLElBQUksV0FBVyxDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUM7UUFDakcsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQztJQUVPLGlEQUF5QixHQUFqQyxVQUFrQyxLQUFvQjtRQUNsRCxJQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkMsSUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN2QyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMseUJBQXlCLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFFTyw0Q0FBb0IsR0FBNUIsVUFBNkIsYUFBNEI7UUFDckQsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUFFLE9BQU87U0FBRTtRQUUvQixJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRWpDLCtEQUErRDtRQUMvRCx1RUFBdUU7UUFDdkUseUNBQXlDO0lBQzdDLENBQUM7SUFFTyxxQ0FBYSxHQUFyQixVQUFzQixLQUFvQixFQUFFLE9BQWdCO1FBQ3hELDJGQUEyRjtRQUMzRiw0REFBNEQ7UUFDNUQsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLElBQUksT0FBTyxJQUFJLENBQUMsRUFBRTtZQUM3QyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1NBQ2pDO2FBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUNoQyxxREFBcUQ7WUFDckQsSUFBTSxZQUFZLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFVLENBQUM7WUFDbEUsSUFBTSx3QkFBd0IsR0FBRyxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7WUFFekUsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLHdCQUF3QixFQUFFO2dCQUMxQyxJQUFJLENBQUMsUUFBUSxHQUFHLHdCQUF3QixDQUFDO2FBQzVDO1NBQ0o7SUFDTCxDQUFDO0lBRU0sbUNBQVcsR0FBbEIsVUFBbUIsUUFBZ0IsRUFBRSxpQkFBMkI7UUFDNUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFFekIsMkVBQTJFO1FBQzNFLGtDQUFrQztRQUNsQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsRUFBRTtZQUM3QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7U0FDOUM7UUFFRCx3RUFBd0U7UUFDeEUsc0VBQXNFO1FBQ3RFLFlBQVk7UUFDWixJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQ3pCLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVUsS0FBSyxDQUFDLEVBQUU7Z0JBQzlDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNuQjtTQUNKO1FBRUQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFTSx1Q0FBZSxHQUF0QixVQUF1QixRQUFtRDtRQUExRSxpQkFHQztRQUZHLElBQU0sUUFBUSxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFDdEMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUksQ0FBQyxRQUFRLENBQUMsRUFBcEQsQ0FBb0QsQ0FBQyxDQUFDO0lBQ25HLENBQUM7SUFFTSx3Q0FBZ0IsR0FBdkI7UUFDSSxvR0FBb0c7UUFDcEcsSUFBTSxlQUFlLEdBQUcsVUFBQyxDQUFnQixFQUFFLENBQWdCLElBQUssT0FBQSxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFyQixDQUFxQixDQUFDO1FBQ3RGLElBQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3pFLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTyxvQ0FBWSxHQUFwQixVQUFxQixLQUFvQjtRQUNyQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBbUIsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVELHFFQUFxRTtJQUM3RCxzQ0FBYyxHQUF0QjtRQUNJLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBRWhCLDBGQUEwRjtZQUMxRix1RkFBdUY7WUFDdkYsMEZBQTBGO1lBQzFGLDRGQUE0RjtZQUM1RixJQUFJLENBQUMsbUNBQW1DLEVBQUUsQ0FBQztZQUUzQyxrRkFBa0Y7WUFDbEYsbUVBQW1FO1lBQ25FLElBQU0sT0FBSyxHQUF5QztnQkFDaEQsSUFBSSxFQUFFLE1BQU0sQ0FBQyxtQkFBbUI7YUFDbkMsQ0FBQztZQUNGLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLE9BQUssQ0FBQyxDQUFDO1NBQzFDO0lBQ0wsQ0FBQztJQUVPLDJEQUFtQyxHQUEzQztRQUFBLGlCQVdDO1FBVkcsSUFBTSxlQUFlLEdBQW9CLEVBQUUsQ0FBQztRQUM1QyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLO1lBQ2pDLElBQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxLQUFJLENBQUMsTUFBTSxDQUFDLFNBQVUsQ0FBQztZQUN4RCxJQUFJLFFBQVEsSUFBSSxLQUFJLENBQUMsUUFBUSxFQUFFO2dCQUMzQixlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQy9CO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzVCLGVBQWUsQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxLQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUF4QixDQUF3QixDQUFDLENBQUM7U0FDOUQ7SUFDTCxDQUFDO0lBRU0sa0NBQVUsR0FBakI7UUFBQSxpQkFZQztRQVhHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsRUFBaEMsQ0FBZ0MsQ0FBQyxDQUFDO1FBQzNFLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7UUFDL0IscUZBQXFGO1FBQ3JGLHlGQUF5RjtRQUN6RixvRkFBb0Y7UUFDcEYsOERBQThEO1FBQzlELElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDLEVBQUU7WUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQztTQUMvQztRQUVELElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRU0sMENBQWtCLEdBQXpCLFVBQTBCLFlBQXFCLEVBQUUsV0FBb0I7UUFBckUsaUJBd0NDO1FBdkNHLElBQU0sTUFBTSxHQUFjLEVBQUUsQ0FBQztRQUU3QixJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUM7UUFDMUIsSUFBTSxjQUFjLEdBQW1CLElBQUksY0FBYyxFQUFFLENBQUM7UUFFNUQsNkRBQTZEO1FBQzdELElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUN6QixhQUFhLEdBQUcsSUFBSSxDQUFDO1NBQ3hCO1FBRUQsSUFBSSxtQkFBbUIsR0FBRyxLQUFLLENBQUM7UUFFaEMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSztZQUNqQyxJQUFJLG1CQUFtQixFQUFFO2dCQUFFLE9BQU87YUFBRTtZQUVwQyxJQUFJLGFBQWEsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLEtBQUssS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUU7Z0JBQ3RELG1CQUFtQixHQUFHLElBQUksQ0FBQztnQkFDM0IsT0FBTzthQUNWO1lBRUQsV0FBVyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUU1QixLQUFLLENBQUMsV0FBVyxDQUFDLFVBQUEsT0FBTztnQkFDckIsSUFBTSxjQUFjLEdBQUcsT0FBTyxLQUFLLFlBQVksSUFBSSxPQUFPLEtBQUssV0FBVyxDQUFDO2dCQUMzRSxJQUFJLGFBQWEsSUFBSSxjQUFjLEVBQUU7b0JBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQ3hCO2dCQUVELElBQUksY0FBYyxFQUFFO29CQUNoQixhQUFhLEdBQUcsQ0FBQyxhQUFhLENBQUM7aUJBQ2xDO1lBRUwsQ0FBQyxFQUFFLGNBQWMsRUFBRSxLQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxzRUFBc0U7UUFDdEUsSUFBTSxZQUFZLEdBQUcsbUJBQW1CLElBQUksYUFBYSxDQUFDO1FBQzFELE9BQU8sWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUN0QyxDQUFDO0lBdFRELHdHQUF3RztJQUN4RywwR0FBMEc7SUFDMUcsNkNBQTZDO0lBQzlCLHNDQUF3QixHQUFHLENBQUMsQ0FBQztJQUVsQjtRQUF6QixTQUFTLENBQUMsYUFBYSxDQUFDO3NEQUFvQztJQUNsQztRQUExQixTQUFTLENBQUMsY0FBYyxDQUFDO3VEQUFvQztJQWtCOUQ7UUFBa0IsV0FBQSxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUE7aURBRTNDO0lBZ0REO1FBREMsVUFBVTt5REFHVjtJQTJPTCxvQkFBQztDQUFBLEFBelRELENBQW1DLFFBQVEsR0F5VDFDO1NBelRZLGFBQWEifQ==