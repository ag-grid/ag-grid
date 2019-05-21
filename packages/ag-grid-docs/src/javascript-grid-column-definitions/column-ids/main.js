
function createRowData() {
    var data = [];
    for (var i = 0; i<20; i++) {
        data.push({
            height: Math.floor(Math.random()*100),
            width: Math.floor(Math.random()*100),
            depth: Math.floor(Math.random()*100)
        });
    }
    return data;
}

var gridOptions = {
    columnDefs: [
        // colId will be 'firstCol'
        {headerName: 'Col 1', colId: 'firstCol', field: 'height'},
        // colId will be 'firstCol_1', cos 'firstCol' already taken
        {headerName: 'Col 2', colId: 'firstCol', field: 'height'},

        // colId will be 'height'
        {headerName: 'Col 3', field: 'height'},
        // colId will be 'height_1', cos 'height' already taken
        {headerName: 'Col 4', field: 'height'},

        // no colId, no field, so grid generated ID
        {headerName: 'Col 5', valueGetter: 'data.width'},
        {headerName: 'Col 6', valueGetter: 'data.width'}
    ],
    rowData: createRowData(),
    onGridReady: function(params) {
        var cols = params.columnApi.getAllColumns();
        cols.forEach(function(col) {
            var colDef = col.getUserProvidedColDef();
            console.log(colDef.headerName + ', Column ID = ' + col.getId(), colDef);
        });
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
