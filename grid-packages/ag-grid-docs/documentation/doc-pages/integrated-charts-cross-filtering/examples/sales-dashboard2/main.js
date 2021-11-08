var gridOptions = {
    columnDefs: [
        { field: 'salesRep', chartDataType: 'category' },
        { field: 'handset', chartDataType: 'category' },
        { headerName: 'Sale Price', field: 'sale', maxWidth: 160, aggFunc: 'sum', chartDataType: 'series' },
        { field: 'saleDate', chartDataType: 'category' },
        { field: 'quarter', maxWidth: 160, filter: 'agSetColumnFilter', chartDataType: 'category' },
    ],
    defaultColDef: {
        flex: 1,
        editable: true,
        sortable: true,
        filter: 'agMultiColumnFilter',
        floatingFilter: true,
        resizable: true,
    },
    rowData: generateData(),
    enableCharts: true,
    chartThemes: ['ag-default-dark'],
    chartThemeOverrides: {
        common: {
            padding: {
                top: 20,
                right: 40,
                bottom: 20,
                left: 30,
            }
        },
        cartesian: {
            axes: {
                category: {
                    label: {
                        rotation: 0,
                    },
                }
            },
        }
    },
    onFirstDataRendered: onFirstDataRendered
};

function onFirstDataRendered(params) {
    createQuarterlySalesChart(params.api);
    createSalesByRefChart(params.api);
    createHandsetSalesChart(params.api);
}

function createQuarterlySalesChart(gridApi) {
    gridApi.createCrossFilterChart({
        chartType: 'line',
        cellRange: {
            columns: ['quarter', 'sale'],
        },
        aggFunc: 'sum',
        chartThemeOverrides: {
            common: {
                title: {
                    enabled: true,
                    text: 'Quarterly Sales ($)'
                },
                legend: {
                    enabled: false
                },
                axes: {
                    category: {
                        label: {
                            rotation: 0,
                        },
                    },
                    number: {
                        label: {
                            formatter: function (params) {
                                return params.value / 1000 + 'k';
                            },
                        },
                    }
                }
            }
        },
        chartContainer: document.querySelector('#lineChart'),
    });
}

function createSalesByRefChart(gridApi) {
    gridApi.createCrossFilterChart({
        chartType: 'doughnut',
        cellRange: {
            columns: ['salesRep', 'sale'],
        },
        aggFunc: 'sum',
        chartThemeOverrides: {
            common: {
                title: {
                    enabled: true,
                    text: 'Sales by Representative ($)'
                }
            },
            pie: {
                series: {
                    title: {
                        enabled: false
                    },
                    label: {
                        enabled: false
                    }
                }
            }
        },
        chartContainer: document.querySelector('#doughnutChart'),
    });
}

function createHandsetSalesChart(gridApi) {
    gridApi.createCrossFilterChart({
        chartType: 'area',
        cellRange: {
            columns: ['handset', 'sale'],
        },
        aggFunc: 'count',
        chartThemeOverrides: {
            common: {
                title: {
                    enabled: true,
                    text: 'Handsets Sold (Units)',
                },
                legend: {
                    enabled: false
                },
                padding: {
                    top: 20,
                    right: 60,
                    bottom: 20,
                    left: 50,
                }
            },
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
        chartContainer: document.querySelector('#areaChart'),
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
