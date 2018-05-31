import {
    _,
    Autowired,
    ColumnVO,
    Context,
    EventService,
    IServerSideCache,
    IServerSideDatasource,
    LoggerFactory,
    NumberSequence,
    PostConstruct,
    Qualifier,
    RowNode,
    RowNodeCache,
    RowNodeCacheParams,
    RowBounds,
    GridOptionsWrapper,
    RowDataUpdatedEvent,
    Events
} from "ag-grid";
import {ServerSideBlock} from "./serverSideBlock";

export interface ServerSideCacheParams extends RowNodeCacheParams {
    rowGroupCols: ColumnVO[];
    valueCols: ColumnVO[];
    pivotCols: ColumnVO[];
    pivotMode: boolean;
    datasource: IServerSideDatasource;
    lastAccessedSequence: NumberSequence;
}

export class ServerSideCache extends RowNodeCache<ServerSideBlock, ServerSideCacheParams> implements IServerSideCache {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    // this will always be zero for the top level cache only,
    // all the other ones change as the groups open and close
    private displayIndexStart = 0;
    private displayIndexEnd = 0; // not sure if setting this one to zero is necessary

    private readonly parentRowNode: RowNode;

    private cacheTop = 0;
    private cacheHeight: number;

    private blockHeights: {[blockId: number]: number} = {};

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
        let result: RowBounds;
        let blockFound = false;
        let lastBlock: ServerSideBlock;

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
        let result: number;
        let blockFound = false;
        let lastBlock: ServerSideBlock;

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

        //NOTE: purged

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

