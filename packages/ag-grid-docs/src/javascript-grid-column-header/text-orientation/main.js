var columnDefs = [
    {
        headerName: "Athlete Details",
        children: [
            {headerName: "Athlete", field: "athlete", width: 150, suppressSizeToFit: true, enableRowGroup: true, rowGroupIndex: 0},
            {headerName: "Age", field: "age", width: 90, minwidth: 75, maxWidth: 100, enableRowGroup: true},
            {headerName: "Country", field: "country", width: 120, enableRowGroup: true},
            {headerName: "Year", field: "year", width: 90, enableRowGroup: true, pivotIndex: 0},
            {headerName: "Sport", field: "sport", width: 110, enableRowGroup: true},
            {headerName: "Gold", field: "gold", width: 60, enableValue: true,
                suppressMenu:true, filter:'agNumberColumnFilter', aggFunc: 'sum'},
            {headerName: "Silver", field: "silver", width: 60, enableValue: true,
                suppressMenu:true, filter:'agNumberColumnFilter', aggFunc: 'sum'},
            {headerName: "Bronze", field: "bronze", width: 60, enableValue: true,
                suppressMenu:true, filter:'agNumberColumnFilter', aggFunc: 'sum'},
            {headerName: "Total", field: "total", width: 60, enableValue: true,
                suppressMenu:true, filter:'agNumberColumnFilter', aggFunc: 'sum'}
        ]
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableColResize: true,
    //floatingFilter:true,
    groupHeaderHeight:75,
    headerHeight: 150,
    floatingFiltersHeight:50,
    pivotGroupHeaderHeight:50,
    pivotHeaderHeight:100,
    enableSorting:true,
    showToolPanel:true
};

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
