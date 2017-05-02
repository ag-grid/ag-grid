// var columnDefs = [
//     {headerName: "Line", field: "line", width: 50, cellRenderer: LineChartLineRenderer},
//     {headerName: "Bar", field: "bar", width: 50, cellRenderer: BarChartLineRenderer},
//     {headerName: "Line2", field: "line2", width: 50, cellRenderer: LineChartLineRenderer}
// ];

// for cell height & width
const CELL_DIMENSION_SIZE = 90;

let columnDefs = [
    {headerName: 'Symbol', field: 'Symbol', width: 235},
    {headerName: 'Date', field: 'Date'},
    {headerName: 'Open', field: 'Open'},
    {headerName: 'High', field: 'High'},
    {headerName: 'Low', field: 'Low'},
    {headerName: 'Close', field: 'Close'},
    {
        headerName: 'Close Trend',
        field: 'CloseTrends',
        width: 110,
        suppressResize: true,
        suppressSizeToFit: true,
        cellRenderer: LineChartLineRenderer
    },
    {
        headerName: 'Average Volume',
        field: 'AverageVolume',
        width: 130,
        suppressResize: true,
        suppressSizeToFit: true,
        cellRenderer: BarChartLineRenderer
    },
    {
        headerName: 'Expenditure',
        field: 'Expenditure',
        width: 130,
        suppressResize: true,
        suppressSizeToFit: true,
        cellRenderer: PieChartLineRenderer
    }
];

let gridOptions = {
    columnDefs: columnDefs,
    enableSorting: true,
    enableColResize: false,
    rowSelection: 'single',
    rowHeight: 95,
    onGridReady: function (params) {
        params.api.sizeColumnsToFit();
    },
    onModelUpdated: () => {
        let updatedNodes = [];
        gridOptions.api.forEachNode(function (node) {
            updatedNodes.push(node);
        });
        // now tell the grid it needs refresh all these column, and let jquery do its thing
        gridOptions.api.refreshCells(updatedNodes, ['CloseTrends', 'AverageVolume', 'Expenditure']);
    }
};


function LineChartLineRenderer() {
}

LineChartLineRenderer.prototype.init = function (params) {
    this.eGui = document.createElement('div');
    this.eGui.id = `${params.colDef.field}_${params.rowIndex}_line`;
};

LineChartLineRenderer.prototype.getGui = function () {
    return this.eGui;
};

LineChartLineRenderer.prototype.refresh = function (params) {
    // first sort by date, then retrieve the Close values
    let values = params.value
        .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
        .map((datum) => datum.Close);
    $(`#${this.eGui.id}`).sparkline(values, {height: CELL_DIMENSION_SIZE, width: CELL_DIMENSION_SIZE});
};


function BarChartLineRenderer() {
}

BarChartLineRenderer.prototype.init = function (params) {
    this.eGui = document.createElement('div');
    this.eGui.id = `${params.colDef.field}_${params.rowIndex}_bar`
};

BarChartLineRenderer.prototype.getGui = function () {
    return this.eGui;
};

BarChartLineRenderer.prototype.refresh = function (params) {
    // first sort by year, then extract values
    let values = params.value
        .sort((a, b) => a.Year - b.Year)
        .map((datum) => datum.AverageVolume.toFixed());
    $(`#${this.eGui.id}`).sparkline(values, {type: 'bar', barColor: 'green', barWidth: 11, height: CELL_DIMENSION_SIZE, width: CELL_DIMENSION_SIZE});
};

function PieChartLineRenderer() {
}

PieChartLineRenderer.prototype.init = function (params) {
    this.eGui = document.createElement('div');
    this.eGui.id = `${params.colDef.field}_${params.rowIndex}_pie`
};

PieChartLineRenderer.prototype.getGui = function () {
    return this.eGui;
};

PieChartLineRenderer.prototype.refresh = function (params) {
    let segments = ["R&D", "Marketing", "Infrastructure"];

    let values = segments.map((segment) => {
        return params.value[segment];
    });
    $(`#${this.eGui.id}`).sparkline(values, {type: 'pie', height: CELL_DIMENSION_SIZE, width: CELL_DIMENSION_SIZE});
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    let httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', './stocks/summaryExpanded.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            let httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };

});

