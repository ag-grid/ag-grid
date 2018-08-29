var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 125, suppressMenu: true},
    {
        headerName: "Age",
        field: "age",
        width: 90,
        suppressSorting: true,
        headerComponentParams: {menuIcon: 'fa-external-link'}
    },
    {headerName: "Country", field: "country", width: 120, suppressMenu: true},
    {headerName: "Year", field: "year", width: 90, suppressSorting: true},
    {headerName: "Date", field: "date", width: 100, suppressMenu: true},
    {headerName: "Sport", field: "sport", width: 90, suppressSorting: true},
    {headerName: "Gold", field: "gold", width: 115, headerComponentParams: {menuIcon: 'fa-cog'}},
    {headerName: "Silver", field: "silver", width: 90, suppressSorting: true},
    {headerName: "Bronze", field: "bronze", width: 115, suppressMenu: true},
    {headerName: "Total", field: "total", width: 90, suppressSorting: true}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableFilter: true,
    enableSorting: true,
    enableColResize: true,
    suppressMenuHide: true,
    components: {
        agColumnHeader: CustomHeader
    },
    defaultColDef: {
        width: 100,
        headerComponentParams: {
            menuIcon: 'fa-bars'
        }
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
