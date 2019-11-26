var columnDefs = [
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
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        cellRenderer: ShowOrderCellRenderer,
        width: 80
    },
    rowSelection: 'single',
    rowData: [],
    rowBuffer: 0
};

for (var i=0; i<1000; i++) {
    gridOptions.rowData.push({});
}

var count = 0;

function ShowOrderCellRenderer() {}

ShowOrderCellRenderer.prototype.init = function(params) {
    this.params = params;
    this.eGui = document.createElement("div");
    this.eGui.innerHTML = ++count;
    var start = new Date();
    while (new Date() - start < 15) {}
};

ShowOrderCellRenderer.prototype.getGui = function() {
    return this.eGui;
};

document.addEventListener("DOMContentLoaded", function() {
    var gridDiv = document.querySelector("#myGrid");
    new agGrid.Grid(gridDiv, gridOptions);
});