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

    // we are only interested in processing bar type.
    // so if user changes the type using the chart control,
    // we ignore it.
    if (['stackedBar', 'groupedBar', 'normalizedBar', 'stackedColumn', 'groupedColumn', 'normalizedColumn'].indexOf(params.type) < 0) {
        console.log('chart type is ' + params.type + ', making no changes.');
        return options;
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
    options.yAxis.title.text = 'Country';
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

    options.seriesDefaults.fill.colors = ['#e1ba00', 'silver', 'peru'];
    options.seriesDefaults.fill.opacity = 0.8;

    options.seriesDefaults.stroke.colors = ['black', '#ff0000'];
    options.seriesDefaults.stroke.opacity = 0.8;
    options.seriesDefaults.stroke.width = 2;

    options.seriesDefaults.shadow.enabled = true;
    options.seriesDefaults.shadow.color = 'rgba(0, 0, 0, 0.3)';
    options.seriesDefaults.shadow.xOffset = 10;
    options.seriesDefaults.shadow.yOffset = 5;
    options.seriesDefaults.shadow.blur = 8;

    options.seriesDefaults.label.enabled = true;
    options.seriesDefaults.label.fontStyle = 'italic';
    options.seriesDefaults.label.fontWeight = 'bold';
    options.seriesDefaults.label.fontSize = 15;
    options.seriesDefaults.label.fontFamily = 'Arial, sans-serif';
    options.seriesDefaults.label.color = 'green';
    options.seriesDefaults.label.formatter = function(params) {
        return '<' + params.value + '>';
    };

    options.seriesDefaults.highlightStyle.fill = 'red';
    options.seriesDefaults.highlightStyle.stroke = 'yellow';

    options.seriesDefaults.tooltip.renderer = function(params) {
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
        chartType: 'groupedBar'
    };

    params.api.createRangeChart(createRangeChartParams);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
