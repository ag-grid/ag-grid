var columnDefs = [
  { field: 'productName', rowGroup: true, hide: true },
  { field: 'tradeName' },
  { field: 'value' }
];

var gridOptions = {
  defaultColDef: {
    width: 250,
    resizable: true
  },
  getRowNodeId: function(data) {return data.id; },
  rowModelType: 'serverSide',
  serverSideStoreType: 'inMemory',
  columnDefs: columnDefs,
  animateRows: true
};

var productsNames = ['Palm Oil','Rubber','Wool','Amber','Copper'];

var products = [];

var idSequence = 0;

function createOneTrade() {
  return {id: idSequence++, tradeName: 'TRD-'+Math.floor(Math.random()*20000), value: Math.floor(Math.random()*20000)};
}

productsNames.forEach(function(productName) {
  var product = {id: idSequence++, productName: productName, trades: []};
  products.push(product);
  for (var i = 0; i<2; i++) {
    product.trades.push(createOneTrade());
  }
});

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);

  agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' }).then(function(data) {

    var dataSource = {
      getRows: function(params) {
        // To make the demo look real, wait for 500ms before returning
        setTimeout(function() {

          var rowData;
          if (params.request.groupKeys.length==0) {
            rowData = products.slice();
          } else {
            var key = params.request.groupKeys[0];
            products.forEach(function(product) {
              if (product.productName==key) {
                rowData = product.trades;
              }
            });
          }

          params.success({rowData: rowData});

        }, 2000);
      }
    };

    gridOptions.api.setServerSideDatasource(dataSource);
  });
});
