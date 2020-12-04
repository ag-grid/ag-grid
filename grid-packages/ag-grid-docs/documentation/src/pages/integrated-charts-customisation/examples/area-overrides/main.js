var gridOptions = {
    columnDefs: [
        { field: "country", width: 150, chartDataType: 'category' },
        { field: "gold", chartDataType: 'series' },
        { field: "silver", chartDataType: 'series' },
        { field: "bronze", chartDataType: 'series' },
        { headerName: "A", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series' },
        { headerName: "B", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series' },
        { headerName: "C", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series' },
        { headerName: "D", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series' }
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
        area: {
            series: {
                fillOpacity: 0.5,
                strokeOpacity: 0.5,
                strokeWidth: 2,
                highlightStyle: {
                    fill: 'red',
                    stroke: 'yellow',
                },
                marker: {
                    enabled: true,
                    shape: 'triangle',
                    size: 12,
                    strokeWidth: 4,
                },
                shadow: {
                    color: 'rgba(0, 0, 0, 0.3)',
                    offset: [5, 5],
                    blur: 8,
                },
                tooltip: {
                    renderer: function (params) {
                        return {
                            content: '<b>' + params.xName.toUpperCase() + ':</b> ' + params.xValue + '<br/>' +
                                '<b>' + params.yName.toUpperCase() + ':</b> ' + params.yValue
                        }
                    }
                },
            }
        }
    }
};

function onFirstDataRendered(params) {
    var cellRange = {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver', 'bronze']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'stackedArea'
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
