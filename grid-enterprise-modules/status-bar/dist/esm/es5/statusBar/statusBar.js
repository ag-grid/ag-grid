var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzQmFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N0YXR1c0Jhci9zdGF0dXNCYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFDVCxTQUFTLEVBRVQsYUFBYSxFQUNiLFNBQVMsRUFDVCxXQUFXLEVBSWQsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQztJQUErQiw2QkFBUztJQWdCcEM7ZUFDSSxrQkFBTSxTQUFTLENBQUMsUUFBUSxDQUFDO0lBQzdCLENBQUM7SUFHTyxpQ0FBYSxHQUFyQjs7UUFDSSxJQUFNLFlBQVksR0FBRyxNQUFBLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLDBDQUFFLFlBQVksQ0FBQztRQUM1RSxJQUFJLFlBQVksRUFBRTtZQUNkLElBQU0seUJBQXlCLEdBQUcsWUFBWTtpQkFDekMsTUFBTSxDQUFDLFVBQUMsZUFBZSxJQUFLLE9BQUEsZUFBZSxDQUFDLEtBQUssS0FBSyxNQUFNLEVBQWhDLENBQWdDLENBQUMsQ0FBQztZQUNuRSxJQUFJLENBQUMseUJBQXlCLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRS9FLElBQU0sMkJBQTJCLEdBQUcsWUFBWTtpQkFDM0MsTUFBTSxDQUFDLFVBQUMsZUFBZSxJQUFLLE9BQUEsZUFBZSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQWxDLENBQWtDLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMseUJBQXlCLENBQUMsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFbkYsSUFBTSwwQkFBMEIsR0FBRyxZQUFZO2lCQUMxQyxNQUFNLENBQUMsVUFBQyxlQUFlLElBQUssT0FBQSxDQUFDLENBQUMsZUFBZSxDQUFDLEtBQUssSUFBSSxlQUFlLENBQUMsS0FBSyxLQUFLLE9BQU8sQ0FBQyxF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