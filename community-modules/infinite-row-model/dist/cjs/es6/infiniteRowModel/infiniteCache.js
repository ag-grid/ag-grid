"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfiniteCache = void 0;
const core_1 = require("@ag-grid-community/core");
const infiniteBlock_1 = require("./infiniteBlock");
class InfiniteCache extends core_1.BeanStub {
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
        const newBlock = this.createBean(new infiniteBlock_1.InfiniteBlock(blockNumber, this, this.params));
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
            const purgeBecauseBlockEmpty = block.getState() === infiniteBlock_1.InfiniteBlock.STATE_WAITING_TO_LOAD && index >= emptyBlocksToKeep;
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
        if (core_1._.exists(lastRowIndexKnown)) {
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
        const sequence = new core_1.NumberSequence();
        this.getBlocksInOrder().forEach(block => block.forEachNode(callback, sequence, this.rowCount));
    }
    getBlocksInOrder() {
        // get all page id's as NUMBERS (not strings, as we need to sort as numbers) and in descending order
        const blockComparator = (a, b) => a.getId() - b.getId();
        const blocks = core_1._.getAllValuesInObject(this.blocks).sort(blockComparator);
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
                type: core_1.Events.EVENT_STORE_UPDATED
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
        const numberSequence = new core_1.NumberSequence();
        // if only one node passed, we start the selection at the top
        if (core_1._.missing(firstInRange)) {
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
    core_1.Autowired('rowRenderer')
], InfiniteCache.prototype, "rowRenderer", void 0);
__decorate([
    core_1.Autowired("focusService")
], InfiniteCache.prototype, "focusService", void 0);
__decorate([
    __param(0, core_1.Qualifier('loggerFactory'))
], InfiniteCache.prototype, "setBeans", null);
__decorate([
    core_1.PreDestroy
], InfiniteCache.prototype, "destroyAllBlocks", null);
exports.InfiniteCache = InfiniteCache;
