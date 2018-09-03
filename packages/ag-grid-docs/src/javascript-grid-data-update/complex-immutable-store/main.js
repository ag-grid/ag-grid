var MIN_BOOK_COUNT = 10;
var MAX_BOOK_COUNT = 20;

var MIN_TRADE_COUNT = 1;
var MAX_TRADE_COUNT = 10;

var products = ['Palm Oil','Rubber','Wool','Amber','Copper','Lead','Zinc','Tin','Aluminium',
    'Aluminium Alloy','Nickel','Cobalt','Molybdenum','Recycled Steel','Corn','Oats','Rough Rice',
    'Soybeans','Rapeseed','Soybean Meal','Soybean Oil','Wheat','Milk','Coca','Coffee C',
    'Cotton No.2','Sugar No.11','Sugar No.14'];

var portfolios = ['Aggressive','Defensive','Income','Speculative','Hybrid'];

// as we create books, we remember what products they belong to, so we can
// add to these books later when use clicks one of the buttons
var productToPortfolioToBooks = {};

// start the book id's and trade id's at some future random number,
// looks more realistic than starting them at 0
var nextBookId = 62472;
var nextTradeId = 24287;
var nextBatchId = 101;

var columnDefs = [
        // these are the row groups, so they are all hidden (they are showd in the group column)
        {headerName: 'Product', field: 'product', enableRowGroup: true, enablePivot: true, rowGroupIndex: 0, hide: true},
        {headerName: 'Portfolio', field: 'portfolio', enableRowGroup: true, enablePivot: true, rowGroupIndex: 1, hide: true},
        {headerName: 'Book', field: 'book', enableRowGroup: true, enablePivot: true, rowGroupIndex: 2, hide: true},
        {headerName: 'Trade', field: 'trade', width: 100},

        // some string values, that do not get aggregated
        {headerName: 'Deal Type', field: 'dealType', enableRowGroup: true, enablePivot: true},
        {headerName: 'Bid', field: 'bidFlag', enableRowGroup: true, enablePivot: true, width: 100},
        {headerName: 'Comment', field: 'comment', editable: true},

        // all the other columns (visible and not grouped)
        {headerName: 'Batch', field: 'batch', width: 100, cellClass: 'number', aggFunc: 'max', enableValue: true, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: 'Current', field: 'current', width: 150, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: 'Previous', field: 'previous', width: 150, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: 'Change', valueGetter: changeValueGetter, width: 150,  aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: 'PL 1', field: 'pl1', width: 150, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: 'PL 2', field: 'pl2', width: 150, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: 'Gain-DX', field: 'gainDx', width: 150, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: 'SX / PX', field: 'sxPx', width: 150, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: '99 Out', field: '_99Out', width: 150, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: 'Submitter ID', field: 'submitterID', width: 150, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'},
        {headerName: 'Submitted Deal ID', field: 'submitterDealID', width: 150, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer:'agAnimateShowChangeCellRenderer'}
    ];

// simple value getter, however we can see how many times it gets called. this
// gives us an indication to how many rows get recalculated when data changes
function changeValueGetter(params) {
    return params.data.previous - params.data.current;
}

// a list of the data, that we modify as we go. if you are using an immutable
// data store (such as Redux) then this would be similar to your store of data.
var globalRowData;

// build up the test data
function createRowData() {
    globalRowData = [];
    var thisBatch = nextBatchId++;
    for (var i = 0; i<products.length; i++) {
        var product = products[i];
        productToPortfolioToBooks[product] = {};
        for (var j = 0; j<portfolios.length; j++) {
            var portfolio = portfolios[j];
            productToPortfolioToBooks[product][portfolio] = [];

            var bookCount = randomBetween(MAX_BOOK_COUNT, MIN_BOOK_COUNT);

            for (var k = 0; k<bookCount; k++) {
                var book = createBookName();
                productToPortfolioToBooks[product][portfolio].push(book);
                var tradeCount = randomBetween(MAX_TRADE_COUNT, MIN_TRADE_COUNT);
                for (var l = 0; l < tradeCount; l++) {
                    var trade = createTradeRecord(product, portfolio, book, thisBatch);
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

function createTradeRecord(product, portfolio, book, batch) {
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
        _99Out: randomBetween(100,1000),
        batch: batch
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
        deltaRowDataMode: true,
        columnDefs: columnDefs,
        rowData: globalRowData,
        statusBar: {
            items: [
                { component: 'agAggregationComponent' }
            ]
        },
        animateRows: true,
        enableColResize: true,
        enableRangeSelection: true,
        enableSorting: true,
        rowGroupPanelShow: 'always',
        pivotPanelShow: 'always',
        suppressAggFuncInHeader: true,
        getRowNodeId: function(data) { return data.trade; },
        defaultColDef: {
            width: 120
        },
        onGridReady: function(params) {
            // kick off the feed
            timeoutTarget(params.api);
            createRowData();
            params.api.setRowData(globalRowData)
        }
    };

function updateUsingTransaction(gridApi) {

    var itemsToRemove = removeSomeItems();
    var itemsToAdd = addSomeItems();
    var itemsToUpdate = updateSomeItems();

    gridApi.updateRowData({
            add: itemsToAdd,
            remove: itemsToRemove,
            update: itemsToUpdate});
}

function updateUsingTransactionHandler() {
    updateUsingTransaction(gridOptions.api);
}

function updateUsingTransactionImmutableStore() {
    removeSomeItems();
    addSomeItems();
    updateSomeItems();
    gridOptions.api.setRowData(globalRowData);
}

function updateSomeItems() {
    var updateCount = randomBetween(1,6);
    var itemsToUpdate = [];
    for (var k = 0; k<updateCount; k++) {
        if (globalRowData.length === 0) { continue; }
        var indexToUpdate = Math.floor(Math.random()*globalRowData.length);
        var itemToUpdate = globalRowData[indexToUpdate];

        // make a copy of the item, and make some changes, so we are behaving
        // similar to how the
        var updatedItem = updateImmutableObject(itemToUpdate, {
            previous: itemToUpdate.current,
            current: itemToUpdate.current + randomBetween(0,1000) - 500
        });
        globalRowData[indexToUpdate] = updatedItem;

        itemsToUpdate.push(updatedItem);
    }
    return itemsToUpdate;
}

function addSomeItems() {
    var addCount = randomBetween(1,6);
    var itemsToAdd = [];
    var batch = nextBatchId++;
    for (var j = 0; j<addCount; j++) {
        var portfolio = portfolios[Math.floor(Math.random()*portfolios.length)];
        var books = productToPortfolioToBooks['Palm Oil'][portfolio];
        var book = books[Math.floor(Math.random()*books.length)];
        var product = products[Math.floor(Math.random()*products.length)];
        var trade = createTradeRecord(product, portfolio, book, batch);
        itemsToAdd.push(trade);
        globalRowData.push(trade);
    }
    return itemsToAdd;
}

function removeSomeItems() {
    var removeCount = randomBetween(1,6);
    var itemsToRemove = [];
    for (var i = 0; i<removeCount; i++) {
        if (globalRowData.length === 0) { continue; }
        var indexToRemove = randomBetween(0, globalRowData.length);
        var itemToRemove = globalRowData[indexToRemove];
        globalRowData.splice(indexToRemove, 1);
        itemsToRemove.push(itemToRemove);
    }
    return itemsToRemove;
}

// makes a copy of the original and merges in the new values
function updateImmutableObject(original, newValues) {

    // start with new object
    var newObject = {};

    // copy in the old values
    Object.keys(original).forEach( function(key) {
        newObject[key] = original[key];
    });

    // now override with the new values
    Object.keys(newValues).forEach( function(key) {
        newObject[key] = newValues[key];
    });

    return newObject;
}

// whether the feed is active or not. if true, then the
// randomlyChangeData() method will be called.
var feedActive = false;


// this method gets executed periodically
function timeoutTarget(gridApi) {
    // if feed active, then call the randomlyChangeData
    if (feedActive) {
        updateUsingTransaction(gridApi);
    }
    // call this method again after between 1 and 4 seconds.
    var millis = randomBetween(1000, 4000);
    setTimeout(timeoutTarget, millis, gridApi);
}

function toggleFeed() {
    feedActive = !feedActive;
    // update the text in the button. #9724 and #9658 are the stop and play icons.
    var buttonText = feedActive ? '&#9724; Stop Feed' : '&#9658; Start Feed';
    document.querySelector('#toggleInterval').innerHTML = buttonText;
}

// after page is loaded, create the grid.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
});
