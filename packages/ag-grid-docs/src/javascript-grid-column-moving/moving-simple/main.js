var columnDefs = [
    {field: 'athlete', width: 150},
    {field: 'age'},
    {field: 'country', width: 150},
    {field: 'year'},
    {field: 'date'},
    {field: 'sport'},
    {field: 'gold'},
    {field: 'silver'},
    {field: 'bronze'},
    {field: 'total'}
];

var gridOptions = {
    suppressDragLeaveHidesColumns: true,
    columnDefs: columnDefs,
    defaultColDef: {
        width: 100
    }
};

function onMedalsFirst() {
    gridOptions.columnApi.moveColumns(['gold','silver','bronze','total'], 0);
}

function onMedalsLast() {
    gridOptions.columnApi.moveColumns(['gold','silver','bronze','total'], 6);
}

function onCountryFirst() {
    gridOptions.columnApi.moveColumn('country', 0);
}

function onSwapFirstTwo() {
    gridOptions.columnApi.moveColumnByIndex(0, 1);
}

function onPrintColumns() {
    var cols = gridOptions.columnApi.getAllGridColumns();
    var colToNameFunc = function(col, index) {
        return index + ' = ' + col.getId();
    };
    var colNames = cols.map(colToNameFunc).join(', ');
    console.log('columns are: ' + colNames);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});
