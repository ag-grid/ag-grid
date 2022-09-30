/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../widgets/component");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var context_1 = require("../context/context");
var fakeHScrollCtrl_1 = require("./fakeHScrollCtrl");
var dom_1 = require("../utils/dom");
var centerWidthFeature_1 = require("./centerWidthFeature");
var FakeHScrollComp = /** @class */ (function (_super) {
    __extends(FakeHScrollComp, _super);
    function FakeHScrollComp() {
        return _super.call(this, FakeHScrollComp.TEMPLATE) || this;
    }
    FakeHScrollComp.prototype.postConstruct = function () {
        var _this = this;
        var compProxy = {
            addOrRemoveCssClass: function (cssClassName, on) { return _this.addOrRemoveCssClass(cssClassName, on); },
            setHeight: function (height) { return dom_1.setFixedHeight(_this.getGui(), height); },
            setBottom: function (bottom) { return _this.getGui().style.bottom = bottom + "px"; },
            setContainerHeight: function (height) { return dom_1.setFixedHeight(_this.eContainer, height); },
            setViewportHeight: function (height) { return dom_1.setFixedHeight(_this.eViewport, height); },
            setRightSpacerFixedWidth: function (width) { return dom_1.setFixedWidth(_this.eRightSpacer, width); },
            setLeftSpacerFixedWidth: function (width) { return dom_1.setFixedWidth(_this.eLeftSpacer, width); },
            includeLeftSpacerScrollerCss: function (cssClass, include) {
                return _this.eLeftSpacer.classList.toggle(cssClass, include);
            },
            includeRightSpacerScrollerCss: function (cssClass, include) {
                return _this.eRightSpacer.classList.toggle(cssClass, include);
            },
        };
        var ctrl = this.createManagedBean(new fakeHScrollCtrl_1.FakeHScrollCtrl());
        ctrl.setComp(compProxy, this.getGui(), this.eViewport, this.eContainer);
        this.createManagedBean(new centerWidthFeature_1.CenterWidthFeature(function (width) { return _this.eContainer.style.width = width + "px"; }));
    };
    FakeHScrollComp.TEMPLATE = "<div class=\"ag-body-horizontal-scroll\" aria-hidden=\"true\">\n            <div class=\"ag-horizontal-left-spacer\" ref=\"eLeftSpacer\"></div>\n            <div class=\"ag-body-horizontal-scroll-viewport\" ref=\"eViewport\">\n                <div class=\"ag-body-horizontal-scroll-container\" ref=\"eContainer\"></div>\n            </div>\n            <div class=\"ag-horizontal-right-spacer\" ref=\"eRightSpacer\"></div>\n        </div>";
    __decorate([
        componentAnnotations_1.RefSelector('eLeftSpacer')
    ], FakeHScrollComp.prototype, "eLeftSpacer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eRightSpacer')
    ], FakeHScrollComp.prototype, "eRightSpacer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eViewport')
    ], FakeHScrollComp.prototype, "eViewport", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eContainer')
    ], FakeHScrollComp.prototype, "eContainer", void 0);
    __decorate([
        context_1.PostConstruct
    ], FakeHScrollComp.prototype, "postConstruct", null);
    return FakeHScrollComp;
}(component_1.Component));
exports.FakeHScrollComp = FakeHScrollComp;
