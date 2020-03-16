var columnDefs = [
    {
        headerName: 'Top Level Column Group',
        children: [
            {
                headerName: 'Group A',
                children: [
                    { 
                        field: 'athlete',
                        minWidth: 150,
                        flex: 1
                    },
                    {
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
                        field: 'country',
                        minWidth: 200,
                        resizable: true,
                        flex: 1,
                        cellClassRules: {
                            redFont: function(params) {
                                return params.value === 'United States';
                            }
                        }
                    },
                    {
                        headerName: 'Group',
                        valueGetter: 'data.country.charAt(0)',
                        width: 100,
                        cellClassRules: {
                            boldBorders: function(params) {
                                return params.value === 'U';
                            }
                        },
                        cellClass: ['redFont', 'greenBackground']
                    },
                    {
                        field: 'year',
                        width: 100,
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
                    {
                        field: 'date',
                        minWidth: 150,
                        cellClass: 'dateFormat',
                        valueGetter: function (params) {
                            var val = params.data.date;

                            if (val.indexOf('/') < 0) { return val; }

                            var split = val.split('/');

                            return split[2] + '-' + split[1] + '-' + split[0];

                        }
                    },
                    {
                        field: 'sport',
                        minWidth: 150,
                        flex: 1
                    },
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
                    { 
                        field: 'silver',
                        width: 100,
                        cellClass: 'textFormat'
                    },
                    {
                        field: 'bronze',
                        width: 100 
                    },
                    {
                        field: 'total',
                        width: 100
                    }
                ]
            }
        ]
    }
];

var gridOptions = {
    defaultColDef: {
        cellClassRules: {
            darkGreyBackground: function(params) {
                return params.rowIndex % 2 == 0;
            }
        },
        sortable: true,
        filter: true
    },

    columnDefs: columnDefs,
    rowSelection: 'multiple',

    pinnedTopRowData: [
        {
            athlete: 'Floating <Top> Athlete',
            age: 999,
            country: 'Floating <Top> Country',
            year: 2020,
            date: '2020-08-01',
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
            date: '2030-08-01',
            sport: 'Track & Field',
            gold: 222,
            silver: '005',
            bronze: 244,
            total: 255
        }
    ],

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
            },
            borders: {
                borderBottom: {
                    color: '#5687f5',
                    lineStyle: 'Continuous',
                    weight: 1
                },
                borderLeft: {
                    color: '#5687f5',
                    lineStyle: 'Continuous',
                    weight: 1
                },
                borderRight: {
                    color: '#5687f5',
                    lineStyle: 'Continuous',
                    weight: 1
                },
                borderTop: {
                    color: '#5687f5',
                    lineStyle: 'Continuous',
                    weight: 1
                }
            }
        },
        {
            id: 'dateFormat',
            dataType: 'dateTime',
            numberFormat: {
                format: 'mm/dd/yyyy;@'
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

function getTextValue(cssSelector) {
    return document.querySelector(cssSelector).value;
}

function getNumericValue(cssSelector) {
    var value = parseFloat(getTextValue(cssSelector));
    if (isNaN(value)) {
        var message = "Invalid number entered in " + cssSelector + " field";
        alert(message);
        throw new Error(message);
    }
    return value;
}

function myColumnWidthCallback(params) {
    var originalWidth = params.column.getActualWidth();
    if (params.index < 7) {
        return originalWidth;
    }
    return 30;
}

function onBtExport() {
    var columnWidth = getBooleanValue('#columnWidth') ? getTextValue('#columnWidthValue') : undefined;
    var params = {
        columnWidth: columnWidth === 'myColumnWidthCallback' ? myColumnWidthCallback : parseFloat(columnWidth),
        sheetName: getBooleanValue('#sheetName') && getTextValue('#sheetNameValue'),
        exportMode: getBooleanValue('#exportModeXml') ? "xml" : undefined,
        suppressTextAsCDATA: getBooleanValue('#suppressTextAsCDATA'),
        rowHeight: getBooleanValue('#rowHeight') ? getNumericValue('#rowHeightValue') : undefined,
        headerRowHeight: getBooleanValue('#headerRowHeight') ? getNumericValue('#headerRowHeightValue') : undefined,
        customHeader: [
            [],
            [{styleId: 'bigHeader', data: {type: 'String', value: 'content appended with customHeader'}, mergeAcross: 3}],
            [{data: {type: 'String', value: 'Numeric value'}, mergeAcross: 2}, {data: {type: 'Number', value: '3695.36'}}],
            []
        ],
        customFooter: [
            [],
            [{styleId: 'bigHeader', data: {type: 'String', value: 'content appended with customFooter'}}]
        ]
    };

    gridOptions.api.exportDataAsExcel(params);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {

            var httpResult = JSON.parse(httpRequest.responseText);

            gridOptions.api.setRowData(httpResult);
        }
    };
});
