var columnDefs = [
    { headerName: "#", colId: "rowNum", valueGetter: "node.id" },
    { field: "athlete", minWidth: 170 },
    { field: "age" },
    { field: "country" },
    { field: "year" },
    { field: "date" },
    { field: "sport" },
    { field: "gold" },
    { field: "silver" },
    { field: "bronze" },
    { field: "total" }
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true,
    }
};

// obtain reference to input element
var myInput = document.getElementById("my-input");

// intercept key strokes within input element
myInput.addEventListener("keydown", function(event) {
    // code for tab key
    var tabKeyCode = 9;

    // ignore non tab key strokes
    if (event.keyCode !== tabKeyCode) return;

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

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
