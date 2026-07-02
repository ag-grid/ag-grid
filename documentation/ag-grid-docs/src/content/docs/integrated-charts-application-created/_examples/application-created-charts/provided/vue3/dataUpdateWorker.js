// NOTE: The details of this web worker are not important it's just used to simulate streaming updates in the grid.

// Constants
const UPDATES_PER_MESSAGE = 100;
const MILLISECONDS_BETWEEN_MESSAGES = 100;
const BOOK_COUNT = 5;
const TRADE_COUNT = 2;
const VALUE_FIELDS = ['current', 'previous', 'pl1', 'pl2', 'gainDx', 'sxPx', '_99Out'];
const PRODUCTS = [
    'Cobalt',
    'Rubber',
    'Wool',
    'Amber',
    'Corn',
    'Nickel',
    'Copper',
    'Oats',
    'Coffee',
    'Wheat',
    'Lead',
    'Zinc',
    'Tin',
    'Coca',
];
const PORTFOLIOS = ['Aggressive', 'Defensive', 'Income', 'Speculative', 'Hybrid'];

// Global Variables
let globalRowData;
let nextBookId = 62472;
let nextTradeId = 24287;
let nextBatchId = 101;
let latestUpdateId = 0;

/**
 * Generates a random number between min and max
 */
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// build up the test data
function createRowData() {
    globalRowData = [];
    var thisBatch = nextBatchId++;
    for (var k = 0; k < BOOK_COUNT; k++) {
        for (var j = 0; j < PORTFOLIOS.length; j++) {
            var portfolio = PORTFOLIOS[j];
            for (var i = 0; i < PRODUCTS.length; i++) {
                var product = PRODUCTS[i];
                var book = 'GL-' + ++nextBookId;
                for (var l = 0; l < TRADE_COUNT; l++) {
                    var trade = createTradeRecord(product, portfolio, book, thisBatch);
                    globalRowData.push(trade);
                }
            }
        }
    }
    // console.log('Total number of records sent to grid = ' + globalRowData.length);
}

function createTradeRecord(product, portfolio, book, batch) {
    var current = Math.floor(Math.random() * 10000) + (Math.random() < 0.45 ? 500 : 19000);
    var previous = current + (Math.random() < 0.5 ? 500 : 19000);

    return {
        product: product,
        portfolio: portfolio,
        book: book,
        trade: ++nextTradeId,
        submitterID: randomBetween(10, 1000),
        submitterDealID: randomBetween(10, 1000),
        dealType: Math.random() < 0.2 ? 'Physical' : 'Financial',
        bidFlag: Math.random() < 0.5 ? 'Buy' : 'Sell',
        current: current,
        previous: previous,
        pl1: randomBetween(10000, 30000),
        pl2: randomBetween(8000, 35000),
        gainDx: randomBetween(35000, 1000),
        sxPx: randomBetween(10000, 30000),
        batch: batch,
    };
}

function updateSomeItems(updateCount) {
    var itemsToUpdate = [];
    for (var k = 0; k < updateCount; k++) {
        if (globalRowData.length === 0) {
            continue;
        }
        var indexToUpdate = Math.floor(Math.random() * globalRowData.length);
        var itemToUpdate = globalRowData[indexToUpdate];

        var field = VALUE_FIELDS[Math.floor(Math.random() * VALUE_FIELDS.length)];
        itemToUpdate[field] += randomBetween(-8000, 8200);

        itemsToUpdate.push(itemToUpdate);
    }

    return itemsToUpdate;
}

function startUpdates(thisUpdateId) {
    postMessage({
        type: 'start',
        updateCount: UPDATES_PER_MESSAGE,
        interval: MILLISECONDS_BETWEEN_MESSAGES,
    });

    var intervalId;
    function intervalFunc() {
        postMessage({
            type: 'updateData',
            records: updateSomeItems(UPDATES_PER_MESSAGE),
        });
        if (thisUpdateId !== latestUpdateId) {
            clearInterval(intervalId);
        }
    }

    intervalId = setInterval(intervalFunc, MILLISECONDS_BETWEEN_MESSAGES);
}

// Initialize Row Data
createRowData();

// Notify that row data is ready
postMessage({
    type: 'setRowData',
    records: globalRowData,
});

// Event Listener for incoming messages
self.addEventListener('message', function (e) {
    latestUpdateId++;
    if (e.data === 'start') {
        startUpdates(latestUpdateId);
    }
});
