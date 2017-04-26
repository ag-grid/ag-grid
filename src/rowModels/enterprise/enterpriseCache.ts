import {
    InfiniteCacheParams,
    _,
    Logger,
    IEnterpriseGetRowsRequest,
    RowNode,
    Context,
    PostConstruct,
    Autowired,
    Events,
    EventService,
    IEnterpriseCache,
    IEnterpriseDatasource,
    IEnterpriseGetRowsParams,
    NumberSequence,
    RowNodeBlock,
    RowNodeCache,
    RowNodeCacheParams,
    ColumnVO,
    Qualifier,
    LoggerFactory
} from "ag-grid";
import {EnterpriseRowModel} from "./enterpriseRowModel";

export interface EnterpriseCacheParams extends RowNodeCacheParams {
    rowGroupCols: ColumnVO[];
    valueCols: ColumnVO[];
    datasource: IEnterpriseDatasource;
    lastAccessedSequence: NumberSequence;
}

// indexes change when:
// + group opened / closed
// + rows are loaded, as this will prob change the row count

export class EnterpriseCache extends RowNodeCache implements IEnterpriseCache {

    public static EVENT_CACHE_UPDATED = 'cacheUpdated';

    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    private logger: Logger;

    private params: EnterpriseCacheParams;

    private blocks: {[blockNumber: string]: EnterpriseBlock} = {};
    private blocksCount = 0;

    // this will always be zero for the top level cache only,
    // all the other ones chance as the groups open and close
    private firstDisplayIndex: number = 0;
    private lastDisplayIndex: number;

    private parentRowNode: RowNode;

    constructor(params: EnterpriseCacheParams, parentRowNode: RowNode) {
        super(params);
        this.params = params;
        this.parentRowNode = parentRowNode;
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('EnterpriseCache');
    }

    protected dispatchModelUpdated(): void {
        if (this.isActive()) {
            this.dispatchEvent(EnterpriseCache.EVENT_CACHE_UPDATED);
        }
    }

    @PostConstruct
    private init(): void {
        // start load of data, as the virtualRowCount will remain at 0 otherwise,
        // so we need this to kick things off, otherwise grid would never call getRow()
        this.getRow(0);
    }

    public setDisplayIndexes(numberSequence: NumberSequence): void {
        this.firstDisplayIndex = numberSequence.peek();

        let lastBlockId = -1;

        this.forEachBlockInOrder( (blockId: number, currentBlock: EnterpriseBlock)=> {

            // if we skipped blocks, then we need to skip the row indexes. we assume that all missing
            // blocks are made up of closed RowNodes only (if they were groups), as we never expire from
            // the cache if any row nodes are open.
            let blocksSkippedCount = blockId - lastBlockId - 1;
            let rowsSkippedCount = blocksSkippedCount * this.params.pageSize;
            if (rowsSkippedCount>0) {
                numberSequence.skip(rowsSkippedCount);
            }

            lastBlockId = blockId;

            currentBlock.setDisplayIndexes(numberSequence);
        });

        // if any blocks missing at the end, need to increase the row index for them also
        // eg if block size = 10, we have total rows of 25 (indexes 0 .. 24), but first 2 blocks loaded (because
        // last row was ejected from cache), then:
        // lastVisitedRow = 19, virtualRowCount = 25, rows not accounted for = 5 (24 - 19)
        let lastVisitedRow = ((lastBlockId + 1) * this.params.pageSize) -1;
        let rowCount = this.getVirtualRowCount();
        let rowsNotAccountedFor = rowCount - lastVisitedRow - 1;
        if (rowsNotAccountedFor > 0) {
            numberSequence.skip(rowsNotAccountedFor);
        }

        this.lastDisplayIndex = numberSequence.peek() - 1;
    }

    private forEachBlockInOrder( callback: (blockId: number, block: EnterpriseBlock)=>void ): void {

        // list of block id's, they are NUMBERS, not strings, and sorted numerically
        let numberComparator = (a: number, b: number) => a - b; // default comparator for array is string comparison
        let blockIdsSorted = Object.keys(this.blocks).map( idStr => parseInt(idStr) ).sort(numberComparator);

        blockIdsSorted.forEach( blockId => {
            let currentBlock = this.blocks[blockId];
            callback(blockId, currentBlock);
        });
    }

