var columnDefs = [
    // different ways to define 'categories'
    { field: "athlete", width: 150, chartDataType: 'category' },
    { field: "age", chartDataType: 'category', sort: 'asc' },
    { field: "sport" }, // inferred as category by grid

    // excludes year from charts
    { field: "year", chartDataType: 'excluded' },

    // different ways to define 'series'
    { field: "gold", chartDataType: 'series' },
    { field: "silver", chartDataType: 'series' },
    { field: "bronze" } // inferred as series by grid
];

var gridOptions = {
    defaultColDef: {
        width: 100,
        resizable: true
    },
    popupParent: document.body,
    columnDefs: columnDefs,
    enableRangeSelection: true,
    enableCharts: true,
    processChartOptions: function(params) {
        var opts = params.options;

        opts.title.enabled = true;
        opts.title.text = "Medals by Age";
        opts.legend.position = 'bottom';

        opts.seriesDefaults.tooltip.renderer = function(params) {
            var titleStyle = params.color ? ' style="color: white; background-color:' + params.color + '"' : '';
            var title = params.title ? '<div class="title"' + titleStyle + '>' + params.title + '</div>' : '';
            var value = params.datum[params.yKey].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

            return title + '<div class="content" style="text-align: center">' + value + '</div>';
        };

        if (opts.xAxis) {
            opts.xAxis.label.rotation = 0;
        }

        if (opts.yAxis) {
            opts.yAxis.label.rotation = 0;
        }

        return opts;
    },
    onFirstDataRendered: onFirstDataRendered,
};

function onFirstDataRendered(params) {
    var createRangeChartParams = {
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 79,
            columns: ['age', 'gold', 'silver', 'bronze']
        },
        chartType: 'groupedColumn',
        chartContainer: document.querySelector('#myChart'),
        aggFunc: 'sum'
    };

    params.api.createRangeChart(createRangeChartParams);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/wideSpreadOfSports.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
