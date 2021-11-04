const columnDefs = [
    {field: "country", rowGroup: true, hide: true},
    {field: "year", filter: 'agNumberColumnFilter'},
    {field: "gold", aggFunc: 'sum'},
    {field: "silver", aggFunc: 'sum'},
    {field: "bronze", aggFunc: 'sum'},
    {field: "total", aggFunc: 'sum'}
];

const gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        resizable: true
    },
    suppressAggFilteredOnly: true,
    autoGroupColumnDef: {
        headerName: "Country",
        field: "athlete"
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => gridOptions.api.setRowData(data));
});
