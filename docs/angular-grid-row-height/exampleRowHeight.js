
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Height", field: "rowHeight"},
        {headerName: "Athlete", field: "athlete", width: 180},
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
        columnDefs: columnDefs,
        rowData: null,
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        // call back function, to tell the grid what height
        // each row should be
        getRowHeight: function(params) {
            return params.data.rowHeight;
        }
    };

    $http.get("../olympicWinners.json")
        .then(function(res){

            // before setting the data into the grid, we make up
            // some row heights and tell the grid what height to
            // put each row.
            var differentHeights = [25,50,100,200];
            res.data.forEach( function(dataItem, index) {
                dataItem.rowHeight = differentHeights[index % 4];
            });

            // now set the height into the grid
            $scope.gridOptions.api.setRowData(res.data);
        });
});
