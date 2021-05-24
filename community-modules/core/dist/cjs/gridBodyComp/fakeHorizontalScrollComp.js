/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
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
var fakeHorizontalScrollController_1 = require("./fakeHorizontalScrollController");
var dom_1 = require("../utils/dom");
var centerWidthFeature_1 = require("./centerWidthFeature");
var FakeHorizontalScrollComp = /** @class */ (function (_super) {
    __extends(FakeHorizontalScrollComp, _super);
    function FakeHorizontalScrollComp() {
        return _super.call(this, FakeHorizontalScrollComp.TEMPLATE) || this;
    }
    FakeHorizontalScrollComp.prototype.postConstruct = function () {
        var _this = this;
        var view = {
            setHeight: function (height) { return dom_1.setFixedHeight(_this.getGui(), height); },
            setContainerHeight: function (height) { return dom_1.setFixedHeight(_this.eContainer, height); },
            setViewportHeight: function (height) { return dom_1.setFixedHeight(_this.eViewport, height); },
            setRightSpacerFixedWidth: function (width) { return dom_1.setFixedWidth(_this.eRightSpacer, width); },
            setLeftSpacerFixedWidth: function (width) { return dom_1.setFixedWidth(_this.eLeftSpacer, width); },
            setInvisibleStyles: function (isInvisible) { return dom_1.addOrRemoveCssClass(_this.getGui(), 'ag-invisible-scrollbar', isInvisible); },
            includeLeftSpacerScrollerCss: function (cssClass, include) {
                return dom_1.addOrRemoveCssClass(_this.eLeftSpacer, cssClass, include);
            },
            includeRightSpacerScrollerCss: function (cssClass, include) {
                return dom_1.addOrRemoveCssClass(_this.eRightSpacer, cssClass, include);
            },
        };
        this.controller = this.createManagedBean(new fakeHorizontalScrollController_1.FakeHorizontalScrollController());
        this.controller.setView(view, this.eViewport, this.eContainer);
        this.createManagedBean(new centerWidthFeature_1.CenterWidthFeature(function (width) { return _this.eContainer.style.width = width + "px"; }));
    };
    FakeHorizontalScrollComp.TEMPLATE = "<div class=\"ag-body-horizontal-scroll\" aria-hidden=\"true\">\n            <div class=\"ag-horizontal-left-spacer\" ref=\"eLeftSpacer\"></div>\n            <div class=\"ag-body-horizontal-scroll-viewport\" ref=\"eViewport\">\n                <div class=\"ag-body-horizontal-scroll-container\" ref=\"eContainer\"></div>\n            </div>\n            <div class=\"ag-horizontal-right-spacer\" ref=\"eRightSpacer\"></div>\n        </div>";
    __decorate([
        componentAnnotations_1.RefSelector('eLeftSpacer')
    ], FakeHorizontalScrollComp.prototype, "eLeftSpacer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eRightSpacer')
    ], FakeHorizontalScrollComp.prototype, "eRightSpacer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eViewport')
    ], FakeHorizontalScrollComp.prototype, "eViewport", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eContainer')
    ], FakeHorizontalScrollComp.prototype, "eContainer", void 0);
    __decorate([
        context_1.PostConstruct
    ], FakeHorizontalScrollComp.prototype, "postConstruct", null);
    return FakeHorizontalScrollComp;
}(component_1.Component));
exports.FakeHorizontalScrollComp = FakeHorizontalScrollComp;

//# sourceMappingURL=fakeHorizontalScrollComp.js.map
