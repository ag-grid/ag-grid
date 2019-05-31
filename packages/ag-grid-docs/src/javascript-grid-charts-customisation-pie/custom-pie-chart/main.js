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

// The padding of contents from the edges of the chart.
    padding?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    // The side of the chart to dock the legend to.
    legendPosition?: 'top' | 'right' | 'bottom' | 'left';
    // The padding amount between the legend and the series.
    legendPadding?: number;
    // The CSS class name to be used by the tooltip element.
    tooltipClass?: string;
    legend?: {
        // The stroke width of a legend marker. Defaults to `1`.
        markerStrokeWidth?: number;
        // The size of a legend marker. Defaults to `14`.
        markerSize?: number;
        // The padding between a legend marker and its label. Defaults to `4`.
        markerPadding?: number;
        // The amount of horizontal padding between legend items. Defaults to `16`.
        itemPaddingX?: number;
        // The amount of vertical padding between legend items. Defaults to `8`.
        itemPaddingY?: number;
        // The font to be used by the legend's labels. Defaults to `12px Verdana, sans-serif`.
        // Should use the same format as the shorthand `font` property in CSS.
        labelFont?: string;
        // The color to be used by the legend's labels. Depends on whether the light or dark mode is used.
        labelColor?: string;
    };
    seriesDefaults?: {
        // The title of the series. Shown above the series and in (default) tooltips.
        title?: string;
        // Whether to show series title or not. Defaults to `false`.
        titleEnabled?: boolean;
        // The font to be used by the series title.
        titleFont?: string;
        // Whether this series should be represented in the legend. Defaults to `true`.
        showInLegend?: boolean;
        // Whether to show the tooltip for bars when they are hovered/tapped. Defaults to `false`.
        tooltipEnabled?: boolean;
        // Whether to show pie slice labels or not.
        labelEnabled?: boolean;
        // The font to be used for slice labels.
        labelFont?: string;
        // The color to use for slice labels.
        labelColor?: string;
        // If the pie slice angle is smaller than this value (in degrees), the label won't be shown.
        labelMinAngle?: number;
        // The fill colors of pie slices.
        fills?: string[];
        // The stroke colors of pie slices. Darker versions of fill colors by default.
        strokes?: string[];
        // The stroke width. Defaults to `1`.
        strokeWidth?: number;
        // The callout stroke colors. Same as stroke colors by default.
        calloutColors?: string[];
        // The thickness of a callout line. Defaults to `2`.
        calloutWidth?: number;
        // The length of a callout line. Defaults to `10`.
        calloutLength?: number;
        // The padding between the callouts and the labels. Defaults to `3`.
        calloutPadding?: number;
        // The shadow type to use for bars. Defaults to no shadow.
        // Note: shadows can noticeably slow down rendering of charts with a few hundred bars.
        shadow?: {
            // The shadow color. For example, 'rgba(0, 0, 0, 0.3)'.
            color?: string;
            // The shadow offset.
            offset?: [number, number];
            // The blur amount to apply.
            blur?: number;
        };
        // A custom tooltip render to use for bar tooltips. Should return a valid HTML string.
        tooltipRenderer?: (params: DoughnutTooltipRendererParams) => string;
    };

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