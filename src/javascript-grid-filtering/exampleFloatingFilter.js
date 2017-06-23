
var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150, filter: PersonFilter, suppressMenu:true},
    {headerName: "Age", field: "age", width: 90, filter: 'number', suppressMenu:true},
    {headerName: "Country", field: "country", width: 120, filter: 'set', suppressMenu:true},
    {headerName: "Year", field: "year", width: 90, filter: 'number', suppressMenu:true},
    {headerName: "Date", field: "date", width: 145, filter:'date', filterParams:{
        comparator:function (filterLocalDateAtMidnight, cellValue){
            var dateAsString = cellValue;
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
        }
    }, suppressMenu:true},
    {headerName: "Sport", field: "sport", width: 110, suppressMenu:true, filter:'text'},
    {headerName: "Gold", field: "gold", width: 100, filter: 'number', filterParams:{applyButton:true}, suppressMenu:true},
    {headerName: "Silver", field: "silver", width: 100, filter: 'number', floatingFilterComponentParams:{suppressFilterButton:true}},
    {headerName: "Bronze", field: "bronze", width: 100, filter: 'number', floatingFilterComponentParams:{suppressFilterButton:true}},
    {headerName: "Total", field: "total", width: 100, filter: 'number', suppressFilter: true}
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
    countryFilterComponent.onFilterChanged();
}

function clearCountryFilter() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    countryFilterComponent.selectEverything();
    countryFilterComponent.onFilterChanged();
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
    countryFilterComponent.onFilterChanged();
}

function setCountryModel() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    var model = ['Algeria','Argentina'];
    countryFilterComponent.setModel(model);
    countryFilterComponent.onFilterChanged();
}

function printCountryModel() {
    var countryFilterComponent = gridOptions.api.getFilterInstance('country');
    var model = countryFilterComponent.getModel();
    if (model) {
        console.log('Country model is: [' + model.join(',') + ']');
    } else {
        console.log('Country model filter is not active');
    }
}

function ageBelow25() {
    var ageFilterComponent = gridOptions.api.getFilterInstance('age');
    ageFilterComponent.setType('lessThan');
    ageFilterComponent.setFilter(25);
    ageFilterComponent.onFilterChanged();
}

function ageAbove30() {
    var ageFilterComponent = gridOptions.api.getFilterInstance('age');
    ageFilterComponent.setType('greaterThan');
    ageFilterComponent.setFilter(30);
    ageFilterComponent.onFilterChanged();
}

function ageBetween25And30() {
    var ageFilterComponent = gridOptions.api.getFilterInstance('age');
    ageFilterComponent.setType('inRange');
    ageFilterComponent.setFilter(25);
    ageFilterComponent.setFilterTo(30);
    ageFilterComponent.onFilterChanged();
}

function clearAgeFilter() {
    var ageFilterComponent = gridOptions.api.getFilterInstance('age');
    ageFilterComponent.setFilter(null);
    ageFilterComponent.setFilterTo(null);
    ageFilterComponent.setType('equals');
    ageFilterComponent.onFilterChanged();
}

function after2010(){
    var dateFilterComponent = gridOptions.api.getFilterInstance('date');
    dateFilterComponent.setFilterType('greaterThan');
    dateFilterComponent.setDateFrom('2010-01-01');
    dateFilterComponent.onFilterChanged();
}

function before2012(){
    var dateFilterComponent = gridOptions.api.getFilterInstance('date');
    dateFilterComponent.setFilterType('lessThan');
    dateFilterComponent.setDateFrom('2012-01-01');
    dateFilterComponent.onFilterChanged();
}

function clearDateFilter(){
    var dateFilterComponent = gridOptions.api.getFilterInstance('date');
    dateFilterComponent.setDateFrom(null);
    dateFilterComponent.onFilterChanged();
}

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

function WinningsFilter() {
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '../olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
