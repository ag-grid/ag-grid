var columnDefs = [
    // different ways to define 'categories'
    { field: "athlete", width: 150, chartDataType: 'category' },
    { field: "age", chartDataType: 'category', sort: 'asc' },
    { field: "sport" }, // inferred as category by grid

    // excludes year from charts
    { field: "year", chartDataType: 'excluded' },

    // different ways to define 'series'
    { field: "gold", chartDataType: 'series' },
    { field: "silver", chartDataType: 'series' },
    { field: "bronze" } // inferred as series by grid
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

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/wideSpreadOfSports.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
