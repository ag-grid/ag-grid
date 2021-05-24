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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, PostConstruct, Qualifier } from "../context/context";
import { Events } from "../eventKeys";
import { getMaxDivHeight } from "../utils/browser";
/**
 * This class solves the 'max height' problem, where the user might want to show more data than
 * the max div height actually allows.
 */
var RowContainerHeightService = /** @class */ (function (_super) {
    __extends(RowContainerHeightService, _super);
    function RowContainerHeightService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // the scrollY position
        _this.scrollY = 0;
        // how tall the body is
        _this.uiBodyHeight = 0;
        return _this;
    }
    RowContainerHeightService.prototype.agWire = function (loggerFactory) {
        this.logger = loggerFactory.create("RowContainerHeightService");
    };
    RowContainerHeightService.prototype.postConstruct = function () {
        this.addManagedListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, this.updateOffset.bind(this));
        this.maxDivHeight = getMaxDivHeight();
        this.logger.log('maxDivHeight = ' + this.maxDivHeight);
    };
    RowContainerHeightService.prototype.isStretching = function () {
        return this.stretching;
    };
    RowContainerHeightService.prototype.getDivStretchOffset = function () {
        return this.divStretchOffset;
    };
    RowContainerHeightService.prototype.updateOffset = function () {
        if (!this.stretching) {
            return;
        }
        var gridBodyCon = this.controllersService.getGridBodyController();
        var newScrollY = gridBodyCon.getScrollFeature().getVScrollPosition().top;
        var newBodyHeight = this.getUiBodyHeight();
        var atLeastOneChanged = newScrollY !== this.scrollY || newBodyHeight !== this.uiBodyHeight;
        if (atLeastOneChanged) {
            this.scrollY = newScrollY;
            this.uiBodyHeight = newBodyHeight;
            this.calculateOffset();
        }
    };
    RowContainerHeightService.prototype.calculateOffset = function () {
        this.setUiContainerHeight(this.maxDivHeight);
        this.pixelsToShave = this.modelHeight - this.uiContainerHeight;
        this.maxScrollY = this.uiContainerHeight - this.uiBodyHeight;
        var scrollPercent = this.scrollY / this.maxScrollY;
        var divStretchOffset = scrollPercent * this.pixelsToShave;
        this.logger.log("Div Stretch Offset = " + divStretchOffset + " (" + this.pixelsToShave + " * " + scrollPercent + ")");
        this.setDivStretchOffset(divStretchOffset);
    };
    RowContainerHeightService.prototype.setUiContainerHeight = function (height) {
        if (height !== this.uiContainerHeight) {
            this.uiContainerHeight = height;
            this.eventService.dispatchEvent({ type: Events.EVENT_ROW_CONTAINER_HEIGHT_CHANGED });
        }
    };
    RowContainerHeightService.prototype.clearOffset = function () {
        this.setUiContainerHeight(this.modelHeight);
        this.pixelsToShave = 0;
        this.setDivStretchOffset(0);
    };
    RowContainerHeightService.prototype.setDivStretchOffset = function (newOffset) {
        // because we are talking pixels, no point in confusing things with half numbers
        var newOffsetFloor = typeof newOffset === 'number' ? Math.floor(newOffset) : null;
        if (this.divStretchOffset === newOffsetFloor) {
            return;
        }
        this.divStretchOffset = newOffsetFloor;
        this.eventService.dispatchEvent({ type: Events.EVENT_HEIGHT_SCALE_CHANGED });
    };
    RowContainerHeightService.prototype.setModelHeight = function (modelHeight) {
        this.modelHeight = modelHeight;
        this.stretching = modelHeight != null // null happens when in print layout
            && this.maxDivHeight > 0
            && modelHeight > this.maxDivHeight;
        if (this.stretching) {
            this.calculateOffset();
        }
        else {
            this.clearOffset();
        }
    };
    RowContainerHeightService.prototype.getUiContainerHeight = function () {
        return this.uiContainerHeight;
    };
    RowContainerHeightService.prototype.getRealPixelPosition = function (modelPixel) {
        return modelPixel - this.divStretchOffset;
    };
    RowContainerHeightService.prototype.getUiBodyHeight = function () {
        var gridBodyCon = this.controllersService.getGridBodyController();
        var pos = gridBodyCon.getScrollFeature().getVScrollPosition();
        return pos.bottom - pos.top;
    };
    RowContainerHeightService.prototype.getScrollPositionForPixel = function (rowTop) {
        if (this.pixelsToShave <= 0) {
            return rowTop;
        }
        var modelMaxScroll = this.modelHeight - this.getUiBodyHeight();
        var scrollPercent = rowTop / modelMaxScroll;
        var scrollPixel = this.maxScrollY * scrollPercent;
        return scrollPixel;
    };
    __decorate([
        Autowired('controllersService')
    ], RowContainerHeightService.prototype, "controllersService", void 0);
    __decorate([
        __param(0, Qualifier("loggerFactory"))
    ], RowContainerHeightService.prototype, "agWire", null);
    __decorate([
        PostConstruct
    ], RowContainerHeightService.prototype, "postConstruct", null);
    RowContainerHeightService = __decorate([
        Bean('rowContainerHeightService')
    ], RowContainerHeightService);
    return RowContainerHeightService;
}(BeanStub));
export { RowContainerHeightService };
