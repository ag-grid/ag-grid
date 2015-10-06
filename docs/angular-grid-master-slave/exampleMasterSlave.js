
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 200},
        {headerName: "Age", field: "age", width: 150},
        {headerName: "Country", field: "country", width: 150},
        {headerName: "Year", field: "year", width: 120},
        {headerName: "Date", field: "date", width: 150},
        {headerName: "Sport", field: "sport", width: 150},
        // in the total col, we have a value getter, which usually means we don't need to provide a field
        // however the master/slave depends on the column id (which is derived from the field if provided) in
        // order ot match up the columns
        {headerName: "Total", headerGroup: "Medals", headerGroupShow: 'closed', field: "total",
            valueGetter: "data.gold + data.silver + data.bronze", width: 200},
        {headerName: "Gold", headerGroup: "Medals", headerGroupShow: 'open', field: "gold", width: 100},
        {headerName: "Silver", headerGroup: "Medals", headerGroupShow: 'open', field: "silver", width: 100},
        {headerName: "Bronze", headerGroup: "Medals", headerGroupShow: 'open', field: "bronze", width: 100}
    ];

    // this is the grid options for the top grid
    var gridOptionsTop = {
        columnDefs: columnDefs,
        groupHeaders: true,
        rowData: null,
        enableColResize: true,
        debug: true,
        slaveGrids: []
    };

    // this is the grid options for the bottom grid
    var gridOptionsBottom = {
        columnDefs: columnDefs,
        groupHeaders: true,
        rowData: null,
        enableColResize: true,
        debug: true,
        slaveGrids: []
    };

    $scope.gridOptionsTop = gridOptionsTop;
    $scope.gridOptionsBottom = gridOptionsBottom;

    gridOptionsTop.slaveGrids.push(gridOptionsBottom);
    gridOptionsBottom.slaveGrids.push(gridOptionsTop);

    $scope.cbAthlete = true;
    $scope.cbAge = true;
    $scope.cbCountry = true;

    $http.get("../olympicWinners.json")
        .then(function(res){
            gridOptionsTop.api.setRowData(res.data);
            gridOptionsBottom.api.setRowData(res.data);
        });

    $scope.onCbAthlete = function() {
        // we only need to update one grid, as the other is a slave
        gridOptionsTop.columnApi.hideColumn('athlete', !$scope.cbAthlete);
    };

    $scope.onCbAge = function() {
        // we only need to update one grid, as the other is a slave
        gridOptionsTop.columnApi.hideColumn('age', !$scope.cbAge);
    };

    $scope.onCbCountry = function() {
        // we only need to update one grid, as the other is a slave
        gridOptionsTop.columnApi.hideColumn('country', !$scope.cbCountry);
    };
});
