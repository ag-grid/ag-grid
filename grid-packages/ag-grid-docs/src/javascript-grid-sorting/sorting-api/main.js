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
    var sort = [
        { colId: 'athlete', sort: 'asc' }
    ];
    gridOptions.api.setSortModel(sort);
}

function sortByAthleteDesc() {
    var sort = [
        { colId: 'athlete', sort: 'desc' }
    ];
    gridOptions.api.setSortModel(sort);
}

function sortByCountryThenSport() {
    var sort = [
        { colId: 'country', sort: 'asc' },
        { colId: 'sport', sort: 'asc' }
    ];
    gridOptions.api.setSortModel(sort);
}

function sortBySportThenCountry() {
    var sort = [
        { colId: 'sport', sort: 'asc' },
        { colId: 'country', sort: 'asc' }
    ];
    gridOptions.api.setSortModel(sort);
}

function printSortStateToConsole() {
    var sortState = gridOptions.api.getSortModel();
    if (sortState.length == 0) {
        console.log('No sort active');
    } else {
        console.log('State of sorting is:');
        for (var i = 0; i < sortState.length; i++) {
            var item = sortState[i];
            console.log(i + ' = {colId: ' + item.colId + ', sort: ' + item.sort + '}');
        }
    }
}

function clearSort() {
    // pass null or undefined or empty list
    gridOptions.api.setSortModel(null);
}

var savedSort;

function saveSort() {
    savedSort = gridOptions.api.getSortModel();
    console.log('Saved sort: ' + JSON.stringify(savedSort));
}

function restoreFromSave() {
    gridOptions.api.setSortModel(savedSort);
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
