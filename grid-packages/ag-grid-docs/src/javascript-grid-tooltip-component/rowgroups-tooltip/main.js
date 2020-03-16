var columnDefs = [
    {field: "country", width: 120, rowGroup: true},
    {field: "year", width: 90, rowGroup: true},
    {field: "sport", width: 110},
    {field: "athlete", width: 200},
    {field: "gold", width: 100},
    {field: "silver", width: 100},
    {field: "bronze", width: 100},
    {field: "total", width: 100},
    {field: "age", width: 90},
    {field: "date", width: 110}
];

var gridOptions = {
    autoGroupColumnDef: {
        headerTooltip: 'Group',
        minWidth: 190,
        tooltipValueGetter: function (params) {
            var count = params.node.allChildrenCount;

            if (count != null) {
                return params.value + ' (' + count + ')';
            }

            return params.value

        }
    },
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    },
    columnDefs: columnDefs,
    animateRows: true,
    rowData: null
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
