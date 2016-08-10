import {Utils as _, NumberSequence} from "../utils";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {RowNode} from "../entities/rowNode";
import {Bean, Context, Autowired, PostConstruct, PreDestroy, Qualifier} from "../context/context";
import {EventService} from "../eventService";
import {SelectionController} from "../selectionController";
import {IRowModel} from "./../interfaces/iRowModel";
import {Events} from "../events";
import {SortController} from "../sortController";
import {FilterManager} from "../filter/filterManager";
import {Constants} from "../constants";
import {IDataSource, IGetRowsParams} from "./iDataSource";
import {IEventEmitter} from "../interfaces/iEventEmitter";
import {LoggerFactory, Logger} from "../logger";

/*
* This row controller is used for infinite scrolling only. For normal 'in memory' table,
* or standard pagination, the inMemoryRowController is used.
*/

interface CacheSettings {
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

class CachePage implements IEventEmitter {

    public static EVENT_LOAD_COMPLETE = 'loadComplete';

    public static STATE_NEW = 'new';
    public static STATE_LOADING = 'loading';
    public static STATE_LOADED = 'loaded';
    public static STATE_FAILED = 'failed';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;

    private state = CachePage.STATE_NEW;

    private lastAccessed: number;

    private pageNumber: number;
    private startRow: number;
    private endRow: number;
    private rowNodes: RowNode[];

    private cacheSettings: CacheSettings;

    private localEventService = new EventService();

    constructor(pageNumber: number, cacheSettings: CacheSettings) {
        this.pageNumber = pageNumber;
        this.cacheSettings = cacheSettings;

        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        this.startRow = pageNumber * cacheSettings.pageSize;
        this.endRow = this.startRow + cacheSettings.pageSize;
    }

    public getStartRow(): number {
        return this.startRow;
    }

    public getEndRow(): number {
        return this.endRow;
    }

    public getPageNumber(): number {
        return this.pageNumber;
    }

    public addEventListener(eventType: string, listener: Function): void {
        this.localEventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        this.localEventService.removeEventListener(eventType, listener);
    }

    public getLastAccessed(): number {
        return this.lastAccessed;
    }

    public getState(): string {
        return this.state;
    }

    @PostConstruct
    private init(): void {
        this.createRowNodes();
    }

    // creates empty row nodes, data is missing as not loaded yet
    private createRowNodes(): void {
        this.rowNodes = [];
        for (var i = 0; i < this.cacheSettings.pageSize; i++) {
            var rowIndex = this.startRow + i;
            let rowNode = new RowNode();
            this.context.wireBean(rowNode);
            rowNode.rowTop = this.cacheSettings.rowHeight * rowIndex;
            rowNode.rowHeight = this.cacheSettings.rowHeight;
            this.rowNodes.push(rowNode);
        }
    }

    public getRow(rowIndex: number): RowNode {
        this.lastAccessed = this.cacheSettings.lastAccessedSequence.next();
        var localIndex = rowIndex - this.startRow;
        return this.rowNodes[localIndex];
    }

    public load(): void {

        this.state = CachePage.STATE_LOADING;

        var params: IGetRowsParams = {
            startRow: this.startRow,
            endRow: this.endRow,
            successCallback: this.pageLoaded.bind(this),
            failCallback: this.pageLoadFailed.bind(this),
            sortModel: this.cacheSettings.sortModel,
            filterModel: this.cacheSettings.filterModel,
            context: this.gridOptionsWrapper.getContext()
        };

        if (_.missing(this.cacheSettings.datasource.getRows)) {
            console.warn(`ag-Grid: datasource is missing getRows method`);
            return;
        }

        // check if old version of datasource used
        var getRowsParams = _.getFunctionParameters(this.cacheSettings.datasource.getRows);
        if (getRowsParams.length > 1) {
            console.warn('ag-grid: It looks like your paging datasource is of the old type, taking more than one parameter.');
            console.warn('ag-grid: From ag-grid 1.9.0, now the getRows takes one parameter. See the documentation for details.');
        }

        // put in timeout, to force result to be async
        setTimeout(()=> {
            this.cacheSettings.datasource.getRows(params);
        }, 0);
    }

