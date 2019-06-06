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
    if (params.type!=='pie') {
        console.log('chart type is ' + params.type + ', making no changes.');
        return params.options;
    }

    options.height = 500;
    options.width = 1000;

    options.title = {
        text: 'Gold Production',
        font: 'italic bold 18px Arial, sans-serif',
        color: '#414182'
    };
    options.subtitle = {
        text: 'by country',
        font: 'italic 14px Arial, sans-serif',
        color: 'rgb(100, 100, 100)'
    };

    options.padding = {top: 40, right: 10, bottom: 40, left: 20};

    options.tooltipClass = 'my-tool-tip-class';

    options.legendPosition = 'bottom';
    options.legendPadding = 20;

    var legend = options.legend;
    legend.markerStrokeWidth = 2;
    legend.markerSize = 10;
    legend.markerPadding = 10;
    legend.itemPaddingX = 100;
    legend.itemPaddingY = 5;
    legend.labelFont = '12px Arial, sans-serif';
    legend.labelColor = '#2222aa';

    var seriesDefaults = options.seriesDefaults;
    seriesDefaults.fills = ['#5e64b2', '#b594dc', '#fec444', '#f07372', '#35c2bd'];
    seriesDefaults.strokes = ['#42467d', '#7f689a', '#b28930', '#a85150', '#258884'];
    // seriesDefaults.tooltipEnabled = false;

    seriesDefaults.labelEnabled = true;
    seriesDefaults.labelMinAngle = 30;
    seriesDefaults.labelFont = '12px Arial, sans-serif';
    seriesDefaults.labelColor = '#2222aa';

    seriesDefaults.strokeWidth = 2;
    seriesDefaults.calloutStrokeWidth = 3;
    seriesDefaults.calloutColors = ['black'];
    seriesDefaults.calloutLength = 15;
    seriesDefaults.calloutPadding = 15;

    seriesDefaults.shadow = {
        color: 'rgba(96, 96, 175, 0.5)',
        offset: [0, 0],
        blur: 10
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
