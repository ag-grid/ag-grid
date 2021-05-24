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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { BeanStub } from "../../context/beanStub";
import { Autowired, PostConstruct } from "../../context/context";
import { Events } from "../../eventKeys";
import { RowContainerEventsFeature } from "./rowContainerEventsFeature";
import { getInnerWidth, getScrollLeft, isHorizontalScrollShowing, isVisible, setScrollLeft } from "../../utils/dom";
import { ViewportSizeFeature } from "../viewportSizeFeature";
import { convertToMap } from "../../utils/map";
import { SetPinnedLeftWidthFeature } from "./setPinnedLeftWidthFeature";
import { SetPinnedRightWidthFeature } from "./setPinnedRightWidthFeature";
import { SetHeightFeature } from "./setHeightFeature";
import { DragListenerFeature } from "./dragListenerFeature";
import { CenterWidthFeature } from "../centerWidthFeature";
export var RowContainerNames;
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
})(RowContainerNames || (RowContainerNames = {}));
export var ContainerCssClasses = convertToMap([
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
export var ViewportCssClasses = convertToMap([
    [RowContainerNames.CENTER, 'ag-center-cols-viewport'],
    [RowContainerNames.TOP_CENTER, 'ag-floating-top-viewport'],
    [RowContainerNames.BOTTOM_CENTER, 'ag-floating-bottom-viewport'],
]);
export var WrapperCssClasses = convertToMap([
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
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.forContainers([RowContainerNames.CENTER], function () { return _this.viewportSizeFeature = _this.createManagedBean(new ViewportSizeFeature(_this)); });
        this.registerWithControllersService();
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));
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
        this.createManagedBean(new RowContainerEventsFeature(this.eContainer));
        this.addPreventScrollWhileDragging();
        var allTopNoFW = [RowContainerNames.TOP_CENTER, RowContainerNames.TOP_LEFT, RowContainerNames.TOP_RIGHT];
        var allBottomNoFW = [RowContainerNames.BOTTOM_CENTER, RowContainerNames.BOTTOM_LEFT, RowContainerNames.BOTTOM_RIGHT];
        var allMiddleNoFW = [RowContainerNames.CENTER, RowContainerNames.LEFT, RowContainerNames.RIGHT];
        var allNoFW = __spreadArrays(allTopNoFW, allBottomNoFW, allMiddleNoFW);
        var allMiddle = [RowContainerNames.CENTER, RowContainerNames.LEFT, RowContainerNames.RIGHT, RowContainerNames.FULL_WIDTH];
        var allCenter = [RowContainerNames.CENTER, RowContainerNames.TOP_CENTER, RowContainerNames.BOTTOM_CENTER];
        var allLeft = [RowContainerNames.LEFT, RowContainerNames.BOTTOM_LEFT, RowContainerNames.TOP_LEFT];
        var allRight = [RowContainerNames.RIGHT, RowContainerNames.BOTTOM_RIGHT, RowContainerNames.TOP_RIGHT];
        this.forContainers(allLeft, function () { return _this.createManagedBean(new SetPinnedLeftWidthFeature(_this.eContainer)); });
        this.forContainers(allRight, function () { return _this.createManagedBean(new SetPinnedRightWidthFeature(_this.eContainer)); });
        this.forContainers(allMiddle, function () { return _this.createManagedBean(new SetHeightFeature(_this.eContainer, _this.eWrapper)); });
        this.forContainers(allNoFW, function () { return _this.createManagedBean(new DragListenerFeature(_this.eContainer)); });
        this.forContainers(allCenter, function () { return _this.createManagedBean(new CenterWidthFeature(function (width) { return _this.eContainer.style.width = width + "px"; })); });
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
        return getInnerWidth(this.eViewport);
    };
    RowContainerController.prototype.getCenterViewportScrollLeft = function () {
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        return getScrollLeft(this.eViewport, this.enableRtl);
    };
    RowContainerController.prototype.registerViewportResizeListener = function (listener) {
        var unsubscribeFromResize = this.resizeObserverService.observeResize(this.eViewport, listener);
        this.addDestroyFunc(function () { return unsubscribeFromResize(); });
    };
    RowContainerController.prototype.isViewportVisible = function () {
        return isVisible(this.eViewport);
    };
    RowContainerController.prototype.isViewportHScrollShowing = function () {
        return isHorizontalScrollShowing(this.eViewport);
    };
    RowContainerController.prototype.getViewportScrollLeft = function () {
        return getScrollLeft(this.eViewport, this.enableRtl);
    };
    RowContainerController.prototype.isHorizontalScrollShowing = function () {
        var isAlwaysShowHorizontalScroll = this.gridOptionsWrapper.isAlwaysShowHorizontalScroll();
        return isAlwaysShowHorizontalScroll || isHorizontalScrollShowing(this.eViewport);
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
        setScrollLeft(this.eViewport, value, this.enableRtl);
    };
    __decorate([
        Autowired('scrollVisibleService')
    ], RowContainerController.prototype, "scrollVisibleService", void 0);
    __decorate([
        Autowired('dragService')
    ], RowContainerController.prototype, "dragService", void 0);
    __decorate([
        Autowired('controllersService')
    ], RowContainerController.prototype, "controllersService", void 0);
    __decorate([
        Autowired('columnController')
    ], RowContainerController.prototype, "columnController", void 0);
    __decorate([
        Autowired('resizeObserverService')
    ], RowContainerController.prototype, "resizeObserverService", void 0);
    __decorate([
        PostConstruct
    ], RowContainerController.prototype, "postConstruct", null);
    return RowContainerController;
}(BeanStub));
export { RowContainerController };
