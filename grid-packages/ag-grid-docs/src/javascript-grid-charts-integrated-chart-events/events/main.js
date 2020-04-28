var columnDefs = [
    { field: "Month", width: 150, chartDataType: 'category' },
    { field: "Sunshine (hours)", chartDataType: 'series' },
    { field: "Rainfall (mm)", chartDataType: 'series' }
];

var gridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    },
    popupParent: document.body,
    columnDefs: columnDefs,
    enableRangeSelection: true,
    enableCharts: true,
    onChartCreated: onChartCreated,
    onChartRangeSelectionChanged: onChartRangeSelectionChanged,
    onChartOptionsChanged: onChartOptionsChanged,
    onChartDestroyed: onChartDestroyed,
};

function onChartCreated(event) {
    console.log('Created chart with ID ' + event.chartId);
}

function onChartRangeSelectionChanged(event) {
    console.log('Changed range selection of chart with ID ' + event.chartId);
}

function onChartOptionsChanged(event) {
    console.log('Changed options of chart with ID ' + event.chartId);
}

function onChartDestroyed(event) {
    console.log('Destroyed chart with ID ' + event.chartId);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/weather_se_england.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
