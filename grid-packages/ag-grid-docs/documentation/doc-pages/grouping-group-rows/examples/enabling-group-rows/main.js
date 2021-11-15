var gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        {
            field: 'athlete',
            minWidth: 250,
            cellRenderer: function(params) {
                return `<span style="margin-left: 60px">${params.value}</span)`;
            }
        },
        { field: 'sport', minWidth: 200 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        resizable: true,
    },
    groupDisplayType: 'groupRows',
    animateRows: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(function (data) {
            gridOptions.api.setRowData(data);
        });
});
