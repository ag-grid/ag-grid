define([], function() {

    var TEMPLATE =
        '<span id="pageRowSummaryPanel" class="ag-paging-row-summary-panel">' +
        '<span id="firstRowOnPage"></span>' +
        ' to ' +
        '<span id="lastRowOnPage"></span>' +
        ' of ' +
        '<span id="recordCount"></span>' +
        '</span>' +
        '<span clas="ag-paging-page-summary-panel">' +
        '<button class="ag-paging-button" id="btFirst">First</button>' +
        '<button class="ag-paging-button" id="btPrevious">Previous</button>' +
        ' Page ' +
        '<span id="current"></span>' +
        ' of ' +
        '<span id="total"></span>' +
        '<button class="ag-paging-button" id="btNext">Next</button>' +
        '<button class="ag-paging-button" id="btLast">Last</button>' +
        '</span>';

    function PagingController() {
    }

    PagingController.prototype.init = function (ePagingPanel, angularGrid) {
        this.angularGrid = angularGrid;
        this.populatePanel(ePagingPanel);
        this.callVersion = 0;
    };

    PagingController.prototype.setDatasource = function(datasource) {
        this.datasource = datasource;

        if (!datasource) {
            // only continue if we have a valid datasource to work with
            return;
        }

        this.reset();
    };

    PagingController.prototype.reset = function() {
        // copy pageSize, to guard against it changing the the datasource between calls
        this.pageSize = this.datasource.pageSize;
        // see if we know the total number of pages, or if it's 'to be decided'
        if (this.datasource.rowCount >= 0) {
            this.rowCount = this.datasource.rowCount;
            this.foundMaxRow = true;
            this.calculateTotalPages();
        } else {
            this.rowCount = 0;
            this.foundMaxRow = false;
            this.totalPages = null;
        }

        this.currentPage = 0;

        // hide the summary panel until something is loaded
        this.ePageRowSummaryPanel.style.visibility = 'hidden';

        this.setTotalLabels();
        this.loadPage();
    };

    PagingController.prototype.setTotalLabels = function() {
        if (this.foundMaxRow) {
            this.lbTotal.innerHTML = this.totalPages.toLocaleString();
            this.lbRecordCount.innerHTML = this.rowCount.toLocaleString();
        } else {
            this.lbTotal.innerHTML = 'more';
            this.lbRecordCount.innerHTML = 'more';
        }
    };

    PagingController.prototype.calculateTotalPages = function() {
        this.totalPages = Math.floor( (this.rowCount-1) / this.pageSize) + 1;
    };

    PagingController.prototype.pageLoaded = function(rows, lastRowIndex) {
        var firstId = this.currentPage * this.pageSize;
        this.angularGrid.setRows(rows, firstId);
        // see if we hit the last row
        if (!this.foundMaxRow && typeof lastRowIndex === 'number' && lastRowIndex >= 0) {
            this.foundMaxRow = true;
            this.rowCount = lastRowIndex;
            this.calculateTotalPages();
            this.setTotalLabels();

            // if overshot pages, go back
            if (this.currentPage > this.totalPages) {
                this.currentPage = this.totalPages - 1;
                this.loadPage();
            }
        }
        this.enableOrDisableButtons();
        this.updateRowLabels();
    };

    PagingController.prototype.updateRowLabels = function() {
        var startRow = (this.pageSize * this.currentPage) + 1;
        var endRow = startRow + this.pageSize - 1;
        if (this.foundMaxRow && endRow > this.rowCount) {
            endRow = this.rowCount;
        }
        this.lbFirstRowOnPage.innerHTML = (startRow).toLocaleString();
        this.lbLastRowOnPage.innerHTML = (endRow).toLocaleString();

        // show the summary panel, when first shown, this is blank
        this.ePageRowSummaryPanel.style.visibility = null;
    };

    PagingController.prototype.loadPage = function() {
        this.enableOrDisableButtons();
        var startRow = this.currentPage * this.datasource.pageSize;
        var endRow = (this.currentPage + 1) * this.datasource.pageSize;

        this.lbCurrent.innerHTML = (this.currentPage + 1).toLocaleString();

        this.callVersion++;
        var callVersionCopy = this.callVersion;
        var that = this;
        this.angularGrid.showLoadingPanel(true);
        this.datasource.getRows(startRow, endRow,
            function success(rows, lastRowIndex) {
                if (that.callVersion === callVersionCopy) {
                    that.pageLoaded(rows, lastRowIndex);
                }
            },
            function fail() {
                if (that.callVersion === callVersionCopy) {
                    // set in an empty set of rows, this will at
                    // least get rid of the loading panel, and
                    // stop blocking things
                    that.angularGrid.setRows([]);
                }
            }
        );
    };

    PagingController.prototype.onBtNext = function() {
        this.currentPage++;
        this.loadPage();
    };

    PagingController.prototype.onBtPrevious = function() {
        this.currentPage--;
        this.loadPage();
    };

    PagingController.prototype.onBtFirst = function() {
        this.currentPage = 0;
        this.loadPage();
    };

    PagingController.prototype.onBtLast = function() {
        this.currentPage = this.totalPages - 1;
        this.loadPage();
    };

    PagingController.prototype.enableOrDisableButtons = function() {
        var onFirstPage = this.currentPage === 0;
        this.btPrevious.disabled = onFirstPage;
        this.btFirst.disabled = onFirstPage;

        var onLastPage = this.foundMaxRow && this.currentPage === (this.totalPages-1);
        this.btNext.disabled = onLastPage;
        this.btLast.disabled = onLastPage;
    };

    PagingController.prototype.populatePanel = function(ePagingPanel) {

        ePagingPanel.innerHTML = TEMPLATE;

        this.btNext = ePagingPanel.querySelector('#btNext');
        this.btPrevious = ePagingPanel.querySelector('#btPrevious');
        this.btFirst = ePagingPanel.querySelector('#btFirst');
        this.btLast = ePagingPanel.querySelector('#btLast');
        this.lbCurrent = ePagingPanel.querySelector('#current');
        this.lbTotal = ePagingPanel.querySelector('#total');

        this.lbRecordCount = ePagingPanel.querySelector('#recordCount');
        this.lbFirstRowOnPage = ePagingPanel.querySelector('#firstRowOnPage');
        this.lbLastRowOnPage = ePagingPanel.querySelector('#lastRowOnPage');
        this.ePageRowSummaryPanel = ePagingPanel.querySelector('#pageRowSummaryPanel');

        var that = this;

        this.btNext.addEventListener('click', function() {
            that.onBtNext();
        });

        this.btPrevious.addEventListener('click', function() {
            that.onBtPrevious();
        });

        this.btFirst.addEventListener('click', function() {
            that.onBtFirst();
        });

        this.btLast.addEventListener('click', function() {
            that.onBtLast();
        });
    };

    return PagingController;

});
