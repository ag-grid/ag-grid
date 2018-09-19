// import './example-runner.scss';

import * as angular from "angular";
import * as jQuery from "jquery";

import { whenInViewPort, trackIfInViewPort } from "./lib/viewport";
import { highlight } from "./lib/highlight";

const docs: angular.IModule = angular.module("documentation");

function resetIndent(str) {
    const leadingWhitespace = str.match(/^\n?( +)/);
    if (leadingWhitespace) {
        return str.replace(new RegExp(" {" + leadingWhitespace[1].length + "}", "g"), "").trim();
    } else {
        return str.trim();
    }
}

docs.service("HighlightService", function() {
    this.highlight = function(code: string, language: string) {
        return highlight(code, language);
    };
});

docs.directive("snippet", function() {
    return {
        restrict: "E",
        scope: {
            language: "="
        },
        link: function(scope, element, attrs) {
            const language = attrs.language || "js";
            const highlightedSource = highlight(resetIndent(element.text()), language);
            element.empty().html("<pre><code>" + highlightedSource + "</code></pre>");
        }
    };
});

// taken from https://github.com/angular/angular.js/blob/489835dd0b36a108bedd5ded439a186aca4fa739/docs/app/src/examples.js#L53
docs.factory("formPostData", [
    "$document",
    function($document) {
        return function(url, newWindow, fields) {
            /*
             * If the form posts to target="_blank", pop-up blockers can cause it not to work.
             * If a user choses to bypass pop-up blocker one time and click the link, they will arrive at
             * a new default plnkr, not a plnkr with the desired template.  Given this undesired behavior,
             * some may still want to open the plnk in a new window by opting-in via ctrl+click.  The
             * newWindow param allows for this possibility.
             */
            var target = newWindow ? "_blank" : "_self";
            var form: any = angular.element('<form style="display: none;" method="post" action="' + url + '" target="' + target + '"></form>');
            angular.forEach(fields, function(value, name) {
                var input = angular.element('<input type="hidden" name="' + name + '">');
                input.attr("value", value);
                form.append(input);
            });
            $document.find("body").append(form);
            form[0].submit();
            form.remove();
        };
    }
]);

const ACTIVE_EXAMPLE_RUNNERS = [];

class ExampleRunner {
    private ready: boolean = false;
    private source: any;
    private loadingSource: boolean;
    private showFrameworksDropdown: boolean;
    private selectedTab: string;

    private selectedFile: string;
    private resultUrl: string;

    private files: string[];
    private title: string;
    private section: string;
    private name: string;
    private type: string;
    private currentType: string;
    private noPlunker: boolean;
    private boilerplateFiles: string[];
    private boilerplatePath: string;
    sourcePrefix: string;

    private titles: { [key: string]: string };

    private options: {
        showResult?: boolean;
        initialFile?: string;
        exampleHeight?: number;
    };

    private config: any;

    private iframeStyle: any;

    constructor(
        private $http: angular.IHttpService,
        private $timeout: angular.ITimeoutService,
        private $sce: angular.ISCEService,
        private $q: angular.IQService,
        private formPostData,
        private $element: Element,
        private $cookies: angular.cookies.ICookiesService
    ) {
        $http.defaults.cache = true;
    }

    private availableTypes: string[];

    private openFwDropdown: boolean = false;
    private visible: boolean = false;

    private processVue: boolean = false;

    toggleFwDropdown() {
        this.openFwDropdown = !this.openFwDropdown;
    }

    hideFwDropdown() {
        this.$timeout(() => (this.openFwDropdown = false), 200);
    }

    $onInit() {
        this.iframeStyle = {};

        const options = this.config.options;

        if (options.exampleHeight) {
            this.iframeStyle.height = options.exampleHeight + "px";
        }

        this.selectedTab = options.showResult === false ? "code" : "result";

        this.title = this.config.title;
        this.name = this.config.name;
        this.section = this.config.section;
        this.showFrameworksDropdown = !options.onlyShow && (this.config.type === "multi" || this.config.type === "generated");
        this.availableTypes = options.onlyShow ? [options.onlyShow.toLowerCase()] : Object.keys(this.config.types);

        this.titles = {
            vanilla: "JavaScript",
            react: "React",
            angular: "Angular"
        };

        // for now - once all examples have been converted/tested for vue, this can be removed and the vue entry added to
        // this.titles as a permanent addition
        this.processVue = options.processVue;
        if(this.processVue) {
            this.titles['vue'] = "Vue";
        } else {
            if(this.availableTypes.indexOf('vue') !== -1) {
                this.availableTypes.splice(this.availableTypes.indexOf('vue'), 1)
            }
        }

        const divWrapper = jQuery(this.$element).find("div.example-wrapper");

        this.$timeout(() => {
            let visibleToggle: angular.IPromise<void>;
            let nextVisible: boolean = false;

            trackIfInViewPort(divWrapper, visible => {
                this.$timeout(() => {
                    if (visible && !this.visible) {
                        this.visible = true;
                        ACTIVE_EXAMPLE_RUNNERS.push(this);
                    }
                });
            });
        });

        whenInViewPort(divWrapper, () => {
            this.$timeout(() => {
                this.setType(this.getInitialType());
                this.ready = true;
            });
        });
    }

