
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {displayName: "Athlete", field: "athlete", group: 'Participant', width: 150, filter: 'text'},
        {displayName: "Age", field: "age", group: 'Participant', width: 90, filter: 'number'},
        {displayName: "Country", field: "country", group: 'Participant', width: 120},
        {displayName: "Year", field: "year", group: 'Competition', width: 90},
        {displayName: "Date", field: "date", group: 'Competition', width: 110},
        {displayName: "Sport", field: "sport", width: 110},
        {displayName: "Gold", field: "gold", group: 'Medals', width: 100, filter: 'number'},
        {displayName: "Silver", field: "silver", group: 'Medals', width: 100, filter: 'number'},
        {displayName: "Bronze", field: "bronze", group: 'Medals', width: 100, filter: 'number'},
        {displayName: "Total", field: "total", group: 'Medals', width: 100, filter: 'number'}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        groupHeaders: true,
        enableColResize: true
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
        });
});
