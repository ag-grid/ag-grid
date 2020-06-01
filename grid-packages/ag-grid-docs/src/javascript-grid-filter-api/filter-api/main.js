var columnDefs = [
    { field: 'athlete', filter: 'agSetColumnFilter' },
    { field: 'age', filter: 'agNumberColumnFilter', maxWidth: 100 },
    { field: 'country' },
    { field: 'year', maxWidth: 100 },
    {
        field: 'date',
        filter: 'agDateColumnFilter',
        filterParams: {
            comparator: function(filterLocalDateAtMidnight, cellValue) {
                var dateAsString = cellValue;
                if (dateAsString == null) return -1;
                var dateParts = dateAsString.split('/');
                var cellDate = new Date(
                    Number(dateParts[2]),
                    Number(dateParts[1]) - 1,
                    Number(dateParts[0])
                );

                if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
                    return 0;
                }

                if (cellDate < filterLocalDateAtMidnight) {
                    return -1;
                }

                if (cellDate > filterLocalDateAtMidnight) {
                    return 1;
                }
            },
            browserDatePicker: true,
        },
    },
    { field: 'sport', filter: 'agTextColumnFilter' },
    { field: 'gold', filter: 'agNumberColumnFilter' },
    { field: 'silver', filter: 'agNumberColumnFilter' },
    { field: 'bronze', filter: 'agNumberColumnFilter' },
    { field: 'total', filter: false },
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

function irelandAndUk() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    countryFilterComponent.setModel({ values: ['Ireland', 'Great Britain'] });
    gridOptions.api.onFilterChanged();
}

function clearCountryFilter() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    countryFilterComponent.setModel(null);
    gridOptions.api.onFilterChanged();
}

function destroyCountryFilter() {
    gridOptions.api.destroyFilter('country');
}

function endingStan() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    var countriesEndingWithStan = countryFilterComponent.getValues().filter(function(value) {
        return value.indexOf('stan') === value.length - 4;
    });

    countryFilterComponent.setModel({ values: countriesEndingWithStan });
    gridOptions.api.onFilterChanged();
}


function printCountryModel() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    var model = countryFilterComponent.getModel();

    if (model) {
        console.log('Country model is: ' + JSON.stringify(model));
    } else {
        console.log('Country model filter is not active');
    }
}

function sportStartsWithC() {
    var sportsFilterComponent = gridOptions.api.getFilterInstance('sport');
    sportsFilterComponent.setModel({
        type: 'startsWith',
        filter: 'c'
    });

    gridOptions.api.onFilterChanged();
}

function sportEndsWithS() {
    var sportsFilterComponent = gridOptions.api.getFilterInstance('sport');
    sportsFilterComponent.setModel({
        type: 'endsWith',
        filter: 's'
    });

    gridOptions.api.onFilterChanged();
}

function sportsCombined() {
    var sportsFilterComponent = gridOptions.api.getFilterInstance('sport');
    sportsFilterComponent.setModel({
        condition1: {
            type: 'startsWith',
            filter: 'c'
        },
        operator: 'AND',
        condition2: {
            type: 'endsWith',
            filter: 'g'
        },
    });

    gridOptions.api.onFilterChanged();
}

function clearSportFilter() {
    var sportsFilterComponent = gridOptions.api.getFilterInstance('sport');
    sportsFilterComponent.setModel(null);
    gridOptions.api.onFilterChanged();
}

function ageBelow25() {
    var ageFilterComponent = gridOptions.api.getFilterInstance('age');
    ageFilterComponent.setModel({
        type: 'lessThan',
        filter: 25,
        filterTo: null
    });

    gridOptions.api.onFilterChanged();
}

function ageAbove30() {
    var ageFilterComponent = gridOptions.api.getFilterInstance('age');
    ageFilterComponent.setModel({
        type: 'greaterThan',
        filter: 30,
        filterTo: null
    });

    gridOptions.api.onFilterChanged();
}

function ageBelow25OrAbove30() {
    var ageFilterComponent = gridOptions.api.getFilterInstance('age');
    ageFilterComponent.setModel({
        condition1: {
            type: 'greaterThan',
            filter: 30,
            filterTo: null
        },
        operator: 'OR',
        condition2: {
            type: 'lessThan',
            filter: 25,
            filterTo: null
        }
    });

    gridOptions.api.onFilterChanged();
}

function ageBetween25And30() {
    var ageFilterComponent = gridOptions.api.getFilterInstance('age');
    ageFilterComponent.setModel({
        type: 'inRange',
        filter: 25,
        filterTo: 30
    });

    gridOptions.api.onFilterChanged();
}

function clearAgeFilter() {
    var ageFilterComponent = gridOptions.api.getFilterInstance('age');
    ageFilterComponent.setModel(null);
    gridOptions.api.onFilterChanged();
}

function after2010() {
    var dateFilterComponent = gridOptions.api.getFilterInstance('date');
    dateFilterComponent.setModel({
        type: 'greaterThan',
        dateFrom: '2010-01-01',
        dateTo: null
    });

    gridOptions.api.onFilterChanged();
}

function before2012() {
    var dateFilterComponent = gridOptions.api.getFilterInstance('date');
    dateFilterComponent.setModel({
        type: 'lessThan',
        dateFrom: '2012-01-01',
        dateTo: null
    });

    gridOptions.api.onFilterChanged();
}

function dateCombined() {
    var dateFilterComponent = gridOptions.api.getFilterInstance('date');
    dateFilterComponent.setModel({
        condition1: {
            type: 'lessThan',
            dateFrom: '2012-01-01',
            dateTo: null
        },
        operator: 'OR',
        condition2: {
            type: 'greaterThan',
            dateFrom: '2010-01-01',
            dateTo: null
        },
    });

    gridOptions.api.onFilterChanged();
}

function clearDateFilter() {
    var dateFilterComponent = gridOptions.api.getFilterInstance('date');
    dateFilterComponent.setModel(null);
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
