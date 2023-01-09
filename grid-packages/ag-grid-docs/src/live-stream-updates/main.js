function MyWorker(listener) {
    // update these to change the stress test parameters
    var STRESS_TEST_MESSAGE_COUNT = 1000;
    var STRESS_TEST_UPDATES_PER_MESSAGE = 100;

// update these to change the
    var LOAD_TEST_UPDATES_PER_MESSAGE = 100;
    var LOAD_TEST_MILLISECONDS_BETWEEN_MESSAGES = 100;

// update these to change the size of the data initially loaded into the grid for updating
    var BOOK_COUNT = 15;
    var TRADE_COUNT = 5;

// add / remove products to change the data set
    var PRODUCTS = [
        "Palm Oil",
        "Rubber",
        "Wool",
        "Amber",
        "Copper",
        "Lead",
        "Zinc",
        "Tin",
        "Aluminium",
        "Aluminium Alloy",
        "Nickel",
        "Cobalt",
        "Molybdenum",
        "Recycled Steel",
        "Corn",
        "Oats",
        "Rough Rice",
        "Soybeans",
        "Rapeseed",
        "Soybean Meal",
        "Soybean Oil",
        "Wheat",
        "Milk",
        "Coca",
        "Coffee C",
        "Cotton No.2",
        "Sugar No.11",
        "Sugar No.14"
    ];

// add / remove portfolios to change the data set
    var PORTFOLIOS = ["Aggressive", "Defensive", "Income", "Speculative", "Hybrid"];

// these are the list of columns that updates go to
    var VALUE_FIELDS = ["current", "previous", "pl1", "pl2", "gainDx", "sxPx", "_99Out"];

// a list of the data, that we modify as we go. if you are using an immutable
// data store (such as Redux) then this would be similar to your store of data.
    var globalRowData;

// start the book id's and trade id's at some future random number,
// looks more realistic than starting them at 0
    var nextBookId = 62472;
    var nextTradeId = 24287;
    var nextBatchId = 101;

// build up the test data
    function createRowData() {
        globalRowData = [];
        var thisBatch = nextBatchId++;
        for (var i = 0; i < PRODUCTS.length; i++) {
            var product = PRODUCTS[i];
            for (var j = 0; j < PORTFOLIOS.length; j++) {
                var portfolio = PORTFOLIOS[j];

                for (var k = 0; k < BOOK_COUNT; k++) {
                    var book = createBookName();
                    for (var l = 0; l < TRADE_COUNT; l++) {
                        var trade = createTradeRecord(product, portfolio, book, thisBatch);
                        globalRowData.push(trade);
                    }
                }
            }
        }
        // console.log("Total number of records sent to grid = " + globalRowData.length);
    }

    function randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function createTradeRecord(product, portfolio, book, batch) {
        var current = Math.floor(Math.random() * 100000) + 100;
        var previous = current + Math.floor(Math.random() * 10000) - 2000;
        var trade = {
            product: product,
            portfolio: portfolio,
            book: book,
            trade: createTradeId(),
            submitterID: randomBetween(10, 1000),
            submitterDealID: randomBetween(10, 1000),
            dealType: Math.random() < 0.2 ? "Physical" : "Financial",
            bidFlag: Math.random() < 0.5 ? "Buy" : "Sell",
            current: current,
            previous: previous,
            pl1: randomBetween(100, 1000),
            pl2: randomBetween(100, 1000),
            gainDx: randomBetween(100, 1000),
            sxPx: randomBetween(100, 1000),
            _99Out: randomBetween(100, 1000),
            batch: batch
        };
        return trade;
    }

    function createBookName() {
        nextBookId++;
        return "GL-" + nextBookId;
    }

    function createTradeId() {
        nextTradeId++;
        return nextTradeId;
    }

    createRowData();

    listener({
        type: "setRowData",
        records: globalRowData
    });

    var latestTestNumber = 0;

    function updateSomeItems(updateCount) {
        var itemsToUpdate = [];
        for (var k = 0; k < updateCount; k++) {
            if (globalRowData.length === 0) {
                continue;
            }
            var indexToUpdate = Math.floor(Math.random() * globalRowData.length);
            var itemToUpdate = globalRowData[indexToUpdate];

            // make a copy of the item, and make some changes, so we are behaving
            // similar to how the
            var field = VALUE_FIELDS[Math.floor(Math.random() * VALUE_FIELDS.length)];
            itemToUpdate[field] = Math.floor(Math.random() * 100000);

            itemsToUpdate.push(itemToUpdate);
        }
        return itemsToUpdate;
    }

    function sendMessagesWithThrottle(thisTestNumber) {
        var messageCount = null;

        listener({
            type: "start",
            messageCount: messageCount,
            updateCount: LOAD_TEST_UPDATES_PER_MESSAGE,
            interval: LOAD_TEST_MILLISECONDS_BETWEEN_MESSAGES
        });

        var intervalId;

        function intervalFunc() {
            listener({
                type: "updateData",
                records: updateSomeItems(LOAD_TEST_UPDATES_PER_MESSAGE)
            });
            if (thisTestNumber !== latestTestNumber) {
                clearInterval(intervalId);
            }
        }

        intervalId = setInterval(intervalFunc, LOAD_TEST_MILLISECONDS_BETWEEN_MESSAGES);
    }

    function sendMessagesNoThrottle() {
        listener({
            type: "start",
            messageCount: STRESS_TEST_MESSAGE_COUNT,
            updateCount: STRESS_TEST_UPDATES_PER_MESSAGE,
            interval: null
        });

        // pump in 1000 messages without waiting
        for (var i = 0; i <= STRESS_TEST_MESSAGE_COUNT; i++) {
            listener({
                type: "updateData",
                records: updateSomeItems(STRESS_TEST_UPDATES_PER_MESSAGE)
            });
        }

        listener({
            type: "end",
            messageCount: STRESS_TEST_MESSAGE_COUNT,
            updateCount: STRESS_TEST_UPDATES_PER_MESSAGE
        });
    }

    // self.addEventListener("message", function(e) {
    //     // any previous tests will see that this test number
    //     // has increased and will then stop their tests
    //     latestTestNumber++;
    //     switch (e.data) {
    //         case "startStress":
    //             // console.log("starting stress test");
    //             sendMessagesNoThrottle();
    //             break;
    //         case "startLoad":
    //             // console.log("starting load test");
    sendMessagesWithThrottle(latestTestNumber);
    //             break;
    //         case "stopTest":
    //             // console.log("stopping test");
    //             // sendMessagesNoThrottle();
    //             break;
    //         default:
    //             // console.log("unknown message type " + e.data);
    //             break;
    //     }
    // });
}

