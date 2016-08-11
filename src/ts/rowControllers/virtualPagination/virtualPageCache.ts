import {Utils as _, NumberSequence} from "../../utils";
import {RowNode} from "../../entities/rowNode";
import {Context, Autowired, PostConstruct, Qualifier} from "../../context/context";
import {EventService} from "../../eventService";
import {Events} from "../../events";
import {LoggerFactory, Logger} from "../../logger";
import {IDataSource} from "../iDataSource";
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
    datasource: IDataSource;
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
    private foundMaxRow = false;

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
            return Math.floor(pixel / this.cacheParams.rowHeight);
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
            if (currentRowIndex < indexOfLastRowToMove) { continue; }

            let indexOfNodeWeWant = currentRowIndex - moveCount;
            let nodeForThisIndex = this.getRow(indexOfNodeWeWant, true);

            if (nodeForThisIndex) {
                page.setRowNode(currentRowIndex, nodeForThisIndex);
            } else {
                page.setBlankRowNode(currentRowIndex);
            }
        }

    }

    private insertItems(page: VirtualPage, indexToInsert: number, items: any[]): void {
        let pageStartRow = page.getStartRow();
        let pageEndRow = page.getEndRow();

        // next stage is insert the rows into this page, if applicable
        for (let index = 0; index < items.length; index++) {
            var rowIndex = indexToInsert + index;

            let currentRowInThisPage = rowIndex >= pageStartRow && rowIndex < pageEndRow;

            if (currentRowInThisPage) {
                var dataItem = items[index];
                page.setNewData(rowIndex, dataItem);
            }
        }
    }

    public insertItemsAtIndex(indexToInsert: number, items: any[]): void {
        // get all page id's as NUMBERS (not strings, as we need to sort as numbers)
        let pageIds = Object.keys(this.pages).map( str => parseInt(str) ).sort().reverse();

        pageIds.forEach( pageId => {
            let page = this.pages[pageId];
            let pageEndRow = page.getEndRow();

            // if the insertion is after this page, then this page is not impacted
            if (pageEndRow <= indexToInsert) { return; }

            this.moveItemsDown(page, indexToInsert, items.length);
            this.insertItems(page, indexToInsert, items);
        });

        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED, {fromIndex: indexToInsert});
    }

    public getRowCount(): number {
        return this.virtualRowCount;
    }

    private onPageLoaded(event: any): void {
        // if we are not active, then we ignore all events, otherwise we could end up getting the
        // grid to refresh even though we are no longer the active cache
        if (!this.active) { return; }

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
        if (!pageToRemove) { return; }

        delete this.pages[pageToRemove.getPageNumber()];
        this.pagesInCacheCount--;

        // we do not want to remove the 'loaded' event listener, as the
        // concurrent loads count needs to be updated when the load is complete
        // if the purged page is in loading state
    }

    private printCacheStatus(): void {
        this.logger.log(`checkPageToLoad: activePageLoadsCount = ${this.activePageLoadsCount}, pages = ${this.getPageStateAsString()}`);
    }

    private checkPageToLoad() {
        this.printCacheStatus();

        if (this.activePageLoadsCount >= this.cacheParams.maxConcurrentDatasourceRequests) {
            this.logger.log(`checkPageToLoad: max loads exceeded`);
            return;
        }

        var pageToLoad: VirtualPage = null;
        _.iterateObject(this.pages, (key: string, cachePage: VirtualPage)=> {
            if (cachePage.getState()===VirtualPage.STATE_NEW) {
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
            if (page === pageToExclude) { return; }

            if (_.missing(lruPage) || page.getLastAccessed() < lruPage.getLastAccessed()) {
                lruPage = page;
            }
        });

        return lruPage;
    }

    private checkVirtualRowCount(page: VirtualPage, lastRow: any): void {
        // if we know the last row, use if
        if (this.foundMaxRow) { return; }

        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.virtualRowCount = lastRow;
            this.foundMaxRow = true;
            this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
        } else {
            // otherwise, see if we need to add some virtual rows
            var lastRowIndex = (page.getPageNumber() + 1) * this.cacheParams.pageSize;
            var lastRowIndexPlusOverflow = lastRowIndex + this.cacheParams.paginationOverflowSize;

            if (this.virtualRowCount < lastRowIndexPlusOverflow) {
                this.virtualRowCount = lastRowIndexPlusOverflow;
                this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
            }
        }
    }

    public getPageStateAsString(): string {
        var strings: string[] = [];
        _.iterateObject(this.pages, (pageNumber: string, page: VirtualPage)=> {
            strings.push(`{pageNumber: ${pageNumber}, pageStatus: ${page.getState()}}`);
        });
        return strings.join(',');
    }
}
