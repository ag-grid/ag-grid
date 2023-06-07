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
export class InfiniteCache extends BeanStub {
    constructor(params) {
        super();
        this.lastRowIndexKnown = false;
        this.blocks = {};
        this.blockCount = 0;
        this.rowCount = params.initialRowCount;
        this.params = params;
    }
    setBeans(loggerFactory) {
        this.logger = loggerFactory.create('InfiniteCache');
    }
    // the rowRenderer will not pass dontCreatePage, meaning when rendering the grid,
    // it will want new pages in the cache as it asks for rows. only when we are inserting /
    // removing rows via the api is dontCreatePage set, where we move rows between the pages.
    getRow(rowIndex, dontCreatePage = false) {
        const blockId = Math.floor(rowIndex / this.params.blockSize);
        let block = this.blocks[blockId];
        if (!block) {
            if (dontCreatePage) {
                return undefined;
            }
            block = this.createBlock(blockId);
        }
        return block.getRow(rowIndex);
    }
    createBlock(blockNumber) {
        const newBlock = this.createBean(new InfiniteBlock(blockNumber, this, this.params));
        this.blocks[newBlock.getId()] = newBlock;
        this.blockCount++;
        this.purgeBlocksIfNeeded(newBlock);
        this.params.rowNodeBlockLoader.addBlock(newBlock);
        return newBlock;
    }
    // we have this on infinite row model only, not server side row model,
    // because for server side, it would leave the children in inconsistent
    // state - eg if a node had children, but after the refresh it had data
    // for a different row, then the children would be with the wrong row node.
    refreshCache() {
        const nothingToRefresh = this.blockCount == 0;
        if (nothingToRefresh) {
            this.purgeCache();
            return;
        }
        this.getBlocksInOrder().forEach(block => block.setStateWaitingToLoad());
        this.params.rowNodeBlockLoader.checkBlockToLoad();
    }
    destroyAllBlocks() {
        this.getBlocksInOrder().forEach(block => this.destroyBlock(block));
    }
    getRowCount() {
        return this.rowCount;
    }
    isLastRowIndexKnown() {
        return this.lastRowIndexKnown;
    }
    // block calls this, when page loaded
    pageLoaded(block, lastRow) {
        // if we are not active, then we ignore all events, otherwise we could end up getting the
        // grid to refresh even though we are no longer the active cache
        if (!this.isAlive()) {
            return;
        }
        this.logger.log(`onPageLoaded: page = ${block.getId()}, lastRow = ${lastRow}`);
        this.checkRowCount(block, lastRow);
        // we fire cacheUpdated even if the row count has not changed, as some items need updating even
        // if no new rows to render. for example the pagination panel has '?' as the total rows when loading
        // is underway, which would need to get updated when loading finishes.
        this.onCacheUpdated();
    }
    purgeBlocksIfNeeded(blockToExclude) {
        // we exclude checking for the page just created, as this has yet to be accessed and hence
        // the lastAccessed stamp will not be updated for the first time yet
        const blocksForPurging = this.getBlocksInOrder().filter(b => b != blockToExclude);
        const lastAccessedComparator = (a, b) => b.getLastAccessed() - a.getLastAccessed();
        blocksForPurging.sort(lastAccessedComparator);
        // we remove (maxBlocksInCache - 1) as we already excluded the 'just created' page.
        // in other words, after the splice operation below, we have taken out the blocks
        // we want to keep, which means we are left with blocks that we can potentially purge
        const maxBlocksProvided = this.params.maxBlocksInCache > 0;
        const blocksToKeep = maxBlocksProvided ? this.params.maxBlocksInCache - 1 : null;
        const emptyBlocksToKeep = InfiniteCache.MAX_EMPTY_BLOCKS_TO_KEEP - 1;
        blocksForPurging.forEach((block, index) => {
            const purgeBecauseBlockEmpty = block.getState() === InfiniteBlock.STATE_WAITING_TO_LOAD && index >= emptyBlocksToKeep;
            const purgeBecauseCacheFull = maxBlocksProvided ? index >= blocksToKeep : false;
            if (purgeBecauseBlockEmpty || purgeBecauseCacheFull) {
                // if the block currently has rows been displayed, then don't remove it either.
                // this can happen if user has maxBlocks=2, and blockSize=5 (thus 10 max rows in cache)
                // but the screen is showing 20 rows, so at least 4 blocks are needed.
                if (this.isBlockCurrentlyDisplayed(block)) {
                    return;
                }
                // don't want to loose keyboard focus, so keyboard navigation can continue. so keep focused blocks.
                if (this.isBlockFocused(block)) {
                    return;
                }
                // at this point, block is not needed, so burn baby burn
                this.removeBlockFromCache(block);
            }
        });
    }
    isBlockFocused(block) {
        const focusedCell = this.focusService.getFocusCellToUseAfterRefresh();
        if (!focusedCell) {
            return false;
        }
        if (focusedCell.rowPinned != null) {
            return false;
        }
        const blockIndexStart = block.getStartRow();
        const blockIndexEnd = block.getEndRow();
        const hasFocus = focusedCell.rowIndex >= blockIndexStart && focusedCell.rowIndex < blockIndexEnd;
        return hasFocus;
    }
    isBlockCurrentlyDisplayed(block) {
        const startIndex = block.getStartRow();
        const endIndex = block.getEndRow() - 1;
        return this.rowRenderer.isRangeInRenderedViewport(startIndex, endIndex);
    }
    removeBlockFromCache(blockToRemove) {
        if (!blockToRemove) {
            return;
        }
        this.destroyBlock(blockToRemove);
        // we do not want to remove the 'loaded' event listener, as the
        // concurrent loads count needs to be updated when the load is complete
        // if the purged page is in loading state
    }
    checkRowCount(block, lastRow) {
        // if client provided a last row, we always use it, as it could change between server calls
        // if user deleted data and then called refresh on the grid.
        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.rowCount = lastRow;
            this.lastRowIndexKnown = true;
        }
        else if (!this.lastRowIndexKnown) {
            // otherwise, see if we need to add some virtual rows
            const lastRowIndex = (block.getId() + 1) * this.params.blockSize;
            const lastRowIndexPlusOverflow = lastRowIndex + this.params.overflowSize;
            if (this.rowCount < lastRowIndexPlusOverflow) {
                this.rowCount = lastRowIndexPlusOverflow;
            }
        }
    }
    setRowCount(rowCount, lastRowIndexKnown) {
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
    }
    forEachNodeDeep(callback) {
        const sequence = new NumberSequence();
        this.getBlocksInOrder().forEach(block => block.forEachNode(callback, sequence, this.rowCount));
    }
    getBlocksInOrder() {
        // get all page id's as NUMBERS (not strings, as we need to sort as numbers) and in descending order
        const blockComparator = (a, b) => a.getId() - b.getId();
        const blocks = _.getAllValuesInObject(this.blocks).sort(blockComparator);
        return blocks;
    }
    destroyBlock(block) {
        delete this.blocks[block.getId()];
        this.destroyBean(block);
        this.blockCount--;
        this.params.rowNodeBlockLoader.removeBlock(block);
    }
    // gets called 1) row count changed 2) cache purged 3) items inserted
    onCacheUpdated() {
        if (this.isAlive()) {
            // if the virtualRowCount is shortened, then it's possible blocks exist that are no longer
            // in the valid range. so we must remove these. this can happen if user explicitly sets
            // the virtual row count, or the datasource returns a result and sets lastRow to something
            // less than virtualRowCount (can happen if user scrolls down, server reduces dataset size).
            this.destroyAllBlocksPastVirtualRowCount();
            // this results in both row models (infinite and server side) firing ModelUpdated,
            // however server side row model also updates the row indexes first
            const event = {
                type: Events.EVENT_STORE_UPDATED
            };
            this.eventService.dispatchEvent(event);
        }
    }
    destroyAllBlocksPastVirtualRowCount() {
        const blocksToDestroy = [];
        this.getBlocksInOrder().forEach(block => {
            const startRow = block.getId() * this.params.blockSize;
            if (startRow >= this.rowCount) {
                blocksToDestroy.push(block);
            }
        });
        if (blocksToDestroy.length > 0) {
            blocksToDestroy.forEach(block => this.destroyBlock(block));
        }
    }
    purgeCache() {
        this.getBlocksInOrder().forEach(block => this.removeBlockFromCache(block));
        this.lastRowIndexKnown = false;
        // if zero rows in the cache, we need to get the SSRM to start asking for rows again.
        // otherwise if set to zero rows last time, and we don't update the row count, then after
        // the purge there will still be zero rows, meaning the SSRM won't request any rows.
        // to kick things off, at least one row needs to be asked for.
        if (this.rowCount === 0) {
            this.rowCount = this.params.initialRowCount;
        }
        this.onCacheUpdated();
    }
    getRowNodesInRange(firstInRange, lastInRange) {
        const result = [];
        let lastBlockId = -1;
        let inActiveRange = false;
        const numberSequence = new NumberSequence();
        // if only one node passed, we start the selection at the top
        if (_.missing(firstInRange)) {
            inActiveRange = true;
        }
        let foundGapInSelection = false;
        this.getBlocksInOrder().forEach(block => {
            if (foundGapInSelection) {
                return;
            }
            if (inActiveRange && (lastBlockId + 1 !== block.getId())) {
                foundGapInSelection = true;
                return;
            }
            lastBlockId = block.getId();
            block.forEachNode(rowNode => {
                const hitFirstOrLast = rowNode === firstInRange || rowNode === lastInRange;
                if (inActiveRange || hitFirstOrLast) {
                    result.push(rowNode);
                }
                if (hitFirstOrLast) {
                    inActiveRange = !inActiveRange;
                }
            }, numberSequence, this.rowCount);
        });
        // inActiveRange will be still true if we never hit the second rowNode
        const invalidRange = foundGapInSelection || inActiveRange;
        return invalidRange ? [] : result;
    }
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5maW5pdGVDYWNoZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9pbmZpbml0ZVJvd01vZGVsL2luZmluaXRlQ2FjaGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFDVCxRQUFRLEVBRVIsTUFBTSxFQUlOLGNBQWMsRUFDZCxVQUFVLEVBQ1YsU0FBUyxFQUlULENBQUMsRUFJSixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQWdCaEQsTUFBTSxPQUFPLGFBQWMsU0FBUSxRQUFRO0lBb0J2QyxZQUFZLE1BQTJCO1FBQ25DLEtBQUssRUFBRSxDQUFDO1FBUkosc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1FBRTFCLFdBQU0sR0FBOEMsRUFBRSxDQUFDO1FBQ3ZELGVBQVUsR0FBRyxDQUFDLENBQUM7UUFNbkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFTyxRQUFRLENBQTZCLGFBQTRCO1FBQ3JFLElBQUksQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsaUZBQWlGO0lBQ2pGLHdGQUF3RjtJQUN4Rix5RkFBeUY7SUFDbEYsTUFBTSxDQUFDLFFBQWdCLEVBQUUsY0FBYyxHQUFHLEtBQUs7UUFDbEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFVLENBQUMsQ0FBQztRQUM5RCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWpDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDUixJQUFJLGNBQWMsRUFB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