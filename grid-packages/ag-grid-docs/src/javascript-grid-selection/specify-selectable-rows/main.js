var gridOptions = {
    columnDefs: [
        { field: "athlete" },
        { field: "age", maxWidth: 100 },
        {
            field: "country",
            minWidth: 180,
            headerCheckboxSelection: true,
            checkboxSelection: true
        },
        { field: "year", maxWidth: 120 },
        { field: "date", minWidth: 150 },
        { field: "sport" },
        { field: "gold", aggFunc: 'sum' },
        { field: "silver", aggFunc: 'sum' },
        { field: "bronze", aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        sortable: true,
        resizable: true,
        filter: true,
    },
    rowSelection: 'multiple',
    rowDeselection: true,
    suppressMenuHide: true,
    isRowSelectable: function(rowNode) {
        return rowNode.data ? rowNode.data.year < 2007 : false;
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
