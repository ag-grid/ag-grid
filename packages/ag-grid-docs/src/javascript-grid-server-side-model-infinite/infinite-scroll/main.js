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
        suppressFilter: true
    },
    columnDefs: columnDefs,

    // use the server-side row model
    rowModelType: 'serverSide',

    // fetch 100 rows per at a time
    cacheBlockSize: 100,

    // only keep 10 blocks of rows
    maxBlocksInCache: 10,

    enableColResize: true,
    animateRows: true,
    debug: true
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json'}).then(function(data) {
        // add id to data
        var idSequence = 0;
        data.forEach( function(item) {
          item.id = idSequence++;
        });

        var server = new FakeServer(data);
        var datasource = new ServerSideDatasource(server);
        gridOptions.api.setServerSideDatasource(datasource);
    });
});

function ServerSideDatasource(server) {
  return {
    getRows(params) {
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

      }, 500);
    }
  };
}

function FakeServer(allData) {
  return {
    getResponse(request) {
      console.log('asking for rows: ' + request.startRow + ' to ' + request.endRow);

      // take a slice of the total rows
      var rowsThisPage = allData.slice(request.startRow, request.endRow);

      // if on or after the last page, work out the last row.
      var lastRow = allData.length <= request.endRow ? data.length : -1;

      return {
        success: true,
        rows: rowsThisPage,
        lastRow: lastRow
      };
    }
  };
}