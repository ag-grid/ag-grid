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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverlayWrapperComponent = void 0;
var context_1 = require("../../context/context");
var component_1 = require("../../widgets/component");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var dom_1 = require("../../utils/dom");
var layoutFeature_1 = require("../../styling/layoutFeature");
var OverlayWrapperComponent = /** @class */ (function (_super) {
    __extends(OverlayWrapperComponent, _super);
    function OverlayWrapperComponent() {
        var _this = _super.call(this, OverlayWrapperComponent.TEMPLATE) || this;
        _this.inProgress = false;
        _this.destroyRequested = false;
        return _this;
    }
    OverlayWrapperComponent.prototype.updateLayoutClasses = function (cssClass, params) {
        var overlayWrapperClassList = this.eOverlayWrapper.classList;
        overlayWrapperClassList.toggle(layoutFeature_1.LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        overlayWrapperClassList.toggle(layoutFeature_1.LayoutCssClasses.NORMAL, params.normal);
        overlayWrapperClassList.toggle(layoutFeature_1.LayoutCssClasses.PRINT, params.print);
    };
    OverlayWrapperComponent.prototype.postConstruct = function () {
        this.createManagedBean(new layoutFeature_1.LayoutFeature(this));
        this.setDisplayed(false, { skipAriaHidden: true });
        this.overlayService.registerOverlayWrapperComp(this);
    };
    OverlayWrapperComponent.prototype.setWrapperTypeClass = function (overlayWrapperCssClass) {
        var overlayWrapperClassList = this.eOverlayWrapper.classList;
        if (this.activeOverlayWrapperCssClass) {
            overlayWrapperClassList.toggle(this.activeOverlayWrapperCssClass, false);
        }
        this.activeOverlayWrapperCssClass = overlayWrapperCssClass;
        overlayWrapperClassList.toggle(overlayWrapperCssClass, true);
    };
    OverlayWrapperComponent.prototype.showOverlay = function (overlayComp, overlayWrapperCssClass) {
        var _this = this;
        if (this.inProgress) {
            return;
        }
        this.setWrapperTypeClass(overlayWrapperCssClass);
        this.destroyActiveOverlay();
        this.inProgress = true;
        if (overlayComp) {
            overlayComp.then(function (comp) {
                _this.inProgress = false;
                _this.eOverlayWrapper.appendChild(comp.getGui());
                _this.activeOverlay = comp;
                if (_this.destroyRequested) {
                    _this.destroyRequested = false;
                    _this.destroyActiveOverlay();
                }
            });
        }
        this.setDisplayed(true, { skipAriaHidden: true });
    };
    OverlayWrapperComponent.prototype.destroyActiveOverlay = function () {
        if (this.inProgress) {
            this.destroyRequested = true;
            return;
        }
        if (!this.activeOverlay) {
            return;
        }
        this.activeOverlay = this.getContext().destroyBean(this.activeOverlay);
        (0, dom_1.clearElement)(this.eOverlayWrapper);
    };
    OverlayWrapperComponent.prototype.hideOverlay = function () {
        this.destroyActiveOverlay();
        this.setDisplayed(false, { skipAriaHidden: true });
    };
    OverlayWrapperComponent.prototype.destroy = function () {
        this.destroyActiveOverlay();
        _super.prototype.destroy.call(this);
    };
    // wrapping in outer div, and wrapper, is needed to center the loading icon
    OverlayWrapperComponent.TEMPLATE = "\n        <div class=\"ag-overlay\" aria-hidden=\"true\">\n            <div class=\"ag-overlay-panel\">\n                <div class=\"ag-overlay-wrapper\" ref=\"eOverlayWrapper\"></div>\n            </div>\n        </div>";
    __decorate([
        (0, context_1.Autowired)('overlayService')
    ], OverlayWrapperComponent.prototype, "overlayService", void 0);
    __decorate([
        (0, componentAnnotations_1.RefSelector)('eOverlayWrapper')
    ], OverlayWrapperComponent.prototype, "eOverlayWrapper", void 0);
    __decorate([
        context_1.PostConstruct
    ], OverlayWrapperComponent.prototype, "postConstruct", null);
    return OverlayWrapperComponent;
}(component_1.Component));
exports.OverlayWrapperComponent = OverlayWrapperComponent;
