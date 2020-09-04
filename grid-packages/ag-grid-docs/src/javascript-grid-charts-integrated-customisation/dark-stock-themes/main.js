var gridOptions = {
    columnDefs: [
        // { field: 'athlete', width: 150, chartDataType: 'category' },
        { field: 'athlete', chartDataType: 'category' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ],
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true,
    },
    popupParent: document.body,
    enableRangeSelection: true,
    enableCharts: true,
    chartThemes: ['ag-dark', 'ag-material-dark', 'ag-pastel-dark', 'ag-vivid-dark', 'ag-solar-dark'],
    onFirstDataRendered: onFirstDataRendered,
};

function onFirstDataRendered(params) {
    var createRangeChartParams = {
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 79,
            columns: ['age', 'gold', 'silver', 'bronze'],
        },
        chartType: 'groupedColumn',
        chartContainer: document.querySelector('#myChart'),
        aggFunc: 'sum',
    };

    params.api.createRangeChart(createRangeChartParams);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid
        .simpleHttpRequest({
            url:
                'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/wideSpreadOfSports.json',
        })
        .then(function (data) {
            gridOptions.api.setRowData(data);
        });
});
