function getData() {
    var rowData = []

    for (var i = 0; i < 10; i++) {
        var category = categories[i % categories.length]
        rowData.push(createNewRowData(category))
    }
    return rowData
}

// make the data three 10 times bigger
var names = [
    'Elly',
    'Shane',
    'Niall',
    'Rob',
    'John',
    'Sean',
    'Dicky',
    'Willy',
    'Shaggy',
    'Spud',
    'Sugar',
    'Spice',
]
var models = [
    'Mondeo',
    'Celica',
    'Boxter',
    'Minty',
    'Snacky',
    'FastCar',
    'Biscuit',
    'Whoooper',
    'Scoooper',
    'Jet Blaster',
]
var categories = ['Sold', 'For Sale', 'In Workshop']


function createNewRowData(category) {
    var newData = {
        // use make if provided, otherwise select random make
        category: category,
        model: models[Math.floor(Math.random() * models.length)],
        price: Math.floor(Math.random() * 800000) + 20000,
        zombies: names[Math.floor(Math.random() * names.length)],
        style: 'Smooth',
        clothes: 'Jeans',
    }
    return newData
}
