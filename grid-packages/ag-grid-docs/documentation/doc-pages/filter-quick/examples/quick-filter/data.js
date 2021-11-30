function getData() {
    var rowData = []
    for (var i = 0; i < 100; i++) {
        // create sample row item
        var rowItem = {
            // is is simple
            a: 'aa' + Math.floor(Math.random() * 10000),
            // but b, c, d and e are all complex objects
            b: {
                name: 'bb' + Math.floor(Math.random() * 10000),
            },
            c: {
                name: 'cc' + Math.floor(Math.random() * 10000),
            },
            d: {
                name: 'dd' + Math.floor(Math.random() * 10000),
            },
            e: {
                name: 'ee' + Math.floor(Math.random() * 10000),
            },
        }
        rowData.push(rowItem)
    }
    return rowData
}