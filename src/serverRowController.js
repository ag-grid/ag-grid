define([], function() {

    function ServerRowController() {
    }

    ServerRowController.prototype.init = function (rowRenderer) {
        this.rowRenderer = rowRenderer;
    };

    ServerRowController.prototype.setDatasource = function (datasource) {
        this.datasource = datasource;

        if (!datasource) {
            // only continue if we have a valid datasource to working with
            return;
        }

        this.reset();
    };

    ServerRowController.prototype.reset = function() {
        // see if datasource knows how many rows there are
        if (this.datasource.rowCount >= 0) {
            this.virtualRowCount = this.datasource.rowCount;
            this.foundMaxRow = true;
        } else {
            this.virtualRowCount = 0;
            this.foundMaxRow = false;
        }
        this.pages = {};
        // if a number is in this array, it means we are pending a load from it
        this.pageLoadAttempted = {};
        this.pageSize = this.datasource.pageSize; // take a copy of page size, we don't want it changing
        this.overflowSize = this.datasource.overflowSize; // take a copy of page size, we don't want it changing

        this.loadPage(0);
    };

    ServerRowController.prototype.createNodesFromRows = function(pageNumber, rows) {
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

    ServerRowController.prototype.pageLoaded = function(pageNumber, rows, more) {

        this.pages[pageNumber] = this.createNodesFromRows(pageNumber, rows);

        if (!this.foundMaxRow) {
            if (more) {
                var maxThisPage = ((pageNumber + 1) * this.pageSize);
                this.virtualRowCount = maxThisPage + this.overflowSize;
            } else {
                this.virtualRowCount = (pageNumber * this.pageSize) + rows.length;
                this.foundMaxRow = true;
            }
            // if rowCount changes, refreshView, otherwise just refreshAllVirtualRows
            this.rowRenderer.refreshView();
        } else {
            this.rowRenderer.refreshAllVirtualRows();
        }
    };

    ServerRowController.prototype.loadPage = function(pageNumber) {
        // if we already tried to load this page, then ignore the request,
        // otherwise server would be hit 50 times just to display one page, the
        // first row to find the page missing is enough.
        if (this.pageLoadAttempted[pageNumber]) {
            return;
        }
        this.pageLoadAttempted[pageNumber] = true;

        var startRow = pageNumber * this.pageSize;
        var endRow = (pageNumber + 1) * this.pageSize;

        var that = this;
        this.datasource.getRows(startRow, endRow,
            function success(rows, more) {
                that.pageLoaded(pageNumber, rows, more);
            },
            function fail() {
            }
        );
    };

    ServerRowController.prototype.getVirtualRow = function (rowIndex) {
        if (rowIndex > this.virtualRowCount) {
            return null;
        }

        var pageNumber = Math.floor(rowIndex / this.pageSize);
        var page = this.pages[pageNumber];

        if (!page) {
            this.loadPage(pageNumber);
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

    ServerRowController.prototype.getModel = function () {
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

    return ServerRowController;

});