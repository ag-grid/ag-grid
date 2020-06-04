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
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
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

    options.width = 500;
    options.height = 400;

    options.padding.top = 20;
    options.padding.right = 30;
    options.padding.bottom = 10;
    options.padding.left = 2;

    options.background.fill = '#B0E0E6';

    options.title.enabled = true;
    options.title.text = 'Precious Metals Production';
    options.title.fontStyle = 'italic';
    options.title.fontWeight = '600';
    options.title.fontSize = 18;
    options.title.fontFamily = 'Impact, sans-serif';
    options.title.color = '#414182';

    options.subtitle.enabled = true;
    options.subtitle.text = 'by country';
    options.subtitle.fontSize = 14;
    options.subtitle.fontFamily = 'Monaco, monospace';
    options.subtitle.color = 'rgb(100, 100, 100)';

    options.legend.enabled = true;
    options.legend.position = 'bottom';
    options.legend.padding = 20;

    options.legend.item.label.fontStyle = 'italic';
    options.legend.item.label.fontWeight = 'bold';
    options.legend.item.label.fontSize = 18;
    options.legend.item.label.fontFamily = 'Palatino, serif';
    options.legend.item.label.color = '#555';

    options.legend.item.marker.type = 'diamond';
    options.legend.item.marker.size = 25;
    options.legend.item.marker.padding = 10;
    options.legend.item.marker.strokeWidth = 2;

    options.legend.item.paddingX = 120;
    options.legend.item.paddingY = 20;

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
