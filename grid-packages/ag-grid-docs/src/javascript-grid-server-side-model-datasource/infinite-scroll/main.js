var gridOptions = {
  columnDefs: [
    { field: 'athlete' },
    { field: 'country' },
    { field: 'year' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
  ],

  defaultColDef: {
    flex: 1,
    minWidth: 150
  },

  // use the server-side row model
  rowModelType: 'serverSide',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);

  agGrid
    .simpleHttpRequest({
      url:
        'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json',
    })
    .then(function(data) {
      var server = new FakeServer(data);
      var datasource = new ServerSideDatasource(server);
      gridOptions.api.setServerSideDatasource(datasource);
    });
});

function ServerSideDatasource(server) {
  return {
    getRows: function(params) {
      console.log('[Datasource] - rows requested by grid: ', params.request);

      // get data for request from our fake server
      var response = server.getData(params.request);

      // simulating real server call with a 500ms delay
      setTimeout(function () {
        if (response.success) {
          // supply rows for requested block to grid
          params.successCallback(response.rows, response.lastRow);
        } else {
          params.failCallback();
        }
      }, 500);
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
