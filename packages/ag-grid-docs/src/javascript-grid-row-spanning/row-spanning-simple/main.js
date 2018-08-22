var columnDefs = [
    {field: 'athlete',
        rowSpan: function(params) {
            var athlete = params.data.athlete;
            if (athlete=== 'Aleksey Nemov') {
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
    {field: 'age'},
    {field: 'country'},
    {field: 'year'},
    {field: 'date'},
    {field: 'sport'},
    {field: 'gold'},
    {field: 'silver'},
    {field: 'bronze'},
    {field: 'total'}
];

var gridOptions = {
    suppressRowTransform: true,
    columnDefs: columnDefs,
    enableColResize: true,
    defaultColDef: {
        width: 100
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});
