const models = [
    'Mercedes-AMG C63',
    'BMW M2',
    'Audi TT Roadster',
    'Mazda MX-5',
    'BMW M3',
    'Porsche 718 Boxster',
    'Porsche 718 Cayman',
];
const colors = ['Red', 'Black', 'Green', 'White', 'Blue'];
const countries = ['UK', 'Spain', 'France', 'Ireland', 'USA'];

export function getData(): any[] {
    const rowData = [];
    for (let i = 0; i < 200; i++) {
        const item = {
            model: models[Math.floor(pRandom() * models.length)],
            color: colors[Math.floor(pRandom() * colors.length)],
            country: countries[Math.floor(pRandom() * countries.length)],
            year: 2018 - Math.floor(pRandom() * 20),
            price: 20000 + Math.floor(pRandom() * 100) * 100,
        };
        rowData.push(item);
    }
    return rowData;
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
