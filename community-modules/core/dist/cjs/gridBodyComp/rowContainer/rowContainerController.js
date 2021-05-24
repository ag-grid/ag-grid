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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var beanStub_1 = require("../../context/beanStub");
var context_1 = require("../../context/context");
var eventKeys_1 = require("../../eventKeys");
var rowContainerEventsFeature_1 = require("./rowContainerEventsFeature");
var dom_1 = require("../../utils/dom");
var viewportSizeFeature_1 = require("../viewportSizeFeature");
var map_1 = require("../../utils/map");
var setPinnedLeftWidthFeature_1 = require("./setPinnedLeftWidthFeature");
var setPinnedRightWidthFeature_1 = require("./setPinnedRightWidthFeature");
var setHeightFeature_1 = require("./setHeightFeature");
var dragListenerFeature_1 = require("./dragListenerFeature");
var centerWidthFeature_1 = require("../centerWidthFeature");
var RowContainerNames;
(function (RowContainerNames) {
    RowContainerNames["LEFT"] = "left";
    RowContainerNames["RIGHT"] = "right";
    RowContainerNames["CENTER"] = "center";
    RowContainerNames["FULL_WIDTH"] = "fullWidth";
    RowContainerNames["TOP_LEFT"] = "topLeft";
    RowContainerNames["TOP_RIGHT"] = "topRight";
    RowContainerNames["TOP_CENTER"] = "topCenter";
    RowContainerNames["TOP_FULL_WITH"] = "topFullWidth";
    RowContainerNames["BOTTOM_LEFT"] = "bottomLeft";
    RowContainerNames["BOTTOM_RIGHT"] = "bottomRight";
    RowContainerNames["BOTTOM_CENTER"] = "bottomCenter";
    RowContainerNames["BOTTOM_FULL_WITH"] = "bottomFullWidth";
})(RowContainerNames = exports.RowContainerNames || (exports.RowContainerNames = {}));
exports.ContainerCssClasses = map_1.convertToMap([
    [RowContainerNames.CENTER, 'ag-center-cols-container'],
    [RowContainerNames.LEFT, 'ag-pinned-left-cols-container'],
    [RowContainerNames.RIGHT, 'ag-pinned-right-cols-container'],
    [RowContainerNames.FULL_WIDTH, 'ag-full-width-container'],
    [RowContainerNames.TOP_CENTER, 'ag-floating-top-container'],
    [RowContainerNames.TOP_LEFT, 'ag-pinned-left-floating-top'],
    [RowContainerNames.TOP_RIGHT, 'ag-pinned-right-floating-top'],
    [RowContainerNames.TOP_FULL_WITH, 'ag-floating-top-full-width-container'],
    [RowContainerNames.BOTTOM_CENTER, 'ag-floating-bottom-container'],
    [RowContainerNames.BOTTOM_LEFT, 'ag-pinned-left-floating-bottom'],
    [RowContainerNames.BOTTOM_RIGHT, 'ag-pinned-right-floating-bottom'],
    [RowContainerNames.BOTTOM_FULL_WITH, 'ag-floating-bottom-full-width-container'],
]);
exports.ViewportCssClasses = map_1.convertToMap([
    [RowContainerNames.CENTER, 'ag-center-cols-viewport'],
    [RowContainerNames.TOP_CENTER, 'ag-floating-top-viewport'],
    [RowContainerNames.BOTTOM_CENTER, 'ag-floating-bottom-viewport'],
]);
exports.WrapperCssClasses = map_1.convertToMap([
    [RowContainerNames.CENTER, 'ag-center-cols-clipper'],
]);
var RowContainerController = /** @class */ (function (_super) {
    __extends(RowContainerController, _super);
    function RowContainerController(name) {
        var _this = _super.call(this) || this;
        _this.name = name;
        return _this;
    }
    RowContainerController.prototype.postConstruct = function () {
        var _this = this;
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.forContainers([RowContainerNames.CENTER], function () { return _this.viewportSizeFeature = _this.createManagedBean(new viewportSizeFeature_1.ViewportSizeFeature(_this)); });
        this.registerWithControllersService();
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));
    };
    RowContainerController.prototype.registerWithControllersService = function () {
        switch (this.name) {
            case RowContainerNames.CENTER:
                this.controllersService.registerCenterRowContainerCon(this);
                break;
            case RowContainerNames.LEFT:
                this.controllersService.registerLeftRowContainerCon(this);
                break;
            case RowContainerNames.RIGHT:
                this.controllersService.registerRightRowContainerCon(this);
                break;
            case RowContainerNames.TOP_CENTER:
                this.controllersService.registerTopCenterRowContainerCon(this);
                break;
            case RowContainerNames.TOP_LEFT:
                this.controllersService.registerTopLeftRowContainerCon(this);
                break;
            case RowContainerNames.TOP_RIGHT:
                this.controllersService.registerTopRightRowContainerCon(this);
                break;
            case RowContainerNames.BOTTOM_CENTER:
                this.controllersService.registerBottomCenterRowContainerCon(this);
                break;
            case RowContainerNames.BOTTOM_LEFT:
                this.controllersService.registerBottomLeftRowContainerCon(this);
                break;
            case RowContainerNames.BOTTOM_RIGHT:
                this.controllersService.registerBottomRightRowContainerCon(this);
                break;
        }
    };
    RowContainerController.prototype.forContainers = function (names, callback) {
        if (names.indexOf(this.name) >= 0) {
            callback();
        }
    };
    RowContainerController.prototype.getContainerElement = function () {
        return this.eContainer;
    };
    RowContainerController.prototype.getViewportSizeFeature = function () {
        return this.viewportSizeFeature;
    };
    RowContainerController.prototype.setView = function (view, eContainer, eViewport, eWrapper) {
        var _this = this;
        this.view = view;
        this.eContainer = eContainer;
        this.eViewport = eViewport;
        this.eWrapper = eWrapper;
        this.createManagedBean(new rowContainerEventsFeature_1.RowContainerEventsFeature(this.eContainer));
        this.addPreventScrollWhileDragging();
        var allTopNoFW = [RowContainerNames.TOP_CENTER, RowContainerNames.TOP_LEFT, RowContainerNames.TOP_RIGHT];
        var allBottomNoFW = [RowContainerNames.BOTTOM_CENTER, RowContainerNames.BOTTOM_LEFT, RowContainerNames.BOTTOM_RIGHT];
        var allMiddleNoFW = [RowContainerNames.CENTER, RowContainerNames.LEFT, RowContainerNames.RIGHT];
        var allNoFW = __spreadArrays(allTopNoFW, allBottomNoFW, allMiddleNoFW);
        var allMiddle = [RowContainerNames.CENTER, RowContainerNames.LEFT, RowContainerNames.RIGHT, RowContainerNames.FULL_WIDTH];
        var allCenter = [RowContainerNames.CENTER, RowContainerNames.TOP_CENTER, RowContainerNames.BOTTOM_CENTER];
        var allLeft = [RowContainerNames.LEFT, RowContainerNames.BOTTOM_LEFT, RowContainerNames.TOP_LEFT];
        var allRight = [RowContainerNames.RIGHT, RowContainerNames.BOTTOM_RIGHT, RowContainerNames.TOP_RIGHT];
        this.forContainers(allLeft, function () { return _this.createManagedBean(new setPinnedLeftWidthFeature_1.SetPinnedLeftWidthFeature(_this.eContainer)); });
        this.forContainers(allRight, function () { return _this.createManagedBean(new setPinnedRightWidthFeature_1.SetPinnedRightWidthFeature(_this.eContainer)); });
        this.forContainers(allMiddle, function () { return _this.createManagedBean(new setHeightFeature_1.SetHeightFeature(_this.eContainer, _this.eWrapper)); });
        this.forContainers(allNoFW, function () { return _this.createManagedBean(new dragListenerFeature_1.DragListenerFeature(_this.eContainer)); });
        this.forContainers(allCenter, function () { return _this.createManagedBean(new centerWidthFeature_1.CenterWidthFeature(function (width) { return _this.eContainer.style.width = width + "px"; })); });
    };
    RowContainerController.prototype.onDisplayedColumnsChanged = function () {
        var _this = this;
        this.forContainers([RowContainerNames.CENTER], function () { return _this.onHorizontalViewportChanged(); });
    };
    RowContainerController.prototype.onDisplayedColumnsWidthChanged = function () {
        var _this = this;
        this.forContainers([RowContainerNames.CENTER], function () { return _this.onHorizontalViewportChanged(); });
    };
    RowContainerController.prototype.onScrollVisibilityChanged = function () {
        if (this.name !== RowContainerNames.CENTER) {
            return;
        }
        var visible = this.scrollVisibleService.isHorizontalScrollShowing();
        var scrollbarWidth = visible ? (this.gridOptionsWrapper.getScrollbarWidth() || 0) : 0;
        var height = scrollbarWidth == 0 ? '100%' : "calc(100% + " + scrollbarWidth + "px)";
        this.view.setViewportHeight(height);
    };
    // this methods prevents the grid views from being scrolled while the dragService is being used
    // eg. the view should not scroll up and down while dragging rows using the rowDragComp.
    RowContainerController.prototype.addPreventScrollWhileDragging = function () {
        var _this = this;
        var preventScroll = function (e) {
            if (_this.dragService.isDragging()) {
                if (e.cancelable) {
                    e.preventDefault();
                }
            }
        };
        this.eContainer.addEventListener('touchmove', preventScroll, { passive: false });
        this.addDestroyFunc(function () { return _this.eContainer.removeEventListener('touchmove', preventScroll); });
    };
    // this gets called whenever a change in the viewport, so we can inform column controller it has to work
    // out the virtual columns again. gets called from following locations:
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged, API (doLayout)
    RowContainerController.prototype.onHorizontalViewportChanged = function () {
        var scrollWidth = this.getCenterWidth();
        var scrollPosition = this.getCenterViewportScrollLeft();
        this.columnController.setViewportPosition(scrollWidth, scrollPosition);
    };
    RowContainerController.prototype.getCenterWidth = function () {
        return dom_1.getInnerWidth(this.eViewport);
    };
    RowContainerController.prototype.getCenterViewportScrollLeft = function () {
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        return dom_1.getScrollLeft(this.eViewport, this.enableRtl);
    };
    RowContainerController.prototype.registerViewportResizeListener = function (listener) {
        var unsubscribeFromResize = this.resizeObserverService.observeResize(this.eViewport, listener);
        this.addDestroyFunc(function () { return unsubscribeFromResize(); });
    };
    RowContainerController.prototype.isViewportVisible = function () {
        return dom_1.isVisible(this.eViewport);
    };
    RowContainerController.prototype.isViewportHScrollShowing = function () {
        return dom_1.isHorizontalScrollShowing(this.eViewport);
    };
    RowContainerController.prototype.getViewportScrollLeft = function () {
        return dom_1.getScrollLeft(this.eViewport, this.enableRtl);
    };
    RowContainerController.prototype.isHorizontalScrollShowing = function () {
        var isAlwaysShowHorizontalScroll = this.gridOptionsWrapper.isAlwaysShowHorizontalScroll();
        return isAlwaysShowHorizontalScroll || dom_1.isHorizontalScrollShowing(this.eViewport);
    };
    RowContainerController.prototype.getViewportElement = function () {
        return this.eViewport;
    };
    RowContainerController.prototype.setContainerTranslateX = function (amount) {
        this.eContainer.style.transform = "translateX(" + amount + "px)";
    };
    RowContainerController.prototype.getHScrollPosition = function () {
        var res = {
            left: this.eViewport.scrollLeft,
            right: this.eViewport.scrollLeft + this.eViewport.offsetWidth
        };
        return res;
    };
    RowContainerController.prototype.setCenterViewportScrollLeft = function (value) {
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        dom_1.setScrollLeft(this.eViewport, value, this.enableRtl);
    };
    __decorate([
        context_1.Autowired('scrollVisibleService')
    ], RowContainerController.prototype, "scrollVisibleService", void 0);
    __decorate([
        context_1.Autowired('dragService')
    ], RowContainerController.prototype, "dragService", void 0);
    __decorate([
        context_1.Autowired('controllersService')
    ], RowContainerController.prototype, "controllersService", void 0);
    __decorate([
        context_1.Autowired('columnController')
    ], RowContainerController.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('resizeObserverService')
    ], RowContainerController.prototype, "resizeObserverService", void 0);
    __decorate([
        context_1.PostConstruct
    ], RowContainerController.prototype, "postConstruct", null);
    return RowContainerController;
}(beanStub_1.BeanStub));
exports.RowContainerController = RowContainerController;

//# sourceMappingURL=rowContainerController.js.map
