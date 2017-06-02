var columnDefs = [
    {headerName: "ID", field: "id"},
    {headerName: "Make", field: "make"},
    {headerName: "Price", field: "price", filter: "number"},
    {headerName: "Val 1", field: "val1", filter: "number"},
    {headerName: "Val 2", field: "val2", filter: "number"},
    {headerName: "Val 3", field: "val3", filter: "number"},
    {headerName: "Val 4", field: "val4", filter: "number"},
    {headerName: "Val 5", field: "val5", filter: "number"},
    {headerName: "Val 6", field: "val6", filter: "number"},
    {headerName: "Val 7", field: "val7", filter: "number"},
    {headerName: "Val 8", field: "val8", filter: "number"},
    {headerName: "Val 9", field: "val9", filter: "number"},
    {headerName: "Val 10", field: "val10", filter: "number"}
];

var makes = ['Toyota','Ford','BMW','Phantom','Porsche'];

var gridOptions = {
    floatingTopRowData: [{},{}],
    floatingBottomRowData: [{},{}],
    defaultColDef: {
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true
    },
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    columnDefs: columnDefs,
    animateRows: true,
    enableStatusBar: true,
    enableRangeSelection: true,
    enableColResize: true,
    enableSorting: true,
    enableFilter: true,
    autoHeight: true
};

function setRowData(rowCount) {
    var rowData = [];
    for (var i = 0; i<rowCount; i++) {
        rowData.push({
            id: 'D' + (1000 + i),
            make: makes[Math.floor(Math.random()*makes.length)],
            price: Math.floor(Math.random()*100000),
            val1: Math.floor(Math.random()*1000),
            val2: Math.floor(Math.random()*1000),
            val3: Math.floor(Math.random()*1000),
            val4: Math.floor(Math.random()*1000),
            val5: Math.floor(Math.random()*1000),
            val6: Math.floor(Math.random()*1000),
            val7: Math.floor(Math.random()*1000),
            val8: Math.floor(Math.random()*1000),
            val9: Math.floor(Math.random()*1000),
            val10: Math.floor(Math.random()*1000)
        });
    }
    gridOptions.api.setRowData(rowData);

    document.querySelector('#currentRowCount').innerHTML = rowCount;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
    setRowData(5);
});