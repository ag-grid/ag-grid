var columnDefs = [{
    headerName: 'Group1',
    children: [
        {headerName: "Athlete", field: "athlete", width: 150},
        {headerName: "Age", field: "age", width: 90, cellClassRules:{
            greenBackground: function(params) { return params.value < 23},
            redFont: function(params) { return params.value < 20}
        }},
        {headerName: "Country", field: "country", width: 120, cellClassRules: {
            redFont: function(params) { return params.value === 'United States' }
        }},
        {headerName: "Group", valueGetter: "data.country.charAt(0)", width: 75},
        {headerName: "Year", field: "year", width: 75, cellClassRules:{
            notInExcel: function(params) { return true}
        }}
    ]
}, {
    headerName: 'Group2',
    children: [
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110},
        {headerName: "Gold", field: "gold", width: 100, cellClassRules:{
            boldBorders: function(params) { return params.value > 2}
        }},
        {headerName: "Silver", field: "silver", width: 100},
        {headerName: "Bronze", field: "bronze", width: 100},
        {headerName: "Total", field: "total", width: 100}
    ]
}];

var floatingTopRow = { athlete: 'Floating Top Athlete', age: 999, country: 'Floating Top Country', year: 2020,
    date: '01-08-2020', sport: 'Floating Top Sport', gold: 22, silver: 33, bronze: 44, total: 55};

var floatingBottomRow = { athlete: 'Floating Bottom Athlete', age: 888, country: 'Floating Bottom Country', year: 2030,
    date: '01-08-2030', sport: 'Floating Bottom Sport', gold: 222, silver: 233, bronze: 244, total: 255};

var gridOptions = {
    columnDefs: columnDefs,
    groupHeaders: true,
    enableFilter: true,
    enableSorting: true,
    rowSelection: 'multiple',
    floatingTopRowData: [floatingTopRow],
    floatingBottomRowData: [floatingBottomRow],
    defaultColDef: {
        cellClassRules: {
            darkGreyBackground: function(params) { return params.rowIndex % 2 == 0 }
        }
    },
    excelStyles: [
        {
            id: "greenBackground",
            name: "greenBackground",
            interior: {
                color: "#90ee90", pattern: 'Solid'
            }
        },
        {
            id: "redFont",
            name: "redFont",
            font: { color: "#ff0000" }
        },{
            id: 'darkGreyBackground',
            name: 'darkGreyBackground',
            interior: {
                color: "#888888", pattern: 'Solid'
            }
        },{
            id:'boldBorders',
            name:'boldBorders',
            borders: {
                borderBottom: {
                    color: "#000000", lineStyle: 'Continuous', weight: 3
                },
                borderLeft: {
                    color: "#000000", lineStyle: 'Continuous', weight: 3
                },
                borderRight: {
                    color: "#000000", lineStyle: 'Continuous', weight: 3
                },
                borderTop: {
                    color: "#000000", lineStyle: 'Continuous', weight: 3
                }
            }
        },{
            id:'header',
            name: 'header',
            interior: {
                color: "#CCCCCC", pattern: 'Solid'
            }
        }

    ]
};

function getBooleanValue(cssSelector) {
    return document.querySelector(cssSelector).checked === true;
}

function onBtExport() {
    var params = {
        skipHeader: getBooleanValue('#skipHeader'),
        skipFooters: getBooleanValue('#skipFooters'),
        skipGroups: getBooleanValue('#skipGroups'),
        skipFloatingTop: getBooleanValue('#skipFloatingTop'),
        skipFloatingBottom: getBooleanValue('#skipFloatingBottom'),
        allColumns: getBooleanValue('#allColumns'),
        onlySelected: getBooleanValue('#onlySelected'),
        fileName: document.querySelector('#fileName').value
    };

    if (getBooleanValue('#useCellCallback')) {
        params.processCellCallback = function(params) {
            if (params.value && params.value.toUpperCase) {
                return params.value.toUpperCase();
            } else {
                return params.value;
            }
        };
    }

    if (getBooleanValue('#useSpecificColumns')) {
        params.columnKeys = ['country','bronze'];
    }

    if (getBooleanValue('#processHeaders')) {
        params.processHeaderCallback  = function(params) {
            return params.column.getColDef().headerName.toUpperCase();
        };
    }


    gridOptions.api.exportExcel(params);
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