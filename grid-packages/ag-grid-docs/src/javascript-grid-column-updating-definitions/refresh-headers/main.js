var columnDefs = [
    {field: "athlete"},
    {field: "age"},
    {field: "country"},
    {field: "year"},
    {field: "date"},
    {field: "sport"},
    {field: "gold"},
    {field: "silver"},
    {field: "bronze"},
    {field: "total"}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    components: {
        CustomHeader: CustomHeader
    },
    defaultColDef: {
        headerComponent: 'CustomHeader'
    }
};

function onBtUpperNames() {
    columnDefs.forEach( function(c) {
        c.headerName = c.field.toUpperCase();
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function onBtLowerNames() {
    columnDefs.forEach( function(c) {
        c.headerName = c.field;
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function onBtFilterOn() {
    columnDefs.forEach( function(c) {
        c.filter = true;
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function onBtFilterOff() {
    columnDefs.forEach( function(c) {
        c.filter = false;
    });
    gridOptions.api.setColumnDefs(columnDefs);
}


function onBtResizeOn() {
    columnDefs.forEach( function(c) {
        c.resizable = true;
    });
    gridOptions.api.setColumnDefs(columnDefs);
}

function onBtResizeOff() {
    columnDefs.forEach( function(c) {
        c.resizable = false;
    });
    gridOptions.api.setColumnDefs(columnDefs);
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'})
        .then(function (data) {
            gridOptions.api.setRowData(data);
        });
});
