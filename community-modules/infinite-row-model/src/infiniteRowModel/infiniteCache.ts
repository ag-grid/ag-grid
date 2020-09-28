import {
    Autowired,
    ColumnApi,
    Events,
    GridApi,
    IDatasource,
    LoggerFactory,
    Qualifier,
    RowDataUpdatedEvent,
    RowNode,
    BeanStub,
    Logger,
    RowNodeBlockLoader,
    AgEvent,
    NumberSequence,
    PostConstruct,
    PreDestroy,
    RowRenderer,
    _
} from "@ag-grid-community/core";
import { InfiniteBlock } from "./infiniteBlock";

export interface InfiniteCacheParams {
    datasource: IDatasource;
    maxConcurrentRequests: number;
    initialRowCount: number;
    blockSize?: number;
    overflowSize: number;
    sortModel: any;
    filterModel: any;
    maxBlocksInCache?: number;
    rowHeight: number;
    lastAccessedSequence: NumberSequence;
    rowNodeBlockLoader?: RowNodeBlockLoader;
    dynamicRowHeight: boolean;
}

export interface CacheUpdatedEvent extends AgEvent {

}

export class InfiniteCache extends BeanStub {

    public static EVENT_CACHE_UPDATED = 'cacheUpdated';

    // this property says how many empty blocks should be in a cache, eg if scrolls down fast and creates 10
    // blocks all for loading, the grid will only load the last 2 - it will assume the blocks the user quickly
    // scrolled over are not needed to be loaded.
    private static MAX_EMPTY_BLOCKS_TO_KEEP = 2;

    @Autowired('columnApi') private readonly columnApi: ColumnApi;
    @Autowired('gridApi') private readonly gridApi: GridApi;
    @Autowired('rowRenderer') protected rowRenderer: RowRenderer;

    private rowCount: number;
    private maxRowFound = false;

    protected params: InfiniteCacheParams;

    public blocks: { [blockNumber: string]: InfiniteBlock; } = {};
    private blockCount = 0;

    protected logger: Logger;

    constructor(params: InfiniteCacheParams) {
        super();
        this.rowCount = params.initialRowCount;
        this.params = params;
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('InfiniteCache');
    }

    // the rowRenderer will not pass dontCreatePage, meaning when rendering the grid,
    // it will want new pages in the cache as it asks for rows. only when we are inserting /
    // removing rows via the api is dontCreatePage set, where we move rows between the pages.
    public getRow(rowIndex: number, dontCreatePage = false): RowNode {
        const blockId = Math.floor(rowIndex / this.params.blockSize);
        let block = this.blocks[blockId];

        if (!block) {
            if (dontCreatePage) {
                return null;
            } else {
                block = this.createBlock(blockId);
            }
        }

        return block.getRow(rowIndex);
    }

    private createBlock(blockNumber: number): InfiniteBlock {
        const newBlock = this.createBean(new InfiniteBlock(blockNumber, this.params));

        newBlock.addEventListener(InfiniteBlock.EVENT_LOAD_COMPLETE, this.onPageLoaded.bind(this));

        this.setBlock(blockNumber, newBlock);
        this.purgeBlocksIfNeeded(newBlock);
        this.params.rowNodeBlockLoader.checkBlockToLoad();

        return newBlock;
    }

    // we have this on infinite row model only, not server side row model,
    // because for server side, it would leave the children in inconsistent
    // state - eg if a node had children, but after the refresh it had data
    // for a different row, then the children would be with the wrong row node.
    public refreshCache(): void {
        this.forEachBlockInOrder(block => block.setDirty());
        this.params.rowNodeBlockLoader.checkBlockToLoad();
    }

    @PreDestroy
    private destroyAllBlocks(): void {
        this.forEachBlockInOrder(block => this.destroyBlock(block));
    }

    public getRowCount(): number {
        return this.rowCount;
    }

    public isMaxRowFound(): boolean {
        return this.maxRowFound;
    }

    // listener on EVENT_LOAD_COMPLETE
    protected onPageLoaded(event: any): void {
        this.params.rowNodeBlockLoader.loadComplete();
        this.params.rowNodeBlockLoader.checkBlockToLoad();

        // if we are not active, then we ignore all events, otherwise we could end up getting the
        // grid to refresh even though we are no longer the active cache
        if (!this.isAlive()) {
            return;
        }

        this.logger.log(`onPageLoaded: page = ${event.page.getBlockNumber()}, lastRow = ${event.lastRow}`);

        if (event.success) {
            this.checkRowCount(event.page, event.lastRow);
            this.onCacheUpdated();
        }
    }

