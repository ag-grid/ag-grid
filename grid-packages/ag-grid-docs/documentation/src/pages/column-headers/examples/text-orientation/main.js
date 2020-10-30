var columnDefs = [
    {
        headerName: "Athlete Details",
        children: [
            { headerName: "Athlete", field: "athlete", width: 150, suppressSizeToFit: true, enableRowGroup: true, rowGroupIndex: 0 },
            { headerName: "Age", field: "age", width: 90, minwidth: 75, maxWidth: 100, enableRowGroup: true },
            { headerName: "Country", field: "country", width: 120, enableRowGroup: true },
            { headerName: "Year", field: "year", width: 90, enableRowGroup: true, pivotIndex: 0 },
            { headerName: "Sport", field: "sport", width: 110, enableRowGroup: true },
            {
                headerName: "Gold", field: "gold", width: 60, enableValue: true,
                suppressMenu: true, filter: 'agNumberColumnFilter', aggFunc: 'sum'
            },
            {
                headerName: "Silver", field: "silver", width: 60, enableValue: true,
                suppressMenu: true, filter: 'agNumberColumnFilter', aggFunc: 'sum'
            },
            {
                headerName: "Bronze", field: "bronze", width: 60, enableValue: true,
                suppressMenu: true, filter: 'agNumberColumnFilter', aggFunc: 'sum'
            },
            {
                headerName: "Total", field: "total", width: 60, enableValue: true,
                suppressMenu: true, filter: 'agNumberColumnFilter', aggFunc: 'sum'
            }
        ]
    }
];

var gridOptions = {
    defaultColDef: {
        sortable: true,
        resizable: true
    },
    columnDefs: columnDefs,
    rowData: null,
    groupHeaderHeight: 75,
    headerHeight: 150,
    floatingFiltersHeight: 50,
    pivotGroupHeaderHeight: 50,
    pivotHeaderHeight: 100
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
