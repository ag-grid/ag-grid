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
    rowDragPassive: true,
    groupDefaultExpanded: 1,
    onRowDragMove: onRowDragMove
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

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult.slice(0,20));
        }
    };
});