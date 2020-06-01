function getPersonFilter() {
    function PersonFilter() {
    }

    PersonFilter.prototype.init = function(params) {
        this.valueGetter = params.valueGetter;
        this.filterText = null;
        this.setupGui(params);
    };

    // not called by ag-Grid, just for us to help setup
    PersonFilter.prototype.setupGui = function(params) {
        this.gui = document.createElement('div');
        this.gui.innerHTML =
            '<div style="padding: 4px;">' +
            '<div style="font-weight: bold;">Custom Athlete Filter</div>' +
            '<div><input style="margin: 4px 0px 4px 0px;" type="text" id="filterText" placeholder="Full name search..."/></div>' +
            '<div style="margin-top: 20px; width: 200px;">This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>' +
            '</div>';

        this.eFilterText = this.gui.querySelector('#filterText');
        this.eFilterText.addEventListener('changed', listener);
        this.eFilterText.addEventListener('paste', listener);
        this.eFilterText.addEventListener('input', listener);
        // IE doesn't fire changed for special keys (eg delete, backspace), so need to
        // listen for this further ones
        this.eFilterText.addEventListener('keydown', listener);
        this.eFilterText.addEventListener('keyup', listener);

        var that = this;

        function listener(event) {
            that.filterText = event.target.value;
            params.filterChangedCallback();
        }
    };

    PersonFilter.prototype.getGui = function() {
        return this.gui;
    };

    PersonFilter.prototype.doesFilterPass = function(params) {
        // make sure each word passes separately, ie search for firstname, lastname
        var valueGetter = this.valueGetter;

        return this.filterText.toLowerCase().split(' ').every(function(filterWord) {
            return valueGetter(params).toString().toLowerCase().indexOf(filterWord) >= 0;
        });
    };

    PersonFilter.prototype.isFilterActive = function() {
        return this.filterText != null && this.filterText !== '';;
    };

    PersonFilter.prototype.getApi = function() {
        var that = this;
        return {
            getModel: function() {
                return { value: that.filterText.value };
            },
            setModel: function(model) {
                that.eFilterText.value = model.value;
            }
        };
    };

    PersonFilter.prototype.getModelAsString = function(model) {
        return model || '';
    };

    PersonFilter.prototype.getModel = function() {
        return this.filterText;
    };
    // lazy, the example doesn't use setModel()
    PersonFilter.prototype.setModel = function() {
    };

    return PersonFilter;
}

var columnDefs = [
    { field: 'athlete', filter: getPersonFilter(), suppressMenu: true },
    { field: 'age', filter: 'agNumberColumnFilter', suppressMenu: true },
    { field: 'country', filter: 'agSetColumnFilter', suppressMenu: true },
    { field: 'year', maxWidth: 120, filter: 'agNumberColumnFilter', floatingFilter: false, },
    {
        field: 'date',
        minWidth: 215,
        filter: 'agDateColumnFilter',
        filterParams: {
            comparator: function(filterLocalDateAtMidnight, cellValue) {
                var dateAsString = cellValue;
                if (dateAsString == null) return -1;
                var dateParts = dateAsString.split('/');
                var cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));

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
            browserDatePicker: true
        },
        suppressMenu: true
    },
    { field: 'sport', suppressMenu: true, filter: 'agTextColumnFilter' },
    {
        field: 'gold',
        filter: 'agNumberColumnFilter',
        filterParams: {
            applyButton: true
        },
        suppressMenu: true
    },
    {
        field: 'silver',
        filter: 'agNumberColumnFilter',
        floatingFilterComponentParams: {
            suppressFilterButton: true
        }
    },
    {
        field: 'bronze',
        filter: 'agNumberColumnFilter',
        floatingFilterComponentParams: {
            suppressFilterButton: true
        }
    },
    { field: 'total', filter: false }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
        sortable: true,
        floatingFilter: true,
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

function sportStartsWithS() {
    var sportsFilterComponent = gridOptions.api.getFilterInstance('sport');
    sportsFilterComponent.setModel({
        type: 'startsWith',
        filter: 's'
    });

    gridOptions.api.onFilterChanged();
}

function sportEndsWithG() {
    var sportsFilterComponent = gridOptions.api.getFilterInstance('sport');
    sportsFilterComponent.setModel({
        type: 'endsWith',
        filter: 'g'
    });

    gridOptions.api.onFilterChanged();
}

function sportsCombined() {
    var sportsFilterComponent = gridOptions.api.getFilterInstance('sport');
    sportsFilterComponent.setModel({
        condition2: {
            type: 'endsWith',
            filter: 'g'
        },
        operator: 'AND',
        condition1: {
            type: 'startsWith',
            filter: 's'
        },
    });

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
