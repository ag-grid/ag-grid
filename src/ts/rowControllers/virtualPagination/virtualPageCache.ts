import {Utils as _, NumberSequence} from "../../utils";
import {RowNode} from "../../entities/rowNode";
import {Context, Autowired, PostConstruct, Qualifier} from "../../context/context";
import {EventService} from "../../eventService";
import {Events} from "../../events";
import {LoggerFactory, Logger} from "../../logger";
import {IDatasource} from "../iDatasource";
import {VirtualPage} from "./virtualPage";

export interface CacheParams {
    pageSize: number;
    rowHeight: number;
    maxPagesInCache: number;
    maxConcurrentDatasourceRequests: number;
    paginationOverflowSize: number;
    paginationInitialRowCount: number;
    sortModel: any;
    filterModel: any;
    datasource: IDatasource;
    lastAccessedSequence: NumberSequence;
}

export class VirtualPageCache {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    private pages: {[pageNumber: string]: VirtualPage} = {};

    private activePageLoadsCount = 0;
    private pagesInCacheCount = 0;

    private cacheParams: CacheParams;

    private virtualRowCount: number;
    private maxRowFound = false;

    private logger: Logger;

    private active = true;

    constructor(cacheSettings: CacheParams) {
        this.cacheParams = cacheSettings;
        this.virtualRowCount = cacheSettings.paginationInitialRowCount;
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

    public getRowCombinedHeight(): number {
        return this.virtualRowCount * this.cacheParams.rowHeight;
    }

    public forEachNode(callback: (rowNode: RowNode, index: number)=> void): void {
        var index = 0;
        _.iterateObject(this.pages, (key: string, cachePage: VirtualPage)=> {

            var start = cachePage.getStartRow();
            var end = cachePage.getEndRow();

            for (let rowIndex = start; rowIndex < end; rowIndex++) {
                // we check against virtualRowCount as this page may be the last one, and if it is, then
                // it's probable that the last rows are not part of the set
                if (rowIndex < this.virtualRowCount) {
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
            if (rowIndexForPixel >= this.virtualRowCount) {
                return this.virtualRowCount - 1;
            } else {
                return rowIndexForPixel;
            }
        } else {
            return 0;
        }
    }

    private moveItemsDown(page: VirtualPage, moveFromIndex: number, moveCount: number): void {
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

    private insertItems(page: VirtualPage, indexToInsert: number, items: any[]): RowNode[] {
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
        let pageIds = Object.keys(this.pages).map(str => parseInt(str)).sort().reverse();

        let newNodes: RowNode[] = [];
        pageIds.forEach(pageId => {
            let page = this.pages[pageId];
            let pageEndRow = page.getEndRow();

            // if the insertion is after this page, then this page is not impacted
            if (pageEndRow <= indexToInsert) {
                return;
            }

            this.moveItemsDown(page, indexToInsert, items.length);
            let newNodesThisPage = this.insertItems(page, indexToInsert, items);
            newNodesThisPage.forEach(rowNode => newNodes.push(rowNode));
        });

        if (this.maxRowFound) {
            this.virtualRowCount += items.length;
        }

        this.dispatchModelUpdated();
        this.eventService.dispatchEvent(Events.EVENT_ITEMS_ADDED, newNodes);
    }

    public getRowCount(): number {
        return this.virtualRowCount;
    }

    private onPageLoaded(event: any): void {
        // if we are not active, then we ignore all events, otherwise we could end up getting the
        // grid to refresh even though we are no longer the active cache
        if (!this.active) {
            return;
        }

        this.logger.log(`onPageLoaded: page = ${event.page.getPageNumber()}, lastRow = ${event.lastRow}`);
        this.activePageLoadsCount--;
        this.checkPageToLoad();

        if (event.success) {
            this.checkVirtualRowCount(event.page, event.lastRow);
        }
    }

    // as we are not a context managed bean, we cannot use @PreDestroy
    public destroy(): void {
        this.active = false;
    }

    // the rowRenderer will not pass dontCreatePage, meaning when rendering the grid,
    // it will want new pages in teh cache as it asks for rows. only when we are inserting /
    // removing rows via the api is dontCreatePage set, where we move rows between the pages.
    public getRow(rowIndex: number, dontCreatePage = false): RowNode {
        var pageNumber = Math.floor(rowIndex / this.cacheParams.pageSize);
        var page = this.pages[pageNumber];

        if (!page) {
            if (dontCreatePage) {
                return null;
            } else {
                page = this.createPage(pageNumber);
            }
        }

        return page.getRow(rowIndex);
    }

    private createPage(pageNumber: number): VirtualPage {

        let newPage = new VirtualPage(pageNumber, this.cacheParams);
        this.context.wireBean(newPage);

        newPage.addEventListener(VirtualPage.EVENT_LOAD_COMPLETE, this.onPageLoaded.bind(this));

        this.pages[pageNumber] = newPage;
        this.pagesInCacheCount++;

        let needToPurge = _.exists(this.cacheParams.maxPagesInCache)
            && this.pagesInCacheCount > this.cacheParams.maxPagesInCache;
        if (needToPurge) {
            var lruPage = this.findLeastRecentlyUsedPage(newPage);
            this.removePageFromCache(lruPage);
        }

        this.checkPageToLoad();

        return newPage;
    }

    private removePageFromCache(pageToRemove: VirtualPage): void {
        if (!pageToRemove) {
            return;
        }

        delete this.pages[pageToRemove.getPageNumber()];
        this.pagesInCacheCount--;

        // we do not want to remove the 'loaded' event listener, as the
        // concurrent loads count needs to be updated when the load is complete
        // if the purged page is in loading state
    }

    private printCacheStatus(): void {
        this.logger.log(`checkPageToLoad: activePageLoadsCount = ${this.activePageLoadsCount}, pages = ${JSON.stringify(this.getPageState())}`);
    }

    private checkPageToLoad() {
        this.printCacheStatus();

        if (this.activePageLoadsCount >= this.cacheParams.maxConcurrentDatasourceRequests) {
            this.logger.log(`checkPageToLoad: max loads exceeded`);
            return;
        }

        var pageToLoad: VirtualPage = null;
        _.iterateObject(this.pages, (key: string, cachePage: VirtualPage)=> {
            if (cachePage.getState() === VirtualPage.STATE_DIRTY) {
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

    private findLeastRecentlyUsedPage(pageToExclude: VirtualPage): VirtualPage {

        var lruPage: VirtualPage = null;

        _.iterateObject(this.pages, (key: string, page: VirtualPage)=> {
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

    private checkVirtualRowCount(page: VirtualPage, lastRow: any): void {
        // if client provided a last row, we always use it, as it could change between server calls
        // if user deleted data and then called refresh on the grid.
        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.virtualRowCount = lastRow;
            this.maxRowFound = true;
            this.dispatchModelUpdated();
        } else if (!this.maxRowFound) {
            // otherwise, see if we need to add some virtual rows
            var lastRowIndex = (page.getPageNumber() + 1) * this.cacheParams.pageSize;
            var lastRowIndexPlusOverflow = lastRowIndex + this.cacheParams.paginationOverflowSize;

            if (this.virtualRowCount < lastRowIndexPlusOverflow) {
                this.virtualRowCount = lastRowIndexPlusOverflow;
                this.dispatchModelUpdated();
            }
        }
    }

    private dispatchModelUpdated(): void {
        if (this.active) {
            this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
        }
    }

    public getPageState(): any {
        var result: any[] = [];
        _.iterateObject(this.pages, (pageNumber: string, page: VirtualPage)=> {
            result.push({pageNumber: pageNumber, startRow: page.getStartRow(), endRow: page.getEndRow(), pageStatus: page.getState()});
        });
        return result;
    }

    public refreshVirtualPageCache(): void {
        _.iterateObject(this.pages, (pageId: string, page: VirtualPage)=> {
            page.setDirty();
        });
        this.checkPageToLoad();
    }

    public purgeVirtualPageCache(): void {
        var pagesList = _.values(this.pages);
        pagesList.forEach( virtualPage => this.removePageFromCache(virtualPage) );
        this.dispatchModelUpdated();
    }

    public getVirtualRowCount(): number {
        return this.virtualRowCount;
    }

    public isMaxRowFound(): boolean {
        return this.maxRowFound;
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
            if (this.virtualRowCount % this.cacheParams.pageSize === 0) {
                this.virtualRowCount++;
            }
        }

        this.dispatchModelUpdated();
    }
}