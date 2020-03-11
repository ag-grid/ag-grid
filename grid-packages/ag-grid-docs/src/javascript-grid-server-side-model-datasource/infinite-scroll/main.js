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

  // use the server-side row model instead of the default 'client-side'
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
      // setup the fake server with entire dataset
      var fakeServer = createFakeServer(data);

      // create datasource with a reference to the fake server
      var datasource = createServerSideDatasource(fakeServer);

      // register the datasource with the grid
      gridOptions.api.setServerSideDatasource(datasource);
    });
});

function createServerSideDatasource(server) {
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

function createFakeServer(allData) {
  return {
    getData: function(request) {
      // in this simplified fake server all rows are contained in an array
      var requestedRows = allData.slice(request.startRow, request.endRow);

      // here we are pretending we don't know the last row until we reach it!
      var lastRow = getLastRowIndex(request, requestedRows);

      return {
        success: true,
        rows: requestedRows,
        lastRow: lastRow,
      };
    },
  };
}

function getLastRowIndex(request, results) {
  if (!results) return undefined;
  var currentLastRow = request.startRow + results.length;

  // if on or after the last block, work out the last row, otherwise return 'undefined'
  return currentLastRow < request.endRow ? currentLastRow : undefined;
}
