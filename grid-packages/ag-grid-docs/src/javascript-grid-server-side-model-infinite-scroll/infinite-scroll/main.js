var columnDefs = [
  { field: 'id', maxWidth: 80 },
  { field: 'athlete' },
  { field: 'country' },
  { field: 'year' },
  { field: 'sport' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
];

var gridOptions = {
  columnDefs: columnDefs,

  defaultColDef: {
    flex: 1,
    minWidth: 150,
    resizable: true,
  },

  // use the server-side row model
  rowModelType: 'serverSide',

  // fetch 100 rows at a time
  cacheBlockSize: 100,

  // only keep 10 blocks of rows
  maxBlocksInCache: 10,

  animateRows: true,

  // debug: true,
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
      // add id to data
      var idSequence = 0;
      data.forEach(function(item) {
        item.id = idSequence++;
      });

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

      // if on or after the last block, work out the last row.
      var lastRow = allData.length <= request.endRow ? data.length : -1;

      // Note: if the row count is known you can quickly skip over blocks
      // var lastRow = allData.length;

      return {
        success: true,
        rows: rowsForBlock,
        lastRow: lastRow,
      };
    },
  };
}
