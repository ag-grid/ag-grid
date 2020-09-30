import {
    _,
    Autowired,
    ColumnVO,
    GridOptionsWrapper,
    IServerSideCache,
    IServerSideDatasource,
    LoggerFactory,
    NumberSequence,
    Qualifier,
    RowBounds,
    RowNode,
    RowDataTransaction,
    RowNodeTransaction,
    BeanStub,
    RowRenderer,
    Logger,
    PostConstruct,
    PreDestroy,
    RowNodeBlockLoader,
    AgEvent
} from "@ag-grid-community/core";

import {ServerSideBlock} from "./serverSideBlock";

export interface ServerSideCacheParams {
    blockSize?: number;
    sortModel: any;
    filterModel: any;
    maxBlocksInCache?: number;
    rowHeight: number;
    lastAccessedSequence: NumberSequence;
    rowNodeBlockLoader?: RowNodeBlockLoader;
    dynamicRowHeight: boolean;
    rowGroupCols: ColumnVO[];
    valueCols: ColumnVO[];
    pivotCols: ColumnVO[];
    pivotMode: boolean;
    datasource?: IServerSideDatasource;
}

export interface CacheUpdatedEvent extends AgEvent {
}

export class ServerSideCache extends BeanStub implements IServerSideCache {

    public static EVENT_CACHE_UPDATED = 'cacheUpdated';

    // this property says how many empty blocks should be in a cache, eg if scrolls down fast and creates 10
    // blocks all for loading, the grid will only load the last 2 - it will assume the blocks the user quickly
    // scrolled over are not needed to be loaded.
    private static MAX_EMPTY_BLOCKS_TO_KEEP = 2;

    private static INITIAL_ROW_COUNT = 1;
    private static OVERFLOW_SIZE = 1;

    @Autowired('rowRenderer') protected rowRenderer: RowRenderer;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private virtualRowCount: number;
    private maxRowFound = false;

    private params: ServerSideCacheParams;

    private blocks: { [blockNumber: string]: ServerSideBlock; } = {};
    private blockCount = 0;

    private logger: Logger;

    // this will always be zero for the top level cache only,
    // all the other ones change as the groups open and close
    private displayIndexStart = 0;
    private displayIndexEnd = 0; // not sure if setting this one to zero is necessary

    private readonly parentRowNode: RowNode;

    private cacheTop = 0;
    private cacheHeight: number;

    private blockHeights: { [blockId: number]: number } = {};

    constructor(cacheParams: ServerSideCacheParams, parentRowNode: RowNode) {
        super();
        this.parentRowNode = parentRowNode;
        this.virtualRowCount = ServerSideCache.INITIAL_ROW_COUNT;
        this.params  = cacheParams;
    }

    @PreDestroy
    private destroyAllBlocks(): void {
        this.forEachBlockInOrder(block => this.destroyBlock(block));
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('ServerSideCache');
    }

    public getVirtualRowCount(): number {
        return this.virtualRowCount;
    }

    public isMaxRowFound(): boolean {
        return this.maxRowFound;
    }

    // listener on EVENT_LOAD_COMPLETE
    private onPageLoaded(event: any): void {
        this.params.rowNodeBlockLoader.loadComplete();
        this.checkBlockToLoad();

        // if we are not active, then we ignore all events, otherwise we could end up getting the
        // grid to refresh even though we are no longer the active cache
        if (!this.isAlive()) {
            return;
        }

        this.logger.log(`onPageLoaded: page = ${event.page.getBlockNumber()}, lastRow = ${event.lastRow}`);

        if (event.success) {
            this.checkVirtualRowCount(event.page, event.lastRow);
            this.onCacheUpdated();
        }
    }

