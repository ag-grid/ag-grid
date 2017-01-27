var columnDefs = [
    {headerName: "Product", field: "product", rowGroupIndex: 0, hide: true},
    {headerName: "Portfolio", field: "portfolio", rowGroupIndex: 1, hide: true},
    {headerName: "Book", field: "book", rowGroupIndex: 2, hide: true},
    {headerName: "Trade", field: "trade"},
    {headerName: "Latest Batch", field: "batch", cellClass: 'number', aggFunc: 'max'},
    {headerName: "Current", field: "current", aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
    {headerName: "Previous", field: "previous", aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
    {headerName: "Change", valueGetter: "data.previous - data.current", aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
    {headerName: "PL 1", field: "pl1", aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
    {headerName: "PL 2", field: "pl2", aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
    {headerName: "Gain-DX", field: "gainDx", aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
    {headerName: "SX / PX", field: "sxPx", aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
    {headerName: "99 Out", field: "_99Out", aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
    {headerName: "Submitter ID", field: "submitterID", aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
    {headerName: "Submitted Deal ID", field: "submitterDealID", aggFunc: 'sum', cellClass: 'number', cellFormatter: numberCellFormatter},
    {headerName: "Deal Type", field: "dealType", aggFunc: 'sum'},
    {headerName: "Bid Flag", field: "bidFlag", aggFunc: 'sum'}
];

var rowData = [];

var products = ['Palm Oil','Rubber','Wool','Amber','Copper','Lead','Zinc','Tin','Aluminium',
    'Aluminium Alloy','Nickel','Cobalt','Molybdenum','Recycled Steel','Corn','Oats','Rough Rice',
    'Soybeans','Rapeseed','Soybean Meal','Soybean Oil','Wheat','Milk','Coca','Coffee C',
    'Cotton No.2','Sugar No.11','Sugar No.14'];

var portfolios = ['Aggressive','Defensive','Income','Speculative','Hybrid'];

// as we create books, we remember what products they belong to, so we can
// add to these books later when use clicks one of the buttons
var productBooks = {};

var maxTradesPerBook = 10;
var nextBookId = 23472;
var nextTradeId = 437629287;
var nextBatchId = 1001;

createSampleData();

// build up the test data, creates approx 50,000 rows
function createSampleData() {
    var thisBatch = nextBatchId++;
    for (var i = 0; i<products.length; i++) {
        var product = products[i];
        productBooks[product] = [];
        for (var j = 0; j<portfolios.length; j++) {
            var portfolio = portfolios[j];
            var bookCount = Math.floor(Math.random()*100) + 10;
            for (var k = 0; k<bookCount; k++) {
                var book = createBookName();
                productBooks[product].push(book);
                var tradeCount = Math.floor(Math.random()*maxTradesPerBook) + 1;
                for (var l = 0; l < tradeCount; l++) {
                    var trade = createTradeRecord(product, portfolio, book, thisBatch);
                    rowData.push(trade);
                }
            }
        }
    }
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

console.log('row count is ' + rowData.length);

var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    animateRows: true,
    enableColResize: true,
    suppressAggFuncInHeader: true,
    defaultColDef: {
        width: 120
    }
};

function add20PalmOil() {
    var newData = [];
    var batch = nextBatchId++;
    for (var i = 0; i<20; i++) {
        var books = productBooks['Palm Oil'];
        var book = books[Math.floor(Math.random()*books.length)];
        var portfolio = portfolios[Math.floor(Math.random()*portfolios.length)];
        var trade = createTradeRecord('Palm Oil', portfolio, book, batch);
        newData.push(trade);
    }
    gridOptions.api.addItems(newData);
}

// function onAddRow() {
//     var newItem = createNewRowData();
//     gridOptions.api.addItems([newItem]);
// }
// function addItems() {
//     var newItems = [createNewRowData(), createNewRowData(), createNewRowData()];
//     gridOptions.api.addItems(newItems);
// }
//
// function onInsertRowAt2() {
//     var newItem = createNewRowData();
//     gridOptions.api.insertItemsAtIndex(2, [newItem]);
// }
//
// function onRemoveSelected() {
//     var selectedNodes = gridOptions.api.getSelectedNodes();
//     gridOptions.api.removeItems(selectedNodes);
// }

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
});
