
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 150},
        {headerName: "Age", field: "age", width: 90},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110},
        {headerName: "Gold", field: "gold", width: 100},
        {headerName: "Silver", field: "silver", width: 100},
        {headerName: "Bronze", field: "bronze", width: 100},
        {headerName: "Total", field: "total", width: 100}
    ];

    $scope.gridOptions = {
        // set rowData to null or undefined to show loading panel by default
        rowData: null,
        columnDefs: columnDefs,
        enableColResize: true,
        enableSorting: true,
        enableFilter: true,
        // custom loading template. the class ag-overlay-loading-center is part of the grid,
        // it gives a white background and rounded border
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>',
        overlayNoRowsTemplate: '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;">This is a custom \'no rows\' overlay</span>'
    };

    $scope.onBtShowLoading = function () {
        $scope.gridOptions.api.showLoadingOverlay();
    };

    $scope.onBtShowNoRows = function () {
        $scope.gridOptions.api.showNoRowsOverlay();
    };

    $scope.onBtHide = function () {
        $scope.gridOptions.api.hideOverlay();
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            // wait for a second before setting the results into the table
            setTimeout( function() {
                $scope.gridOptions.api.setRowData(res.data);
            }, 2000);
        });
});
