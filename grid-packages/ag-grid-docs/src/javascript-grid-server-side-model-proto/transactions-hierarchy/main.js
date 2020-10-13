var fakeServer = new FakeServer();

var columnDefs = [
  // keys
  { field: 'productName', rowGroup: true, hide: true },
  { field: 'portfolioName', rowGroup: true, hide: true },
  { field: 'bookId', rowGroup: true, hide: true },

  // {field: 'productId'},
  // {field: 'portfolioId'},
  // {field: 'bookId'},

  // all the other columns (visible and not grouped)
  {headerName: 'Current', field: 'current', width: 200, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
  {headerName: 'Previous', field: 'previous', width: 200, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
  {headerName: 'Deal Type', field: 'dealType'},
  {headerName: 'Bid', field: 'bidFlag', width: 100 },
  {headerName: 'PL 1', field: 'pl1', width: 200, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
  {headerName: 'PL 2', field: 'pl2', width: 200, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
  {headerName: 'Gain-DX', field: 'gainDx', width: 200, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
  {headerName: 'SX / PX', field: 'sxPx', width: 200, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
  {headerName: '99 Out', field: '_99Out', width: 200, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
  {headerName: 'Submitter ID', field: 'submitterID', width: 200, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
  {headerName: 'Submitted Deal ID', field: 'submitterDealID', width: 200, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'}
];

var gridOptions = {
  defaultColDef: {
    width: 250,
    resizable: true
  },
  autoGroupColumnDef: {
    field: 'tradeId'
  },
  getRowNodeId: function(data) {
    if (data.tradeId) {
      return data.tradeId;
    } else if (data.bookId) {
      return data.bookId;
    } else if (data.portfolioId) {
      return data.portfolioId;
    } else if (data.productId) {
      return data.productId;
    }
  },
  rowBuffer: 0,
  rowSelection: 'multiple',
  columnDefs: columnDefs,
  // use the enterprise row model
  rowModelType: 'serverSide',
  // cacheBlockSize: 100,
  animateRows: true
};

function numberCellFormatter(params) {
  return Math.floor(params.value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function onBtStart() {
  fakeServer.startUpdates();
}

function onBtStop() {
  fakeServer.stopUpdates();
}

function processUpdateFromFakeServer(transactions) {
  transactions.forEach(function(tx) {
    gridOptions.api.applyServerSideTransactionAsync(tx, function(res) {
      // console.log('Route [' + tx.route.join(',') + '], found = ' + res.routeFound);
    });
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);

  agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' }).then(function(data) {

    var dataSource = {
      getRows: function(params) {
        fakeServer.getData(params.request, params.parentNode.data, function(result) {
          params.successCallback(result);
        });
      }
    };

    gridOptions.api.setServerSideDatasource(dataSource);

    fakeServer.addUpdateListener(processUpdateFromFakeServer);
  });
});
