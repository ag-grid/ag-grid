var columnDefs = [
    {headerName: "#", colId: "rowNum", valueGetter: "node.id", width: 80},
    {headerName: "Athlete", field: "athlete", width: 200},
    {headerName: "Age", field: "age", width: 100},
    {headerName: "Country", field: "country", width: 200},
    {headerName: "Year", field: "year", width: 200},
    {headerName: "Date", field: "date", width: 200},
    {headerName: "Sport", field: "sport", width: 200},
    {headerName: "Gold", field: "gold", width: 150},
    {headerName: "Silver", field: "silver", width: 150},
    {headerName: "Bronze", field: "bronze", width: 150},
    {headerName: "Total", field: "total", width: 150}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null
};

// obtain reference to input element
var myInput = document.getElementById("my-input");

// intercept key strokes within input element
myInput.addEventListener("keydown", function (event) {
    // code for tab key
    var tabKeyCode = 9;

    // ignore non tab key strokes
    if(event.keyCode !== tabKeyCode) return;

    // prevents tabbing into the url section
    event.preventDefault();

    // scrolls to the first row
    gridOptions.api.ensureIndexVisible(0);

    // scrolls to the first column
    var firstCol = gridOptions.columnApi.getAllDisplayedColumns()[0];
    gridOptions.api.ensureColumnVisible(firstCol);

    // sets focus into the first grid cell
    gridOptions.api.setFocusedCell(0, firstCol);

}, true);


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});