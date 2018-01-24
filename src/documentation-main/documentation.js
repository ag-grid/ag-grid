(function () {

    var module = angular.module("documentation", ['ngCookies']);
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

    var removeFilenameFromPath = function (pathname) {
        if (pathname.lastIndexOf('/') === 0) {
            // only the root slash present
            return pathname;
        }
        return pathname.slice(0, pathname.lastIndexOf('/'));
    };

    let getPathWithTrailingSlash = function () {
        var pathname = removeFilenameFromPath(window.location.pathname);
        var trailingSlash = (pathname.indexOf("/", 1) === pathname.length - 1);
        pathname += trailingSlash ? "" : "/";
        return pathname;
    };

    let getExtensionForExample = function (jsfile) {
        return jsfile.indexOf(".ts") >= 0 || jsfile.indexOf(".vue") >= 0 ? "" : ".js";
    };

    let getSourceLang = function (jsfile) {
        if (jsfile.indexOf(".ts") >= 0) {
            return "TypeScript";
        } else if (jsfile.indexOf(".vue") >= 0) {
            return "Vue";
        }
        return "JavaScript";
    };

    function ShowExampleController($scope, $http, $attrs) {
        var pathname = getPathWithTrailingSlash();

        var url = $attrs["url"];
        var example = $attrs["example"];

        var jsfile = $attrs['jsfile'] ? $attrs['jsfile'] : example;
        $scope.jsfile = pathname + jsfile + getExtensionForExample(jsfile);

        $scope.selectedTab = 'example';
        $scope.sourceLang = getSourceLang($scope.jsfile);

        $scope.source = url ? url : pathname + example + ".html";

        $scope.htmlFile = pathname + ($attrs['html'] ? $attrs['html'] : example + ".html");

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
        $http.get($scope.jsfile).then(function (response) {
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
        var pathname = getPathWithTrailingSlash();

        $scope.sourcesOnly = $attrs["sourcesonly"];

        $scope.source = $scope.sourcesOnly ? $attrs["example"] : (pathname + $attrs["example"]);
        $scope.selectedTab = $scope.sourcesOnly ? 'source' : 'example';

        $scope.plunker = null;
        if ($attrs.plunker && $attrs.plunker.indexOf("https://embed.plnkr.co") === 0) {
            var plunkerUrl = $attrs.plunker;
            plunkerUrl += (plunkerUrl.indexOf("?") === -1) ? "?" : "&";
            plunkerUrl += "show=preview";

            $scope.plunker = $sce.trustAsResourceUrl(plunkerUrl);
            $scope.editPlunker = $attrs.plunker.replace("embed.plnkr.co", "plnkr.co/edit") + "?p=info";
        }

        $scope.extraPages = [];

        var sources = eval($attrs.sources);
        sources.forEach(function (source) {
            var root = source.root;
            root = root === "./" ? pathname : root;
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
            $scope.editPlunker = $attrs.plunker.replace("embed.plnkr.co", "plnkr.co/edit") + "?p=info";
        }

        $scope.extraPages = [];

        var sources = eval($attrs.sources);
        sources.forEach(function (source) {
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
            template: "<div class=note><ng-transclude></ng-transclude></div>",
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

    // Local storage/remember toggle state
    var cookieKeyExpandAll = "agGridExpandAll";
    var eExpandDivs = document.getElementsByClassName("docsMenu-header");
    var eExpandAll = document.querySelector(".expandAll");

    // cookieKeyExpandAll

    function showExpandAll(show) {
        if (show) {
            eExpandAll.innerHTML = "Expand All <i class='fa fa-arrow-right' aria-hidden='true'></i>";
        } else {
            eExpandAll.innerHTML = "Close All <i class='fa fa-arrow-down' aria-hidden='true'></i>";
        }
    }

    // close framework dropdown when clicking outside
    if (document.body) {
        document.body.addEventListener('click', hideFrameworkSelectionOnBodyClick, true);
    }

    function hideFrameworkSelectionOnBodyClick() {
        var eFrameworkBox = document.querySelector('.frameworkBox');
        var ePopupButton = document.querySelector('.frameworkDropdownButton');
        if (eFrameworkBox) {
            if (!eFrameworkBox.contains(event.target)) {
                ePopupButton.classList.remove("active");
            }
        }
    }

    for (var i = 0; i < eExpandDivs.length; i++) {
        eExpandDivs[i].addEventListener('click', handleToggle, false);
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function handleToggle() {

        resetSingleToggle(this);

        this.classList.toggle("active");

        showExpandAll(true);
        setCookie(cookieKeyExpandAll, 'false', 20);
    }

    function resetSingleToggle(eDivToSkip) {
        for (var i = 0; i < eExpandDivs.length; i++) {
            if (eExpandDivs[i] !== eDivToSkip) {
                eExpandDivs[i].classList.remove("active");
            }
        }
    }

    /* expand all dropdowns */
    if (eExpandAll) {
        eExpandAll.addEventListener('click', function () {
            if (this.text.indexOf('Expand') > -1) {
                expandAll();
            } else {
                closeAll();
            }
        }, true);
    }

    function expandAll() {
        for (var i = 0; i < eExpandDivs.length; i++) {
            eExpandDivs[i].classList.add("active");
            showExpandAll(false);
            setCookie(cookieKeyExpandAll, 'true', 20);
        }
    }

    function closeAll() {
        for (var i = 0; i < eExpandDivs.length; i++) {
            eExpandDivs[i].classList.remove("active");
            showExpandAll(true);
            setCookie(cookieKeyExpandAll, 'false', 20);
        }
    }

    /* framework dropdown menu */
    var FrameworkLinks = document.getElementsByClassName("frameworkDropdown-link");

    for (var i = 0; i < FrameworkLinks.length; i++) {
        FrameworkLinks[i].addEventListener('click', handleFrameworkChange, false);
    }

    function handleFrameworkChange() {
        var framework = this.dataset.id;
        window.location.href = '?framework=' + framework;
    }
})();
