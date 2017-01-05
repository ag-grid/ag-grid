var columnDefs = [{
    headerName: 'Group1',
    children: [
        {headerName: "Athlete", field: "athlete", width: 150},
        {headerName: "Age", field: "age", width: 90, cellClassRules:{
            lessThan23IsGreen: function(params) { return params.value < 23},
            lessThan20IsBlue: function(params) { return params.value < 20}
        }},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Group", valueGetter: "data.country.charAt(0)", width: 75},
        {headerName: "Year", field: "year", width: 75}
    ]
}, {
    headerName: 'Group2',
    children: [
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110},
        {headerName: "Gold", field: "gold", width: 100},
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

    },
    excelStyles: [
        {
            id: "header",
            name: "header",
            alignment: {
                horizontal: 'Left', vertical: 'Bottom'
            },
            borders: {
                borderBottom: {
                    color: "#808080", lineStyle: 'Continuous', weight: 1
                },
                borderLeft: {
                    color: "#808080", lineStyle: 'Continuous', weight: 1
                },
                borderRight: {
                    color: "#808080", lineStyle: 'Continuous', weight: 1
                },
                borderTop: {
                    color: "#808080", lineStyle: 'Continuous', weight: 1
                }
            },
            font: { color: "#000000"},
            interior: {
                color: "#8C8C8C", pattern: 'Solid'
            }
        },
        {
            id: "bodyOdd",
            name: "bodyOdd",
            alignment: {
                horizontal: 'Left', vertical: 'Bottom'
            },
            borders: {
                borderBottom: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                },
                borderLeft: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                },
                borderRight: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                },
                borderTop: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                }
            },
            font: { color: "#000000"},
            interior: {
                color: "#ACACAC", pattern: 'Solid'
            }
        },
        {
            id: "bodyEven",
            name: "bodyEven",
            alignment: {
                horizontal: 'Left', vertical: 'Bottom'
            },
            borders: {
                borderBottom: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                },
                borderLeft: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                },
                borderRight: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                },
                borderTop: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                }
            },
            font: { color: "#000000"},
            interior: {
                color: "#FFFFFF", pattern: 'Solid'
            }
        },
        {
            id: "lessThan23IsGreen",
            name: "lessThan23IsGreen",
            alignment: {
                horizontal: 'Right', vertical: 'Bottom'
            },
            borders: {
                borderBottom: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                },
                borderLeft: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                },
                borderRight: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                },
                borderTop: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                }
            },
            font: { color: "#e0ffc1"},
            interior: {
                color: "#008000", pattern: 'Solid'
            }
        },
        {
            id: "lessThan20IsBlue",
            name: "lessThan20IsBlue",
            alignment: {
                horizontal: 'Right', vertical: 'Bottom'
            },
            borders: {
                borderBottom: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                },
                borderLeft: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                },
                borderRight: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                },
                borderTop: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                }
            },
            font: { color: "#FFFFFF"},
            interior: {
                color: "#00008B", pattern: 'Solid'
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
        suppressQuotes: getBooleanValue('#suppressQuotes'),
        fileName: document.querySelector('#fileName').value,
        columnSeparator: document.querySelector('#columnSeparator').value
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

    if (getBooleanValue('#customHeader')) {
        params.customHeader = '[[[ This ia s sample custom header - so meta data maybe?? ]]]\n';
    }
    if (getBooleanValue('#customFooter')) {
        params.customFooter = '[[[ This ia s sample custom footer - maybe a summary line here?? ]]]\n';
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