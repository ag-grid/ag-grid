var rowIdSequence = 100;

var columnDefs = [
    { valueGetter: "'Drag'", rowDrag: true },
    { field: "id"},
    { field: "color"},
    { field: "value1"},
    { field: "value2"}
];

var gridOptions = {
    defaultColDef: {
        width: 80,
        sortable: true,
        filter: true,
        resizable: true
    },
    rowClassRules: {
        "red-row": 'data.color == "Red"',
        "green-row": 'data.color == "Green"',
        "blue-row": 'data.color == "Blue"',
    },
    rowData: createRowData(),
    rowDragManaged: true,
    columnDefs: columnDefs,
    animateRows: true
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
    el.style.backgroundColor = data.color.toLowerCase();
    el.className = 'tile';
    el.innerHTML =
        '<div class="id">' + data.id + '</div>' +
        '<div class="value">' + data.value1 + '</div>' +
        '<div class="value">' + data.value2 + '</div>';

    return el;

}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    var tileContainer = document.querySelector('.tile-container');

    new agGrid.Grid(gridDiv, gridOptions);

    gridOptions.api.addDropZone(
        tileContainer,
        null,
        function(params) {
            var tile = createTile(params.dragItem.rowNode.data);
            tileContainer.appendChild(tile);
        }
    )
});
