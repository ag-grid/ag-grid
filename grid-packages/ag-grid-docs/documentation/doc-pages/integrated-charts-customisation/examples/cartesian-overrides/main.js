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
        width: 100,
        resizable: true
    },
    popupParent: document.body,
    columnDefs: columnDefs,
    rowData: createRowData(),
    enableRangeSelection: true,
    enableCharts: true,
    onFirstDataRendered: onFirstDataRendered,
    chartThemeOverrides: {
        cartesian: {
            axes: {
                number: {
                    line: {
                        width: 6,
                        color: 'black',
                    },
                    tick: {
                        width: 2,
                        size: 10,
                        color: 'gray',
                    },
                    label: {
                        fontStyle: 'italic',
                        fontWeight: 'bold',
                        fontSize: 15,
                        fontFamily: 'Arial, sans-serif',
                        color: '#de7b73',
                        padding: 10,
                        rotation: 20,
                        formatter: function(params) {
                            return params.value.toString().toUpperCase();
                        },
                    },
                    gridStyle: [
                        {
                            stroke: 'rgba(94,100,178,0.5)'
                        }
                    ],
                    title: {
                        enabled: true,
                        text: 'Tonnes',
                        fontStyle: 'italic',
                        fontWeight: 'bold',
                        fontSize: 16,
                        fontFamily: 'Arial, sans-serif',
                        color: 'blue',
                    },
                },
                category: {
                    line: {
                        width: 2,
                        color: 'blue',
                    },
                    tick: {
                        width: 2,
                        size: 10,
                        color: 'blue',
                    },
                    label: {
                        fontStyle: 'italic',
                        fontWeight: 'bold',
                        fontSize: 15,
                        fontFamily: 'Arial, sans-serif',
                        color: '#de7b73',
                        padding: 10,
                        rotation: -20,
                        formatter: function(params) {
                            var value = String(params.value);
                            return value === 'United Kingdom' ? 'UK' : '(' + value + ')';
                        }
                    },
                    gridStyle: [
                        {
                            stroke: '#80808044',
                            lineDash: undefined
                        },
                        {
                            stroke: '#80808044',
                            lineDash: [6, 3]
                        }
                    ],
                    title: {
                        fontStyle: 'italic',
                        fontWeight: 'bold',
                        fontSize: 16,
                        fontFamily: 'Arial, sans-serif',
                        color: 'blue',
                    },
                },
            },
            navigator: {
                enabled: true,
                height: 9,
                min: 0.2,
                max: 1,
                mask: {
                    fill: 'lime',
                    stroke: 'black',
                    strokeWidth: 2,
                    fillOpacity: 0.3,

                },
                minHandle: {
                    fill: 'yellow',
                    stroke: 'blue',
                    strokeWidth: 2,
                    width: 12,
                    height: 22,
                    gripLineGap: 4,
                    gripLineLength: 12,
                },
                maxHandle: {
                    fill: 'yellow',
                    stroke: 'blue',
                    strokeWidth: 2,
                    width: 12,
                    height: 22,
                    gripLineGap: 4,
                    gripLineLength: 12,
                }
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

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
