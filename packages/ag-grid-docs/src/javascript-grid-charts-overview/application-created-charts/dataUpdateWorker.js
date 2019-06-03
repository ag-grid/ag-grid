"use strict";

// NOTE: The details of this web worker are not important it's just used to simulate streaming updates in the grid.

// update these to change the number and rate of updates
var UPDATES_PER_MESSAGE = 100;
var MILLISECONDS_BETWEEN_MESSAGES = 100;

// update these to change the size of the data initially loaded into the grid for updating
var BOOK_COUNT = 5;
var TRADE_COUNT = 2;

// add / remove products to change the data set
var PRODUCTS = ['Cobalt','Rubber','Wool','Amber','Corn','Nickel','Copper','Oats','Coffee','Wheat','Lead','Zinc','Tin','Coca'];

// add / remove portfolios to change the data set
var PORTFOLIOS = ['Aggressive','Defensive','Income','Speculative','Hybrid'];

// these are the list of columns that updates go to
var VALUE_FIELDS = ['current','previous','pl1','pl2','gainDx','sxPx','_99Out'];

// a list of the data, that we modify as we go
var globalRowData;

// start the book id's and trade id's at some future random number
var nextBookId = 62472;
var nextTradeId = 24287;
var nextBatchId = 101;

// build up the test data
function createRowData() {
    globalRowData = [];
    var thisBatch = nextBatchId++;
    for (var k = 0; k<BOOK_COUNT; k++) {
        for (var j = 0; j<PORTFOLIOS.length; j++) {
            var portfolio = PORTFOLIOS[j];
            for (var i = 0; i<PRODUCTS.length; i++) {
                var product = PRODUCTS[i];
                var book = `GL-${++nextBookId}`;
                for (var l = 0; l < TRADE_COUNT; l++) {
                    var trade = createTradeRecord(product, portfolio, book, thisBatch);
                    globalRowData.push(trade);
                }
            }
        }
    }
    // console.log('Total number of records sent to grid = ' + globalRowData.length);
}

function randomBetween(min,max) {
    return Math.floor(Math.random()*(max - min + 1)) + min;
}

function createTradeRecord(product, portfolio, book, batch) {
    var current = Math.floor(Math.random()*10000) + (Math.random()<.45 ? 500 : 19000);
    var previous = current + (Math.random()<.5 ? 500 : 19000);

    return {
        product: product,
        portfolio: portfolio,
        book: book,
        trade: ++nextTradeId,
        submitterID: randomBetween(10,1000),
        submitterDealID: randomBetween(10,1000),
        dealType: (Math.random()<.2) ? 'Physical' : 'Financial',
        bidFlag: (Math.random()<.5) ? 'Buy' : 'Sell',
        current: current,
        previous: previous,
        pl1: randomBetween(10000,30000),
        pl2: randomBetween(8000,35000),
        gainDx: randomBetween(35000,1000),
        sxPx: randomBetween(10000,30000),
        batch: batch
    };
}

createRowData();

postMessage({
    type: 'setRowData',
    records: globalRowData
});

function updateSomeItems(updateCount) {
    var itemsToUpdate = [];
    for (var k = 0; k<updateCount; k++) {
        if (globalRowData.length === 0) { continue; }
        var indexToUpdate = Math.floor(Math.random()*globalRowData.length);
        var itemToUpdate = globalRowData[indexToUpdate];

        var field = VALUE_FIELDS[Math.floor(Math.random() * VALUE_FIELDS.length)];
        itemToUpdate[field] += randomBetween(-8000,8200);

        itemsToUpdate.push(itemToUpdate);
    }

    return itemsToUpdate;
}

var latestUpdateId = 0;
function startUpdates(thisUpdateId) {
    postMessage({
        type: 'start',
        updateCount: UPDATES_PER_MESSAGE,
        interval: MILLISECONDS_BETWEEN_MESSAGES
    });

    var intervalId;
    function intervalFunc() {
        postMessage({
            type: 'updateData',
            records: updateSomeItems(UPDATES_PER_MESSAGE)
        });
        if (thisUpdateId!==latestUpdateId) {
            clearInterval(intervalId);
        }
    }

    intervalId = setInterval(intervalFunc, MILLISECONDS_BETWEEN_MESSAGES);
}

self.addEventListener('message', function(e) {
    // used to control start / stop of updates
    latestUpdateId++;
    if (e.data === 'start') startUpdates(latestUpdateId);
});
