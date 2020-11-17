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
    {handset: 'Hauwei P40', price: 599},
    {handset: 'Google Pixel 5', price: 589},
    {handset: 'Apple iPhone 12', price: 849},
    {handset: 'Samsung Galaxy S10', price: 499},
    {handset: 'Motorola Edge', price: 549},
    {handset: 'Sony Xperia', price: 279},
];

function generateData() {
    var data = [];
    for(var i = 0; i < numRows; i++) {
        var phone = phones[getRandomNumber(0, phones.length)];
        var saleDate = randomDate(new Date(2020, 0, 1), new Date(2020, 11, 31));
        var quarter = 'Q' + Math.floor((saleDate.getMonth() + 3) / 3);

        data.push({
            salesRep: names[getRandomNumber(0, names.length)],
            handset: phone.handset,
            sale: phone.price,
            saleDate: saleDate,
            quarter: quarter,
        });
    }

    data.sort(function(a,b) {
        return a.saleDate.getTime() - b.saleDate.getTime();
    });

    data.forEach(function(d) {
        d.saleDate = d.saleDate.toISOString().substring(0, 10);
    });

    // console.log(data);
    //
    return data;

    // return [
    //     {
    //         "salesRep": "Aden Moreno",
    //         "handset": "Motorola Edge",
    //         "sale": 549,
    //         "saleDate": "2020-06-26",
    //         "quarter": "Q2"
    //     },
    //     {
    //         "salesRep": "Jermaine Price",
    //         "handset": "Motorola Edge",
    //         "sale": 549,
    //         "saleDate": "2020-06-30",
    //         "quarter": "Q2"
    //     },
    //     {
    //         "salesRep": "Charlie Dodd",
    //         "handset": "Hauwei P40",
    //         "sale": 599,
    //         "saleDate": "2020-07-20",
    //         "quarter": "Q3"
    //     }
    // ]
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}