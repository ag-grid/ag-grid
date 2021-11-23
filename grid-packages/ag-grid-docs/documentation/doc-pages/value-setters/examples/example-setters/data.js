function getData() {
    var rowData = []
    var firstNames = ['Niall', 'John', 'Rob', 'Alberto', 'Bas', 'Dimple', 'Sean']
    var lastNames = [
        'Pink',
        'Black',
        'White',
        'Brown',
        'Smith',
        'Smooth',
        'Anderson',
    ]

    for (var i = 0; i < 100; i++) {
        rowData.push({
            a: Math.floor(Math.random() * 100),
            b: Math.floor(Math.random() * 100),
            firstName: firstNames[i % firstNames.length],
            lastName: lastNames[i % lastNames.length],
        })
    }

    return rowData
}