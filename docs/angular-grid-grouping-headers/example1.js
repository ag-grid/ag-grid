
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", group: 'Participant', width: 150, filter: 'text'},
        {headerName: "Age", field: "age", group: 'Participant', width: 90, filter: 'number'},
        {headerName: "Country", field: "country", group: 'Participant', width: 120},
        {headerName: "Sport", field: "sport", width: 110},
        {headerName: "Total", groupShow: 'closed', field: "total", group: 'Medals', width: 100, filter: 'number'},
        {headerName: "Gold", groupShow: 'open', field: "gold", group: 'Medals', width: 100, filter: 'number'},
        {headerName: "Silver", groupShow: 'open', field: "silver", group: 'Medals', width: 100, filter: 'number'},
        {headerName: "Bronze", groupShow: 'open', field: "bronze", group: 'Medals', width: 100, filter: 'number'},
        {headerName: "Year", field: "year", group: 'Competition', width: 90},
        {headerName: "Date", field: "date", group: 'Competition', width: 110}
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
