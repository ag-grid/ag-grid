var columnDefs = [
    {headerName: "Athlete", field: "athlete", suppressMenu: true},
    {headerName: "Age", field: "age", suppressSorting: true},
    {headerName: "Country", field: "country", suppressMenu: true},
    {headerName: "Year", field: "year", suppressSorting: true},
    {headerName: "Date", field: "date", suppressMenu: true},
    {headerName: "Sport", field: "sport", suppressSorting: true},
    {headerName: "Gold", field: "gold"},
    {headerName: "Silver", field: "silver", suppressSorting: true},
    {headerName: "Bronze", field: "bronze", suppressMenu: true},
    {headerName: "Total", field: "total", suppressSorting: true}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableFilter: true,
    enableSorting: true,
    enableColResize: true,
    suppressMenuHide: true,
    defaultColDef : {
        width: 100,
        headerComponentParams : {
            menuIcon: 'fa-bars',
            template:
            '<div class="ag-cell-label-container" role="presentation">' +
            '  <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
            '  <div ref="eLabel" class="ag-header-cell-label" role="presentation">' +
            '    <span ref="eSortOrder" class="ag-header-icon ag-sort-order" ></span>' +
            '    <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon" ></span>' +
            '    <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon" ></span>' +
            '    <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon" ></span>' +
            '    ** <span ref="eText" class="ag-header-cell-text" role="columnheader"></span>' +
            '    <span ref="eFilter" class="ag-header-icon ag-filter-icon"></span>' +
            '  </div>' +
            '</div>'
        }
    }
};



// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
