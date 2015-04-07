define([], function() {

    var TEMPLATE =
        '<span class="ag-paging-row-summary-panel">' +
        '<span id="recordCount"></span>' +
        ' records, showing ' +
        '<span id="firstRowOnPage"></span>' +
        ' to ' +
        '<span id="lastRowOnPage"></span>' +
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

    function PagingController(ePagingPanel, angularGrid) {
        this.angularGrid = angularGrid;
        this.populatePanel(ePagingPanel);
        this.callVersion = 0;
    }

    PagingController.prototype.setDataSource = function(dataSource) {
        this.dataSource = dataSource;

        this.totalPages = Math.floor( (dataSource.rowCount-1) / dataSource.pageSize) + 1;
        this.lbTotal.innerHTML = this.totalPages.toLocaleString();
        this.lbRecordCount.innerHTML = dataSource.rowCount.toLocaleString();

        this.currentPage = 0;
        this.loadPage();
    };

    PagingController.prototype.loadPage = function() {
        this.enableOrDisableButtons();
        var startRow = this.currentPage * this.dataSource.pageSize;
        var endRow = (this.currentPage + 1) * this.dataSource.pageSize;

        this.lbCurrent.innerHTML = (this.currentPage + 1).toLocaleString();
        this.lbFirstRowOnPage.innerHTML = (startRow + 1).toLocaleString();
        this.lbLastRowOnPage.innerHTML = ((endRow > this.dataSource.rowCount) ? this.dataSource.rowCount : endRow).toLocaleString();

        this.callVersion++;
        var callVersionCopy = this.callVersion;
        var that = this;
        this.angularGrid.showLoadingPanel(true);
        this.dataSource.getRows(startRow, endRow,
            function success(rows) {
                if (that.callVersion === callVersionCopy) {
                    that.angularGrid.setRows(rows);
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

        var onLastPage = this.currentPage === (this.totalPages-1);
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
