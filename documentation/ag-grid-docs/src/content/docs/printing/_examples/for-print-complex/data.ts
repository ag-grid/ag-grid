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
            id: i + 1,
            group: 'Group ' + (Math.floor(i / 20) + 1),
            model: models[Math.floor(Math.random() * models.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            country: countries[Math.floor(Math.random() * countries.length)],
            year: 2018 - Math.floor(Math.random() * 20),
            price: 20000 + Math.floor(Math.random() * 100) * 100,
        };
        rowData.push(item);
    }
    return rowData;
}
