var gridOptions = {
    columnDefs: [
        {headerName: "Name", field: "simple" },
        {headerName: "Bad Number", field: "numberBad" },
        {headerName: "Good Number", field: "numberGood", valueParser: numberParser}
    ],
    defaultColDef: {
        flex: 1,
        editable: true,
        resizable: true,
    },
    rowData: createRowData(),
    enableRangeSelection: true,
    onCellValueChanged: function(event) {
        console.log('data after changes is: ', event.data);
    }
};


function numberParser(params) {
    return Number(params.newValue);
}

function createRowData() {
    var rowData = [];

    var words = ['One', 'Apple', 'Moon', 'Sugar', 'Grid', 'Banana', 'Sunshine', 'Stars', 'Black', 'White', 'Salt', 'Beach'];

    for (var i = 0; i<100; i++) {
        rowData.push({
            simple: words[i % words.length],
            numberBad: Math.floor(((i+2) * 173456) % 10000),
            numberGood: Math.floor(((i+2) * 476321) % 10000),
            a: Math.floor(i%4),
            b: Math.floor(i%7)
        });
    }

    return rowData;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
    gridOptions.api.sizeColumnsToFit();
});