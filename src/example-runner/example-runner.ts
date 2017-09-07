import './example-runner.scss';
import * as angular from "angular";
import * as Prism from "prismjs";
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-jsx';

const docs: angular.IModule = angular.module('documentation');

const LanguageMap: { [ key: string ]: Prism.LanguageDefinition } = {
    "js": Prism.languages.javascript,
    "ts": Prism.languages.typescript,
    "css": Prism.languages.css,
    "sh": Prism.languages.bash,
    "html": Prism.languages.html,
    "jsx": Prism.languages.jsx
}

function highlight(code: string, language: string): string {
    const prismLanguage = LanguageMap[language];
    return Prism.highlight(code, prismLanguage);
}

function whenInViewPort(element, callback) {
    function comparePosition() {
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop || 0;
        var scrollPos = scrollTop + document.documentElement.clientHeight;
        var elemTop = element[0].offsetTop;
        console.log("scroll: ", scrollPos, "elem", elemTop);
        if (scrollPos >= elemTop) { 
            console.log("instantiating", element);
            window.removeEventListener('scroll', comparePosition);
            callback();
            // setTimeout(callback, 1000);
        }
    }

    comparePosition();
    window.addEventListener('scroll', comparePosition);
}

docs.directive('snippet', function() {
    return {
        restrict: 'E',
        scope: {
            language: '='
        }, 
        link: function(scope, element, attrs) {
            whenInViewPort(element, function() {
                const language = attrs.language || "js";
                const highlightedSource = highlight(element.text(), language);
                element.empty().html('<pre><code>' + highlightedSource + '</code></pre>');
            })
        }
    }
});

// taken from https://github.com/angular/angular.js/blob/489835dd0b36a108bedd5ded439a186aca4fa739/docs/app/src/examples.js#L53
docs.factory('formPostData', ['$document', function($document) {
    return function(url, newWindow, fields) {
        /**
         * If the form posts to target="_blank", pop-up blockers can cause it not to work.
         * If a user choses to bypass pop-up blocker one time and click the link, they will arrive at
         * a new default plnkr, not a plnkr with the desired template.  Given this undesired behavior,
         * some may still want to open the plnk in a new window by opting-in via ctrl+click.  The
         * newWindow param allows for this possibility.
         */
        var target = newWindow ? '_blank' : '_self';
        var form:any = angular.element('<form style="display: none;" method="post" action="' + url + '" target="' + target + '"></form>');
        angular.forEach(fields, function(value, name) {
            var input = angular.element('<input type="hidden" name="' +  name + '">');
            input.attr('value', value);
            form.append(input);
        });
        $document.find('body').append(form);
        form[0].submit();
        form.remove();
    };
}])


class ExampleRunner {
    ready: boolean = false;
    private source: any;
    private loadingSource:boolean;
    private selectedTab: string;

    private selectedFile: string;
    private resultUrl: string;

    private files: string[];
    private title: string;
    private section: string;
    private name: string;
    private type: string;
    private boilerplateFiles: string[];
    private boilerplatePath: string;

    private options: {
        showResult?: boolean,
        initialFile?: string,
        exampleHeight?: number
    };

    private iframeStyle: any;

    constructor(
        private $http: angular.IHttpService,
        private $timeout:angular.ITimeoutService,
        private $sce: angular.ISCEService,
        private $q:angular.IQService,
        private formPostData, 
        private $element: Element
    ) {
            $http.defaults.cache = true;
    }

    $onInit() {
        this.iframeStyle = {};

        if (this.options.exampleHeight) {
            this.iframeStyle.height = this.options.exampleHeight + "px";
        }
        if (!this.boilerplateFiles) {
            this.boilerplateFiles = [];
        }

        // for angular and react, index.html is part of the boilerplate
        if (this.files[0] != "index.html") {
            this.files = [ 'index.html' ].concat(this.files);
        }

        this.selectedTab = this.options.showResult ? 'result' : 'code';

        if (this.options.initialFile) {
            this.selectedFile = this.options.initialFile;
        } else {
            this.selectedFile = this.files[1];
        }

        whenInViewPort(this.$element, () => {
            this.$timeout(() => {
                this.refreshSource();
                this.ready = true;
            });
        })
    }

    refreshSource() {
        this.loadingSource = true;
        this.source = this.$sce.trustAsHtml("Loading...");

        const sourceUrl = this.getSourceUrl(this.selectedFile);

        this.$http.get(sourceUrl)
        .then((response: angular.IHttpResponse<{}>) => {
            this.loadingSource = false;
            const extension = this.selectedFile.match(/\.([a-z]+)$/)[1];
            const highlightedSource = highlight((response.data as string).trim(), extension);
            this.source = this.$sce.trustAsHtml(highlightedSource);
        });
    }

