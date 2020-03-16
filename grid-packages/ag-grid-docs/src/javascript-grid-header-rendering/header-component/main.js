var columnDefs = [
    {field: "athlete", suppressMenu: true},
    {
        field: "age",
        sortable: false,
        headerComponentParams: {menuIcon: 'fa-external-link-alt'}
    },
    {field: "country", suppressMenu: true},
    {field: "year", sortable: false},
    {field: "date", suppressMenu: true},
    {field: "sport", sortable: false},
    {field: "gold", headerComponentParams: {menuIcon: 'fa-cog'}},
    {field: "silver", sortable: false},
    {field: "bronze", suppressMenu: true},
    {field: "total", sortable: false}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    suppressMenuHide: true,
    components: {
        agColumnHeader: CustomHeader
    },
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true,
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
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
