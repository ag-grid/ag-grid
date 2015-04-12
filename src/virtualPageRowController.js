/*
* This row controller is used for infinite scrolling only. For normal 'in memory' table,
* or standard pagination, the inMemoryRowController is used.
*/
define([], function() {

    var logging = false;

    function VirtualPageRowController() {
    }

    VirtualPageRowController.prototype.init = function (rowRenderer) {
        this.rowRenderer = rowRenderer;
        this.datasourceVersion = 0;
    };

    VirtualPageRowController.prototype.setDatasource = function (datasource) {
        this.datasource = datasource;

        if (!datasource) {
            // only continue if we have a valid datasource to working with
            return;
        }

        this.reset();
    };

    VirtualPageRowController.prototype.reset = function() {
        // see if datasource knows how many rows there are
        if (this.datasource.rowCount >= 0) {
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

        // if a number is in this array, it means we are pending a load from it
        this.pageLoadsInProgress = [];
        this.pageLoadsQueued = [];

        // the number of concurrent loads we are allowed to the server
        if (typeof this.datasource.maxConcurrentRequests === 'number' && this.datasource.maxConcurrentRequests > 0) {
            this.maxConcurrentDatasourceRequests = this.datasource.maxConcurrentRequests;
        } else {
            this.maxConcurrentDatasourceRequests = 2;
        }

        this.pageSize = this.datasource.pageSize; // take a copy of page size, we don't want it changing
        this.overflowSize = this.datasource.overflowSize; // take a copy of page size, we don't want it changing

        this.doLoadOrQueue(0);
    };

    VirtualPageRowController.prototype.createNodesFromRows = function(pageNumber, rows) {
        var nodes = [];
        if (rows) {
            for (var i = 0, j = rows.length; i<j; i++) {
                var virtualRowIndex = (pageNumber * this.pageSize) + i;
                nodes.push({
                    data: rows[i],
                    id: virtualRowIndex
                });
            }
        }
        return nodes;
    };

    VirtualPageRowController.prototype.removeFromLoading = function(pageNumber) {
        var index = this.pageLoadsInProgress.indexOf(pageNumber);
        this.pageLoadsInProgress.splice(index, 1);
    };

    VirtualPageRowController.prototype.pageLoadFailed = function(pageNumber) {
        this.removeFromLoading(pageNumber);
        this.checkQueueForNextLoad();
    };

    VirtualPageRowController.prototype.pageLoaded = function(pageNumber, rows, lastRow) {

        this.pageCache[pageNumber] = this.createNodesFromRows(pageNumber, rows);

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

        this.removeFromLoading(pageNumber);
        this.checkQueueForNextLoad();
    };

    VirtualPageRowController.prototype.isPageAlreadyLoading = function(pageNumber) {
        var result = this.pageLoadsInProgress.indexOf(pageNumber) >= 0
            || this.pageLoadsQueued.indexOf(pageNumber) >= 0;
        return result;
    };

    VirtualPageRowController.prototype.doLoadOrQueue = function(pageNumber) {
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
            if (logging) { console.log('queueing ' + pageNumber + ' - ' + this.pageLoadsQueued); }
            // otherwise, queue the request
            this.pageLoadsQueued.push(pageNumber);
            // if cache size limited, purge the queue
        }
    };

    VirtualPageRowController.prototype.checkQueueForNextLoad = function () {
        if (this.pageLoadsQueued.length>0) {
            // take from the front of the queue
            var pageToLoad = this.pageLoadsQueued[0];
            this.pageLoadsQueued.splice(0, 1);

            if (logging) { console.log('dequeueing ' + pageToLoad + ' - ' + this.pageLoadsQueued); }

            this.loadPage(pageToLoad);
        }
    };

    VirtualPageRowController.prototype.loadPage = function(pageNumber) {

        this.pageLoadsInProgress.push(pageNumber);

        var startRow = pageNumber * this.pageSize;
        var endRow = (pageNumber + 1) * this.pageSize;

        var that = this;
        var datasourceVersionCopy = this.datasourceVersion;

        this.datasource.getRows(startRow, endRow,
            function success(rows, lastRow) {
                if (that.requestIsDaemon(datasourceVersionCopy)) { return; }
                that.pageLoaded(pageNumber, rows, lastRow);
            },
            function fail() {
                if (that.requestIsDaemon(datasourceVersionCopy)) { return; }
                that.pageLoadFailed(pageNumber);
            }
        );
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

        if (!page) {
            this.doLoadOrQueue(pageNumber);
            // return back an empty row, so table can at least render empty cells
            return {
                data: {},
                id: rowIndex
            };
        } else {
            var indexInThisPage = rowIndex % this.pageSize;
            return page[indexInThisPage];
        }
    };

    VirtualPageRowController.prototype.getModel = function () {
        var that = this;
        return {
            getVirtualRow: function(index) {
                return that.getVirtualRow(index);
            },
            getVirtualRowCount: function() {
                return that.virtualRowCount;
            }
        };
    };

    return VirtualPageRowController;

});