import {Utils as _} from "../utils";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {RowNode} from "../entities/rowNode";
import {Bean, Context, Autowired, PostConstruct} from "../context/context";
import {EventService} from "../eventService";
import {SelectionController} from "../selectionController";
import {IRowModel} from "./../interfaces/iRowModel";
import {Events} from "../events";
import {SortController} from "../sortController";
import {FilterManager} from "../filter/filterManager";
import {Constants} from "../constants";

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

    private datasourceVersion = 0;
    private datasource: any;
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
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();

        var virtualEnabled = this.gridOptionsWrapper.isRowModelVirtual();

        this.eventService.addEventListener(Events.EVENT_FILTER_CHANGED, ()=> {
            if (virtualEnabled && this.gridOptionsWrapper.isEnableServerSideFilter()) {
                this.reset();
            }
        });

        this.eventService.addEventListener(Events.EVENT_SORT_CHANGED, ()=> {
            if (virtualEnabled && this.gridOptionsWrapper.isEnableServerSideSorting()) {
                this.reset();
            }
        });

        if (virtualEnabled && this.gridOptionsWrapper.getDatasource()) {
            this.setDatasource(this.gridOptionsWrapper.getDatasource());
        }
    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_VIRTUAL;
    }

    public setDatasource(datasource: any): void {
        this.datasource = datasource;

        if (!datasource) {
            // only continue if we have a valid datasource to working with
            return;
        }

        this.reset();
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

        this.selectionController.reset();

        // see if datasource knows how many rows there are
        if (typeof this.datasource.rowCount === 'number' && this.datasource.rowCount >= 0) {
            this.virtualRowCount = this.datasource.rowCount;
            this.foundMaxRow = true;
        } else {
            this.virtualRowCount = 0;
            this.foundMaxRow = false;
        }

        // in case any daemon requests coming from datasource, we know it ignore them
        this.datasourceVersion++;

        // map of page numbers to rows in that page
        this.pageCache = {};
        this.pageCacheSize = 0;

        // if a number is in this array, it means we are pending a load from it
        this.pageLoadsInProgress = [];
        this.pageLoadsQueued = [];
        this.pageAccessTimes = {}; // keeps a record of when each page was last viewed, used for LRU cache
        this.accessTime = 0; // rather than using the clock, we use this counter

        // the number of concurrent loads we are allowed to the server
        if (typeof this.datasource.maxConcurrentRequests === 'number' && this.datasource.maxConcurrentRequests > 0) {
            this.maxConcurrentDatasourceRequests = this.datasource.maxConcurrentRequests;
        } else {
            this.maxConcurrentDatasourceRequests = 2;
        }

        // the number of pages to keep in browser cache
        if (typeof this.datasource.maxPagesInCache === 'number' && this.datasource.maxPagesInCache > 0) {
            this.maxPagesInCache = this.datasource.maxPagesInCache;
        } else {
            // null is default, means don't  have any max size on the cache
            this.maxPagesInCache = null;
        }

        this.pageSize = this.datasource.pageSize; // take a copy of page size, we don't want it changing
        this.overflowSize = this.datasource.overflowSize; // take a copy of page size, we don't want it changing

        this.doLoadOrQueue(0);
        this.rowRenderer.refreshView();
    }

    private createNodesFromRows(pageNumber: any, rows: any) {
        var nodes: any = [];
        if (rows) {
            for (var i = 0, j = rows.length; i < j; i++) {
                var virtualRowIndex = (pageNumber * this.pageSize) + i;
                var node = this.createNode(rows[i], virtualRowIndex, true);
                nodes.push(node);
            }
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
            rowNode.id = virtualRowIndex;
            rowNode.data = data;
            // and see if the previous one was selected, and if yes, swap it out
            this.selectionController.syncInRowNode(rowNode);
        } else {
            // if creating a proxy node, see if there is a copy in selected memory that we can use
            var rowNode = this.selectionController.getNodeForIdIfSelected(virtualRowIndex);
            if (!rowNode) {
                rowNode = new RowNode();
                this.context.wireBean(rowNode);
                rowNode.id = virtualRowIndex;
                rowNode.data = data;
            }
        }
        rowNode.rowTop = top;
        rowNode.rowHeight = rowHeight;

        return rowNode;
    }

    private removeFromLoading(pageNumber: any) {
        var index = this.pageLoadsInProgress.indexOf(pageNumber);
        this.pageLoadsInProgress.splice(index, 1);
    }

    private pageLoadFailed(pageNumber: any) {
        this.removeFromLoading(pageNumber);
        this.checkQueueForNextLoad();
    }

    private pageLoaded(pageNumber: any, rows: any, lastRow: any) {
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

        var needToPurge = this.maxPagesInCache && this.maxPagesInCache < this.pageCacheSize;
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

        var that = this;
        var datasourceVersionCopy = this.datasourceVersion;

        var sortModel: any;
        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
            sortModel = this.sortController.getSortModel();
        }

        var filterModel: any;
        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
            filterModel = this.filterManager.getFilterModel();
        }

        var params = {
            startRow: startRow,
            endRow: endRow,
            successCallback: successCallback,
            failCallback: failCallback,
            sortModel: sortModel,
            filterModel: filterModel
        };

        // check if old version of datasource used
        var getRowsParams = _.getFunctionParameters(this.datasource.getRows);
        if (getRowsParams.length > 1) {
            console.warn('ag-grid: It looks like your paging datasource is of the old type, taking more than one parameter.');
            console.warn('ag-grid: From ag-grid 1.9.0, now the getRows takes one parameter. See the documentation for details.');
        }

        this.datasource.getRows(params);

        function successCallback(rows: any, lastRowIndex: any) {
            if (that.requestIsDaemon(datasourceVersionCopy)) {
                return;
            }
            that.pageLoaded(pageNumber, rows, lastRowIndex);
        }

        function failCallback() {
            if (that.requestIsDaemon(datasourceVersionCopy)) {
                return;
            }
            that.pageLoadFailed(pageNumber);
        }
    }

    public expandOrCollapseAll(expand: boolean): void {
        console.warn('ag-Grid: can not expand or collapse all when doing virtual pagination');
    }

    // check that the datasource has not changed since the lats time we did a request
    private requestIsDaemon(datasourceVersionCopy: any) {
        return this.datasourceVersion !== datasourceVersionCopy;
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
        if (this.rowHeight!==0) { // avoid divide by zero error
            return Math.floor(pixel / this.rowHeight);
        } else {
            return 0;
        }
    }

    public getRowCount(): number {
        return this.virtualRowCount;
    }

    public setRowData(rows: any[], refresh: boolean, firstId?: number): void {
        console.warn('setRowData - does not work with virtual pagination');
    }

    public forEachNodeAfterFilter(callback: (rowNode: RowNode)=> void): void {
        console.warn('forEachNodeAfterFilter - does not work with virtual pagination');
    }

    public forEachNodeAfterFilterAndSort(callback: (rowNode: RowNode)=> void): void {
        console.warn('forEachNodeAfterFilter - does not work with virtual pagination');
    }

    public refreshModel(): void {
        console.warn('forEachNodeAfterFilter - does not work with virtual pagination');
    }

    public getTopLevelNodes(): RowNode[] {
        console.warn('getTopLevelNodes - does not work with virtual pagination');
        return null;
    }

}
