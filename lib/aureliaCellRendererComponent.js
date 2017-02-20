// ag-grid-aurelia v8.1.0
"use strict";
var AureliaCellRendererComponent = (function () {
    function AureliaCellRendererComponent() {
    }
    AureliaCellRendererComponent.prototype.init = function (params) {
        var bindingContext = { params: params };
        this.view = params.viewFactory.create(params.container);
        this.view.bind(bindingContext);
    };
    AureliaCellRendererComponent.prototype.getGui = function () {
        return this.view.fragment;
    };
    AureliaCellRendererComponent.prototype.destroy = function () {
        this.view.returnToCache();
    };
    return AureliaCellRendererComponent;
}());
exports.AureliaCellRendererComponent = AureliaCellRendererComponent;
