import '../scss/example-runner.scss';

(function() {
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

    docs.component('exampleRunner', {
        template: ` 
        <div class="example-runner">
    <ul role="tablist" class="primary">
        <li class="title">
        <a href="#example-{{$ctrl.name}}" id="example-{{$ctrl.name}}">
            <i class="fa fa-link" aria-hidden="true"></i>
            {{$ctrl.title}}
            </a>
        </li>

        <li role="presentation" ng-class="{ active: $ctrl.selectedTab == 'result' }">
            <a role="tab" ng-click="$ctrl.selectedTab = 'result'; $event.preventDefault()" href="#">
                <i class="fa fa-play" aria-hidden="true"></i> Result
            </a>
        </li>

        <li role="presentation"  ng-class="{ active: $ctrl.selectedTab == 'code' }">
            <a role="tab" ng-click="$ctrl.selectedTab = 'code'; $event.preventDefault()" href="#">
                <i class="fa fa-code" aria-hidden="true"></i> Code
            </a>
        </li>

        <li role="presentation" class="external-tab">
            <a role="tab" ng-click="$ctrl.openPlunker($event); $event.preventDefault()" href="#">
            <i class="fa fa-external-link" aria-hidden="true"></i> Open in Plunker
            </a>
        </li>
    </ul>  

    <div class="tab-contents">
        <div ng-show="$ctrl.selectedTab == 'result'" role="tabpanel" class="result">
        <iframe src="{{$ctrl.resultUrl}}" seamless="true"></iframe>
        </div>

        <div ng-if="$ctrl.selectedTab == 'code'" role="tabpanel">
            <ul role="tablist" class="secondary">
                <li ng-repeat="file in $ctrl.files"role="presentation" ng-class="{ active: $ctrl.selectedFile == file }">
                    <a role="tab" ng-click="$ctrl.selectedFile = file; $ctrl.refreshSource(); $event.preventDefault()" href="#">
                        <i ng-class="['fa', $ctrl.getFileIconClass(file)]" aria-hidden="true"></i> {{file}}
                    </a>
                </li>
            </ul>

            <div><pre><code ng-bind-html="$ctrl.source"></code></pre><div>
        </div>
    </div>

</div>
 `,
        bindings: {
            files: '<',
            title: '<',
            section: '<',
            name: '<'
        },

        controller: [ '$http', '$timeout', '$sce', '$q', 'formPostData', function(
            $http: angular.IHttpService, 
            $timeout, 
            $sce: angular.ISCEService, 
            $q,
            formPostData
        ) {
            $http.defaults.cache = true;
            this.selectedTab = "code";
            this.$onInit = function() {
                this.selectedFile = this.files[0];
                this.resultUrl = `../documentation-main/js-example.php?section=${this.section}&example=${this.name}`;
                this.refreshSource();
            }

            this.getFileIconClass = function(file: string) {
                return 'fa-file-code-o';
            }

            this.refreshSource = function() {
                this.loadingSource = true;
                this.source = $sce.trustAsHtml("Loading...");

                const sourceUrl = this.getSourceUrl(this.selectedFile);

                $http.get(sourceUrl)
                .then((response: angular.IHttpResponse<{}>) => {
                    this.loadingSource = false;
                    const extension = this.selectedFile.match(/\.([a-z]+)$/)[1];
                    this.source = $sce.trustAsHtml(hljs.highlight(extension, <string> response.data).value);
                });
            }

            this.getSourceUrl = function(file:string) {
                if (file == this.files[0]) {
                    return this.resultUrl + "&preview=true";
                } else {
                    return [this.section, this.name, file].join('/');
                }
            }

            this.openPlunker = function(clickEvent) {
                $q.all(this.files.map( (file: any) => $http.get(this.getSourceUrl(file)) )).then( (files: any) => {

                    var postData: any = {
                        'tags[0]': "ag-grid",
                        'tags[1]': "example",
                        'private': true,
                        'description': this.title
                    };

                    files.forEach( (file:any, index: number) => {
                        postData['files[' + this.files[index] + ']'] = file.data;
                    });
                    

                    formPostData('http://plnkr.co/edit/?p=preview', true, postData);
                });
            }

        }]
    });
})();
