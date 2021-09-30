var gridOptions = {
    columnDefs: [
        { field: 'symbol', maxWidth: 110 },
        { field: 'name', minWidth: 250 },
        {
            headerName: 'Rate of Change',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'area',
                },
            },
            valueGetter: function (params) {
                const formattedData = [];
                const rateOfChange = params.data.rateOfChange;
                const { x, y } = rateOfChange;
                x.map((xVal, i) => formattedData.push([xVal, y[i]]))
                return formattedData;
            },
        },
        { field: 'volume', type: 'numericColumn', maxWidth: 140 }
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
