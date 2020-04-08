var columnDefs = [
    {
        field: 'athlete',
        rowSpan: function(params) {
            var athlete = params.data.athlete;
            if (athlete === 'Aleksey Nemov') {
                // have all Russia age columns width 2
                return 2;
            } else if (athlete === 'Ryan Lochte') {
                // have all United States column width 4
                return 4;
            } else {
                // all other rows should be just normal
                return 1;
            }
        },
        cellClassRules: {
            "cell-span": "value==='Aleksey Nemov' || value==='Ryan Lochte'"
        },
        width: 200
    },
    { field: 'age', width: 100 },
    { field: 'country' },
    { field: 'year', width: 100 },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        width: 170,
        resizable: true
    },
    suppressRowTransform: true,
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
