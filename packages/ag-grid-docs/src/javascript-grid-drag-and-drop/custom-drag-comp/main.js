var rowIdSequence = 100;

var colDefs = [
    {cellRenderer: DragSourceCellRenderer},
    {field: "id"},
    {field: "color"},
    {field: "value1"},
    {field: "value2"}
];

var rowClassRules = {
    "red-row": 'data.color == "Red"',
    "green-row": 'data.color == "Green"',
    "blue-row": 'data.color == "Blue"',
};

var gridOptions = {
    defaultColDef: {
        width: 80,
        sortable: true,
        filter: true,
        resizable: true
    },
    rowClassRules: rowClassRules,
    rowData: createRowData(),
    rowDragManaged: true,
    columnDefs: colDefs,
    animateRows: true
};

function createRowData() {
    var data = [];
    ['Red', 'Green', 'Blue','Red', 'Green', 'Blue','Red', 'Green', 'Blue'].forEach(function(color) {
        var newDataItem = {
            id: rowIdSequence++,
            color: color,
            value1: Math.floor(Math.random()*100),
            value2: Math.floor(Math.random()*100)
        };
        data.push(newDataItem);
    });
    return data;
}

function onDragOver(event) {
    var dragSupported = event.dataTransfer.types.indexOf('text/plain') >= 0;
    if (dragSupported) {
        event.dataTransfer.dropEffect = "move";
        event.preventDefault();
    }
}

function onDrop(event) {
    var textData = event.dataTransfer.getData("text/plain");

    var eJsonRow = document.createElement('div');
    eJsonRow.classList.add('json-row');
    eJsonRow.innerText = textData;

    var eJsonDisplay = document.querySelector('#eJsonDisplay');
    eJsonDisplay.appendChild(eJsonRow);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});

function DragSourceCellRenderer() {}

DragSourceCellRenderer.prototype.init = function(params) {

    var eTemp = document.createElement('div');
    eTemp.innerHTML = '<div draggable="true">Drag Me!</div>';

    this.eGui = eTemp.firstChild;
    this.rowNode = params.node;

    this.onDragStartListener = this.onDragStart.bind(this);
    this.eGui.addEventListener('dragstart', this.onDragStartListener)
};

DragSourceCellRenderer.prototype.onDragStart = function(dragEvent) {
    dragEvent.dataTransfer.setData('text/plain', "Dragged item with ID: " + this.rowNode.data.id);
    dragEvent.dataTransfer.setDragImage(dragImage, 20, 20);
};

DragSourceCellRenderer.prototype.getGui = function() {
    return this.eGui;
};

DragSourceCellRenderer.prototype.destroy = function() {
    this.eGui.removeEventListener('dragstart', this.onDragStartListener)
};
