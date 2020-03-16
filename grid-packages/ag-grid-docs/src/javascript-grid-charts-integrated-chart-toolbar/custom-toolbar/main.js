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

var gridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    },
    columnDefs: columnDefs,
    rowData: createRowData(),
    popupParent: document.body,
    enableCharts: true,
    enableRangeSelection: true,
    onFirstDataRendered: onFirstDataRendered,
    processChartOptions: processChartOptions,
    getChartToolbarItems: getChartToolbarItems
};

function getChartToolbarItems() {
    return ['chartDownload', 'chartData', 'chartSettings'];
}

function onFirstDataRendered(params) {
    var createRangeChartParams = {
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 4,
            columns: ['country', 'gold']
        },
        chartType: 'pie'
    };

    params.api.createRangeChart(createRangeChartParams);
}

function processChartOptions(params) {
    var options = params.options;

    if (params.type === 'pie') {
        options.title = {
            enabled: true,
            text: 'Precious Metals Production',
            fontFamily: 'Verdana, sans-serif',
            fontWeight: 'bold',
            fontSize: 20,
            color: 'rgb(100, 100, 100)'
        };

        options.subtitle = {
            enabled: true,
            text: 'by country',
            fontFamily: 'Verdana, sans-serif',
            fontStyle: 'italic',
            fontWeight: 'bold',
            fontSize: 14,
            color: 'rgb(100, 100, 100)'
        };

        options.padding = { top: 25, right: 20, bottom: 55, left: 20 };

        options.legend.enabled = false;
        options.seriesDefaults.label.enabled = true;
        options.seriesDefaults.callout.length = 20;
    }

    return options;
}

function createRowData() {
    var countries = ["Ireland", "Spain", "United Kingdom", "France", "Germany", "Luxembourg", "Sweden",
        "Norway", "Italy", "Greece", "Iceland", "Portugal", "Malta", "Brazil", "Argentina",
        "Colombia", "Peru", "Venezuela", "Uruguay", "Belgium"];

    return countries.map(function(country, index) {
        return {
            country: country,
            gold: Math.floor(((index + 1 / 7) * 333) % 100),
            silver: Math.floor(((index + 1 / 3) * 555) % 100),
            bronze: Math.floor(((index + 1 / 7.3) * 777) % 100),
        };
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
