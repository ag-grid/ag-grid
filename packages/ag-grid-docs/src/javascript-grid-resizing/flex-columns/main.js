var columnDefs = [
    {
        headerName: "A",
        field: "author",
        width: 300,
        colSpan: function(params) {
            return params.data === 2 ? 3 : 1
        }
    },
    {
        headerName: "Flexed Columns",
        children: [
            {
                headerName: "B",
                minWidth: 200,
                maxWidth: 350,
                flex: 2
            },
            {
                headerName: "C",
                flex: 1
            }
        ]
    }
];

var gridOptions = {
    defaultColDef: {
        resizable: true,
        cellRenderer: ShowWidthCellRenderer
    },
    columnDefs: columnDefs,
    rowData: [1, 2]
};

function ShowWidthCellRenderer() {}

ShowWidthCellRenderer.prototype.init = function(params) {
    this.eGui = document.createElement("div");
    this.isTotalWidthRow = params.data === 2;
    this.interval = setInterval(this.refreshValue.bind(this), 50);
    this.refreshValue();
};

ShowWidthCellRenderer.prototype.refreshValue = function() {
    if (this.eGui.parentElement) {
        var width = this.eGui.parentElement.offsetWidth;
        this.eGui.textContent = width + "px";
        if (this.isTotalWidthRow) {
            this.eGui.textContent =  "Total width: " + this.eGui.textContent;
        }
    }
};

ShowWidthCellRenderer.prototype.getGui = function() {
    return this.eGui;
};

ShowWidthCellRenderer.prototype.destroy = function() {
    clearInterval(this.interval);
};

// setup the grid after the page has finished loading
document.addEventListener("DOMContentLoaded", function() {
    var gridDiv = document.querySelector("#myGrid");
    new agGrid.Grid(gridDiv, gridOptions);
});
