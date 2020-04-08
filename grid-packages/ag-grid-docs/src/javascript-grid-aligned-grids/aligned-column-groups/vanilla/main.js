var columnDefs = [
    {
        headerName: "<span style='background-color: lightblue'>Group 1</span>",
        groupId: "Group1",
        children: [
            { field: "athlete", pinned: true, width: 100 },
            { field: "age", pinned: true, columnGroupShow: 'open', width: 100 },
            { field: "country", width: 100 },
            { field: "year", columnGroupShow: 'open', width: 100 },
            { field: "date", width: 100 },
            { field: "sport", columnGroupShow: 'open', width: 100 },
            { field: "date", width: 100 },
            { field: "sport", columnGroupShow: 'open', width: 100 }
        ]
    },
    {
        headerName: "<span style='background-color: lightgreen'>Group 2</span>",
        groupId: "Group2",
        children: [
            { field: "athlete", pinned: true, width: 100 },
            { field: "age", pinned: true, columnGroupShow: 'open', width: 100 },
            { field: "country", width: 100 },
            { field: "year", columnGroupShow: 'open', width: 100 },
            { field: "date", width: 100 },
            { field: "sport", columnGroupShow: 'open', width: 100 },
            { field: "date", width: 100 },
            { field: "sport", columnGroupShow: 'open', width: 100 }
        ]
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
    rowData: null,
    debug: true,
    alignedGrids: []
};

gridOptionsTop.alignedGrids.push(gridOptionsBottom);
gridOptionsBottom.alignedGrids.push(gridOptionsTop);

function setData(rowData) {
    gridOptionsTop.api.setRowData(rowData);
    gridOptionsBottom.api.setRowData(rowData);
    gridOptionsTop.api.sizeColumnsToFit();

    // mix up some columns
    gridOptionsTop.columnApi.moveColumnByIndex(11, 4);
    gridOptionsTop.columnApi.moveColumnByIndex(11, 4);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDivTop = document.querySelector('#myGridTop');
    new agGrid.Grid(gridDivTop, gridOptionsTop);

    var gridDivBottom = document.querySelector('#myGridBottom');
    new agGrid.Grid(gridDivBottom, gridOptionsBottom);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            setData(data);
        });
});