    private pageLoadFailed() {
        this.state = CachePage.STATE_FAILED;
        var event = {success: true, page: this};
        this.localEventService.dispatchEvent(CachePage.EVENT_LOAD_COMPLETE, event);
    }

    private pageLoaded(rows: any[], lastRow: number) {
        this.state = CachePage.STATE_LOADED;

        this.rowNodes.forEach( (rowNode: RowNode, index: number)=> {
            var data = rows[index];
            if (_.exists(data)) {
                rowNode.setData(data);
            }

            // rowNode.setId(virtualRowIndex.toString());

        });

        // check here if lastrow should be set
        var event = {success: true, page: this, lastRow: lastRow};

        this.localEventService.dispatchEvent(CachePage.EVENT_LOAD_COMPLETE, event);
    }

}

class RowNodeCache {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    private pages: {[pageNumber: string]: CachePage} = {};

    private activePageLoadsCount = 0;
    private pagesInCacheCount = 0;

    private cacheSettings: CacheSettings;

    private virtualRowCount: number;
    private foundMaxRow = false;

    private logger: Logger;

    private active = true;

    constructor(cacheSettings: CacheSettings) {
        this.cacheSettings = cacheSettings;
        this.virtualRowCount = cacheSettings.paginationInitialRowCount;
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('CachePage');
    }

    @PostConstruct
    private init(): void {
        // start load of data, as the virtualRowCount will remain at 0 otherwise,
        // so we need this to kick things off, otherwise grid would never call getRow()
        this.getRow(0);
    }

    public getRowCombinedHeight(): number {
        return this.virtualRowCount * this.cacheSettings.rowHeight;
    }

