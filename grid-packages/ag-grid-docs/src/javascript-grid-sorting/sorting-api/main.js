var columnDefs = [
    { field: "athlete" },
    { field: "age", width: 90 },
    { field: "country" },
    { field: "year", width: 90 },
    { field: "date" },
    { field: "sport" },
    { field: "gold" },
    { field: "silver" },
    { field: "bronze" },
    { field: "total" }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        sortable: true
    }
};

function sortByAthleteAsc() {
    gridOptions.columnApi.applyColumnState({
        state: [
            { colId: 'athlete', sort: 'asc' }
        ],
        defaultState: { sort: null }
    });
}

function sortByAthleteDesc() {
    gridOptions.columnApi.applyColumnState({
        state: [
            { colId: 'athlete', sort: 'desc' }
        ],
        defaultState: { sort: null }
    });
}

function sortByCountryThenSport() {
    gridOptions.columnApi.applyColumnState({
        state: [
            { colId: 'country', sort: 'asc', sortIndex: 0 },
            { colId: 'sport', sort: 'asc', sortIndex: 1 }
        ],
        defaultState: { sort: null }
    });
}

function sortBySportThenCountry() {
    gridOptions.columnApi.applyColumnState({
        state: [
            { colId: 'country', sort: 'asc', sortIndex: 1 },
            { colId: 'sport', sort: 'asc', sortIndex: 0 }
        ],
        defaultState: { sort: null }
    });
}

function clearSort() {
    gridOptions.columnApi.applyColumnState({
        defaultState: { sort: null }
    });
}

var savedSort;

function saveSort() {
    var colState = gridOptions.columnApi.getColumnState();
    var sortState = colState
        .filter( function(s) {
            return s.sort != null;
        })
        .map( function(s) {
            return {colId: s.colId, sort: s.sort, sortIndex: s.sortIndex}
        });
    savedSort = sortState;
    console.log('saved sort', sortState);
}

function restoreFromSave() {
    gridOptions.columnApi.applyColumnState({
        state: savedSort,
        defaultState: { sort: null }
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
