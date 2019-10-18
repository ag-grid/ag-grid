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

    // we are only interested in processing pie type.
    // so if user changes the type using the chart control,
    // we ignore it.
    if (['pie', 'doughnut'].indexOf(params.type) < 0) {
        console.log('chart type is ' + params.type + ', making no changes.');
        return params.options;
    }

    var seriesDefaults = options.seriesDefaults;
    seriesDefaults.fill.colors = ['#5e64b2', '#b594dc', '#fec444', '#f07372', '#35c2bd'];
    seriesDefaults.fill.opacity = 0.8;
    seriesDefaults.stroke.colors = ['#42467d', '#7f689a', '#b28930', '#a85150', '#258884'];
    seriesDefaults.stroke.opacity = 0.8;
    seriesDefaults.stroke.width = 2;
    seriesDefaults.highlightStyle = {
        fill: 'red',
        stroke: 'yellow'
    };

    seriesDefaults.title = {
        enabled: true,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        color: 'maroon'
    }

    seriesDefaults.label.enabled = true;
    seriesDefaults.label.minRequiredAngle = 30;
    seriesDefaults.label.fontStyle = 'italic';
    seriesDefaults.label.fontWeight = 'bold';
    seriesDefaults.label.fontSize = 14;
    seriesDefaults.label.fontFamily = 'Arial, sans-serif';
    seriesDefaults.label.color = '#2222aa';

    seriesDefaults.callout.strokeWidth = 3;
    seriesDefaults.callout.colors = ['black', '#00ff00'];
    seriesDefaults.callout.length = 15;

    seriesDefaults.shadow = {
        color: 'rgba(96, 96, 175, 0.5)',
        offset: [0, 0],
        blur: 10
    };

    seriesDefaults.tooltip.renderer = function(params) {
        var value = params.datum[params.angleKey];
        var label = params.datum[params.labelKey];
        return '<b>' + params.angleName.toUpperCase() + ':</b> ' + value + '<br><b>' + params.labelName.toUpperCase() + ':</b> ' + label;
    };

    return options;
}

function onFirstDataRendered(params) {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'doughnut'
    };

    params.api.createRangeChart(createRangeChartParams);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
