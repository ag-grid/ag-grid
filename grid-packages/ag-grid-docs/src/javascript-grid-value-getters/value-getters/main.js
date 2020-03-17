var gridOptions = {
    columnDefs: [
        {
            headerName: "#",
            maxWidth: 100,
            valueGetter: function(params) {
                return params.node.rowIndex;
            }
        },
        { field: 'a' },
        { field: 'b' },
        {
            headerName: "A + B",
            colId: 'a&b',
            valueGetter: function(params) {
                return params.data.a + params.data.b;
            }
        },
        {
            headerName: "A * 1000",
            minWidth: 95,
            valueGetter: function(params) {
                return params.data.a * 1000;
            }
        },
        {
            headerName: "B * 137",
            minWidth: 90,
            valueGetter: function(params) {
                return params.data.b * 137;
            }
        },
        {
            headerName: "Random",
            minWidth: 90,
            valueGetter: function() {
                return Math.floor(Math.random() * 1000);
            }
        },
        {
            headerName: "Chain",
            valueGetter: function(params) {
                return params.getValue('a&b') * 1000;
            }
        },
        {
            headerName: "Const",
            minWidth: 85,
            valueGetter: function() {
                return 99999;
            }
        }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 75,
        // cellClass: 'number-cell'
    },
    rowData: createRowData()
};

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

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
