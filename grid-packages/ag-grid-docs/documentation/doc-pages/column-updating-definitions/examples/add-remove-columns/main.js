const colDefsMedalsIncluded = [
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

const colDefsMedalsExcluded = [
    {field: 'athlete'},
    {field: 'age'},
    {field: 'country'},
    {field: 'sport'},
    {field: 'year'},
    {field: 'date'}
];

const gridOptions = {
    defaultColDef: {
        initialWidth: 100,
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
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => {
            this.onBtIncludeMedalColumns();
            gridOptionsTop.api.setRowData(data);
        });
});
