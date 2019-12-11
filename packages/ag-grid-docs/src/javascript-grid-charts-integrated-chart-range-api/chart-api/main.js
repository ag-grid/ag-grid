var columnDefs = [
    { field: "country", width: 150, chartDataType: 'category' },
    { field: "gold", chartDataType: 'series', sort: 'desc' },
    { field: "silver", chartDataType: 'series', sort: 'desc' },
    { field: "bronze", chartDataType: 'series' },
    { headerName: "A", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series' },
    { headerName: "B", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series' },
    { headerName: "C", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series' },
    { headerName: "D", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series' }
];

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
            columns: ['country', 'gold', 'silver']
        },
        chartType: 'groupedColumn',
        chartPalette: 'bright',
        processChartOptions: function(params) {
            var opts = params.options;

            opts.title.enabled = true;
            opts.title.text = "Top 5 Medal Winners";

            if (opts.xAxis) {
                opts.xAxis.label.rotation = 30;
            }

            opts.seriesDefaults.tooltip.renderer = function(params) {
                var titleStyle = params.color ? ' style="color: white; background-color:' + params.color + '"' : '';
                var title = params.title ? '<div class="title"' + titleStyle + '>' + params.title + '</div>' : '';
                var value = params.datum[params.yKey].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

                return title + '<div class="content" style="text-align: center">' + value + '</div>';
            };

            return opts;
        }
    };

    gridOptions.api.createRangeChart(params);
}

function onChart2() {
    var params = {
        cellRange: {
            columns: ['country', 'bronze']
        },
        chartType: 'groupedBar',
        chartPalette: 'pastel',
        processChartOptions: function(params) {
            var opts = params.options;
            opts.seriesDefaults.showInLegend = false;

            opts.title.enabled = true;
            opts.title.text = "Bronze Medal by Country";

            opts.seriesDefaults.tooltip.renderer = function(params) {
                var titleStyle = params.color ? ' style="color: white; background-color:' + params.color + '"' : '';
                var title = params.title ? '<div class="title"' + titleStyle + '>' + params.title + '</div>' : '';
                var value = params.datum[params.yKey].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

                return title + '<div class="content" style="text-align: center">' + value + '</div>';
            };

            return opts;
        }
    };

    gridOptions.api.createRangeChart(params);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
