var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150,
        checkboxSelection: function (params) {
            // we put checkbox on the name if we are not doing grouping
            return params.columnApi.getRowGroupColumns().length === 0;
        },
        headerCheckboxSelection: function (params) {
            // we put checkbox on the name if we are not doing grouping
            return params.columnApi.getRowGroupColumns().length === 0;
        }
    },
    {headerName: "Age", field: "age", width: 90},
    {headerName: "Country", field: "country", width: 120},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100},
    {headerName: "Silver", field: "silver", width: 100},
    {headerName: "Bronze", field: "bronze", width: 100},
    {headerName: "Total", field: "total", width: 100}
];

var autoGroupColumnDef = {
    headerName: "Group",
    width: 200,
    field: 'athlete',
    valueGetter: function(params) {
        if (params.node.group) {
            return params.node.key;
        } else {
            return params.data[params.colDef.field];
        }
    },
    headerCheckboxSelection: true,
    // headerCheckboxSelectionFilteredOnly: true,
    cellRenderer:'agGroupCellRenderer',
    cellRendererParams: {
        checkbox: true
    }
};

var gridOptions = {
    defaultColDef:{
        editable: true,
        enableRowGroup:true,
        enablePivot:true,
        enableValue:true,
        sortable:true,
        resizable: true,
        filter: true
    },
    suppressRowClickSelection: true,
    groupSelectsChildren: true,
    debug: true,
    rowSelection: 'multiple',
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    enableRangeSelection: true,
    columnDefs: columnDefs,
    pagination: true,
    autoGroupColumnDef: autoGroupColumnDef
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
