
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 150, filter: PersonFilter},
        {headerName: "Age", field: "age", width: 90, filter: 'number'},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Year", field: "year", width: 90},
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
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
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

});
