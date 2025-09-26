type Store = { symbol: string }[];

// creates a unique symbol, eg 'ADG' or 'ZJD'
function createUniqueRandomSymbol(data: Store) {
    let symbol: string = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let isUnique = false;
    while (!isUnique) {
        symbol = '';
        // create symbol
        for (let i = 0; i < 3; i++) {
            symbol += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        // check uniqueness
        isUnique = true;
        data.forEach(function (oldItem) {
            if (oldItem.symbol === symbol) {
                isUnique = false;
            }
        });
    }
    return symbol;
}

function createItem(data: Store) {
    const item = {
        group: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        symbol: createUniqueRandomSymbol(data),
        price: Math.floor(Math.random() * 100),
    };
    return item;
}

export function getData() {
    const data: Store = [];
    for (let i = 0; i < 5; i++) {
        data.push(createItem(data));
    }
    return data;
}
