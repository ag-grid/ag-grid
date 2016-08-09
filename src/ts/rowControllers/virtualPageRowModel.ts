import {Utils as _} from "../utils";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {RowNode} from "../entities/rowNode";
import {Bean, Context, Autowired, PostConstruct, PreDestroy} from "../context/context";
import {EventService} from "../eventService";
import {SelectionController} from "../selectionController";
import {IRowModel} from "./../interfaces/iRowModel";
import {Events} from "../events";
import {SortController} from "../sortController";
import {FilterManager} from "../filter/filterManager";
import {Constants} from "../constants";
import {IDataSource, IGetRowsParams} from "./iDataSource";

/*
* This row controller is used for infinite scrolling only. For normal 'in memory' table,
* or standard pagination, the inMemoryRowController is used.
*/

var logging = false;

@Bean('rowModel')
export class VirtualPageRowModel implements IRowModel {

    @Autowired('rowRenderer') private rowRenderer: any;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    private destroyFunctions: (()=>void)[] = [];

    private cacheVersion = 0;
    private datasource: IDataSource;
    private virtualRowCount: number;
    private foundMaxRow: boolean;

    private pageCache: {[key: string]: RowNode[]};
    private pageCacheSize: number;

    private pageLoadsInProgress: any[];
    private pageLoadsQueued: any[];
    private pageAccessTimes: any;
    private accessTime: number;

    private maxConcurrentDatasourceRequests: number;
    private maxPagesInCache: number;
    private pageSize: number;
    private overflowSize: number;

    private rowHeight: number;

    @PostConstruct
    public init(): void {
        if (!this.gridOptionsWrapper.isRowModelVirtual()) { return; }

        this.addEventListeners();
        this.setDatasource(this.gridOptionsWrapper.getDatasource());
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
        return !this.datasource;
    }

    public isRowsToRender(): boolean {
        return _.exists(this.datasource);
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

        this.doLoadOrQueue(0);

        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
    }

    private resetCache(): void {
        // in case any daemon requests coming from datasource, we know it ignore them
        this.cacheVersion++;

        // see if datasource knows how many rows there are
        if (typeof this.datasource.rowCount === 'number' && this.datasource.rowCount >= 0) {
            this.virtualRowCount = this.datasource.rowCount;
            this.foundMaxRow = true;
        } else {
            this.virtualRowCount = 0;
            this.foundMaxRow = false;
        }

        // map of page numbers to rows in that page
        this.pageCache = {};
        this.pageCacheSize = 0;

        // if a number is in this array, it means we are pending a load from it
        this.pageLoadsInProgress = [];
        this.pageLoadsQueued = [];
        this.pageAccessTimes = {}; // keeps a record of when each page was last viewed, used for LRU cache
        this.accessTime = 0; // rather than using the clock, we use this counter

        // rest all the properties, one here in case any of these change since last time datasource was set
        this.pageSize = this.gridOptionsWrapper.getPaginationPageSize();
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.overflowSize = this.gridOptionsWrapper.getMaxPagesInPaginationCache();
        this.maxConcurrentDatasourceRequests = this.gridOptionsWrapper.getMaxConcurrentDatasourceRequests();
        this.maxPagesInCache = this.gridOptionsWrapper.getMaxPagesInPaginationCache();

        if (_.missing(this.maxConcurrentDatasourceRequests)) {
            this.maxConcurrentDatasourceRequests = 2;
        }
    }

    private createNodesFromRows(pageNumber: any, rows: any): RowNode[] {
        var nodes: RowNode[] = [];
        if (rows) {
            rows.forEach( (item: any, index: number) => {
                var virtualRowIndex = (pageNumber * this.pageSize) + index;
                var node = this.createNode(item, virtualRowIndex, true);
                nodes.push(node);
            });
        }
        return nodes;
    }

    private createNode(data: any, virtualRowIndex: number, realNode: boolean): RowNode {
        var rowHeight = this.rowHeight;
        var top = rowHeight * virtualRowIndex;

        var rowNode: RowNode;
        if (realNode) {
            // if a real node, then always create a new one
            rowNode = new RowNode();
            this.context.wireBean(rowNode);
            rowNode.data = data;
            rowNode.setId(virtualRowIndex.toString());
            // and see if the previous one was selected, and if yes, swap it out
            this.selectionController.syncInRowNode(rowNode);
        } else {
            // if creating a proxy node, see if there is a copy in selected memory that we can use
            var rowNode = new RowNode();
            this.context.wireBean(rowNode);
            rowNode.data = data;
            // we leave the id unset when there is no data with the node
            // rowNode.setId(undefined); // no need for this code, but is shows the intent
        }
        rowNode.rowTop = top;
        rowNode.rowHeight = rowHeight;

        return rowNode;
    }

