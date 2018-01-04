var columnDefs = [
    {field: "athlete", rowDrag: true},
    {field: "country"},
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
    onRowDragMove: onRowDragMove,
    getRowNodeId: getRowNodeId,
    onSortChanged: onSortChanged,
    onFilterChanged: onFilterChanged,
    onGridReady: function onGridReady() {

        // add id to each item, needed for immutable store to work
        immutableStore.forEach( function(data, index) {
            data.id = index;
        });

        gridOptions.api.setRowData(immutableStore);
    }
};

var immutableStore = olympicWinnersData;

var sortActive = false;
var filterActive = false;

// listen for change on sort changed
function onSortChanged() {
    var sortModel = gridOptions.api.getSortModel();
    sortActive = sortModel && sortModel.length > 0;
    updateRowDrag();
}

// listen for changes on filter changed
function onFilterChanged() {
    filterActive = gridOptions.api.isAnyFilterPresent();
    updateRowDrag();
}

function updateRowDrag() {
    // suppress row drag if either sort or filter is active
    var suppressRowDrag = sortActive || filterActive;
    console.log('sortActive = ' + sortActive
        + ', filterActive = ' + filterActive
        + ', allowRowDrag = ' + suppressRowDrag);
    gridOptions.api.setSuppressRowDrag(suppressRowDrag);
}

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

    function moveInArray(arr, fromIndex, toIndex) {
        var element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});