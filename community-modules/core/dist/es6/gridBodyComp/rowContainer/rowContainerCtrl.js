/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.0.0
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
import { Constants } from "../../constants/constants";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
export var RowContainerName;
(function (RowContainerName) {
    RowContainerName["LEFT"] = "left";
    RowContainerName["RIGHT"] = "right";
    RowContainerName["CENTER"] = "center";
    RowContainerName["FULL_WIDTH"] = "fullWidth";
    RowContainerName["TOP_LEFT"] = "topLeft";
    RowContainerName["TOP_RIGHT"] = "topRight";
    RowContainerName["TOP_CENTER"] = "topCenter";
    RowContainerName["TOP_FULL_WITH"] = "topFullWidth";
    RowContainerName["BOTTOM_LEFT"] = "bottomLeft";
    RowContainerName["BOTTOM_RIGHT"] = "bottomRight";
    RowContainerName["BOTTOM_CENTER"] = "bottomCenter";
    RowContainerName["BOTTOM_FULL_WITH"] = "bottomFullWidth";
})(RowContainerName || (RowContainerName = {}));
var ContainerCssClasses = convertToMap([
    [RowContainerName.CENTER, 'ag-center-cols-container'],
    [RowContainerName.LEFT, 'ag-pinned-left-cols-container'],
    [RowContainerName.RIGHT, 'ag-pinned-right-cols-container'],
    [RowContainerName.FULL_WIDTH, 'ag-full-width-container'],
    [RowContainerName.TOP_CENTER, 'ag-floating-top-container'],
    [RowContainerName.TOP_LEFT, 'ag-pinned-left-floating-top'],
    [RowContainerName.TOP_RIGHT, 'ag-pinned-right-floating-top'],
    [RowContainerName.TOP_FULL_WITH, 'ag-floating-top-full-width-container'],
    [RowContainerName.BOTTOM_CENTER, 'ag-floating-bottom-container'],
    [RowContainerName.BOTTOM_LEFT, 'ag-pinned-left-floating-bottom'],
    [RowContainerName.BOTTOM_RIGHT, 'ag-pinned-right-floating-bottom'],
    [RowContainerName.BOTTOM_FULL_WITH, 'ag-floating-bottom-full-width-container'],
]);
var ViewportCssClasses = convertToMap([
    [RowContainerName.CENTER, 'ag-center-cols-viewport'],
    [RowContainerName.TOP_CENTER, 'ag-floating-top-viewport'],
    [RowContainerName.BOTTOM_CENTER, 'ag-floating-bottom-viewport'],
]);
var WrapperCssClasses = convertToMap([
    [RowContainerName.CENTER, 'ag-center-cols-clipper'],
]);
var RowContainerCtrl = /** @class */ (function (_super) {
    __extends(RowContainerCtrl, _super);
    function RowContainerCtrl(name) {
        var _this = _super.call(this) || this;
        _this.name = name;
        return _this;
    }
    RowContainerCtrl.getRowContainerCssClasses = function (name) {
        var containerClass = ContainerCssClasses.get(name);
        var viewportClass = ViewportCssClasses.get(name);
        var wrapperClass = WrapperCssClasses.get(name);
        return { container: containerClass, viewport: viewportClass, wrapper: wrapperClass };
    };
    RowContainerCtrl.getPinned = function (name) {
        switch (name) {
            case RowContainerName.BOTTOM_LEFT:
            case RowContainerName.TOP_LEFT:
            case RowContainerName.LEFT:
                return Constants.PINNED_LEFT;
            case RowContainerName.BOTTOM_RIGHT:
            case RowContainerName.TOP_RIGHT:
            case RowContainerName.RIGHT:
                return Constants.PINNED_RIGHT;
            default:
                return null;
        }
    };
    RowContainerCtrl.prototype.postConstruct = function () {
        var _this = this;
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.embedFullWidthRows = this.gridOptionsWrapper.isEmbedFullWidthRows();
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_ROWS_CHANGED, this.onDisplayedRowsChanged.bind(this));
        this.forContainers([RowContainerName.CENTER], function () { return _this.viewportSizeFeature = _this.createManagedBean(new ViewportSizeFeature(_this)); });
        this.registerWithCtrlsService();
    };
    RowContainerCtrl.prototype.registerWithCtrlsService = function () {
        switch (this.name) {
            case RowContainerName.CENTER:
                this.ctrlsService.registerCenterRowContainerCtrl(this);
                break;
            case RowContainerName.LEFT:
                this.ctrlsService.registerLeftRowContainerCtrl(this);
                break;
            case RowContainerName.RIGHT:
                this.ctrlsService.registerRightRowContainerCtrl(this);
                break;
            case RowContainerName.TOP_CENTER:
                this.ctrlsService.registerTopCenterRowContainerCtrl(this);
                break;
            case RowContainerName.TOP_LEFT:
                this.ctrlsService.registerTopLeftRowContainerCon(this);
                break;
            case RowContainerName.TOP_RIGHT:
                this.ctrlsService.registerTopRightRowContainerCtrl(this);
                break;
            case RowContainerName.BOTTOM_CENTER:
                this.ctrlsService.registerBottomCenterRowContainerCtrl(this);
                break;
            case RowContainerName.BOTTOM_LEFT:
                this.ctrlsService.registerBottomLeftRowContainerCtrl(this);
                break;
            case RowContainerName.BOTTOM_RIGHT:
                this.ctrlsService.registerBottomRightRowContainerCtrl(this);
                break;
        }
    };
    RowContainerCtrl.prototype.forContainers = function (names, callback) {
        if (names.indexOf(this.name) >= 0) {
            callback();
        }
    };
    RowContainerCtrl.prototype.getContainerElement = function () {
        return this.eContainer;
    };
    RowContainerCtrl.prototype.getViewportSizeFeature = function () {
        return this.viewportSizeFeature;
    };
    RowContainerCtrl.prototype.setComp = function (view, eContainer, eViewport, eWrapper) {
        var _this = this;
        this.comp = view;
        this.eContainer = eContainer;
        this.eViewport = eViewport;
        this.eWrapper = eWrapper;
        this.createManagedBean(new RowContainerEventsFeature(this.eContainer));
        this.addPreventScrollWhileDragging();
        this.listenOnDomOrder();
        this.stopHScrollOnPinnedRows();
        var allTopNoFW = [RowContainerName.TOP_CENTER, RowContainerName.TOP_LEFT, RowContainerName.TOP_RIGHT];
        var allBottomNoFW = [RowContainerName.BOTTOM_CENTER, RowContainerName.BOTTOM_LEFT, RowContainerName.BOTTOM_RIGHT];
        var allMiddleNoFW = [RowContainerName.CENTER, RowContainerName.LEFT, RowContainerName.RIGHT];
        var allNoFW = __spreadArrays(allTopNoFW, allBottomNoFW, allMiddleNoFW);
        var allMiddle = [RowContainerName.CENTER, RowContainerName.LEFT, RowContainerName.RIGHT, RowContainerName.FULL_WIDTH];
        var allCenter = [RowContainerName.CENTER, RowContainerName.TOP_CENTER, RowContainerName.BOTTOM_CENTER];
        var allLeft = [RowContainerName.LEFT, RowContainerName.BOTTOM_LEFT, RowContainerName.TOP_LEFT];
        var allRight = [RowContainerName.RIGHT, RowContainerName.BOTTOM_RIGHT, RowContainerName.TOP_RIGHT];
        this.forContainers(allLeft, function () { return _this.createManagedBean(new SetPinnedLeftWidthFeature(_this.eContainer)); });
        this.forContainers(allRight, function () { return _this.createManagedBean(new SetPinnedRightWidthFeature(_this.eContainer)); });
        this.forContainers(allMiddle, function () { return _this.createManagedBean(new SetHeightFeature(_this.eContainer, _this.eWrapper)); });
        this.forContainers(allNoFW, function () { return _this.createManagedBean(new DragListenerFeature(_this.eContainer)); });
        this.forContainers(allCenter, function () { return _this.createManagedBean(new CenterWidthFeature(function (width) { return _this.comp.setContainerWidth(width + "px"); })); });
    };
    RowContainerCtrl.prototype.listenOnDomOrder = function () {
        var _this = this;
        var listener = function () { return _this.comp.setDomOrder(_this.gridOptionsWrapper.isEnsureDomOrder()); };
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, listener);
        listener();
    };
    // when editing a pinned row, if the cell is half outside the scrollable area, the browser can
    // scroll the column into view. we do not want this, the pinned sections should never scroll.
    // so we listen to scrolls on these containers and reset the scroll if we find one.
    RowContainerCtrl.prototype.stopHScrollOnPinnedRows = function () {
        var _this = this;
        this.forContainers([RowContainerName.TOP_CENTER, RowContainerName.BOTTOM_CENTER], function () {
            var resetScrollLeft = function () { return _this.eViewport.scrollLeft = 0; };
            _this.addManagedListener(_this.eViewport, 'scroll', resetScrollLeft);
        });
    };
    RowContainerCtrl.prototype.onDisplayedColumnsChanged = function () {
        var _this = this;
        this.forContainers([RowContainerName.CENTER], function () { return _this.onHorizontalViewportChanged(); });
    };
    RowContainerCtrl.prototype.onDisplayedColumnsWidthChanged = function () {
        var _this = this;
        this.forContainers([RowContainerName.CENTER], function () { return _this.onHorizontalViewportChanged(); });
    };
    RowContainerCtrl.prototype.onScrollVisibilityChanged = function () {
        if (this.name !== RowContainerName.CENTER) {
            return;
        }
        var visible = this.scrollVisibleService.isHorizontalScrollShowing();
        var scrollbarWidth = visible ? (this.gridOptionsWrapper.getScrollbarWidth() || 0) : 0;
        var height = scrollbarWidth == 0 ? '100%' : "calc(100% + " + scrollbarWidth + "px)";
        this.comp.setViewportHeight(height);
    };
    // this methods prevents the grid views from being scrolled while the dragService is being used
    // eg. the view should not scroll up and down while dragging rows using the rowDragComp.
    RowContainerCtrl.prototype.addPreventScrollWhileDragging = function () {
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
    RowContainerCtrl.prototype.onHorizontalViewportChanged = function () {
        var scrollWidth = this.getCenterWidth();
        var scrollPosition = this.getCenterViewportScrollLeft();
        this.columnModel.setViewportPosition(scrollWidth, scrollPosition);
    };
    RowContainerCtrl.prototype.getCenterWidth = function () {
        return getInnerWidth(this.eViewport);
    };
    RowContainerCtrl.prototype.getCenterViewportScrollLeft = function () {
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        return getScrollLeft(this.eViewport, this.enableRtl);
    };
    RowContainerCtrl.prototype.registerViewportResizeListener = function (listener) {
        var unsubscribeFromResize = this.resizeObserverService.observeResize(this.eViewport, listener);
        this.addDestroyFunc(function () { return unsubscribeFromResize(); });
    };
    RowContainerCtrl.prototype.isViewportVisible = function () {
        return isVisible(this.eViewport);
    };
    RowContainerCtrl.prototype.isViewportHScrollShowing = function () {
        return isHorizontalScrollShowing(this.eViewport);
    };
    RowContainerCtrl.prototype.getViewportScrollLeft = function () {
        return getScrollLeft(this.eViewport, this.enableRtl);
    };
    RowContainerCtrl.prototype.isHorizontalScrollShowing = function () {
        var isAlwaysShowHorizontalScroll = this.gridOptionsWrapper.isAlwaysShowHorizontalScroll();
        return isAlwaysShowHorizontalScroll || isHorizontalScrollShowing(this.eViewport);
    };
    RowContainerCtrl.prototype.getViewportElement = function () {
        return this.eViewport;
    };
    RowContainerCtrl.prototype.setContainerTranslateX = function (amount) {
        this.eContainer.style.transform = "translateX(" + amount + "px)";
    };
    RowContainerCtrl.prototype.getHScrollPosition = function () {
        var res = {
            left: this.eViewport.scrollLeft,
            right: this.eViewport.scrollLeft + this.eViewport.offsetWidth
        };
        return res;
    };
    RowContainerCtrl.prototype.setCenterViewportScrollLeft = function (value) {
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        setScrollLeft(this.eViewport, value, this.enableRtl);
    };
    RowContainerCtrl.prototype.onDisplayedRowsChanged = function () {
        var _this = this;
        var fullWithContainer = this.name === RowContainerName.TOP_FULL_WITH
            || this.name === RowContainerName.BOTTOM_FULL_WITH
            || this.name === RowContainerName.FULL_WIDTH;
        var doesRowMatch = function (rowCtrl) {
            var fullWidthRow = rowCtrl.isFullWidth();
            var printLayout = _this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
            var embedFW = _this.embedFullWidthRows || printLayout;
            var match = fullWithContainer ?
                !embedFW && fullWidthRow
                : embedFW || !fullWidthRow;
            return match;
        };
        // this list contains either all pinned top, center or pinned bottom rows
        var allRowsRegardlessOfFullWidth = this.getRowCtrls();
        // this filters out rows not for this container, eg if it's a full with row, but we are not full with container
        var rowsThisContainer = allRowsRegardlessOfFullWidth.filter(doesRowMatch);
        this.comp.setRowCtrls(rowsThisContainer);
    };
    RowContainerCtrl.prototype.getRowCtrls = function () {
        switch (this.name) {
            case RowContainerName.TOP_CENTER:
            case RowContainerName.TOP_LEFT:
            case RowContainerName.TOP_RIGHT:
            case RowContainerName.TOP_FULL_WITH:
                return this.rowRenderer.getTopRowCtrls();
            case RowContainerName.BOTTOM_CENTER:
            case RowContainerName.BOTTOM_LEFT:
            case RowContainerName.BOTTOM_RIGHT:
            case RowContainerName.BOTTOM_FULL_WITH:
                return this.rowRenderer.getBottomRowCtrls();
            default:
                return this.rowRenderer.getRowCtrls();
        }
    };
    __decorate([
        Autowired('scrollVisibleService')
    ], RowContainerCtrl.prototype, "scrollVisibleService", void 0);
    __decorate([
        Autowired('dragService')
    ], RowContainerCtrl.prototype, "dragService", void 0);
    __decorate([
        Autowired('ctrlsService')
    ], RowContainerCtrl.prototype, "ctrlsService", void 0);
    __decorate([
        Autowired('columnModel')
    ], RowContainerCtrl.prototype, "columnModel", void 0);
    __decorate([
        Autowired('resizeObserverService')
    ], RowContainerCtrl.prototype, "resizeObserverService", void 0);
    __decorate([
        Autowired('rowRenderer')
    ], RowContainerCtrl.prototype, "rowRenderer", void 0);
    __decorate([
        PostConstruct
    ], RowContainerCtrl.prototype, "postConstruct", null);
    return RowContainerCtrl;
}(BeanStub));
export { RowContainerCtrl };
