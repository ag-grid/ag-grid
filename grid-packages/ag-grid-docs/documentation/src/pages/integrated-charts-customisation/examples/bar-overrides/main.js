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
        bar: {
            series: {
                fillOpacity: 0.8,
                strokeOpacity: 0.8,
                strokeWidth: 2,
                shadow: {
                    enabled: true,
                    color: 'rgba(0, 0, 0, 0.3)',
                    xOffset: 10,
                    yOffset: 5,
                    blur: 8,
                },
                label: {
                    enabled: true,
                    fontStyle: 'italic',
                    fontWeight: 'bold',
                    fontSize: 15,
                    fontFamily: 'Arial, sans-serif',
                    color: 'green',
                    formatter: function(params) {
                        return '<' + params.value + '>';
                    },
                },
                highlightStyle: {
                    fill: 'red',
                    stroke: 'yellow',
                },
                tooltip: {
                    renderer: function (params) {
                        return {
                            content: '<b>' + params.xName.toUpperCase() + ':</b> ' + params.xValue + '<br/>' +
                                '<b>' + params.yName.toUpperCase() + ':</b> ' + params.yValue
                        };
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
        chartType: 'groupedBar'
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
