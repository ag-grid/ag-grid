import {Utils as _, NumberSequence} from "../../utils";
import {RowNode} from "../../entities/rowNode";
import {Context, Autowired, PostConstruct, Qualifier} from "../../context/context";
import {EventService} from "../../eventService";
import {Events} from "../../events";
import {LoggerFactory, Logger} from "../../logger";
import {IDatasource} from "../iDatasource";
import {InfiniteBlock} from "./infiniteBlock";

export interface RowNodeCacheParams {
    initialRowCount: number;
    pageSize: number;
    overflowSize: number;
    rowHeight: number;
    lastAccessedSequence: NumberSequence;
}

export interface InfiniteCacheParams extends RowNodeCacheParams {
    maxBlocksInCache: number;
    maxConcurrentRequests: number;
    sortModel: any;
    filterModel: any;
    datasource: IDatasource;
}

export abstract class RowNodeCache {

    private virtualRowCount: number;
    private maxRowFound = false;

    private rowNodeCacheParams: RowNodeCacheParams;

    private active = true;

    constructor(params: RowNodeCacheParams) {
        this.virtualRowCount = params.initialRowCount;
        this.rowNodeCacheParams = params;
    }

    public isActive(): boolean {
        return this.active;
    }

    public getVirtualRowCount(): number {
        return this.virtualRowCount;
    }

    public hack_setVirtualRowCount(virtualRowCount: number): void {
        this.virtualRowCount = virtualRowCount;
    }

    public isMaxRowFound(): boolean {
        return this.maxRowFound;
    }

    // as we are not a context managed bean, we cannot use @PreDestroy
    public destroy(): void {
        this.active = false;
    }

    protected checkVirtualRowCount(page: InfiniteBlock, lastRow: any): void {
        // if client provided a last row, we always use it, as it could change between server calls
        // if user deleted data and then called refresh on the grid.
        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.virtualRowCount = lastRow;
            this.maxRowFound = true;
            this.dispatchModelUpdated();
        } else if (!this.maxRowFound) {
            // otherwise, see if we need to add some virtual rows
            var lastRowIndex = (page.getPageNumber() + 1) * this.rowNodeCacheParams.pageSize;
            var lastRowIndexPlusOverflow = lastRowIndex + this.rowNodeCacheParams.overflowSize;

            if (this.virtualRowCount < lastRowIndexPlusOverflow) {
                this.virtualRowCount = lastRowIndexPlusOverflow;
                this.dispatchModelUpdated();
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
            if (this.virtualRowCount % this.rowNodeCacheParams.pageSize === 0) {
                this.virtualRowCount++;
            }
        }

        this.dispatchModelUpdated();
    }

    protected abstract dispatchModelUpdated(): void;
}

export class InfiniteCache extends RowNodeCache {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    private blocks: {[blockNumber: string]: InfiniteBlock} = {};

    private activePageLoadsCount = 0;
    private blocksCount = 0;

    private cacheParams: InfiniteCacheParams;

    private logger: Logger;

    constructor(params: InfiniteCacheParams) {
        super(params);
        this.cacheParams = params;
    }

