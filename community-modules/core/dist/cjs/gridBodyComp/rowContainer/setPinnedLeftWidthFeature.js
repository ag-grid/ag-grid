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
var beanStub_1 = require("../../context/beanStub");
var context_1 = require("../../context/context");
var eventKeys_1 = require("../../eventKeys");
var dom_1 = require("../../utils/dom");
var SetPinnedLeftWidthFeature = /** @class */ (function (_super) {
    __extends(SetPinnedLeftWidthFeature, _super);
    function SetPinnedLeftWidthFeature(element) {
        var _this = _super.call(this) || this;
        _this.element = element;
        return _this;
    }
    SetPinnedLeftWidthFeature.prototype.postConstruct = function () {
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_LEFT_PINNED_WIDTH_CHANGED, this.onPinnedLeftWidthChanged.bind(this));
    };
    SetPinnedLeftWidthFeature.prototype.onPinnedLeftWidthChanged = function () {
        var leftWidth = this.pinnedWidthService.getPinnedLeftWidth();
        var displayed = leftWidth > 0;
        dom_1.setDisplayed(this.element, displayed);
        if (displayed) {
            dom_1.setFixedWidth(this.element, leftWidth);
        }
    };
    __decorate([
        context_1.Autowired('pinnedWidthService')
    ], SetPinnedLeftWidthFeature.prototype, "pinnedWidthService", void 0);
    __decorate([
        context_1.PostConstruct
    ], SetPinnedLeftWidthFeature.prototype, "postConstruct", null);
    return SetPinnedLeftWidthFeature;
}(beanStub_1.BeanStub));
exports.SetPinnedLeftWidthFeature = SetPinnedLeftWidthFeature;

//# sourceMappingURL=setPinnedLeftWidthFeature.js.map
