var colDefsMedalsIncluded = [
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

var colDefsMedalsExcluded = [
    {field: 'athlete'},
    {field: 'age'},
    {field: 'country'},
    {field: 'sport'},
    {field: 'year'},
    {field: 'date'}
];

var gridOptions = {
    defaultColDef: {
        defaultWidth: 100,
        sortable: true,
        resizable: true
    },
    columnDefs: colDefsMedalsIncluded
};

function onBtExcludeMedalColumns() {
    gridOptions.api.setColumnDefs(colDefsMedalsExcluded);
}

function onBtIncludeMedalColumns() {
    gridOptions.api.setColumnDefs(colDefsMedalsIncluded);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            this.onBtIncludeMedalColumns();
            gridOptions.api.setRowData(data);
        });
});
