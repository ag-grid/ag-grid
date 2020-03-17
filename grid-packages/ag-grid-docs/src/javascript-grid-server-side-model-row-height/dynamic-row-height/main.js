var gridOptions = {
    columnDefs: [
        { field: "country", rowGroup: true, hide: true },
        { field: "year", rowGroup: true, hide: true },
        { field: "gold", aggFunc: 'sum' },
        { field: "silver", aggFunc: 'sum' },
        { field: "bronze", aggFunc: 'sum' }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
        sortable: true
    },
    autoGroupColumnDef: {
        flex: 1,
        minWidth: 180,
    },
    // use the server-side row model
    rowModelType: 'serverSide',

    // dynamically set row heights
    getRowHeight: function(params) {
        if (params.node.level === 0) {
            return 80;
        }
        if (params.node.level === 1) {
            return 60;
        }
        return 40;
    },

    animateRows: true,
    suppressAggFuncInHeader: true,
    // debug: true,
};

function ServerSideDatasource(server) {
    return {
        getRows: function(params) {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            var response = server.getData(params.request);

            // adding delay to simulate real sever call
            setTimeout(function () {
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

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json'}).then(function (data) {
        // setup the fake server with entire dataset
        var fakeServer = new FakeServer(data);

        // create datasource with a reference to the fake server
        var datasource = new ServerSideDatasource(fakeServer);

        // register the datasource with the grid
        gridOptions.api.setServerSideDatasource(datasource);
    });
});