    public getRow(rowIndex: number): RowNode {

        // if we have the block, then this is the block
        let block: EnterpriseBlock = null;
        // this is the last block that we have BEFORE the right block
        let beforeBlock: EnterpriseBlock = null;

        this.forEachBlockInOrder( (blockId: number, currentBlock: EnterpriseBlock)=> {
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
            // the start index of the block we want by hopping from the closes block,
            // as we know the row count in closed blocks is equal to the page size

            if (beforeBlock) {
                blockNumber = beforeBlock.getPageNumber();
                displayIndexStart = beforeBlock.getDisplayStartIndex();
                while (displayIndexStart < rowIndex) {
                    displayIndexStart += this.params.pageSize;
                    blockNumber++;
                }
            } else {
                let localIndex = rowIndex - this.firstDisplayIndex;
                blockNumber = localIndex / this.params.pageSize;
                displayIndexStart = this.firstDisplayIndex + (blockNumber * this.params.pageSize);
            }
            block = this.createBlock(blockNumber, displayIndexStart, 0);

            console.log(`block missing, rowIndex = ${rowIndex}, creating #${blockNumber}, displayIndexStart = ${displayIndexStart}`);
        }

        let rowNode = block.getRow(rowIndex);

        return rowNode;
    }

    private createBlock(blockNumber: number, displayIndex: number, level: number): EnterpriseBlock {

        let newBlock = new EnterpriseBlock(blockNumber, this.parentRowNode, this.params, level);
        this.context.wireBean(newBlock);

        let displayIndexSequence = new NumberSequence(displayIndex);
        newBlock.setDisplayIndexes(displayIndexSequence);

        newBlock.addEventListener(EnterpriseBlock.EVENT_LOAD_COMPLETE, this.onPageLoaded.bind(this));

        this.blocks[blockNumber] = newBlock;
        this.blocksCount++;
        //
        // let needToPurge = _.exists(this.cacheParams.maxBlocksInCache)
        //     && this.blocksCount > this.cacheParams.maxBlocksInCache;
        // if (needToPurge) {
        //     var lruPage = this.findLeastRecentlyUsedPage(newBlock);
        //     this.removeBlockFromCache(lruPage);
        // }
        //
        this.checkBlockToLoad();

        return newBlock;
    }

    private checkBlockToLoad() {

        var pageToLoad: EnterpriseBlock = null;
        _.iterateObject(this.blocks, (key: string, cachePage: EnterpriseBlock)=> {
            if (cachePage.getState() === EnterpriseBlock.STATE_DIRTY) {
                pageToLoad = cachePage;
            }
        });

        if (pageToLoad) {
            pageToLoad.load();
        }
    }

    private onPageLoaded(event: any): void {
        // if we are not active, then we ignore all events, otherwise we could end up getting the
        // grid to refresh even though we are no longer the active cache
        if (!this.isActive()) {
            return;
        }

        this.logger.log(`onPageLoaded: page = ${event.page.getPageNumber()}, lastRow = ${event.lastRow}`);
        // this.activePageLoadsCount--;
        // this.checkBlockToLoad();

        if (event.success) {
            this.checkVirtualRowCount(event.page, event.lastRow);
        }
    }

    public getLastDisplayedIndex(): number {
        return this.lastDisplayIndex;
    }

    public isIndexInCache(index: number): boolean {
        return index >= this.firstDisplayIndex && index <= this.lastDisplayIndex;
    }

}

export class EnterpriseBlock extends RowNodeBlock {

    @Autowired('context') private context: Context;

    private logger: Logger;

    private displayStartIndex: number;
    private displayEndIndex: number;
    private params: EnterpriseCacheParams;

    private parentRowNode: RowNode;

    private level: number;
    private groupLevel: boolean;
    private groupField: string;

    constructor(pageNumber: number, parentRowNode: RowNode, params: EnterpriseCacheParams, level: number) {
        super(pageNumber, params);
        this.params = params;
        this.parentRowNode = parentRowNode;
        this.level = level;
        this.groupLevel = level < params.rowGroupCols.length;
        if (this.groupLevel) {
            this.groupField = params.rowGroupCols[level].field;
        }
    }

