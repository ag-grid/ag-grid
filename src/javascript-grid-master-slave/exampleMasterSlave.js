var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 200},
    {headerName: "Age", field: "age", width: 150},
    {headerName: "Country", field: "country", width: 150},
    {headerName: "Year", field: "year", width: 120},
    {headerName: "Date", field: "date", width: 150},
    {headerName: "Sport", field: "sport", width: 150},
    // in the total col, we have a value getter, which usually means we don't need to provide a field
    // however the master/slave depends on the column id (which is derived from the field if provided) in
    // order to match up the columns
    {headerName: 'Medals',
        children: [
            {headerName: "Total", columnGroupShow: 'closed', field: "total",
                valueGetter: "data.gold + data.silver + data.bronze", width: 200},
            {headerName: "Gold", columnGroupShow: 'open', field: "gold", width: 100},
            {headerName: "Silver", columnGroupShow: 'open', field: "silver", width: 100},
            {headerName: "Bronze", columnGroupShow: 'open', field: "bronze", width: 100}
        ]
    }
];

// this is the grid options for the top grid
var gridOptionsTop = {
    columnDefs: columnDefs,
    groupHeaders: true,
    rowData: null,
    enableColResize: true,
    debug: true,
    slaveGrids: []
};

// this is the grid options for the bottom grid
var gridOptionsBottom = {
    columnDefs: columnDefs,
    groupHeaders: true,
    rowData: null,
    enableColResize: true,
    debug: true,
    slaveGrids: []
};

gridOptionsTop.slaveGrids.push(gridOptionsBottom);
gridOptionsBottom.slaveGrids.push(gridOptionsTop);

function onCbAthlete(value) {
    // we only need to update one grid, as the other is a slave
    gridOptionsTop.columnApi.setColumnVisible('athlete', value);
}

function onCbAge(value) {
    // we only need to update one grid, as the other is a slave
    gridOptionsTop.columnApi.setColumnVisible('age', value);
}

function onCbCountry(value) {
    // we only need to update one grid, as the other is a slave
    gridOptionsTop.columnApi.setColumnVisible('country', value);
}

function setData(rowData) {
    gridOptionsTop.api.setRowData(rowData);
    gridOptionsBottom.api.setRowData(rowData);
    gridOptionsTop.api.sizeColumnsToFit();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDivTop = document.querySelector('#myGridTop');
    new agGrid.Grid(gridDivTop, gridOptionsTop);

    var gridDivBottom = document.querySelector('#myGridBottom');
    new agGrid.Grid(gridDivBottom, gridOptionsBottom);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '../olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            setData(httpResult);
        }
    };
});