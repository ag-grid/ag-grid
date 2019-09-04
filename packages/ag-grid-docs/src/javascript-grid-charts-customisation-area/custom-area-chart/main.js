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
    countries.forEach(function(country, index) {
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
    onFirstDataRendered,
    processChartOptions,
};

function processChartOptions(params) {
    var options = params.options;
    console.log('chart options:', options);

    // We are only interested in processing area type,
    // so if user changes the type using the chart control,
    // we ignore it.
    if (params.type !== 'stackedArea') {
        console.log('chart type is ' + params.type + ', making no changes.');
        return params.options;
    }

    options.height = 500;
    options.width = 1000;

    options.title = {
        text: 'Precious Metals Production',
        fontStyle: 'italic',
        fontWeight: 'bold',
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        color: '#414182'
    };
    options.subtitle = {
        text: 'by country',
        fontStyle: 'italic',
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        color: 'rgb(100, 100, 100)'
    };

    options.padding = {top: 20, right: 100, bottom: 10, left: 20};

    options.tooltipClass = 'my-tool-tip-class';

    options.legendPosition = 'bottom';
    options.legendPadding = 20;

    var legend = options.legend;
    legend.enabled = true;
    legend.markerStrokeWidth = 2;
    legend.markerSize = 25;
    legend.markerPadding = 10;
    legend.itemPaddingX = 120;
    legend.itemPaddingY = 20;
    legend.labelFontStyle = 'italic';
    legend.labelFontWeight = 'bold';
    legend.labelFontSize = 18;
    legend.labelFontFamily = 'Arial, sans-serif';
    legend.labelColor = '#555';

    var xAxis = options.xAxis;
    xAxis.title = {
        text: 'Gold'
    };
    xAxis.lineWidth = 2;
    xAxis.lineColor = 'gray';
    xAxis.tickWidth = 2;
    xAxis.tickSize = 10;
    xAxis.tickPadding = 10;
    xAxis.tickColor = 'gray';
    xAxis.labelFontStyle = 'italic';
    xAxis.labelFontWeight = 'bold';
    xAxis.labelFontSize = 15;
    xAxis.labelFontFamily = 'Arial, sans-serif';
    xAxis.labelColor = '#de7b73';
    xAxis.labelRotation = 20;
    xAxis.labelFormatter = function(params) {
        return params.value === 'United Kingdom' ? 'UK' : '(' + String(params.value) + ')';
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
    yAxis.labelFontStyle = 'italic';
    yAxis.labelFontWeight = 'bold';
    yAxis.labelFontSize = 15;
    yAxis.labelFontFamily = 'Arial, sans-serif';
    yAxis.labelColor = '#de7b73';
    yAxis.labelRotation = 20;
    yAxis.labelFormatter = function(params) {
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

    seriesDefaults.fills = ['#e1ba00', 'silver', 'peru'];
    seriesDefaults.strokes = ['black'];
    seriesDefaults.fillOpacity = 0.8;
    seriesDefaults.strokeOpacity = 0.8;
    seriesDefaults.strokeWidth = 2;
    seriesDefaults.highlightStyle = {
        fill: 'red',
        stroke: 'maroon'
    };

    seriesDefaults.marker = true;
    seriesDefaults.markerSize = 12;
    seriesDefaults.markerStrokeWidth = 4;

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
        return '<b>' + xField.toUpperCase() + ':</b> ' + x + '<br/><b>' + yField.toUpperCase() + ':</b> ' + y;
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
        chartType: 'stackedArea'
    };

    params.api.createRangeChart(createRangeChartParams);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