    public forEachNode(callback: (rowNode: RowNode, index: number)=> void): void {
        var index = 0;
        _.iterateObject(this.pages, (key: string, cachePage: CachePage)=> {

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
        if (this.cacheSettings.rowHeight !== 0) { // avoid divide by zero error
            return Math.floor(pixel / this.cacheSettings.rowHeight);
        } else {
            return 0;
        }
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

    public getRow(rowIndex: number): RowNode {
        var pageNumber = Math.floor(rowIndex / this.cacheSettings.pageSize);
        var page = this.pages[pageNumber];

        if (!page) {
            page = this.createPage(pageNumber);
        }

        return page.getRow(rowIndex);
    }

    private createPage(pageNumber: number): CachePage {

        let newPage = new CachePage(pageNumber, this.cacheSettings);
        this.context.wireBean(newPage);

        newPage.addEventListener(CachePage.EVENT_LOAD_COMPLETE, this.onPageLoaded.bind(this));

        this.pages[pageNumber] = newPage;
        this.pagesInCacheCount++;

        let needToPurge = _.exists(this.cacheSettings.maxPagesInCache)
            && this.pagesInCacheCount > this.cacheSettings.maxPagesInCache;
        if (needToPurge) {
            var lruPage = this.findLeastRecentlyUsedPage(newPage);
            this.removePageFromCache(lruPage);
        }

        this.checkPageToLoad();

        return newPage;
    }

    private removePageFromCache(pageToRemove: CachePage): void {
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

        if (this.activePageLoadsCount >= this.cacheSettings.maxConcurrentDatasourceRequests) {
            this.logger.log(`checkPageToLoad: max loads exceeded`);
            return;
        }

        var pageToLoad: CachePage = null;
        _.iterateObject(this.pages, (key: string, cachePage: CachePage)=> {
            if (cachePage.getState()===CachePage.STATE_NEW) {
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

    private findLeastRecentlyUsedPage(pageToExclude: CachePage): CachePage {

        var lruPage: CachePage = null;

        _.iterateObject(this.pages, (key: string, page: CachePage)=> {
            // we exclude checking for the page just created, as this has yet to be accessed and hence
            // the lastAccessed stamp will not be updated for the first time yet
            if (page === pageToExclude) { return; }

            if (_.missing(lruPage) || page.getLastAccessed() < lruPage.getLastAccessed()) {
                lruPage = page;
            }
        });

        return lruPage;
    }

    private checkVirtualRowCount(page: CachePage, lastRow: any): void {
        // if we know the last row, use if
        if (this.foundMaxRow) { return; }

        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.virtualRowCount = lastRow;
            this.foundMaxRow = true;
            this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
        } else {
            // otherwise, see if we need to add some virtual rows
            var lastRowIndex = (page.getPageNumber() + 1) * this.cacheSettings.pageSize;
            var lastRowIndexPlusOverflow = lastRowIndex + this.cacheSettings.paginationOverflowSize;

            if (this.virtualRowCount < lastRowIndexPlusOverflow) {
                this.virtualRowCount = lastRowIndexPlusOverflow;
                this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
            }
        }
    }

    public getPageStateAsString(): string {
        var strings: string[] = [];
        _.iterateObject(this.pages, (pageNumber: string, page: CachePage)=> {
            strings.push(`{pageNumber: ${pageNumber}, pageStatus: ${page.getState()}}`);
        });
        return strings.join(',');
    }
}

@Bean('rowModel')
export class VirtualPageRowModel implements IRowModel {

    @Autowired('rowRenderer') private rowRenderer: any;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    private logger: Logger;

    private destroyFunctions: (()=>void)[] = [];

    private rowNodeCache: RowNodeCache;
    private datasource: IDataSource;

    @PostConstruct
    public init(): void {
        if (!this.gridOptionsWrapper.isRowModelVirtual()) { return; }

        this.addEventListeners();
        this.setDatasource(this.gridOptionsWrapper.getDatasource());
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('VirtualPageRowModel');
    }

    private addEventListeners(): void {
        var onSortChangedListener = this.onSortChanged.bind(this);
        var onFilterChangedListener = this.onFilterChanged.bind(this);

        this.eventService.addEventListener(Events.EVENT_FILTER_CHANGED, onFilterChangedListener);
        this.eventService.addEventListener(Events.EVENT_SORT_CHANGED, onSortChangedListener);

        this.destroyFunctions.push( ()=> {
            this.eventService.removeEventListener(Events.EVENT_FILTER_CHANGED, onFilterChangedListener);
            this.eventService.removeEventListener(Events.EVENT_SORT_CHANGED, onSortChangedListener);
        });
    }

    private onFilterChanged(): void {
        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
            this.reset();
        }
    }

    private onSortChanged(): void {
        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
            this.reset();
        }
    }

    @PreDestroy
    public destroy(): void {
        this.destroyFunctions.forEach( func => func() );
    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_VIRTUAL;
    }

    public setDatasource(datasource: IDataSource): void {
        this.datasource = datasource;

        // only reset if we have a valid datasource to working with
        if (datasource) {
            this.checkForDeprecated();
            this.reset();
        }
    }

    private checkForDeprecated(): void {
        var ds = <any> this.datasource;
        // the number of concurrent loads we are allowed to the server
        if (_.exists(ds.maxConcurrentRequests)) {
            console.error('ag-Grid: since version 5.1.x, maxConcurrentRequests is replaced with grid property maxConcurrentDatasourceRequests');
        }

        if (_.exists(ds.maxPagesInCache)) {
            console.error('ag-Grid: since version 5.1.x, maxPagesInCache is replaced with grid property maxPagesInPaginationCache');
        }

        if (_.exists(ds.overflowSize)) {
            console.error('ag-Grid: since version 5.1.x, overflowSize is replaced with grid property paginationOverflowSize');
        }

        if (_.exists(ds.pageSize)) {
            console.error('ag-Grid: since version 5.1.x, overflowSize is replaced with grid property paginationPageSize');
        }
    }

    public isEmpty(): boolean {
        return _.missing(this.rowNodeCache);
    }

    public isRowsToRender(): boolean {
        return _.exists(this.rowNodeCache);
    }

    private reset() {
        // important to return here, as the user could be setting filter or sort before
        // data-source is set
        if (_.missing(this.datasource)) {
            return;
        }

        // if user is providing id's, then this means we can keep the selection between datsource hits,
        // as the rows will keep their unique id's even if, for example, server side sorting or filtering
        // is done.
        var userGeneratingRows = _.exists(this.gridOptionsWrapper.getRowNodeIdFunc());
        if (!userGeneratingRows) {
            this.selectionController.reset();
        }

        this.resetCache();

        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
    }

    private resetCache(): void {
        let cacheSettings = <CacheSettings> {
            // the user provided datasource
            datasource: this.datasource,

            // sort and filter model
            filterModel: this.filterManager.getFilterModel(),
            sortModel: this.sortController.getSortModel(),

            // properties - this way we take a snapshot of them, so if user changes any, they will be
            // used next time we create a new cache, which is generally after a filter or sort change,
            // or a new datasource is set
            maxConcurrentDatasourceRequests: this.gridOptionsWrapper.getMaxConcurrentDatasourceRequests(),
            paginationOverflowSize: this.gridOptionsWrapper.getPaginationOverflowSize(),
            paginationInitialRowCount: this.gridOptionsWrapper.getPaginationInitialRowCount(),
            maxPagesInCache: this.gridOptionsWrapper.getMaxPagesInPaginationCache(),
            pageSize: this.gridOptionsWrapper.getPaginationPageSize(),
            rowHeight: this.gridOptionsWrapper.getRowHeightAsNumber(),

            // the cache could create this, however it is also used by the pages, so handy to create it
            // here as the settings are also passed to the pages
            lastAccessedSequence: new NumberSequence()
        };

        // set defaults
        if ( !(cacheSettings.maxConcurrentDatasourceRequests>=1) ) {
            cacheSettings.maxConcurrentDatasourceRequests = 2;
        }
        // page size needs to be 1 or greater. having it at 1 would be silly, as you would be hitting the
        // server for one page at a time. so the default if not specified is 100.
        if ( !(cacheSettings.pageSize>=1) ) {
            cacheSettings.pageSize = 100;
        }
        // if user doesn't give initial rows to display, we assume zero
        if ( !(cacheSettings.paginationInitialRowCount>=1) ) {
            cacheSettings.paginationInitialRowCount = 0;
        }
        // if user doesn't provide overflow, we use default overflow of 1, so user can scroll past
        // the current page and request first row of next page
        if ( !(cacheSettings.paginationOverflowSize>=1) ) {
            cacheSettings.paginationOverflowSize = 1;
        }

        // if not first time creating a cache, need to destroy the old one
        if (this.rowNodeCache) {
            this.rowNodeCache.destroy();
        }

        this.rowNodeCache = new RowNodeCache(cacheSettings);
        this.context.wireBean(this.rowNodeCache);
    }

    public getRow(rowIndex: number): RowNode {
        return this.rowNodeCache.getRow(rowIndex);
    }

    public forEachNode(callback: (rowNode: RowNode, index: number)=> void): void {
        return this.rowNodeCache.forEachNode(callback);
    }

    public getRowCombinedHeight(): number {
        return this.rowNodeCache.getRowCombinedHeight();
    }

    public getRowIndexAtPixel(pixel: number): number {
        return this.rowNodeCache.getRowIndexAtPixel(pixel);
    }

    public getRowCount(): number {
        return this.rowNodeCache.getRowCount();
    }

    public insertItemsAtIndex(index: number, items: any[]): void {
        console.log('not yet supported');
    }

    public removeItems(rowNodes: RowNode[]): void {
        console.log('not yet supported');
    }

    public addItems(items: any[]): void {
        console.log('not yet supported');
    }
}
