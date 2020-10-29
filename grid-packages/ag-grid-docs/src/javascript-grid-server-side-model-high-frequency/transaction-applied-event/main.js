var columnDefs = [
  { field: 'product' },
  { field: 'value' }
];

var gridOptions = {
  defaultColDef: {
    width: 250,
    resizable: true
  },
  onAsyncTransactionsApplied: function(e) {
    var summary = {};
    e.results.forEach(function(result) {
      var status = result.status;
      if (summary[status]==null) {
        summary[status] = 0;
      }
      summary[status]++;
    });
    console.log('onAsyncTransactionsApplied: ' + JSON.stringify(summary));
  },
  getRowNodeId: function(data) {return data.product; },
  rowSelection: 'multiple',
  serverSideStoreType: 'inMemory',
  columnDefs: columnDefs,
  // use the enterprise row model
  rowModelType: 'serverSide',
  animateRows: true,
  asyncTransactionWaitMillis: 4000
};

var products = ['Palm Oil','Rubber','Wool','Amber','Copper'];

var newProductSequence = 0;

var all_products = ['Palm Oil','Rubber','Wool','Amber','Copper','Lead','Zinc','Tin','Aluminium',
  'Aluminium Alloy','Nickel','Cobalt','Molybdenum','Recycled Steel','Corn','Oats','Rough Rice',
  'Soybeans','Rapeseed','Soybean Meal','Soybean Oil','Wheat','Milk','Coca','Coffee C',
  'Cotton No.2','Sugar No.11','Sugar No.14'];

function onBtAdd() {
  var newProductName = all_products[Math.floor(all_products.length*Math.random())];
  var itemsToAdd = [];
  itemsToAdd.push({
        product: newProductName + ' ' + newProductSequence++,
        value: getNextValue()
      });
  var tx = {
    add: itemsToAdd
  };
  gridOptions.api.applyServerSideTransactionAsync(tx);
}

function onBtFlush() {
  gridOptions.api.flushServerSideAsyncTransactions();
}

var valueCounter = 0;
function getNextValue() {
  valueCounter++;
  return (Math.floor((valueCounter*987654321)/7)) % 10000;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);

  agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' }).then(function(data) {

    var dataSource = {
      getRows: function(params) {

        // To make the demo look real, wait for 500ms before returning
        setTimeout(function() {

          var rows = [];
          products.forEach( function(product, index) {
            rows.push({
              product: product,
              value: getNextValue()
            })
          });

          // call the success callback
          params.successCallback(rows, rows.length);
        }, 500);
      }
    };

    gridOptions.api.setServerSideDatasource(dataSource);
  });
});
