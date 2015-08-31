
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var classRules = {
        // .parent because we target the 2nd group of 2
        'background-odd': function(params) { return params.node.parent.childIndex % 2 === 0; },
        'background-even': function(params) { return params.node.parent.childIndex % 2 !== 0; },
        // we target the last row of the 2nd group
        'border': function(params) { return params.node.parent.lastChild && params.node.lastChild; }
    };

    var columnDefs = [
        {headerName: "Country", field: "country", width: 120, cellClassRules: classRules, cellStyle: function(params) {
            // color red for the first group
            if (params.node.parent.parent.firstChild) {
                return {color: "red"};
            }
        }},
        {headerName: "Sport", field: "sport", width: 110, cellClassRules: classRules, cellStyle: function(params) {
            // color blue for the first in the current sub group
            if (params.node.firstChild) {
                return {color: "blue"};
            }
        }},
        {headerName: "Athlete", field: "athlete", width: 150, cellClassRules: classRules},
        {headerName: "Age", field: "age", width: 90, cellClassRules: classRules},
        {headerName: "Year", field: "year", width: 90, cellClassRules: classRules},
        {headerName: "Date", field: "date", width: 110, cellClassRules: classRules},
        {headerName: "Gold", field: "gold", width: 100, cellClassRules: classRules},
        {headerName: "Silver", field: "silver", width: 100, cellClassRules: classRules},
        {headerName: "Bronze", field: "bronze", width: 100, cellClassRules: classRules},
        {headerName: "Total", field: "total", width: 100, cellClassRules: classRules}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        groupSuppressRow: true,
        enableSorting: true,
        groupKeys: ['country', 'sport']
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            res.data.reverse();
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.setSortModel([{field: 'country', sort: 'asc'}]);
            $scope.gridOptions.api.onNewRows();
        });
});
