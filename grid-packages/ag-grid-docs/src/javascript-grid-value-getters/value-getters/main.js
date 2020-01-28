var columnDefs = [
    {headerName: "Row Num", valueGetter: function(params) {
        return params.node.rowIndex;
    }},
    {headerName: "A", field: 'a'},
    {headerName: "B", field: 'b'},
    {headerName: "A + B", colId: 'a&b',
        valueGetter: function(params) {
            return params.data.a + params.data.b;
        }},
    {headerName: "A * 1000",
        valueGetter: function(params) {
            return params.data.a * 1000;
        }},
    {headerName: "B * 137",
        valueGetter: function(params) {
            return params.data.b * 137;
        }},
    {headerName: "Random",
        valueGetter: function() {
            return Math.floor(Math.random() * 1000);
        }},
    {headerName: "Chain", cellClass: 'number-cell',
        valueGetter: function(params) {
            return params.getValue('a&b') * 1000;
        }},
    {headerName: "Const",
        valueGetter: function() {
        return 99999;
    }}
];

function createRowData() {
    var rowData = [];

    for (var i = 0; i<100; i++) {
        rowData.push({
            a: Math.floor(i%4),
            b: Math.floor(i%7)
        });
    }

    return rowData;
}

var gridOptions = {
    defaultColDef: {
        resizable: true,
        cellClass: 'number-cell'
    },
    columnDefs: columnDefs,
    rowData: createRowData(),
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
