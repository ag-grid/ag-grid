var rowIdSequence = 100;

var leftColumnDefs = [
    { field: 'id', dndSource: true },
    { field: 'color' },
    { field: 'value1' },
    { field: 'value2' }
];

var rightColumnDefs = [
    { field: 'id', dndSource: true },
    { field: 'color' },
    { field: 'value1' },
    { field: 'value2' }
];
var leftApi;
var leftGridOptions = {
    defaultColDef: {
        flex: 1,
        filter: true,
    },
    rowClassRules: {
        'red-row': 'data.color == "Red"',
        'green-row': 'data.color == "Green"',
        'blue-row': 'data.color == "Blue"',
    },
    getRowId: (params) => { return params.data.id; },
    rowData: createLeftRowData(),
    rowDragManaged: true,
    columnDefs: leftColumnDefs,
};
var rightApi;
var rightGridOptions = {
    defaultColDef: {
        flex: 1,
        filter: true,
    },
    rowClassRules: {
        'red-row': 'data.color == "Red"',
        'green-row': 'data.color == "Green"',
        'blue-row': 'data.color == "Blue"',
    },
    getRowId: (params) => { return params.data.id; },
    rowData: [],
    rowDragManaged: true,
    columnDefs: rightColumnDefs,
};

function createLeftRowData() {
    return ['Red', 'Green', 'Blue'].map(function (color) {
        return createDataItem(color);
    });
}

function createDataItem(color) {
    return {
        id: rowIdSequence++,
        color: color,
        value1: Math.floor(Math.random() * 100),
        value2: Math.floor(Math.random() * 100)
    };
}

function binDragOver(event) {
    var dragSupported = event.dataTransfer.types.length;

    if (dragSupported) {
        event.dataTransfer.dropEffect = 'move';
        event.preventDefault();
    }
}

function binDrop(event) {
    event.preventDefault();

    var jsonData = event.dataTransfer.getData('application/json');
    var data = JSON.parse(jsonData);

    // if data missing or data has no id, do nothing
    if (!data || data.id == null) { return; }

    var transaction = {
        remove: [data]
    };

    var rowIsInLeftGrid = !!leftApi.getRowNode(data.id);
    if (rowIsInLeftGrid) {
        leftApi.applyTransaction(transaction);
    }

    var rowIsInRightGrid = !!rightApi.getRowNode(data.id);
    if (rowIsInRightGrid) {
        rightApi.applyTransaction(transaction);
    }
}

function dragStart(event, color) {
    var newItem = createDataItem(color);
    var jsonData = JSON.stringify(newItem);

    event.dataTransfer.setData('application/json', jsonData);
}

function gridDragOver(event) {
    var dragSupported = event.dataTransfer.types.length;

    if (dragSupported) {
        event.dataTransfer.dropEffect = 'copy';
        event.preventDefault();
    }

}

function gridDrop(event, grid) {
    event.preventDefault();

    var jsonData = event.dataTransfer.getData('application/json');
    var data = JSON.parse(jsonData);

    // if data missing or data has no it, do nothing
    if (!data || data.id == null) { return; }

    var gridApi = grid == 'left' ? leftApi : rightApi;

    // do nothing if row is already in the grid, otherwise we would have duplicates
    var rowAlreadyInGrid = !!gridApi.getRowNode(data.id);
    if (rowAlreadyInGrid) {
        console.log('not adding row to avoid duplicates in the grid');
        return;
    }

    var transaction = {
        add: [data]
    };
    gridApi.applyTransaction(transaction);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var leftGridDiv = document.querySelector('#eLeftGrid');
    leftApi = agGrid.createGrid(leftGridDiv, leftGridOptions);

    var rightGridDiv = document.querySelector('#eRightGrid');
    rightApi = agGrid.createGrid(rightGridDiv, rightGridOptions);
});
