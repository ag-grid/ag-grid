var gridOptions = {
    columnDefs: [
        { field: 'salesRep', chartDataType: 'category' },
        { field: 'handset', chartDataType: 'category' },
        { field: 'sale', chartDataType: 'series' },
        { field: 'saleDate', chartDataType: 'category' }
    ],
    defaultColDef: {
        flex: 1,
        sortable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        resizable: true,
    },
    rowData: generateData(),
    enableCharts: true,
    chartThemes: ['ag-default-dark'],
    onFirstDataRendered: onFirstDataRendered
};

function onFirstDataRendered(params) {
    params.api.createCrossFilterChart({
        chartType: 'pie',
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
        chartContainer: document.querySelector('#pieChart'),
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
