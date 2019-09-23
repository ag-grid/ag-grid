var gridOptions = {
    columnDefs: getInitialColumnDefs(),
    defaultColDef: {
        width: 110,
        filter: true
    },
    sideBar: 'filters',
    onDisplayedColumnsChanged: onDisplayedColumnsChanged
};

function getInitialColumnDefs() {
    return [
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
}

function onDisplayedColumnsChanged(params) {
    //get current column order
    var gridCols = params.columnApi.getAllGridColumns();
    var orderedGridColDefs = gridCols.map(col => col.getColDef());

    // update filters tool panel with new column order
    var filtersToolPanel = params.api.getToolPanelInstance('filters');
    filtersToolPanel.setFilterLayout(orderedGridColDefs);
}

function customFilters() {
    var customFilterLayout = [
        { field: "athlete" },
        { field: "country" },
        { field: "sport" },
        { field: "age" }
    ];

    var filtersToolPanel = gridOptions.api.getToolPanelInstance('filters');
    filtersToolPanel.setFilterLayout(customFilterLayout);
}

function sortedLayout(asc) {
    var copiedColDefs = getInitialColumnDefs().slice(); // don't mutate original

    var sortedColDefs = copiedColDefs.sort(function(d1, d2) {
        if (d1.field < d2.field) return asc ? -1 : 1;
        if (d1.field > d2.field) return asc ? 1 : -1;
        return 0;
    });

    var filtersToolPanel = gridOptions.api.getToolPanelInstance('filters');
    filtersToolPanel.setFilterLayout(sortedColDefs);
}

function reset() {
    var filtersToolPanel = gridOptions.api.getToolPanelInstance('filters');
    filtersToolPanel.setFilterLayout(getInitialColumnDefs());
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
