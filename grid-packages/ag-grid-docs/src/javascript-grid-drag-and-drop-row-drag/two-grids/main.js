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

var gridOptions = {
    Left: {
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
        rowData: createLeftRowData(),
        rowDragManaged: true,
        suppressMoveWhenRowDragging: true,
        columnDefs: leftColumnDefs,
        animateRows: true,
        onGridReady: function(params) {
            addBinZone(params);
        }
    },
    Right: {
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
        getRowNodeId: function(data) {return data.id },
        rowData: [],
        rowDragManaged: true,
        columnDefs: rightColumnDefs,
        animateRows: true,
        onGridReady: function(params) {
            addBinZone(params);
        }
    }
};

function createLeftRowData() {
    return ['Red', 'Green', 'Blue'].map(function(color) {
        return createDataItem(color);
    });
}

function createDataItem(color) {
    return {
        id: rowIdSequence++,
        color: color,
        value1: Math.floor(Math.random()*100),
        value2: Math.floor(Math.random()*100)
    };
}

function createItemDragStart(event, color) {
    var newItem = createDataItem(color);
    var jsonData = JSON.stringify(newItem);
    var userAgent = window.navigator.userAgent;
    var isIE = userAgent.indexOf('Trident/') >= 0;

    event.dataTransfer.setData(isIE ? 'text' : 'application/json', jsonData);
}

function gridDragNewItemOver(event) {
    var dragSupported = event.dataTransfer.types.length;

    if (dragSupported) {
        event.dataTransfer.dropEffect = "copy";
        event.preventDefault();
    }
}

function onGridDropNewItem(event, grid) {
    event.preventDefault();

    var userAgent = window.navigator.userAgent;
    var isIE = userAgent.indexOf('Trident/') >= 0;

    var jsonData = event.dataTransfer.getData(isIE ? 'text' : 'application/json');
    var data = JSON.parse(jsonData);

    // if data missing or data has no it, do nothing
    if (!data || data.id == null) { return; }

    var gridApi = grid == 'left' ? gridOptions.Left.api : gridOptions.Right.api;

    // do nothing if row is already in the grid, otherwise we would have duplicates
    var rowAlreadyInGrid = !!gridApi.getRowNode(data.id);
    if (rowAlreadyInGrid) {
        console.log('not adding row to avoid duplicates in the grid');
        return;
    }

    var transaction = {
        add: [data]
    };
    gridApi.updateRowData(transaction);
}

function binDrop(data) {
    // if data missing or data has no id, do nothing
    if (!data || data.id == null) { return; }

    var transaction = {
        remove: [data]
    };

    [gridOptions.Left, gridOptions.Right].forEach(function(option) {
        rowsInGrid = !!option.api.getRowNode(data.id);
        if (rowsInGrid) {
            option.api.updateRowData(transaction);
        }
    });
}

function loadGrid(side) {
    var grid = document.querySelector('#e' + side + 'Grid');
    new agGrid.Grid(grid, gridOptions[side]);
}

function addBinZone(params) {
    var eBin = document.querySelector('#eBin');

    var binDropZone = {
        el: eBin,
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

    params.api.addDropZone(binDropZone);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    loadGrid('Left');
    loadGrid('Right');
});
