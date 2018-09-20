var columnDefs = [
    {field: 'athlete'},
    {field: 'country'},
    {field: 'year', width: 100},
    {field: 'gold', width: 100, cellRenderer: 'medalCellRenderer'},
    {field: 'silver', width: 100, cellRenderer: 'medalCellRenderer'},
    {field: 'bronze', width: 100, cellRenderer: 'medalCellRenderer'},
    {field: 'total', width: 100}
];

var gridOptions = {
    columnDefs: columnDefs,
    components: {
        'medalCellRenderer': MedalCellRenderer
    }
};

// cell renderer class
function MedalCellRenderer() {}

// init method gets the details of the cell to be rendere
MedalCellRenderer.prototype.init = function(params) {
    this.eGui = document.createElement('span');
    var text = '';
    // one star for each medal
    for (var i = 0; i<params.value; i++) {
        text += '#';
    }
    this.eGui.innerHTML = text;
};

MedalCellRenderer.prototype.getGui = function() {
    return this.eGui;
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