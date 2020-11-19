var columnDefs = [
    { field: 'athlete', width: 200 },
    { field: 'age', width: 100 },
    { field: 'country', width: 150 },
    { field: 'year', width: 120 },
    { field: 'sport', width: 200 },
    // in the total col, we have a value getter, which usually means we don't need to provide a field
    // however the master/slave depends on the column id (which is derived from the field if provided) in
    // order ot match up the columns
    {
        headerName: 'Total',
        field: 'total',
        valueGetter: 'data.gold + data.silver + data.bronze',
        width: 200
    },
    { field: 'gold', width: 100 },
    { field: 'silver', width: 100 },
    { field: 'bronze', width: 100 }
];

var dataForBottomGrid = [
    {
        athlete: 'Total',
        age: '15 - 61',
        country: 'Ireland',
        year: '2020',
        date: '26/11/1970',
        sport: 'Synchronised Riding',
        gold: 55,
        silver: 65,
        bronze: 12
    }
];

// this is the grid options for the top grid
var gridOptionsTop = {
    defaultColDef: {
        editable: true,
        sortable: true,
        resizable: true,
        filter: true,
        flex: 1,
        minWidth: 100
    },
    columnDefs: columnDefs,
    rowData: null,
    debug: true,
    // don't show the horizontal scrollbar on the top grid
    suppressHorizontalScroll: true,
    alignedGrids: []
};

// this is the grid options for the bottom grid
var gridOptionsBottom = {
    defaultColDef: {
        editable: true,
        sortable: true,
        resizable: true,
        filter: true,
        flex: 1,
        minWidth: 100
    },
    columnDefs: columnDefs,
    // we are hard coding the data here, it's just for demo purposes
    rowData: dataForBottomGrid,
    debug: true,
    rowClass: 'bold-row',
    // hide the header on the bottom grid
    headerHeight: 0,
    alignedGrids: []
};

gridOptionsTop.alignedGrids.push(gridOptionsBottom);
gridOptionsBottom.alignedGrids.push(gridOptionsTop);

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDivTop = document.querySelector('#myGridTop');
    new agGrid.Grid(gridDivTop, gridOptionsTop);

    var gridDivBottom = document.querySelector('#myGridBottom');
    new agGrid.Grid(gridDivBottom, gridOptionsBottom);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptionsTop.api.setRowData(data);
            gridOptionsTop.columnApi.autoSizeAllColumns();
        });
});
