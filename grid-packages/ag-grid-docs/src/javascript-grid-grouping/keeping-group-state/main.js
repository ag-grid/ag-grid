var gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'sport', rowGroup: true, hide: true  },
        { field: 'athlete', minWidth: 200 },
        { field: 'age' },
        { field: 'year' },
        { field: 'date', minWidth: 140 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        sortable: true,
        resizable: true,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    rememberGroupStateWhenNewData: true,
    onGridReady: function(params) {
        params.api.setSortModel([{colId: 'ag-Grid-AutoColumn', sort: 'asc'}]);
    }
};

var allRowData;
var pickingEvenRows;

function refreshData() {
    // in case user hits the 'refresh groups' data before the data was loaded
    if (!allRowData) {
        return;
    }

    // pull out half the data, different half to the last time
    var dataThisTime = [];
    allRowData.forEach(function(item, index) {
        var rowIsEven = index % 2 === 0;
        if ((pickingEvenRows && rowIsEven) || (!pickingEvenRows && !rowIsEven)) {
            dataThisTime.push(item);
        }
    });

    gridOptions.api.setRowData(dataThisTime);

    pickingEvenRows = !pickingEvenRows;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        allRowData = data;
        var dataThisTime = [];
        data.forEach(function(item, index) {
            if (index % 2 === 0) {
                dataThisTime.push(item);
            }
        });

        gridOptions.api.setRowData(dataThisTime);
    });
});
