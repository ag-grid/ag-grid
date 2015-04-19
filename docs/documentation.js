
(function () {

    var module = angular.module("documentation", []);

    module.directive("showExample", function() {
        return {
            scope: true,
            controller: Controller,
            templateUrl: "/showExample.html"
        }
    });

    function Controller($scope, $http, $attrs) {
        var example = $attrs["example"];
        $scope.source =  example + ".html";
        $scope.selectedTab = 'example';
        if ($attrs.exampleHeight) {
            $scope.exampleHeight = $attrs.exampleHeight;
        } else {
            $scope.exampleHeight = '500px';
        }
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
