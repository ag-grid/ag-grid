
(function () {

    var module = angular.module("documentation", []);

    module.directive("showExample", function() {
        return {
            scope: true,
            controller: ShowExampleController,
            templateUrl: "/showExample.html"
        }
    });

    function ShowExampleController($scope, $http, $attrs) {
        var example = $attrs["example"];
        $scope.source =  example + ".html";
        $scope.selectedTab = 'example';

        if ($attrs.exampleHeight) {
            $scope.iframeStyle = {height: $attrs.exampleHeight};
        } else {
            $scope.iframeStyle = {height: '500px'}
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

    module.directive("note", function() {
        return {
            templateUrl: "/note.html",
            transclude: true
        }
    });

})();
