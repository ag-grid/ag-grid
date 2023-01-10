/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
import { PostConstruct } from "../context/context";
import { AbstractFakeScrollComp } from "./abstractFakeScrollComp";
import { setFixedWidth } from "../utils/dom";
import { SetHeightFeature } from "./rowContainer/setHeightFeature";
var FakeVScrollComp = /** @class */ (function (_super) {
    __extends(FakeVScrollComp, _super);
    function FakeVScrollComp() {
        return _super.call(this, FakeVScrollComp.TEMPLATE, 'vertical') || this;
    }
    FakeVScrollComp.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        this.createManagedBean(new SetHeightFeature(this.eContainer));
        this.ctrlsService.registerFakeVScrollComp(this);
    };
    FakeVScrollComp.prototype.setScrollVisible = function () {
        var vScrollShowing = this.scrollVisibleService.isVerticalScrollShowing();
        var invisibleScrollbar = this.invisibleScrollbar;
        var scrollbarWidth = vScrollShowing ? (this.gridOptionsService.getScrollbarWidth() || 0) : 0;
        var adjustedScrollbarWidth = (scrollbarWidth === 0 && invisibleScrollbar) ? 16 : scrollbarWidth;
        this.addOrRemoveCssClass('ag-scrollbar-invisible', invisibleScrollbar);
        setFixedWidth(this.getGui(), adjustedScrollbarWidth);
        setFixedWidth(this.eViewport, adjustedScrollbarWidth);
        setFixedWidth(this.eContainer, adjustedScrollbarWidth);
        this.setDisplayed(vScrollShowing, { skipAriaHidden: true });
    };
    FakeVScrollComp.TEMPLATE = "<div class=\"ag-body-vertical-scroll\" aria-hidden=\"true\">\n            <div class=\"ag-body-vertical-scroll-viewport\" ref=\"eViewport\">\n                <div class=\"ag-body-vertical-scroll-container\" ref=\"eContainer\"></div>\n            </div>\n        </div>";
    __decorate([
        PostConstruct
    ], FakeVScrollComp.prototype, "postConstruct", null);
    return FakeVScrollComp;
}(AbstractFakeScrollComp));
export { FakeVScrollComp };
