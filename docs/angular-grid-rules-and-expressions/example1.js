
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {displayName: "Athlete", field: "athlete", width: 150},
        {displayName: "Age", field: "age", width: 90,
            cellClassRules: {
                'rag-green': 'x < 20',
                'rag-amber': 'x >= 20 && x < 25',
                'rag-red': 'x >= 25'
            }
        },
        {displayName: "Country", field: "country", width: 120},
        {displayName: "Year", field: "year", width: 90,
            cellClassRules: {
                'rag-green-outer': function(params) { return params.value === 2008},
                'rag-amber-outer': function(params) { return params.value === 2004},
                'rag-red-outer': function(params) { return params.value === 2000}
            },
            cellRenderer: function(params) {
                return '<span class="rag-element">'+params.value+'</span>';
            }
        },
        {displayName: "Date", field: "date", width: 110},
        {displayName: "Sport", field: "sport", width: 110},
        {displayName: "Gold", field: "gold", width: 100},
        {displayName: "Silver", field: "silver", width: 100},
        {displayName: "Bronze", field: "bronze", width: 100},
        {displayName: "Total", field: "total", width: 100}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
        });
});