    private purgeBlocksIfNeeded(blockToExclude: InfiniteBlock): void {
        // put all candidate blocks into a list for sorting
        const blocksForPurging: InfiniteBlock[] = [];
        this.forEachBlockInOrder((block: InfiniteBlock) => {
            // we exclude checking for the page just created, as this has yet to be accessed and hence
            // the lastAccessed stamp will not be updated for the first time yet
            if (block === blockToExclude) {
                return;
            }

            blocksForPurging.push(block);
        });

        // note: need to verify that this sorts items in the right order
        blocksForPurging.sort((a: InfiniteBlock, b: InfiniteBlock) => b.getLastAccessed() - a.getLastAccessed());

        // we remove (maxBlocksInCache - 1) as we already excluded the 'just created' page.
        // in other words, after the splice operation below, we have taken out the blocks
        // we want to keep, which means we are left with blocks that we can potentially purge
        const maxBlocksProvided = this.params.maxBlocksInCache > 0;
        const blocksToKeep = maxBlocksProvided ? this.params.maxBlocksInCache - 1 : null;
        const emptyBlocksToKeep = InfiniteCache.MAX_EMPTY_BLOCKS_TO_KEEP - 1;

        blocksForPurging.forEach((block: InfiniteBlock, index: number) => {

            const purgeBecauseBlockEmpty = block.getState() === InfiniteBlock.STATE_DIRTY && index >= emptyBlocksToKeep;

            const purgeBecauseCacheFull = maxBlocksProvided ? index >= blocksToKeep : false;

            if (purgeBecauseBlockEmpty || purgeBecauseCacheFull) {

                // if the block currently has rows been displayed, then don't remove it either.
                // this can happen if user has maxBlocks=2, and blockSize=5 (thus 10 max rows in cache)
                // but the screen is showing 20 rows, so at least 4 blocks are needed.
                if (this.isBlockCurrentlyDisplayed(block)) { return; }

                // at this point, block is not needed, so burn baby burn
                this.removeBlockFromCache(block);
            }

        });
    }

    private isBlockCurrentlyDisplayed(block: InfiniteBlock): boolean {
        const firstViewportRow = this.rowRenderer.getFirstVirtualRenderedRow();
        const lastViewportRow = this.rowRenderer.getLastVirtualRenderedRow();

        const firstRowIndex = block.getStartRow();
        const lastRowIndex = block.getEndRow() - 1;

        const blockBeforeViewport = firstRowIndex > lastViewportRow;
        const blockAfterViewport = lastRowIndex < firstViewportRow;
        const blockInsideViewport = !blockBeforeViewport && !blockAfterViewport;

        return blockInsideViewport;
    }

    protected removeBlockFromCache(blockToRemove: InfiniteBlock): void {
        if (!blockToRemove) {
            return;
        }

        this.destroyBlock(blockToRemove);

        // we do not want to remove the 'loaded' event listener, as the
        // concurrent loads count needs to be updated when the load is complete
        // if the purged page is in loading state
    }

    private checkRowCount(block: InfiniteBlock, lastRow?: number): void {
        // if client provided a last row, we always use it, as it could change between server calls
        // if user deleted data and then called refresh on the grid.
        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.rowCount = lastRow;
            this.maxRowFound = true;
        } else if (!this.maxRowFound) {
            // otherwise, see if we need to add some virtual rows
            const lastRowIndex = (block.getBlockNumber() + 1) * this.params.blockSize;
            const lastRowIndexPlusOverflow = lastRowIndex + this.params.overflowSize;

            if (this.rowCount < lastRowIndexPlusOverflow) {
                this.rowCount = lastRowIndexPlusOverflow;
            }
        }
    }

    public setRowCount(rowCount: number, maxRowFound?: boolean): void {
        this.rowCount = rowCount;

        // if undefined is passed, we do not set this value, if one of {true,false}
        // is passed, we do set the value.
        if (_.exists(maxRowFound)) {
            this.maxRowFound = maxRowFound;
        }

        // if we are still searching, then the row count must not end at the end
        // of a particular page, otherwise the searching will not pop into the
        // next page
        if (!this.maxRowFound) {
            if (this.rowCount % this.params.blockSize === 0) {
                this.rowCount++;
            }
        }

        this.onCacheUpdated();
    }

    public forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void): void {
        const sequence = new NumberSequence();
        this.forEachBlockInOrder(block => block.forEachNode(callback, sequence, this.rowCount));
    }

    public forEachBlockInOrder(callback: (block: InfiniteBlock, id: number) => void): void {
        const ids = this.getBlockIdsSorted();
        this.forEachBlockId(ids, callback);
    }

    protected forEachBlockInReverseOrder(callback: (block: InfiniteBlock, id: number) => void): void {
        const ids = this.getBlockIdsSorted().reverse();
        this.forEachBlockId(ids, callback);
    }

    private forEachBlockId(ids: number[], callback: (block: InfiniteBlock, id: number) => void): void {
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

    protected setBlock(id: number, block: InfiniteBlock): void {
        this.blocks[id] = block;
        this.blockCount++;
        this.params.rowNodeBlockLoader.addBlock(block);
    }

    protected destroyBlock(block: InfiniteBlock): void {
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
                type: InfiniteCache.EVENT_CACHE_UPDATED
            };
            this.dispatchEvent(event);
        }
    }

    private destroyAllBlocksPastVirtualRowCount(): void {
        const blocksToDestroy: InfiniteBlock[] = [];
        this.forEachBlockInOrder((block: InfiniteBlock, id: number) => {
            const startRow = id * this.params.blockSize;
            if (startRow >= this.rowCount) {
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
        if (this.rowCount === 0) {
            this.rowCount = this.params.initialRowCount;
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

        this.forEachBlockInOrder((block: InfiniteBlock, id: number) => {
            if (foundGapInSelection) { return; }

            if (inActiveRange && (lastBlockId + 1 !== id)) {
                foundGapInSelection = true;
                return;
            }

            lastBlockId = id;

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
