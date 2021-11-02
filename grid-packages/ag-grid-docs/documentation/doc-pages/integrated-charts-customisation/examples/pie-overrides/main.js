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
        pie: {
            series: {
                fillOpacity: 0.8,
                strokeOpacity: 0.8,
                strokeWidth: 2,
                title: {
                    enabled: true,
                    fontStyle: 'italic',
                    fontWeight: 'bold',
                    fontSize: 14,
                    fontFamily: 'Arial, sans-serif',
                    color: 'maroon',
                },
                highlightStyle: {
                    item: {
                        fill: 'red',
                        stroke: 'yellow'
                    }
                },
                shadow: {
                    color: 'rgba(96, 96, 175, 0.5)',
                    offset: [0, 0],
                    blur: 1,
                },
                label: {
                    enabled: true,
                    fontStyle: 'italic',
                    fontWeight: 'bold',
                    fontSize: 14,
                    fontFamily: 'Arial, sans-serif',
                    color: '#2222aa',
                    minAngle: 30,
                },
                callout: {
                    strokeWidth: 3,
                    colors: ['black', '#00ff00'],
                    length: 15,
                },
                tooltip: {
                    renderer: function (params) {
                        return {
                            content: '<b>' + params.angleName.toUpperCase() + ':</b> ' + params.angleValue + '<br>' +
                                '<b>' + params.labelName.toUpperCase() + ':</b> ' + params.datum[params.labelKey]
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
        columns: ['country', 'gold', 'silver']
    };

    var createRangeChartParams = {
        cellRange: cellRange,
        chartType: 'doughnut'
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
