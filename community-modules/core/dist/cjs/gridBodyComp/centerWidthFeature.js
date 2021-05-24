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
var beanStub_1 = require("../context/beanStub");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var constants_1 = require("../constants/constants");
var eventKeys_1 = require("../eventKeys");
var CenterWidthFeature = /** @class */ (function (_super) {
    __extends(CenterWidthFeature, _super);
    function CenterWidthFeature(callback) {
        var _this = _super.call(this) || this;
        _this.callback = callback;
        return _this;
    }
    CenterWidthFeature.prototype.postConstruct = function () {
        var listener = this.setWidth.bind(this);
        this.addManagedListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_DOM_LAYOUT, listener);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, listener);
        this.setWidth();
    };
    CenterWidthFeature.prototype.setWidth = function () {
        var columnController = this.columnController;
        var printLayout = this.gridOptionsWrapper.getDomLayout() === constants_1.Constants.DOM_LAYOUT_PRINT;
        var centerWidth = columnController.getBodyContainerWidth();
        var leftWidth = columnController.getDisplayedColumnsLeftWidth();
        var rightWidth = columnController.getDisplayedColumnsRightWidth();
        var totalWidth = printLayout ? centerWidth + leftWidth + rightWidth : centerWidth;
        this.callback(totalWidth);
    };
    __decorate([
        context_1.Autowired('columnController')
    ], CenterWidthFeature.prototype, "columnController", void 0);
    __decorate([
        context_1.PostConstruct
    ], CenterWidthFeature.prototype, "postConstruct", null);
    return CenterWidthFeature;
}(beanStub_1.BeanStub));
exports.CenterWidthFeature = CenterWidthFeature;

//# sourceMappingURL=centerWidthFeature.js.map
