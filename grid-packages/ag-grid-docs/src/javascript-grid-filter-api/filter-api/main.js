var columnDefs = [
    { field: 'athlete', filter: 'agSetColumnFilter' },
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
        sortable: true,
    },
};

var savedMiniFilterText = '';

// inScope[getFilterInstance]
function getFilterInstance() {
    return gridOptions.api.getFilterInstance('athlete');
}

function getMiniFilterText() {
    console.log(this.getFilterInstance().getMiniFilter());
}

function saveMiniFilterText() {
    savedMiniFilterText = this.getFilterInstance().getMiniFilter();
}

function restoreMiniFilterText() {
    this.getFilterInstance().setMiniFilter(savedMiniFilterText);
}

function resetFilter() {
    this.getFilterInstance().setModel(null);
    gridOptions.api.onFilterChanged();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