    private purgeBlocksIfNeeded(blockToExclude: ServerSideBlock): void {
        // put all candidate blocks into a list for sorting
        const blocksForPurging: ServerSideBlock[] = [];
        this.forEachBlockInOrder((block: ServerSideBlock) => {
            // we exclude checking for the page just created, as this has yet to be accessed and hence
            // the lastAccessed stamp will not be updated for the first time yet
            if (block === blockToExclude) {
                return;
            }

            blocksForPurging.push(block);
        });

        // note: need to verify that this sorts items in the right order
        blocksForPurging.sort((a: ServerSideBlock, b: ServerSideBlock) => b.getLastAccessed() - a.getLastAccessed());

        // we remove (maxBlocksInCache - 1) as we already excluded the 'just created' page.
        // in other words, after the splice operation below, we have taken out the blocks
        // we want to keep, which means we are left with blocks that we can potentially purge
        const maxBlocksProvided = this.params.maxBlocksInCache > 0;
        const blocksToKeep = maxBlocksProvided ? this.params.maxBlocksInCache - 1 : null;
        const emptyBlocksToKeep = ServerSideCache.MAX_EMPTY_BLOCKS_TO_KEEP - 1;

        blocksForPurging.forEach((block: ServerSideBlock, index: number) => {

            const purgeBecauseBlockEmpty = block.getState() === ServerSideBlock.STATE_WAITING_TO_LOAD && index >= emptyBlocksToKeep;

            const purgeBecauseCacheFull = maxBlocksProvided ? index >= blocksToKeep : false;

            if (purgeBecauseBlockEmpty || purgeBecauseCacheFull) {

                // we never purge blocks if they are open, as purging them would mess up with
                // our indexes, it would be very messy to restore the purged block to it's
                // previous state if it had open children (and what if open children of open
                // children, jeeeesus, just thinking about it freaks me out) so best is have a
                // rule, if block is open, we never purge.
                if (block.isAnyNodeOpen(this.virtualRowCount)) { return; }

                // if the block currently has rows been displayed, then don't remove it either.
                // this can happen if user has maxBlocks=2, and blockSize=5 (thus 10 max rows in cache)
                // but the screen is showing 20 rows, so at least 4 blocks are needed.
                if (this.isBlockCurrentlyDisplayed(block)) { return; }

                // at this point, block is not needed, and no open nodes, so burn baby burn
                this.removeBlockFromCache(block);
            }

        });
    }

    private isBlockCurrentlyDisplayed(block: ServerSideBlock): boolean {
        const firstViewportRow = this.rowRenderer.getFirstVirtualRenderedRow();
        const lastViewportRow = this.rowRenderer.getLastVirtualRenderedRow();

        const firstRowIndex = block.getDisplayIndexStart();
        const lastRowIndex = block.getDisplayIndexEnd() - 1;

        // parent closed means the parent node is not expanded, thus these blocks are not visible
        const parentClosed = firstRowIndex == null || lastRowIndex == null;
        if (parentClosed) { return false; }

        const blockBeforeViewport = firstRowIndex > lastViewportRow;
        const blockAfterViewport = lastRowIndex < firstViewportRow;
        const blockInsideViewport = !blockBeforeViewport && !blockAfterViewport;

        return blockInsideViewport;
    }

    protected postCreateBlock(newBlock: ServerSideBlock): void {
        newBlock.addEventListener(ServerSideBlock.EVENT_LOAD_COMPLETE, this.onPageLoaded.bind(this));
        this.setBlock(newBlock.getBlockNumber(), newBlock);
        this.purgeBlocksIfNeeded(newBlock);
        this.checkBlockToLoad();
    }

    protected removeBlockFromCache(blockToRemove: ServerSideBlock): void {
        if (!blockToRemove) {
            return;
        }

        this.destroyBlock(blockToRemove);

        // we do not want to remove the 'loaded' event listener, as the
        // concurrent loads count needs to be updated when the load is complete
        // if the purged page is in loading state
    }

    // gets called after: 1) block loaded 2) block created 3) cache refresh
    protected checkBlockToLoad() {
        this.params.rowNodeBlockLoader.checkBlockToLoad();
    }

