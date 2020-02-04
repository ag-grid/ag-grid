import * as angular from "angular";

const docs: angular.IModule = angular.module("documentation");

docs.component("exampleTab", {
    template: `
    <li role="presentation" ng-class="{ active: $ctrl.currentValue == $ctrl.value }">
        <a role="tab" id="{{$ctrl.id}}" ref="{{$ctrl.id}}" data-boilerplate="{{$ctrl.boilerplate}}" data-context="" ng-click="$ctrl.doClick($event)" href="#" title="{{$ctrl.tooltip}}">
            <i ng-class="['fa', $ctrl.icon]" aria-hidden="true"></i> {{$ctrl.title}}
        </a>
    </li>
    `,
    bindings: {
        icon: "<",
        title: "<",
        id: "<",
        tooltip: "<",
        value: "<",
        currentValue: "<",
        onClick: "&",
        boilerplate: "<"
    },
    controller: function () {
        this.doClick = function (event: any) {
            this.onClick({$event: event});
            event.preventDefault();
        };
    }
});
