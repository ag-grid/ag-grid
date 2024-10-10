const MIN_BOOK_COUNT = 10;
const MAX_BOOK_COUNT = 20;

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

// start the book id's and trade id's at some future random number,
// looks more realistic than starting them at 0
let nextBookId = 62472;
let nextTradeId = 24287;

// a list of the data, that we modify as we go. if you are using an immutable
// data store (such as Redux) then this would be similar to your store of data.
export var globalRowData: any[];

// build up the test data
export function getData() {
    globalRowData = [];
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
                    globalRowData.push(trade);
                }
            }
        }
    }
}

const pRandom = (() => {
    // From https://stackoverflow.com/a/3062783
    let seed = 123_456_789;
    const m = 2 ** 32;
    const a = 1_103_515_245;
    const c = 12_345;

    return () => {
        seed = (a * seed + c) % m;
        return seed / m;
    };
})();

function randomBetween(min: number, max: number) {
    return Math.floor(pRandom() * (max - min + 1)) + min;
}

function createTradeRecord(product: string, portfolio: string, book: string) {
    const current = Math.floor(pRandom() * 100000) + 100;
    const previous = current + Math.floor(pRandom() * 10000) - 2000;
    const trade = {
        product: product,
        portfolio: portfolio,
        book: book,
        trade: createTradeId(),
        submitterID: randomBetween(10, 1000),
        submitterDealID: randomBetween(10, 1000),
        dealType: pRandom() < 0.2 ? 'Physical' : 'Financial',
        bidFlag: pRandom() < 0.5 ? 'Buy' : 'Sell',
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
    nextBookId++;
    return 'GL-' + nextBookId;
}

function createTradeId() {
    nextTradeId++;
    return nextTradeId;
}
