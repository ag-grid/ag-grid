var columnDefs = [
    {
        headerName: "Athlete Details",
        marryChildren: true,
        children: [
            {headerName: "Athlete", field: "athlete", width: 150, filter: 'agTextColumnFilter'},
            {headerName: "Country", field: "country", width: 120}
        ]
    },
    {headerName: "Age", field: "age", width: 90, filter: 'agNumberColumnFilter', hide: true},
    {
        headerName: "Sports Results",
        marryChildren: true,
        children: [
            {headerName: "Sport", field: "sport", width: 110},
            {headerName: "Total", columnGroupShow: 'closed', field: "total", width: 100, filter: 'agNumberColumnFilter'},
            {headerName: "Gold", columnGroupShow: 'open', field: "gold", width: 100, filter: 'agNumberColumnFilter'},
            {headerName: "Silver", columnGroupShow: 'open', field: "silver", width: 100, filter: 'agNumberColumnFilter'},
            {headerName: "Bronze", columnGroupShow: 'open', field: "bronze", width: 100, filter: 'agNumberColumnFilter'}
        ]
    },
    {headerName: "Extra 1", field: '1', width: 100, hide: true},
    {headerName: "Extra 2", field: '2', width: 100},
    {headerName: "Extra 3", field: '3', width: 100},
    {headerName: "Extra 4", field: '4', width: 100}
];

var gridOptions = {
    debug: true,
    columnDefs: columnDefs,
    rowData: null,
    enableSorting: true,
    enableFilter: true,
    enableColResize: true
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