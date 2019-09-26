import {
    _,
    Autowired,
    ColumnVO,
    Context,
    EventService,
    GridOptionsWrapper,
    IServerSideCache,
    IServerSideDatasource,
    LoggerFactory,
    NumberSequence,
    PostConstruct,
    Qualifier,
    RowBounds,
    RowNode,
    RowNodeCache,
    RowNodeCacheParams
} from "ag-grid-community";
import { ServerSideBlock } from "./serverSideBlock";

export interface ServerSideCacheParams extends RowNodeCacheParams {
    rowGroupCols: ColumnVO[];
    valueCols: ColumnVO[];
    pivotCols: ColumnVO[];
    pivotMode: boolean;
    datasource?: IServerSideDatasource;
    lastAccessedSequence: NumberSequence;
}

export class ServerSideCache extends RowNodeCache<ServerSideBlock, ServerSideCacheParams> implements IServerSideCache {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    // this will always be zero for the top level cache only,
    // all the other ones change as the groups open and close
    private displayIndexStart = 0;
    private displayIndexEnd = 0; // not sure if setting this one to zero is necessary

    private readonly parentRowNode: RowNode;

    private cacheTop = 0;
    private cacheHeight: number;

    private blockHeights: { [blockId: number]: number } = {};

    constructor(cacheParams: ServerSideCacheParams, parentRowNode: RowNode) {
        super(cacheParams);
        this.parentRowNode = parentRowNode;
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('ServerSideCache');
    }

    @PostConstruct
    protected init(): void {
        super.init();
    }

    public getRowBounds(index: number): RowBounds {
        this.logger.log(`getRowBounds(${index})`);

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
                rowHeight: this.cacheParams.rowHeight,
                rowTop: nextRowTop + rowsBetween * this.cacheParams.rowHeight
            };
        }

        // NOTE: what about purged blocks

        this.logger.log(`getRowBounds(${index}), result = ${result}`);

        return result;
    }

    protected destroyBlock(block: ServerSideBlock): void {
        super.destroyBlock(block);
    }

    public getRowIndexAtPixel(pixel: number): number {
        this.logger.log(`getRowIndexAtPixel(${pixel})`);

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
            const rowsBetween = (pixelsBetween / this.cacheParams.rowHeight) | 0;

            result = nextRowIndex + rowsBetween;
        }

        const lastAllowedIndex = this.getDisplayIndexEnd() - 1;
        if (result > lastAllowedIndex) {
            result = lastAllowedIndex;
        }

        //NOTE: purged

        this.logger.log(`getRowIndexAtPixel(${pixel}) result = ${result}`);

        return result;
    }

    public clearRowTops(): void {
        this.forEachBlockInOrder(block => block.clearRowTops(this.getVirtualRowCount()));
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
                    nextRowTop.value += blockSize * this.cacheParams.rowHeight;
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
            nextRowTop.value += rowsNotAccountedFor * this.cacheParams.rowHeight;
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
                        nextRowTop += this.cacheParams.rowHeight * blockSize;
                    }

                    blockNumber++;
                }
            } else {
                const localIndex = displayRowIndex - this.displayIndexStart;
                blockNumber = Math.floor(localIndex / blockSize);
                displayIndexStart = this.displayIndexStart + (blockNumber * blockSize);
                nextRowTop = this.cacheTop + (blockNumber * blockSize * this.cacheParams.rowHeight);
            }

            block = this.createBlock(blockNumber, displayIndexStart, {value: nextRowTop});

            this.logger.log(`block missing, rowIndex = ${displayRowIndex}, creating #${blockNumber}, displayIndexStart = ${displayIndexStart}`);
        }

        return block ? block.getRow(displayRowIndex) : null;
    }

    private getBlockSize(): number {
        return this.cacheParams.blockSize ? this.cacheParams.blockSize : ServerSideBlock.DefaultBlockSize;
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

                // this is the last loaded rownode in the cache that is before the row we are interested in.
                // we are guaranteed no rows are open. so the difference between the topTopIndex will be the
                // same as the difference between the displayed index
                const indexDiff = topLevelIndex - lastRowTopLevelIndex;

                const lastRowNode = blockBefore!.getRowUsingLocalIndex(lastRowTopLevelIndex, true);
                return lastRowNode.rowIndex + indexDiff;

            } else {
                return topLevelIndex;
            }
        }
    }

    private createBlock(blockNumber: number, displayIndex: number, nextRowTop: { value: number }): ServerSideBlock {

        const newBlock = new ServerSideBlock(blockNumber, this.parentRowNode, this.cacheParams, this);
        this.getContext().wireBean(newBlock);

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
        const grouping = level < this.cacheParams.rowGroupCols.length;

        let shouldPurgeCache: boolean;
        if (grouping) {
            const groupColVo = this.cacheParams.rowGroupCols[level];
            const groupField = groupColVo.field;

            const rowGroupBlock = rowGroupColIds.indexOf(groupField) > -1;
            const sortingByGroup = changedColumnsInSort.indexOf(groupField) > -1;

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
