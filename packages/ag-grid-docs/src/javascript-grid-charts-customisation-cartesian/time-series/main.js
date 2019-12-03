var columnDefs = [
    { field: "date", width: 150, chartDataType: 'category' },
    { field: "gold", chartDataType: 'series' },
    { field: "silver", chartDataType: 'series' },
    { field: "bronze", chartDataType: 'series' },
];

function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * Math.floor(max - min));
}

function createRowData() {
    var date = new Date(2019, 0, 1);
    var endDate = new Date(2019, 1, 1);
    var data = [];

    while (date < endDate) {
        // deliberately leave out some data points to show how the time axis handles the gaps
        if (getRandomInt(0, 10) < 7) {
            data.push({
                date: new Date(date),
                gold: getRandomInt(0, 1000),
                silver: getRandomInt(1000, 2000),
                bronze: getRandomInt(2000, 3000),
            });
        }

        date.setDate(date.getDate() + 1);
    }

    return data;
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

    if (['line',].indexOf(params.type) < 0) {
        console.log('chart type is ' + params.type + ', making no changes.');
        return options;
    }

    options.xAxis.type = 'time';
    options.xAxis.label.format = '%d %B';

    return options;
}

function onFirstDataRendered(params) {
    var cellRange = {
        columns: ['date', 'gold', 'silver', 'bronze']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'line'
    };

    params.api.createRangeChart(createRangeChartParams);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
