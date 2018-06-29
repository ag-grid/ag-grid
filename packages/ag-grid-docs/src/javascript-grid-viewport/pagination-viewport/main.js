var columnDefs = [
    // this col shows the row index, doesn't use any data from the row
    {
        headerName: '#',
        width: 50,
        cellRenderer: function(params) {
            return '' + params.rowIndex;
        }
    },
    {headerName: 'Code', field: 'code', width: 70},
    {headerName: 'Name', field: 'name', width: 300},
    {
        headerName: 'Bid',
        field: 'bid',
        width: 100,
        cellClass: 'cell-number',
        valueFormatter: numberFormatter,
        cellRenderer:'agAnimateShowChangeCellRenderer'
    },
    {
        headerName: 'Mid',
        field: 'mid',
        width: 100,
        cellClass: 'cell-number',
        valueFormatter: numberFormatter,
        cellRenderer:'agAnimateShowChangeCellRenderer'
    },
    {
        headerName: 'Ask',
        field: 'ask',
        width: 100,
        cellClass: 'cell-number',
        valueFormatter: numberFormatter,
        cellRenderer:'agAnimateShowChangeCellRenderer'
    },
    {
        headerName: 'Volume',
        field: 'volume',
        width: 80,
        cellClass: 'cell-number',
        cellRenderer:'agAnimateSlideCellRenderer'
    }
];

var gridOptions = {
    enableRangeSelection: true,
    enableColResize: true,
    debug: true,
    columnDefs: columnDefs,
    rowModelType: 'viewport',
    pagination: true,
    paginationAutoPageSize: true,
    viewportRowModelPageSize: 1,
    viewportRowModelBufferSize: 0,
    // implement this so that we can do selection
    getRowNodeId: function(data) {
        // the code is unique, so perfect for the id
        return data.code;
    }
};

function numberFormatter(params) {
    if (typeof params.value === 'number') {
        return params.value.toFixed(2);
    } else {
        return params.value;
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://rawgit.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/stocks.json'}).then(function(data) {
        // set up a mock server - real code will not do this, it will contact your
        // real server to get what it needs
        var mockServer = new MockServer();
        mockServer.init(data);

        var viewportDatasource = new ViewportDatasource(mockServer);
        gridOptions.api.setViewportDatasource(viewportDatasource);
        // put the 'size cols to fit' into a timeout, so that the scroll is taken into consideration
        setTimeout(function() {
            gridOptions.api.sizeColumnsToFit();
        }, 100);
    });
});