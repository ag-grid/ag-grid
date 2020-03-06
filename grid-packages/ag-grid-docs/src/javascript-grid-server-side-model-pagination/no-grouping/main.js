var columnDefs = [
    {field: 'id'},
    {field: 'athlete', width: 150},
    {field: 'age'},
    {field: 'country'},
    {field: 'year'},
    {field: 'sport'},
    {field: 'gold'},
    {field: 'silver'},
    {field: 'bronze'}
];

var gridOptions = {
    defaultColDef: {
        width: 120,
        resizable: true
    },
    columnDefs: columnDefs,

    // use the server-side row model
    rowModelType: 'serverSide',

    // enable pagination
    pagination: true,

    // fetch 10 rows per at a time (default is 100)
    cacheBlockSize: 10,

    paginationPageSize: 10,

    animateRows: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json'}).then(function(data) {
        // add id to data
        var idSequence = 0;
        data.forEach( function(item) {
          item.id = idSequence++;
        });

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
