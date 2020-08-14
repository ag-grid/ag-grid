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
        sortable: true,
        resizable: true,
        width: 150,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true
    },
    applyColumnDefOrder: true,
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    columnDefs: columnDefs,
    rowData: null
};

function onBtSortAthleteAndMedalsFirst() {
    gridOptions.api.setColumnDefs([
        {field: 'gold'},
        {field: 'silver'},
        {field: 'bronze'},
        {field: 'total'},
        {field: 'athlete', sort: 'asc'},
        {field: 'age'},
        {field: 'country'},
        {field: 'sport'},
        {field: 'year'},
        {field: 'date'}
    ]);
}

function onBtClearSortAthleteAndMedals() {
    gridOptions.api.setColumnDefs([
        {field: 'athlete', sort: null},
        {field: 'age'},
        {field: 'country'},
        {field: 'sport'},
        {field: 'year'},
        {field: 'date'},
        {field: 'gold'},
        {field: 'silver'},
        {field: 'bronze'},
        {field: 'total'}
    ]);
}

function onBtRowGroupCountryThenSport() {
    gridOptions.api.setColumnDefs([
        {field: 'athlete', sort: null},
        {field: 'age'},
        {field: 'country', rowGroupIndex: 0},
        {field: 'sport', rowGroupIndex: 1},
        {field: 'year'},
        {field: 'date'},
        {field: 'gold'},
        {field: 'silver'},
        {field: 'bronze'},
        {field: 'total'}
    ]);
}

function onBtClearAllRowGroups() {
    gridOptions.api.setColumnDefs([
        {field: 'athlete', sort: null},
        {field: 'age'},
        {field: 'country', rowGroupIndex: null},
        {field: 'sport', rowGroupIndex: null},
        {field: 'year'},
        {field: 'date'},
        {field: 'gold'},
        {field: 'silver'},
        {field: 'bronze'},
        {field: 'total'}
    ]);
}

function printColumnDefs() {
    console.log(gridOptions.columnApi.getColumnDefs());
    console.log(gridOptions.columnApi.getColumnState());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'})
        .then(function (data) {
            gridOptions.api.setRowData(data);
        });
});
