var data = [
    { date: new Date(2019, 0, 1), sport: 'Tennis', gold: 126, silver: 180 },
    { date: new Date(2019, 0, 2), sport: 'Judo', gold: 133, silver: 201 },
    { date: new Date(2019, 0, 3), sport: 'Swimming', gold: 113, silver: 155 },
    { date: new Date(2019, 0, 5), sport: 'Gymnastics', gold: 222, silver: 260 },
    { date: new Date(2019, 0, 8), sport: 'Cycling', gold: 126, silver: 160 },
    { date: new Date(2019, 0, 12), sport: 'Canoeing', gold: 133, silver: 185 },
    { date: new Date(2019, 0, 13), sport: 'Athletics', gold: 113, silver: 165 },
    { date: new Date(2019, 0, 22), sport: 'Badminton', gold: 122, silver: 178 },
];

var gridOptions = {
    columnDefs: [
        { field: 'date',
            valueFormatter: function(params) {
                if (params.value) {
                    return params.value.toISOString().substring(0, 10);
                }
            }
        },
        { field: 'sport', chartDataType: 'category' },
        { field: 'gold', chartDataType: 'series' },
        { field: 'silver', chartDataType: 'series' }
    ],
    defaultColDef: {
        flex: 1,
        resizable: true,
    },
    popupParent: document.body,
    rowData: data,
    enableRangeSelection: true,
    enableCharts: true,
    chartThemeOverrides: {
        common: {
            title: {
                enabled: true,
                text: 'Medal Totals',
            },
            legend: {
                enabled: true,
                position: 'bottom',
            },
        },
        line: {
            navigator: {
                enabled: true
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
                        rotation: 90,
                    },
                },
            },
        },
    },
    onFirstDataRendered: onFirstDataRendered,
};

function onFirstDataRendered() {
    createChart('date');
}

var currentChartRef;
function createChart(categoryOrTimeColumn) {
    if (currentChartRef) {
        currentChartRef.destroyChart();
    }

    var createRangeChartParams = {
        chartContainer: document.querySelector('#myChart'),
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: data.length - 1,
            columns: [categoryOrTimeColumn, 'gold', 'silver'],
        },
        chartType: 'line',
    };
    currentChartRef = gridOptions.api.createRangeChart(createRangeChartParams);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