    public getRow(rowIndex: number): RowNode {
        // fixme: need to have a binary search here, so we are not looping through the list each time
        let start = this.getStartRow();
        let end = this.getEndRow();

        for (let i = start; i<end; i++) {
            let rowNode = super.getRow(i);
            let childrenCache = <EnterpriseCache> rowNode.childrenCache;
            if (rowNode.rowIndex === rowIndex) {
                return rowNode;
            } else if (childrenCache && childrenCache.isIndexInCache(rowIndex)) {
                return childrenCache.getRow(rowIndex);
            }
        }

        // this should never happen - means the grid has asked for a row,
        // and we were not able to locate it. returning null will end up in a blank
        // row (better while we develop, rather than grid crapping out)
        return null;
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('EnterpriseBlock');
    }

    @PostConstruct
    protected init(): void {
        super.init({
            context: this.context
        });
    }

    protected setDataAndId(rowNode: RowNode, data: any, index: number): void {
        if (_.exists(data)) {
            // this means if the user is not providing id's we just use the
            // index for the row. this will allow selection to work (that is based
            // on index) as long user is not inserting or deleting rows,
            // or wanting to keep selection between server side sorting or filtering
            rowNode.setDataAndId(data, index.toString());
            rowNode.key = data[this.groupField];
        } else {
            rowNode.setDataAndId(undefined, undefined);
            rowNode.key = null;
        }
    }

    protected loadFromDatasource(): void {
        let params = this.createLoadParams();
        setTimeout(()=> {
            this.params.datasource.getRows(params);
        }, 0);
    }

    protected createBlankRowNode(rowIndex: number): RowNode {
        let rowNode = super.createBlankRowNode(rowIndex);

        rowNode.group = this.groupLevel;
        rowNode.level = this.level;
        rowNode.parent = this.parentRowNode;

        if (rowNode.group) {
            rowNode.expanded = false;
            rowNode.field = this.groupField;
        }

        return rowNode;
    }

    private createGroupKeys(groupNode: RowNode): string[] {
        let keys: string[] = [];

        let pointer = groupNode;
        while (pointer.level >= 0) {
            keys.push(pointer.key);
            pointer = pointer.parent;
        }

        keys.reverse();

        return keys;
    }

    public setDisplayIndexes(displayIndexSeq: NumberSequence): void {
        this.displayStartIndex = displayIndexSeq.peek();

        let start = this.getStartRow();
        let end = this.getEndRow();

        for (let i = start; i<=end; i++) {
            let rowNode = super.getRow(i);
            if (rowNode) {
                let rowIndex = displayIndexSeq.next();
                rowNode.setRowIndex(rowIndex);
                rowNode.rowTop = this.params.rowHeight * rowIndex;

                if (rowNode.group && rowNode.expanded && _.exists(rowNode.childrenCache)) {
                    let enterpriseCache = <EnterpriseCache> rowNode.childrenCache;
                    enterpriseCache.setDisplayIndexes(displayIndexSeq);
                }
            }
        }

        this.displayEndIndex = displayIndexSeq.peek() - 1;
    }

    private createLoadParams(): IEnterpriseGetRowsParams {
        let groupKeys = this.createGroupKeys(this.parentRowNode);

        let request: IEnterpriseGetRowsRequest = {
            startRow: this.getStartRow(),
            endRow: this.getEndRow(),
            rowGroupCols: this.params.rowGroupCols,
            valueCols: this.params.valueCols,
            groupKeys: groupKeys,
            filterModel: this.params.filterModel,
            sortModel: this.params.sortModel
        };

        let params = <IEnterpriseGetRowsParams> {
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this),
            request: request
        };

        return params;
    }

    public isIndexInBlock(index: number): boolean {
        return index >= this.displayStartIndex && index <= this.displayEndIndex;
    }

    public isBlockBefore(index: number): boolean {
        return index > this.displayEndIndex;
    }

    public getDisplayStartIndex(): number {
        return this.displayStartIndex;
    }

    public getDisplayEndIndex(): number {
        return this.displayEndIndex;
    }
}
