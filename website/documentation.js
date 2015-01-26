
(function () {

    var module = angular.module("documentation", []);

    module.controller("documentationController", function($scope) {
        $scope.pages = [
            {name: "Getting Started", url: "./gettingStarted/index.html"},
            {name: "Loading Rows", url: "./loadingRows/index.html"},
            {name: "Width & Height", url: "./widthAndHeight/index.html"},
            {name: "Grid Options", url: "./gridOptions/index.html"},
            {name: "Sorting", url: "./sorting/index.html"},
            {name: "Filtering", url: "./filtering/index.html"},
            {name: "Resizing", url: "./resizing/index.html"},
            {name: "Pinning", url: "./todo.html"},
            {name: "Cell Formatting", url: "./todo.html"},
            {name: "Cell Rendering", url: "./todo.html"},
            {name: "Header Rendering", url: "./todo.html"},
            {name: "Angular Compiling", url: "./todo.html"},
            {name: "Styling", url: "./todo.html"},
            {name: "API", url: "./todo.html"}
        ];

        $scope.currentPage = $scope.pages[0];

        $scope.loadPage = function(page) {
            $scope.currentPage = page;
        };
    });

    module.directive("showExample", function() {
        return {
            controller: Controller,
            templateUrl: "showExample.html"
        }
    });

    function Controller($scope, $http, $attrs) {
        var example = $attrs["example"];
        $scope.source =  example + ".html";
        $http.get("./"+example+".html").
            success(function(data, status, headers, config) {
                $scope.html = data;
            }).
            error(function(data, status, headers, config) {
                $scope.html = data;
            });
        $http.get("./"+example+".js").
            success(function(data, status, headers, config) {
                $scope.javascript = data;
            }).
            error(function(data, status, headers, config) {
                $scope.javascript = data;
            });
    }



})();
