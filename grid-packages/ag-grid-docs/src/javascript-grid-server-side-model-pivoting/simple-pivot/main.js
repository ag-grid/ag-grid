var gridOptions = {
    columnDefs: [
        { field: "country", rowGroup: true },
        { field: "year", pivot: true }, // pivot on 'year'
        { field: "total", aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 4,
        minWidth: 100,
        resizable: true
    },
    autoGroupColumnDef: {
        flex: 5,
        minWidth: 200,
    },

    // use the server-side row model
    rowModelType: 'serverSide',

    // enable pivoting
    pivotMode: true,

    animateRows: true,
    // debug: true
};

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

function ServerSideDatasource(server) {
    return {
        getRows: function(params) {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            // get data for request from our fake server
            var response = server.getData(params.request);

            // add pivot colDefs in the grid based on the resulting data
            addPivotColDefs(response, params.columnApi);

            // simulating real server call with a 500ms delay
            setTimeout(function () {
                if (response.success) {
                    // supply data to grid
                    params.successCallback(response.rows, response.lastRow);
                } else {
                    params.failCallback();
                }
            }, 500);
        }
    };
}

function addPivotColDefs(response, columnApi) {
    // check if pivot colDefs already exist
    var existingPivotColDefs = columnApi.getSecondaryColumns();
    if (existingPivotColDefs && existingPivotColDefs.length > 0) {
        return;
    }

    // create colDefs
    var pivotColDefs = response.pivotFields.map(function(field) {
        var headerName = field.split('_')[0];
        return {headerName: headerName, field: field};
    });

    // supply secondary columns to the grid
    columnApi.setSecondaryColumns(pivotColDefs);
}
