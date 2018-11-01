var columnDefs = [
    {
        headerName: 'Top Level Column Group',
        children: [
            {
                headerName: 'Group A',
                children: [
                    {headerName: 'Athlete', field: 'athlete', width: 150},
                    {
                        headerName: 'Age',
                        field: 'age',
                        width: 90,
                        cellClass: 'twoDecimalPlaces',
                        cellClassRules: {
                            greenBackground: function(params) {
                                return params.value < 23;
                            },
                            redFont: function(params) {
                                return params.value < 20;
                            }
                        }
                    },
                    {
                        headerName: 'Country',
                        field: 'country',
                        width: 120,
                        cellClassRules: {
                            redFont: function(params) {
                                return params.value === 'United States';
                            }
                        }
                    },
                    {
                        headerName: 'Group',
                        valueGetter: 'data.country.charAt(0)',
                        width: 75,
                        cellClassRules: {
                            boldBorders: function(params) {
                                return params.value === 'U';
                            }
                        },
                        cellClass: ['redFont', 'greenBackground']
                    },
                    {
                        headerName: 'Year',
                        field: 'year',
                        width: 75,
                        cellClassRules: {
                            notInExcel: function(params) {
                                return true;
                            }
                        }
                    }
                ]
            },
            {
                headerName: 'Group B',
                children: [
                    {headerName: 'Date', field: 'date', width: 110},
                    {headerName: 'Sport', field: 'sport', width: 110},
                    {
                        headerName: 'Gold',
                        field: 'gold',
                        width: 100,
                        cellClassRules: {
                            boldBorders: function(params) {
                                return params.value > 2;
                            }
                        }
                    },
                    {headerName: 'Silver', field: 'silver', width: 100, cellClass: 'textFormat'},
                    {headerName: 'Bronze', field: 'bronze', width: 100},
                    {headerName: 'Total', field: 'total', width: 100}
                ]
            }
        ]
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    groupHeaders: true,
    enableFilter: true,
    enableSorting: true,
    rowSelection: 'multiple',
    pinnedTopRowData: [
        {
            athlete: 'Floating <Top> Athlete',
            age: 999,
            country: 'Floating <Top> Country',
            year: 2020,
            date: '01-08-2020',
            sport: 'Track & Field',
            gold: 22,
            silver: '003',
            bronze: 44,
            total: 55
        }
    ],
    pinnedBottomRowData: [
        {
            athlete: 'Floating <Bottom> Athlete',
            age: 888,
            country: 'Floating <Bottom> Country',
            year: 2030,
            date: '01-08-2030',
            sport: 'Track & Field',
            gold: 222,
            silver: '005',
            bronze: 244,
            total: 255
        }
    ],
    defaultColDef: {
        cellClassRules: {
            darkGreyBackground: function(params) {
                return params.rowIndex % 2 == 0;
            }
        }
    },
    excelStyles: [
        {
            id: 'greenBackground',
            interior: {
                color: '#b5e6b5',
                pattern: 'Solid'
            }
        },
        {
            id: 'redFont',
            font: {
                fontName: 'Calibri Light',
                underline: 'Single',
                italic: true,
                color: '#ff0000'
            }
        },
        {
            id: 'darkGreyBackground',
            interior: {
                color: '#888888',
                pattern: 'Solid'
            },
            font: {
                fontName: 'Calibri Light',
                color: '#ffffff'
            }
        },
        {
            id: 'boldBorders',
            borders: {
                borderBottom: {
                    color: '#000000',
                    lineStyle: 'Continuous',
                    weight: 3
                },
                borderLeft: {
                    color: '#000000',
                    lineStyle: 'Continuous',
                    weight: 3
                },
                borderRight: {
                    color: '#000000',
                    lineStyle: 'Continuous',
                    weight: 3
                },
                borderTop: {
                    color: '#000000',
                    lineStyle: 'Continuous',
                    weight: 3
                }
            }
        },
        {
            id: 'header',
            interior: {
                color: '#CCCCCC',
                pattern: 'Solid'
            }
        },
        {
            id: 'twoDecimalPlaces',
            numberFormat: {
                format: '#,##0.00'
            }
        },
        {
            id: 'textFormat',
            dataType: 'string'
        },
        {
            id: 'bigHeader',
            font: {
                size: 25
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
        columnGroups: getBooleanValue('#columnGroups'),
        skipFooters: getBooleanValue('#skipFooters'),
        skipGroups: getBooleanValue('#skipGroups'),
        skipPinnedTop: getBooleanValue('#skipPinnedTop'),
        skipPinnedBottom: getBooleanValue('#skipPinnedBottom'),
        allColumns: getBooleanValue('#allColumns'),
        onlySelected: getBooleanValue('#onlySelected'),
        fileName: document.querySelector('#fileName').value,
        sheetName: document.querySelector('#sheetName').value,
        exportMode: document.querySelector('input[name="mode"]:checked').value
    };

    if (getBooleanValue('#skipGroupR')) {
        params.shouldRowBeSkipped = function(params) {
            return params.node.data.country.charAt(0) === 'R';
        };
    }

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
        params.columnKeys = ['country', 'bronze'];
    }

    if (getBooleanValue('#processHeaders')) {
        params.processHeaderCallback = function(params) {
            return params.column.getColDef().headerName.toUpperCase();
        };
    }

    if (getBooleanValue('#appendHeader')) {
        params.customHeader = [
            [],
            [{styleId: 'bigHeader', data: {type: 'String', value: 'Summary'}}],
            [{data: {type: 'String', value: 'Sales'}, mergeAcross: 2}, {data: {type: 'Number', value: '3695.36'}}],
            []
        ];
    }

    if (getBooleanValue('#appendFooter')) {
        params.customFooter = [
            [],
            [{styleId: 'bigHeader', data: {type: 'String', value: 'Footer'}}],
            [{data: {type: 'String', value: 'Purchases'}, mergeAcross: 2}, {data: {type: 'Number', value: '7896.35'}}],
            []
        ];
    }

    if (getBooleanValue('#processHeaders')) {
        params.processHeaderCallback = function(params) {
            return params.column.getColDef().headerName.toUpperCase();
        };
    }

    gridOptions.api.exportDataAsExcel(params);
}

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