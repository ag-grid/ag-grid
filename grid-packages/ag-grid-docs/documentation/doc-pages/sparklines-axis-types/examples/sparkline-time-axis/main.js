var gridOptions = {
    columnDefs: [
        { field: 'symbol', maxWidth: 110 },
        { field: 'name', minWidth: 250 },
        {
            field: 'change',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'area',
                    axis: {
                        // set x-axis type to 'time'
                        type: 'time'
                    },
                    marker: {
                        size: 3
                    }
                },
            },
        },
        { field: 'volume', type: 'numericColumn', maxWidth: 140 },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
    },
    rowData: getData(),
    rowHeight: 50,
};


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
