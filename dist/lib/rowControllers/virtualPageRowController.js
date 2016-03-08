/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var utils_1 = require('../utils');
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var rowNode_1 = require("../entities/rowNode");
var context_1 = require("../context/context");
var eventService_1 = require("../eventService");
var selectionController_1 = require("../selectionController");
var context_2 = require("../context/context");
var context_3 = require("../context/context");
var events_1 = require("../events");
var sortController_1 = require("../sortController");
var filterManager_1 = require("../filter/filterManager");
/*
* This row controller is used for infinite scrolling only. For normal 'in memory' table,
* or standard pagination, the inMemoryRowController is used.
*/
var logging = false;
var VirtualPageRowController = (function () {
    function VirtualPageRowController() {
        this.datasourceVersion = 0;
    }
    VirtualPageRowController.prototype.init = function () {
        var _this = this;
        var virtualEnabled = this.gridOptionsWrapper.isRowModelVirtual();
        this.eventService.addEventListener(events_1.Events.EVENT_FILTER_CHANGED, function () {
            if (virtualEnabled && _this.gridOptionsWrapper.isEnableServerSideFilter()) {
                _this.reset();
            }
        });
        this.eventService.addEventListener(events_1.Events.EVENT_SORT_CHANGED, function () {
            if (virtualEnabled && _this.gridOptionsWrapper.isEnableServerSideSorting()) {
                _this.reset();
            }
        });
        if (virtualEnabled && this.gridOptionsWrapper.getDatasource()) {
            this.setDatasource(this.gridOptionsWrapper.getDatasource());
        }
    };
    VirtualPageRowController.prototype.getTopLevelNodes = function () {
        return null;
    };
    VirtualPageRowController.prototype.setDatasource = function (datasource) {
        this.datasource = datasource;
        if (!datasource) {
            // only continue if we have a valid datasource to working with
            return;
        }
        this.reset();
    };
    VirtualPageRowController.prototype.isEmpty = function () {
        return !this.datasource;
    };
    VirtualPageRowController.prototype.isRowsToRender = function () {
        return utils_1.Utils.exists(this.datasource);
    };
    VirtualPageRowController.prototype.reset = function () {
        this.selectionController.reset();
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
        this.rowRenderer.refreshView();
    };
    VirtualPageRowController.prototype.createNodesFromRows = function (pageNumber, rows) {
        var nodes = [];
        if (rows) {
            for (var i = 0, j = rows.length; i < j; i++) {
                var virtualRowIndex = (pageNumber * this.pageSize) + i;
                var node = this.createNode(rows[i], virtualRowIndex, true);
                nodes.push(node);
            }
        }
        return nodes;
    };
    VirtualPageRowController.prototype.createNode = function (data, virtualRowIndex, realNode) {
        var rowHeight = this.getRowHeightAsNumber();
        var top = rowHeight * virtualRowIndex;
        var rowNode;
        if (realNode) {
            // if a real node, then always create a new one
            rowNode = new rowNode_1.RowNode(this.eventService, this.gridOptionsWrapper, this.selectionController);
            rowNode.id = virtualRowIndex;
            rowNode.data = data;
            // and see if the previous one was selected, and if yes, swap it out
            this.selectionController.syncInRowNode(rowNode);
        }
        else {
            // if creating a proxy node, see if there is a copy in selected memory that we can use
            var rowNode = this.selectionController.getNodeForIdIfSelected(virtualRowIndex);
            if (!rowNode) {
                rowNode = new rowNode_1.RowNode(this.eventService, this.gridOptionsWrapper, this.selectionController);
                rowNode.id = virtualRowIndex;
                rowNode.data = data;
            }
        }
        rowNode.rowTop = top;
        rowNode.rowHeight = rowHeight;
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
            sortModel = this.sortController.getSortModel();
        }
        var filterModel;
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
        var getRowsParams = utils_1.Utils.getFunctionParameters(this.datasource.getRows);
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
    VirtualPageRowController.prototype.expandOrCollapseAll = function (expand) {
        console.warn('ag-Grid: can not expand or collapse all when doing virtual pagination');
    };
    // check that the datasource has not changed since the lats time we did a request
    VirtualPageRowController.prototype.requestIsDaemon = function (datasourceVersionCopy) {
        return this.datasourceVersion !== datasourceVersionCopy;
    };
    VirtualPageRowController.prototype.getRow = function (rowIndex) {
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
        var rowHeight = this.gridOptionsWrapper.getRowHeightForVirtualPagination();
        if (typeof rowHeight === 'number') {
            return rowHeight;
        }
        else {
            console.warn('ag-Grid row height must be a number when doing virtual paging');
            return 25;
        }
    };
    VirtualPageRowController.prototype.getRowCombinedHeight = function () {
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
    VirtualPageRowController.prototype.getRowCount = function () {
        return this.virtualRowCount;
    };
    VirtualPageRowController.prototype.setRowData = function (rows, refresh, firstId) {
        console.warn('setRowData - does not work with virtual pagination');
    };
    VirtualPageRowController.prototype.forEachNodeAfterFilter = function (callback) {
        console.warn('forEachNodeAfterFilter - does not work with virtual pagination');
    };
    VirtualPageRowController.prototype.forEachNodeAfterFilterAndSort = function (callback) {
        console.warn('forEachNodeAfterFilter - does not work with virtual pagination');
    };
    VirtualPageRowController.prototype.refreshModel = function () {
        console.warn('forEachNodeAfterFilter - does not work with virtual pagination');
    };
    __decorate([
        context_2.Autowired('rowRenderer'), 
        __metadata('design:type', Object)
    ], VirtualPageRowController.prototype, "rowRenderer", void 0);
    __decorate([
        context_2.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], VirtualPageRowController.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_2.Autowired('filterManager'), 
        __metadata('design:type', filterManager_1.FilterManager)
    ], VirtualPageRowController.prototype, "filterManager", void 0);
    __decorate([
        context_2.Autowired('sortController'), 
        __metadata('design:type', sortController_1.SortController)
    ], VirtualPageRowController.prototype, "sortController", void 0);
    __decorate([
        context_2.Autowired('selectionController'), 
        __metadata('design:type', selectionController_1.SelectionController)
    ], VirtualPageRowController.prototype, "selectionController", void 0);
    __decorate([
        context_2.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], VirtualPageRowController.prototype, "eventService", void 0);
    __decorate([
        context_3.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], VirtualPageRowController.prototype, "init", null);
    VirtualPageRowController = __decorate([
        context_1.Bean('rowModel'), 
        __metadata('design:paramtypes', [])
    ], VirtualPageRowController);
    return VirtualPageRowController;
})();
exports.VirtualPageRowController = VirtualPageRowController;
