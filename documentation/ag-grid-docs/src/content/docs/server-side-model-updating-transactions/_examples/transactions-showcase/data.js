const BOOK_COUNT = 3;
const MIN_TRADE_COUNT = 1;
const MAX_TRADE_COUNT = 10;

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
];

const portfolios = [
    'Aggressive',
    'Defensive',
    'Income',
    'Speculative',
    'Hybrid',
];

let nextTradeId = 0;
const FIRST_BOOK_ID = 62472;


const PRODUCT_BOOK_START = {};
products.forEach((product, idx) => {
    PRODUCT_BOOK_START[product] = FIRST_BOOK_ID + (
        (portfolios.length * BOOK_COUNT) * idx
    );
});
const PORTFOLIO_BOOK_OFFSET = {};
portfolios.forEach((portfolio, idx) => {
    PORTFOLIO_BOOK_OFFSET[portfolio] = idx * BOOK_COUNT;
});

let nextBookId = 62472;

var data = [];

// IIFE to create initial data
(function () {
    const lastUpdated = new Date();

    for (let i = 0; i < products.length; i++) {
        let product = products[i];
        for (let j = 0; j < portfolios.length; j++) {
            let portfolio = portfolios[j];

            for (let k = 0; k < BOOK_COUNT; k++) {
                let book = createBookName();
                let tradeCount = randomBetween(
                    MAX_TRADE_COUNT,
                    MIN_TRADE_COUNT
                );
                for (let l = 0; l < tradeCount; l++) {
                    let trade = createTradeRecord(product, portfolio, book);

                    trade.updateCount = 0;
                    trade.lastUpdated = lastUpdated;

                    data.push(trade);
                }
            }
        }
    }
})();

var dataObservers = [];
const registerObserver = ({ transactionFunc, groupedFields }) => {
    const existingObserver = dataObservers.find(
        ({ transactionFunc: oldFunc }) => oldFunc === transactionFunc
    );
    if (existingObserver) {
        existingObserver.groupedFields = groupedFields;
        return;
    }
    dataObservers.push({
        transactionFunc,
        groupedFields,
    });
};

const uniqueQueries = new Map();
function randomTransaction({ numAdd, numUpdate, numRemove }) {
    uniqueQueries.clear();
    // updates
    const update = [];
    for (let i = 0; i < numUpdate && data.length; i++) {
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
    for (let i = 0; i < numAdd; i++) {
        const product = products[randomBetween(0, products.length - 1)];
        const portfolio = portfolios[randomBetween(0, portfolios.length - 1)];
        const bookStart = PRODUCT_BOOK_START[product] + PORTFOLIO_BOOK_OFFSET[portfolio];
        const book = 'GL-' + randomBetween(bookStart, bookStart + BOOK_COUNT - 1);
        const newRecord = createTradeRecord(product, portfolio, book);
        newRecord.lastUpdated = lastUpdate;
        newRecord.updateCount = 0;
        add.push(newRecord);
    }
    // insert new rows at the end
    data.push(...add);

     // removes
    const remove = [];
    for (let i = 0; i < numRemove && data.length; i++) {
        const idx = randomBetween(0, data.length - 1);
        const d = data[idx];
        data.splice(idx, 1);
        remove.push(d);
    }

    dataObservers.forEach(
        ({ transactionFunc, groupedFields }) => {
            const routedTransactions = {};

            translateRowsToRoutes({
                rows: update,
                op: 'update',
                fields: groupedFields,
                mutableTransactionObj: routedTransactions,
            });
            translateRowsToRoutes({
                rows: remove,
                op: 'remove',
                fields: groupedFields,
                mutableTransactionObj: routedTransactions,
            });
            translateRowsToRoutes({
                rows: add,
                op: 'add',
                fields: groupedFields,
                mutableTransactionObj: routedTransactions,
            });

            // may want to filter duplicates here
            Object.values(routedTransactions).forEach(transactionFunc);
        }
    );
}

const translateRowsToRoutes = ({
    rows,
    op,
    fields,
    mutableTransactionObj,
}) => {
    rows.forEach((item) => {
        for (let i = 0; i < fields.length; i++) {
            const route = fields.slice(0, i).map((field) => item[field]);
            const routeId = route.join('-');
            const groupRowFields = fields.slice(0, i + 1);
            const groupRow = Object.fromEntries(
                groupRowFields.map((field) => [field, item[field]])
            );

            // does a row belonging to this group already exist
            const doesGroupExist = data.some(
                (row) =>
                    row !== item &&
                    groupRowFields.every(
                        (field) => groupRow[field] === row[field]
                    )
            );

            const stringifiedRow = JSON.stringify(groupRow);
            let aggValues;
            if (uniqueQueries.has(stringifiedRow)) {
                aggValues = uniqueQueries.get(stringifiedRow);
            } else {
                aggValues = fakeServerInstance.getAggValues(groupRow);
                uniqueQueries.set(stringifiedRow, aggValues);
            }
            const newGroupItem = { ...groupRow, ...aggValues };

            // if not, create a new group row instead
            if (!doesGroupExist) {
                const existingTransaction = mutableTransactionObj[routeId] || {};

                mutableTransactionObj[routeId] = {
                    ...existingTransaction,
                    route,
                    [op]: [...(existingTransaction[op] ?? []), newGroupItem],
                };
                return;
            }

            // if group does exist, update aggregations
            const existingTransaction = mutableTransactionObj[routeId] || {};
            mutableTransactionObj[routeId] = {
                ...existingTransaction,
                route: route,
                update: [...(existingTransaction.update ?? []), newGroupItem],
            };
        }

        // no groups need created, create the leaf row
        const route = fields.map((field) => item[field]);
        const routeId = route.join('-');
        const existingTransaction = mutableTransactionObj[routeId] || {};

        mutableTransactionObj[routeId] = {
            route,
            [op]: [...(existingTransaction[op] ?? []), item],
        };
    });
};

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createTradeRecord(product, portfolio, book) {
    let current = Math.floor(Math.random() * 100000) + 100;
    let previous = current + Math.floor(Math.random() * 10000) - 2000;
    let trade = {
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
