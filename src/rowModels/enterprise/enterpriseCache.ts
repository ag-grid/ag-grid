import {
    InfiniteCacheParams,
    _,
    Logger,
    RowNode,
    Context,
    Autowired,
    Events,
    EventService,
    IEnterpriseCache,
    IEnterpriseDatasource,
    NumberSequence,
    RowNodeBlock,
    RowNodeCache,
    RowNodeCacheParams,
    ColumnVO,
    PostConstruct,
    Qualifier,
    LoggerFactory
} from "ag-grid";
import {EnterpriseBlock} from "./enterpriseBlock";

export interface EnterpriseCacheParams extends RowNodeCacheParams {
    rowGroupCols: ColumnVO[];
    valueCols: ColumnVO[];
    datasource: IEnterpriseDatasource;
    lastAccessedSequence: NumberSequence;
}

export class EnterpriseCache extends RowNodeCache<EnterpriseBlock, EnterpriseCacheParams> implements IEnterpriseCache {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    // this will always be zero for the top level cache only,
    // all the other ones change as the groups open and close
    private firstDisplayIndex: number = 0;
    private lastDisplayIndex: number;

    private parentRowNode: RowNode;

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

    public setDisplayIndexes(numberSequence: NumberSequence): void {
        this.firstDisplayIndex = numberSequence.peek();

        let lastBlockId = -1;

        this.forEachBlockInOrder( (currentBlock: EnterpriseBlock, blockId: number)=> {

            // if we skipped blocks, then we need to skip the row indexes. we assume that all missing
            // blocks are made up of closed RowNodes only (if they were groups), as we never expire from
            // the cache if any row nodes are open.
            let blocksSkippedCount = blockId - lastBlockId - 1;
            let rowsSkippedCount = blocksSkippedCount * this.cacheParams.blockSize;
            if (rowsSkippedCount>0) {
                numberSequence.skip(rowsSkippedCount);
            }

            lastBlockId = blockId;

            currentBlock.setDisplayIndexes(numberSequence, this.getVirtualRowCount());
        });

        // if any blocks missing at the end, need to increase the row index for them also
        // eg if block size = 10, we have total rows of 25 (indexes 0 .. 24), but first 2 blocks loaded (because
        // last row was ejected from cache), then:
        // lastVisitedRow = 19, virtualRowCount = 25, rows not accounted for = 5 (24 - 19)
        let lastVisitedRow = ((lastBlockId + 1) * this.cacheParams.blockSize) -1;
        let rowCount = this.getVirtualRowCount();
        let rowsNotAccountedFor = rowCount - lastVisitedRow - 1;
        if (rowsNotAccountedFor > 0) {
            numberSequence.skip(rowsNotAccountedFor);
        }

        this.lastDisplayIndex = numberSequence.peek() - 1;
    }

    // gets called in a) init() above and b) by the grid
    public getRow(rowIndex: number): RowNode {

        // this can happen if asking for a row that doesn't exist in the model,
        // eg if a cell range is selected, and the user filters so rows no longer
        // exist
        if (!this.isIndexInCache(rowIndex)) { return null; }

        // if we have the block, then this is the block
        let block: EnterpriseBlock = null;
        // this is the last block that we have BEFORE the right block
        let beforeBlock: EnterpriseBlock = null;

        this.forEachBlockInOrder( currentBlock => {
            if (currentBlock.isIndexInBlock(rowIndex)) {
                block = currentBlock;
            } else if (currentBlock.isBlockBefore(rowIndex)) {
                // this will get assigned many times, but the last time will
                // be the closest block to the required block that is BEFORE
                beforeBlock = currentBlock;
            }
        });

        // if block not found, we need to load it
        if (_.missing(block)) {

            let blockNumber: number;
            let displayIndexStart: number;

            // because missing blocks are always fully closed, we can work out
            // the start index of the block we want by hopping from the closest block,
            // as we know the row count in closed blocks is equal to the page size
            if (beforeBlock) {
                blockNumber = beforeBlock.getPageNumber() + 1;
                displayIndexStart = beforeBlock.getDisplayEndIndex();

                let isInRange = (): boolean => {
                    return rowIndex >= displayIndexStart && rowIndex < (displayIndexStart + this.cacheParams.blockSize);
                };

                while (!isInRange()) {
                    displayIndexStart += this.cacheParams.blockSize;
                    blockNumber++;
                }
            } else {
                let localIndex = rowIndex - this.firstDisplayIndex;
                blockNumber = Math.floor(localIndex / this.cacheParams.blockSize);
                displayIndexStart = this.firstDisplayIndex + (blockNumber * this.cacheParams.blockSize);
            }
            block = this.createBlock(blockNumber, displayIndexStart);

            this.logger.log(`block missing, rowIndex = ${rowIndex}, creating #${blockNumber}, displayIndexStart = ${displayIndexStart}`);
        }

        let rowNode = block.getRow(rowIndex);

        return rowNode;
    }

    private createBlock(blockNumber: number, displayIndex: number): EnterpriseBlock {

        let newBlock = new EnterpriseBlock(blockNumber, this.parentRowNode, this.cacheParams, this);
        this.context.wireBean(newBlock);

        let displayIndexSequence = new NumberSequence(displayIndex);
        newBlock.setDisplayIndexes(displayIndexSequence, this.getVirtualRowCount());

        this.postCreateBlock(newBlock);

        return newBlock;
    }

    public getLastDisplayedIndex(): number {
        return this.lastDisplayIndex;
    }

    public isIndexInCache(index: number): boolean {
        return index >= this.firstDisplayIndex && index <= this.lastDisplayIndex;
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

}

