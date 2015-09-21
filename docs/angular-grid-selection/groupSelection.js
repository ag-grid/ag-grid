
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Gold", field: "gold", width: 100},
        {headerName: "Silver", field: "silver", width: 100},
        {headerName: "Bronze", field: "bronze", width: 100},
        {headerName: "Total", field: "total", width: 100},
        {headerName: "Age", field: "age", width: 90, checkboxSelection: true},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        rowSelection: 'multiple',
        groupKeys: ['country','sport'],
        groupAggFunction: groupAggFunction,
        groupSelectsChildren: true,
        suppressRowClickSelection: true,
        groupColumnDef: {headerName: "Athlete", field: "athlete", width: 200,
            cellRenderer: {
                renderer: "group",
                checkbox: true
            }}
    };

    function groupAggFunction(rows) {

        var sums = {
            gold: 0,
            silver: 0,
            bronze: 0,
            total: 0
        };

        rows.forEach(function(row) {

            var data = row.data;

            sums.gold += data.gold;
            sums.silver += data.silver;
            sums.bronze += data.bronze;
            sums.total += data.total;

        });

        return sums;
    }

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.api.setRowData(res.data);
        });
});
