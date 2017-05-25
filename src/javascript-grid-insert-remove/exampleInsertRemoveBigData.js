// var PRODUCT_COUNT = 2;
// var PORTFOLIO_COUNT = 2;
//
// var MIN_BOOK_COUNT = 2;
// var MAX_BOOK_COUNT = 4;
//
// var MIN_TRADE_COUNT = 2;
// var MAX_TRADE_COUNT = 4;

var PRODUCT_COUNT = null;
var PORTFOLIO_COUNT = null;

var MIN_BOOK_COUNT = 10;
var MAX_BOOK_COUNT = 110;

var MIN_TRADE_COUNT = 1;
var MAX_TRADE_COUNT = 10;

var productsOriginalList = ['Palm Oil','Rubber','Wool','Amber','Copper','Lead','Zinc','Tin','Aluminium',
    'Aluminium Alloy','Nickel','Cobalt','Molybdenum','Recycled Steel','Corn','Oats','Rough Rice',
    'Soybeans','Rapeseed','Soybean Meal','Soybean Oil','Wheat','Milk','Coca','Coffee C',
    'Cotton No.2','Sugar No.11','Sugar No.14'];

var products = PRODUCT_COUNT ? productsOriginalList.slice(0, PRODUCT_COUNT) : productsOriginalList;

var portfoliosOriginalList = ['Aggressive','Defensive','Income','Speculative','Hybrid'];

var portfolios = PORTFOLIO_COUNT ? portfoliosOriginalList.slice(0, PORTFOLIO_COUNT) : portfoliosOriginalList;

// as we create books, we remember what products they belong to, so we can
// add to these books later when use clicks one of the buttons
var productToPortfolioToBooks = {};

// start the book id's and trade id's at some future random number,
// looks more realistic than starting them at 0
var nextBookId = 23472;
var nextTradeId = 437629287;
var nextBatchId = 1001;

var gridOptions;

function createCols() {
    return [
        // these are the row groups, so they are all hidden (they are showd in the group column)
        {headerName: 'Product', field: 'product', enableRowGroup: true, enablePivot: true},
        {headerName: 'Portfolio', field: 'portfolio', enableRowGroup: true, enablePivot: true},
        {headerName: 'Book', field: 'book', enableRowGroup: true, enablePivot: true},
        {headerName: 'Trade', field: 'trade'},

        // some string values, that do not get aggregated
        {headerName: 'Deal Type', field: 'dealType', enableRowGroup: true, enablePivot: true},
        {headerName: 'Bid Flag', field: 'bidFlag', enableRowGroup: true, enablePivot: true},
        {headerName: 'Comment', field: 'comment', editable: true},

        // all the other columns (visible and not grouped)
        {headerName: 'Latest Batch', field: 'batch', width: 200, cellClass: 'number', aggFunc: 'max', enableValue: true},
        {headerName: 'Current', field: 'current', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: 'Previous', field: 'previous', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: 'Change', valueGetter: changeValueGetter, width: 200,  aggFunc: 'sum', enableValue: true, cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: 'PL 1', field: 'pl1', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: 'PL 2', field: 'pl2', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: 'Gain-DX', field: 'gainDx', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: 'SX / PX', field: 'sxPx', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: '99 Out', field: '_99Out', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: 'Submitter ID', field: 'submitterID', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: 'Submitted Deal ID', field: 'submitterDealID', width: 200, aggFunc: 'sum', enableValue: true, cellClass: 'number', cellFormatter: numberCellFormatter}
    ];
}

// simple value getter, however we can see how many times it gets called. this
// gives us an indication to how many rows get recalculated when data changes
function changeValueGetter(params) {
    return params.data.previous - params.data.current;
}

var globalRowData;

// build up the test data, creates approx 50,000 rows
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
        submitterID: Math.floor(Math.random()*1000) + 10,
        submitterDealID: Math.floor(Math.random()*1000) + 10,
        dealType: (Math.random()<.2) ? 'Physical' : 'Financial',
        bidFlag: (Math.random()<.5) ? 'Buy' : 'Sell',
        current: current,
        previous: previous,
        pl1: Math.floor(Math.random()*1000) + 100,
        pl2: Math.floor(Math.random()*1000) + 100,
        gainDx: Math.floor(Math.random()*1000) + 100,
        sxPx: Math.floor(Math.random()*1000) + 100,
        _99Out: Math.floor(Math.random()*1000) + 100,
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

function createGridOptions() {
    createRowData();

    gridOptions = {
        enableImmutableMode: true,
        columnDefs: createCols(),
        rowData: globalRowData,
        rememberGroupStateWhenNewData: true,
        animateRows: true,
        enableColResize: true,
        enableRangeSelection: true,
        enableSorting: true,
        rowGroupPanelShow: 'always',
        pivotPanelShow: 'always',
        suppressAggFuncInHeader: true,
        getRowNodeId: function(data) { return data.trade; },
        defaultColDef: {
            width: 120,
            // cellRenderer: 'animateSlide'
            cellRenderer: 'animateShowChange'
        }
    };
    console.log('rowData.length: ' + gridOptions.rowData.length);
}

function add20PalmOilExistingBooks() {
    var newData = [];
    var batch = nextBatchId++;
    for (var i = 0; i<20; i++) {
        var portfolio = portfolios[Math.floor(Math.random()*portfolios.length)];
        var books = productToPortfolioToBooks['Palm Oil'][portfolio];
        var book = books[Math.floor(Math.random()*books.length)];
        var trade = createTradeRecord('Palm Oil', portfolio, book, batch);
        newData.push(trade);
        globalRowData.push(trade);
    }
    gridOptions.api.updateRowData({
        add: newData,
        remove: null,
        update: null});
}

function randomlyChangeData() {
    // pick some data at random to remove
    var removeCount = randomBetween(1,6);
    var addCount = randomBetween(1,6);
    var updateCount = randomBetween(1,6);

    var itemsToRemove = [];
    for (var i = 0; i<removeCount; i++) {
        if (globalRowData.length === 0) { continue; }
        var indexToRemove = Math.floor(Math.random()*globalRowData.length);
        var itemToRemove = globalRowData[indexToRemove];
        globalRowData.splice(indexToRemove, 1);
        itemsToRemove.push(itemToRemove);
    }

    // create new data
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

    // update some data
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

    gridOptions.api.setRowData(globalRowData);

    // gridOptions.api.updateRowData({
    //         add: itemsToAdd,
    //         remove: itemsToRemove,
    //         update: itemsToUpdate});
}

// makes a copy of the original and merges in the new values
function updateImmutableObject(original, newValues) {
    var newObject = {};
    Object.keys(original).forEach( function(key) {
        newObject[key] = original[key];
    });
    Object.keys(newValues).forEach( function(key) {
        newObject[key] = newValues[key];
    });
    return newObject;
}

var feedActive = false;
doOneIterationOfFeed();

function doOneIterationOfFeed() {
    if (feedActive) {
        randomlyChangeData();
    }
    // random mill is between 1000 and 4000
    var millis = randomBetween(1000, 4000);
    this.setTimeout(doOneIterationOfFeed, millis);
}

function toggleFeed() {
    feedActive = !feedActive;
    var buttonText = feedActive ? '&#9724; Stop Feed' : '&#9658; Start Feed';
    document.querySelector('#toggleInterval').innerHTML = buttonText;
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    createGridOptions();
    new agGrid.Grid(eGridDiv, gridOptions);
});
