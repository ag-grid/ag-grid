var numRows = 500;

var names = [
    'Aden Moreno',
    'Alton Watson',
    'Caleb Scott',
    'Cathy Wilkins',
    'Charlie Dodd',
    'Jermaine Price',
    'Reis Vasquez',
];

var phones = [
    { handset: 'Huawei P40', price: 599 },
    { handset: 'Google Pixel 5', price: 589 },
    { handset: 'Apple iPhone 12', price: 849 },
    { handset: 'Samsung Galaxy S10', price: 499 },
    { handset: 'Motorola Edge', price: 549 },
    { handset: 'Sony Xperia', price: 279 },
];

function generateData() {
    var data = [];
    for (var i = 0; i < numRows; i++) {
        var phone = phones[getRandomNumber(0, phones.length)];
        var saleDate = randomDate(new Date(2018, 0, 1), new Date());

        data.push({
            year: saleDate.getFullYear(),
            month: monthNames[saleDate.getMonth()],
            saleDate: saleDate,
            salesRep: names[getRandomNumber(0, names.length)],
            handset: phone.handset,
            sale: phone.price,
        });
    }
    return data;
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