    private removeFromLoading(pageNumber: any) {
        var index = this.pageLoadsInProgress.indexOf(pageNumber);
        this.pageLoadsInProgress.splice(index, 1);
    }

    private pageLoadFailed(cacheVersionCopy: number, pageNumber: any) {
        if (this.requestIsDaemon(cacheVersionCopy)) { return; }

        this.removeFromLoading(pageNumber);
        this.checkQueueForNextLoad();
    }

    private pageLoaded(cacheVersionCopy: number, pageNumber: any, rows: any, lastRow: any) {
        if (this.requestIsDaemon(cacheVersionCopy)) { return; }

        this.putPageIntoCacheAndPurge(pageNumber, rows);
        this.checkMaxRowAndInformRowRenderer(pageNumber, lastRow);
        this.removeFromLoading(pageNumber);
        this.checkQueueForNextLoad();
    }

    private putPageIntoCacheAndPurge(pageNumber: any, rows: any) {
        this.pageCache[pageNumber] = this.createNodesFromRows(pageNumber, rows);
        this.pageCacheSize++;
        if (logging) {
            console.log('adding page ' + pageNumber);
        }

        var needToPurge = _.exists(this.maxPagesInCache) && this.maxPagesInCache < this.pageCacheSize;
        if (needToPurge) {
            // find the LRU page
            var youngestPageIndex = this.findLeastRecentlyAccessedPage(Object.keys(this.pageCache));

            if (logging) {
                console.log('purging page ' + youngestPageIndex + ' from cache ' + Object.keys(this.pageCache));
            }
            delete this.pageCache[youngestPageIndex];
            this.pageCacheSize--;
        }

    }

    private checkMaxRowAndInformRowRenderer(pageNumber: any, lastRow: any) {
        if (!this.foundMaxRow) {
            // if we know the last row, use if
            if (typeof lastRow === 'number' && lastRow >= 0) {
                this.virtualRowCount = lastRow;
                this.foundMaxRow = true;
            } else {
                // otherwise, see if we need to add some virtual rows
                var thisPagePlusBuffer = ((pageNumber + 1) * this.pageSize) + this.overflowSize;
                if (this.virtualRowCount < thisPagePlusBuffer) {
                    this.virtualRowCount = thisPagePlusBuffer;
                }
            }
            // if rowCount changes, refreshView, otherwise just refreshAllVirtualRows
            this.rowRenderer.refreshView();
        } else {
            this.rowRenderer.refreshAllVirtualRows();
        }
    }

    private isPageAlreadyLoading(pageNumber: any) {
        var result = this.pageLoadsInProgress.indexOf(pageNumber) >= 0 || this.pageLoadsQueued.indexOf(pageNumber) >= 0;
        return result;
    }

    private doLoadOrQueue(pageNumber: any) {
        // if we already tried to load this page, then ignore the request,
        // otherwise server would be hit 50 times just to display one page, the
        // first row to find the page missing is enough.
        if (this.isPageAlreadyLoading(pageNumber)) {
            return;
        }

        // try the page load - if not already doing a load, then we can go ahead
        if (this.pageLoadsInProgress.length < this.maxConcurrentDatasourceRequests) {
            // go ahead, load the page
            this.loadPage(pageNumber);
        } else {
            // otherwise, queue the request
            this.addToQueueAndPurgeQueue(pageNumber);
        }
    }

    private addToQueueAndPurgeQueue(pageNumber: any) {
        if (logging) {
            console.log('queueing ' + pageNumber + ' - ' + this.pageLoadsQueued);
        }
        this.pageLoadsQueued.push(pageNumber);

        // see if there are more pages queued that are actually in our cache, if so there is
        // no point in loading them all as some will be purged as soon as loaded
        var needToPurge = this.maxPagesInCache && this.maxPagesInCache < this.pageLoadsQueued.length;
        if (needToPurge) {
            // find the LRU page
            var youngestPageIndex = this.findLeastRecentlyAccessedPage(this.pageLoadsQueued);

            if (logging) {
                console.log('de-queueing ' + pageNumber + ' - ' + this.pageLoadsQueued);
            }

            var indexToRemove = this.pageLoadsQueued.indexOf(youngestPageIndex);
            this.pageLoadsQueued.splice(indexToRemove, 1);
        }
    }