(function () {
    var columnDefs = [
        // these are the row groups, so they are all hidden (they are showd in the group column)
        {
            headerName: "Hierarchy",
            children: [
                {headerName: "Product", field: "product", type: "dimension", rowGroupIndex: 0, hide: true},
                {headerName: "Portfolio", field: "portfolio", type: "dimension", rowGroupIndex: 1, hide: true},
                {headerName: "Book", field: "book", type: "dimension", rowGroupIndex: 2, hide: true}
            ]
        },

        // some string values, that do not get aggregated
        {
            headerName: "Attributes",
            children: [
                {headerName: "Trade", field: "trade", width: 100},
                {headerName: "Deal Type", field: "dealType", type: "dimension"},
                {headerName: "Bid", field: "bidFlag", type: "dimension", width: 100}
            ]
        },

        // all the other columns (visible and not grouped)
        {
            headerName: "Values",
            children: [
                {headerName: "Current", field: "current", type: "measure"},
                {headerName: "Previous", field: "previous", type: "measure"},
                {headerName: "PL 1", field: "pl1", type: "measure"},
                {headerName: "PL 2", field: "pl2", type: "measure"},
                {headerName: "Gain-DX", field: "gainDx", type: "measure"},
                {headerName: "SX / PX", field: "sxPx", type: "measure"},
                {headerName: "99 Out", field: "_99Out", type: "measure"},
                {headerName: "Submitter ID", field: "submitterID", type: "measure"},
                {headerName: "Submitted Deal ID", field: "submitterDealID", type: "measure"}
            ]
        }
    ];

    function numberCellFormatter(params) {
        return Math.floor(params.value)
            .toString()
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }

    var gridOptions = {
        defaultColDef: {
            width: 120,
            sortable: true,
            resizable: true
        },
        columnTypes: {
            dimension: {
                enableRowGroup: true,
                enablePivot: true
            },
            measure: {
                width: 150,
                aggFunc: "sum",
                enableValue: true,
                cellClass: "number",
                valueFormatter: numberCellFormatter,
                cellRenderer: "agAnimateShowChangeCellRenderer"
            }
        },
        columnDefs: columnDefs,
        statusBar: {
            items: [
                {component: 'agAggregationComponent'}
            ]
        },
        animateRows: true,
        enableRangeSelection: true,
        rowGroupPanelShow: "always",
        pivotPanelShow: "always",
        suppressAggFuncInHeader: true,
        autoGroupColumnDef: {
            width: 200
        },
        getRowId: function (params) {
            return params.data.trade;
        }
    };

    var testStartTime;
    var worker;

    function startWorker() {
        MyWorker(function (e) {
            switch (e.type) {
                case "start":
                    testStartTime = new Date().getTime();
                    logTestStart(e.messageCount, e.updateCount, e.interval);
                    break;
                case "end":
                    logStressResults(e.messageCount, e.updateCount);
                    break;
                case "setRowData":
                    gridOptions.api.setRowData(e.records);
                    break;
                case "updateData":
                    gridOptions.api.applyTransactionAsync({update: e.records});
                    break;
                default:
                // console.log("unrecognised event type " + e.type);
            }
        });
    }

    function logTestStart(messageCount, updateCount, interval) {
        var message = messageCount
            ? "Sending " + messageCount + " messages at once with " + updateCount + " record updates each."
            : "Sending 1 message with " +
            updateCount +
            " updates every " +
            interval +
            " milliseconds, that's " +
            (1000 / interval * updateCount).toLocaleString() +
            " updates per second.";

        // console.log(message);
    }

    function logStressResults(messageCount, updateCount) {
        var testEndTime = new Date().getTime();
        var duration = testEndTime - testStartTime;
        var totalUpdates = messageCount * updateCount;

        var updatesPerSecond = Math.floor(totalUpdates / duration * 1000);

        logMessage(
            "Processed " + totalUpdates.toLocaleString() + " updates in " + duration.toLocaleString() + "ms, that's " + updatesPerSecond.toLocaleString() + " updates per second."
        );
    }

    function initLiveStreamUpdates() {
        if (document.querySelector("#live-stream-updates-grid") && window.agGrid) {
            var eGridDiv = document.querySelector("#live-stream-updates-grid");
            new agGrid.Grid(eGridDiv, gridOptions);
            startWorker();

            setTimeout(function () {
                gridOptions.api.getDisplayedRowAtIndex(2).setExpanded(true);
            }, 800);
            setTimeout(function () {
                gridOptions.api.getDisplayedRowAtIndex(8).setExpanded(true);
            }, 1200);
            setTimeout(function () {
                gridOptions.api.getDisplayedRowAtIndex(9).setExpanded(true);
            }, 1600);
            setTimeout(function () {
                gridOptions.api.getDisplayedRowAtIndex(10).setExpanded(true);
            }, 2000);
        } else {
            setTimeout(() => initLiveStreamUpdates())
        }
    }

    if (document.readyState == "complete") {
        initLiveStreamUpdates();
    } else {
        document.addEventListener("readystatechange", initLiveStreamUpdates);
    }
})();
