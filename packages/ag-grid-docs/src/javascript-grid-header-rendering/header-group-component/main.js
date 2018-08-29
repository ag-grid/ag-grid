var columnDefs = [{
        headerName: "Athlete Details",
        headerGroupComponent: 'customHeaderGroupComponent',
        children: [
            {headerName: "Athlete", field: "athlete", width: 150},
            {headerName: "Age", field: "age", width: 90,  columnGroupShow: 'open'},
            {headerName: "Country", field: "country", width: 120,  columnGroupShow: 'open'}
    ]},
    {
        headerName: "Medal details",
        headerGroupComponent: 'customHeaderGroupComponent',
        children: [
            {headerName: "Year", field: "year", width: 90},
            {headerName: "Date", field: "date", width: 110},
            {headerName: "Sport", field: "sport", width: 110, columnGroupShow: 'open'},
            {headerName: "Gold", field: "gold", width: 100, columnGroupShow: 'open'},
            {headerName: "Silver", field: "silver", width: 100,  columnGroupShow: 'open'},
            {headerName: "Bronze", field: "bronze", width: 100, columnGroupShow: 'open'},
            {headerName: "Total", field: "total", width: 100,  columnGroupShow: 'open'}
        ]}
];

var gridOptions = {
    components:{
        customHeaderGroupComponent: CustomHeaderGroup
    },
    columnDefs: columnDefs,
    rowData: null,
    enableColResize: true,
    defaultColDef: {
        width: 100
    }
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