    public getRowBounds(index: number): {rowTop: number, rowHeight: number} {
        return {
            rowHeight: this.cacheParams.rowHeight,
            rowTop: this.cacheParams.rowHeight * index
        };
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

    public getCurrentPageHeight(): number {
        return this.getVirtualRowCount() * this.cacheParams.rowHeight;
    }

    public forEachNode(callback: (rowNode: RowNode, index: number)=> void): void {
        var index = 0;
        _.iterateObject(this.blocks, (key: string, cachePage: InfiniteBlock)=> {

            var start = cachePage.getStartRow();
            var end = cachePage.getEndRow();

            for (let rowIndex = start; rowIndex < end; rowIndex++) {
                // we check against virtualRowCount as this page may be the last one, and if it is, then
                // it's probable that the last rows are not part of the set
                if (rowIndex < this.getVirtualRowCount()) {
                    var rowNode = cachePage.getRow(rowIndex);
                    callback(rowNode, index);
                    index++;
                }
            }
        });
    }

    public getRowIndexAtPixel(pixel: number): number {
        if (this.cacheParams.rowHeight !== 0) { // avoid divide by zero error
            var rowIndexForPixel = Math.floor(pixel / this.cacheParams.rowHeight);
            if (rowIndexForPixel >= this.getVirtualRowCount()) {
                return this.getVirtualRowCount() - 1;
            } else {
                return rowIndexForPixel;
            }
        } else {
            return 0;
        }
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
        let pageIds = Object.keys(this.blocks).map(str => parseInt(str)).sort().reverse();

        let newNodes: RowNode[] = [];
        pageIds.forEach(pageId => {
            let page = this.blocks[pageId];
            let pageEndRow = page.getEndRow();

            // if the insertion is after this page, then this page is not impacted
            if (pageEndRow <= indexToInsert) {
                return;
            }

            this.moveItemsDown(page, indexToInsert, items.length);
            let newNodesThisPage = this.insertItems(page, indexToInsert, items);
            newNodesThisPage.forEach(rowNode => newNodes.push(rowNode));
        });

        if (this.isMaxRowFound()) {
            this.hack_setVirtualRowCount(this.getVirtualRowCount() + items.length);
        }

        this.dispatchModelUpdated();
        this.eventService.dispatchEvent(Events.EVENT_ITEMS_ADDED, newNodes);
    }

    public getRowCount(): number {
        return this.getVirtualRowCount();
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
        var pageNumber = Math.floor(rowIndex / this.cacheParams.pageSize);
        var page = this.blocks[pageNumber];

        if (!page) {
            if (dontCreatePage) {
                return null;
            } else {
                page = this.createBlock(pageNumber);
            }
        }

        return page.getRow(rowIndex);
    }

    private createBlock(blockNumber: number): InfiniteBlock {

        let newBlock = new InfiniteBlock(blockNumber, this.cacheParams);
        this.context.wireBean(newBlock);

        newBlock.addEventListener(InfiniteBlock.EVENT_LOAD_COMPLETE, this.onPageLoaded.bind(this));

        this.blocks[blockNumber] = newBlock;
        this.blocksCount++;

        let needToPurge = _.exists(this.cacheParams.maxBlocksInCache)
            && this.blocksCount > this.cacheParams.maxBlocksInCache;
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

        delete this.blocks[pageToRemove.getPageNumber()];
        this.blocksCount--;

        // we do not want to remove the 'loaded' event listener, as the
        // concurrent loads count needs to be updated when the load is complete
        // if the purged page is in loading state
    }

    private printCacheStatus(): void {
        this.logger.log(`checkPageToLoad: activePageLoadsCount = ${this.activePageLoadsCount}, pages = ${JSON.stringify(this.getPageState())}`);
    }

    private checkBlockToLoad() {
        this.printCacheStatus();

        if (this.activePageLoadsCount >= this.cacheParams.maxConcurrentRequests) {
            this.logger.log(`checkPageToLoad: max loads exceeded`);
            return;
        }

        var pageToLoad: InfiniteBlock = null;
        _.iterateObject(this.blocks, (key: string, cachePage: InfiniteBlock)=> {
            if (cachePage.getState() === InfiniteBlock.STATE_DIRTY) {
                pageToLoad = cachePage;
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

        _.iterateObject(this.blocks, (key: string, page: InfiniteBlock)=> {
            // we exclude checking for the page just created, as this has yet to be accessed and hence
            // the lastAccessed stamp will not be updated for the first time yet
            if (page === pageToExclude) {
                return;
            }

            if (_.missing(lruPage) || page.getLastAccessed() < lruPage.getLastAccessed()) {
                lruPage = page;
            }
        });

        return lruPage;
    }

    protected dispatchModelUpdated(): void {
        if (this.isActive()) {
            this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
        }
    }

    public getPageState(): any {
        var result: any[] = [];
        _.iterateObject(this.blocks, (pageNumber: string, page: InfiniteBlock)=> {
            result.push({pageNumber: pageNumber, startRow: page.getStartRow(), endRow: page.getEndRow(), pageStatus: page.getState()});
        });
        return result;
    }

    public refreshCache(): void {
        _.iterateObject(this.blocks, (pageId: string, page: InfiniteBlock)=> {
            page.setDirty();
        });
        this.checkBlockToLoad();
    }

    public purgeCache(): void {
        var pagesList = _.values(this.blocks);
        pagesList.forEach( virtualPage => this.removeBlockFromCache(virtualPage) );
        this.dispatchModelUpdated();
    }

}