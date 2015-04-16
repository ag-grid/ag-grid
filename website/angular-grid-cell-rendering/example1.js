
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {displayName: "Athlete", field: "athlete", width: 150, cellStyle: {color: 'darkred'}},
        {displayName: "Age", field: "age", width: 90, cellStyle: function(params) {
            if (params.value>=30) {
                return {'background-color': 'lightblue'};
            } else {
                return null;
            }
        }},
        {displayName: "Country", field: "country", width: 120},
        {displayName: "Year", field: "year", width: 90},
        {displayName: "Date", field: "date", width: 110},
        {displayName: "Sport", field: "sport", width: 110},
        {displayName: "Gold", field: "gold", width: 100, cellRenderer: function(params) {
            var resultElement = document.createElement("span");
            for (var i = 0; i<params.value; i++) {
                var starImageElement = document.createElement("img");
                starImageElement.src = "http://www.angulargrid.com/images/goldStar.png";
                resultElement.appendChild(starImageElement);
            }
            return resultElement;
        }},
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
