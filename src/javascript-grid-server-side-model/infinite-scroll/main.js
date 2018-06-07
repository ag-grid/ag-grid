var columnDefs = [
    {field: 'id'},
    {field: 'athlete', width: 150},
    {field: 'age'},
    {field: 'country'},
    {field: 'year'},
    {field: 'sport'},
    {field: 'gold'},
    {field: 'silver'},
    {field: 'bronze'}
];

var gridOptions = {
    defaultColDef: {
        width: 100,
        suppressFilter: true
    },
    columnDefs: columnDefs,
    enableColResize: true,
    // use the enterprise row model
    rowModelType: 'serverSide',
    // don't show the grouping in a panel at the top
    toolPanelSuppressPivotMode: true,
    toolPanelSuppressValues: true,
    toolPanelSuppressRowGroups: true,
    toolPanelSuppressSideButtons: true,
    cacheBlockSize: 100,
    maxBlocksInCache: 2,
    getRowNodeId: function(item) {
        return item.id;
    },
    animateRows: true,
    icons: {
        groupLoading: '<img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/javascript-grid-server-side-model/spinner.gif" style="width:22px;height:22px;">'
    }
};


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinners.json'}).then(function(data) {

        // add id to data
        var idSequence = 0;
        data.forEach( function(item) {
            item.id = idSequence++;
        });

        var dataSource = {
            getRows: function (params) {
                var startRow = params.request.startRow;
                var endRow = params.request.endRow;

                console.log('asking for ' + startRow + ' to ' + endRow);

                // To make the demo look real, wait for 500ms before returning
                setTimeout( function() {

                    // take a slice of the total rows
                    var rowsThisPage = data.slice(startRow, endRow);

                    // if on or after the last page, work out the last row.
                    var lastRow = -1;
                    if (data.length <= params.endRow) {
                        lastRow = data.length;
                    }

                    // call the success callback
                    params.successCallback(rowsThisPage, lastRow);
                }, 500);
            }
        };

        gridOptions.api.setServerSideDatasource(dataSource);
    });
});