var valueGetterExecCount = 0;

var products = ['Palm Oil','Rubber','Wool','Amber','Copper','Lead','Zinc','Tin','Aluminium',
    'Aluminium Alloy','Nickel','Cobalt','Molybdenum','Recycled Steel','Corn','Oats','Rough Rice',
    'Soybeans','Rapeseed','Soybean Meal','Soybean Oil','Wheat','Milk','Coca','Coffee C',
    'Cotton No.2','Sugar No.11','Sugar No.14'];

var portfolios = ['Aggressive','Defensive','Income','Speculative','Hybrid'];

// as we create books, we remember what products they belong to, so we can
// add to these books later when use clicks one of the buttons
var productToPortfolioToBooks = {};

var maxTradesPerBook = 10;
var nextBookId = 23472;
var nextTradeId = 437629287;
var nextBatchId = 1001;

var gridOptions;

function createCols() {
    return [
        // the group column
        {headerName: 'Hierarchy', field: 'trade', cellRenderer: 'group', width: 200,
            comparator: agGrid.defaultGroupComparator},

        // these are the row groups, so they are all hidden (they are showd in the group column)
        {headerName: 'Product', field: 'product', rowGroupIndex: 0, hide: true},
        {headerName: 'Portfolio', field: 'portfolio', rowGroupIndex: 1, hide: true},
        {headerName: 'Book', field: 'book', rowGroupIndex: 2, hide: true},
        {headerName: 'Trade', field: 'trade', hide: true},

        // all the other columns (visible and not grouped)
        {headerName: 'Latest Batch', field: 'batch', cellClass: 'number', aggFunc: 'max'},
        {headerName: 'Current', field: 'current', aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: 'Previous', field: 'previous', aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: 'Change', valueGetter: changeValueGetter, aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: 'PL 1', field: 'pl1', aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: 'PL 2', field: 'pl2', aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: 'Gain-DX', field: 'gainDx', aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: 'SX / PX', field: 'sxPx', aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: '99 Out', field: '_99Out', aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: 'Submitter ID', field: 'submitterID', aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: 'Submitted Deal ID', field: 'submitterDealID', aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
        {headerName: 'Deal Type', field: 'dealType', aggFunc: 'sum'},
        {headerName: 'Bid Flag', field: 'bidFlag', aggFunc: 'sum'}
    ];
}

// simple value getter, however we can see how many times it gets called. this
// gives us an indication to how many rows get recalculated when data changes
function changeValueGetter(params) {
    valueGetterExecCount++;
    return params.data.previous - params.data.current;
}

// build up the test data, creates approx 50,000 rows
function createRowData() {
    var rowData = [];
    var thisBatch = nextBatchId++;
    for (var i = 0; i<products.length; i++) {
        var product = products[i];
        productToPortfolioToBooks[product] = {};
        for (var j = 0; j<portfolios.length; j++) {
            var portfolio = portfolios[j];
            productToPortfolioToBooks[product][portfolio] = [];
            var bookCount = Math.floor(Math.random()*100) + 10;
            for (var k = 0; k<bookCount; k++) {
                var book = createBookName();
                productToPortfolioToBooks[product][portfolio].push(book);
                var tradeCount = Math.floor(Math.random()*maxTradesPerBook) + 1;
                for (var l = 0; l < tradeCount; l++) {
                    var trade = createTradeRecord(product, portfolio, book, thisBatch);
                    rowData.push(trade);
                }
            }
        }
    }
    return rowData;
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
    gridOptions = {
        columnDefs: createCols(),
        rowData: createRowData(),
        // because we are supplying our own group column,
        // we don't use the grids default
        groupSuppressAutoColumn: true,
        animateRows: true,
        enableColResize: true,
        enableRangeSelection: true,
        enableSorting: true,
        suppressAggFuncInHeader: true,
        defaultColDef: {
            width: 120
        }
    };
    console.log('rowData.length: ' + gridOptions.rowData.length);
}

function add20PalmOilExistingBooks() {
    valueGetterExecCount = 0;
    var newData = [];
    var batch = nextBatchId++;
    for (var i = 0; i<20; i++) {
        var portfolio = portfolios[Math.floor(Math.random()*portfolios.length)];
        var books = productToPortfolioToBooks['Palm Oil'][portfolio];
        var book = books[Math.floor(Math.random()*books.length)];
        var trade = createTradeRecord('Palm Oil', portfolio, book, batch);
        newData.push(trade);
    }
    gridOptions.api.addItems(newData);
    console.log('after insert valueGetterExecCount: ' + valueGetterExecCount);
}

var intervalId;

function toggleFeed() {
    var intervalActive = !!intervalId;
    if (intervalActive) {
        clearInterval(intervalId);
        intervalId = null;
        document.querySelector('#toggleInterval').innerHTML = '&#9658; Start Feed';
    } else {
        intervalId = setInterval(add20PalmOilExistingBooks, 1000);
        document.querySelector('#toggleInterval').innerHTML = '&#9724; Stop Feed';
    }
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    createGridOptions();
    new agGrid.Grid(eGridDiv, gridOptions);
    console.log('initial valueGetterExecCount: ' + valueGetterExecCount);
});
