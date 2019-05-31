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


function processChartOptions(params) {

    var options = params.options;
    console.log('chart options:', options);

    // we are only interested in processing bar type.
    // so if user changes the type using the chart control,
    // we ignore it.
    if (params.type!=='pie') {
        console.log('chart type is ' + params.type + ', making no changes.');
        return params.options;
    }

    // width and height of the chart
    options.height = 500;
    options.width = 1000;

    // padding, we could take padding out by setting options.padding = {}
    options.padding = {top: 10, right: 10, bottom: 20, left: 20};

    options.legendPosition = 'bottom';
    // options.legendPadding = 100;

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

    var seriesDefaults = options.seriesDefaults;
    seriesDefaults.fills = ['#503030','#505050','#507070','#509090','#50b0b0'];
    seriesDefaults.strokes = ['#001010','#003030','#005050','#007070','#009090'];

    // seriesDefaults.tooltipEnabled = false;
    seriesDefaults.labelEnabled = true;
    seriesDefaults.labelMinAngle = 30;

    // The font to be used for slice labels.
    seriesDefaults.labelFont = 'italic 20px Comic Sans MS';
    // The color to use for slice labels.
    seriesDefaults.labelColor = '#2222aa';

    seriesDefaults.strokeWidth = 4;

    seriesDefaults.calloutStrokeWidth = 10;
    seriesDefaults.calloutLength = 10;

    seriesDefaults.shadow = {
        color: 'grey',
        offset: [10,10],
        blur: 8
    };

    seriesDefaults.tooltipRenderer = function(params) {
        var angleField = params.angleField;
        var value = params.datum[angleField];
        return '<b>'+angleField.toUpperCase()+':</b> ' + value;
    };

    return options;
}

function onGridReady(params) {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold']
    };

    var chartRangeParams = {
        cellRange: cellRange,
        chartType: 'pie'
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