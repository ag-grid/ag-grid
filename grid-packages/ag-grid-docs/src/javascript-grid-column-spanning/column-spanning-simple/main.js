var columnDefs = [
    { field: 'athlete', pinned: 'left' },
    { field: 'age', pinned: 'left' },
    {
        field: 'country',
        colSpan: function(params) {
            var country = params.data.country;
            if (country === 'Russia') {
                // have all Russia age columns width 2
                return 2;
            } else if (country === 'United States') {
                // have all United States column width 4
                return 4;
            } else {
                // all other rows should be just normal
                return 1;
            }
        }
    },
    { field: 'year' },
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
        width: 150,
        resizable: true
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});
