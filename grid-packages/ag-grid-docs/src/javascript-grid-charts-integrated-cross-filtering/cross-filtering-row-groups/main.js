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
        cartesian: {
            axes: {
                number: {
                    label: {
                        formatter: function (params) {
                            return params.value / 1000 + 'k';
                        },
                    },
                },
                category: {
                    label: {
                        rotation: 335,
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
    { field: 'quarter', rowGroup: true, maxWidth: 160, chartDataType: 'category' },
    { field: 'salesRep', rowGroup: false, chartDataType: 'category' },
    { field: 'handset', rowGroup: false, chartDataType: 'category' },
    { headerName: 'Sale Price', field: 'sale', filter: 'agNumberColumnFilter', maxWidth: 160, aggFunc: 'sum', chartDataType: 'series' },
    { field: 'saleDate', chartDataType: 'category' },
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
        enableRowGroup: true,
    },
    autoGroupColumnDef: {
        headerName: 'Group',
        field: 'salesRep',
        minWidth: 250,
    },
    sideBar: true,
    rowData: generateData(),
    popupParent: document.body,
    enableCharts: true,
    customChartThemes: {
        customDashboardTheme: customDashboardTheme
    },
    chartThemes: ['customDashboardTheme'],
    chartThemeOverrides: {
        // cartesian: {
        //     axes: {
        //         category: {
        //             label: {
        //                 rotation: 10,
        //             },
        //         }
        //     },
        // },
    },
    // getChartToolbarItems: function() { return []; },
    onFirstDataRendered: onFirstDataRendered
};

function onFirstDataRendered(params) {
    // createSalesByRefChart(params.api);
    createQuarterlySalesChart(params.api);
    // createHandsetSalesChart(params.api);
}

function createQuarterlySalesChart(gridApi) {
    var chartParams = {
        chartContainer: document.querySelector('#columnChart'),
        cellRange: {
            columns: ['quarter', 'sale'],
        },
        chartType: 'stackedColumn',
        // aggFunc: 'sum',
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
