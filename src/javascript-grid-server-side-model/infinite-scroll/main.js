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
    rowModelType: 'enterprise',
    // don't show the grouping in a panel at the top
    toolPanelSuppressPivotMode: true,
    toolPanelSuppressValues: true,
    toolPanelSuppressRowGroups: true,
    toolPanelSuppressSideButtons: true,
    cacheBlockSize: 10,
    rowBuffer: 0,
    getRowNodeId: function(item) {
        return item.id;
    },
    animateRows: true,
    icons: {
        groupLoading: '<img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/javascript-grid-enterprise-model/spinner.gif" style="width:22px;height:22px;">'
    }
};

var idSequence = 0;
var allOfTheData;

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinners.json'}).then(function(data) {

        allOfTheData = data;

        allOfTheData.forEach( function(item) {
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
                    var rowsThisPage = allOfTheData.slice(startRow, endRow);
                    // if on or after the last page, work out the last row.
                    var lastRow = -1;
                    if (allOfTheData.length <= params.endRow) {
                        lastRow = allOfTheData.length;
                    }
                    // call the success callback
                    params.successCallback(rowsThisPage, lastRow);
                }, 500);
            }
        };

        gridOptions.api.setEnterpriseDatasource(dataSource);
    });
});

function removeRows(start, count) {
    var rowsToRemove = allOfTheData.slice(start, start + count);
    allOfTheData.splice(start, count);
    gridOptions.api.removeFromEnterpriseCache(null, rowsToRemove);
}


function add() {
  addRows(0,1)
}

function remove() {
  removeRows(0, 1)
}

function addRows(index, count) {

    var newRecords = [];

    for (var i = 0; i<count; i++) {
        var id = idSequence++;

        var newRecord = {
            age: 17,
            athlete: "Niall Crosby",
            bronze: 10,
            country: "Australia",
            date: "01/10/2000",
            gold: 30,
            id: id,
            silver: 20,
            sport: "Swimming",
            total: 5,
            year: 2000
        };

        allOfTheData.splice(index, 0, newRecord);

        newRecords.push(newRecord);
    }

    gridOptions.api.addToEnterpriseCache(null, newRecords, index);
}
