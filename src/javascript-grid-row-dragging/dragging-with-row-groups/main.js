var columnDefs = [
    {field: "athlete", rowDrag: function(params) {
        // only rows that are NOT groups should be draggable
        return !params.node.group;
    }},
    {field: "country", rowGroup: true},
    {field: "year"},
    {field: "date"},
    {field: "sport"},
    {field: "gold"},
    {field: "silver"},
    {field: "bronze"}
];

var gridOptions = {
    // this tells the grid we are doing updates when setting new data
    defaultColDef: {width: 150},
    columnDefs: columnDefs,
    animateRows: true,
    enableSorting: true,
    enableFilter: true,
    groupDefaultExpanded: 1,
    onRowDragMove: onRowDragMove,
    onGridReady: function() {
        gridOptions.api.setRowData(olympicWinnersData);
    }
};

function onRowDragMove(event) {
    let movingNode = event.node;
    let overNode = event.overNode;

    // find out what country group we are hovering over
    let groupCountry;
    if (overNode.group) {
        // if over a group, we take the group key (which will be the
        // country as we are grouping by country)
        groupCountry = overNode.key;
    } else {
        // if over a non-group, we take the country directly
        groupCountry = overNode.data.country;
    }

    let needToChangeParent = movingNode.country !== groupCountry;

    if (needToChangeParent) {
        let movingData = movingNode.data;
        movingData.country = groupCountry;
        gridOptions.api.updateRowData({
            update: [movingData]
        });
        gridOptions.api.clearFocusedCell();
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});