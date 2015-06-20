
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 200, cellRenderer: {
            renderer: 'group'
        }},
        {headerName: "Age", field: "age", width: 90, cellRenderer: ageRenderer},
        {headerName: "Gold", field: "gold", width: 100},
        {headerName: "Silver", field: "silver", width: 100},
        {headerName: "Bronze", field: "bronze", width: 100},
        {headerName: "Total", field: "total", width: 100},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        groupUseEntireRow: false,
        groupKeys: ['country','year'],
        groupAggFunction: groupAggFunction,
        groupSuppressAutoColumn: true,
        rowStyle: rowStyleFunc
    };

    function ageRenderer(params) {
        if (params.node.group) {
            return '(' + params.data.minAge + '..' + params.data.maxAge + ')';
        } else {
            return params.value;
        }
    }

    function rowStyleFunc(row, rowIndex, groupRow) {
        if (groupRow) {
            return {'font-weight': 'bold'};
        } else {
            return null;
        }
    }

    function groupAggFunction(nodes) {

        var sums = {
            gold: 0,
            silver: 0,
            bronze: 0,
            total: 0,
            minAge: 100,
            maxAge: 0,
        };

        nodes.forEach(function(node) {

            var data = node.data;
            if (node.group) {

                if (sums.minAge > data.minAge) {
                    sums.minAge = data.minAge;
                }
                if (sums.maxAge < data.maxAge) {
                    sums.maxAge = data.maxAge;
                }

            } else {

                if (sums.minAge > data.age) {
                    sums.minAge = data.age;
                }
                if (sums.maxAge < data.age) {
                    sums.maxAge = data.age;
                }

            }

            sums.gold += data.gold;
            sums.silver += data.silver;
            sums.bronze += data.bronze;
            sums.total += data.total;

        });

        return sums;
    }

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
        });
});
