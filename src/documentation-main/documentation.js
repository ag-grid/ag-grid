(function () {

    var module = angular.module("documentation", []);

    /*
     * Show Example directive
     */
    module.directive("showExample", function() {
        return {
            scope: true,
            controller: ShowExampleController,
            templateUrl: "/showExample.html"
        }
    });

    function ShowExampleController($scope, $http, $attrs) {
        var example = $attrs["example"];
        $scope.source =  example.indexOf("?") === -1 ? (example + ".html") : example;
        $scope.selectedTab = 'example';
        $scope.jsfile = $attrs['jsfile'] ? $attrs['jsfile'] : example;
        $scope.exeExtension = $scope.jsfile.endsWith(".ts") ? "" : ".js";
        $scope.sourceLang = $scope.jsfile.endsWith(".ts") ? "TypeScript" : "Javascript";
        $scope.htmlFile = $attrs['html'] ? $attrs['html'] : "./"+example+".html";

        if ($attrs.extraPages) {
            $scope.extraPages = $attrs.extraPages.split(',');
            $scope.extraPageContent = {};
            $scope.extraPages.forEach( function(page) {
                $http.get("./"+page).
                    success(function(data, status, headers, config) {
                        $scope.extraPageContent[page] = data;
                    }).
                    error(function(data, status, headers, config) {
                        $scope.extraPageContent[page] = data;
                    });
            });
        }

        if ($attrs.exampleHeight) {
            $scope.iframeStyle = {height: $attrs.exampleHeight};
        } else {
            $scope.iframeStyle = {height: '500px'}
        }

        $http.get($scope.htmlFile).
            success(function(data, status, headers, config) {
                $scope.html = data;
            }).
            error(function(data, status, headers, config) {
                $scope.html = data;
            });
        $http.get("./"+$scope.jsfile+$scope.exeExtension).
            success(function(data, status, headers, config) {
                $scope.javascript = data;
            }).
            error(function(data, status, headers, config) {
                $scope.javascript = data;
            });

        $scope.isActive = function(item) {
            return $scope.selectedTab == item;
        };
        $scope.setActive = function(item) {
            $scope.selectedTab = item;
        };
    }

    /*
     * Note directive
     */
    module.directive("note", function() {
        return {
            templateUrl: "/note.html",
            transclude: true
        }
    });

    /*
     * theme tab directive
     */
    module.directive("themeTab", function() {
        return {
            scope: true,
            controller: ThemeTabController,
            templateUrl: "/themeTab.html"
        }
    });

    function ThemeTabController($scope, $http, $attrs) {
        $scope.selectedTab = $attrs["theme"];
        $scope.themes = JSON.parse($attrs["themes"]);

        if ($attrs.frameheight) {
            $scope.iframeStyle = {height: $attrs.frameheight};
        } else {
            $scope.iframeStyle = {height: '500px'}
        }

        $scope.isActive = function(item) {
            return $scope.selectedTab == item;
        };
        $scope.setActive = function(item) {
            $scope.selectedTab = item;
        };

        $scope.setTheme = function (theme) {
            $scope.selectedTab = theme
        };

        $scope.isSelected = function (theme) {
            return $scope.selectedTab == theme
        };
    }

})();