        this.forEachBlockInOrder( (currentBlock: ServerSideBlock, blockId: number)=> {

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
    public getRow(displayRowIndex: number, dontCreateBlock = false): RowNode {

        // this can happen if asking for a row that doesn't exist in the model,
        // eg if a cell range is selected, and the user filters so rows no longer
        // exist
        if (!this.isDisplayIndexInCache(displayRowIndex)) { return null; }

        // if we have the block, then this is the block
        let block: ServerSideBlock = null;
        // this is the last block that we have BEFORE the right block
        let beforeBlock: ServerSideBlock = null;

        this.forEachBlockInOrder( currentBlock => {
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

    private createBlock(blockNumber: number, displayIndex: number, nextRowTop: {value: number}): ServerSideBlock {

        let newBlock = new ServerSideBlock(blockNumber, this.parentRowNode, this.cacheParams, this);
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

    public getChildCache(keys: string[]): ServerSideCache {
        if (_.missingOrEmpty(keys)) { return this; }

        let nextKey = keys[0];

        let nextServerSideCache: ServerSideCache = null;

        this.forEachBlockInOrder(block => {
            // callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number
            block.forEachNodeShallow( rowNode => {
                if (rowNode.key === nextKey) {
                    nextServerSideCache = <ServerSideCache> rowNode.childrenCache;
                }
            }, new NumberSequence(), this.getVirtualRowCount());
        });

        if (nextServerSideCache) {
            let keyListForNextLevel = keys.slice(1, keys.length);
            return nextServerSideCache.getChildCache(keyListForNextLevel);
        } else {
            return null;
        }
    }

    public isPixelInRange(pixel: number): boolean {
        if (this.getVirtualRowCount()===0) { return false; }
        return pixel >= this.cacheTop  && pixel < (this.cacheTop + this.cacheHeight);
    }

    public removeFromCache(items: any[]): void {

        // create map of id's for quick lookup
        let itemsToDeleteById: {[id: string]: any} = {};
        let idForNodeFunc = this.gridOptionsWrapper.getRowNodeIdFunc();
        items.forEach( item => {
            let id = idForNodeFunc(item);
            itemsToDeleteById[id] = item;
        });

        let deletedCount = 0;

        this.forEachBlockInOrder( block => {
            let startRow = block.getStartRow();
            let endRow = block.getEndRow();

            let deletedCountFromThisBlock = 0;
            for (let rowIndex = startRow; rowIndex<endRow; rowIndex++) {

                let rowNode = block.getRowUsingLocalIndex(rowIndex, true);
                if (!rowNode) { continue; }

                let deleteThisRow = !!itemsToDeleteById[rowNode.id];
                if (deleteThisRow) {
                    deletedCountFromThisBlock++;
                    deletedCount++;
                    block.setDirty();
                    rowNode.clearRowTop();
                    continue;
                }

                // if rows were deleted, then we need to move this row node to
                // it's new location
                if (deletedCount>0) {
                    block.setDirty();
                    let newIndex = rowIndex - deletedCount;

                    let blockId = Math.floor(newIndex / this.cacheParams.blockSize);
                    let blockToInsert = this.getBlock(blockId);
                    if (blockToInsert) {
                        blockToInsert.setRowNode(newIndex, rowNode);
                    }
                }
            }

            if (deletedCountFromThisBlock>0) {
                for (let i = deletedCountFromThisBlock; i>0; i--) {
                    block.setBlankRowNode(endRow-i);
                }
            }
        });

        if (this.isMaxRowFound()) {
            this.hack_setVirtualRowCount(this.getVirtualRowCount() - deletedCount);
        }

        this.onCacheUpdated();

        let event: RowDataUpdatedEvent = {
            type: Events.EVENT_ROW_DATA_UPDATED,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };

        this.eventService.dispatchEvent(event);
    }

    public addToCache(items: any[], indexToInsert: number): void {
        let newNodes: RowNode[] = [];
        this.forEachBlockInReverseOrder( block => {
            let pageEndRow = block.getEndRow();

            // if the insertion is after this page, then this page is not impacted
            if (pageEndRow <= indexToInsert) {
                return;
            }

            this.moveItemsDown(block, indexToInsert, items.length);
            let newNodesThisPage = this.insertItems(block, indexToInsert, items);
            newNodesThisPage.forEach(rowNode => newNodes.push(rowNode));
        });

        if (this.isMaxRowFound()) {
            this.hack_setVirtualRowCount(this.getVirtualRowCount() + items.length);
        }

        this.onCacheUpdated();

        let event: RowDataUpdatedEvent = {
            type: Events.EVENT_ROW_DATA_UPDATED,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };

        this.eventService.dispatchEvent(event);
    }

    private moveItemsDown(block: ServerSideBlock, moveFromIndex: number, moveCount: number): void {
        let startRow = block.getStartRow();
        let endRow = block.getEndRow();
        let indexOfLastRowToMove = moveFromIndex + moveCount;

        // all rows need to be moved down below the insertion index
        for (let currentRowIndex = endRow - 1; currentRowIndex >= startRow; currentRowIndex--) {
            // don't move rows at or before the insertion index
            if (currentRowIndex < indexOfLastRowToMove) {
                continue;
            }

            let indexOfNodeWeWant = currentRowIndex - moveCount;
            let nodeForThisIndex = this.getRow(indexOfNodeWeWant, true);

            if (nodeForThisIndex) {
                block.setRowNode(currentRowIndex, nodeForThisIndex);
            } else {
                block.setBlankRowNode(currentRowIndex);
                block.setDirty();
            }
        }
    }

    private insertItems(block: ServerSideBlock, indexToInsert: number, items: any[]): RowNode[] {
        let pageStartRow = block.getStartRow();
        let pageEndRow = block.getEndRow();
        let newRowNodes: RowNode[] = [];

        // next stage is insert the rows into this page, if applicable
        for (let index = 0; index < items.length; index++) {
            let rowIndex = indexToInsert + index;

            let currentRowInThisPage = rowIndex >= pageStartRow && rowIndex < pageEndRow;

            if (currentRowInThisPage) {
                let dataItem = items[index];
                let newRowNode = block.setNewData(rowIndex, dataItem);
                newRowNodes.push(newRowNode);
            }
        }

        return newRowNodes;
    }

    public refreshCache(sortModel: {colId: string, sort: string}[], rowGroupColIds: string[]) {
        let shouldPurgeCache = false;
        let sortColIds = sortModel.map(sm => sm.colId);

        this.forEachBlockInOrder(block => {

            if (block.isGroupLevel()) {
                let groupField = block.getGroupField();
                let rowGroupBlock = rowGroupColIds.indexOf(groupField) > -1;
                let sortingByGroup = sortColIds.indexOf(groupField) > -1;

                if (rowGroupBlock && sortingByGroup) {
                    // need to refresh block using updated new sort model
                    block.updateSortModel(sortModel);
                    shouldPurgeCache = true;
                }

                let callback = (rowNode: RowNode) => {
                    let nextCache = (<ServerSideCache> rowNode.childrenCache);
                    if (nextCache) nextCache.refreshCache(sortModel, rowGroupColIds);
                };

                block.forEachNodeShallow(callback, new NumberSequence(), this.getVirtualRowCount());

            } else {
                // blocks containing leaf nodes need to be refreshed with new sort model
                block.updateSortModel(sortModel);
                shouldPurgeCache = true;
            }
        });

        let groupSortRemoved = this.groupSortRemoved(sortModel, rowGroupColIds);
        if (groupSortRemoved) {
            this.cacheParams.sortModel = sortModel;
        }

        if (shouldPurgeCache || groupSortRemoved) {
            this.purgeCache();
        }
    }

    private groupSortRemoved(sortModel: { colId: string; sort: string }[], rowGroupColIds: string[]): boolean {
        let cacheSortModelChanged = this.cacheParams.sortModel !== sortModel;
        let existingSortCols = this.cacheParams.sortModel.map((sm: { colId: string, sort: string }) => sm.colId);
        let existingGroupColumn = rowGroupColIds.some(v=> existingSortCols.indexOf(v) >= 0);

        return cacheSortModelChanged && existingGroupColumn;
    }
}