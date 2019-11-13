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

    options.width = 700;
    options.height = 400;

    options.padding = {
        top: 20,
        right: 30,
        bottom: 10,
        left: 20
    };

    options.background = {
        fill: '#B0E0E6',
        opacity: 0.7
    }

    options.title = {
        text: 'Precious Metals Production',
        fontStyle: 'italic',
        fontWeight: '600',
        fontSize: 18,
        fontFamily: 'Impact, sans-serif',
        color: '#414182'
    };

    options.subtitle = {
        text: 'by country',
        fontSize: 14,
        fontFamily: 'Monaco, monospace',
        color: 'rgb(100, 100, 100)'
    };

    var legend = options.legend;

    legend.enabled = true;
    legend.item.marker.strokeWidth = 2;
    legend.item.marker.size = 25;
    legend.item.marker.padding = 10;
    legend.item.paddingX = 120;
    legend.item.paddingY = 20;
    legend.item.label.fontStyle = 'italic';
    legend.item.label.fontWeight = 'bold';
    legend.item.label.fontSize = 18;
    legend.item.label.fontFamily = 'Palatino, serif';
    legend.item.label.color = '#555';
    legend.position = 'bottom';
    legend.padding = 20;

    options.tooltipClass = 'my-tooltip-class';

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
