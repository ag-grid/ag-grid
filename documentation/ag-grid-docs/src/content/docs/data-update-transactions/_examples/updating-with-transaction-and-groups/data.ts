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

export function getData(): any[] {
    const rowData = [];

    for (let i = 0; i < 10; i++) {
        const category = categories[i % categories.length];
        rowData.push(createNewRowData(category));
    }
    return rowData;
}

// make the data three 10 times bigger
const names = ['Elly', 'Shane', 'Niall', 'Rob', 'John', 'Sean', 'Dicky', 'Willy', 'Shaggy', 'Spud', 'Sugar', 'Spice'];
const models = [
    'Mondeo',
    'Celica',
    'Boxster',
    'Minty',
    'Snacky',
    'FastCar',
    'Biscuit',
    'Whoooper',
    'Scoooper',
    'Jet Blaster',
];
var categories = ['Sold', 'For Sale', 'In Workshop'];

export function createNewRowData(category: string) {
    const newData = {
        // use make if provided, otherwise select random make
        category: category,
        model: models[Math.floor(pRandom() * models.length)],
        price: Math.floor(pRandom() * 800000) + 20000,
        zombies: names[Math.floor(pRandom() * names.length)],
        style: 'Smooth',
        clothes: 'Jeans',
    };
    return newData;
}
