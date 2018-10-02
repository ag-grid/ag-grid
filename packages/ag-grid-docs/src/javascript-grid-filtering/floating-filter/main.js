function getPersonFilter() {
    function PersonFilter() {
    }

    PersonFilter.prototype.init = function (params) {
        this.valueGetter = params.valueGetter;
        this.filterText = null;
        this.setupGui(params);
    };

    // not called by ag-Grid, just for us to help setup
    PersonFilter.prototype.setupGui = function (params) {
        this.gui = document.createElement('div');
        this.gui.innerHTML =
            '<div style="padding: 4px;">' +
            '<div style="font-weight: bold;">Custom Athlete Filter</div>' +
            '<div><input style="margin: 4px 0px 4px 0px;" type="text" id="filterText" placeholder="Full name search..."/></div>' +
            '<div style="margin-top: 20px; width: 200px;">This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>' +
            '</div>';

        this.eFilterText = this.gui.querySelector('#filterText');
        this.eFilterText.addEventListener("changed", listener);
        this.eFilterText.addEventListener("paste", listener);
        this.eFilterText.addEventListener("input", listener);
        // IE doesn't fire changed for special keys (eg delete, backspace), so need to
        // listen for this further ones
        this.eFilterText.addEventListener("keydown", listener);
        this.eFilterText.addEventListener("keyup", listener);

        var that = this;

        function listener(event) {
            that.filterText = event.target.value;
            params.filterChangedCallback();
        }
    };

    PersonFilter.prototype.getGui = function () {
        return this.gui;
    };

    PersonFilter.prototype.doesFilterPass = function (params) {
        // make sure each word passes separately, ie search for firstname, lastname
        var passed = true;
        var valueGetter = this.valueGetter;
        this.filterText.toLowerCase().split(" ").forEach(function (filterWord) {
            var value = valueGetter(params);
            if (value.toString().toLowerCase().indexOf(filterWord) < 0) {
                passed = false;
            }
        });

        return passed;
    };

    PersonFilter.prototype.isFilterActive = function () {
        var isActive = this.filterText !== null && this.filterText !== undefined && this.filterText !== '';
        return isActive;
    };

    PersonFilter.prototype.getApi = function () {
        var that = this;
        return {
            getModel: function () {
                var model = {value: that.filterText.value};
                return model;
            },
            setModel: function (model) {
                that.eFilterText.value = model.value;
            }
        }
    };

    PersonFilter.prototype.getModelAsString = function (model){
        return model ? model : '';
    };

    PersonFilter.prototype.getModel = function () {
        return this.filterText;
    };
    // lazy, the example doesn't use setModel()
    PersonFilter.prototype.setModel = function () {};

    return PersonFilter;
}

var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150, filter: getPersonFilter(), suppressMenu:true},
    {headerName: "Age", field: "age", width: 90, filter: 'agNumberColumnFilter', suppressMenu:true},
    {headerName: "Country", field: "country", width: 120, filter: 'agSetColumnFilter', suppressMenu:true},
    {headerName: "Year", field: "year", width: 90, filter: 'agNumberColumnFilter', suppressMenu:true},
    {headerName: "Date", field: "date", width: 145, filter:'agDateColumnFilter', filterParams:{
        comparator:function (filterLocalDateAtMidnight, cellValue){
            var dateAsString = cellValue;
            if (dateAsString == null) return -1;
            var dateParts  = dateAsString.split("/");
            var cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));

            if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
                return 0
            }

            if (cellDate < filterLocalDateAtMidnight) {
                return -1;
            }

            if (cellDate > filterLocalDateAtMidnight) {
                return 1;
            }
        },
        browserDatePicker: true
    }, suppressMenu:true},
    {headerName: "Sport", field: "sport", width: 110, suppressMenu:true, filter: 'agTextColumnFilter'},
    {headerName: "Gold", field: "gold", width: 100, filter: 'agNumberColumnFilter', filterParams:{applyButton:true}, suppressMenu:true},
    {headerName: "Silver", field: "silver", width: 100, filter: 'agNumberColumnFilter', floatingFilterComponentParams:{suppressFilterButton:true}},
    {headerName: "Bronze", field: "bronze", width: 100, filter: 'agNumberColumnFilter', floatingFilterComponentParams:{suppressFilterButton:true}},
    {headerName: "Total", field: "total", width: 100, filter: 'agNumberColumnFilter', suppressFilter: true}
];

var gridOptions = {
    floatingFilter:true,
    columnDefs: columnDefs,
    rowData: null,
    enableFilter: true,
    enableSorting: true,
    // these hide enterprise features, so they are not confusing
    // you if using ag-Grid standard
    suppressMenu: true
};

function irelandAndUk() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    countryFilterComponent.selectNothing();
    countryFilterComponent.selectValue('Ireland');
    countryFilterComponent.selectValue('Great Britain');
    gridOptions.api.onFilterChanged();
}

function clearCountryFilter() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    countryFilterComponent.selectEverything();
    gridOptions.api.onFilterChanged();
}

function destroyCountryFilter() {
    gridOptions.api.destroyFilter('country');
}

function endingStan() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    countryFilterComponent.selectNothing();
    for (var i = 0; i<countryFilterComponent.getUniqueValueCount(); i++) {
        var value = countryFilterComponent.getUniqueValue(i);
        var valueEndsWithStan = value.indexOf('stan') === value.length - 4;
        if (valueEndsWithStan) {
            countryFilterComponent.selectValue(value);
        }
    }
    gridOptions.api.onFilterChanged();
}

function setCountryModel() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    var model = ['Algeria','Argentina'];
    countryFilterComponent.setModel(model);
    gridOptions.api.onFilterChanged();
}

function printCountryModel() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    var model = countryFilterComponent.getModel();
    if (model) {
        console.log('Country model is: [' + model.values.join(',') + ']');
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
        condition2:{
            type: 'endsWith',
            filter: 'g'
        },
        condition1: {
            type: 'startsWith',
            filter: 's'
        },
        operator: 'AND'
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
        condition1:{
            type: 'greaterThan',
            filter: 30,
            filterTo: null
        },
        operator: 'OR',
        condition2:{
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

function after2010(){
    var dateFilterComponent = gridOptions.api.getFilterInstance('date');
    dateFilterComponent.setModel({
        type: 'greaterThan',
        dateFrom: '2010-01-01',
        dateTo: null
    });
    gridOptions.api.onFilterChanged();
}

function before2012(){
    var dateFilterComponent = gridOptions.api.getFilterInstance('date');
    dateFilterComponent.setModel({
        type: 'lessThan',
        dateFrom: '2012-01-01',
        dateTo: null
    });
    gridOptions.api.onFilterChanged();
}

function dateCombined(){
    var dateFilterComponent = gridOptions.api.getFilterInstance('date');
    dateFilterComponent.setModel({
        condition1:{
            type: 'lessThan',
            dateFrom: '2012-01-01',
            dateTo: null
        },
        condition2:{
            type: 'greaterThan',
            dateFrom: '2010-01-01',
            dateTo: null
        },
        operator: 'OR'
    });
    gridOptions.api.onFilterChanged();
}

function clearDateFilter(){
    var dateFilterComponent = gridOptions.api.getFilterInstance('date');
    dateFilterComponent.setModel(null);
    gridOptions.api.onFilterChanged();
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
