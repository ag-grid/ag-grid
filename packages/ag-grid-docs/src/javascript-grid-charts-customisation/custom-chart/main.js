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
    var countries = ["Ireland", "Spain", "United Kingdom", "France", "Germany", "Luxembourg", "Sweden",
        "Norway", "Italy", "Greece", "Iceland", "Portugal", "Malta", "Brazil", "Argentina",
        "Colombia", "Peru", "Venezuela", "Uruguay", "Belgium"];
    
    return countries.map(function(country, index) {
        return {
            country: country,
            gold: Math.floor(((index+1 / 7) * 333)%100),
            silver: Math.floor(((index+1 / 3) * 555)%100),
            bronze: Math.floor(((index+1 / 7.3) * 777)%100),
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
    processChartOptions: processChartOptions,
};

function processChartOptions(params) {
    var options = params.options;

    switch (params.type) {
        case 'groupedBar':
        case 'stackedBar':
        case 'normalizedBar':
        case 'area':
        case 'stackedArea':
        case 'normalizedArea':
            options.legendPosition = 'bottom';
            break;
        case 'groupedColumn':
        case 'stackedColumn':
        case 'normalizedColumn':
        case 'doughnut':
            options.legendPosition = 'right';
            break;
        case 'pie':
            options.legendPosition = 'top';
            break;
        case 'line':
            options.legendPosition = 'left';
            break;
    }

    options.width = 600;
    options.height = 300;

    return options;
}

function chartGroupedBar() {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'groupedBar'
    };

    gridOptions.api.createRangeChart(createRangeChartParams);
}

function chartStackedBar() {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'stackedBar'
    };

    gridOptions.api.createRangeChart(createRangeChartParams);
}

function chartNormalizedBar() {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'normalizedBar'
    };

    gridOptions.api.createRangeChart(createRangeChartParams);
}

function chartGroupedColumn() {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'groupedColumn'
    };

    gridOptions.api.createRangeChart(createRangeChartParams);
}

function chartStackedColumn() {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'stackedColumn'
    };

    gridOptions.api.createRangeChart(createRangeChartParams);
}

function chartNormalizedColumn() {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'normalizedColumn'
    };

    gridOptions.api.createRangeChart(createRangeChartParams);
}

function chartArea() {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'area'
    };

    gridOptions.api.createRangeChart(createRangeChartParams);
}

function chartStackedArea() {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'stackedArea'
    };

    gridOptions.api.createRangeChart(createRangeChartParams);
}

function chartNormalizedArea() {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'normalizedArea'
    };

    gridOptions.api.createRangeChart(createRangeChartParams);
}

function chartDoughnut() {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'doughnut'
    };

    gridOptions.api.createRangeChart(createRangeChartParams);
}

function chartLine() {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'line'
    };

    gridOptions.api.createRangeChart(createRangeChartParams);
}

function chartScatter() {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'scatter'
    };

    gridOptions.api.createRangeChart(createRangeChartParams);
}

function chartPie() {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'pie'
    };

    gridOptions.api.createRangeChart(createRangeChartParams);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