    getInitialType(): string {
        if (this.config.showOnly) {
            return this.config.showOnly;
        }

        const selectedFramework = this.$cookies.get("agGridFramework");
        const selectedRunnerVersion = this.$cookies.get("agGridRunnerVersion");

        if (this.availableTypes.indexOf(selectedRunnerVersion) > -1) {
            return selectedRunnerVersion;
        } else if (this.availableTypes.indexOf(selectedFramework) > -1) {
            return selectedFramework;
        } else {
            return this.availableTypes[0];
        }
    }

    setAndPersistType(type: string) {
        this.setType(type);
        const tenYearsFromNow = new Date();
        tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
        this.$cookies.put("agGridRunnerVersion", type, {
            path: "/",
            expires: tenYearsFromNow
        });
    }

    setType(type: string) {
        const typeConfig = this.config.types[type];

        this.boilerplateFiles = typeConfig.boilerplateFiles || [];
        this.boilerplatePath = typeConfig.boilerplatePath;

        const files = typeConfig.files ?
            typeConfig.files.filter((file) => { return file.indexOf('node_modules') === -1 }) :
            typeConfig.files;

        this.files = files[0] === "index.html" ? files : ["index.html"].concat(files);

        this.selectedFile = this.files[1];

        this.resultUrl = typeConfig.resultUrl;

        this.currentType = type;

        this.noPlunker = this.config.options.noPlunker;

        this.loadAllSources();

        this.refreshSource();

        this.openFwDropdown = false;
    }

    private sources: string[];
    private allFiles: any;

    loadAllSources() {
        this.allFiles = this.files.concat(this.boilerplateFiles);

        this.$q
            .all(
                this.allFiles.map((file: string) => {
                    return this.loadSource(file);
                })
            )
            .then((sources: any) => {
                this.sources = sources;
            });
    }

    refreshSource() {
        this.loadingSource = true;
        this.source = this.$sce.trustAsHtml("Loading...");

        this.loadSource(this.selectedFile).then(source => {
            this.loadingSource = false;
            if (!this.selectedFile) {
                throw new Error("We ended up without a selected file :(");
            }
            const extension = this.selectedFile.match(/\.([a-z]+)$/)[1];
            const highlightedSource = highlight(source.trim(), extension);
            this.source = this.$sce.trustAsHtml(highlightedSource);
        });
    }

    loadSource(file: string): angular.IPromise<string> {
        let source = this.getSource(file);
        let sourceUrl;

        if (typeof source === "string") {
            return this.$http.get(source).then((response: angular.IHttpResponse<string>) => {
                return response.data;
            });
        } else {
            const sourcePromises = source.sources.map(source => (source ? this.$http.get(source).then(response => response.data) : ""));
            return this.$q.all(sourcePromises).then(responses => {
                // stupid typescript
                return (<any>source).process(responses);
            });
        }
    }

    getSource(file: string): string | { sources: string[]; process: (string) => string } {
        if (this.boilerplateFiles.indexOf(file) > -1) {
            return [this.boilerplatePath, file].join("/");
        }

        if (file == this.files[0]) {
            return this.resultUrl + "&preview=true";
        } else {
            return this.appFilePath(file);
        }
    }

    sourcesForGeneration(): string[] {
        const vanillaTypes = this.config.types.vanilla.files;

        return [this.appFilePath(vanillaTypes.filter(file => file.endsWith(".js"))[0]), this.appFilePath(vanillaTypes.filter(file => file.endsWith(".html"))[0])];
    }

    appFilePath(file) {
        if (!file) {
            return "";
        }

        let endSegment = [file];
        if (this.config.type === "multi") {
            endSegment = [this.currentType, file];
        } else if (this.config.type === "generated") {
            endSegment = ["_gen", this.currentType, file];
        }

        return [this.config.sourcePrefix, this.section, this.name].concat(endSegment).join("/");
    }

    openPlunker(clickEvent) {
        const postData: any = {
            "tags[0]": "ag-grid",
            "tags[1]": "example",
            private: true,
            description: this.title
        };

        this.sources.forEach((file: any, index: number) => {
            postData["files[" + this.allFiles[index] + "]"] = file;
        });

        this.formPostData("//plnkr.co/edit/?p=preview", true, postData);
    }

