var columnDefs = [
    {field: 'athlete', colId: 'athlete'},
    {field: 'age', colId: 'age'},
    {field: 'country', colId: 'country'},
    {field: 'year', colId: 'year'},
    {field: 'sport', colId: 'sport'}
];

var gridOptions = {
    defaultColDef: {
        width: 100
    },
    enableServerSideSorting: true,
    enableServerSideFilter: true,
    enableColResize: true,
    columnDefs: columnDefs,
    rowModelType: 'infinite'
};

function onBtShowYearColumn() {
    gridOptions.api.setColumnDefs([
        {field: 'athlete', colId: 'athlete'},
        {field: 'age', colId: 'age'},
        {field: 'country', colId: 'country'},
        {field: 'year', colId: 'year'},
        {field: 'sport', colId: 'sport'}
    ]);
}

function onBtHideYearColumn() {
    gridOptions.api.setColumnDefs([
        {field: 'athlete', colId: 'athlete'},
        {field: 'age', colId: 'age'},
        {field: 'country', colId: 'country'},
        {field: 'sport', colId: 'sport'}
    ]);
}

function onBtSortByYear() {
    gridOptions.api.setSortModel([{colId: 'year', sort: 'asc'},]);
}

function onBtFilterByYear() {
    gridOptions.api.setFilterModel({year: {filter: '2008'}});
}

function sortAndFilter(allOfTheData, sortModel, filterModel) {
    return sortData(sortModel, filterData(filterModel, allOfTheData));
}

function sortData(sortModel, data) {
    var sortPresent = sortModel && sortModel.length > 0;
    if (!sortPresent) {
        return data;
    }
    // do an in memory sort of the data, across all the fields
    var resultOfSort = data.slice();
    resultOfSort.sort(function(a, b) {
        for (var k = 0; k < sortModel.length; k++) {
            var sortColModel = sortModel[k];
            var valueA = a[sortColModel.colId];
            var valueB = b[sortColModel.colId];
            // this filter didn't find a difference, move onto the next one
            if (valueA == valueB) {
                continue;
            }
            var sortDirection = sortColModel.sort === 'asc' ? 1 : -1;
            if (valueA > valueB) {
                return sortDirection;
            } else {
                return sortDirection * -1;
            }
        }
        // no filters found a difference
        return 0;
    });
    return resultOfSort;
}

function filterData(filterModel, data) {
    var filterPresent = filterModel && Object.keys(filterModel).length > 0;
    if (!filterPresent) {
        return data;
    }

    var resultOfFilter = [];
    for (var i = 0; i < data.length; i++) {
        var item = data[i];

        var filterFails = false;

        var filterKeys = Object.keys(filterModel);
        filterKeys.forEach( function(filterKey) {
            var filterValue = filterModel[filterKey].filter;

            var valueForRow = item[filterKey];
            if (filterValue != valueForRow) {
                // year didn't match, so skip this record
                filterFails = true;
            }
        });

        // if (filterModel.year) {
        //     var val1 = filterModel.year.filter;
        //     var val2 = item.year;
        //     if (val1 != val2) {
        //         // year didn't match, so skip this record
        //         continue;
        //     }
        // }
        //

        if (!filterFails) {
            resultOfFilter.push(item);
        }

    }

    return resultOfFilter;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json'}).then(function(data) {
        // give each row an id
        data.forEach(function(data, index) {
            data.id = 'R' + (index + 1);
        });

        var dataSource = {
            rowCount: null, // behave as infinite scroll
            getRows: function(params) {
                console.log('asking for ' + params.startRow + ' to ' + params.endRow);
                // At this point in your code, you would call the server, using $http if in AngularJS 1.x.
                // To make the demo look real, wait for 500ms before returning
                setTimeout(function() {
                    // take a slice of the total rows
                    var dataAfterSortingAndFiltering = sortAndFilter(data, params.sortModel, params.filterModel);
                    var rowsThisPage = dataAfterSortingAndFiltering.slice(params.startRow, params.endRow);
                    // if on or after the last page, work out the last row.
                    var lastRow = -1;
                    if (dataAfterSortingAndFiltering.length <= params.endRow) {
                        lastRow = dataAfterSortingAndFiltering.length;
                    }
                    // call the success callback
                    params.successCallback(rowsThisPage, lastRow);
                }, 500);
            }
        };

        gridOptions.api.setDatasource(dataSource);
    });
});