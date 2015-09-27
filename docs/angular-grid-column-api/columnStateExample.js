
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 150},
        {headerName: "Age", field: "age", width: 90},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110},
        {headerName: "Gold", field: "gold", width: 100, hide: true},
        {headerName: "Silver", field: "silver", width: 100, hide: true},
        {headerName: "Bronze", field: "bronze", width: 100, hide: true},
        {headerName: "Total", field: "total", width: 100}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        enableSorting: true,
        enableColResize: true,
        showToolPanel: true,
        onReady: function() {
            $scope.gridOptions.api.addGlobalListener(function(type, event) {
                if (type.indexOf('column') >= 0) {
                    console.log('Got column event: ' + event);
                }
            });
        }
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.api.setRowData(res.data);
        });

    $scope.printState = function() {
        var state = $scope.gridOptions.columnApi.getState();
        console.log(state);
    };

    var savedState;

    $scope.saveState = function() {
        savedState = $scope.gridOptions.columnApi.getState();
        console.log('column state saved');
    };

    $scope.restoreState = function() {
        $scope.gridOptions.columnApi.setState(savedState);
        console.log('column state restored');
    };

    $scope.showAthlete = function(show) {
        $scope.gridOptions.columnApi.hideColumn('athlete', !show);
    };

    $scope.showMedals = function(show) {
        $scope.gridOptions.columnApi.hideColumns(['gold','silver','bronze'], !show);
    };
});
