var columnDefs = [
    {field: "country", width: 150, chartType: 'category'},
    {field: "gold", chartType: 'series'},
    {field: "silver", chartType: 'series'},
    {field: "bronze", chartType: 'series'}
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


/*


interface LineTooltipRendererParams {
    // The datum object (an element in the `data` array used by the chart/series).
    datum: any;
    // The field of the datum object that contains the category name of the highlighted data point.
    xField: string;
    // The field of the datum object that contains the series value of the highlighted data point.
    yField: string;
}

interface AxisOptions {
    // The thickness of the axis line. Defaults to `1`.
    lineWidth?: number;
    // The color of the axis line. Depends on whether the light or dark mode is used.
    lineColor?: string;

    // The thickness of the ticks. Defaults to `1`.
    tickWidth?: number;
    // The length of the ticks. Defaults to `6`.
    tickSize?: number;
    // The padding between the ticks and the labels. Defaults to `5`.
    tickPadding?: number;
    // The color of the axis ticks. Depends on whether the light or dark mode is used.
    tickColor?: string;

    // The font to be used by axis labels. Defaults to `12px Verdana, sans-serif`.
    labelFont?: string;
    // The color of the axis labels. Depends on whether the light or dark mode is used.
    labelColor?: string;
    // The rotation of the axis labels from their default value. Defaults to `0`.
    labelRotation?: number;
    // The custom formatter function for the axis labels.
    // The value is either a category name or a number. If it's the latter, the number
    // of fractional digits used by the axis step will be provided as well.
    // The returned string will be used as a label.
    labelFormatter?: (value: any, fractionDigits?: number) => string;
    // The styles of the grid lines. These are repeated. If only a single style is provided,
    // it will be used for all grid lines, if two styles are provided, every style will be
    // used by every other line, and so on.
    gridStyle?: IGridStyle[];
}

interface IGridStyle {
    // The stroke color of a grid line. Depends on whether the light or dark mode is used.
    stroke?: string;
    // The line dash array. Every number in the array specifies the length of alternating
    // dashes and gaps. For example, [6, 3] means dash of length 6 and gap of length 3.
    // Defaults to `[4, 2]`.
    lineDash?: number[];
}

*/

function processChartOptions(params) {

    var options = params.options;
    console.log('chart options:', options);

    // we are only interested in processing bar type.
    // so if user changes the type using the chart control,
    // we ignore it.
    if (params.type!=='line') {
        console.log('chart type is ' + params.type + ', making no changes.');
        return params.options;
    }

    // width and height of the chart
    options.height = 500;
    options.width = 1000;

    // padding, we could take padding out by setting options.padding = {}
    options.padding = {top: 10, right: 10, bottom: 20, left: 20};

    options.legendPosition = 'bottom';
    options.legendPadding = 20;

    // all tooltips will have this CSS class on them
    options.tooltipClass = 'my-tool-tip-class';

    // changes to the legend
    var legend = options.legend;
    legend.markerStrokeWidth = 4;
    legend.markerSize = 30;
    legend.markerPadding = 20;
    legend.itemPaddingX = 40;
    legend.itemPaddingY = 100;
    legend.labelFont = 'italic 20px Comic Sans MS';
    legend.labelColor = '#2222aa';

    // changes to the xAxis
    var xAxis = options.xAxis;
    xAxis.lineWidth = 4;
    xAxis.lineColor = '#000000';
    xAxis.tickWidth = 4;
    xAxis.tickSize = 10;
    xAxis.tickPadding = 10;
    xAxis.tickColor = 'black';
    xAxis.labelFont = 'italic 15px Comic Sans MS';
    xAxis.labelColor = 'rgb(0,0,0)';
    xAxis.labelRotation = 20;
    xAxis.labelFormatter = function(value) {
        return value.toString().toUpperCase();
    };
    xAxis.gridStyle = [
        {
            stroke: 'red',
            lineDash: [4,2]
        },
        {
            stroke: 'blue'
        }
    ];

    // changes to the yAxis
    var yAxis = options.yAxis;
    yAxis.lineWidth = 4;
    yAxis.lineColor = '#000000';
    yAxis.tickWidth = 4;
    yAxis.tickSize = 10;
    yAxis.tickPadding = 10;
    yAxis.tickColor = 'black';
    yAxis.labelFont = 'italic 15px Comic Sans MS';
    yAxis.labelColor = 'rgb(0,0,0)';
    yAxis.labelRotation = -20;
    yAxis.labelFormatter = function(value) {
        return value.toString().toUpperCase();
    };
    yAxis.gridStyle = [
        {
            stroke: 'black',
            lineDash: [2,2]
        }
    ];

    var seriesDefaults = options.seriesDefaults;

    // leaving this out, as it will hide all the items form the legend!
    // seriesDefaults.showInLegend = false;
    // seriesDefaults.tooltipEnabled = true;

    // TODO - how are fills and strokes set? it takes fill and stroke, not fills and strokes
    var gold = '#d4af37';
    var silver = '#c0c0c0';
    var bronze = '#cd7f32';

    var gold2 = '#c49f27';
    var silver2 = '#b0b0b0';
    var bronze2 = '#bd6f22';

    // doesn't work, gets overridden
    seriesDefaults.fills = [gold, silver, bronze];
    seriesDefaults.strokes = [gold2, silver2, bronze2];

    // doesn't work, get's overridden
    // seriesDefaults.title = 'Monday';

    seriesDefaults.strokeWidth = 10;
    seriesDefaults.marker = true;
    seriesDefaults.markerSize = 20;
    seriesDefaults.markerStrokeWidth = 10;

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
        chartType: 'line'
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