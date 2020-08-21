var MIN_BOOK_COUNT = 10;
var MAX_BOOK_COUNT = 20;

var MIN_TRADE_COUNT = 1;
var MAX_TRADE_COUNT = 10;

var products = ['Palm Oil','Rubber','Wool','Amber','Copper','Lead','Zinc','Tin','Aluminium',
    'Aluminium Alloy','Nickel','Cobalt','Molybdenum','Recycled Steel','Corn','Oats','Rough Rice',
    'Soybeans','Rapeseed','Soybean Meal','Soybean Oil','Wheat','Milk','Coca','Coffee C',
    'Cotton No.2','Sugar No.11','Sugar No.14'];

var portfolios = ['Aggressive','Defensive','Income','Speculative','Hybrid'];

// start the book id's and trade id's at some future random number,
// looks more realistic than starting them at 0
var nextBookId = 62472;
var nextTradeId = 24287;

var UPDATE_COUNT = 20;

var columnDefs = [
        // these are the row groups, so they are all hidden (they are show in the group column)
        {headerName: 'Product', field: 'product', enableRowGroup: true, enablePivot: true, rowGroupIndex: 0, hide: true},
        {headerName: 'Portfolio', field: 'portfolio', enableRowGroup: true, enablePivot: true, rowGroupIndex: 1, hide: true},
        {headerName: 'Book', field: 'book', enableRowGroup: true, enablePivot: true, rowGroupIndex: 2, hide: true},
        {headerName: 'Trade', field: 'trade', width: 100},

        // all the other columns (visible and not grouped)
        {headerName: 'Current', field: 'current', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: 'Previous', field: 'previous', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: 'Deal Type', field: 'dealType', enableRowGroup: true, enablePivot: true},
        {headerName: 'Bid', field: 'bidFlag', enableRowGroup: true, enablePivot: true, width: 100},
        {headerName: 'PL 1', field: 'pl1', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: 'PL 2', field: 'pl2', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: 'Gain-DX', field: 'gainDx', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: 'SX / PX', field: 'sxPx', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: '99 Out', field: '_99Out', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: 'Submitter ID', field: 'submitterID', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: 'Submitted Deal ID', field: 'submitterDealID', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'}
    ];

// a list of the data, that we modify as we go. if you are using an immutable
// data store (such as Redux) then this would be similar to your store of data.
var globalRowData;

// build up the test data
function createRowData() {
    globalRowData = [];
    for (var i = 0; i<products.length; i++) {
        var product = products[i];
        for (var j = 0; j<portfolios.length; j++) {
            var portfolio = portfolios[j];

            var bookCount = randomBetween(MAX_BOOK_COUNT, MIN_BOOK_COUNT);

            for (var k = 0; k<bookCount; k++) {
                var book = createBookName();
                var tradeCount = randomBetween(MAX_TRADE_COUNT, MIN_TRADE_COUNT);
                for (var l = 0; l < tradeCount; l++) {
                    var trade = createTradeRecord(product, portfolio, book);
                    globalRowData.push(trade);
                }
            }
        }
    }
}

// https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
function randomBetween(min,max) {
    return Math.floor(Math.random()*(max - min + 1)) + min;
}

function createTradeRecord(product, portfolio, book) {
    var current = Math.floor(Math.random()*100000) + 100;
    var previous = current + Math.floor(Math.random()*10000) - 2000;
    var trade = {
        product: product,
        portfolio: portfolio,
        book: book,
        trade: createTradeId(),
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

function createBookName() {
    nextBookId++;
    return 'GL-' + nextBookId
}

function createTradeId() {
    nextTradeId++;
    return nextTradeId
}

var gridOptions = {
    columnDefs: columnDefs,
    suppressAggFuncInHeader: true,
    animateRows: true,
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    asyncTransactionWaitMillis: 4000,
    getRowNodeId: function(data) { return data.trade; },
    defaultColDef: {
        width: 120,
        sortable: true,
        resizable: true
    },
    autoGroupColumnDef: {
        width: 250
    },
    onGridReady: function(params) {
        createRowData();
        params.api.setRowData(globalRowData)
        startFeed(params.api);
    }
};

function onFlushTransactions() {
    gridOptions.api.flushAsyncTransactions();
}

function startFeed(api) {
    var count = 1;

    setInterval(function() {
        var thisCount = count++;
        var updatedIndexes = {};
        var newItems = [];
        for (var i = 0; i<UPDATE_COUNT; i++) {
            // pick one index at random
            var index = Math.floor(Math.random()*globalRowData.length);
            // dont do same index twice, otherwise two updates for same row in one transaction
            if (updatedIndexes[index]) { continue; }
            var itemToUpdate = globalRowData[index];
            var newItem = copyObject(itemToUpdate);
            // copy previous to current value
            newItem.previous = newItem.current;
            // then create new current value
            newItem.current = Math.floor(Math.random()*100000) + 100;
            newItems.push(newItem);
        }
        var resultCallback = function() {
            console.log('transactionApplied() - ' + thisCount);
        };
        api.applyTransactionAsync({update: newItems}, resultCallback);
        console.log('applyTransactionAsync() - ' + thisCount);
    }, 500);
}

// makes a copy of the original and merges in the new values
function copyObject(object) {

    // start with new object
    var newObject = {};

    // copy in the old values
    Object.keys(object).forEach( function(key) {
        newObject[key] = object[key];
    });

    return newObject;
}

// after page is loaded, create the grid.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
});
