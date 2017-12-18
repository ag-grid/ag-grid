var columnDefs = [
    {field: "athlete"},
    {field: "country", rowGroup: true},
    {field: "city", rowGroup: true},
    {field: "year"},
    {field: "gold", aggFunc: 'sum'},
    {field: "silver", aggFunc: 'sum'},
    {field: "bronze", aggFunc: 'sum'}
];

var rowData = [
    { athlete: 'Niall', country: 'Ireland', city: 'Dublin', year: '2016', gold: 10, silver: 10, bronze: 10 },
    { athlete: 'John', country: 'Ireland', city: 'Dublin', year: '2016', gold: 5, silver: 5, bronze: 5 },
    { athlete: 'Rob', country: 'Ireland', city: 'Dublin', year: '2016', gold: 2, silver: 2, bronze: 2 },
    { athlete: 'Bas', country: 'Pakestan', city: 'Ardabil', year: '2016', gold: 2, silver: 2, bronze: 2 },
    { athlete: 'Dimple', country: 'India', city: 'Delhi', year: '2016', gold: 2, silver: 2, bronze: 2 },
    { athlete: 'Jack', country: 'South Africa', city: 'Cape Town', year: '2016', gold: 2, silver: 2, bronze: 2 },
    { athlete: 'Tiger', country: 'South Africa', city: 'Johannesburg', year: '2016', gold: 2, silver: 2, bronze: 2 },
    { athlete: 'Jack', country: 'Germany', city: 'Berlin', year: '2016', gold: 2, silver: 2, bronze: 2 },
    { athlete: 'Mike', country: 'France', city: 'Paris', year: '2016', gold: 2, silver: 2, bronze: 2 }
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    defaultColDef: {
        width: 100
    },
    autoGroupColumnDef: {
        width: 200,
        headerName: 'Group',
        cellRenderer:'agGroupCellRenderer',
        field: 'athlete'
    },
    // set this to true to remove single children
    groupRemoveSingleChildren: false,
    // set this to true to remove leaf level single children
    groupRemoveLowestSingleChildren: false,
    animateRows: true,
    // expand everything by default
    groupDefaultExpanded: -1,
    suppressAggFuncInHeader: true
};

function changeSelection(type) {

    // normal, single or lowest
    if (type==='normal') {
        gridOptions.api.setGroupRemoveSingleChildren(false);
        gridOptions.api.setGroupRemoveLowestSingleChildren(false);
    } else if (type==='single') {
        gridOptions.api.setGroupRemoveSingleChildren(true);
        gridOptions.api.setGroupRemoveLowestSingleChildren(false);
    } else if (type==='lowest') {
        gridOptions.api.setGroupRemoveLowestSingleChildren(true);
        gridOptions.api.setGroupRemoveSingleChildren(false);
    } else {
        console.log('unknown type: ' + type);
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
    gridOptions.api.sizeColumnsToFit();
});
