/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
/*
* This row controller is used for infinite scrolling only. For normal 'in memory' table,
* or standard pagination, the inMemoryRowController is used.
*/
var logging = false;
var VirtualPageRowController = (function () {
    function VirtualPageRowController() {
    }
    VirtualPageRowController.prototype.init = function (rowRenderer, gridOptionsWrapper, angularGrid) {
        this.rowRenderer = rowRenderer;
        this.datasourceVersion = 0;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.angularGrid = angularGrid;
    };
    VirtualPageRowController.prototype.setDatasource = function (datasource) {
        this.datasource = datasource;
        if (!datasource) {
            // only continue if we have a valid datasource to working with
            return;
        }
        this.reset();
    };
    VirtualPageRowController.prototype.reset = function () {
        // see if datasource knows how many rows there are
        if (typeof this.datasource.rowCount === 'number' && this.datasource.rowCount >= 0) {
            this.virtualRowCount = this.datasource.rowCount;
            this.foundMaxRow = true;
        }
        else {
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
        }
        else {
            this.maxConcurrentDatasourceRequests = 2;
        }
        // the number of pages to keep in browser cache
        if (typeof this.datasource.maxPagesInCache === 'number' && this.datasource.maxPagesInCache > 0) {
            this.maxPagesInCache = this.datasource.maxPagesInCache;
        }
        else {
            // null is default, means don't  have any max size on the cache
            this.maxPagesInCache = null;
        }
        this.pageSize = this.datasource.pageSize; // take a copy of page size, we don't want it changing
        this.overflowSize = this.datasource.overflowSize; // take a copy of page size, we don't want it changing
        this.doLoadOrQueue(0);
    };
    VirtualPageRowController.prototype.createNodesFromRows = function (pageNumber, rows) {
        var nodes = [];
        if (rows) {
            for (var i = 0, j = rows.length; i < j; i++) {
                var virtualRowIndex = (pageNumber * this.pageSize) + i;
                var node = this.createNode(rows[i], virtualRowIndex);
                nodes.push(node);
            }
        }
        return nodes;
    };
    VirtualPageRowController.prototype.createNode = function (data, virtualRowIndex) {
        var rowHeight = this.getRowHeightAsNumber();
        var top = rowHeight * virtualRowIndex;
        var rowNode = {
            data: data,
            id: virtualRowIndex,
            rowTop: top,
            rowHeight: rowHeight
        };
        return rowNode;
    };
    VirtualPageRowController.prototype.removeFromLoading = function (pageNumber) {
        var index = this.pageLoadsInProgress.indexOf(pageNumber);
        this.pageLoadsInProgress.splice(index, 1);
    };
    VirtualPageRowController.prototype.pageLoadFailed = function (pageNumber) {
        this.removeFromLoading(pageNumber);
        this.checkQueueForNextLoad();
    };
    VirtualPageRowController.prototype.pageLoaded = function (pageNumber, rows, lastRow) {
        this.putPageIntoCacheAndPurge(pageNumber, rows);
        this.checkMaxRowAndInformRowRenderer(pageNumber, lastRow);
        this.removeFromLoading(pageNumber);
        this.checkQueueForNextLoad();
    };
    VirtualPageRowController.prototype.putPageIntoCacheAndPurge = function (pageNumber, rows) {
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
    };
    VirtualPageRowController.prototype.checkMaxRowAndInformRowRenderer = function (pageNumber, lastRow) {
        if (!this.foundMaxRow) {
            // if we know the last row, use if
            if (typeof lastRow === 'number' && lastRow >= 0) {
                this.virtualRowCount = lastRow;
                this.foundMaxRow = true;
            }
            else {
                // otherwise, see if we need to add some virtual rows
                var thisPagePlusBuffer = ((pageNumber + 1) * this.pageSize) + this.overflowSize;
                if (this.virtualRowCount < thisPagePlusBuffer) {
                    this.virtualRowCount = thisPagePlusBuffer;
                }
            }
            // if rowCount changes, refreshView, otherwise just refreshAllVirtualRows
            this.rowRenderer.refreshView();
        }
        else {
            this.rowRenderer.refreshAllVirtualRows();
        }
    };
    VirtualPageRowController.prototype.isPageAlreadyLoading = function (pageNumber) {
        var result = this.pageLoadsInProgress.indexOf(pageNumber) >= 0 || this.pageLoadsQueued.indexOf(pageNumber) >= 0;
        return result;
    };
    VirtualPageRowController.prototype.doLoadOrQueue = function (pageNumber) {
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
        }
        else {
            // otherwise, queue the request
            this.addToQueueAndPurgeQueue(pageNumber);
        }
    };
    VirtualPageRowController.prototype.addToQueueAndPurgeQueue = function (pageNumber) {
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
    };
    VirtualPageRowController.prototype.findLeastRecentlyAccessedPage = function (pageIndexes) {
        var youngestPageIndex = -1;
        var youngestPageAccessTime = Number.MAX_VALUE;
        var that = this;
        pageIndexes.forEach(function (pageIndex) {
            var accessTimeThisPage = that.pageAccessTimes[pageIndex];
            if (accessTimeThisPage < youngestPageAccessTime) {
                youngestPageAccessTime = accessTimeThisPage;
                youngestPageIndex = pageIndex;
            }
        });
        return youngestPageIndex;
    };
    VirtualPageRowController.prototype.checkQueueForNextLoad = function () {
        if (this.pageLoadsQueued.length > 0) {
            // take from the front of the queue
            var pageToLoad = this.pageLoadsQueued[0];
            this.pageLoadsQueued.splice(0, 1);
            if (logging) {
                console.log('dequeueing ' + pageToLoad + ' - ' + this.pageLoadsQueued);
            }
            this.loadPage(pageToLoad);
        }
    };
    VirtualPageRowController.prototype.loadPage = function (pageNumber) {
        this.pageLoadsInProgress.push(pageNumber);
        var startRow = pageNumber * this.pageSize;
        var endRow = (pageNumber + 1) * this.pageSize;
        var that = this;
        var datasourceVersionCopy = this.datasourceVersion;
        var sortModel;
        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
            sortModel = this.angularGrid.getSortModel();
        }
        var filterModel;
        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
            filterModel = this.angularGrid.getFilterModel();
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
        var getRowsParams = utils_1.default.getFunctionParameters(this.datasource.getRows);
        if (getRowsParams.length > 1) {
            console.warn('ag-grid: It looks like your paging datasource is of the old type, taking more than one parameter.');
            console.warn('ag-grid: From ag-grid 1.9.0, now the getRows takes one parameter. See the documentation for details.');
        }
        this.datasource.getRows(params);
        function successCallback(rows, lastRowIndex) {
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
    };
    // check that the datasource has not changed since the lats time we did a request
    VirtualPageRowController.prototype.requestIsDaemon = function (datasourceVersionCopy) {
        return this.datasourceVersion !== datasourceVersionCopy;
    };
    VirtualPageRowController.prototype.getVirtualRow = function (rowIndex) {
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
            var dummyNode = this.createNode({}, rowIndex);
            return dummyNode;
        }
        else {
            var indexInThisPage = rowIndex % this.pageSize;
            return page[indexInThisPage];
        }
    };
    VirtualPageRowController.prototype.forEachNode = function (callback) {
        var pageKeys = Object.keys(this.pageCache);
        for (var i = 0; i < pageKeys.length; i++) {
            var pageKey = pageKeys[i];
            var page = this.pageCache[pageKey];
            for (var j = 0; j < page.length; j++) {
                var node = page[j];
                callback(node);
            }
        }
    };
    VirtualPageRowController.prototype.getRowHeightAsNumber = function () {
        var rowHeight = this.gridOptionsWrapper.getRowHeightForVirtualPagiation();
        if (typeof rowHeight === 'number') {
            return rowHeight;
        }
        else {
            console.warn('ag-Grid row height must be a number when doing virtual paging');
            return 25;
        }
    };
    VirtualPageRowController.prototype.getVirtualRowCombinedHeight = function () {
        return this.virtualRowCount * this.getRowHeightAsNumber();
    };
    VirtualPageRowController.prototype.getRowAtPixel = function (pixel) {
        var rowHeight = this.getRowHeightAsNumber();
        if (rowHeight !== 0) {
            return Math.floor(pixel / rowHeight);
        }
        else {
            return 0;
        }
    };
    VirtualPageRowController.prototype.getModel = function () {
        var that = this;
        return {
            getRowAtPixel: function (pixel) {
                return that.getRowAtPixel(pixel);
            },
            getVirtualRowCombinedHeight: function () {
                return that.getVirtualRowCombinedHeight();
            },
            getVirtualRow: function (index) {
                return that.getVirtualRow(index);
            },
            getVirtualRowCount: function () {
                return that.virtualRowCount;
            },
            forEachInMemory: function (callback) {
                that.forEachNode(callback);
            },
            forEachNode: function (callback) {
                that.forEachNode(callback);
            },
            forEachNodeAfterFilter: function (callback) {
                console.warn('forEachNodeAfterFilter - does not work with virtual pagination');
            },
            forEachNodeAfterFilterAndSort: function (callback) {
                console.warn('forEachNodeAfterFilterAndSort - does not work with virtual pagination');
            }
        };
    };
    return VirtualPageRowController;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VirtualPageRowController;
