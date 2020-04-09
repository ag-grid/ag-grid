var gridOptions = {
    columnDefs: [
        { field: "year", rowGroup: true, hide: true },
        { field: 'athlete', hide: true },
        { field: "sport", checkboxSelection: true },
        { field: "gold", aggFunc: 'sum' },
        { field: "silver", aggFunc: 'sum' },
        { field: "bronze", aggFunc: 'sum' }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 120,
        resizable: true,
        sortable: true
    },
    autoGroupColumnDef: {
        field: "athlete",
        flex: 1,
        minWidth: 240,
        // headerCheckboxSelection: true, // not supported for Enterprise Model
        cellRendererParams: {
            checkbox: true,
        },
    },

    // use the server-side row model
    rowModelType: 'serverSide',

    // allow multiple row selections
    rowSelection: 'multiple',

    // restrict selections to leaf rows
    isRowSelectable: function(rowNode) {
        return !rowNode.group;
    },

    // restrict row selections via checkbox selection
    suppressRowClickSelection: true,

    // groupSelectsChildren: true, // not supported for Server Side Row Model

    animateRows: true,
    suppressAggFuncInHeader: true,
    // debug: true,
};

function ServerSideDatasource(server) {
    return {
        getRows: function(params) {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            var response = server.getData(params.request);

            // adding delay to simulate real server call
            setTimeout(function() {
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
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' }).then(function(data) {
        // setup the fake server with entire dataset
        var fakeServer = new FakeServer(data);

        // create datasource with a reference to the fake server
        var datasource = new ServerSideDatasource(fakeServer);

        // register the datasource with the grid
        gridOptions.api.setServerSideDatasource(datasource);
    });
});

