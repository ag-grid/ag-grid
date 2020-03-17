var rowIdSequence = 100;

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
    columnDefs: [
        {cellRenderer: 'dragSourceCellRenderer'},
        {field: "id"},
        {field: "color"},
        {field: "value1"},
        {field: "value2"}
    ],
    components: {
        dragSourceCellRenderer: DragSourceRenderer,
    },
    animateRows: true
};

function createRowData() {
    var data = [];
    ['Red', 'Green', 'Blue', 'Red', 'Green', 'Blue', 'Red', 'Green', 'Blue'].forEach(function (color) {
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

function onDragOver(event) {
    var types = event.dataTransfer.types;

    var dragSupported = types.length;

    if (dragSupported) {
        event.dataTransfer.dropEffect = "move";
    }

    event.preventDefault();
}

function onDrop(event) {
    event.preventDefault();

    var userAgent = window.navigator.userAgent;
    var isIE = userAgent.indexOf("Trident/") >= 0;

    var textData = event.dataTransfer.getData(isIE ? 'text' : 'text/plain');
    var eJsonRow = document.createElement('div');
    eJsonRow.classList.add('json-row');
    eJsonRow.innerText = textData;

    var eJsonDisplay = document.querySelector('#eJsonDisplay');
    eJsonDisplay.appendChild(eJsonRow);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