    typeTitle(title: string) {
        return this.titles[title];
    }
}

ExampleRunner.$inject = ["$http", "$timeout", "$sce", "$q", "formPostData", "$element", "$cookies"];

docs.component("exampleTab", {
    template: `
    <li role="presentation" ng-class="{ active: $ctrl.currentValue == $ctrl.value }">
            <a role="tab" ng-click="$ctrl.onClick(); $event.preventDefault()" href="#" title="{{$ctrl.tooltip}}">
            <i ng-class="['fa', $ctrl.icon]" aria-hidden="true"></i> {{$ctrl.title}}
        </a>
    </li>

    `,
    bindings: {
        icon: "<",
        title: "<",
        tooltip: "<",
        value: "<",
        currentValue: "<",
        onClick: "&"
    }
});

docs.component("exampleRunner", {
    template: ` 
        <div ng-class='["example-runner"]'>

        <div class="framework-chooser" ng-if="$ctrl.showFrameworksDropdown">
            <span> Example version: </span>
            <div ng-class="{ 'btn-group': true, 'open': $ctrl.openFwDropdown }">

    <button type="button" 
    ng-click="$ctrl.toggleFwDropdown()" 
    ng-blur="$ctrl.hideFwDropdown()"
    class="btn btn-default dropdown-toggle" 
    data-toggle="dropdown" 
    aria-haspopup="true" 
    aria-expanded="false"> 

    <span ng-class="[ 'runner-item-' + $ctrl.currentType, 'runner-item' ]">{{$ctrl.typeTitle($ctrl.currentType)}} </span>
    <span class="caret"></span> 

    </button>

                <ul class="dropdown-menu">
    <li ng-repeat="type in $ctrl.availableTypes">
        <a href="#" ng-click="$ctrl.setAndPersistType(type); $event.preventDefault();" ng-class="['runner-item', 'runner-item-' + type ]">{{$ctrl.typeTitle(type)}}</a>
    </li>
                </ul>
            </div>
        </div>


    <div class="example-wrapper">
        <ul role="tablist" class="primary">
            <li class="title">
                <a href="#example-{{$ctrl.name}}" title="link to {{$ctrl.title}}" id="example-{{$ctrl.name}}"> <i class="fa fa-link" aria-hidden="true"></i> {{$ctrl.title}} </a>
            </li>

            <example-tab 
                value="'result'" 
                current-value="$ctrl.selectedTab" 
                title="'Result'"
                tooltip="'Live Result of the Example'"
                icon="'fa-play'" 
                on-click="$ctrl.selectedTab = 'result'">
            </example-tab>

            <example-tab 
                value="'code'" 
                current-value="$ctrl.selectedTab" 
                title="'Code'"
                tooltip="'Examine Example Source Code'"
                icon="'fa-code'" 
                on-click="$ctrl.selectedTab = 'code'">
            </example-tab>


            <li role="presentation">
                <a role="tab" ng-href="{{$ctrl.resultUrl}}" target="_blank" title="Open Example in New Tab">
                    <i class="fa fa-arrows-alt" aria-hidden="true"></i> New Tab
                </a>
            </li>

            <example-tab
                ng-hide="$ctrl.noPlunker"
                value="'plunker'" 
                current-value="$ctrl.selectedTab" 
                title="'Plunker'"
                tooltip="'Open Example in Plunker'"
                icon="'fa-external-link'" 
                on-click="$ctrl.openPlunker($event); $event.preventDefault()">
            </example-tab>

        </ul>  

        <div class="loading-placeholder" ng-if="!$ctrl.ready" ng-style="$ctrl.iframeStyle">
            <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
        </div>

        <div class="tab-contents" ng-if="$ctrl.ready">
            <div ng-show="$ctrl.selectedTab == 'result'" role="tabpanel" class="result">
                <iframe ng-if="$ctrl.visible" ng-src="{{$ctrl.resultUrl}}" ng-style="$ctrl.iframeStyle" seamless="true"></iframe>
                <div ng-show="!$ctrl.visible" class="iframe-placeholder" ng-style="$ctrl.iframeStyle">
                    <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                </div>
            </div>

            <div ng-if="$ctrl.selectedTab == 'code'" role="tabpanel" class="code-browser">
                <ul role="tablist" class="secondary">

                    <li ng-if="$ctrl.boilerplateFiles.length > 0" class="separator">
                         App
                    </li>

                    <example-tab 
                        ng-repeat="file in $ctrl.files"
                        value="file" 
                        current-value="$ctrl.selectedFile" 
                        title="file"
                        icon="'fa-file-code-o'" 
                        on-click="$ctrl.selectedFile = file; $ctrl.refreshSource()">
                    </example-tab>

                    <li ng-if="$ctrl.boilerplateFiles.length > 0" class="separator">
                        Framework
                    </li>

                    <example-tab
                        ng-repeat="file in $ctrl.boilerplateFiles"
                        value="file"
                        current-value="$ctrl.selectedFile"
                        title="file"
                        icon="'fa-file-code-o'"
                        on-click="$ctrl.selectedFile = file; $ctrl.refreshSource()">
                    </example-tab>
                </ul>

                <pre><code ng-bind-html="$ctrl.source"></code></pre>
            </div>
        </div>

        </div>
    </div>
    `,
    bindings: {
        config: "<"
    },

    controller: ExampleRunner
});

