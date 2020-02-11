var columnDefs = [
    {headerName: "Country", field: "country", rowGroup: true, hide: true},
    {headerName: "Sport", field: "sport", rowGroup: true, hide: true},
    {headerName: "Gold", field: "gold", aggFunc: 'sum'},
    {headerName: "Silver", field: "silver", aggFunc: 'sum'},
    {headerName: "Bronze", field: "bronze", aggFunc: 'sum'}
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        resizable: true
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    rowModelType: 'serverSide',
    suppressAggFuncInHeader: true,
    animateRows: true,
    debug: true
};

function ServerSideDatasource(server) {
    return {
        getRows: function(params) {
            // adding delay to simulate real sever call
            setTimeout(function () {
                var response = server.getResponse(params.request);
                if (response.success) {
                    // call the success callback
                    params.successCallback(response.rows, response.lastRow);
                } else {
                    // inform the grid request failed
                    params.failCallback();
                }
            }, 200);
        }
    };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json'}).then(function (data) {
        var fakeServer = new FakeServer(data);
        var datasource = new ServerSideDatasource(fakeServer);
        gridOptions.api.setServerSideDatasource(datasource);
    });
});

