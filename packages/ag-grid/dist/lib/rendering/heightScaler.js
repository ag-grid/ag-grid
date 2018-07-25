/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var beanStub_1 = require("../context/beanStub");
var context_1 = require("../context/context");
var eventService_1 = require("../eventService");
var eventKeys_1 = require("../eventKeys");
var utils_1 = require("../utils");
/**
 * This class solves the 'max height' problem, where the user might want to show more data than
 * the max div height actually allows.
 */
var HeightScaler = (function (_super) {
    __extends(HeightScaler, _super);
    function HeightScaler() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // the scrollY position
        _this.scrollY = 0;
        // how tall the body is
        _this.uiBodyHeight = 0;
        return _this;
    }
    HeightScaler.prototype.postConstruct = function () {
        this.addDestroyableEventListener(this.eventService, eventKeys_1.Events.EVENT_BODY_HEIGHT_CHANGED, this.update.bind(this));
        this.scrollBarWidth = utils_1._.getScrollbarWidth();
        this.maxDivHeight = utils_1._.getMaxDivHeight();
    };
    HeightScaler.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
    };
    HeightScaler.prototype.isScaling = function () {
        return this.scaling;
    };
    HeightScaler.prototype.getOffset = function () {
        return this.offset;
    };
    HeightScaler.prototype.update = function () {
        if (!this.scaling) {
            return;
        }
        var newScrollY = this.gridPanel.getVScrollPosition().top;
        var newBodyHeight = this.getUiBodyHeight();
        var atLeastOneChanged = newScrollY !== this.scrollY || newBodyHeight !== this.uiBodyHeight;
        if (atLeastOneChanged) {
            this.scrollY = newScrollY;
            this.uiBodyHeight = newBodyHeight;
            this.calculateOffset();
        }
    };
    HeightScaler.prototype.calculateOffset = function () {
        this.uiContainerHeight = this.maxDivHeight;
        this.pixelsToShave = this.modelHeight - this.uiContainerHeight;
        this.maxScrollY = this.uiContainerHeight - this.uiBodyHeight;
        var scrollPercent = this.scrollY / this.maxScrollY;
        this.setOffset(scrollPercent * this.pixelsToShave);
    };
    HeightScaler.prototype.clearOffset = function () {
        this.uiContainerHeight = this.modelHeight;
        this.pixelsToShave = 0;
        this.setOffset(0);
    };
    HeightScaler.prototype.setOffset = function (newOffset) {
        // because we are talking pixels, no point in confusing things with half numbers
        var newOffsetFloor = typeof newOffset === 'number' ? Math.floor(newOffset) : null;
        if (this.offset !== newOffsetFloor) {
            this.offset = newOffsetFloor;
            this.eventService.dispatchEvent({ type: eventKeys_1.Events.EVENT_HEIGHT_SCALE_CHANGED });
        }
    };
    HeightScaler.prototype.setModelHeight = function (modelHeight) {
        this.modelHeight = modelHeight;
        this.scaling = this.maxDivHeight > 0 && modelHeight > this.maxDivHeight;
        if (this.scaling) {
            this.calculateOffset();
        }
        else {
            this.clearOffset();
        }
    };
    HeightScaler.prototype.getUiContainerHeight = function () {
        return this.uiContainerHeight;
    };
    HeightScaler.prototype.getRealPixelPosition = function (modelPixel) {
        var uiPixel = modelPixel - this.offset;
        return uiPixel;
    };
    HeightScaler.prototype.getUiBodyHeight = function () {
        var pos = this.gridPanel.getVScrollPosition();
        var bodyHeight = pos.bottom - pos.top;
        if (this.gridPanel.isHorizontalScrollShowing()) {
            bodyHeight -= this.scrollBarWidth;
        }
        return bodyHeight;
    };
    HeightScaler.prototype.getScrollPositionForPixel = function (rowTop) {
        if (this.pixelsToShave <= 0) {
            return rowTop;
        }
        else {
            var modelMaxScroll = this.modelHeight - this.getUiBodyHeight();
            var scrollPercent = rowTop / modelMaxScroll;
            var scrollPixel = this.maxScrollY * scrollPercent;
            return scrollPixel;
        }
    };
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], HeightScaler.prototype, "eventService", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], HeightScaler.prototype, "postConstruct", null);
    HeightScaler = __decorate([
        context_1.Bean('heightScaler')
    ], HeightScaler);
    return HeightScaler;
}(beanStub_1.BeanStub));
exports.HeightScaler = HeightScaler;
