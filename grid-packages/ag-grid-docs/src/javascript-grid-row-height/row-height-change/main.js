var swimmingHeight, groupHeight;

var gridOptions = {
    columnDefs: [
        { field: "country", rowGroup: true },
        { field: "athlete" },
        { field: "date" },
        { field: "sport" },
        { field: "gold" },
        { field: "silver" },
        { field: "bronze" },
        { field: "total" }
    ],
    animateRows: true,
    getRowHeight: function(params) {
        if (params.node.group) {
            return groupHeight;
        } else if (params.data && params.data.sport === 'Swimming') {
            return swimmingHeight;
        }
    }
};

function setSwimmingHeight(height) {
    swimmingHeight = height;
    gridOptions.api.resetRowHeights();
}

function setGroupHeight(height) {
    groupHeight = height;
    gridOptions.api.resetRowHeights();
}

function setZimbabweHeight(height) {
    gridOptions.api.forEachNode(function(rowNode) {
        if (rowNode.data && rowNode.data.country === 'Russia') {
            rowNode.setRowHeight(height);
        }
    });
    gridOptions.api.onRowHeightChanged();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
