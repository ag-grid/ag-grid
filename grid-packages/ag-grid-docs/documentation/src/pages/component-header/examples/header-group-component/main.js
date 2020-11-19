var columnDefs = [{
    headerName: "Athlete Details",
    headerGroupComponent: 'customHeaderGroupComponent',
    children: [
        { headerName: "Athlete", field: "athlete", width: 150 },
        { headerName: "Age", field: "age", width: 90, columnGroupShow: 'open' },
        { headerName: "Country", field: "country", width: 120, columnGroupShow: 'open' }
    ]
},
{
    headerName: "Medal details",
    headerGroupComponent: 'customHeaderGroupComponent',
    children: [
        { headerName: "Year", field: "year", width: 90 },
        { headerName: "Date", field: "date", width: 110 },
        { headerName: "Sport", field: "sport", width: 110, columnGroupShow: 'open' },
        { headerName: "Gold", field: "gold", width: 100, columnGroupShow: 'open' },
        { headerName: "Silver", field: "silver", width: 100, columnGroupShow: 'open' },
        { headerName: "Bronze", field: "bronze", width: 100, columnGroupShow: 'open' },
        { headerName: "Total", field: "total", width: 100, columnGroupShow: 'open' }
    ]
}
];

var gridOptions = {
    components: {
        customHeaderGroupComponent: CustomHeaderGroup
    },
    columnDefs: columnDefs,
    rowData: null,
    defaultColDef: {
        width: 100,
        resizable: true
    }
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
