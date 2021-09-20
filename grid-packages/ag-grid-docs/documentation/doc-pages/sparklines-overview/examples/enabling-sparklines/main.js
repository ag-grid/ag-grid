var gridOptions = {
    columnDefs: [
        {field: 'symbol', maxWidth: 120},
        {field: 'name',  minWidth: 200 },
        {
            field: 'volume',
            type: 'numericColumn',
            maxWidth: 160,
        },
        {
            field: 'closeHistory',
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
    rowData: getData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
