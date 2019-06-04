var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150},
    {headerName: "Age", field: "age", width: 90},
    {headerName: "Country", field: "country", width: 120, enableRowGroup: true},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 110, comparator: dateComparator},
    {headerName: "Medals",
        children: [
            {headerName: "Total",  field: "total", columnGroupShow: 'closed', width: 125},
            {headerName: "Gold",   field: "gold", columnGroupShow: 'open', width: 125},
            {headerName: "Silver", field: "silver", columnGroupShow: 'open', width: 125},
            {headerName: "Bronze", field: "bronze", columnGroupShow: 'open', width: 125}
        ]
    }
];

var gridOptions = {
    defaultColDef: {
        sortable: true,
        resizable: true
    },
    debug: true,
    columnDefs: columnDefs,
    rowData: null,
    onGridReady: function() {
        gridOptions.api.addGlobalListener(function(type, event) {
            if (type.indexOf('column') >= 0) {
                console.log('Got column event: ', event);
            }
        });
    }
};

function printState() {
    var colState = gridOptions.columnApi.getColumnState();
    var groupState = gridOptions.columnApi.getColumnGroupState();
    var sortState = gridOptions.api.getSortModel();
    var filterState = gridOptions.api.getFilterModel();

    console.log("***********************");
    console.log("colState: ", colState);
    console.log("groupState: ", groupState);
    console.log("sortState: ", sortState);
    console.log("filterState: ", filterState);
    console.log("***********************");
}

function saveState() {
    window.colState = gridOptions.columnApi.getColumnState();
    window.groupState = gridOptions.columnApi.getColumnGroupState();
    window.sortState = gridOptions.api.getSortModel();
    window.filterState = gridOptions.api.getFilterModel();
    console.log('column state saved');
}

function restoreState() {
    if (!window.colState) {
        console.log('no columns state to restore by, you must save state first');
        return;
    }
    gridOptions.columnApi.setColumnState(window.colState);
    gridOptions.columnApi.setColumnGroupState(window.groupState);
    gridOptions.api.setSortModel(window.sortState);
    gridOptions.api.setFilterModel(window.filterState);
    console.log('column state restored');
}

function resetState() {
    gridOptions.columnApi.resetColumnState();
    gridOptions.columnApi.resetColumnGroupState();
    gridOptions.api.setSortModel(null);
    gridOptions.api.setFilterModel(null);
    console.log('column state reset');
}

function showAthlete(show) {
    gridOptions.columnApi.setColumnVisible('athlete', show);
}

function showMedals(show) {
    gridOptions.columnApi.setColumnsVisible(['total','gold','silver','bronze'], show);
}

function pinAthlete(pin) {
    gridOptions.columnApi.setColumnPinned('athlete', pin);
}

function pinAge(pin) {
    gridOptions.columnApi.setColumnPinned('age', pin);
}


function dateComparator(date1, date2) {
    var date1Number = monthToComparableNumber(date1);
    var date2Number = monthToComparableNumber(date2);

    if (date1Number===null && date2Number===null) {
        return 0;
    }
    if (date1Number===null) {
        return -1;
    }
    if (date2Number===null) {
        return 1;
    }

    return date1Number - date2Number;
}

// eg 29/08/2004 gets converted to 20040829
function monthToComparableNumber(date) {
    if (date === undefined || date === null || date.length !== 10) {
        return null;
    }

    var yearNumber = date.substring(6,10);
    var monthNumber = date.substring(3,5);
    var dayNumber = date.substring(0,2);

    var result = (yearNumber*10000) + (monthNumber*100) + dayNumber;
    return result;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
