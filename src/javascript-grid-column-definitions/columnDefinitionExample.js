var gridOptions = {

    // define grid columns
    columnDefs: [
        // using default ColDef
        {headerName: "Athlete", field: "athlete"},
        {headerName: "Sport", field: "sport"},

        // using number column type
        {headerName: "Age", field: "age", type: "numberColumn"},
        {headerName: "Year", field: "year", type: "numberColumn"},
        {
            headerName: "Medals", groupId: "medalsGroup",
            children: [
                // using medal column type
                {headerName: "Gold",   field: "gold",   type: "medalColumn"},
                {headerName: "Silver", field: "silver", type: "medalColumn"},
                {headerName: "Bronze", field: "bronze", type: "medalColumn"}
            ]
        }
    ],

    // default ColDef, gets applied to every column
    defaultColDef: {
        // set the default column width
        width: 150,
        // make every column editable
        editable: true,
        // make every column use 'text' filter by default
        filter: 'text'
    },

    // default ColGroupDef, get applied to every column group
    defaultColGroupDef: {
        marryChildren: true
    },

    // define specific column types
    columnTypes: {
        "numberColumn": {width: 100, filter: 'number'},
        "medalColumn": {minWidth: 100, columnGroupShow: 'open', suppressFilter: true}
    },

    rowData: null,
    enableFilter: true,
    floatingFilter: true
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '../olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});