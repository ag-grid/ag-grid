var columnDefs = [
    {field: "country", width: 150, chartDataType: 'category'},
    {field: "gold", chartDataType: 'series'},
    {field: "silver", chartDataType: 'series'},
    {field: "bronze", chartDataType: 'series'},
    {headerName: "A", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series'},
    {headerName: "B", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series'},
    {headerName: "C", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series'},
    {headerName: "D", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series'}
];

function createRowData() {
    let countries = ["Ireland", "Spain", "United Kingdom", "France", "Germany", "Luxembourg", "Sweden",
        "Norway", "Italy", "Greece", "Iceland", "Portugal", "Malta", "Brazil", "Argentina",
        "Colombia", "Peru", "Venezuela", "Uruguay", "Belgium"];
    let rowData = [];
    countries.forEach( function(country, index) {
        rowData.push({
                country: country,
                gold: Math.floor(((index+1 / 7) * 333)%100),
                silver: Math.floor(((index+1 / 3) * 555)%100),
                bronze: Math.floor(((index+1 / 7.3) * 777)%100),
        });
    });
    return rowData;
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
    onGridReady: onGridReady,
    processChartOptions: processChartOptions
};

function processChartOptions(params) {

    var options = params.options;
    console.log('chart options:', options);

    // we are only interested in processing bar type.
    // so if user changes the type using the chart control,
    // we ignore it.
    if (params.type!=='groupedBar') {
        console.log('chart type is ' + params.type + ', making no changes.');
        return params.options;
    }

    options.height = 500;
    options.width = 1000;

    options.padding = {top: 20, right: 10, bottom: 10, left: 20};

    options.tooltipClass = 'my-tool-tip-class';

    options.legendPosition = 'bottom';
    options.legendPadding = 20;

    var legend = options.legend;
    legend.markerStrokeWidth = 2;
    legend.markerSize = 25;
    legend.markerPadding = 10;
    legend.itemPaddingX = 120;
    legend.itemPaddingY = 20;
    legend.labelFont = 'bold 18px Arial, sans-serif';
    legend.labelColor = '#555';

    var xAxis = options.xAxis;
    xAxis.lineWidth = 2;
    xAxis.lineColor = 'gray';

    xAxis.tickWidth = 2;
    xAxis.tickSize = 10;
    xAxis.tickPadding = 10;
    xAxis.tickColor = 'gray';

    xAxis.labelFont = 'bold 15px Arial, sans-serif';
    xAxis.labelColor = '#de7b73';
    xAxis.labelRotation = 20;
    xAxis.labelFormatter = function(value) {
        return value === 'United Kingdom' ? 'UK' : '(' + String(value) + ')';
    };
    xAxis.gridStyle = [
        {
            stroke: 'rgba(94,100,178,0.5)'
        }
    ];

    // changes to the yAxis
    var yAxis = options.yAxis;
    yAxis.lineWidth = 2;
    yAxis.lineColor = 'gray';
    yAxis.tickWidth = 2;
    yAxis.tickSize = 10;
    yAxis.tickPadding = 10;
    yAxis.tickColor = 'gray';
    yAxis.labelFont = 'bold 15px Arial, sans-serif';
    yAxis.labelColor = '#de7b73';
    yAxis.labelRotation = 20;
    yAxis.labelFormatter = function(value) {
        return value.toString().toUpperCase();
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

    seriesDefaults.fills = ['#e1ba00', 'silver', 'peru'];
    seriesDefaults.strokes = ['black'];
    seriesDefaults.strokeWidth = 2;

    // only impacts stacked bar chart
    seriesDefaults.labelEnabled = true;
    seriesDefaults.labelFont = 'italic 15px Arial, sans-serif';
    seriesDefaults.labelPadding = {x: 10, y: 10};
    seriesDefaults.labelColor = 'green';

    seriesDefaults.shadow = {
        color: 'rgba(0, 0, 0, 0.3)',
        offset: [5, 5],
        blur: 8
    };

    seriesDefaults.tooltipRenderer = function(params) {
        var xField = params.xField;
        var yField = params.yField;
        var x = params.datum[xField];
        var y = params.datum[yField];
        return '<b>'+xField.toUpperCase()+':</b> ' + x + '<br/><b>'+yField.toUpperCase()+':</b> '+y;
    };

    return options;
}

function onGridReady(params) {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var chartRangeParams = {
        cellRange: cellRange,
        chartType: 'groupedBar'
    };

    setTimeout(function () {
        params.api.chartRange(chartRangeParams);
    }, 100);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
