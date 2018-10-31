var colDefAthlete = {headerName: 'Athlete', field: 'athlete'};
var colDefSport = {headerName: 'Sport', field: 'sport'};

var colDefAge = {headerName: 'Age', field: 'age'};
var colDefYear = {headerName: 'Year', field: 'year'};

var colDefDate = {headerName: 'Date', field: 'date'};

var colDefGold = {headerName: 'Gold', field: 'gold'};
var colDefSilver = {headerName: 'Silver', field: 'silver'};
var colDefBronze = {headerName: 'Bronze', field: 'bronze'};

var columnDefs = [colDefAthlete, colDefSport, colDefAge, colDefYear, colDefDate];

var gridOptions = {
    defaultColDef: {
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        width: 100
    },
    columnDefs: columnDefs,
    enableColResize: true,
    enableSorting: true,
    enableFilter: true,
    animateRows: true,
    sideBar: {
        toolPanels: ['filters','columns']
    },
    statusBar: {
        statusPanels: [
            { statusPanel: 'agTotalRowCountComponent', align: 'left', key: 'totalRowComponent' },
            { statusPanel: 'agFilteredRowCountComponent', align: 'left' },
            { statusPanel: 'agSelectedRowCountComponent', align: 'center' },
            { statusPanel: 'agAggregationComponent', align: 'right' }
        ]
    },
    enableRangeSelection: true
};

function onBtApply(reverse) {
    var cols = [];
    if (getBooleanValue('#athlete')) {
        cols.push(colDefAthlete);
    }
    if (getBooleanValue('#sport')) {
        cols.push(colDefSport);
    }
    if (getBooleanValue('#age')) {
        cols.push(colDefAge);
    }
    if (getBooleanValue('#year')) {
        cols.push(colDefYear);
    }
    if (getBooleanValue('#date')) {
        cols.push(colDefDate);
    }

    if (getBooleanValue('#gold')) {
        cols.push(colDefGold);
    }
    if (getBooleanValue('#silver')) {
        cols.push(colDefSilver);
    }
    if (getBooleanValue('#bronze')) {
        cols.push(colDefBronze);
    }

    if (reverse) {
        cols = cols.reverse();
    }

    gridOptions.api.setColumnDefs(cols);
}

function getBooleanValue(cssSelector) {
    return document.querySelector(cssSelector).checked === true;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});
