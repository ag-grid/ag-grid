var columnDefs = [
    {headerName: "String (editable)", field: "simple", editable: true, width: 160},
    {headerName: "Bad Number (editable)", field: "numberBad", editable: true, width: 200},
    {headerName: "Good Number (editable)", field: "numberGood", editable: true, width: 200,
        valueFormatter: numberFormatter,
        valueParser: numberParser},
    {headerName: "Name (editable)", editable: true, width: 160,
        valueGetter: nameValueGetter,
        valueSetter: nameValueSetter}
];

function numberFormatter(params) {
    return '£' + formatNumber(params.value);
}

function numberParser(params) {
    return Number(params.newValue);
}

function formatNumber(number) {
    // this puts commas into the number eg 1000 goes to 1,000,
    // i pulled this from stack overflow, i have no idea how it works
    return Math.floor(number).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function nameValueGetter(params) {
    return params.data.firstName + ' ' + params.data.lastName;
}

function nameValueSetter(params) {
    var fullName = params.newValue;
    var nameSplit = fullName.split(' ');
    var newFirstName = nameSplit[0];
    var newLastName = nameSplit[1];
    var data = params.data;
    if (data.firstName !== newFirstName || data.lastName !== newLastName) {
        data.firstName = newFirstName;
        data.lastName = newLastName;
        // return true to tell grid that the value has changed, so it knows
        // to update the cell
        return true;
    } else {
        // return false, the grid doesn't need to update
        return false;
    }
}

function createRowData() {
    var rowData = [];

    var words = ['One', 'Apple', 'Moon', 'Sugar', 'Grid', 'Banana', 'Sunshine', 'Stars', 'Black', 'White', 'Salt', 'Beach'];
    var firstNames = ['Niall', 'John', 'Rob', 'Alberto', 'Bas', 'Dimple', 'Sean'];
    var lastNames = ['Pink', 'Black', 'White', 'Brown', 'Smith', 'Smooth', 'Anderson'];

    for (var i = 0; i<100; i++) {
        var randomWords = words[i % words.length] + ' ' + words[i*17 % words.length];
        rowData.push({
            simple: randomWords,
            numberBad: Math.floor(((i+2) * 173456) % 10000),
            numberGood: Math.floor(((i+2) * 476321) % 10000),
            a: Math.floor(i%4),
            b: Math.floor(i%7),
            firstName: firstNames[i % firstNames.length],
            lastName: lastNames[i % lastNames.length]
        });
    }

    return rowData;
}

var gridOptions = {
    columnDefs: columnDefs,
    rowData: createRowData(),
    enableColResize: true,
    enableRangeSelection: true,
    onCellValueChanged: function(event) {
        console.log('data after changes is: ', event.data);
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
    gridOptions.api.sizeColumnsToFit();
});
