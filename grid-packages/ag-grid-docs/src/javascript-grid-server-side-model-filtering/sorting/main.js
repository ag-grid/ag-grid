var columnDefs = [
    { field: 'athlete', menuTabs: false },
    {
      field: 'country',
      filter: 'agSetColumnFilter',
      filterParams: {
        newRowsAction: 'keep',
        values: ['United States', 'Russia']
      },
      menuTabs: ['filterMenuTab']
    },
    { field: 'year', filter: 'agNumberColumnFilter'},
    { field: 'gold', aggFunc: 'sum'},
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        sortable: true,
        enableRowGroup: true
    },
    rowModelType: 'serverSide',
    animateRows: true
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json' })
        .then(function (data) {
                var fakeServer = new FakeServer(data);
                var datasource = new ServerSideDatasource(fakeServer);
                gridOptions.api.setServerSideDatasource(datasource);
            }
        );
});

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