docs.component("preview", {
    bindings: {
        resultUrl: "<",
        sourceCodeUrl: "<",
        title: "<",
        name: "<",
        options: "<"
    },

    template: `<div ng-class='["example-runner"]'>
        <ul role="tablist" class="primary">
            <li class="title">
                <a href="#example-{{$ctrl.name}}" id="example-{{$ctrl.name}}"> <i class="fa fa-link" aria-hidden="true"></i> {{$ctrl.title}} </a>
            </li>

            <example-tab 
                value="'result'" 
                current-value="'result'" 
                title="'Result'"
                icon="'fa-play'" 
                >
            </example-tab>

            <li role="presentation">
                <a role="tab" ng-href="{{$ctrl.sourceCodeUrl}}" target="_blank">
                    <i class="fa fa-external-link" aria-hidden="true"></i> Browse Source Code
                </a>
            </li>

        </ul>  

        <div class="loading-placeholder" ng-if="!$ctrl.ready" ng-style="$ctrl.iframeStyle">
            <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
        </div>
        <div class="loading-placeholder" ng-if="!$ctrl.ready">
            <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
        </div>

        <div class="tab-contents" ng-if="$ctrl.ready">
            <div role="tabpanel" class="result">
                <a ng-href={{$ctrl.resultUrl}} target="_blank" class="result-in-new-tab" title="Show Result in New Tab"><i class="fa fa-arrows-alt" aria-hidden="true"></i></a>
                <iframe src="{{$ctrl.resultUrl}}" ng-style="$ctrl.iframeStyle" seamless="true"></iframe>
            </div>
        </div>

    </div>
    `,

    controller: [
        "$timeout",
        "$element",
        function($timeout, $element) {
            this.ready = false;

            this.$onInit = function() {
                this.iframeStyle = {};

                if (this.options.exampleHeight) {
                    this.iframeStyle.height = this.options.exampleHeight + "px";
                }

                whenInViewPort(jQuery($element), () => {
                    $timeout(() => (this.ready = true));
                });
            };
        }
    ]
});

let removeFilenameFromPath = function(pathname) {
    if (pathname.lastIndexOf("/") === 0) {
        // only the root slash present
        return pathname;
    }
    return pathname.slice(0, pathname.lastIndexOf("/"));
};

let getPathWithTrailingSlash = function() {
    let pathname = removeFilenameFromPath(window.location.pathname);
    let trailingSlash = pathname.indexOf("/", 1) === pathname.length - 1;
    pathname += trailingSlash ? "" : "/";
    return pathname;
};

docs.directive("showSources", function() {
    const ShowComplexScriptExampleController = [
        "$scope",
        "$http",
        "$attrs",
        "$sce",
        "HighlightService",
        function($scope, $http, $attrs, $sce, HighlightService) {
            const pathname = getPathWithTrailingSlash();

            $scope.source = $scope.sourcesOnly ? $attrs["example"] : pathname + $attrs["example"];

            $scope.extraPages = [];

            const sources = eval($attrs.sources);
            sources.forEach(function(source) {
                let root = source.root;
                root = root === "./" ? pathname : root;
                const files = source.files.split(",");

                $scope.extraPages = $scope.extraPages.concat(files);

                $scope.extraPageContent = {};
                files.forEach(function(file) {
                    $http
                        .get(root + file)
                        .then(function(response) {
                            const language = $attrs.language ? $attrs.language : "js";
                            const content = $attrs.highlight ? HighlightService.highlight(response.data, language) : response.data;
                            $scope.extraPageContent[file] = $sce.trustAsHtml('<pre class="language-' + language + '"><code>' + content + "</code></pre>");
                        })
                        .catch(function(response) {
                            $scope.extraPageContent[file] = response.data;
                        });
                });
                $scope.extraPage = $scope.extraPages[0];
            });

            if ($attrs.exampleheight) {
                $scope.iframeStyle = { height: $attrs.exampleheight };
            } else {
                $scope.iframeStyle = { height: "500px" };
            }

            $scope.isActivePage = function(item) {
                return $scope.extraPage == item;
            };
            $scope.setActivePage = function(item) {
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
