var columnDefs = [
    {field: "athlete", rowDrag: function(params) {
        console.log(params);
        return true;
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
    deltaRowDataMode: true,
    defaultColDef: {width: 150},
    columnDefs: columnDefs,
    animateRows: true,
    enableSorting: true,
    enableFilter: true,
    rowDragPassive: true,
    onRowDragMove: onRowDragMove,
    getRowNodeId: getRowNodeId
};

var immutableStore;

function getRowNodeId(data) {
    return data.id
}

function onRowDragMove(event) {
    let movingNode = event.node;
    let overNode = event.overNode;

    let rowNeedsToMove = movingNode !== overNode;

    if (rowNeedsToMove) {
        // the list of rows we have is data, not row nodes, so extract the data
        let movingData = movingNode.data;
        let overData = overNode.data;

        let fromIndex = immutableStore.indexOf(movingData);
        let toIndex = immutableStore.indexOf(overData);

        let newStore = immutableStore.slice();
        moveInArray(newStore, fromIndex, toIndex);

        immutableStore = newStore;
        gridOptions.api.setRowData(newStore);

        gridOptions.api.clearFocusedCell();
    }
}

function moveInArray(arr, fromIndex, toIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
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
            immutableStore = httpResult;
            // hack in id for each data item, this is needed when deltaRowDataMode=true
            immutableStore.forEach( function(data, index) {
                data.id = index;
            });
            gridOptions.api.setRowData(httpResult);
        }
    };
});