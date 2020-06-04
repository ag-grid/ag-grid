var columnDefs = [
    { field: "country", width: 150, chartDataType: 'category' },
    { field: "gold", chartDataType: 'series' },
    { field: "silver", chartDataType: 'series' },
    { field: "bronze", chartDataType: 'series' },
    { headerName: "A", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series' },
    { headerName: "B", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series' },
    { headerName: "C", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series' },
    { headerName: "D", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series' }
];

function createRowData() {
    var countries = [
        "Ireland", "Spain", "United Kingdom", "France", "Germany", "Luxembourg", "Sweden",
        "Norway", "Italy", "Greece", "Iceland", "Portugal", "Malta", "Brazil", "Argentina",
        "Colombia", "Peru", "Venezuela", "Uruguay", "Belgium"
    ];

    return countries.map(function(country, index) {
        return {
            country: country,
            gold: Math.floor(((index + 1 / 7) * 333) % 100),
            silver: Math.floor(((index + 1 / 3) * 555) % 100),
            bronze: Math.floor(((index + 1 / 7.3) * 777) % 100),
        };
    });
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

    console.log('chart options:', options);

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
        options.xAxis.label.format = '%d %B';
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
    options.xAxis.label.formatter = function(params) {
        return params.value.toString().toUpperCase();
    };

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
    options.yAxis.label.formatter = function(params) {
        var value = String(params.value);
        return value === 'United Kingdom' ? 'UK' : '(' + value + ')';
    };

    options.navigator.enabled = true;
    options.navigator.height = 9;
    options.navigator.min = 0.2;
    options.navigator.max = 1;

    options.navigator.mask.fill = 'lime';
    options.navigator.mask.stroke = 'black';
    options.navigator.mask.strokeWidth = 2;
    options.navigator.mask.fillOpacity = 0.3;

    options.navigator.minHandle.fill = 'yellow';
    options.navigator.minHandle.stroke = 'blue';
    options.navigator.minHandle.strokeWidth = 2;
    options.navigator.minHandle.width = 12;
    options.navigator.minHandle.height = 22;
    options.navigator.minHandle.gripLineGap = 4;
    options.navigator.minHandle.gripLineLength = 12;

    options.navigator.maxHandle.fill = 'yellow';
    options.navigator.maxHandle.stroke = 'blue';
    options.navigator.maxHandle.strokeWidth = 2;
    options.navigator.maxHandle.width = 12;
    options.navigator.maxHandle.height = 22;
    options.navigator.maxHandle.gripLineGap = 4;
    options.navigator.maxHandle.gripLineLength = 12;

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
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'groupedBar'
    };

    params.api.createRangeChart(createRangeChartParams);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
