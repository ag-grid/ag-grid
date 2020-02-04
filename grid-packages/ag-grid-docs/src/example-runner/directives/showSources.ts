import * as angular from "angular";

const docs: angular.IModule = angular.module("documentation");

const removeFilenameFromPath = (pathname: string) => {
    if (pathname.lastIndexOf("/") === 0) {
        // only the root slash present
        return pathname;
    }
    return pathname.slice(0, pathname.lastIndexOf("/"));
};

const getPathWithTrailingSlash = () => {
    let pathname = removeFilenameFromPath(window.location.pathname);
    let trailingSlash = pathname.indexOf("/", 1) === pathname.length - 1;
    pathname += trailingSlash ? "" : "/";
    return pathname;
};

// used in some of the old crud blogs
docs.directive("showSources", function () {
    const ShowComplexScriptExampleController = [
        "$scope",
        "$http",
        "$attrs",
        "$sce",
        "HighlightService",
        function ($scope: any, $http: any, $attrs: any, $sce: any, HighlightService: any) {
            const pathname = getPathWithTrailingSlash();

            $scope.source = $scope.sourcesOnly ? $attrs["example"] : pathname + $attrs["example"];

            $scope.extraPages = [];

            const sources = eval($attrs.sources);
            sources.forEach(function (source: any) {
                let root = source.root;
                root = root === "./" ? pathname : root;
                const files = source.files.split(",");

                $scope.extraPages = $scope.extraPages.concat(files);

                $scope.extraPageContent = {};
                files.forEach(function (file: string) {
                    $http
                        .get(root + file)
                        .then(function (response: any) {
                            const language = $attrs.language ? $attrs.language : "js";
                            const content = $attrs.highlight ? HighlightService.highlight(response.data, language) : response.data;
                            $scope.extraPageContent[file] = $sce.trustAsHtml(`<pre class="language-${language}"><code>${content}</code></pre>`);
                        })
                        .catch(function (response: any) {
                            $scope.extraPageContent[file] = response.data;
                        });
                });
                $scope.extraPage = $scope.extraPages[0];
            });

            if ($attrs.exampleheight) {
                $scope.iframeStyle = {height: $attrs.exampleheight};
            } else {
                $scope.iframeStyle = {height: "500px"};
            }

            $scope.isActivePage = function (item: any) {
                return $scope.extraPage == item;
            };
            $scope.setActivePage = function (item: any) {
                $scope.extraPage = item;
            };
        }
    ];

    return {
        scope: true,
        controller: ShowComplexScriptExampleController,
        templateUrl: "/showSources.html"
    };
});
