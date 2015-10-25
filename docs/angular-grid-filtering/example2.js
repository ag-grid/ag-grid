
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

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

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        enableFilter: true,
        angularCompileFilters: true
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.api.setRowData(res.data);
        });


    function PersonFilter() {
    }

    PersonFilter.prototype.init = function (params) {
        this.$scope = params.$scope;
        this.$scope.onFilterChanged = function() {
            params.filterChangedCallback();
        };
        this.valueGetter = params.valueGetter;
    };

    PersonFilter.prototype.getGui = function () {
        return '<div style="padding: 4px; width: 200px;">' +
            '<div style="font-weight: bold;">Custom Athlete Filter</div>' +
            '<div><input style="margin: 4px 0px 4px 0px;" type="text" ng-model="filterText" ng-change="onFilterChanged()" placeholder="Full name search..."/></div>' +
            '<div style="margin-top: 20px;">This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>' +
            '<div style="margin-top: 20px;">Just to iterate anything can go in here, here is an image!!</div>' +
            '<div><img src="../angularjs.png" style="width: 150px; text-align: center"/></div>' +
            '</div>';
    };

    PersonFilter.prototype.doesFilterPass = function (params) {
        var filterText = this.$scope.filterText;
        if (!filterText) {
            return true;
        }
        // make sure each word passes separately, ie search for firstname, lastname
        var passed = true;
        var valueGetter = this.valueGetter;
        filterText.toLowerCase().split(" ").forEach(function(filterWord) {
            var value = valueGetter(params);
            if (value.toString().toLowerCase().indexOf(filterWord)<0) {
                passed = false;
            }
        });

        return passed;
    };

    PersonFilter.prototype.isFilterActive = function () {
        var value = this.$scope.filterText;
        return value !== null && value !== undefined && value !== '';
    };

    PersonFilter.prototype.getApi = function() {
        var that = this;
        return {
            getModel: function() {
                var model = {value: that.$scope.filterText.value};
                return model;
            },
            setModel: function(model) {
                that.$scope.filterText = model.value;
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
});
