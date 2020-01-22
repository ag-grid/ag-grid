import * as angular from "angular";
import * as jQuery from "jquery";

import { trackIfInViewPort, whenInViewPort } from "./lib/viewport";

const docs: angular.IModule = angular.module("documentation");

// taken from https://github.com/angular/angular.js/blob/489835dd0b36a108bedd5ded439a186aca4fa739/docs/app/src/examples.js#L53
docs.factory("formPostData", [
    "$document",
    function($document: any) {
        return function(url: any, newWindow: any, fields: any) {
            /*
             * If the form posts to target="_blank", pop-up blockers can cause it not to work.
             * If a user chooses to bypass pop-up blocker one time and click the link, they will arrive at
             * a new default plnkr, not a plnkr with the desired template.  Given this undesired behavior,
             * some may still want to open the plnk in a new window by opting-in via ctrl+click.  The
             * newWindow param allows for this possibility.
             */
            const target = newWindow ? "_blank" : "_self";
            const form: any = angular.element(`<form style="display: none;" method="post" action="${url}" target="${target}"></form>`);

            angular.forEach(fields, (value, name) => {
                const input = angular.element(`<input type="hidden" name="${name}">`);
                input.attr("value", value);
                form.append(input);
            });

            $document.find("body").append(form);
            form[0].submit();
            form.remove();
        };
    }
]);

class ReactRunner {
    private ready: boolean = false;
    private showFrameworksDropdown: boolean;
    private resultUrl: string;
    private id: string;
    private title: string;
    private section: string;
    private name: string;
    private currentType: string;
    private noPlunker: boolean;
    private boilerplatePath: string;

    private titles: { [key: string]: string; };

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
        private formPostData: any,
        private $element: Element,
        private $cookies: angular.cookies.ICookiesService
    ) {
        $http.defaults.cache = true;
    }

    private availableTypes: string[];

    private openFwDropdown: boolean = false;
    private visible: boolean = false;

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
            this.iframeStyle.height = isNaN(options.exampleHeight) ? options.exampleHeight : options.exampleHeight + "px";
        }

        this.id = this.config.app.id;
        this.title = this.config.title;
        this.name = this.config.name;
        this.section = this.config.section;
        this.showFrameworksDropdown = options.frameworks || false;
        this.availableTypes = options.onlyShow ? [options.onlyShow.toLowerCase()] : this.config.types;

        this.titles = {
            vanilla: "JavaScript",
            react: "React",
            angular: "Angular",
            vue: 'Vue'
        };

        const divWrapper = jQuery(this.$element).find("div.example-wrapper");

        this.$timeout(() => {
            trackIfInViewPort(divWrapper, (visible: any) => {
                this.$timeout(() => {
                    if (visible && !this.visible) {
                        this.visible = true;
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
        const typeConfig = this.config.app;

        this.boilerplatePath = typeConfig.boilerplatePath;
        this.resultUrl = typeConfig.resultUrl;
        this.currentType = type;
        this.noPlunker = this.config.options.noPlunker;
        this.openFwDropdown = false;
    }

    openPlunker($event) {
        const context = JSON.parse($event.target.getAttribute('data-context'));

        const postData: any = {
            "tags[0]": "ag-grid",
            "tags[1]": "example",
            "tags[2]": "ag-charts",
            private: true,
            description: this.title || 'React example',
        };

        if (context.files) {
            Object.keys(context.files).forEach(file => {
                postData[`files[${file}]`] = context.files[file];
            });
        }

        this.formPostData("//plnkr.co/edit/?p=preview", true, postData);
    }

    typeTitle(title: string) {
        return this.titles[title];
    }
}

ReactRunner.$inject = ["$http", "$timeout", "$sce", "$q", "formPostData", "$element", "$cookies"];


docs.component("reactRunner", {
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

                <span ng-class="[ 'runner-item-' + $ctrl.currentType, 'runner-item' ]" data-current-framework="{{$ctrl.currentType}}" data-framework-dropdown="{{$ctrl.id}}">{{$ctrl.typeTitle($ctrl.currentType)}} </span>
                <span class="caret"></span>
            </button>

            <ul class="dropdown-menu">
                <li ng-repeat="type in $ctrl.availableTypes">
                    <a href="#" ng-click="$ctrl.setAndPersistType(type); $event.preventDefault();"
                       ng-class="['runner-item', 'runner-item-' + type ]" data-framework-item="{{$ctrl.id}}">{{$ctrl.typeTitle(type)}}</a>
                </li>
            </ul>
        </div>
    </div>

    <div class="example-wrapper">
        <ul role="tablist" class="ghost">
            <li class="title">
                <a href="#example-{{$ctrl.name}}" title="link to {{$ctrl.title}}" id="example-{{$ctrl.name}}">
                    <i class="fa fa-link" aria-hidden="true"></i>{{$ctrl.title}}
                </a>
            </li>


            <example-tab
                    ng-hide="$ctrl.noPlunker"
                    value="'plunker'"
                    title="'Plunker'"
                    tooltip="'Open Example in Plunker'"
                    id="$ctrl.id"
                    icon="'fa-external-link-alt'"
                    on-click="$ctrl.openPlunker($event);">
            </example-tab>
        </ul>

        <div class="loading-placeholder" ng-if="!$ctrl.ready" ng-style="$ctrl.iframeStyle">
            <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
        </div>

        <div class="tab-contents" ng-if="$ctrl.ready">
            <div role="tabpanel" class="result">
                <iframe ng-if="$ctrl.visible" ng-src="{{$ctrl.resultUrl}}" ng-style="$ctrl.iframeStyle" scrolling="no" seamless="true"></iframe>
                <div ng-show="!$ctrl.visible" class="iframe-placeholder" ng-style="$ctrl.iframeStyle">
                    <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                </div>
            </div>
        </div>
    </div>
</div>
    `,
    bindings: {
        config: "<"
    },

    controller: ReactRunner
});
