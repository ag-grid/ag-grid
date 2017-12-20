var columnDefs = [
    {headerName: "Accented", field: "accented", width: 150}
];

var gridOptions = {
    columnDefs: columnDefs,
    enableSorting: true,
    animateRows: true,
    sortingOrder: ['desc','asc',null],
    accentedSort: true,
    rowData:[
        {accented:'aáàä'},
        {accented:'aàáä'},
        {accented:'aäàá'}
    ]
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});