var rowIdSequence = 100

function getData() {
    var data = [];
    [
        'Red',
        'Green',
        'Blue',
        'Red',
        'Green',
        'Blue',
        'Red',
        'Green',
        'Blue',
    ].forEach(function (color) {
        var newDataItem = {
            id: rowIdSequence++,
            color: color,
            value1: Math.floor(Math.random() * 100),
            value2: Math.floor(Math.random() * 100),
        }
        data.push(newDataItem)
    })
    return data
}