export async function getData(delay: number = 100): Promise<any[]> {
    return new Promise((resolve) => setTimeout(() => resolve(generateData()), delay));
}

function generateData() {
    const numRows = 500;
    const names = [
        'Aden Moreno',
        'Alton Watson',
        'Caleb Scott',
        'Cathy Wilkins',
        'Charlie Dodd',
        'Jermaine Price',
        'Reis Vasquez',
    ];
    const phones = [
        { handset: 'Huawei P40', price: 599 },
        { handset: 'Google Pixel 5', price: 589 },
        { handset: 'Apple iPhone 12', price: 849 },
        { handset: 'Samsung Galaxy S10', price: 499 },
        { handset: 'Motorola Edge', price: 549 },
        { handset: 'Sony Xperia', price: 279 },
    ];

    return Array.from({ length: numRows }, () => {
        const phone = phones[getRandomNumber(0, phones.length - 1)];
        const saleDate = randomDate(new Date(2020, 0, 1), new Date(2020, 11, 31));

        return {
            salesRep: names[getRandomNumber(0, names.length - 1)],
            handset: phone.handset,
            sale: phone.price,
            saleDate,
        };
    });
}

function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): string {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().substring(0, 10);
}