    private findLeastRecentlyAccessedPage(pageIndexes: any) {
        var youngestPageIndex = -1;
        var youngestPageAccessTime = Number.MAX_VALUE;
        var that = this;

        pageIndexes.forEach(function (pageIndex: any) {
            var accessTimeThisPage = that.pageAccessTimes[pageIndex];
            if (accessTimeThisPage < youngestPageAccessTime) {
                youngestPageAccessTime = accessTimeThisPage;
                youngestPageIndex = pageIndex;
            }
        });

        return youngestPageIndex;
    }

    private checkQueueForNextLoad() {
        if (this.pageLoadsQueued.length > 0) {
            // take from the front of the queue
            var pageToLoad = this.pageLoadsQueued[0];
            this.pageLoadsQueued.splice(0, 1);

            if (logging) {
                console.log('dequeueing ' + pageToLoad + ' - ' + this.pageLoadsQueued);
            }

            this.loadPage(pageToLoad);
        }
    }

    private loadPage(pageNumber: any) {

        this.pageLoadsInProgress.push(pageNumber);

        var startRow = pageNumber * this.pageSize;
        var endRow = (pageNumber + 1) * this.pageSize;

        var sortModel: any;
        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
            sortModel = this.sortController.getSortModel();
        }

        var filterModel: any;
        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
            filterModel = this.filterManager.getFilterModel();
        }

        var params: IGetRowsParams = {
            startRow: startRow,
            endRow: endRow,
            successCallback: this.pageLoaded.bind(this, this.cacheVersion, pageNumber),
            failCallback: this.pageLoadFailed.bind(this, this.cacheVersion, pageNumber),
            sortModel: sortModel,
            filterModel: filterModel,
            context: this.gridOptionsWrapper.getContext()
        };

        // check if old version of datasource used
        var getRowsParams = _.getFunctionParameters(this.datasource.getRows);
        if (getRowsParams.length > 1) {
            console.warn('ag-grid: It looks like your paging datasource is of the old type, taking more than one parameter.');
            console.warn('ag-grid: From ag-grid 1.9.0, now the getRows takes one parameter. See the documentation for details.');
        }

        // put in timeout, to force result to be async
        setTimeout(()=> {
            this.datasource.getRows(params);
        }, 0);
    }

    // check that the datasource has not changed since the lats time we did a request
    private requestIsDaemon(cacheVersionCopy: any) {
        return this.cacheVersion !== cacheVersionCopy;
    }

    public getRow(rowIndex: number): RowNode {
        if (rowIndex > this.virtualRowCount) {
            return null;
        }

        var pageNumber = Math.floor(rowIndex / this.pageSize);
        var page = this.pageCache[pageNumber];

        // for LRU cache, track when this page was last hit
        this.pageAccessTimes[pageNumber] = this.accessTime++;

        if (!page) {
            this.doLoadOrQueue(pageNumber);
            // return back an empty row, so table can at least render empty cells
            var dummyNode = this.createNode(null, rowIndex, false);
            return dummyNode;
        } else {
            var indexInThisPage = rowIndex % this.pageSize;
            return page[indexInThisPage];
        }
    }

    public forEachNode(callback: (rowNode: RowNode)=> void): void {
        var pageKeys = Object.keys(this.pageCache);
        for (var i = 0; i < pageKeys.length; i++) {
            var pageKey = pageKeys[i];
            var page = this.pageCache[pageKey];
            for (var j = 0; j < page.length; j++) {
                var node = page[j];
                callback(node);
            }
        }
    }

    public getRowCombinedHeight(): number {
        return this.virtualRowCount * this.rowHeight;
    }

    public getRowIndexAtPixel(pixel: number): number {
        if (this.rowHeight !== 0) { // avoid divide by zero error
            return Math.floor(pixel / this.rowHeight);
        } else {
            return 0;
        }
    }

    public getRowCount(): number {
        return this.virtualRowCount;
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
