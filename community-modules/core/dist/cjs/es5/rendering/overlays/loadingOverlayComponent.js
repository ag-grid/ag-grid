/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
        var _a;
        var template = (_a = this.gridOptionsService.get('overlayLoadingTemplate')) !== null && _a !== void 0 ? _a : LoadingOverlayComponent.DEFAULT_LOADING_OVERLAY_TEMPLATE;
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var localisedTemplate = template.replace('[LOADING...]', localeTextFunc('loadingOoo', 'Loading...'));
        this.setTemplate(localisedTemplate);
    };
    LoadingOverlayComponent.DEFAULT_LOADING_OVERLAY_TEMPLATE = '<span class="ag-overlay-loading-center">[LOADING...]</span>';
    return LoadingOverlayComponent;
}(component_1.Component));
exports.LoadingOverlayComponent = LoadingOverlayComponent;
