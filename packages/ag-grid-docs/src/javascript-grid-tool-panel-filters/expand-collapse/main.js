var columnDefs = [
    { field: "athlete", filter: 'agTextColumnFilter' },
    { field: "age" },
    { field: "country" },
    { field: "year" },
    { field: "date" },
    { field: "sport" },
    { field: "gold" },
    { field: "silver" },
    { field: "bronze" },
    { field: "total" }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        width: 110,
        filter: true
    },
    sideBar: 'filters',
    onGridReady: function(params) {
        params.api.getToolPanelInstance('filters').expandFilters();
    }
};

function collapseAllFilters() {
    gridOptions.api.getToolPanelInstance('filters').collapseFilters();
}

function expandAllFilters() {
    gridOptions.api.getToolPanelInstance('filters').expandFilters();
}

function collapseAgeFilter() {
    gridOptions.api.getToolPanelInstance('filters').collapseFilters(['age']);
}

function expandAgeFilter() {
    gridOptions.api.getToolPanelInstance('filters').expandFilters(['age']);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
