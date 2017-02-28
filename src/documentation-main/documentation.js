(function () {

    var module = angular.module("documentation", ['ngCookies']);
    module.controller('DocumentationController', ['$scope', '$cookies', '$location', function ($scope, $cookies, $location) {

        var model = {};

        $scope.model = model;

        model.onFrameworkChanged = function () {
            window.location.href = '?framework=' + model.framework;
        };

        model.framework = document.querySelector('#frameworkAttr').innerHTML;

        $scope.frameworkContext = getFrameworkFromCookieAndDefaultIfNotDefined();

        $scope.onFrameworkContextChanged = function () {
            setCookie('frameworkContext', $scope.frameworkContext ? $scope.frameworkContext : 'all');
        };

        $scope.isFramework = function (framework) {
            $scope.frameworkContext = getFrameworkFromCookieAndDefaultIfNotDefined();

            if ($scope.frameworkContext === 'all') {
                return true;
            }

            var frameworks = [].concat(framework);
            for (var test of frameworks) {
                if ($scope.frameworkContext === test) {
                    return true;
                }
            }

            return false;
        };

        function setCookie(name, value) {
            $cookies.remove(name);
            var n = new Date();
            var expires = new Date(n.getFullYear() + 1, n.getMonth(), n.getDate());
            $cookies.put(name,
                value,
                {
                    path: "/",
                    expires: expires
                });
        }

        function getFrameworkFromCookieAndDefaultIfNotDefined() {
            var frameworkContext = $cookies.get('frameworkContext');
            if (!frameworkContext) {
                frameworkContext = 'all';
                setCookie('frameworkContext', frameworkContext);
            }
            $scope.frameworkContext = frameworkContext;
            return $scope.frameworkContext;
        }

        $scope.divIsReady = function (divId) {
            console.log(document.getElementById(divId));
            if (document.getElementById(divId)) {
                return true;
            }
            return false;
        }
        $scope.docsControllerReady = true;
    }]);

    module.controller('GettingStartedController', ['$scope', function ($scope) {
        $scope.jsOpen = false;
        $scope.angularJsOpen = false;
        $scope.vueOpen = false;
        $scope.reactOpen = false;
        $scope.aureliaOpen = false;
        $scope.webcomponentsOpen = false;

        $scope.showGettingStarted = true;

        $scope.toggleDiv = function (attribute) {
            $scope[attribute] = !$scope[attribute];
        }
    }]);

    /*
     * Show Example directive
     */
    module.directive("showExample", function () {
        return {
            scope: true,
            controller: ShowExampleController,
            templateUrl: "/showExample.html"
        }
    });

    function endsWith(string, test) {
        return string.lastIndexOf(test) + test.length === string.length;
    }

    function ShowExampleController($scope, $http, $attrs) {
        var url = $attrs["url"];
        var example = $attrs["example"];
        $scope.source = url ? url : (example.indexOf("?") === -1 ? (example + ".html") : example);
        $scope.selectedTab = 'example';
        $scope.jsfile = $attrs['jsfile'] ? $attrs['jsfile'] : example;
        $scope.exeExtension = $scope.jsfile.indexOf(".ts") >= 0 || $scope.jsfile.indexOf(".vue") >= 0 ? "" : ".js";
        $scope.htmlFile = $attrs['html'] ? $attrs['html'] : "./" + example + ".html";
        $scope.sourceLang = "JavaScript";
        if ($scope.jsfile.indexOf(".ts") >= 0) {
            $scope.sourceLang = "TypeScript";
        } else if ($scope.jsfile.indexOf(".vue") >= 0) {
            $scope.sourceLang = "Vue";
        }

        $scope.showHtmlTab = $scope.sourceLang !== "Vue";

        if ($attrs.extrapages) {
            $scope.extrapages = $attrs.extrapages.split(',');
            $scope.extraPageContent = {};
            $scope.extrapages.forEach(function (page) {
                $http.get("./" + page).then(function (response) {
                    $scope.extraPageContent[page] = response.data;
                }).catch(function (response) {
                    $scope.extraPageContent[page] = response.data;
                });
            });
        }

        if ($attrs.exampleheight) {
            $scope.iframeStyle = {height: $attrs.exampleheight};
        } else {
            $scope.iframeStyle = {height: '500px'}
        }

        if ($scope.showHtmlTab) {
            $http.get($scope.htmlFile).then(function (response) {
                $scope.html = response.data;
            }).catch(function (response) {
                $scope.html = response.data;
            });
        }
        $http.get("./" + $scope.jsfile + $scope.exeExtension).then(function (response) {
            $scope.javascript = response.data;
        }).catch(function (response) {
            $scope.javascript = response.data;
        });

        $scope.isActive = function (item) {
            return $scope.selectedTab == item;
        };
        $scope.setActive = function (item) {
            $scope.selectedTab = item;
        };
    }

    /*
     * Multi-page (more than just js & html really) Examples with plunker support
     */
    module.directive("showComplexExample", function () {
        return {
            scope: true,
            controller: ShowComplexScriptExampleController,
            templateUrl: "/showComplexExample.html"
        }
    });

    function ShowComplexScriptExampleController($scope, $http, $attrs, $sce) {
        $scope.source = $attrs["example"];
        $scope.selectedTab = 'example';

        $scope.plunker = null;
        if ($attrs.plunker && $attrs.plunker.indexOf("https://embed.plnkr.co") === 0) {
            var plunkerUrl = $attrs.plunker;
            plunkerUrl += (plunkerUrl.indexOf("?") === -1) ? "?" : "&";
            plunkerUrl += "show=preview";

            $scope.plunker = $sce.trustAsResourceUrl(plunkerUrl);
        }

        $scope.extraPages = [];

        var sources = eval($attrs.sources);
        sources.forEach(function(source) {
            var root = source.root;
            var files = source.files.split(',');

            $scope.extraPages = $scope.extraPages.concat(files);

            $scope.extraPageContent = {};
            files.forEach(function (file) {
                $http.get(root + file).then(function (response) {
                    $scope.extraPageContent[file] = response.data;
                }).catch(function (response) {
                    $scope.extraPageContent[file] = response.data;
                });
            });
            $scope.extraPage = $scope.extraPages[0];
        });

        if ($attrs.exampleheight) {
            $scope.iframeStyle = {height: $attrs.exampleheight};
        } else {
            $scope.iframeStyle = {height: '500px'}
        }

        $scope.isActive = function (item) {
            return $scope.selectedTab == item;
        };
        $scope.setActive = function (item) {
            $scope.selectedTab = item;
        };

        $scope.isActivePage = function (item) {
            return $scope.extraPage == item;
        };
        $scope.setActivePage = function (item) {
            $scope.extraPage = item;
        };
    }

    /*
     * plunker only example
     */
    module.directive("showPlunkerExample", function () {
        return {
            scope: true,
            controller: ShowPlunkerScriptExampleController,
            templateUrl: "/showPlunkerExample.html"
        }
    });

    function ShowPlunkerScriptExampleController($scope, $http, $attrs, $sce) {
        $scope.selectedTab = 'editplunker';

        $scope.plunker = null;
        if ($attrs.plunker && $attrs.plunker.indexOf("https://embed.plnkr.co") === 0) {
            var plunkerUrl = $attrs.plunker;
            plunkerUrl += (plunkerUrl.indexOf("?") === -1) ? "?" : "&";
            plunkerUrl += "show=preview";

            $scope.plunker = $sce.trustAsResourceUrl(plunkerUrl);
        }

        $scope.extraPages = [];

        var sources = eval($attrs.sources);
        sources.forEach(function(source) {
            var root = source.root;
            var files = source.files.split(',');

            $scope.extraPages = $scope.extraPages.concat(files);

            $scope.extraPageContent = {};
            files.forEach(function (file) {
                $http.get(root + file).then(function (response) {
                    $scope.extraPageContent[file] = response.data;
                }).catch(function (response) {
                    $scope.extraPageContent[file] = response.data;
                });
            });
            $scope.extraPage = $scope.extraPages[0];
        });

        if ($attrs.exampleheight) {
            $scope.iframeStyle = {height: $attrs.exampleheight};
        } else {
            $scope.iframeStyle = {height: '500px'}
        }

        $scope.isActive = function (item) {
            return $scope.selectedTab == item;
        };
        $scope.setActive = function (item) {
            $scope.selectedTab = item;
        };

        $scope.isActivePage = function (item) {
            return $scope.extraPage == item;
        };
        $scope.setActivePage = function (item) {
            $scope.extraPage = item;
        };
    }

    /*
     * Note directive
     */
    module.directive("note", function () {
        return {
            templateUrl: "/note.html",
            transclude: true
        }
    });

    /*
     * theme tab directive
     */
    module.directive("themeTab", function () {
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

        $scope.isActive = function (item) {
            return $scope.selectedTab == item;
        };
        $scope.setActive = function (item) {
            $scope.selectedTab = item;
        };

        $scope.setTheme = function (theme) {
            $scope.selectedTab = theme
        };

        $scope.isSelected = function (theme) {
            return $scope.selectedTab == theme
        };
    }

    module.directive('script', function () {
        return {
            restrict: 'E',
            scope: false,
            link: function (scope, elem, attr) {
                if (attr.type === 'text/javascript-lazy') {
                    var s = document.createElement("script");
                    s.type = "text/javascript";
                    var src = elem.attr('src');
                    if (src !== undefined) {
                        s.src = src;
                    }
                    else {
                        var code = elem.text();
                        s.text = code;
                    }
                    document.head.appendChild(s);
                    // elem.remove();
                }
            }
        };
    });

    /*
    *
    Local storage/remember toggle state
    */

    var localStorageKey = "ag_grid_state";
    var toggleClasses = document.getElementsByClassName("docsMenu-header");

    var default_state = {
        getting_started: false,
        interfacing: false,
        features: false,
        themes: false,
        components: false,
        row_models: false,
        examples: false,
        misc: false
    }

    
    /* check whether this is a page that needs to be active/open (e.g. if in group) */
    function handleState(saved_state) {

        var defaultClasses = document.getElementsByClassName("docsMenu-header");
        var defaultClassesArray = [];
        
        for (var i = 0; i < defaultClasses.length; i++) {
            var isToggleActive = defaultClasses[i].classList.contains('active');
            var id = defaultClasses[i].dataset.id;
            if (isToggleActive) {
                defaultClassesArray.push(id);
            }
        }
        return {
            getting_started: defaultClassesArray.indexOf("getting_started") > -1 ? true : saved_state.getting_started,
            interfacing: defaultClassesArray.indexOf("interfacing") > -1 ? true : saved_state.interfacing,
            features: defaultClassesArray.indexOf("features") > -1 ? true : saved_state.features,
            themes: defaultClassesArray.indexOf("themes") > -1 ? true : saved_state.themes,
            components: defaultClassesArray.indexOf("components") > -1 ? true : saved_state.components,
            row_models: defaultClassesArray.indexOf("row_models") > -1 ? true : saved_state.row_models,
            examples: defaultClassesArray.indexOf("examples") > -1 ? true : saved_state.examples,
            misc: defaultClassesArray.indexOf("misc") > -1 ? true : saved_state.misc
        }        
    }


    var saved_state = localStorage.getItem(localStorageKey);

    // if `saved_state` is true we parse it and use that value for `state`; otherwise use `default_state`
    var state = saved_state ? handleState(JSON.parse(saved_state)) : default_state;

    initDocsMenu();

    function initDocsMenu() {
        for(var key in state) {
            var is_displayed = state[key];
            toggleDocsMenu(key, is_displayed);
        }
    }

    for (var i = 0; i < toggleClasses.length; i++) {
        toggleClasses[i].addEventListener('click', handleToggle, false);
    }
    
    function handleToggle() {
        var id = this.dataset.id;
        var clicked = true;
        toggleDocsMenu(id, !state[id], clicked);
    }


    function toggleDocsMenu(id, is_displayed, clicked) {
        var element = document.querySelectorAll("[data-id='"+id+"']");
        if (is_displayed) {
            state[id] = true;
            element[0].classList.add("active");
            element[0].classList.add("toggleCollapse");
            if (clicked) {

            }
        } else {
            state[id] = false;
            element[0].classList.remove("active");
            if (clicked) {
                element[0].classList.remove("toggleCollapse");
            }
        }
        
        localStorage.setItem(localStorageKey, JSON.stringify(state));

    }

})();
