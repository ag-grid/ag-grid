
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
            {name: "Pinning", url: "./pinning/index.html"},
            {name: "Grouping", url: "./grouping/index.html"},
            {name: "Editing", url: "./editing/index.html"},
            {name: "Column Definitions", url: "./columnDefinitions/index.html"},
            {name: "Selection", url: "./selection/index.html"},
            {name: "Header Rendering", url: "./headerRendering/index.html"},
            {name: "Angular Compiling", url: "./angularCompiling/index.html"},
            {name: "Styling", url: "./styling/index.html"},
            {name: "No Scrolling", url: "./todo.html"},
            {name: "API", url: "./todo.html"}
        ];

        $scope.currentPage = $scope.pages[0];
        $scope.flag = true;

        $scope.loadPage = function(page) {
            $scope.currentPage = page;
            $scope.flag = !$scope.flag;
            $scope.showLoading = true;
        };

        $scope.pageLoaded = function() {
            $scope.showLoading = false;
        }
    });

    module.directive("showExample", function() {
        return {
            scope: true,
            controller: Controller,
            templateUrl: "showExample.html"
        }
    });

    function Controller($scope, $http, $attrs) {
        var example = $attrs["example"];
        $scope.source =  example + ".html";
        $scope.selectedTab='example';
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
