var gridOptions = {
    columnDefs: [
        { field: "1" },
        { field: "2" },
        { field: "3" },
        { field: "4" },
        { field: "5" },
        { field: "6" },
        { field: "7" },
        { field: "8" },
        { field: "9" },
        { field: "10" }
    ],
    defaultColDef: {
        cellRenderer: showOrderCellRenderer,
        width: 80
    },
    rowData: getRowData(),
    rowSelection: 'single',
    rowBuffer: 0,
};

var count = 0;

function showOrderCellRenderer() {
    var eGui = document.createElement("div");
    eGui.innerHTML = ++count;
    var start = new Date();
    while (new Date() - start < 15) {}
    return eGui;
}

function getRowData() {
    // 1000 blank rows for the grid
    return new Array(1000).fill(null);
}

document.addEventListener("DOMContentLoaded", function() {
    var gridDiv = document.querySelector("#myGrid");
    new agGrid.Grid(gridDiv, gridOptions);
});