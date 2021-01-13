var gridOptions = {
    columnDefs: [
        { field: "country", width: 150, chartDataType: 'category' },
        { field: "total", chartDataType: 'series' },
        { field: "gold", chartDataType: 'series' },
        { field: "silver", chartDataType: 'series' },
        { field: "bronze", chartDataType: 'series' },
    ],
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    },
    popupParent: document.body,
    rowData: createRowData(),
    enableRangeSelection: true,
    enableCharts: true,
    onFirstDataRendered: onFirstDataRendered,
    chartThemeOverrides: {
        scatter: {
            series: {
                fillOpacity: 0.7,
                strokeOpacity: 0.6,
                strokeWidth: 2,
                highlightStyle: {
                    fill: 'red',
                    stroke: 'yellow',
                },
                marker: {
                    enabled: true,
                    shape: 'square',
                    size: 5,
                    maxSize: 12,
                    strokeWidth: 4,
                },
                paired: true,
                tooltip: {
                    renderer: function (params) {
                        var label = params.datum[params.labelKey];
                        var size = params.datum[params.sizeKey];

                        return {
                            content: (label != null ? '<b>' + params.labelName.toUpperCase() + ':</b> ' + label + '<br/>' : '') +
                                '<b>' + params.xName.toUpperCase() + ':</b> ' + params.xValue + '<br/>' +
                                '<b>' + params.yName.toUpperCase() + ':</b> ' + params.yValue +
                                (size != null ? '<br/><b>' + params.sizeName.toUpperCase() + ':</b> ' + size : '')
                        };
                    }
                },
            },
        }
    }
};

function onFirstDataRendered(params) {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'total', 'gold', 'silver', 'bronze']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'scatter'
    };

    params.api.createRangeChart(createRangeChartParams);
}

function createRowData() {
    var countries = [
        "Ireland", "Spain", "United Kingdom", "France", "Germany", "Luxembourg", "Sweden",
        "Norway", "Italy", "Greece", "Iceland", "Portugal", "Malta", "Brazil", "Argentina",
        "Colombia", "Peru", "Venezuela", "Uruguay", "Belgium"
    ];

    return countries.map(function(country, index) {
        var datum = {
            country: country,
            gold: Math.floor(((index + 1 / 7) * 333) % 100),
            silver: Math.floor(((index + 1 / 3) * 555) % 100),
            bronze: Math.floor(((index + 1 / 7.3) * 777) % 100),
        };

        datum.total = datum.gold + datum.silver + datum.bronze;

        return datum;
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
