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
        "Ireland", "Spain", "UK", "France", "Germany", "Luxembourg", "Sweden",
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
    chartThemeOverrides: {
        common: {
            padding: {
                top: 20,
                right: 30,
                bottom: 10,
                left: 2,
            },
            background: {
                fill: '#e5e5e5'
            },
            title: {
                enabled: true,
                text: 'Precious Metals Production',
                fontStyle: 'italic',
                fontWeight: '600',
                fontSize: 18,
                fontFamily: 'Impact, sans-serif',
                color: '#414182',
            },
            subtitle: {
                enabled: true,
                text: 'by country',
                fontSize: 14,
                fontFamily: 'Monaco, monospace',
                color: 'rgb(100, 100, 100)',
            },
            legend: {
                enabled: true,
                position: 'left',
                padding: 20,
                item: {
                    label: {
                        fontStyle: 'italic',
                        fontWeight: 'bold',
                        fontSize: 18,
                        fontFamily: 'Palatino, serif',
                        color: '#555',
                    },
                    marker: {
                        type: 'diamond',
                        size: 10,
                        padding: 10,
                        strokeWidth: 2,
                    },
                    paddingX: 120,
                    paddingY: 20,
                }
            },
            tooltip: {
                class: 'my-tooltip-class'
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
