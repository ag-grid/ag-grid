
var rowData = [
    {path: ['a'], name: "aaa", country: "United States", gold: 8, silver: 0, bronze: 0, total: 8},

    {path: ['a'], group: true, name: "bbb"},
    {path: ['a','x'], name:"ccc", country: "Ireland", gold: 8, silver: 0, bronze: 0, total: 8},

    {path: ['b','y'], group: true, name: "ddd", gold: 999, silver: 999, bronze: 999},
    {path: ['b','x'], name:"eee", country: "Australia", gold:1, silver:3, bronze:1, total:5},
    {path: ['b','y'], name:"fff", country: "Belgium", gold:1, silver:3, bronze:1, total:5},

    {path: ['c'], name: "ggg", country: "Germany", gold: 6, silver: 0, bronze: 2, total: 8},
    {path: ['c','y'], name: "hhh", country: "France", gold: 4, silver: 2, bronze: 0, total: 6},
    {path: ['d'], name: "iii", country: "Italy", gold: 1, silver: 2, bronze: 3, total: 6},
    {path: ['d'], name: "jjj", country: "Russia", gold: 2, silver: 1, bronze: 3, total: 6},
    {path: ['e'], group: true, name: "kkk", gold: 999, silver: 999, bronze: 999},
    {name:"lll", country: "Spain", gold: 4, silver: 0, bronze: 1, total: 5},
    {name:"mmm", country: "China", gold: 2, silver: 2, bronze: 1, total: 5},
    {name:"nnn", country: "India", gold: 3, silver: 1, bronze: 1, total: 5}
];

var dataMapped = {
    a: rowData[0],
    b: rowData[1],
    c: rowData[2],
    d: rowData[3],
    e: rowData[4],
    f: rowData[5],
    g: rowData[6],
    h: rowData[7],
    i: rowData[8],
    j: rowData[9],
    k: rowData[10],
    l: rowData[11],
    m: rowData[12],
    n: rowData[13],
    o: {path: ['a','x'], name: "ooo", country: "Norway", gold: 6, silver: 0, bronze: 2, total: 8},
    p: {path: ['f','z'], name: "ppp", country: "Sweden", gold: 6, silver: 0, bronze: 2, total: 8},
};

// remove a row, should get replaced with grid created row
function remove(id) {
    var item = dataMapped[id];
    gridOptions.api.updateRowData({remove: [item]});
}

function move(id, path) {
    var item = dataMapped[id];
    item.path = path;
    gridOptions.api.updateRowData({update: [item]});
}

function add(id) {
    var item = dataMapped[id];
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
    {headerName: "Group", field: "country", cellRenderer: 'group', showRowGroup: true, cellRendererParams: {
        checkbox: true
        // suppressCount: true

    }},
    {field: "name", width: 200},
    {field: "gold", width: 100},
    {field: "silver", width: 100, aggFunc: 'sum'},
    {field: "bronze", width: 100, aggFunc: 'sum'},
    {field: "total", width: 100, aggFunc: 'sum'}
];

var gridOptions = {
    defaultColDef: {
        editable: true,
        valueParser: function(params) {
            return parseInt(params.newValue);
        }
    },
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    groupSelectsChildren: true,
    animateRows: true,
    enableCellChangeFlash: true,
    deltaRowDataMode: true,
    columnDefs: columnDefs,
    rowData: rowData,
    enableFilter: true,
    enableSorting: true,
    groupDefaultExpanded: -1,
    // groupUseEntireRow:true,
    getGroupKeys: function(data) {
        return data.path;
    },
    isGroup: function(data) {
        return data.group === true;
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});