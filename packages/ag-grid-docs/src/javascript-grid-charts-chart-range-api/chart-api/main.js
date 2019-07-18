var columnDefs = [
    {field: "country", width: 150, chartDataType: 'category'},
    {field: "gold", chartDataType: 'series', sort: 'desc'},
    {field: "silver", chartDataType: 'series', sort: 'desc'},
    {field: "bronze", chartDataType: 'series'},
    {headerName: "A", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series'},
    {headerName: "B", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series'},
    {headerName: "C", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series'},
    {headerName: "D", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series'}
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
    columnDefs: columnDefs,
    rowData: createRowData(),
    enableRangeSelection: true,
    enableCharts: true
};

function onChart1() {
    var params = {
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 4,
            columns: ['country','gold','silver']
        },
        chartType: 'groupedColumn',
        processChartOptions: function (params) {
            let opts = params.options;

            opts.title = {text: "Top 5 Medal Winners"};
            opts.xAxis.labelRotation = 30;

            opts.seriesDefaults.tooltipRenderer = function (params) {
                let titleStyle = params.color ? ' style="color: white; background-color:' + params.color + '"' : '';
                let title = params.title ? '<div class="title"' + titleStyle + '>' + params.title + '</div>' : '';
                let value = params.datum[params.yField].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
                return title + '<div class="content" style="text-align: center">' + value + '</div>';
            };

            return opts;
        }
    };
    gridOptions.api.chartRange(params);
}

function onChart2() {
    var params = {
        cellRange: {
            columns: ['country','bronze']
        },
        chartType: 'groupedBar',
        processChartOptions: function (params) {
            let opts = params.options;
            opts.seriesDefaults.showInLegend = false;

            opts.title = {text: "Bronze Medal by Country"};

            opts.seriesDefaults.tooltipRenderer = function (params) {
                let titleStyle = params.color ? ' style="color: white; background-color:' + params.color + '"' : '';
                let title = params.title ? '<div class="title"' + titleStyle + '>' + params.title + '</div>' : '';
                let value = params.datum[params.yField].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
                return title + '<div class="content" style="text-align: center">' + value + '</div>';
            };

            return opts;
        }
    };
    gridOptions.api.chartRange(params);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
