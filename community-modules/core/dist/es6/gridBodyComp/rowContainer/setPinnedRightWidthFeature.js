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
import { Autowired, PostConstruct } from "../../context/context";
import { Events } from "../../eventKeys";
import { setDisplayed, setFixedWidth } from "../../utils/dom";
import { BeanStub } from "../../context/beanStub";
var SetPinnedRightWidthFeature = /** @class */ (function (_super) {
    __extends(SetPinnedRightWidthFeature, _super);
    function SetPinnedRightWidthFeature(element) {
        var _this = _super.call(this) || this;
        _this.element = element;
        return _this;
    }
    SetPinnedRightWidthFeature.prototype.postConstruct = function () {
        this.addManagedListener(this.eventService, Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED, this.onPinnedRightWidthChanged.bind(this));
    };
    SetPinnedRightWidthFeature.prototype.onPinnedRightWidthChanged = function () {
        var rightWidth = this.pinnedWidthService.getPinnedRightWidth();
        var displayed = rightWidth > 0;
        setDisplayed(this.element, displayed);
        if (displayed) {
            setFixedWidth(this.element, rightWidth);
        }
    };
    __decorate([
        Autowired('pinnedWidthService')
    ], SetPinnedRightWidthFeature.prototype, "pinnedWidthService", void 0);
    __decorate([
        PostConstruct
    ], SetPinnedRightWidthFeature.prototype, "postConstruct", null);
    return SetPinnedRightWidthFeature;
}(BeanStub));
export { SetPinnedRightWidthFeature };
