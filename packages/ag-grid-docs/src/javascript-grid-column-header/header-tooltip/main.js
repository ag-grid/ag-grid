var columnDefs = [
    {field: 'athlete'},
    {field: 'age'},
    {field: 'country', headerTooltip: 'The country the athlete represented'},
    {field: 'year', headerTooltip: 'The year of the olympics'},
    {field: 'date', headerTooltip: 'The date of the olympics'},
    {field: 'sport', headerTooltip: 'The sport the medal was for'},
    {field: 'gold', headerTooltip: 'How many gold medals'},
    {field: 'silver', headerTooltip: 'How many silver medals'},
    {field: 'bronze', headerTooltip: 'How many bronze medals'},
    {field: 'total', headerTooltip: 'The total number of medals'}
];

var gridOptions = {
    columnDefs: columnDefs,
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
