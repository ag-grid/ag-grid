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

    options.seriesDefaults.title.enabled = true;
    options.seriesDefaults.title.text = 'Custom title';
    options.seriesDefaults.title.fontStyle = 'italic';
    options.seriesDefaults.title.fontWeight = 'bold';
    options.seriesDefaults.title.fontSize = 14;
    options.seriesDefaults.title.fontFamily = 'Arial, sans-serif';
    options.seriesDefaults.title.color = 'maroon';

    options.seriesDefaults.fill.colors = ['#5e64b2', '#b594dc', '#fec444', '#f07372', '#35c2bd'];
    options.seriesDefaults.fill.opacity = 0.8;

    options.seriesDefaults.stroke.colors = ['#42467d', '#7f689a', '#b28930', '#a85150', '#258884'];
    options.seriesDefaults.stroke.opacity = 0.8;
    options.seriesDefaults.stroke.width = 2;

    options.seriesDefaults.highlightStyle.fill = 'red';
    options.seriesDefaults.highlightStyle.stroke = 'yellow';

    options.seriesDefaults.shadow.color = 'rgba(96, 96, 175, 0.5)';
    options.seriesDefaults.shadow.offset = [0, 0];
    options.seriesDefaults.shadow.blur = 1;

    options.seriesDefaults.label.enabled = true;
    options.seriesDefaults.label.fontStyle = 'italic';
    options.seriesDefaults.label.fontWeight = 'bold';
    options.seriesDefaults.label.fontSize = 14;
    options.seriesDefaults.label.fontFamily = 'Arial, sans-serif';
    options.seriesDefaults.label.color = '#2222aa';
    options.seriesDefaults.label.minRequiredAngle = 30;

    options.seriesDefaults.callout.strokeWidth = 3;
    options.seriesDefaults.callout.colors = ['black', '#00ff00'];
    options.seriesDefaults.callout.length = 15;

    options.seriesDefaults.tooltip.renderer = function(params) {
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
