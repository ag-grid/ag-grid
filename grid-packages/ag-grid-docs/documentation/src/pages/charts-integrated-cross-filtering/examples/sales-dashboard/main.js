var customDashboardTheme = {
    baseTheme: 'ag-default-dark',
    overrides: {
        common: {
            background: {
                fill: '#181d1f'
            },
            legend: {
                enabled: false
            },
            padding: {
                top: 20,
                right: 40,
                bottom: 20,
                left: 30,
            }
        },
        column: {
            axes: {
                number: {
                    label: {
                        formatter: function (params) {
                            return params.value / 1000 + 'k';
                        },
                    },
                }
            }
        },
        pie: {
            legend: {
                enabled: true
            },
            series: {
                title: {
                    enabled: false
                },
                label: {
                    enabled: false
                }
            }
        }
    }
};

var columnDefs = [
    { field: 'salesRep', chartDataType: 'category' },
    { field: 'handset', chartDataType: 'category' },
    { headerName: 'Sale Price', field: 'sale', maxWidth: 160, aggFunc: 'sum', chartDataType: 'series' },
    { field: 'saleDate', chartDataType: 'category' },
    { field: 'quarter', maxWidth: 160, chartDataType: 'category' },
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        editable: true,
        sortable: true,
        filter: 'agMultiColumnFilter',
        floatingFilter: true,
        resizable: true,
    },
    rowData: generateData(),
    popupParent: document.body,
    enableCharts: true,
    customChartThemes: {
        customDashboardTheme: customDashboardTheme
    },
    chartThemes: ['customDashboardTheme'],
    chartThemeOverrides: {
        cartesian: {
            axes: {
                category: {
                    label: {
                        rotation: 0,
                    },
                }
            },
        },
    },
    getChartToolbarItems: function() { return []; },
    onFirstDataRendered: onFirstDataRendered
};

function onFirstDataRendered(params) {
    createQuarterlySalesChart(params.api);
    createSalesByRefChart(params.api);
    createHandsetSalesChart(params.api);
}

function createQuarterlySalesChart(gridApi) {
    var chartParams = {
        chartContainer: document.querySelector('#columnChart'),
        cellRange: {
            columns: ['quarter', 'sale'],
        },
        chartType: 'stackedColumn',
        aggFunc: 'sum',
        chartThemeOverrides: {
            common: {
                title: {
                    enabled: true,
                    text: 'Quarterly Sales ($)'
                }
            }
        },
    };
    gridApi.createCrossFilterChart(chartParams);
}

function createSalesByRefChart(gridApi) {
    var chartParams = {
        chartContainer: document.querySelector('#pieChart'),
        cellRange: {
            columns: ['salesRep', 'sale'],
        },
        chartType: 'pie',
        aggFunc: 'sum',
        chartThemeOverrides: {
            common: {
                title: {
                    enabled: true,
                    text: 'Sales by Representative ($)'
                }
            }
        },
    };
    gridApi.createCrossFilterChart(chartParams);
}

function createHandsetSalesChart(gridApi) {
    var chartParams = {
        chartContainer: document.querySelector('#barChart'),
        cellRange: {
            columns: ['handset', 'sale'],
        },
        chartType: 'stackedBar',
        aggFunc: 'count',
        chartThemeOverrides: {
            common: {
                title: {
                    enabled: true,
                    text: 'Handsets Sold (Units)',
                }
            }
        },
    };
    gridApi.createCrossFilterChart(chartParams);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
