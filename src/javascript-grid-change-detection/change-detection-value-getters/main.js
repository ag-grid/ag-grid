var columnDefs = [
    {headerName: 'A', field: 'a', type: 'valueColumn'},
    {headerName: 'B', field: 'b', type: 'valueColumn'},
    {headerName: 'C', field: 'c', type: 'valueColumn'},
    {headerName: 'D', field: 'd', type: 'valueColumn'},
    {headerName: 'E', field: 'e', type: 'valueColumn'},
    {headerName: 'F', field: 'f', type: 'valueColumn'},
    {
        headerName: 'Total',
        valueGetter: 'data.a + data.b + data.c + data.d + data.e + data.f',
        editable: false,
        aggFunc: 'sum',
        cellClass: 'total-col'
    }
];

function getRowData() {
    var rowData = [];
    for (var i = 1; i <= 20; i++) {
        rowData.push({
            group: i < 5 ? 'A' : 'B',
            a: (i * 863) % 100,
            b: (i * 811) % 100,
            c: (i * 743) % 100,
            d: (i * 677) % 100,
            e: (i * 619) % 100,
            f: (i * 571) % 100
        });
    }
    return rowData;
}

var gridOptions = {
    columnTypes: {
        valueColumn: {editable: true, aggFunc: 'sum', valueParser: 'Number(newValue)', filter: 'agNumberColumnFilter'}
    },
    columnDefs: columnDefs,
    rowData: getRowData(),
    groupDefaultExpanded: 1,
    suppressAggFuncInHeader: true,
    enableCellChangeFlash: true,
    animateRows: true,
    enableSorting: true,
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
