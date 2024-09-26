const MIN_BOOK_COUNT = 1;
const MAX_BOOK_COUNT = 5;
const MIN_TRADE_COUNT = 1;
const MAX_TRADE_COUNT = 5;

const products = [
    'Palm Oil',
    'Rubber',
    'Wool',
    'Amber',
    'Copper',
    'Lead',
    'Zinc',
    'Tin',
    'Aluminium',
    'Aluminium Alloy',
    'Nickel',
    'Cobalt',
    'Molybdenum',
    'Recycled Steel',
    'Corn',
    'Oats',
    'Rough Rice',
    'Soybeans',
    'Rapeseed',
    'Soybean Meal',
    'Soybean Oil',
    'Wheat',
    'Milk',
    'Coca',
    'Coffee C',
    'Cotton No.2',
    'Sugar No.11',
    'Sugar No.14',
];

const portfolios = ['Aggressive', 'Defensive', 'Income', 'Speculative', 'Hybrid'];

let nextTradeId = 0;
let nextBookId = 62472;

export var data = [];

// IIFE to create initial data
(function () {
    const lastUpdated = new Date();

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        for (let j = 0; j < portfolios.length; j++) {
            const portfolio = portfolios[j];

            const bookCount = randomBetween(MAX_BOOK_COUNT, MIN_BOOK_COUNT);

            for (let k = 0; k < bookCount; k++) {
                const book = createBookName();
                const tradeCount = randomBetween(MAX_TRADE_COUNT, MIN_TRADE_COUNT);
                for (let l = 0; l < tradeCount; l++) {
                    const trade = createTradeRecord(product, portfolio, book);

                    trade.updateCount = 0;
                    trade.lastUpdated = lastUpdated;

                    data.push(trade);
                }
            }
        }
    }
})();

export var dataObservers = [];

export function randomUpdates({ numRemove, numAdd, numUpdate }) {
    // removes
    const remove = [];
    for (let i = 0; i < Math.ceil(numRemove); i++) {
        const idx = randomBetween(0, data.length - 1);
        const d = data[idx];
        data.splice(idx, 1);
        remove.push(d);
    }

    // updates
    const update = [];
    for (let i = 0; i < numUpdate; i++) {
        const idx = randomBetween(0, data.length - 1);
        const d = data[idx];
        d.previous = d.current;
        d.current = d.previous + 13;
        d.lastUpdated = new Date();
        d.updateCount = ++d.updateCount;
        update.push(d);
    }

    // adds
    const add = [];
    const lastUpdate = new Date();
    for (let i = 0; i < Math.ceil(numAdd); i++) {
        const product = products[randomBetween(0, products.length - 1)];
        const portfolio = portfolios[randomBetween(0, portfolios.length - 1)];
        const book = createBookName();
        const newRecord = createTradeRecord(product, portfolio, book);
        newRecord.lastUpdated = lastUpdate;
        newRecord.updateCount = 0;
        add.push(newRecord);
    }
    data.push(...add);

    // notify observers
    dataObservers.forEach((obs) => obs({ update, add, remove }));
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createTradeRecord(product, portfolio, book) {
    const current = Math.floor(Math.random() * 100000) + 100;
    const previous = current + Math.floor(Math.random() * 10000) - 2000;
    const trade = {
        product: product,
        portfolio: portfolio,
        book: book,
        tradeId: createTradeId(),
        submitterID: randomBetween(10, 1000),
        submitterDealID: randomBetween(10, 1000),
        dealType: Math.random() < 0.2 ? 'Physical' : 'Financial',
        bidFlag: Math.random() < 0.5 ? 'Buy' : 'Sell',
        current: current,
        previous: previous,
        pl1: randomBetween(100, 1000),
        pl2: randomBetween(100, 1000),
        gainDx: randomBetween(100, 1000),
        sxPx: randomBetween(100, 1000),
        _99Out: randomBetween(100, 1000),
    };
    return trade;
}

function createBookName() {
    return 'GL-' + nextBookId++;
}

function createTradeId() {
    return nextTradeId++;
}
