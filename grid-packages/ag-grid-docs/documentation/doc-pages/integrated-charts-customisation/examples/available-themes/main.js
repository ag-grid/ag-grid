

var gridOptions = {
    columnDefs: [
        { field: 'country', width: 150 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ],
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true,
    },
    popupParent: document.body,
    enableRangeSelection: true,
    enableCharts: true,
    chartThemes: ['ag-pastel', 'ag-material-dark', 'ag-vivid-dark', 'ag-solar'],
    chartThemeOverrides: {
        cartesian: {
            axes: {
                category: {
                    label: {
                        rotation: 335
                    }
                }
            }
        }
    },
    rowData: createRowData(),
    onFirstDataRendered: onFirstDataRendered,
};

function createRowData() {
    var countries = [
        'Ireland', 'Spain', 'UK', 'France', 'Germany', 'Luxembourg', 'Sweden',
        'Norway', 'Italy', 'Greece', 'Iceland', 'Portugal', 'Malta', 'Brazil', 'Argentina',
        'Colombia', 'Peru', 'Venezuela', 'Uruguay', 'Belgium'
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

function onFirstDataRendered(params) {
    var createRangeChartParams = {
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 79,
            columns: ['country', 'gold', 'silver', 'bronze'],
        },
        chartType: 'groupedColumn',
        chartContainer: document.querySelector('#myChart'),
        aggFunc: 'sum',
    };

    params.api.createRangeChart(createRangeChartParams);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
