import {NumberSequence, Utils as _} from "../../utils";
import {RowNode} from "../../entities/rowNode";
import {Autowired, Context, PostConstruct, Qualifier} from "../../context/context";
import {EventService} from "../../eventService";
import {Events} from "../../events";
import {Logger, LoggerFactory} from "../../logger";
import {IDatasource} from "../iDatasource";
import {InfiniteBlock} from "./infiniteBlock";
import {RowNodeCache, RowNodeCacheParams} from "../cache/rowNodeCache";

export interface InfiniteCacheParams extends RowNodeCacheParams {
    maxConcurrentRequests: number;
    datasource: IDatasource;
}

export class InfiniteCache extends RowNodeCache<InfiniteBlock> {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    private activePageLoadsCount = 0;

    private cacheParams: InfiniteCacheParams;

    private logger: Logger;

    constructor(params: InfiniteCacheParams) {
        super(params);
        this.cacheParams = params;
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('VirtualPageCache');
    }

    @PostConstruct
    private init(): void {
        // start load of data, as the virtualRowCount will remain at 0 otherwise,
        // so we need this to kick things off, otherwise grid would never call getRow()
        this.getRow(0);
    }

    private moveItemsDown(page: InfiniteBlock, moveFromIndex: number, moveCount: number): void {
        let startRow = page.getStartRow();
        let endRow = page.getEndRow();
        var indexOfLastRowToMove = moveFromIndex + moveCount;

        // all rows need to be moved down below the insertion index
        for (let currentRowIndex = endRow - 1; currentRowIndex >= startRow; currentRowIndex--) {
            // don't move rows at or before the insertion index
            if (currentRowIndex < indexOfLastRowToMove) {
                continue;
            }

            let indexOfNodeWeWant = currentRowIndex - moveCount;
            let nodeForThisIndex = this.getRow(indexOfNodeWeWant, true);

            if (nodeForThisIndex) {
                page.setRowNode(currentRowIndex, nodeForThisIndex);
            } else {
                page.setBlankRowNode(currentRowIndex);
                page.setDirty();
            }
        }
    }

    private insertItems(page: InfiniteBlock, indexToInsert: number, items: any[]): RowNode[] {
        let pageStartRow = page.getStartRow();
        let pageEndRow = page.getEndRow();
        let newRowNodes: RowNode[] = [];

        // next stage is insert the rows into this page, if applicable
        for (let index = 0; index < items.length; index++) {
            var rowIndex = indexToInsert + index;

            let currentRowInThisPage = rowIndex >= pageStartRow && rowIndex < pageEndRow;

            if (currentRowInThisPage) {
                var dataItem = items[index];
                var newRowNode = page.setNewData(rowIndex, dataItem);
                newRowNodes.push(newRowNode);
            }
        }

        return newRowNodes;
    }

    public insertItemsAtIndex(indexToInsert: number, items: any[]): void {
        // get all page id's as NUMBERS (not strings, as we need to sort as numbers) and in descending order

        let newNodes: RowNode[] = [];
        this.forEachBlockInReverseOrder( (block: InfiniteBlock) => {
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

        this.dispatchModelUpdated();
        this.eventService.dispatchEvent(Events.EVENT_ITEMS_ADDED, newNodes);
    }

    private onPageLoaded(event: any): void {
        // if we are not active, then we ignore all events, otherwise we could end up getting the
        // grid to refresh even though we are no longer the active cache
        if (!this.isActive()) {
            return;
        }

        this.logger.log(`onPageLoaded: page = ${event.page.getPageNumber()}, lastRow = ${event.lastRow}`);
        this.activePageLoadsCount--;
        this.checkBlockToLoad();

        if (event.success) {
            this.checkVirtualRowCount(event.page, event.lastRow);
        }
    }

    // the rowRenderer will not pass dontCreatePage, meaning when rendering the grid,
    // it will want new pages in the cache as it asks for rows. only when we are inserting /
    // removing rows via the api is dontCreatePage set, where we move rows between the pages.
    public getRow(rowIndex: number, dontCreatePage = false): RowNode {
        let blockId = Math.floor(rowIndex / this.cacheParams.pageSize);
        let block = this.getBlock(blockId);

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

        let newBlock = new InfiniteBlock(blockNumber, this.cacheParams);
        this.context.wireBean(newBlock);

        newBlock.addEventListener(InfiniteBlock.EVENT_LOAD_COMPLETE, this.onPageLoaded.bind(this));

        this.setBlock(blockNumber, newBlock);

        let needToPurge = _.exists(this.cacheParams.maxBlocksInCache)
            && this.getBlockCount() > this.cacheParams.maxBlocksInCache;
        if (needToPurge) {
            var lruPage = this.findLeastRecentlyUsedPage(newBlock);
            this.removeBlockFromCache(lruPage);
        }

        this.checkBlockToLoad();

        return newBlock;
    }

    private removeBlockFromCache(pageToRemove: InfiniteBlock): void {
        if (!pageToRemove) {
            return;
        }

        this.removeBlock(pageToRemove.getPageNumber());

        // we do not want to remove the 'loaded' event listener, as the
        // concurrent loads count needs to be updated when the load is complete
        // if the purged page is in loading state
    }

    private printCacheStatus(): void {
        this.logger.log(`checkPageToLoad: activePageLoadsCount = ${this.activePageLoadsCount}, pages = ${JSON.stringify(this.getBlockState())}`);
    }

    private checkBlockToLoad() {
        this.printCacheStatus();

        if (this.activePageLoadsCount >= this.cacheParams.maxConcurrentRequests) {
            this.logger.log(`checkPageToLoad: max loads exceeded`);
            return;
        }

        var pageToLoad: InfiniteBlock = null;
        this.forEachBlockInOrder( (block: InfiniteBlock)=> {
            if (block.getState() === InfiniteBlock.STATE_DIRTY) {
                pageToLoad = block;
            }
        });

        if (pageToLoad) {
            pageToLoad.load();
            this.activePageLoadsCount++;
            this.logger.log(`checkPageToLoad: loading page ${pageToLoad.getPageNumber()}`);
            this.printCacheStatus();
        } else {
            this.logger.log(`checkPageToLoad: no pages to load`);
        }
    }

    private findLeastRecentlyUsedPage(pageToExclude: InfiniteBlock): InfiniteBlock {

        var lruPage: InfiniteBlock = null;

        this.forEachBlockInOrder( (block: InfiniteBlock)=> {
            // we exclude checking for the page just created, as this has yet to be accessed and hence
            // the lastAccessed stamp will not be updated for the first time yet
            if (block === pageToExclude) {
                return;
            }

            if (_.missing(lruPage) || block.getLastAccessed() < lruPage.getLastAccessed()) {
                lruPage = block;
            }
        });

        return lruPage;
    }

    protected dispatchModelUpdated(): void {
        if (this.isActive()) {
            this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
        }
    }

    public getBlockState(): any {
        var result: any[] = [];
        this.forEachBlockInOrder( (block: InfiniteBlock, id: number) => {
            let stateItem = {
                blockNumber: id,
                startRow: block.getStartRow(),
                endRow: block.getEndRow(),
                pageStatus: block.getState()
            };
            result.push(stateItem);
        });
        return result;
    }

    public refreshCache(): void {
        this.forEachBlockInOrder( block => block.setDirty() );
        this.checkBlockToLoad();
    }

    public purgeCache(): void {
        this.forEachBlockInOrder( block => this.removeBlockFromCache(block));
        this.dispatchModelUpdated();
    }

}