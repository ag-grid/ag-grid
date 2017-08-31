import './example-runner.scss';
import * as angular from "angular";

const docs: angular.IModule = angular.module('documentation');

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

    constructor(
        private $http: angular.IHttpService, 
        private $timeout:angular.ITimeoutService, 
        private $sce: angular.ISCEService, 
        private $q:angular.IQService, 
        private formPostData) {
            $http.defaults.cache = true;
        }

        $onInit() {
            this.selectedTab = "code";

            if (this.type == "angular") {
                this.files = [ 'index.html' ].concat(this.files);
                this.resultUrl = `../example-runner/angular.php?section=${this.section}&example=${this.name}`;
            } else {
                this.boilerplateFiles = [];
                this.resultUrl = `../example-runner/vanilla.php?section=${this.section}&example=${this.name}`;
            }

            this.selectedFile = this.files[0];
            this.refreshSource();
        }

        refreshSource() {
            this.loadingSource = true;
            this.source = this.$sce.trustAsHtml("Loading...");

            const sourceUrl = this.getSourceUrl(this.selectedFile);

            this.$http.get(sourceUrl)
            .then((response: angular.IHttpResponse<{}>) => {
                this.loadingSource = false;
                const extension = this.selectedFile.match(/\.([a-z]+)$/)[1];
                this.source = this.$sce.trustAsHtml(hljs.highlight(extension, <string> response.data).value);
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

                debugger;

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

ExampleRunner.$inject = ['$http', '$timeout', '$sce', '$q', 'formPostData'];

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
    <div class="example-runner">
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
                <iframe src="{{$ctrl.resultUrl}}" seamless="true"></iframe>
            </div>

            <div ng-if="$ctrl.selectedTab == 'code'" role="tabpanel" class="code-browser">
                <ul role="tablist" class="secondary">

                    <li ng-if="$ctrl.type == 'angular'" class="separator">
                        <i class="fa fa-user-o"></i> App
                    </li>

                    <example-tab 
                        ng-repeat="file in $ctrl.files"
                        value="file" 
                        current-value="$ctrl.selectedFile" 
                        title="file"
                        icon="'fa-file-code-o'" 
                        on-click="$ctrl.selectedFile = file; $ctrl.refreshSource()">
                    </example-tab>

                    <li ng-if="$ctrl.type == 'angular'" class="separator">
                        <i class="fa fa-gear"></i>Framework
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
        name: '<',
        type: '<'
    },

    controller: ExampleRunner
});
