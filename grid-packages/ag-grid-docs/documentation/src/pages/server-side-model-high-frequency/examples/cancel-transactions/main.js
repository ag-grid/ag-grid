var columnDefs = [
  { field: 'product' },
  { field: 'value' }
];

var gridOptions = {
  defaultColDef: {
    width: 250,
    resizable: true
  },
  onAsyncTransactionsFlushed: function(e) {
    var summary = {};
    e.results.forEach(function(result) {
      var status = result.status;
      if (summary[status]==null) {
        summary[status] = 0;
      }
      summary[status]++;
    });
    console.log('onAsyncTransactionsFlushed: ' + JSON.stringify(summary));
  },
  isApplyServerSideTransaction: function(params) {
    var tx = params.transaction;
    var storeInfo = params.storeInfo;
    var txCreatedSinceRowDataRead = tx.serverVersion > storeInfo.serverVersion;
    console.log('tx.serverVersion = ' + tx.serverVersion + ', storeInfo.serverVersion = ' + storeInfo.serverVersion);
    if (txCreatedSinceRowDataRead) {
      console.log('Applying transaction');
      return true;
    } else {
      console.log('Cancelling transaction');
      return false;
    }
  },
  onGridReady: function(params) {

    setupData();

    var dataSource = {
      getRows: function(params2) {
        setTimeout(function() {

          var rowData = allServerSideData.slice();
          console.log('getRows: found ' + rowData.length + ' records on server.');

          params2.success({rowData: rowData, storeInfo: {serverVersion: serverVersion}});
        }, 2000);
      }
    };

    params.api.setServerSideDatasource(dataSource);
  },
  getRowNodeId: function(data) {return data.product; },
  rowModelType: 'serverSide',
  serverSideStoreType: 'full',
  columnDefs: columnDefs
};

var products = ['Palm Oil','Rubber','Wool','Amber','Copper'];

var newProductSequence = 0;

var all_products = ['Palm Oil','Rubber','Wool','Amber','Copper','Lead','Zinc','Tin','Aluminium',
  'Aluminium Alloy','Nickel','Cobalt','Molybdenum','Recycled Steel','Corn','Oats','Rough Rice',
  'Soybeans','Rapeseed','Soybean Meal','Soybean Oil','Wheat','Milk','Coca','Coffee C',
  'Cotton No.2','Sugar No.11','Sugar No.14'];

var allServerSideData = [];

function setupData() {
  products.forEach( function(product, index) {
    allServerSideData.push({
      product: product,
      value: Math.floor(Math.random()*10000)
    })
  });
}

var serverVersion = 0;

function onBtAdd() {
  var newProductName = all_products[Math.floor(all_products.length*Math.random())];
  var newItem = {
    product: newProductName + ' ' + newProductSequence++,
    value: Math.floor(Math.random()*10000)
  };
  allServerSideData.push(newItem)
  serverVersion++;
  var tx = {
    add: [newItem],
    serverVersion: serverVersion
  };
  gridOptions.api.applyServerSideTransactionAsync(tx);
}

function onBtRefresh() {
  gridOptions.api.refreshServerSideStore({purge: true});
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
});
