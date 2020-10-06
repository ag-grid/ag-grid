function getColumnDefs() {
    return [
        { field: 'date', valueFormatter: dateFormatter},
        { field: 'avgTemp' },
    ];
}

function getRowData() {
    return [
        { date: new Date(2019, 0, 1), avgTemp: 8.27 },
        { date: new Date(2019, 0, 5), avgTemp: 7.22 },
        { date: new Date(2019, 0, 8), avgTemp: 11.54 },
        { date: new Date(2019, 0, 11), avgTemp: 8.44 },
        { date: new Date(2019, 0, 22), avgTemp: 12.03 },
        { date: new Date(2019, 0, 23), avgTemp: 9.68 },
        { date: new Date(2019, 0, 24), avgTemp: 9.9 },
        { date: new Date(2019, 0, 25), avgTemp: 8.74 }
    ];
}

var gridOptions = {
    columnDefs: getColumnDefs(),
    defaultColDef: {
        flex: 1,
        resizable: true,
    },
    popupParent: document.body,
    rowData: getRowData(),
    enableRangeSelection: true,
    enableCharts: true,
    chartThemeOverrides: {
        line: {
            title: {
                enabled: true,
                text: 'Average Daily Temperatures',
            },
            legend: {
                enabled: false,
            },
            padding: {
                top: 15,
                bottom: 25
            },
            navigator: {
                enabled: true,
                height: 20,
                margin: 25
            },
            axes: {
                time: {
                    label: {
                        rotation: 0,
                        format: '%d %b',
                    },
                },
                category: {
                    label: {
                        rotation: 0,
                        formatter: function(params) {
                            return moment(new Date(params.value)).format('DD MMM');
                        }
                    },
                },
                number: {
                    label: {
                        formatter: function (params) {
                            return params.value + '°C';
                        }
                    }
                }
            },
        },
    },
    getChartToolbarItems: getChartToolbarItems,
    onFirstDataRendered: onFirstDataRendered,
};

var currentChartRef;

function onFirstDataRendered(params) {
    if (currentChartRef) {
        currentChartRef.destroyChart();
    }

    var createRangeChartParams = {
        chartContainer: document.querySelector('#myChart'),
        suppressChartRanges: true,
        cellRange: {
            columns: ['date', 'avgTemp']
        },
        chartType: 'line',
    };
    currentChartRef = params.api.createRangeChart(createRangeChartParams);
}

function dateFormatter(params) {
    return params.value ? params.value.toISOString().substring(0, 10) : params.value;
}

function getChartToolbarItems() {
    return ['chartData', 'chartFormat'];
}

function toggleAxis() {
    var axisBtn = document.querySelector('#axisBtn');
    axisBtn.textContent = axisBtn.value;
    axisBtn.value = axisBtn.value === 'time' ? 'category' : 'time';

    var columnDefs = getColumnDefs();
    columnDefs.forEach(function(colDef) {
        if (colDef.field === 'date') {
            colDef.chartDataType = axisBtn.value;
        }
    });

    gridOptions.api.setColumnDefs(columnDefs);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
