var columnDefs = [
    {
        headerName: "Athlete Details",
        children: [
            {headerName: "Athlete", field: "athlete", width: 150, suppressSizeToFit: true, enableRowGroup: true},
            {headerName: "Age", field: "age", width: 90, minwidth: 75, maxWidth: 100, enableRowGroup: true},
            {headerName: "Country", field: "country", width: 120, enableRowGroup: true},
            {headerName: "Year", field: "year", width: 90, enableRowGroup: true},
            {headerName: "Sport", field: "sport", width: 110, enableRowGroup: true},
            {headerName: "Gold", field: "gold", width: 60, enableValue: true,
                suppressMenu:true, filter:'number'},
            {headerName: "Silver", field: "silver", width: 60, enableValue: true,
                suppressMenu:true, filter:'number'},
            {headerName: "Bronze", field: "bronze", width: 60, enableValue: true,
                suppressMenu:true, filter:'number'},
            {headerName: "Total", field: "total", width: 60, enableValue: true,
                suppressMenu:true, filter:'number'}
        ]
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableColResize: true,
    floatingFilter:true,
    groupHeaderHeight:25,
    headerHeight: 150,
    floatingFiltersHeight:20,
    pivotHeaderHeight:25,
    enableSorting:true,
    showToolPanel:true
};

function sizeToFit() {
    gridOptions.api.sizeColumnsToFit();
}

function autoSizeAll() {
    var allColumnIds = [];
    columnDefs.forEach( function(columnDef) {
        allColumnIds.push(columnDef.field);
    });
    gridOptions.columnApi.autoSizeColumns(allColumnIds);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '../olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
