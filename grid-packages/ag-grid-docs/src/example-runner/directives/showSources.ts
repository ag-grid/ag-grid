import * as angular from 'angular';

const docs: angular.IModule = angular.module('documentation');

const removeFilenameFromPath = (pathname: string) => {
    const lastSlashIndex = pathname.lastIndexOf('/');

    return lastSlashIndex === 0 ? pathname : pathname.slice(0, lastSlashIndex);
};

const getPathWithTrailingSlash = () => {
    const pathname = removeFilenameFromPath(window.location.pathname);
    const hasTrailingSlash = pathname.indexOf('/', 1) === pathname.length - 1;

    return hasTrailingSlash ? pathname : pathname + '/';
};

// used in some of the old crud blogs
docs.directive('showSources', function() {
    const ShowComplexScriptExampleController = [
        '$scope',
        '$http',
        '$attrs',
        '$sce',
        'HighlightService',
        ($scope: any, $http: any, $attrs: any, $sce: any, HighlightService: any) => {
            const pathname = getPathWithTrailingSlash();

            $scope.source = $scope.sourcesOnly ? $attrs['example'] : pathname + $attrs['example'];
            $scope.extraPages = [];

            const sources = eval($attrs.sources);
            sources.forEach((source: any) => {
                let root = source.root;
                root = root === './' ? pathname : root;
                const files = source.files.split(',');

                $scope.extraPages = $scope.extraPages.concat(files);

                $scope.extraPageContent = {};
                files.forEach((file: string) => {
                    $http
                        .get(root + file)
                        .then((response: any) => {
                            const language = $attrs.language ? $attrs.language : 'js';
                            const content = $attrs.highlight ? HighlightService.highlight(response.data, language) : response.data;
                            $scope.extraPageContent[file] = $sce.trustAsHtml(`<pre class="language-${language}"><code>${content}</code></pre>`);
                        })
                        .catch((response: any) => {
                            $scope.extraPageContent[file] = response.data;
                        });
                });
                $scope.extraPage = $scope.extraPages[0];
            });

            $scope.iframeStyle = { height: $attrs.exampleHeight || '500px' };

            $scope.isActivePage = (item: any) => $scope.extraPage == item;

            $scope.setActivePage = (item: any) => {
                $scope.extraPage = item;
            };
        }
    ];

    return {
        scope: true,
        controller: ShowComplexScriptExampleController,
        templateUrl: '/showSources.html'
    };
});
