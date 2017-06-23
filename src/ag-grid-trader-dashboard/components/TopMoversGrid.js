function TopMoversGrid() {
}

TopMoversGrid.prototype.init = function (fxDataService) {
    this.fxDataService = fxDataService;

    this.gridOptions = {
        onGridReady: this.onGridReady.bind(this),
        getRowNodeId: this.getRowNodeId,
        enableFilter:false,
        enableSorting:true,
        animateRows:true,
        enableRangeSelection: true,
        deltaRowDataMode:true,
        rowData: fxDataService.getCurrentFxTopMovers(),
        columnDefs: [
            {
                field: 'symbol',
                headerName: 'Symbol'
            },
            {
                field: 'last',
                headerName: 'Last',
                headerClass: 'align-right',
                cellRenderer: 'animateShowChange',
                cellClass: 'align-right'
            },
            {
                field: 'net',
                headerName: 'Net',
                headerClass: 'align-right',
                cellRenderer: 'animateShowChange',
                cellClass: 'align-right'
            },
            {
                field: 'pct_net_change',
                headerName: '% NC',
                headerClass: 'align-right',
                cellRenderer: 'animateShowChange',
                cellClass: 'align-right',
                sort: 'desc',
                valueFormatter(params) {
                    return params.value.toFixed(2)
                }
            },
        ]
    };
};

TopMoversGrid.prototype.getRowNodeId = function (data) {
    return data.symbol;
};

TopMoversGrid.prototype.onGridReady = function (params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.gridApi.sizeColumnsToFit();
};

TopMoversGrid.prototype.update = function (newRowData) {
    if (!this.gridApi) {
        return;
    }

    this.gridApi.setRowData(newRowData);
};

TopMoversGrid.prototype.render = function (id) {
    // lookup the container we want the Grid to use
    let eGridDiv = document.querySelector(`#${id}`);

    // create the grid passing in the div to use together with the columns & data we want to use
    new agGrid.Grid(eGridDiv, this.gridOptions);
};
