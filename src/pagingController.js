define([], function() {

    function PagingController(ePagingPanel, angularGrid) {
        this.angularGrid = angularGrid;
        this.populatePanel(ePagingPanel);
        this.callVersion = 0;
    }

    PagingController.prototype.setDataSource = function(dataSource) {
        this.dataSource = dataSource;

        this.totalPages = (dataSource.rowCount / dataSource.pageSize) + 1;
        this.lbTotal.innerHTML = this.totalPages;

        this.currentPage = 0;
        this.loadPage();
    };

    PagingController.prototype.loadPage = function() {
        var startRow = this.currentPage * this.dataSource.pageSize;
        var endRow = (this.currentPage + 1) * this.dataSource.pageSize;
        this.lbCurrent.innerHTML = (this.currentPage + 1);
        this.callVersion++;
        var callVersionCopy = this.callVersion;
        var that = this;
        this.angularGrid.showLoadingPanel(true);
        this.dataSource.getRows(startRow, endRow,
            function success(rows) {
                if (that.callVersion === callVersionCopy) {
                    that.angularGrid.onNewRows(rows);
                }
            },
            function fail() {
                if (that.callVersion === callVersionCopy) {
                    that.angularGrid.onNewRows([]);
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

    PagingController.prototype.populatePanel = function(ePagingPanel) {

        var html = '<button class="ag-paging-button" id="btPrevious">Previous</button>' +
            '<span id="current"></span>' +
            ' of ' +
            '<span id="total"></span>' +
            '<button class="ag-paging-button" id="btNext">Next</button>';

        ePagingPanel.innerHTML = html;

        this.btNext = ePagingPanel.querySelector('#btNext');
        this.btPrevious = ePagingPanel.querySelector('#btPrevious');
        this.lbCurrent = ePagingPanel.querySelector('#current');
        this.lbTotal = ePagingPanel.querySelector('#total');

        var that = this;
        this.btNext.addEventListener('click', function() {
            that.onBtNext();
        });
        this.btPrevious.addEventListener('click', function() {
            that.onBtPrevious();
        });
    };

    return PagingController;

});