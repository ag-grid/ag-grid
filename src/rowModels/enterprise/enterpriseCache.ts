import {
    _,
    Autowired,
    ColumnVO,
    Context,
    EventService,
    IEnterpriseCache,
    IEnterpriseDatasource,
    LoggerFactory,
    NumberSequence,
    PostConstruct,
    Qualifier,
    RowNode,
    RowNodeCache,
    RowNodeCacheParams,
    RowBounds
} from "ag-grid";
import {EnterpriseBlock} from "./enterpriseBlock";

export interface EnterpriseCacheParams extends RowNodeCacheParams {
    rowGroupCols: ColumnVO[];
    valueCols: ColumnVO[];
    pivotCols: ColumnVO[];
    pivotMode: boolean;
    datasource: IEnterpriseDatasource;
    lastAccessedSequence: NumberSequence;
}

export class EnterpriseCache extends RowNodeCache<EnterpriseBlock, EnterpriseCacheParams> implements IEnterpriseCache {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    // this will always be zero for the top level cache only,
    // all the other ones change as the groups open and close
    private displayIndexStart = 0;
    private displayIndexEnd = 0; // not sure if setting this one to zero is necessary

    private parentRowNode: RowNode;

    private cacheTop = 0;
    private cacheHeight: number;

    private blockHeights: {[blockId: number]: number} = {};

    constructor(cacheParams: EnterpriseCacheParams, parentRowNode: RowNode) {
        super(cacheParams);
        this.parentRowNode = parentRowNode;
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('EnterpriseCache');
    }

    @PostConstruct
    protected init(): void {
        super.init();
    }

    public getRowBounds(index: number): RowBounds {
        this.logger.log(`getRowBounds(${index})`);

        // we return null if row not found
        let result: RowBounds;
        let blockFound = false;
        let lastBlock: EnterpriseBlock;

        this.forEachBlockInOrder( block => {
            if (blockFound) return;

            if (block.isDisplayIndexInBlock(index)) {
                result = block.getRowBounds(index, this.getVirtualRowCount());
                blockFound = true;
            } else if (block.isBlockBefore(index)) {
                lastBlock = block;
            }
        });

        if (!blockFound) {

            let nextRowTop: number;
            let nextRowIndex : number;

            if (lastBlock) {
                nextRowTop = lastBlock.getBlockTop() + lastBlock.getBlockHeight();
                nextRowIndex = lastBlock.getDisplayIndexEnd();
            } else {
                nextRowTop = this.cacheTop;
                nextRowIndex = this.displayIndexStart;
            }

            let rowsBetween = index - nextRowIndex;

            result = {
                rowHeight: this.cacheParams.rowHeight,
                rowTop: nextRowTop + rowsBetween * this.cacheParams.rowHeight
            }
        }

        //TODO: what about purged blocks

        this.logger.log(`getRowBounds(${index}), result = ${result}`);

        return result;
    }

    protected destroyBlock(block: EnterpriseBlock): void {
        super.destroyBlock(block);
    }

    public getRowIndexAtPixel(pixel: number): number {
        this.logger.log(`getRowIndexAtPixel(${pixel})`);

        // we return null if row not found
        let result: number;
        let blockFound = false;
        let lastBlock: EnterpriseBlock;

        this.forEachBlockInOrder( block => {
            if (blockFound) return;

            if (block.isPixelInRange(pixel)) {
                result = block.getRowIndexAtPixel(pixel, this.getVirtualRowCount());
                blockFound = true;
            } else if (block.getBlockTop() > pixel) {
                lastBlock = block;
            }
        });

        if (!blockFound) {

            let nextRowTop: number;
            let nextRowIndex : number;

            if (lastBlock) {
                nextRowTop = lastBlock.getBlockTop() + lastBlock.getBlockHeight();
                nextRowIndex = lastBlock.getDisplayIndexEnd();
            } else {
                nextRowTop = this.cacheTop;
                nextRowIndex = this.displayIndexStart;
            }

            let pixelsBetween = pixel - nextRowTop;
            let rowsBetween = (pixelsBetween / this.cacheParams.rowHeight) | 0;

            result = nextRowIndex + rowsBetween;
        }

        let lastAllowedIndex = this.getDisplayIndexEnd() - 1;
        if (result > lastAllowedIndex) {
            result = lastAllowedIndex;
        }

        //TODO: purged

        this.logger.log(`getRowIndexAtPixel(${pixel}) result = ${result}`);

        return result;
    }

    public clearRowTops(): void {
        this.forEachBlockInOrder( block => block.clearRowTops(this.getVirtualRowCount()));
    }

