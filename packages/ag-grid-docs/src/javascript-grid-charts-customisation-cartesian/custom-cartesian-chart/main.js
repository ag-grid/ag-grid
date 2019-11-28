var columnDefs = [
    { field: "date", width: 150, chartDataType: 'category' },
    { field: "gold", chartDataType: 'series' },
    { field: "silver", chartDataType: 'series' },
    { field: "bronze", chartDataType: 'series' },
];

function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * Math.floor(max - min));
}

function createRowData() {
    var date = new Date(2019, 0, 1);
    var endDate = new Date(2019, 2, 1);
    var data = [];

    while (date < endDate) {
        // deliberately leave out some data points to show how the time axis handles the gaps
        if (getRandomInt(0, 10) < 7) {
            data.push({
                date: new Date(date),
                gold: getRandomInt(0, 1000),
                silver: getRandomInt(1000, 2000),
                bronze: getRandomInt(2000, 3000),
            });
        }

        date.setDate(date.getDate() + 1);
    }

    return data;
}

var gridOptions = {
    defaultColDef: {
        width: 100,
        resizable: true
    },
    popupParent: document.body,
    columnDefs: columnDefs,
    rowData: createRowData(),
    enableRangeSelection: true,
    enableCharts: true,
    onFirstDataRendered: onFirstDataRendered,
    processChartOptions: processChartOptions,
};

function processChartOptions(params) {
    var options = params.options;

    if ([
        'stackedBar',
        'groupedBar',
        'normalizedBar',
        'stackedColumn',
        'groupedColumn',
        'normalizedColumn',
        'line',
        'scatter',
        'bubble',
        'area',
        'stackedArea',
        'normalizedArea',
    ].indexOf(params.type) < 0) {
        console.log('chart type is ' + params.type + ', making no changes.');
        return options;
    }

    if (['line'].indexOf(params.type) >= 0) {
        options.xAxis.type = 'time';
        options.xAxis.label.formatter = function(params) {
            return params.value.toLocaleDateString('en-GB');
        }
    } else {
        var dateFormatter = function(params) {
            var value = params.value.value;

            if (value && value.toLocaleDateString) {
                return value.toLocaleDateString('en-GB');
            } else {
                return params.value;
            }
        };

        options.xAxis.label.formatter = dateFormatter;
        options.yAxis.label.formatter = dateFormatter;
    }

    options.xAxis.line.width = 2;
    options.xAxis.line.color = 'gray';

    options.xAxis.tick.width = 2;
    options.xAxis.tick.size = 10;
    options.xAxis.tick.color = 'gray';

    options.xAxis.label.fontStyle = 'italic';
    options.xAxis.label.fontWeight = 'bold';
    options.xAxis.label.fontSize = 15;
    options.xAxis.label.fontFamily = 'Arial, sans-serif';
    options.xAxis.label.color = '#de7b73';
    options.xAxis.label.padding = 10;
    options.xAxis.label.rotation = 20;

    options.xAxis.gridStyle = [
        {
            stroke: 'rgba(94,100,178,0.5)'
        }
    ];

    options.yAxis.title.enabled = true;
    options.yAxis.title.text = 'Tonnes';
    options.yAxis.title.fontStyle = 'italic';
    options.yAxis.title.fontWeight = 'bold';
    options.yAxis.title.fontSize = 16;
    options.yAxis.title.fontFamily = 'Arial, sans-serif';
    options.yAxis.title.color = 'blue';

    options.yAxis.line.width = 2;
    options.yAxis.line.color = 'blue';

    options.yAxis.tick.width = 2;
    options.yAxis.tick.size = 10;
    options.yAxis.tick.color = 'blue';

    options.yAxis.label.fontStyle = 'italic';
    options.yAxis.label.fontWeight = 'bold';
    options.yAxis.label.fontSize = 15;
    options.yAxis.label.fontFamily = 'Arial, sans-serif';
    options.yAxis.label.color = '#de7b73';
    options.yAxis.label.padding = 10;
    options.yAxis.label.rotation = -20;
    options.yAxis.gridStyle = [
        {
            stroke: '#80808044',
            lineDash: undefined
        },
        {
            stroke: '#80808044',
            lineDash: [6, 3]
        }
    ];

    return options;
}

function onFirstDataRendered(params) {
    var cellRange = {
        columns: ['date', 'gold', 'silver', 'bronze']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'line'
    };

    params.api.createRangeChart(createRangeChartParams);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
