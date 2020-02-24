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

        //TODO - left here at it reveals a defect
        var dataMod = data.slice(0,25);
        console.log(dataMod.length);

        // setup the fake server with entire dataset
        var fakeServer = new FakeServer(dataMod);

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

function FakeServer(allData) {
    return {
        getData: function(request) {
            // take a slice of the total rows for requested block
            var rowsForBlock = allData.slice(request.startRow, request.endRow);

            // if on or after the last block, work out the last row, otherwise return -1
            var lastRow = getLastRowIndex(request, rowsForBlock);

            return {
                success: true,
                rows: rowsForBlock,
                lastRow: lastRow,
            };
        },
    };
}

function getLastRowIndex(request, results) {
    if (!results || results.length === 0) return -1;
    var currentLastRow = request.startRow + results.length + 1;
    return currentLastRow <= request.endRow ? currentLastRow : -1;
}
