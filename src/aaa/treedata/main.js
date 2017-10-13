
var rowData = [
    {path: ['a'], "athlete":"aaa","age":23,"country":"United States","year":2008,"date":"24/08/2008","sport":"Swimming","gold":8,"silver":0,"bronze":0,"total":8},

    {path: ['a'], group: true, "athlete":"*bbb"},
    {path: ['a','x'], "athlete":"ccc","age":23,"country":"Ireland","year":2008,"date":"24/08/2008","sport":"Swimming","gold":8,"silver":0,"bronze":0,"total":8},

    {path: ['b','y'], group: true, "athlete":"*ddd", gold: 999, silver: 999, bronze: 999},
    {path: ['b','x'], "athlete":"eee","age":24,"country":"Australia","year":2012,"date":"12/08/2012","sport":"Swimming","gold":1,"silver":3,"bronze":1,"total":5},
    {path: ['b','y'], "athlete":"fff","age":24,"country":"Belgium","year":2012,"date":"12/08/2012","sport":"Swimming","gold":1,"silver":3,"bronze":1,"total":5},

    {path: ['c'], "athlete":"ggg","age":19,"country":"Germany","year":2004,"date":"29/08/2004","sport":"Swimming","gold":6,"silver":0,"bronze":2,"total":8},
    {path: ['c','y'], "athlete":"hhh","age":27,"country":"France","year":2012,"date":"12/08/2012","sport":"Swimming","gold":4,"silver":2,"bronze":0,"total":6},
    {path: ['d'], "athlete":"iii","age":25,"country":"Italy","year":2008,"date":"24/08/2008","sport":"Swimming","gold":1,"silver":2,"bronze":3,"total":6},
    {path: ['d'], "athlete":"jjj","age":24,"country":"Russia","year":2000,"date":"01/10/2000","sport":"Gymnastics","gold":2,"silver":1,"bronze":3,"total":6},
    {"athlete":"kkk","age":17,"country":"Spain","year":2012,"date":"12/08/2012","sport":"Swimming","gold":4,"silver":0,"bronze":1,"total":5},
    {"athlete":"lll","age":27,"country":"China","year":2012,"date":"12/08/2012","sport":"Swimming","gold":2,"silver":2,"bronze":1,"total":5},
    {"athlete":"mmm","age":22,"country":"India","year":2012,"date":"12/08/2012","sport":"Swimming","gold":3,"silver":1,"bronze":1,"total":5}
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
    n: {path: ['a','x'], "athlete":"nnn","age":19,"country":"Norway","year":2004,"date":"29/08/2004","sport":"Swimming","gold":6,"silver":0,"bronze":2,"total":8},
    o: {path: ['f','z'], "athlete":"ooo","age":19,"country":"Sweden","year":2004,"date":"29/08/2004","sport":"Swimming","gold":6,"silver":0,"bronze":2,"total":8},
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
        // suppressCount: true
    }},
    // {headerName: "Country", field: "country", width: 120},
    {headerName: "Athlete", field: "athlete", width: 200},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100},
    {headerName: "Silver", field: "silver", width: 100, aggFunc: 'sum'},
    {headerName: "Bronze", field: "bronze", width: 100, aggFunc: 'sum'},
    {headerName: "Total", field: "total", width: 100, aggFunc: 'sum'},
    {headerName: "Age", field: "age", width: 90},
    {headerName: "Date", field: "date", width: 110}
];

var gridOptions = {
    defaultColDef: {
        editable: true,
        valueParser: function(params) {
            return parseInt(params.newValue);
        }
    },
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