    getSourceUrl(file:string) {
        if (this.boilerplateFiles.indexOf(file) > -1 ) {
            return [ this.boilerplatePath, file ].join('/');
        }
        if (file == this.files[0]) {
            return this.resultUrl + "&preview=true";
        } else {
            return ['', this.section, this.name, file].join('/');
        }
    }

    openPlunker(clickEvent) {
        const allFiles = this.files.concat(this.boilerplateFiles);
        this.$q.all(allFiles.map( (file: any) => this.$http.get(this.getSourceUrl(file)) )).then( (files: any) => {
            var postData: any = {
                'tags[0]': "ag-grid",
                'tags[1]': "example",
                'private': true,
                'description': this.title
            };

            files.forEach( (file:any, index: number) => {
                postData['files[' + allFiles[index] + ']'] = file.data;
            });


            this.formPostData('http://plnkr.co/edit/?p=preview', true, postData);
        });
    }
}

ExampleRunner.$inject = ['$http', '$timeout', '$sce', '$q', 'formPostData', '$element'];

docs.component('exampleTab', {
    template: `
    <li role="presentation" ng-class="{ active: $ctrl.currentValue == $ctrl.value }">
        <a role="tab" ng-click="$ctrl.onClick(); $event.preventDefault()" href="#">
            <i ng-class="['fa', $ctrl.icon]" aria-hidden="true"></i> {{$ctrl.title}}
        </a>
    </li>

    `,
    bindings: {
        icon: '<',
        title: '<',
        value: '<',
        currentValue: '<',
        onClick: '&'
    }
})

docs.component('exampleRunner', {
    template: ` 
        <div ng-if="$ctrl.ready" ng-class='["example-runner"]'>
        <ul role="tablist" class="primary">
            <li class="title">
                <a href="#example-{{$ctrl.name}}" id="example-{{$ctrl.name}}"> <i class="fa fa-link" aria-hidden="true"></i> {{$ctrl.title}} </a>
            </li>

            <example-tab 
                value="'result'" 
                current-value="$ctrl.selectedTab" 
                title="'Result'"
                icon="'fa-play'" 
                on-click="$ctrl.selectedTab = 'result'">
            </example-tab>

            <example-tab 
                value="'code'" 
                current-value="$ctrl.selectedTab" 
                title="'Code'"
                icon="'fa-code'" 
                on-click="$ctrl.selectedTab = 'code'">
            </example-tab>

            <example-tab 
                value="'plunker'" 
                current-value="$ctrl.selectedTab" 
                title="'Open in Plunker'"
                icon="'fa-external-link'" 
                on-click="$ctrl.openPlunker($event); $event.preventDefault()">
            </example-tab>

        </ul>  

        <div class="tab-contents">
            <div ng-show="$ctrl.selectedTab == 'result'" role="tabpanel" class="result">
                <a ng-href={{$ctrl.resultUrl}} target="_blank" class="result-in-new-tab" title="Show result in new tab"><i class="fa fa-arrows-alt" aria-hidden="true"></i></a>
                <iframe ng-src="{{$ctrl.resultUrl}}" ng-style="$ctrl.iframeStyle" seamless="true"></iframe>
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
    `,
    bindings: {
        files: '<',
        boilerplateFiles: '<',
        boilerplatePath: '<',
        title: '<',
        section: '<',
        resultUrl: '<',
        name: '<',
        type: '<',
        options: '<'
    },

    controller: ExampleRunner
});

docs.component('preview', {
    bindings: {
        resultUrl: '<',
        sourceCodeUrl: '<',
        title: '<',
        name: '<',
        options: '<'
    },

    template: ` 
        <div ng-if="$ctrl.ready" ng-class='["example-runner"]'>
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

        <div class="tab-contents">
            <div role="tabpanel" class="result">
                <a ng-href={{$ctrl.resultUrl}} target="_blank" class="result-in-new-tab" title="Show result in new tab"><i class="fa fa-arrows-alt" aria-hidden="true"></i></a>
                <iframe src="{{$ctrl.resultUrl}}" ng-style="$ctrl.iframeStyle" seamless="true"></iframe>
            </div>
        </div>

    </div>
    `,

    controller: [ '$timeout', '$element', function($timeout, $element) {
        this.ready = false;

        this.$onInit = function() {
            this.iframeStyle = {};

            if (this.options.exampleHeight) {
                this.iframeStyle.height = this.options.exampleHeight + "px";
            }

            whenInViewPort($element, () => { 
                $timeout(() => this.ready = true);
            });
        }
    }]
});
