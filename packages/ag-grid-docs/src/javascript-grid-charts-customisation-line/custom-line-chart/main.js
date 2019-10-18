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

    // we are only interested in processing line type.
    // so if user changes the type using the chart control,
    // we ignore it.
    if (params.type !== 'line') {
        console.log('chart type is ' + params.type + ', making no changes.');
        return params.options;
    }

    var xAxis = options.xAxis;
    xAxis.title = {
        enabled: true,
        text: 'Country',
        fontStyle: 'italic',
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        color: 'gray'
    };
    xAxis.line.width = 2;
    xAxis.line.color = 'gray';
    xAxis.tick.width = 2;
    xAxis.tick.size = 10;
    xAxis.tick.color = 'gray';
    xAxis.label.fontStyle = 'italic';
    xAxis.label.fontWeight = 'bold';
    xAxis.label.fontSize = 15;
    xAxis.label.fontFamily = 'Arial, sans-serif';
    xAxis.label.padding = 10;
    xAxis.label.color = '#de7b73';
    xAxis.label.rotation = 20;
    xAxis.label.formatter = function(params) {
        var value = String(params.value);
        return value === 'United Kingdom' ? 'UK' : '(' + value + ')';
    };
    xAxis.gridStyle = [
        {
            stroke: 'rgba(94,100,178,0.5)'
        }
    ];

    var yAxis = options.yAxis;
    yAxis.line.width = 2;
    yAxis.line.color = 'blue';
    yAxis.tick.width = 2;
    yAxis.tick.size = 10;
    yAxis.tick.color = 'blue';
    yAxis.label.fontStyle = 'italic';
    yAxis.label.fontWeight = 'bold';
    yAxis.label.fontSize = 15;
    yAxis.label.fontFamily = 'Arial, sans-serif';
    yAxis.label.padding = 10;
    yAxis.label.color = '#de7b73';
    yAxis.label.rotation = -20;
    yAxis.label.formatter = function(params) {
        return params.value.toString().toUpperCase();
    };
    yAxis.gridStyle = [
        {
            stroke: '#80808044',
            lineDash: undefined
        },
        {
            stroke: '#80808044',
            lineDash: [6, 3]
        }
    ];

    var seriesDefaults = options.seriesDefaults;

    seriesDefaults.fill.colors = ['#e1ba00', 'silver', 'peru'];
    seriesDefaults.stroke.colors = ['black', '#ff0000'];
    seriesDefaults.stroke.width = 2;
    seriesDefaults.highlightStyle = {
        fill: 'red',
        stroke: 'yellow'
    };

    seriesDefaults.marker.enabled = true;
    seriesDefaults.marker.size = 12;
    seriesDefaults.marker.strokeWidth = 4;

    seriesDefaults.tooltip.renderer = function(params) {
        var x = params.datum[params.xKey];
        var y = params.datum[params.yKey];
        return '<u style="color: ' + params.color + '">' + params.title + '</u><br><br><b>' + params.xName.toUpperCase() + ':</b> ' + x + '<br/><b>' + params.yName.toUpperCase() + ':</b> ' + y;
    };

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
        chartType: 'line'
    };

    params.api.createRangeChart(createRangeChartParams);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
