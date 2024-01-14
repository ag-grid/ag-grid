"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingOverlayComponent = void 0;
var component_1 = require("../../widgets/component");
var LoadingOverlayComponent = /** @class */ (function (_super) {
    __extends(LoadingOverlayComponent, _super);
    function LoadingOverlayComponent() {
        return _super.call(this) || this;
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    LoadingOverlayComponent.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    LoadingOverlayComponent.prototype.init = function (params) {
        var _this = this;
        var customTemplate = this.gridOptionsService.get('overlayLoadingTemplate');
        this.setTemplate(customTemplate !== null && customTemplate !== void 0 ? customTemplate : LoadingOverlayComponent.DEFAULT_LOADING_OVERLAY_TEMPLATE);
        if (!customTemplate) {
            var localeTextFunc_1 = this.localeService.getLocaleTextFunc();
            // setTimeout is used because some screen readers only announce `aria-live` text when
            // there is a "text change", so we force a change from empty.
            setTimeout(function () {
                _this.getGui().innerText = localeTextFunc_1('loadingOoo', 'Loading...');
            });
        }
    };
    LoadingOverlayComponent.DEFAULT_LOADING_OVERLAY_TEMPLATE = "<span aria-live=\"polite\" aria-atomic=\"true\" class=\"ag-overlay-loading-center\"></span>";
    return LoadingOverlayComponent;
}(component_1.Component));
exports.LoadingOverlayComponent = LoadingOverlayComponent;
