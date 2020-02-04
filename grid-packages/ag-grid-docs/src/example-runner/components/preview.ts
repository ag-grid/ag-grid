/*
import * as angular from "angular";
// @ts-ignore
import * as jQuery from "jquery";

import {whenInViewPort} from "../lib/viewport";

const docs: angular.IModule = angular.module("documentation");

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
*/
