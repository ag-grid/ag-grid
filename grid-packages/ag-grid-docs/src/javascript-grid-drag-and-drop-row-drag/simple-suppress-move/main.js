var rowIdSequence = 100;

var columnDefs = [
    { field: "id", rowDrag: true },
    { field: "color"},
    { field: "value1"},
    { field: "value2"}
];

var gridOptions = {
    defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1
    },
    rowClassRules: {
        "red-row": 'data.color == "Red"',
        "green-row": 'data.color == "Green"',
        "blue-row": 'data.color == "Blue"',
    },
    rowData: createRowData(),
    rowDragManaged: true,
    columnDefs: columnDefs,
    animateRows: true,
    suppressMoveWhenRowDragging: true,
    onGridReady: function(params) {
        addDropZones(params);
    }
};

function createRowData() {
    var data = [];
    ['Red', 'Green', 'Blue','Red', 'Green', 'Blue','Red', 'Green', 'Blue'].forEach(function(color) {
        var newDataItem = {
            id: rowIdSequence++,
            color: color,
            value1: Math.floor(Math.random() * 100),
            value2: Math.floor(Math.random() * 100)
        };
        data.push(newDataItem);
    });
    return data;
}

function createTile(data) {
    var el = document.createElement('div');

    el.classList.add('tile');
    el.classList.add(data.color.toLowerCase());
    el.innerHTML =
        '<div class="id">' + data.id + '</div>' +
        '<div class="value">' + data.value1 + '</div>' +
        '<div class="value">' + data.value2 + '</div>';

    return el;
}

function addDropZones(params) {
    var tileContainer = document.querySelector('.tile-container');

    params.api.addDropZone({
        el: tileContainer,
        onDragStop: function(params) {
            var tile = createTile(params.dragItem.rowNode.data);
            tileContainer.appendChild(tile);
        }
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