    protected checkVirtualRowCount(block: ServerSideBlock, lastRow?: number): void {
        // if client provided a last row, we always use it, as it could change between server calls
        // if user deleted data and then called refresh on the grid.
        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.virtualRowCount = lastRow;
            this.maxRowFound = true;
        } else if (!this.maxRowFound) {
            // otherwise, see if we need to add some virtual rows
            const lastRowIndex = (block.getBlockNumber() + 1) * this.params.blockSize;
            const lastRowIndexPlusOverflow = lastRowIndex + ServerSideCache.OVERFLOW_SIZE;

            if (this.virtualRowCount < lastRowIndexPlusOverflow) {
                this.virtualRowCount = lastRowIndexPlusOverflow;
            }
        }
    }

    public setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void {
        this.virtualRowCount = rowCount;
        // if undefined is passed, we do not set this value, if one of {true,false}
        // is passed, we do set the value.
        if (_.exists(maxRowFound)) {
            this.maxRowFound = maxRowFound;
        }

        // if we are still searching, then the row count must not end at the end
        // of a particular page, otherwise the searching will not pop into the
        // next page
        if (!this.maxRowFound) {
            if (this.virtualRowCount % this.params.blockSize === 0) {
                this.virtualRowCount++;
            }
        }

        this.onCacheUpdated();
    }

    public forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence = new NumberSequence()): void {
        this.forEachBlockInOrder(block => block.forEachNodeDeep(callback, sequence, this.virtualRowCount));
    }

    public forEachBlockInOrder(callback: (block: ServerSideBlock, id: number) => void): void {
        const ids = this.getBlockIdsSorted();
        this.forEachBlockId(ids, callback);
    }

    protected forEachBlockInReverseOrder(callback: (block: ServerSideBlock, id: number) => void): void {
        const ids = this.getBlockIdsSorted().reverse();
        this.forEachBlockId(ids, callback);
    }

    private forEachBlockId(ids: number[], callback: (block: ServerSideBlock, id: number) => void): void {
        ids.forEach(id => {
            const block = this.blocks[id];
            callback(block, id);
        });
    }

    protected getBlockIdsSorted(): number[] {
        // get all page id's as NUMBERS (not strings, as we need to sort as numbers) and in descending order
        const numberComparator = (a: number, b: number) => a - b; // default comparator for array is string comparison
        const blockIds = Object.keys(this.blocks).map(idStr => parseInt(idStr, 10)).sort(numberComparator);
        return blockIds;
    }

    protected getBlock(blockId: string | number): ServerSideBlock {
        return this.blocks[blockId];
    }

    protected setBlock(id: number, block: ServerSideBlock): void {
        this.blocks[id] = block;
        this.blockCount++;
        this.params.rowNodeBlockLoader.addBlock(block);
    }

    protected destroyBlock(block: ServerSideBlock): void {
        delete this.blocks[block.getBlockNumber()];
        this.destroyBean(block);
        this.blockCount--;
        this.params.rowNodeBlockLoader.removeBlock(block);
    }

    // gets called 1) row count changed 2) cache purged 3) items inserted
    protected onCacheUpdated(): void {
        if (this.isAlive()) {

            // if the virtualRowCount is shortened, then it's possible blocks exist that are no longer
            // in the valid range. so we must remove these. this can happen if user explicitly sets
            // the virtual row count, or the datasource returns a result and sets lastRow to something
            // less than virtualRowCount (can happen if user scrolls down, server reduces dataset size).
            this.destroyAllBlocksPastVirtualRowCount();

            // this results in both row models (infinite and server side) firing ModelUpdated,
            // however server side row model also updates the row indexes first
            const event: CacheUpdatedEvent = {
                type: ServerSideCache.EVENT_CACHE_UPDATED
            };
            this.dispatchEvent(event);
        }
    }

    private destroyAllBlocksPastVirtualRowCount(): void {
        const blocksToDestroy: ServerSideBlock[] = [];
        this.forEachBlockInOrder((block: ServerSideBlock, id: number) => {
            const startRow = id * this.params.blockSize;
            if (startRow >= this.virtualRowCount) {
                blocksToDestroy.push(block);
            }
        });
        if (blocksToDestroy.length > 0) {
            blocksToDestroy.forEach(block => this.destroyBlock(block));
        }
    }

    public purgeCache(): void {
        this.forEachBlockInOrder(block => this.removeBlockFromCache(block));
        this.maxRowFound = false;
        // if zero rows in the cache, we need to get the SSRM to start asking for rows again.
        // otherwise if set to zero rows last time, and we don't update the row count, then after
        // the purge there will still be zero rows, meaning the SSRM won't request any rows.
        // to kick things off, at least one row needs to be asked for.
        if (this.virtualRowCount === 0) {
            this.virtualRowCount = ServerSideCache.INITIAL_ROW_COUNT;
        }

        this.onCacheUpdated();
    }

    public getRowNodesInRange(firstInRange: RowNode, lastInRange: RowNode): RowNode[] {
        const result: RowNode[] = [];

        let lastBlockId = -1;
        let inActiveRange = false;
        const numberSequence: NumberSequence = new NumberSequence();

        // if only one node passed, we start the selection at the top
        if (_.missing(firstInRange)) {
            inActiveRange = true;
        }

        let foundGapInSelection = false;

        this.forEachBlockInOrder((block: ServerSideBlock, id: number) => {
            if (foundGapInSelection) { return; }

            if (inActiveRange && (lastBlockId + 1 !== id)) {
                foundGapInSelection = true;
                return;
            }

            lastBlockId = id;

            block.forEachNodeShallow(rowNode => {
                const hitFirstOrLast = rowNode === firstInRange || rowNode === lastInRange;
                if (inActiveRange || hitFirstOrLast) {
                    result.push(rowNode);
                }

                if (hitFirstOrLast) {
                    inActiveRange = !inActiveRange;
                }

            }, numberSequence, this.virtualRowCount);
        });

        // inActiveRange will be still true if we never hit the second rowNode
        const invalidRange = foundGapInSelection || inActiveRange;
        return invalidRange ? [] : result;
    }

    public getRowBounds(index: number): RowBounds {
        // this.logger.log(`getRowBounds(${index})`);

        // we return null if row not found

        // note - cast to "any" due to https://github.com/Microsoft/TypeScript/issues/11498
        // should be RowBounds
        let result: any;
        let blockFound = false;

        // note - cast to "any" due to https://github.com/Microsoft/TypeScript/issues/11498
        // should be ServerSideBlock
        let lastBlock: any = null;

        this.forEachBlockInOrder(block => {
            if (blockFound) { return; }

            if (block.isDisplayIndexInBlock(index)) {
                result = block.getRowBounds(index, this.getVirtualRowCount());
                blockFound = true;
            } else if (block.isBlockBefore(index)) {
                lastBlock = block;
            }
        });

        if (!blockFound) {

            let nextRowTop: number;
            let nextRowIndex: number;

            if (lastBlock !== null) {
                nextRowTop = lastBlock.getBlockTop() + lastBlock.getBlockHeight();
                nextRowIndex = lastBlock.getDisplayIndexEnd();
            } else {
                nextRowTop = this.cacheTop;
                nextRowIndex = this.displayIndexStart;
            }

            const rowsBetween = index - nextRowIndex;

            result = {
                rowHeight: this.params.rowHeight,
                rowTop: nextRowTop + rowsBetween * this.params.rowHeight
            };
        }

        // NOTE: what about purged blocks

        // this.logger.log(`getRowBounds(${index}), result = ${result}`);

        return result;
    }

    public getRowIndexAtPixel(pixel: number): number {
        // this.logger.log(`getRowIndexAtPixel(${pixel})`);

        // we return null if row not found
        // note - cast to "any" due to https://github.com/Microsoft/TypeScript/issues/11498
        // should be number
        let result: any;
        let blockFound = false;

        // note - cast to "any" due to https://github.com/Microsoft/TypeScript/issues/11498
        // should be ServerSideBlock
        let lastBlock: any;

        this.forEachBlockInOrder(block => {
            if (blockFound) { return; }

            if (block.isPixelInRange(pixel)) {
                result = block.getRowIndexAtPixel(pixel, this.getVirtualRowCount());
                blockFound = true;
            } else if (block.getBlockTop() < pixel) {
                lastBlock = block;
            }
        });

        if (!blockFound) {

            let nextRowTop: number;
            let nextRowIndex: number;

            if (lastBlock) {
                nextRowTop = lastBlock.getBlockTop() + lastBlock.getBlockHeight();
                nextRowIndex = lastBlock.getDisplayIndexEnd();
            } else {
                nextRowTop = this.cacheTop;
                nextRowIndex = this.displayIndexStart;
            }

            const pixelsBetween = pixel - nextRowTop;
            const rowsBetween = (pixelsBetween / this.params.rowHeight) | 0;

            result = nextRowIndex + rowsBetween;
        }

        const lastAllowedIndex = this.getDisplayIndexEnd() - 1;
        if (result > lastAllowedIndex) {
            result = lastAllowedIndex;
        }

        //NOTE: purged

        // this.logger.log(`getRowIndexAtPixel(${pixel}) result = ${result}`);

        return result;
    }

    public clearDisplayIndexes(): void {
        this.displayIndexStart = undefined;
        this.displayIndexEnd = undefined;
        this.forEachBlockInOrder(block => block.clearDisplayIndexes(this.getVirtualRowCount()));
    }

    public setDisplayIndexes(displayIndexSeq: NumberSequence,
                             nextRowTop: { value: number }): void {
        this.displayIndexStart = displayIndexSeq.peek();

        this.cacheTop = nextRowTop.value;

        let lastBlockId = -1;

        const blockSize = this.getBlockSize();

        this.forEachBlockInOrder((currentBlock: ServerSideBlock, blockId: number) => {

            // if we skipped blocks, then we need to skip the row indexes. we assume that all missing
            // blocks are made up of closed RowNodes only (if they were groups), as we never expire from
            // the cache if any row nodes are open.
            const blocksSkippedCount = blockId - lastBlockId - 1;
            const rowsSkippedCount = blocksSkippedCount * blockSize;
            if (rowsSkippedCount > 0) {
                displayIndexSeq.skip(rowsSkippedCount);
            }

            for (let i = 1; i <= blocksSkippedCount; i++) {
                const blockToAddId = blockId - i;
                if (_.exists(this.blockHeights[blockToAddId])) {
                    nextRowTop.value += this.blockHeights[blockToAddId];
                } else {
                    nextRowTop.value += blockSize * this.params.rowHeight;
                }
            }

            lastBlockId = blockId;

            currentBlock.setDisplayIndexes(displayIndexSeq, this.getVirtualRowCount(), nextRowTop);

            this.blockHeights[blockId] = currentBlock.getBlockHeight();
        });

        // if any blocks missing at the end, need to increase the row index for them also
        // eg if block size = 10, we have total rows of 25 (indexes 0 .. 24), but first 2 blocks loaded (because
        // last row was ejected from cache), then:
        // lastVisitedRow = 19, virtualRowCount = 25, rows not accounted for = 5 (24 - 19)
        const lastVisitedRow = ((lastBlockId + 1) * blockSize) - 1;
        const rowCount = this.getVirtualRowCount();
        const rowsNotAccountedFor = rowCount - lastVisitedRow - 1;
        if (rowsNotAccountedFor > 0) {
            displayIndexSeq.skip(rowsNotAccountedFor);
            nextRowTop.value += rowsNotAccountedFor * this.params.rowHeight;
        }

        this.displayIndexEnd = displayIndexSeq.peek();
        this.cacheHeight = nextRowTop.value - this.cacheTop;
    }

    // gets called in a) init() above and b) by the grid
    public getRow(displayRowIndex: number, dontCreateBlock = false): RowNode | null {

        // this can happen if asking for a row that doesn't exist in the model,
        // eg if a cell range is selected, and the user filters so rows no longer
        // exist
        if (!this.isDisplayIndexInCache(displayRowIndex)) {
            return null;
        }

        // if we have the block, then this is the block
        let block: ServerSideBlock | null = null;

        // this is the last block that we have BEFORE the right block
        // note - cast to "any" due to https://github.com/Microsoft/TypeScript/issues/11498
        // should be ServerSideBlock
        let beforeBlock: any = null;

        this.forEachBlockInOrder(currentBlock => {
            if (currentBlock.isDisplayIndexInBlock(displayRowIndex)) {
                block = currentBlock;
            } else if (currentBlock.isBlockBefore(displayRowIndex)) {
                // this will get assigned many times, but the last time will
                // be the closest block to the required block that is BEFORE
                beforeBlock = currentBlock;
            }
        });

        // when we are moving rows around, we don't want to trigger loads
        if (_.missing(block) && dontCreateBlock) {
            return null;
        }

        const blockSize = this.getBlockSize();

        // if block not found, we need to load it
        if (_.missing(block)) {

            let blockNumber: number;
            let displayIndexStart: number;
            let nextRowTop: number;

            // because missing blocks are always fully closed, we can work out
            // the start index of the block we want by hopping from the closest block,
            // as we know the row count in closed blocks is equal to the page size
            if (beforeBlock) {
                blockNumber = beforeBlock.getBlockNumber() + 1;
                displayIndexStart = beforeBlock.getDisplayIndexEnd();
                nextRowTop = beforeBlock.getBlockHeight() + beforeBlock.getBlockTop();

                const isInRange = (): boolean => {
                    return displayRowIndex >= displayIndexStart && displayRowIndex < (displayIndexStart + blockSize);
                };

                while (!isInRange()) {
                    displayIndexStart += blockSize;

                    const cachedBlockHeight = this.blockHeights[blockNumber];
                    if (_.exists(cachedBlockHeight)) {
                        nextRowTop += cachedBlockHeight;
                    } else {
                        nextRowTop += this.params.rowHeight * blockSize;
                    }

                    blockNumber++;
                }
            } else {
                const localIndex = displayRowIndex - this.displayIndexStart;
                blockNumber = Math.floor(localIndex / blockSize);
                displayIndexStart = this.displayIndexStart + (blockNumber * blockSize);
                nextRowTop = this.cacheTop + (blockNumber * blockSize * this.params.rowHeight);
            }

            block = this.createBlock(blockNumber, displayIndexStart, {value: nextRowTop});

            this.logger.log(`block missing, rowIndex = ${displayRowIndex}, creating #${blockNumber}, displayIndexStart = ${displayIndexStart}`);
        }

        return block ? block.getRow(displayRowIndex) : null;
    }

    private getBlockSize(): number {
        return this.params.blockSize ? this.params.blockSize : 100;
    }

    public getTopLevelRowDisplayedIndex(topLevelIndex: number): number {
        const blockSize = this.getBlockSize();
        const blockId = Math.floor(topLevelIndex / blockSize);

        const block = this.getBlock(blockId);

        if (block) {
            // if we found a block, means row is in memory, so we can report the row index directly
            const rowNode = block.getRowUsingLocalIndex(topLevelIndex, true);
            return rowNode.rowIndex;
        } else {
            // otherwise we need to calculate it from the previous block
            let blockBefore: ServerSideBlock | undefined;
            this.forEachBlockInOrder((currentBlock:ServerSideBlock, currentId: number) => {
                if (blockId > currentId) {
                    // this will get assigned many times, but the last time will
                    // be the closest block to the required block that is BEFORE
                    blockBefore = currentBlock;
                }
            });

            if (blockBefore) {
                // note: the local index is the same as the top level index, two terms for same thing
                //
                // get index of the last row before this row
                // eg if blocksize = 100, then:
                //   last row of first block is 99 (100 * 1) -1;
                //   last row of second block is 199 (100 * 2) -1;
                const lastRowTopLevelIndex = (blockSize * (blockBefore.getBlockNumber() + 1)) - 1;

                // get the last top level node in the block before the wanted block. this will be the last
                // loaded displayed top level node.
                const lastRowNode = blockBefore!.getRowUsingLocalIndex(lastRowTopLevelIndex, true);

                // we want the index of the last displayed node, not just the top level node, so if the last top level node
                // is open, we get the index of the last displayed child node.
                let lastDisplayedNodeIndexInBlockBefore: number;
                if (lastRowNode.expanded && lastRowNode.childrenCache) {
                    const serverSideCache = lastRowNode.childrenCache as ServerSideCache;
                    lastDisplayedNodeIndexInBlockBefore = serverSideCache.getDisplayIndexEnd() - 1;
                } else if (lastRowNode.expanded && lastRowNode.detailNode) {
                    lastDisplayedNodeIndexInBlockBefore = lastRowNode.detailNode.rowIndex;
                } else {
                    lastDisplayedNodeIndexInBlockBefore = lastRowNode.rowIndex;
                }

                // we are guaranteed no rows are open. so the difference between the topTopIndex will be the
                // same as the difference between the displayed index
                const indexDiff = topLevelIndex - lastRowTopLevelIndex;

                return lastDisplayedNodeIndexInBlockBefore + indexDiff;

            } else {
                return topLevelIndex;
            }
        }
    }

    private createBlock(blockNumber: number, displayIndex: number, nextRowTop: { value: number }): ServerSideBlock {

        const newBlock = new ServerSideBlock(blockNumber, this.parentRowNode, this.params, this);
        this.createBean(newBlock);

        const displayIndexSequence = new NumberSequence(displayIndex);

        newBlock.setDisplayIndexes(displayIndexSequence, this.getVirtualRowCount(), nextRowTop);

        this.postCreateBlock(newBlock);

        return newBlock;
    }

    public getDisplayIndexEnd(): number {
        return this.displayIndexEnd;
    }

    public isDisplayIndexInCache(displayIndex: number): boolean {
        if (this.getVirtualRowCount() === 0) {
            return false;
        }
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    }

    public applyTransaction(rowDataTransaction: RowDataTransaction): RowNodeTransaction | null {
        // if (this.isMaxRowFound() || this.getBlock()) {
        //     return null;
        // }

        const res: RowNodeTransaction = {
            add: [],
            remove: [],
            update: []
        };

        if (rowDataTransaction.add) {
            rowDataTransaction.add.forEach( item => {

            });
        }

        return res;
    }

    public getChildCache(keys: string[]): ServerSideCache | null {
        if (_.missingOrEmpty(keys)) {
            return this;
        }

        const nextKey = keys[0];

        let nextServerSideCache: any = null;

        this.forEachBlockInOrder(block => {
            // callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number
            block.forEachNodeShallow(rowNode => {
                if (rowNode.key === nextKey) {
                    nextServerSideCache = rowNode.childrenCache as ServerSideCache;
                }
            }, new NumberSequence(), this.getVirtualRowCount());
        });

        if (nextServerSideCache) {
            const keyListForNextLevel = keys.slice(1, keys.length);
            return nextServerSideCache ? nextServerSideCache.getChildCache(keyListForNextLevel) : null;
        } else {
            return null;
        }
    }

    public isPixelInRange(pixel: number): boolean {
        if (this.getVirtualRowCount() === 0) {
            return false;
        }
        return pixel >= this.cacheTop && pixel < (this.cacheTop + this.cacheHeight);
    }

    public refreshCacheAfterSort(changedColumnsInSort: string[], rowGroupColIds: string[]): void {
        const level = this.parentRowNode.level + 1;
        const grouping = level < this.params.rowGroupCols.length;

        let shouldPurgeCache: boolean;
        if (grouping) {
            const groupColVo = this.params.rowGroupCols[level];
            const rowGroupBlock = rowGroupColIds.indexOf(groupColVo.id) > -1;
            const sortingByGroup = changedColumnsInSort.indexOf(groupColVo.id) > -1;

            shouldPurgeCache = rowGroupBlock && sortingByGroup;
        } else {
            shouldPurgeCache = true;
        }

        if (shouldPurgeCache) {
            this.purgeCache();
        } else {
            this.forEachBlockInOrder(block => {
                if (block.isGroupLevel()) {
                    const callback = (rowNode: RowNode) => {
                        const nextCache = (rowNode.childrenCache as ServerSideCache);
                        if (nextCache) {
                            nextCache.refreshCacheAfterSort(changedColumnsInSort, rowGroupColIds);
                        }
                    };
                    block.forEachNodeShallow(callback, new NumberSequence(), this.getVirtualRowCount());
                }
            });
        }
    }
}
