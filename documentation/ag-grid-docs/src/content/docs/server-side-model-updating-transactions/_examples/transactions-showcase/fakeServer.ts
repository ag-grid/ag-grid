function FakeServer() {
    alasql.options.cache = false;

    let intervals = [];
    return {
        randomUpdates: () => {
            intervals.push(setInterval(() => randomTransaction({ numUpdate: 5, numAdd: 2, numRemove: 2 }), 1000));
        },
        stopUpdates: () => {
            intervals.forEach(clearInterval);
            intervals = [];
        },
        getData: function (request) {
            const results = executeQuery(request);

            return {
                success: true,
                rows: results,
            };
        },
        getAggValues: function (groupRow) {
            const whereClause = Object.entries(groupRow)
                .map(([field, val]) => `${field} = "${val}"`)
                .join(' AND ');
            const SQL = `
        SELECT SUM(current) as current, SUM(previous) as previous, COUNT(tradeId) as childCount FROM ? WHERE ${whereClause}
      `;
            return alasql(SQL, [data])[0];
        },
    };

    function executeQuery(request) {
        const groupByResult = executeRowGroupQuery(request);
        const rowGroupCols = request.rowGroupCols;
        const groupKeys = request.groupKeys;

        if (!isDoingGrouping(rowGroupCols, groupKeys)) {
            return groupByResult;
        }

        const groupsToUse = request.rowGroupCols.slice(groupKeys.length, groupKeys.length + 1);
        const groupColId = groupsToUse[0].id;
        const childCountResult = executeGroupChildCountsQuery(request, groupColId);

        // add 'childCount' to group results
        return groupByResult.map(function (group) {
            group['childCount'] = childCountResult[group[groupColId]];
            return group;
        });
    }

    function executeRowGroupQuery(request) {
        const groupByQuery = buildGroupBySql(request);

        return alasql(groupByQuery, [data]);
    }

    function executeGroupChildCountsQuery(request, groupId) {
        const SQL = interpolate('SELECT {0} FROM ? pivot (count({0}) for {0})' + whereSql(request), [groupId]);

        return alasql(SQL, [data])[0];
    }

    function buildGroupBySql(request) {
        return (
            selectSql(request) +
            ' FROM ?' +
            whereSql(request) +
            groupBySql(request) +
            orderBySql(request) +
            limitSql(request)
        );
    }

    function selectSql(request) {
        const rowGroupCols = request.rowGroupCols;
        const valueCols = request.valueCols;
        const groupKeys = request.groupKeys;

        if (isDoingGrouping(rowGroupCols, groupKeys)) {
            const rowGroupCol = rowGroupCols[groupKeys.length];
            const colsToSelect = [rowGroupCol.id];

            valueCols.forEach(function (valueCol) {
                colsToSelect.push(valueCol.aggFunc + '(' + valueCol.id + ') AS ' + valueCol.id);
            });

            return 'SELECT ' + colsToSelect.join(', ');
        }

        return 'SELECT *';
    }

    function whereSql(request) {
        const rowGroups = request.rowGroupCols;
        const groupKeys = request.groupKeys;
        const whereParts = [];

        if (groupKeys) {
            groupKeys.forEach(function (key, i) {
                const value = typeof key === 'string' ? "'" + key + "'" : key;

                whereParts.push(rowGroups[i].id + ' = ' + value);
            });
        }

        if (whereParts.length > 0) {
            return ' WHERE ' + whereParts.join(' AND ');
        }

        return '';
    }

    function groupBySql(request) {
        const rowGroupCols = request.rowGroupCols;
        const groupKeys = request.groupKeys;

        if (isDoingGrouping(rowGroupCols, groupKeys)) {
            const rowGroupCol = rowGroupCols[groupKeys.length];

            return ' GROUP BY ' + rowGroupCol.id + ' HAVING count(*) > 0';
        }

        return '';
    }

    function orderBySql(request) {
        const sortModel = request.sortModel;

        if (sortModel.length === 0) return '';

        const sorts = sortModel.map(function (s) {
            return s.colId + ' ' + s.sort.toUpperCase();
        });

        return ' ORDER BY ' + sorts.join(', ');
    }

    function limitSql(request) {
        if (request.endRow == undefined || request.startRow == undefined) {
            return '';
        }
        const blockSize = request.endRow - request.startRow;

        return ' LIMIT ' + blockSize + ' OFFSET ' + request.startRow;
    }

    function isDoingGrouping(rowGroupCols, groupKeys) {
        // we are not doing grouping if at the lowest level
        return rowGroupCols.length > groupKeys.length;
    }

    function getLastRowIndex(request, results) {
        if (!results || results.length === 0) {
            return null;
        }
        if (request.endRow == undefined || request.startRow == undefined) {
            return results.length;
        }
        const currentLastRow = request.startRow + results.length;

        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }
}

let fakeServerInstance: FakeServer;
export function getFakeServer() {
    if (!fakeServerInstance) {
        fakeServerInstance = new FakeServer();
    }
    return fakeServerInstance;
}

// IE Workaround - as templates literals are not supported
function interpolate(str, o) {
    return str.replace(/{([^{}]*)}/g, function (a, b) {
        const r = o[b];
        return typeof r === 'string' || typeof r === 'number' ? r : a;
    });
}

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

const portfolios = ['Aggressive', 'Defensive', 'Income', 'Speculative', 'Hybrid'];

let nextTradeId = 0;
const FIRST_BOOK_ID = 62472;

const PRODUCT_BOOK_START = {};
products.forEach((product, idx) => {
    PRODUCT_BOOK_START[product] = FIRST_BOOK_ID + portfolios.length * BOOK_COUNT * idx;
});
const PORTFOLIO_BOOK_OFFSET = {};
portfolios.forEach((portfolio, idx) => {
    PORTFOLIO_BOOK_OFFSET[portfolio] = idx * BOOK_COUNT;
});

let nextBookId = 62472;

export const data = [];

// IIFE to create initial data
(function () {
    const lastUpdated = new Date();

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        for (let j = 0; j < portfolios.length; j++) {
            const portfolio = portfolios[j];

            for (let k = 0; k < BOOK_COUNT; k++) {
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

export const dataObservers = [];
export const registerObserver = ({ transactionFunc, groupedFields }) => {
    const existingObserver = dataObservers.find(({ transactionFunc: oldFunc }) => oldFunc === transactionFunc);
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
export function randomTransaction({ numAdd, numUpdate, numRemove }) {
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

    dataObservers.forEach(({ transactionFunc, groupedFields }) => {
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
    });
}

const translateRowsToRoutes = ({ rows, op, fields, mutableTransactionObj }) => {
    rows.forEach((item) => {
        for (let i = 0; i < fields.length; i++) {
            const route = fields.slice(0, i).map((field) => item[field]);
            const routeId = route.join('-');
            const groupRowFields = fields.slice(0, i + 1);
            const groupRow = Object.fromEntries(groupRowFields.map((field) => [field, item[field]]));

            // does a row belonging to this group already exist
            const doesGroupExist = data.some(
                (row) => row !== item && groupRowFields.every((field) => groupRow[field] === row[field])
            );

            const stringifiedRow = JSON.stringify(groupRow);
            let aggValues;
            if (uniqueQueries.has(stringifiedRow)) {
                aggValues = uniqueQueries.get(stringifiedRow);
            } else {
                aggValues = getFakeServer().getAggValues(groupRow);
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
