
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

    // {path: ['a'], name: "Alan", country: "United States", gold: 8, silver: 0, bronze: 0, total: 8},
    //
    // {path: ['a'], group: true, comment: 'Bouncy Boys'},
    // {path: ['a','x'], name: "Charles", country: "Ireland", gold: 8, silver: 0, bronze: 0, total: 8},
    //
    // {path: ['b','y'], group: true, comment: "Drunken Doughnuts", gold: 999, silver: 999, bronze: 999},
    // {path: ['b','x'], name: "Ethan", country: "Australia", gold:1, silver:3, bronze:1, total:5},
    // {path: ['b','y'], name: "Fernando", country: "Belgium", gold:1, silver:3, bronze:1, total:5},
    //
    // {path: ['c'], name: "Garrett", country: "Germany", gold: 6, silver: 0, bronze: 2, total: 8},
    // {path: ['c','y'], name: "Helena", country: "France", gold: 4, silver: 2, bronze: 0, total: 6},
    // {path: ['d'], name: "Izzy", country: "Italy", gold: 1, silver: 2, bronze: 3, total: 6},
    // {path: ['d'], name: "Joe", country: "Russia", gold: 2, silver: 1, bronze: 3, total: 6},
    // {path: ['e'], group: true, comment: "Everyday Boys", gold: 999, silver: 999, bronze: 999},
    // {name:"Luke", country: "Spain", gold: 4, silver: 0, bronze: 1, total: 5},
    // {name:"Mark", country: "China", gold: 2, silver: 2, bronze: 1, total: 5},
    // {name:"Niall", country: "India", gold: 3, silver: 1, bronze: 1, total: 5}
];

// remove a row, should get replaced with grid created row
function remove(id) {
    var item = gridOptions.api.getRowNode(id);
    gridOptions.api.updateRowData({remove: [item]});
}

function move(id, path) {
    var item = gridOptions.api.getRowNode(id);
    item.path = path;
    gridOptions.api.updateRowData({update: [item]});
}

function add(id) {
    var item = gridOptions.api.getRowNode(id);
    gridOptions.api.updateRowData({add: [item]});
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
        // checkbox: true,
        suppressCount: true
    }},
    {valueGetter: 'node.id'},
    {field: "path"},
    {field: "color"},
    {field: "val1"},
    {field: "val2"}
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
    getGroupKeys: function(data) {
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