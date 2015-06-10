
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 150, cellStyle: {color: 'darkred'}},
        {headerName: "Age", field: "age", width: 90, cellStyle: function(params) {
            if (params.value>=30) {
                return {'background-color': 'lightblue'};
            } else {
                return null;
            }
        }},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110},
        {headerName: "Gold", field: "gold", width: 100, cellRenderer: function(params) {
            var resultElement = document.createElement("span");
            for (var i = 0; i<params.value; i++) {
                var starImageElement = document.createElement("img");
                starImageElement.src = "http://www.angulargrid.com/images/goldStar.png";
                resultElement.appendChild(starImageElement);
            }
            return resultElement;
        }},
        {headerName: "Silver", field: "silver", width: 100},
        {headerName: "Bronze", field: "bronze", width: 100},
        {headerName: "Total", field: "total", width: 100}
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
