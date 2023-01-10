const MIN_BOOK_COUNT = 1;
const MAX_BOOK_COUNT = 1;
const MIN_TRADE_COUNT = 2;
const MAX_TRADE_COUNT = 2;

const products = [
    'Palm Oil',
];

const portfolios = ['Aggressive', 'Hybrid', 'Defensive', 'Income', 'Speculative'];

let nextTradeId = 0;
let nextBookId = 62472;

var data = [];

// IIFE to create initial data
(function () {   

  for (let i = 0; i < products.length; i++) {
        let product = products[i];
        for (let j = 0; j < portfolios.length; j++) {
            let portfolio = portfolios[j];

            let bookCount = randomBetween(MIN_BOOK_COUNT, MAX_BOOK_COUNT);

            for (let k = 0; k < bookCount; k++) {
                let book = createBookName();
                let tradeCount = randomBetween(
                    MIN_TRADE_COUNT,
                    MAX_TRADE_COUNT,
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

function updatePortfolio(oldPortfolio, newPortfolio) {
    const createGroup = !data.some(record => record.portfolio === newPortfolio);

    const moved = [];
    data.forEach(record => {
        if (record.portfolio === oldPortfolio) {
            record.portfolio = newPortfolio;
            moved.push(record);
        }
    });

    if (!moved.length) {
        return;
    }

    dataObservers.forEach(obs => obs({
        add: createGroup ? [{ portfolio: newPortfolio }] : [],
        remove: [{ portfolio: oldPortfolio }],
    }));

    if (!createGroup) {
        dataObservers.forEach(obs => obs({
            route: [newPortfolio],
            add: moved,
        }));
    }
}

function deleteWhere(predicate) {
    // removes
    const remove = {};
    data = data.filter(record => {
        if (predicate(record)) {
            if (!remove[record.portfolio]) {
                remove[record.portfolio] = [];
            }
            remove[record.portfolio].push(record);
            return false;
        }
        return true;
    });

    const removedGroups = [];
    Object.entries(remove).forEach(([portfolio, removedRecords]) => {
        if (!data.some(record => record.portfolio === portfolio)) {
            removedGroups.push({ portfolio: portfolio });
        } else {
            dataObservers.forEach(obs => obs({route:[portfolio], remove: removedRecords})); 
        }
    });

    dataObservers.forEach(obs => obs({ remove: removedGroups }));
}

function createRecord(product, portfolio, book) {
    const createGroup = !data.some(record => record.portfolio === portfolio);

    const newRecord = createTradeRecord(product, portfolio, book);
    data.push(newRecord);

    if (createGroup) {
        dataObservers.forEach(obs => obs({ add: [{ portfolio: portfolio }]}));
    } else {
        dataObservers.forEach(obs => obs({ route: [portfolio], add: [newRecord]}));
    }
}

let numRemove = 500;
let numAdd = 500;
let numUpdate = 500;
function randomUpdates() {   
    // removes
    const remove = [];
    for(let i=0; i<(Math.ceil(numRemove)); i++) {      
        const idx = randomBetween(0, data.length-1);
        const d = data[idx];
        data.splice(idx, 1);
        remove.push(d);
    }  

    // updates
    const update = [];
    for(let i=0; i< numUpdate; i++) {            
        const idx = randomBetween(0, data.length-1);
        const d = data[idx];
        d.previous = d.current;
        d.current = d.previous + 13;
        update.push(d);
    } 

    // adds
    const add = [];
    for(let i=0; i<(Math.ceil(numAdd)); i++) {       
        const product = products[randomBetween(0, products.length-1)];
        const portfolio = portfolios[randomBetween(0, portfolios.length-1)];
        const book = createBookName();        
        const newRecord = createTradeRecord(product, portfolio, book);
        add.push(newRecord);
    }
    data.push(...add);

    // notify observers
    dataObservers.forEach(obs => obs({update, add, remove})); 
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
