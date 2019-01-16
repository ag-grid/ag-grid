// var colDefAthlete = {headerName: 'Athlete', field: 'athlete'};
// var colDefSport = {headerName: 'Sport', field: 'sport'};
//
// var colDefAge = {headerName: 'Age', field: 'age'};
// var colDefYear = {headerName: 'Year', field: 'year'};
//
// var colDefDate = {headerName: 'Date', field: 'date'};
//
// var colDefGold = {headerName: 'Gold', field: 'gold'};
// var colDefSilver = {headerName: 'Silver', field: 'silver'};
// var colDefBronze = {headerName: 'Bronze', field: 'bronze'};

var columnDefsNormal = [
    {
        colId: 'athlete',
        field: 'athlete'
    },
    {
        colId: 'sport',
        field: 'sport'
    },
    {
        colId: 'age',
        field: 'age'
    },
    {
        colId: 'year',
        field: 'year'
    }
];

var columnDefsReverseOrder = [
    {
        colId: 'year',
        field: 'year'
    },
    {
        colId: 'age',
        field: 'age'
    },
    {
        colId: 'sport',
        field: 'sport'
    },
    {
        colId: 'athlete',
        field: 'athlete'
    },
];

var columnDefsWidths = [
    {
        colId: 'athlete',
        field: 'athlete',
        headerName: 'The New Header',
        width: 150
    },
    {
        colId: 'sport',
        field: 'sport',
        width: 150
    },
    {
        colId: 'age',
        field: 'age',
        width: 50
    },
    {
        colId: 'year',
        field: 'year',
        width: 50
    }
];

var columnDefsVisibility = [
    {
        colId: 'athlete',
        field: 'athlete'
    },
    {
        colId: 'sport',
        field: 'sport'
    },
    {
        colId: 'age',
        field: 'age',
        hide: true
    },
    {
        colId: 'year',
        field: 'year',
        hide: true
    }
];


var columnDefsGrouping = [
    {
        colId: 'athlete',
        field: 'athlete'
    },
    {
        colId: 'sport',
        field: 'sport',
        rowGroup: true
    },
    {
        colId: 'age',
        field: 'age'
    },
    {
        colId: 'year',
        field: 'year'
    }
];

var columnDefsNoResizeOrSort = [
    {
        colId: 'athlete',
        field: 'athlete',
        resizable: false,
        sortable: false
    },
    {
        colId: 'sport',
        field: 'sport',
        resizable: false,
        sortable: false
    },
    {
        colId: 'age',
        field: 'age',
        resizable: false,
        sortable: false
    },
    {
        colId: 'year',
        field: 'year',
        resizable: false,
        sortable: false
    }
];


var columnDefsPinned = [
    {
        colId: 'athlete',
        field: 'athlete',
        pinned: 'left'
    },
    {
        colId: 'sport',
        field: 'sport',
        pinned: 'right'
    },
    {
        colId: 'age',
        field: 'age'
    },
    {
        colId: 'year',
        field: 'year'
    }
];

var gridOptions = {
    defaultColDef: {
        width: 180,
        resizable: true,
        sortable: true
    },
    deltaColumnMode: true,
    columnDefs: columnDefsNormal,
    onColumnPinned: function(e) {
        console.log('onColumnPinned', e)
    },
    onColumnVisible: function(e) {
        console.log('onColumnVisible', e)
    },
    onColumnResized: function(e) {
        console.log('onColumnResized', e)
    },
    onColumnMoved: function(e) {
        console.log('onColumnMoved', e)
    },
    onColumnRowGroupChanged: function(e) {
        console.log('onColumnRowGroupChanged', e)
    },
    onColumnPivotChanged: function(e) {
        console.log('onColumnPivotChanged', e)
    },
    onNewColumnsLoaded: function(e) {
        console.log('onNewColumnsLoaded', e)
    },
    sideBar: {
        toolPanels: ['columns']
    }
};

function onNormal() {
    gridOptions.api.setColumnDefs(columnDefsNormal);
}

function onReverseOrder() {
    gridOptions.api.setColumnDefs(columnDefsReverseOrder);
}

function onWidths() {
    gridOptions.api.setColumnDefs(columnDefsWidths);
}

function onVisibility() {
    gridOptions.api.setColumnDefs(columnDefsVisibility);
}

function onGrouping() {
    gridOptions.api.setColumnDefs(columnDefsGrouping);
}

function onNoResizeOrSort() {
    gridOptions.api.setColumnDefs(columnDefsNoResizeOrSort);
}

function onPinned() {
    gridOptions.api.setColumnDefs(columnDefsPinned);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});
