
var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150, filter: PersonFilter},
    {headerName: "Age", field: "age", width: 90, filter: 'number'},
    {headerName: "Country", field: "country", width: 120},
    {headerName: "Year", field: "year", width: 90, filter: YearFilter},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100, filter: 'number'},
    {headerName: "Silver", field: "silver", width: 100, filter: 'number'},
    {headerName: "Bronze", field: "bronze", width: 100, filter: 'number'},
    {headerName: "Total", field: "total", width: 100, filter: 'number'}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableFilter: true
};

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
        '<div style="padding: 4px; width: 200px;">' +
        '<div style="font-weight: bold;">Custom Athlete Filter</div>' +
        '<div><input style="margin: 4px 0px 4px 0px;" type="text" id="filterText" placeholder="Full name search..."/></div>' +
        '<div style="margin-top: 20px;">This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>' +
        '<div style="margin-top: 20px;">Just to iterate anything can go in here, here is an image!!</div>' +
        '<div><img src="../images/ag-Grid2-200.png" style="width: 150px; text-align: center; padding: 10px; margin: 10px; border: 1px solid lightgrey;"/></div>' +
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
    this.filterText.toLowerCase().split(" ").forEach(function(filterWord) {
        var value = valueGetter(params);
        if (value.toString().toLowerCase().indexOf(filterWord)<0) {
            passed = false;
        }
    });

    return passed;
};

PersonFilter.prototype.isFilterActive = function () {
    return this.filterText !== null && this.filterText !== undefined && this.filterText !== '';
};

PersonFilter.prototype.getApi = function() {
    var that = this;
    return {
        getModel: function() {
            var model = {value: that.filterText.value};
            return model;
        },
        setModel: function(model) {
            that.eFilterText.value = model.value;
        }
    }
};

function YearFilter() {
}

YearFilter.prototype.init = function (params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML =
        '<div style="display: inline-block; width: 400px;">' +
        '<div style="padding: 10px; background-color: #d3d3d3; text-align: center;">' +
        'This is a very wide filter' +
        '</div>'+
        '<label style="margin: 10px; padding: 50px; display: inline-block; background-color: #999999">'+
        '  <input type="radio" name="yearFilter" checked="true" id="rbAllYears" filter-checkbox="true"/> All'+
        '</label>'+
        '<label style="margin: 10px; padding: 50px; display: inline-block; background-color: #999999">'+
        '  <input type="radio" name="yearFilter" id="rbSince2010" filter-checkbox="true"/> Since 2010'+
        '</label>' +
        '</div>';
    this.rbAllYears = this.eGui.querySelector('#rbAllYears');
    this.rbSince2010 = this.eGui.querySelector('#rbSince2010');
    this.rbAllYears.addEventListener('change', this.onRbChanged.bind(this));
    this.rbSince2010.addEventListener('change', this.onRbChanged.bind(this));
    this.filterActive = false;
    this.filterChangedCallback = params.filterChangedCallback;
    this.valueGetter = params.valueGetter;
};

YearFilter.prototype.onRbChanged = function () {
    this.filterActive = this.rbSince2010.checked;
    this.filterChangedCallback();
};

YearFilter.prototype.getGui = function () {
    return this.eGui;
};

YearFilter.prototype.doesFilterPass = function (params) {
    return params.data.year >= 2010;
};

YearFilter.prototype.isFilterActive = function () {
    return this.filterActive;
};

YearFilter.prototype.getApi = function() {
    var that = this;
    return {
        getModel: function() {
            var model = {value: that.rbSince2010.checked};
            return model;
        },
        setModel: function(model) {
            that.rbSince2010.checked = model.value;
        }
    }
};


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

