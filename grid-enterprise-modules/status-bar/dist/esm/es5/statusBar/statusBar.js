var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, AgPromise, RefSelector } from '@ag-grid-community/core';
var StatusBar = /** @class */ (function (_super) {
    __extends(StatusBar, _super);
    function StatusBar() {
        return _super.call(this, StatusBar.TEMPLATE) || this;
    }
    StatusBar.prototype.postConstruct = function () {
        var _a;
        var statusPanels = (_a = this.gridOptionsService.get('statusBar')) === null || _a === void 0 ? void 0 : _a.statusPanels;
        if (statusPanels) {
            var leftStatusPanelComponents = statusPanels
                .filter(function (componentConfig) { return componentConfig.align === 'left'; });
            this.createAndRenderComponents(leftStatusPanelComponents, this.eStatusBarLeft);
            var centerStatusPanelComponents = statusPanels
                .filter(function (componentConfig) { return componentConfig.align === 'center'; });
            this.createAndRenderComponents(centerStatusPanelComponents, this.eStatusBarCenter);
            var rightStatusPanelComponents = statusPanels
                .filter(function (componentConfig) { return (!componentConfig.align || componentConfig.align === 'right'); });
            this.createAndRenderComponents(rightStatusPanelComponents, this.eStatusBarRight);
        }
        else {
            this.setDisplayed(false);
        }
    };
    StatusBar.prototype.createAndRenderComponents = function (statusBarComponents, ePanelComponent) {
        var _this = this;
        var componentDetails = [];
        statusBarComponents.forEach(function (componentConfig) {
            var params = {};
            var compDetails = _this.userComponentFactory.getStatusPanelCompDetails(componentConfig, params);
            var promise = compDetails.newAgStackInstance();
            if (!promise) {
                return;
            }
            componentDetails.push({
                // default to the component name if no key supplied
                key: componentConfig.key || componentConfig.statusPanel,
                promise: promise
            });
        });
        AgPromise.all(componentDetails.map(function (details) { return details.promise; }))
            .then(function () {
            componentDetails.forEach(function (componentDetail) {
                componentDetail.promise.then(function (component) {
                    var destroyFunc = function () {
                        _this.getContext().destroyBean(component);
                    };
                    if (_this.isAlive()) {
                        _this.statusBarService.registerStatusPanel(componentDetail.key, component);
                        ePanelComponent.appendChild(component.getGui());
                        _this.addDestroyFunc(destroyFunc);
                    }
                    else {
                        destroyFunc();
                    }
                });
            });
        });
    };
    StatusBar.TEMPLATE = "<div class=\"ag-status-bar\">\n            <div ref=\"eStatusBarLeft\" class=\"ag-status-bar-left\" role=\"status\"></div>\n            <div ref=\"eStatusBarCenter\" class=\"ag-status-bar-center\" role=\"status\"></div>\n            <div ref=\"eStatusBarRight\" class=\"ag-status-bar-right\" role=\"status\"></div>\n        </div>";
    __decorate([
        Autowired('userComponentFactory')
    ], StatusBar.prototype, "userComponentFactory", void 0);
    __decorate([
        Autowired('statusBarService')
    ], StatusBar.prototype, "statusBarService", void 0);
    __decorate([
        RefSelector('eStatusBarLeft')
    ], StatusBar.prototype, "eStatusBarLeft", void 0);
    __decorate([
        RefSelector('eStatusBarCenter')
    ], StatusBar.prototype, "eStatusBarCenter", void 0);
    __decorate([
        RefSelector('eStatusBarRight')
    ], StatusBar.prototype, "eStatusBarRight", void 0);
    __decorate([
        PostConstruct
    ], StatusBar.prototype, "postConstruct", null);
    return StatusBar;
}(Component));
export { StatusBar };
