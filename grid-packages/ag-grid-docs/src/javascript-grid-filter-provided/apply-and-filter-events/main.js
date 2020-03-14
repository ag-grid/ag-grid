var columnDefs = [
    {
        field: "athlete",
        filter: 'agTextColumnFilter',
        filterParams: {
            applyButton: true,
            resetButton: true
        }
    },
    {
        field: "age",
        maxWidth: 100,
        filter: 'agNumberColumnFilter',
        filterParams: {
            applyButton: true,
            resetButton: true,
        }
    },
    {
        field: "country",
        filter: 'agSetColumnFilter',
        filterParams: {
            applyButton: true,
            clearButton: true,
        }
    },
    { field: "year", maxWidth: 100, },
    { field: "sport" },
    { field: "gold", filter: 'agNumberColumnFilter' },
    { field: "silver", filter: 'agNumberColumnFilter' },
    { field: "bronze", filter: 'agNumberColumnFilter' },
    { field: "total", filter: 'agNumberColumnFilter' },
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
    },
    onFilterChanged: function(e) {
        console.log('onFilterChanged', e);
        console.log('gridApi.getFilterModel() =>', e.api.getFilterModel());
    },
    onFilterModified: function(e) {
        console.log('onFilterModified', e);
        console.log('filterInstance.getModel() =>', e.filterInstance.getModel());
        console.log('filterInstance.getModelFromUi() =>', e.filterInstance.getModelFromUi());
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
