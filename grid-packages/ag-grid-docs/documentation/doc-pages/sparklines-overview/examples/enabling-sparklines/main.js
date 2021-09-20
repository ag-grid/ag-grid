var gridOptions = {
    columnDefs: [
        {field: 'symbol', maxWidth: 120},
        {field: 'name'},
        {
            field: 'volume',
            type: 'numericColumn',
            maxWidth: 120,
            valueFormatter: function (params) {
                return formatter.format(params.value);
            }
        },
        {
            field: 'history',
            headerName: 'Close History',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'line'
                },
            },
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
    },
    rowData: getData().slice(0, 100),
};

var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
});

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
