var columnDefs = [
    {field: 'athlete'},
    {field: 'country'},
    {field: 'year'},
    {field: 'sport'},
    {field: 'gold'},
    {field: 'silver'},
    {field: 'bronze'}
];

var gridOptions = {
    columnDefs: columnDefs,

    defaultColDef: {
        flex: 1,
        minWidth: 150,
        sortable: true,
        resizable: true
    },

    // use the server-side row model
    rowModelType: 'serverSide',

    // fetch 100 rows at a time
    cacheBlockSize: 100,

    // only keep 10 blocks of rows
    maxBlocksInCache: 10,

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
            console.log('[Datasource] - rows requested: ', params.request);

            // get data for request from our fake server
            var response = server.getData(params.request);

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
