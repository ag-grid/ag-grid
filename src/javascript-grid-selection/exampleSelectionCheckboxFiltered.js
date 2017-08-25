var columnDefs = [
    {headerName: "Country", field: "country", width: 120, rowGroupIndex: 0},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Age", field: "age", width: 90, aggFunc: 'sum'},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Gold", field: "gold", width: 100, aggFunc: 'sum'},
    {headerName: "Silver", field: "silver", width: 100, aggFunc: 'sum'},
    {headerName: "Bronze", field: "bronze", width: 100, aggFunc: 'sum'},
    {headerName: "Total", field: "total", width: 100, aggFunc: 'sum'}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    rowSelection: 'multiple',
    groupSelectsChildren: true,
    groupSelectsFiltered: true,
    suppressAggFuncInHeader: true,
    enableFilter:true,
    suppressRowClickSelection: true,
     autoGroupColumnDef: {headerName: "Athlete", field: "athlete", width: 200,
        cellRenderer: 'group',
        cellRendererParams: {
            checkbox: true
        }
    }
};

function filterSwimming() {
    gridOptions.api.setFilterModel({sport: ['Swimming']});
}

function clearFilter() {
    gridOptions.api.setFilterModel(null);
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