    public setDisplayIndexes(displayIndexSeq: NumberSequence,
                             nextRowTop: {value: number}): void {
        this.displayIndexStart = displayIndexSeq.peek();

        this.cacheTop = nextRowTop.value;

        let lastBlockId = -1;

        this.forEachBlockInOrder( (currentBlock: EnterpriseBlock, blockId: number)=> {

            // if we skipped blocks, then we need to skip the row indexes. we assume that all missing
            // blocks are made up of closed RowNodes only (if they were groups), as we never expire from
            // the cache if any row nodes are open.
            let blocksSkippedCount = blockId - lastBlockId - 1;
            let rowsSkippedCount = blocksSkippedCount * this.cacheParams.blockSize;
            if (rowsSkippedCount>0) {
                displayIndexSeq.skip(rowsSkippedCount);
            }

            for (let i = 1; i <= blocksSkippedCount; i++) {
                let blockToAddId = blockId - i;
                if (_.exists(this.blockHeights[blockToAddId])) {
                    nextRowTop.value += this.blockHeights[blockToAddId];
                } else {
                    nextRowTop.value += this.cacheParams.blockSize * this.cacheParams.rowHeight;
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
        let lastVisitedRow = ((lastBlockId + 1) * this.cacheParams.blockSize) -1;
        let rowCount = this.getVirtualRowCount();
        let rowsNotAccountedFor = rowCount - lastVisitedRow - 1;
        if (rowsNotAccountedFor > 0) {
            displayIndexSeq.skip(rowsNotAccountedFor);
            nextRowTop.value += rowsNotAccountedFor * this.cacheParams.rowHeight;
        }

        this.displayIndexEnd = displayIndexSeq.peek();
        this.cacheHeight = nextRowTop.value - this.cacheTop;
    }

    // gets called in a) init() above and b) by the grid
    public getRow(displayRowIndex: number): RowNode {

        // this can happen if asking for a row that doesn't exist in the model,
        // eg if a cell range is selected, and the user filters so rows no longer
        // exist
        if (!this.isDisplayIndexInCache(displayRowIndex)) { return null; }

        // if we have the block, then this is the block
        let block: EnterpriseBlock = null;
        // this is the last block that we have BEFORE the right block
        let beforeBlock: EnterpriseBlock = null;

        this.forEachBlockInOrder( currentBlock => {
            if (currentBlock.isDisplayIndexInBlock(displayRowIndex)) {
                block = currentBlock;
            } else if (currentBlock.isBlockBefore(displayRowIndex)) {
                // this will get assigned many times, but the last time will
                // be the closest block to the required block that is BEFORE
                beforeBlock = currentBlock;
            }
        });

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

                let isInRange = (): boolean => {
                    return displayRowIndex >= displayIndexStart && displayRowIndex < (displayIndexStart + this.cacheParams.blockSize);
                };

                while (!isInRange()) {
                    displayIndexStart += this.cacheParams.blockSize;

                    let cachedBlockHeight = this.blockHeights[blockNumber];
                    if (_.exists(cachedBlockHeight)) {
                        nextRowTop += cachedBlockHeight;
                    } else {
                        nextRowTop += this.cacheParams.rowHeight * this.cacheParams.blockSize;
                    }

                    blockNumber++;
                }
            } else {
                let localIndex = displayRowIndex - this.displayIndexStart;
                blockNumber = Math.floor(localIndex / this.cacheParams.blockSize);
                displayIndexStart = this.displayIndexStart + (blockNumber * this.cacheParams.blockSize);
                nextRowTop = this.cacheTop + (blockNumber * this.cacheParams.blockSize * this.cacheParams.rowHeight);
            }

            block = this.createBlock(blockNumber, displayIndexStart, {value: nextRowTop});

            this.logger.log(`block missing, rowIndex = ${displayRowIndex}, creating #${blockNumber}, displayIndexStart = ${displayIndexStart}`);
        }

        let rowNode = block.getRow(displayRowIndex);

        return rowNode;
    }

    private createBlock(blockNumber: number, displayIndex: number, nextRowTop: {value: number}): EnterpriseBlock {

        let newBlock = new EnterpriseBlock(blockNumber, this.parentRowNode, this.cacheParams, this);
        this.context.wireBean(newBlock);

        let displayIndexSequence = new NumberSequence(displayIndex);

        newBlock.setDisplayIndexes(displayIndexSequence, this.getVirtualRowCount(), nextRowTop);

        this.postCreateBlock(newBlock);

        return newBlock;
    }

    public getDisplayIndexEnd(): number {
        return this.displayIndexEnd;
    }

    public isDisplayIndexInCache(displayIndex: number): boolean {
        if (this.getVirtualRowCount()===0) { return false; }
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    }

    public getChildCache(keys: string[]): EnterpriseCache {
        if (_.missingOrEmpty(keys)) { return this; }

        let nextKey = keys[0];

        let nextEnterpriseCache: EnterpriseCache = null;

        this.forEachBlockInOrder(block => {
            // callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number
            block.forEachNodeShallow( rowNode => {
                if (rowNode.key === nextKey) {
                    nextEnterpriseCache = <EnterpriseCache> rowNode.childrenCache;
                }
            }, new NumberSequence(), this.getVirtualRowCount());
        });

        if (nextEnterpriseCache) {
            let keyListForNextLevel = keys.slice(1, keys.length);
            return nextEnterpriseCache.getChildCache(keyListForNextLevel);
        } else {
            return null;
        }
    }

    public isPixelInRange(pixel: number): boolean {
        if (this.getVirtualRowCount()===0) { return false; }
        return pixel >= this.cacheTop  && pixel < (this.cacheTop + this.cacheHeight);
    }


}

