// NOTE: The details of this web worker are not important it's just used to simulate streaming updates in the grid.

export function createFinancialDataWorker() {
    // update these to change the number and rate of updates
    const UPDATES_PER_MESSAGE = 100;
    const MILLISECONDS_BETWEEN_MESSAGES = 100;

    // update these to change the size of the data initially loaded into the grid for updating
    const MAX_BOOK_COUNT = 5;
    const MAX_TRADE_COUNT = 5;

    // add / remove products to change the data set
    const PRODUCTS = [
        'Corn',
        'Sugar and Sweeteners',
        'Gold and Silver',
        'Wool',
        'Cheese and Dairy',
        'Neodymium Magnets',
        'Cotton',
        'Feeder Cattle',
        'Sunflower Oil',
        'Wheat',
        'Potatoes',
        'Orange Juice',
        'Tea',
        'Microprocessors',
    ];

    // add / remove portfolios to change the data set
    const PORTFOLIOS = ['Aggressive', 'Defensive', 'Income', 'Speculative', 'Hybrid'];

    // these are the list of columns that updates go to
    const VALUE_FIELDS = ['current', 'previous', 'pl1', 'pl2', 'gainDx', 'sxPx', '_99Out'];

    // a list of the data, that we modify as we go
    let globalRowData;

    // start the book id's and trade id's at some future random number
    let nextBookId = 62472;
    let nextTradeId = 24287;
    let nextBatchId = 101;

    // build up the test data
    function createRowData() {
        globalRowData = [];
        let thisBatch = nextBatchId++;
        const bookCount = Math.random() * MAX_BOOK_COUNT + 1; // At least 1 booking
        for (let k = 0; k < bookCount; k++) {
            for (let j = 0; j < PORTFOLIOS.length; j++) {
                let portfolio = PORTFOLIOS[j];
                for (let i = 0; i < PRODUCTS.length; i++) {
                    const product = PRODUCTS[i];
                    const book = 'GL-' + ++nextBookId;
                    const tradeCount = Math.random() * MAX_TRADE_COUNT + 1; // At least 1 trade
                    for (let l = 0; l < tradeCount; l++) {
                        const trade = createTradeRecord(product, portfolio, book, thisBatch);
                        globalRowData.push(trade);
                    }
                }
            }
        }
        // console.log('Total number of records sent to grid = ' + globalRowData.length);
    }

    function randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function createTradeRecord(product, portfolio, book, batch) {
        const current = Math.floor(Math.random() * 10000) + (Math.random() < 0.45 ? 500 : 19000);
        const previous = current + (Math.random() < 0.5 ? 500 : 19000);

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

    createRowData();

    postMessage({
        type: 'setRowData',
        records: globalRowData,
    });

    function updateSomeItems(updateCount) {
        const itemsToUpdate = [];
        for (let k = 0; k < updateCount; k++) {
            if (globalRowData.length === 0) {
                continue;
            }
            const indexToUpdate = Math.floor(Math.random() * globalRowData.length);
            const itemToUpdate = globalRowData[indexToUpdate];

            const field = VALUE_FIELDS[Math.floor(Math.random() * VALUE_FIELDS.length)];
            itemToUpdate[field] += randomBetween(-8000, 8200);

            itemsToUpdate.push(itemToUpdate);
        }

        return itemsToUpdate;
    }

    let latestUpdateId = 0;
    function startUpdates(thisUpdateId) {
        postMessage({
            type: 'start',
            updateCount: UPDATES_PER_MESSAGE,
            interval: MILLISECONDS_BETWEEN_MESSAGES,
        });

        let intervalId;
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

    self.addEventListener('message', function (e) {
        // used to control start / stop of updates
        latestUpdateId++;
        if (e.data === 'start') startUpdates(latestUpdateId);
    });
}
