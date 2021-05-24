/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
import { Component } from "../widgets/component";
import { RefSelector } from "../widgets/componentAnnotations";
import { PostConstruct } from "../context/context";
import { FakeHorizontalScrollController } from "./fakeHorizontalScrollController";
import { addOrRemoveCssClass, setFixedHeight, setFixedWidth } from "../utils/dom";
import { CenterWidthFeature } from "./centerWidthFeature";
var FakeHorizontalScrollComp = /** @class */ (function (_super) {
    __extends(FakeHorizontalScrollComp, _super);
    function FakeHorizontalScrollComp() {
        return _super.call(this, FakeHorizontalScrollComp.TEMPLATE) || this;
    }
    FakeHorizontalScrollComp.prototype.postConstruct = function () {
        var _this = this;
        var view = {
            setHeight: function (height) { return setFixedHeight(_this.getGui(), height); },
            setContainerHeight: function (height) { return setFixedHeight(_this.eContainer, height); },
            setViewportHeight: function (height) { return setFixedHeight(_this.eViewport, height); },
            setRightSpacerFixedWidth: function (width) { return setFixedWidth(_this.eRightSpacer, width); },
            setLeftSpacerFixedWidth: function (width) { return setFixedWidth(_this.eLeftSpacer, width); },
            setInvisibleStyles: function (isInvisible) { return addOrRemoveCssClass(_this.getGui(), 'ag-invisible-scrollbar', isInvisible); },
            includeLeftSpacerScrollerCss: function (cssClass, include) {
                return addOrRemoveCssClass(_this.eLeftSpacer, cssClass, include);
            },
            includeRightSpacerScrollerCss: function (cssClass, include) {
                return addOrRemoveCssClass(_this.eRightSpacer, cssClass, include);
            },
        };
        this.controller = this.createManagedBean(new FakeHorizontalScrollController());
        this.controller.setView(view, this.eViewport, this.eContainer);
        this.createManagedBean(new CenterWidthFeature(function (width) { return _this.eContainer.style.width = width + "px"; }));
    };
    FakeHorizontalScrollComp.TEMPLATE = "<div class=\"ag-body-horizontal-scroll\" aria-hidden=\"true\">\n            <div class=\"ag-horizontal-left-spacer\" ref=\"eLeftSpacer\"></div>\n            <div class=\"ag-body-horizontal-scroll-viewport\" ref=\"eViewport\">\n                <div class=\"ag-body-horizontal-scroll-container\" ref=\"eContainer\"></div>\n            </div>\n            <div class=\"ag-horizontal-right-spacer\" ref=\"eRightSpacer\"></div>\n        </div>";
    __decorate([
        RefSelector('eLeftSpacer')
    ], FakeHorizontalScrollComp.prototype, "eLeftSpacer", void 0);
    __decorate([
        RefSelector('eRightSpacer')
    ], FakeHorizontalScrollComp.prototype, "eRightSpacer", void 0);
    __decorate([
        RefSelector('eViewport')
    ], FakeHorizontalScrollComp.prototype, "eViewport", void 0);
    __decorate([
        RefSelector('eContainer')
    ], FakeHorizontalScrollComp.prototype, "eContainer", void 0);
    __decorate([
        PostConstruct
    ], FakeHorizontalScrollComp.prototype, "postConstruct", null);
    return FakeHorizontalScrollComp;
}(Component));
export { FakeHorizontalScrollComp };
