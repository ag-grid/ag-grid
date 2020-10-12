var columnDefs = [
  // keys
  { field: 'productName', rowGroup: true, hide: true },
  { field: 'portfolioName', rowGroup: true, hide: true },
  { field: 'bookId', rowGroup: true, hide: true },

  {field: 'productId'},
  {field: 'portfolioId'},
  {field: 'bookId'},

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
  rowSelection: 'multiple',
  enableCellChangeFlash: true,
  columnDefs: columnDefs,
  // use the enterprise row model
  rowModelType: 'serverSide',
  // cacheBlockSize: 100,
  animateRows: true
};

var productNames = ['Palm Oil','Rubber','Wool','Amber','Copper','Lead','Zinc','Tin','Aluminium',
  'Aluminium Alloy','Nickel','Cobalt','Molybdenum','Recycled Steel','Corn','Oats','Rough Rice',
  'Soybeans','Rapeseed','Soybean Meal','Soybean Oil','Wheat','Milk','Coca','Coffee C',
  'Cotton No.2','Sugar No.11','Sugar No.14'];

var portfolioNames = ['Aggressive','Defensive','Income','Speculative','Hybrid'];

var products = [];
var productsMap = {};

var tradeIdSequence = 0;

function createServerSideData() {
  for (var i = 0; i<productNames.length; i++) {

    var productName = productNames[i];
    var productId = 'PRD_' + i;
    var product = {
      productName: productName,
      productId: productId,
      children: [],
      childrenMap: {}
    };
    products.push(product);
    productsMap[productId] = product;

    for (var j = 0; j<portfolioNames.length; j++) {

      var portfolioName = portfolioNames[j];
      var portfolioId = 'PFO_' + j;
      var portfolio = {
        portfolioId: portfolioId,
        portfolioName: portfolioName,
        productName: productName,
        productId: productId,
        children: [],
        childrenMap: {}
      };
      product.children.push(portfolio);
      product.childrenMap[portfolioId] = portfolio;

      for (var k = 0; k<5; k++) {
        var bookId = 'LB-'+ i + '-' + j + '-' + k;
        var book = {
          portfolioId: portfolioId,
          portfolioName: portfolioName,
          productName: productName,
          productId: productId,
          bookId: bookId,
          children: [],
          childrenMap: {}
        };
        portfolio.children.push(book);
        portfolio.childrenMap[bookId] = book;

        for (var l = 0; l<5; l++) {
          var trade = createTradeRecord(portfolioId, portfolioName, productId, productName, bookId);
          book.children.push(trade);
        }
      }
    }
  }
}

// https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
function randomBetween(min,max) {
  return Math.floor(Math.random()*(max - min + 1)) + min;
}

function createTradeRecord(portfolioId, portfolioName, productId, productName, bookId) {
  var current = Math.floor(Math.random()*100000) + 100;
  var previous = current + Math.floor(Math.random()*10000) - 2000;
  var trade = {
    portfolioId: portfolioId,
    portfolioName: portfolioName,
    productName: productName,
    productId: productId,
    bookId: bookId,
    tradeId: 'TRD_' + tradeIdSequence++,
    submitterID: randomBetween(10,1000),
    submitterDealID: randomBetween(10,1000),
    dealType: (Math.random()<.2) ? 'Physical' : 'Financial',
    bidFlag: (Math.random()<.5) ? 'Buy' : 'Sell',
    current: current,
    previous: previous,
    pl1: randomBetween(100,1000),
    pl2: randomBetween(100,1000),
    gainDx: randomBetween(100,1000),
    sxPx: randomBetween(100,1000),
    _99Out: randomBetween(100,1000)
  };
  return trade;
}

function numberCellFormatter(params) {
  return Math.floor(params.value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}


/*

function onRemoveSelected() {
  var rowsToRemove = gridOptions.api.getSelectedRows();

  var tx = {
    remove: rowsToRemove
  };

  gridOptions.api.applyServerSideTransaction(tx);
}

function onRemoveRandom() {
  var rowsToRemove = [];
  var firstRow;

  gridOptions.api.forEachNode(function(node) {
    if (firstRow==null) {
      firstRow = node.data;
    }
    // skip half the nodes at random
    if (Math.random()<0.75) { return; }
    rowsToRemove.push(node.data);
  });

  if (rowsToRemove.length==0 && firstRow!=null) {
    rowsToRemove.push(firstRow);
  }

  var tx = {
    remove: rowsToRemove
  };

  gridOptions.api.applyServerSideTransaction(tx);
}

function onUpdateSelected() {
  var rowsToUpdate = gridOptions.api.getSelectedRows();
  rowsToUpdate.forEach(function(data) {
    data.value = getNextValue();
  });

  var tx = {
    update: rowsToUpdate
  };

  gridOptions.api.applyServerSideTransaction(tx);
}

function onUpdateRandom() {
  var rowsToUpdate = [];

  gridOptions.api.forEachNode(function(node) {
    // skip half the nodes at random
    if (Math.random()>0.5) { return; }
    var data = node.data;
    data.value = getNextValue();
    rowsToUpdate.push(data);
  });

  var tx = {
    update: rowsToUpdate
  };

  gridOptions.api.applyServerSideTransaction(tx);
}

function onAdd(index) {
  var newProductName = all_products[Math.floor(all_products.length*Math.random())];
  var itemsToAdd = [];
  for (var i = 0; i<5; i++) {
    itemsToAdd.push(      {
          product: newProductName + ' ' + newProductSequence++,
          value: getNextValue()
        }
    );
  }
  var tx = {
    addIndex: index,
    add: itemsToAdd
  };
  gridOptions.api.applyServerSideTransaction(tx);
}
*/

var valueCounter = 0;
function getNextValue() {
  valueCounter++;
  return (Math.floor((valueCounter*987654321)/7)) % 10000;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);

  createServerSideData();

  agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' }).then(function(data) {

    var dataSource = {
      getRows: function(params) {

        console.log(params);

        var result;
        var groupKeys = params.request.groupKeys;
        var parentData = params.parentNode.data;

        var productId = parentData ? parentData.productId : null;
        var portfolioId = parentData ? parentData.portfolioId : null;
        var bookId = parentData ? parentData.bookId : null;
        switch (groupKeys.length) {
          case 0:
            result = products;
            break;
          case 1:
            result = productsMap[productId].children;
            break;
          case 2:
            result = productsMap[productId].childrenMap[portfolioId].children;
            break;
          case 3:
            result = productsMap[productId].childrenMap[portfolioId].childrenMap[bookId].children;
            break;
        }

        // To make the demo look real, wait for 500ms before returning
        setTimeout(function() {
          // call the success callback
          params.successCallback(result);
        }, 500);
      }
    };

    gridOptions.api.setServerSideDatasource(dataSource);
  });
});
