var columnDefs = [
    { field: "country", width: 150, chartDataType: 'category' },
    { field: "gold", chartDataType: 'series' },
    { field: "silver", chartDataType: 'series' },
    { field: "bronze", chartDataType: 'series' },
    { headerName: "A", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series' },
    { headerName: "B", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series' },
    { headerName: "C", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series' },
    { headerName: "D", valueGetter: 'Math.floor(Math.random()*1000)', chartDataType: 'series' }
];

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

var gridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    },
    popupParent: document.body,
    columnDefs: columnDefs,
    rowData: createRowData(),
    enableRangeSelection: true,
    enableCharts: true,
    onFirstDataRendered: onFirstDataRendered,
    customChartThemes: {
        myCustomTheme: {
            defaults: {
                pie: {
                    series: {
                        fillOpacity: 0.8,
                        strokeOpacity: 0.8,
                        strokeWidth: 2,
                        title: {
                            enabled: true,
                            text: 'Custom title',
                            fontStyle: 'italic',
                            fontWeight: 'bold',
                            fontSize: 14,
                            fontFamily: 'Arial, sans-serif',
                            color: 'maroon',
                        },
                        highlightStyle: {
                            fill: 'red',
                            stroke: 'yellow',
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
                            minRequiredAngle: 30,
                        },
                        callout: {
                            strokeWidth: 3,
                            colors: ['black', '#00ff00'],
                            length: 15,
                        },
                        tooltipRenderer: function(params) {
                            var value = params.datum[params.angleKey];
                            var label = params.datum[params.labelKey];
                            return '<b>' + params.angleName.toUpperCase() + ':</b> ' + value + '<br><b>' + params.labelName.toUpperCase() + ':</b> ' + label;
                        },
                    }
                }
            }
        }
    },
    chartThemes: ['myCustomTheme'],
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

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
