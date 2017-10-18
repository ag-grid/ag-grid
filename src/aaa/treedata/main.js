
var rowData = [

    // root level nodes
    {id: '1', path: ['Sophie'], val1: 1, val2: 1, color: 'Red'},
    {id: '2', path: ['Isabelle'], val1: 2, val2: 2, color: 'Red'},

    // group 1 nodes - user group
    {id: '3', path: ['Group 1'], val1: 3, val2: 3, color: 'Blue'},
    {id: '4', path: ['Group 1', 'Emily'], val1: 3, val2: 3, color: 'Red'},
    {id: '5', path: ['Group 1', 'Olivia'], val1: 4, val2: 4, color: 'Red'},

    // group 2 nodes - filler group
    {id: '6', path: ['Group 2', 'Chloe'], val1: 5, val2: 5, color: 'Red'},
    {id: '7', path: ['Group 2', 'Lucy'], val1: 6, val2: 6, color: 'Blue'},
    {id: '8', path: ['Group 3', 'Ruby'], val1: 7, val2: 7, color: 'Red'},

    // filler groups
    {id: '9', path: ['A', 'B', 'C', 'Daisy'], val1: 8, val2: 8, color: 'Blue'},

    // filler, then real, then filler
    {id: '10', path: ['X', 'Y'], val1: 9, val2: 9, color: 'Red'},
    {id: '11', path: ['X', 'Y', 'Z', 'Layla'], val1: 10, val2: 10, color: 'Red'},
    {id: '12', path: ['X', 'Y', 'Z', 'Layla', 'Amelia'], val1: 11, val2: 11, color: 'Blue'},
];

// remove a row, should get replaced with grid created row
function remove(id) {
    var rowNode = gridOptions.api.getRowNode(id);
    gridOptions.api.updateRowData({remove: [rowNode.data]});
}

function move(id, path) {
    var rowNode = gridOptions.api.getRowNode(id);
    rowNode.data.path = path;
    gridOptions.api.updateRowData({update: [rowNode.data]});
}

function add(data) {
    gridOptions.api.updateRowData({add: [data]});
}

function updateGold(id, value) {
    var item = dataMapped[id];
    item.gold = value;
    gridOptions.api.updateRowData({update: [item]});
}

function updateSilver(id, value) {
    var item = dataMapped[id];
    item.silver = value;
    gridOptions.api.updateRowData({update: [item]});
}

var columnDefs = [
    {headerName: "Group", field: "name", cellRenderer: 'group', showRowGroup: true, cellRendererParams: {
        checkbox: true,
        suppressCount: true
    }},
    {valueGetter: 'node.id'},
    {field: 'path'},
    {field: 'color'},
    {field: 'val1', aggFunc: 'sum'},
    {field: 'val2'}
];

var gridOptions = {
    defaultColDef: {
        editable: true,
        valueParser: function(params) {
            return parseInt(params.newValue);
        }
    },
    rowSelection: 'multiple',
    // suppressRowClickSelection: true,
    animateRows: true,
    enableCellChangeFlash: true,
    deltaRowDataMode: true,
    treeData: true,
    columnDefs: columnDefs,
    rowData: rowData,
    enableSorting: true,
    enableFilter: true,
    groupDefaultExpanded: -1,
    // groupUseEntireRow:true,
    getDataPath: function(data) {
        return data.path;
    },
    isGroup: function(data) {
        return data.group === true;
    },
    getRowNodeId: function(data) {
        return data.id;
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});