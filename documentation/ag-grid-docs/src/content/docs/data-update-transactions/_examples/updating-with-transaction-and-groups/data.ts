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
        model: models[Math.floor(Math.random() * models.length)],
        price: Math.floor(Math.random() * 800000) + 20000,
        zombies: names[Math.floor(Math.random() * names.length)],
        style: 'Smooth',
        clothes: 'Jeans',
    };
    return newData;
}
