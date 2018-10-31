var columnDefs = [
    {headerName: "String (editable)", field: "simple", editable: true, width: 160},
    {headerName: "Bad Number (editable)", field: "numberBad", editable: true, width: 200},
    {
        headerName: "Good Number (editable)", field: "numberGood", editable: true, width: 200,
        valueFormatter: '"£" + Math.floor(value).toString().replace(/(\\d)(?=(\\d{3})+(?!\\d))/g, "$1,")',
        valueParser: 'Number(newValue)'
    },
    {
        headerName: "Name (editable)", editable: true, width: 160,
        valueGetter: 'data.firstName + " " + data.lastName',
        valueSetter:
        // holy cow, an expression can span multiple lines!!!
        'var nameSplit = newValue.split(" ");' +
        'var newFirstName = nameSplit[0];' +
        'var newLastName = nameSplit[1];' +
        'if (data.firstName !== newFirstName || data.lastName !== newLastName) {' +
        '  data.firstName = newFirstName;' +
        '  data.lastName = newLastName;' +
        '  return true;' +
        '} else {' +
        '  return false;' +
        '}'
    },
    {headerName: "A", field: 'a', width: 50},
    {headerName: "B", field: 'b', width: 50},
    {headerName: "A + B", valueGetter: 'data.a + data.b', width: 80}
];

function createRowData() {
    var rowData = [];

    var words = ['One', 'Apple', 'Moon', 'Sugar', 'Grid', 'Banana', 'Sunshine', 'Stars', 'Black', 'White', 'Salt', 'Beach'];
    var firstNames = ['Niall', 'John', 'Rob', 'Alberto', 'Bas', 'Dimple', 'Sean'];
    var lastNames = ['Pink', 'Black', 'White', 'Brown', 'Smith', 'Smooth', 'Anderson'];

    for (var i = 0; i < 100; i++) {
        var randomWords = words[i % words.length] + ' ' + words[i * 17 % words.length];
        rowData.push({
            simple: randomWords,
            numberBad: Math.floor(((i + 2) * 173456) % 10000),
            numberGood: Math.floor(((i + 2) * 476321) % 10000),
            a: Math.floor(i % 4),
            b: Math.floor(i % 7),
            firstName: firstNames[i % firstNames.length],
            lastName: lastNames[i % lastNames.length]
        });
    }

    return rowData;
}

function onCellValueChanged(event) {
    console.log('data after changes is: ', event.data);
}

var gridOptions = {
    columnDefs: columnDefs,
    rowData: createRowData(),
    enableColResize: true,
    enableRangeSelection: true,
    onCellValueChanged: onCellValueChanged
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
    gridOptions.api.sizeColumnsToFit();
});
