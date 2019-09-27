// ag-grid-enterprise v21.2.2
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var statusBarService_1 = require("./statusBarService");
var StatusBar = /** @class */ (function (_super) {
    __extends(StatusBar, _super);
    function StatusBar() {
        return _super.call(this, StatusBar.TEMPLATE) || this;
    }
    StatusBar.prototype.postConstruct = function () {
        if (this.gridOptions.statusBar && this.gridOptions.statusBar.statusPanels) {
            var leftStatusPanelComponents = this.gridOptions.statusBar.statusPanels
                .filter(function (componentConfig) { return componentConfig.align === 'left'; });
            this.createAndRenderComponents(leftStatusPanelComponents, this.eStatusBarLeft);
            var centerStatusPanelComponents = this.gridOptions.statusBar.statusPanels
                .filter(function (componentConfig) { return componentConfig.align === 'center'; });
            this.createAndRenderComponents(centerStatusPanelComponents, this.eStatusBarCenter);
            var rightStatusPanelComponents = this.gridOptions.statusBar.statusPanels
                .filter(function (componentConfig) { return (!componentConfig.align || componentConfig.align === 'right'); });
            this.createAndRenderComponents(rightStatusPanelComponents, this.eStatusBarRight);
        }
    };
    StatusBar.prototype.createAndRenderComponents = function (statusBarComponents, ePanelComponent) {
        var _this = this;
        var componentDetails = [];
        ag_grid_community_1._.forEach(statusBarComponents, function (componentConfig) {
            var params = {
                api: _this.gridOptionsWrapper.getApi(),
                columnApi: _this.gridOptionsWrapper.getColumnApi(),
                context: _this.gridOptionsWrapper.getContext()
            };
            var promise = _this.userComponentFactory.newStatusPanelComponent(componentConfig, params);
            componentDetails.push({
                // default to the component name if no key supplied
                key: componentConfig.key || componentConfig.statusPanel,
                promise: promise
            });
        });
        ag_grid_community_1.Promise.all(componentDetails.map(function (details) { return details.promise; }))
            .then(function () {
            ag_grid_community_1._.forEach(componentDetails, function (componentDetail) {
                componentDetail.promise.then(function (component) {
                    var destroyFunc = function () {
                        if (component.destroy) {
                            component.destroy();
                        }
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
    StatusBar.TEMPLATE = "<div class=\"ag-status-bar\">\n        <div ref=\"eStatusBarLeft\" class=\"ag-status-bar-left\"></div>\n        <div ref=\"eStatusBarCenter\" class=\"ag-status-bar-center\"></div>\n        <div ref=\"eStatusBarRight\" class=\"ag-status-bar-right\"></div>\n    </div>";
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], StatusBar.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptions'),
        __metadata("design:type", Object)
    ], StatusBar.prototype, "gridOptions", void 0);
    __decorate([
        ag_grid_community_1.Autowired('userComponentFactory'),
        __metadata("design:type", ag_grid_community_1.UserComponentFactory)
    ], StatusBar.prototype, "userComponentFactory", void 0);
    __decorate([
        ag_grid_community_1.Autowired('statusBarService'),
        __metadata("design:type", statusBarService_1.StatusBarService)
    ], StatusBar.prototype, "statusBarService", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eStatusBarLeft'),
        __metadata("design:type", HTMLElement)
    ], StatusBar.prototype, "eStatusBarLeft", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eStatusBarCenter'),
        __metadata("design:type", HTMLElement)
    ], StatusBar.prototype, "eStatusBarCenter", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eStatusBarRight'),
        __metadata("design:type", HTMLElement)
    ], StatusBar.prototype, "eStatusBarRight", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], StatusBar.prototype, "postConstruct", null);
    return StatusBar;
}(ag_grid_community_1.Component));
exports.StatusBar = StatusBar;
