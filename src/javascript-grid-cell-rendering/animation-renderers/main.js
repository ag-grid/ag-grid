var columnDefs = [
    {headerName: 'Editable A', field: 'a', editable: true, valueParser: numberValueParser},
    {headerName: 'Editable B', field: 'b', editable: true, valueParser: numberValueParser},
    {headerName: 'Editable C', field: 'c', editable: true, valueParser: numberValueParser},
    {headerName: 'API D', field: 'd', valueParser: numberValueParser, cellRenderer:'agAnimateShowChangeCellRenderer'},
    {headerName: 'API E', field: 'e', valueParser: numberValueParser, cellRenderer:'agAnimateShowChangeCellRenderer'},
    // these columns use value getters. volatile=true means the cells will be refreshed when we call refreshVolatileCells
    {headerName: 'Total', valueGetter: 'data.a + data.b + data.c + data.d + data.e', volatile: true, cellRenderer:'agAnimateShowChangeCellRenderer'},
    {headerName: 'Average', valueGetter: '(data.a + data.b + data.c + data.d + data.e) / 5', volatile: true, cellRenderer:'agAnimateSlideCellRenderer'}
];

function createRowData() {
    var rowData = [];

    for (var i = 0; i<20; i++) {
        rowData.push({
            a: Math.floor( ( (i + 323) * 25435) % 10000),
            b: Math.floor( ( (i + 323) * 23221) % 10000),
            c: Math.floor( ( (i + 323) * 468276) % 10000),
            d: 0,
            e: 0
        });
    }

    return rowData;
}

function numberValueParser(params) {
    return Number(params.newValue);
}

function formatNumber(number) {
    // this puts commas into the number eg 1000 goes to 1,000,
    // i pulled this from stack overflow, i have no idea how it works
    return Math.floor(number).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

var gridOptions = {
    defaultColDef: {
        valueFormatter: function (params) {
            return formatNumber(params.value);
        },
        cellClass: 'align-right'
    },
    columnDefs: columnDefs,
    rowData: createRowData(),
    enableColResize: true
};

function onUpdateSomeValues() {
    var rowCount = gridOptions.api.getDisplayedRowCount();
    for (var i = 0; i<10; i++) {
        var row = Math.floor(Math.random() * rowCount);
        var rowNode = gridOptions.api.getDisplayedRowAtIndex(row);
        rowNode.setDataValue('d', Math.floor(Math.random() * 10000));
        rowNode.setDataValue('e', Math.floor(Math.random() * 10000));
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
    gridOptions.api.sizeColumnsToFit();
});
