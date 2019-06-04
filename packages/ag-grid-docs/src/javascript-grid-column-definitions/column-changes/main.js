var colDefAthlete = {headerName: 'Athlete', field: 'athlete'};
var colDefSport = {headerName: 'Sport', field: 'sport'};

var colDefAge = {headerName: 'Age', field: 'age'};
var colDefYear = {headerName: 'Year', field: 'year'};

var colDefDate = {headerName: 'Date', field: 'date', comparator: dateComparator};

var colDefGold = {headerName: 'Gold', field: 'gold'};
var colDefSilver = {headerName: 'Silver', field: 'silver'};
var colDefBronze = {headerName: 'Bronze', field: 'bronze'};

var columnDefs = [colDefAthlete, colDefSport, colDefAge, colDefYear, colDefDate];

var gridOptions = {
    defaultColDef: {
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        width: 100,
        sortable: true,
        resizable: true,
        filter: true
    },
    columnDefs: columnDefs,
    animateRows: true,
    sideBar: {
        toolPanels: ['filters', 'columns']
    },
    statusBar: {
        statusPanels: [
            {statusPanel: 'agTotalRowCountComponent', align: 'left', key: 'totalRowComponent'},
            {statusPanel: 'agFilteredRowCountComponent', align: 'left'},
            {statusPanel: 'agSelectedRowCountComponent', align: 'center'},
            {statusPanel: 'agAggregationComponent', align: 'right'}
        ]
    },
    enableRangeSelection: true,
    onGridReady: function (params) {
        document.querySelector("#athlete").checked = true;
        document.querySelector("#sport").checked = true;
        document.querySelector("#age").checked = true;
        document.querySelector("#year").checked = true;
        document.querySelector("#date").checked = true;
    }
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


function dateComparator(date1, date2) {
    var date1Number = monthToComparableNumber(date1);
    var date2Number = monthToComparableNumber(date2);

    if (date1Number === null && date2Number === null) {
        return 0;
    }
    if (date1Number === null) {
        return -1;
    }
    if (date2Number === null) {
        return 1;
    }

    return date1Number - date2Number;
}

// eg 29/08/2004 gets converted to 20040829
function monthToComparableNumber(date) {
    if (date === undefined || date === null || date.length !== 10) {
        return null;
    }

    var yearNumber = date.substring(6, 10);
    var monthNumber = date.substring(3, 5);
    var dayNumber = date.substring(0, 2);

    var result = (yearNumber * 10000) + (monthNumber * 100) + dayNumber;
    return result;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function (data) {
        gridOptions.api.setRowData(data);
    });
});
