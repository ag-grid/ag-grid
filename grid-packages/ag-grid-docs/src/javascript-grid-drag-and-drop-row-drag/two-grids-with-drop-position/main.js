var rowIdSequence = 100;

var leftColumnDefs = [
    { field: "id", rowDrag: true },
    { field: "color" },
    { field: "value1" },
    { field: "value2" }
];

var rightColumnDefs = [
    { field: "id", rowDrag: true },
    { field: "color" },
    { field: "value1" },
    { field: "value2" }
];

var leftGridOptions = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: true,
        resizable: true
    },
    rowClassRules: {
        "red-row": 'data.color == "Red"',
        "green-row": 'data.color == "Green"',
        "blue-row": 'data.color == "Blue"',
    },
    getRowNodeId: function(data) { return data.id },
    rowData: createRowBlock(2),
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    columnDefs: leftColumnDefs,
    animateRows: true,
    onGridReady: function(params) {
        addBinZone(params);
        addGridDropZone(params, 'Right');
    }
};

var rightGridOptions = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: true,
        resizable: true
    },
    rowClassRules: {
        "red-row": 'data.color == "Red"',
        "green-row": 'data.color == "Green"',
        "blue-row": 'data.color == "Blue"',
    },
    getRowNodeId: function(data) { return data.id },
    rowData: createRowBlock(2),
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    columnDefs: rightColumnDefs,
    animateRows: true,
    onGridReady: function(params) {
        addBinZone(params);
        addGridDropZone(params, 'Left');
    }
};

function createRowBlock(blocks) {
    blocks = blocks || 1;
    
    var output = [];

    for (var i = 0; i < blocks; i++) {
        output = output.concat(['Red', 'Green', 'Blue'].map(function(color) {
            return createDataItem(color);
        }));
    }

    return output;
}

function createDataItem(color) {
    return {
        id: rowIdSequence++,
        color: color,
        value1: Math.floor(Math.random() * 100),
        value2: Math.floor(Math.random() * 100)
    };
}

function createItemDragStart(event, color) {
    var newItem = createDataItem(color),
        jsonData = JSON.stringify(newItem),
        userAgent = window.navigator.userAgent,
        isIE = userAgent.indexOf('Trident/') >= 0;

    event.dataTransfer.setData(isIE ? 'text' : 'application/json', jsonData);
}

function gridDragNewItemOver(event) {
    var dragSupported = event.dataTransfer.types.length;

    if (dragSupported) {
        event.dataTransfer.dropEffect = "copy";
        event.preventDefault();
    }
}

function onGridDropNewItem(event, side) {
    event.preventDefault();

    var userAgent = window.navigator.userAgent,
        isIE = userAgent.indexOf('Trident/') >= 0,
        jsonData = event.dataTransfer.getData(isIE ? 'text' : 'application/json')
        data = JSON.parse(jsonData);

    addRecordToGrid(side, data);
}

function addRecordToGrid(side, data) {
    // if data missing or data has no it, do nothing
    if (!data || data.id == null) { return; }

    var api = side == 'left' ? leftGridOptions.api : rightGridOptions.api,
        // do nothing if row is already in the grid, otherwise we would have duplicates
        rowAlreadyInGrid = !!api.getRowNode(data.id),
        transaction;

    if (rowAlreadyInGrid) {
        console.log('not adding row to avoid duplicates in the grid');
        return;
    }

    transaction = {
        add: [data]
    };

    api.updateRowData(transaction);
}

function binDrop(data) {
    // if data missing or data has no id, do nothing
    if (!data || data.id == null) { return; }

    var transaction = {
        remove: [data]
    };

    [leftGridOptions, rightGridOptions].forEach(function(option) {
        rowsInGrid = !!option.api.getRowNode(data.id);

        if (rowsInGrid) {
            option.api.updateRowData(transaction);
        }
    });
}

function addBinZone(params) {
    var eBin = document.querySelector('#eBin'),
        binDropZone = {
            target: eBin,
            onDragEnter: function() {
                eBin.style.color = 'blue';
            },
            onDragLeave: function() {
                eBin.style.color = 'black';
            },
            onDragStop: function(params) {
                binDrop(params.dragItem.rowNode.data);
                eBin.style.color = 'black';
            }
        };

    params.api.addRowDropZone(binDropZone);
}

function addGridDropZone(params, side) {
    params.api.addRowDropZone({
        target: side === 'Left' ? leftGridOptions : rightGridOptions,
        dropAtIndex: true
    });
}

function loadGrid(side) {
    var grid = document.querySelector('#e' + side + 'Grid');
    new agGrid.Grid(grid, side === 'Left' ? leftGridOptions : rightGridOptions);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    loadGrid('Left');
    loadGrid('Right');
});
