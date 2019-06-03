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
    processChartOptions: processChartOptions
};

function processChartOptions(params) {
    var options = params.options;

    switch (params.type) {
        case 'groupedBar':
            options.legendPosition = 'bottom';
            break;
        case 'stackedBar':
            options.legendPosition = 'bottom';
            break;
        case 'pie':
            options.legendPosition = 'top';
            break;
        case 'doughnut':
            options.legendPosition = 'right';
            break;
        case 'line':
            options.legendPosition = 'left';
            break;
    }

    return options;
}

function chartGroupedBar(params) {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var chartRangeParams = {
        cellRange: cellRange,
        chartType: 'groupedBar'
    };

    gridOptions.api.chartRange(chartRangeParams);
}

function chartStackedBar(params) {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var chartRangeParams = {
        cellRange: cellRange,
        chartType: 'stackedBar'
    };

    gridOptions.api.chartRange(chartRangeParams);
}

function chartDoughnut(params) {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var chartRangeParams = {
        cellRange: cellRange,
        chartType: 'doughnut'
    };

    gridOptions.api.chartRange(chartRangeParams);
}

function chartLine(params) {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var chartRangeParams = {
        cellRange: cellRange,
        chartType: 'line'
    };

    gridOptions.api.chartRange(chartRangeParams);
}

function chartPie(params) {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold']
    };

    var chartRangeParams = {
        cellRange: cellRange,
        chartType: 'pie'
    };

    gridOptions.api.chartRange(chartRangeParams);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
