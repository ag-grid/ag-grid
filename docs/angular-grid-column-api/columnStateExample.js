
var module = angular.module("example", ["angularGrid"]);

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
        ready: function() {
            $scope.gridOptions.columnApi.addChangeListener( function(event) {
                console.log('Got column event: ' + event);
            });
        }
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
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
