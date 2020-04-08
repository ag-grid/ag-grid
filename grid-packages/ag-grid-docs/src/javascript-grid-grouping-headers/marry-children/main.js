function createNormalColDefs() {
    return [
        {
            headerName: 'Athlete Details',
            marryChildren: true,
            children: [
                { field: 'athlete', colId: 'athlete' },
                { field: 'country', colId: 'country' }
            ]
        },
        { field: 'age', colId: 'age' },
        {
            headerName: 'Sports Results',
            marryChildren: true,
            children: [
                { field: 'sport', colId: 'sport' },
                { field: 'total', colId: 'total' },
                { field: 'gold', colId: 'gold' },
                { field: 'silver', colId: 'silver' },
                { field: 'bronze', colId: 'bronze' }
            ]
        }
    ];
}

var gridOptions = {
    defaultColDef: {
        resizable: true,
        width: 160
    },
    debug: true,
    columnDefs: createNormalColDefs(),
    rowData: null
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
