var columnDefs = [
    { field: "date", width: 150, chartDataType: 'category' },
    { field: "gold", chartDataType: 'series' },
    { field: "silver", chartDataType: 'series' },
    { field: "bronze", chartDataType: 'series' },
];

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function createRowData() {
    var date = new Date(2019, 0, 1);
    var endDate = new Date(2019, 3, 1);
    var data = [];

    while (date < endDate) {
        if (getRandomInt(10) < 7) {
            data.push({
                date: new Date(date),
                gold: getRandomInt(1000),
                silver: getRandomInt(5000),
                bronze: getRandomInt(10000),
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

    options.xAxis.type = 'time';
    options.xAxis.label.formatter = function(params) {
        return (params.value.value || params.value).getDate();
    }

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
