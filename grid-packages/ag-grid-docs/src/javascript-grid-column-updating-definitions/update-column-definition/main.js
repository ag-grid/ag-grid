var columnDefs = [
    {field: 'athlete'},
    {field: 'age'},
    {field: 'country'},
    {field: 'sport'},
    {field: 'year'},
    {field: 'date'},
    {field: 'gold'},
    {field: 'silver'},
    {field: 'bronze'},
    {field: 'total'}
];

var gridOptions = {
    defaultColDef: {
        defaultWidth: 100,
        sortable: true,
        resizable: true,
        filter: true
    },
    applyColumnDefOrder: true,
    columnDefs: columnDefs
};

function setHeaderNames() {
    columnDefs.forEach( function(colDef, index ) {
        colDef.headerName = 'C' + index;
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function removeHeaderNames() {
    columnDefs.forEach( function(colDef, index ) {
        colDef.headerName = undefined;
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function setValueFormatters() {
    columnDefs.forEach( function(colDef, index ) {
        colDef.valueFormatter = function(params) {
            return '[ ' + params.value + ' ]';
        };
    });
    gridOptions.api.setColumnDefs(columnDefs);
    gridOptions.api.refreshCells({force: true});
}

function removeValueFormatters() {
    columnDefs.forEach( function(colDef, index ) {
        colDef.valueFormatter = undefined;
    });
    gridOptions.api.setColumnDefs(columnDefs);
    gridOptions.api.refreshCells({force: true});
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
