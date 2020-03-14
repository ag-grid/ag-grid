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
        { field: "10" },
        { field: "11" },
        { field: "12" },
        { field: "13" },
        { field: "14" },
        { field: "15" },
        { field: "16" },
        { field: "17" },
        { field: "18" },
        { field: "19" },
        { field: "20" }
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
    return Array.apply(null, Array(1000));
}

document.addEventListener("DOMContentLoaded", function() {
    var gridDiv = document.querySelector("#myGrid");
    new agGrid.Grid(gridDiv, gridOptions);
});