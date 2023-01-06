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

var data = [];

// IIFE to create initial data
(function () {   

  for (let i = 0; i < products.length; i++) {
        let product = products[i];
        for (let j = 0; j < portfolios.length; j++) {
            let portfolio = portfolios[j];

            let bookCount = randomBetween(MAX_BOOK_COUNT, MIN_BOOK_COUNT);

            for (let k = 0; k < bookCount; k++) {
                let book = createBookName();
                let tradeCount = randomBetween(
                    MAX_TRADE_COUNT,
                    MIN_TRADE_COUNT
                );
                for (let l = 0; l < tradeCount; l++) {
                    let trade = createTradeRecord(product, portfolio, book);
                        
                    data.push(trade);
                }
            }
        }
    }
})();

var dataObservers = [];

function removeRow(idToRemove) {
    const idxToRemove = data.findIndex(item => String(item.tradeId) === idToRemove);
    if (idxToRemove < 0) {
        return;
    }

    const removedRow = data[idxToRemove];
    data.splice(idxToRemove, 1);

    // notify observers
    dataObservers.forEach(obs => obs({ remove: [removedRow] })); 
}

function updateRow(idToUpdate) {
    const idxToUpdate = data.findIndex(item => String(item.tradeId) === idToUpdate);
    if (idxToUpdate < 0) {
        return;
    }

    const updatedRow = data[idxToUpdate];
    updatedRow.previous = updatedRow.current;
    updatedRow.current = updatedRow.previous + 13;

    // notify observers
    dataObservers.forEach(obs => obs({ update: [updatedRow] })); 
}

function addRow(addIndex) {
    const product = products[randomBetween(0, products.length-1)];
    const portfolio = portfolios[randomBetween(0, portfolios.length-1)];
    const book = createBookName();        
    const newRecord = createTradeRecord(product, portfolio, book);

    data.splice(addIndex, 0, newRecord);

    // notify observers
    dataObservers.forEach(obs => obs({ addIndex, add: [newRecord] }));
}

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
