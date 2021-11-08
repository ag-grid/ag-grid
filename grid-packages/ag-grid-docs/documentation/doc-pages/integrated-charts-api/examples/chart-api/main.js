var gridOptions = {
    columnDefs: [
        { field: "country", width: 150, chartDataType: 'category' },
        { field: "gold", chartDataType: 'series', sort: 'desc' },
        { field: "silver", chartDataType: 'series', sort: 'desc' },
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
    rowData: createRowData(),
    enableRangeSelection: true,
    enableCharts: true,
    popupParent: document.body
};

function onChart1() {
    var params = {
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 4,
            columns: ['country', 'gold', 'silver']
        },
        chartType: 'groupedColumn',
        chartThemeName: 'ag-vivid',
        chartThemeOverrides: {
            common: {
                title: {
                    enabled: true,
                    text: 'Top 5 Medal Winners'
                }
            }
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
        chartThemeName: 'ag-pastel',
        chartThemeOverrides: {
            common: {
                title: {
                    enabled: true,
                    text: 'Bronze Medal by Country'
                },
                legend: {
                    enabled: false
                }
            }
        },
        unlinkChart: true,
    };

    gridOptions.api.createRangeChart(params);
}

function createRowData() {
    var countries = ["Ireland", "Spain", "United Kingdom", "France", "Germany", "Luxembourg", "Sweden",
        "Norway", "Italy", "Greece", "Iceland", "Portugal", "Malta", "Brazil", "Argentina",
        "Colombia", "Peru", "Belgium"];

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
