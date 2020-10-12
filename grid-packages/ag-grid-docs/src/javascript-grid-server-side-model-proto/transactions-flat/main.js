var columnDefs = [
  { field: 'product' },
  { field: 'value' }
];

var gridOptions = {
  defaultColDef: {
    width: 250,
    resizable: true
  },
  columnDefs: columnDefs,
  // use the enterprise row model
  rowModelType: 'serverSide',
  // cacheBlockSize: 100,
  animateRows: true
};

var products = ['Palm Oil','Rubber','Wool','Amber','Copper'];

var all_products = ['Palm Oil','Rubber','Wool','Amber','Copper','Lead','Zinc','Tin','Aluminium',
  'Aluminium Alloy','Nickel','Cobalt','Molybdenum','Recycled Steel','Corn','Oats','Rough Rice',
  'Soybeans','Rapeseed','Soybean Meal','Soybean Oil','Wheat','Milk','Coca','Coffee C',
  'Cotton No.2','Sugar No.11','Sugar No.14'];

function onUpdate() {
  var tx = {
    update: []
  };

  gridOptions.api.applyServerSideTransaction(tx);
}

function onAdd(index) {
  const newProductName = all_products[Math.floor(all_products.length*Math.random())];
  var tx = {
    addIndex: index,
    add: [
      {
        product: newProductName + ' ' + Math.floor(Math.random()*1000),
        value: getNextValue()
      }
    ]
  };
  gridOptions.api.applyServerSideTransaction(tx);
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
