var columnDefs = [
    {headerName: 'Athlete', field: 'athlete', width: 150},
    {headerName: 'Age', field: 'age', width: 90},
    {headerName: 'Country', field: 'country', width: 120, rowGroup: true, hide: true},
    {headerName: 'Year', field: 'year', width: 90},
    {headerName: 'Date', field: 'date', width: 110},
    {headerName: 'Sport', field: 'sport', width: 110, rowGroup: true, hide: true},
    {headerName: 'Gold', field: 'gold', width: 100},
    {headerName: 'Silver', field: 'silver', width: 100},
    {headerName: 'Bronze', field: 'bronze', width: 100},
    {headerName: 'Total', field: 'total', width: 100}
];

var gridOptions = {
    columnDefs: columnDefs,
    enableSorting: true,
    rememberGroupStateWhenNewData: true,
    rowData: null,
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

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
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