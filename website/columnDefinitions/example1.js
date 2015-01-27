
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {displayName: "Make", field: "make", cellCss: {color: 'darkred'} },
        {displayName: "Model", field: "model", cellCssFunc: function(value, data, colDef, $childScope) {
            if (value.indexOf('C')>=0) {
                return {'background-color': 'lightblue'};
            } else {
                return null;
            }
        }},
        {displayName: "Price", field: "price", cellRenderer: function(value, data, colDef, $childScope) {
            var resultElement = document.createElement("span");
            var starCount = value / 20000;
            for (var i = 0; i<starCount; i++) {
                var starImageElement = document.createElement("img");
                starImageElement.src = "http://www.angulargrid.com/images/goldStar.png";
                resultElement.appendChild(starImageElement);
            }
            return resultElement;
        }}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: []
    };

    $http.get("../sampleData.json")
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
        });
});
