var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
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
export var RowContainerName;
(function (RowContainerName) {
    RowContainerName["LEFT"] = "left";
    RowContainerName["RIGHT"] = "right";
    RowContainerName["CENTER"] = "center";
    RowContainerName["FULL_WIDTH"] = "fullWidth";
    RowContainerName["TOP_LEFT"] = "topLeft";
    RowContainerName["TOP_RIGHT"] = "topRight";
    RowContainerName["TOP_CENTER"] = "topCenter";
    RowContainerName["TOP_FULL_WIDTH"] = "topFullWidth";
    RowContainerName["STICKY_TOP_LEFT"] = "stickyTopLeft";
    RowContainerName["STICKY_TOP_RIGHT"] = "stickyTopRight";
    RowContainerName["STICKY_TOP_CENTER"] = "stickyTopCenter";
    RowContainerName["STICKY_TOP_FULL_WIDTH"] = "stickyTopFullWidth";
    RowContainerName["BOTTOM_LEFT"] = "bottomLeft";
    RowContainerName["BOTTOM_RIGHT"] = "bottomRight";
    RowContainerName["BOTTOM_CENTER"] = "bottomCenter";
    RowContainerName["BOTTOM_FULL_WIDTH"] = "bottomFullWidth";
})(RowContainerName || (RowContainerName = {}));
export var RowContainerType;
(function (RowContainerType) {
    RowContainerType["LEFT"] = "left";
    RowContainerType["RIGHT"] = "right";
    RowContainerType["CENTER"] = "center";
    RowContainerType["FULL_WIDTH"] = "fullWidth";
})(RowContainerType || (RowContainerType = {}));
export function getRowContainerTypeForName(name) {
    switch (name) {
        case RowContainerName.CENTER:
        case RowContainerName.TOP_CENTER:
        case RowContainerName.STICKY_TOP_CENTER:
        case RowContainerName.BOTTOM_CENTER:
            return RowContainerType.CENTER;
        case RowContainerName.LEFT:
        case RowContainerName.TOP_LEFT:
        case RowContainerName.STICKY_TOP_LEFT:
        case RowContainerName.BOTTOM_LEFT:
            return RowContainerType.LEFT;
        case RowContainerName.RIGHT:
        case RowContainerName.TOP_RIGHT:
        case RowContainerName.STICKY_TOP_RIGHT:
        case RowContainerName.BOTTOM_RIGHT:
            return RowContainerType.RIGHT;
        case RowContainerName.FULL_WIDTH:
        case RowContainerName.TOP_FULL_WIDTH:
        case RowContainerName.STICKY_TOP_FULL_WIDTH:
        case RowContainerName.BOTTOM_FULL_WIDTH:
            return RowContainerType.FULL_WIDTH;
        default:
            throw Error('Invalid Row Container Type');
    }
}
var ContainerCssClasses = convertToMap([
    [RowContainerName.CENTER, 'ag-center-cols-container'],
    [RowContainerName.LEFT, 'ag-pinned-left-cols-container'],
    [RowContainerName.RIGHT, 'ag-pinned-right-cols-container'],
    [RowContainerName.FULL_WIDTH, 'ag-full-width-container'],
    [RowContainerName.TOP_CENTER, 'ag-floating-top-container'],
    [RowContainerName.TOP_LEFT, 'ag-pinned-left-floating-top'],
    [RowContainerName.TOP_RIGHT, 'ag-pinned-right-floating-top'],
    [RowContainerName.TOP_FULL_WIDTH, 'ag-floating-top-full-width-container'],
    [RowContainerName.STICKY_TOP_CENTER, 'ag-sticky-top-container'],
    [RowContainerName.STICKY_TOP_LEFT, 'ag-pinned-left-sticky-top'],
    [RowContainerName.STICKY_TOP_RIGHT, 'ag-pinned-right-sticky-top'],
    [RowContainerName.STICKY_TOP_FULL_WIDTH, 'ag-sticky-top-full-width-container'],
    [RowContainerName.BOTTOM_CENTER, 'ag-floating-bottom-container'],
    [RowContainerName.BOTTOM_LEFT, 'ag-pinned-left-floating-bottom'],
    [RowContainerName.BOTTOM_RIGHT, 'ag-pinned-right-floating-bottom'],
    [RowContainerName.BOTTOM_FULL_WIDTH, 'ag-floating-bottom-full-width-container'],
]);
var ViewportCssClasses = convertToMap([
    [RowContainerName.CENTER, 'ag-center-cols-viewport'],
    [RowContainerName.TOP_CENTER, 'ag-floating-top-viewport'],
    [RowContainerName.STICKY_TOP_CENTER, 'ag-sticky-top-viewport'],
    [RowContainerName.BOTTOM_CENTER, 'ag-floating-bottom-viewport'],
]);
var RowContainerCtrl = /** @class */ (function (_super) {
    __extends(RowContainerCtrl, _super);
    function RowContainerCtrl(name) {
        var _this = _super.call(this) || this;
        _this.visible = true;
        // Maintaining a constant reference enables optimization in React.
        _this.EMPTY_CTRLS = [];
        _this.name = name;
        _this.isFullWithContainer =
            _this.name === RowContainerName.TOP_FULL_WIDTH
                || _this.name === RowContainerName.STICKY_TOP_FULL_WIDTH
                || _this.name === RowContainerName.BOTTOM_FULL_WIDTH
                || _this.name === RowContainerName.FULL_WIDTH;
        return _this;
    }
    RowContainerCtrl.getRowContainerCssClasses = function (name) {
        var containerClass = ContainerCssClasses.get(name);
        var viewportClass = ViewportCssClasses.get(name);
        return { container: containerClass, viewport: viewportClass };
    };
    RowContainerCtrl.getPinned = function (name) {
        switch (name) {
            case RowContainerName.BOTTOM_LEFT:
            case RowContainerName.TOP_LEFT:
            case RowContainerName.STICKY_TOP_LEFT:
            case RowContainerName.LEFT:
                return 'left';
            case RowContainerName.BOTTOM_RIGHT:
            case RowContainerName.TOP_RIGHT:
            case RowContainerName.STICKY_TOP_RIGHT:
            case RowContainerName.RIGHT:
                return 'right';
            default:
                return null;
        }
    };
    RowContainerCtrl.prototype.postConstruct = function () {
        var _this = this;
        this.enableRtl = this.gridOptionsService.get('enableRtl');
        this.forContainers([RowContainerName.CENTER], function () { return _this.viewportSizeFeature = _this.createManagedBean(new ViewportSizeFeature(_this)); });
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
            case RowContainerName.STICKY_TOP_CENTER:
                this.ctrlsService.registerStickyTopCenterRowContainerCtrl(this);
                break;
            case RowContainerName.STICKY_TOP_LEFT:
                this.ctrlsService.registerStickyTopLeftRowContainerCon(this);
                break;
            case RowContainerName.STICKY_TOP_RIGHT:
                this.ctrlsService.registerStickyTopRightRowContainerCtrl(this);
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
    RowContainerCtrl.prototype.setComp = function (view, eContainer, eViewport) {
        var _this = this;
        this.comp = view;
        this.eContainer = eContainer;
        this.eViewport = eViewport;
        this.createManagedBean(new RowContainerEventsFeature(this.eContainer));
        this.addPreventScrollWhileDragging();
        this.listenOnDomOrder();
        this.stopHScrollOnPinnedRows();
        var allTopNoFW = [RowContainerName.TOP_CENTER, RowContainerName.TOP_LEFT, RowContainerName.TOP_RIGHT];
        var allStickyTopNoFW = [RowContainerName.STICKY_TOP_CENTER, RowContainerName.STICKY_TOP_LEFT, RowContainerName.STICKY_TOP_RIGHT];
        var allBottomNoFW = [RowContainerName.BOTTOM_CENTER, RowContainerName.BOTTOM_LEFT, RowContainerName.BOTTOM_RIGHT];
        var allMiddleNoFW = [RowContainerName.CENTER, RowContainerName.LEFT, RowContainerName.RIGHT];
        var allNoFW = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], __read(allTopNoFW), false), __read(allBottomNoFW), false), __read(allMiddleNoFW), false), __read(allStickyTopNoFW), false);
        var allMiddle = [RowContainerName.CENTER, RowContainerName.LEFT, RowContainerName.RIGHT, RowContainerName.FULL_WIDTH];
        var allCenter = [RowContainerName.CENTER, RowContainerName.TOP_CENTER, RowContainerName.STICKY_TOP_CENTER, RowContainerName.BOTTOM_CENTER];
        var allLeft = [RowContainerName.LEFT, RowContainerName.BOTTOM_LEFT, RowContainerName.TOP_LEFT, RowContainerName.STICKY_TOP_LEFT];
        var allRight = [RowContainerName.RIGHT, RowContainerName.BOTTOM_RIGHT, RowContainerName.TOP_RIGHT, RowContainerName.STICKY_TOP_RIGHT];
        this.forContainers(allLeft, function () {
            _this.pinnedWidthFeature = _this.createManagedBean(new SetPinnedLeftWidthFeature(_this.eContainer));
            _this.addManagedListener(_this.eventService, Events.EVENT_LEFT_PINNED_WIDTH_CHANGED, function () { return _this.onPinnedWidthChanged(); });
        });
        this.forContainers(allRight, function () {
            _this.pinnedWidthFeature = _this.createManagedBean(new SetPinnedRightWidthFeature(_this.eContainer));
            _this.addManagedListener(_this.eventService, Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED, function () { return _this.onPinnedWidthChanged(); });
        });
        this.forContainers(allMiddle, function () { return _this.createManagedBean(new SetHeightFeature(_this.eContainer, _this.name === RowContainerName.CENTER ? eViewport : undefined)); });
        this.forContainers(allNoFW, function () { return _this.createManagedBean(new DragListenerFeature(_this.eContainer)); });
        this.forContainers(allCenter, function () { return _this.createManagedBean(new CenterWidthFeature(function (width) { return _this.comp.setContainerWidth("".concat(width, "px")); })); });
        this.addListeners();
        this.registerWithCtrlsService();
    };
    RowContainerCtrl.prototype.addListeners = function () {
        var _this = this;
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, function () { return _this.onDisplayedColumnsChanged(); });
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, function () { return _this.onDisplayedColumnsWidthChanged(); });
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_ROWS_CHANGED, function (params) { return _this.onDisplayedRowsChanged(params.afterScroll); });
        this.onDisplayedColumnsChanged();
        this.onDisplayedColumnsWidthChanged();
        this.onDisplayedRowsChanged();
    };
    RowContainerCtrl.prototype.listenOnDomOrder = function () {
        var _this = this;
        // sticky section must show rows in set order
        var allStickyContainers = [RowContainerName.STICKY_TOP_CENTER, RowContainerName.STICKY_TOP_LEFT, RowContainerName.STICKY_TOP_RIGHT, RowContainerName.STICKY_TOP_FULL_WIDTH];
        var isStickContainer = allStickyContainers.indexOf(this.name) >= 0;
        if (isStickContainer) {
            this.comp.setDomOrder(true);
            return;
        }
        var listener = function () {
            var isEnsureDomOrder = _this.gridOptionsService.get('ensureDomOrder');
            var isPrintLayout = _this.gridOptionsService.isDomLayout('print');
            _this.comp.setDomOrder(isEnsureDomOrder || isPrintLayout);
        };
        this.addManagedPropertyListener('domLayout', listener);
        listener();
    };
    // when editing a pinned row, if the cell is half outside the scrollable area, the browser can
    // scroll the column into view. we do not want this, the pinned sections should never scroll.
    // so we listen to scrolls on these containers and reset the scroll if we find one.
    RowContainerCtrl.prototype.stopHScrollOnPinnedRows = function () {
        var _this = this;
        this.forContainers([RowContainerName.TOP_CENTER, RowContainerName.STICKY_TOP_CENTER, RowContainerName.BOTTOM_CENTER], function () {
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
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged
    RowContainerCtrl.prototype.onHorizontalViewportChanged = function (afterScroll) {
        if (afterScroll === void 0) { afterScroll = false; }
        var scrollWidth = this.getCenterWidth();
        var scrollPosition = this.getCenterViewportScrollLeft();
        this.columnModel.setViewportPosition(scrollWidth, scrollPosition, afterScroll);
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
    RowContainerCtrl.prototype.getViewportScrollLeft = function () {
        return getScrollLeft(this.eViewport, this.enableRtl);
    };
    RowContainerCtrl.prototype.isHorizontalScrollShowing = function () {
        var isAlwaysShowHorizontalScroll = this.gridOptionsService.get('alwaysShowHorizontalScroll');
        return isAlwaysShowHorizontalScroll || isHorizontalScrollShowing(this.eViewport);
    };
    RowContainerCtrl.prototype.getViewportElement = function () {
        return this.eViewport;
    };
    RowContainerCtrl.prototype.setContainerTranslateX = function (amount) {
        this.eContainer.style.transform = "translateX(".concat(amount, "px)");
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
    RowContainerCtrl.prototype.isContainerVisible = function () {
        var pinned = RowContainerCtrl.getPinned(this.name);
        return !pinned || (!!this.pinnedWidthFeature && this.pinnedWidthFeature.getWidth() > 0);
    };
    RowContainerCtrl.prototype.onPinnedWidthChanged = function () {
        var visible = this.isContainerVisible();
        if (this.visible != visible) {
            this.visible = visible;
            this.onDisplayedRowsChanged();
        }
    };
    RowContainerCtrl.prototype.onDisplayedRowsChanged = function (useFlushSync) {
        var _this = this;
        if (useFlushSync === void 0) { useFlushSync = false; }
        if (this.visible) {
            var printLayout = this.gridOptionsService.isDomLayout('print');
            var embedFullWidthRows = this.gridOptionsService.get('embedFullWidthRows');
            var embedFW_1 = embedFullWidthRows || printLayout;
            // this just justifies if the ctrl is in the correct place, this will be fed with zombie rows by the
            // row renderer, so should not block them as they still need to animate -  the row renderer
            // will clean these up when they finish animating
            var doesRowMatch = function (rowCtrl) {
                var fullWidthRow = rowCtrl.isFullWidth();
                var match = _this.isFullWithContainer ?
                    !embedFW_1 && fullWidthRow
                    : embedFW_1 || !fullWidthRow;
                return match;
            };
            // this list contains either all pinned top, center or pinned bottom rows
            // this filters out rows not for this container, eg if it's a full with row, but we are not full with container
            var rowsThisContainer = this.getRowCtrls().filter(doesRowMatch);
            this.comp.setRowCtrls(rowsThisContainer, useFlushSync);
        }
        else {
            this.comp.setRowCtrls(this.EMPTY_CTRLS, false);
        }
    };
    RowContainerCtrl.prototype.getRowCtrls = function () {
        switch (this.name) {
            case RowContainerName.TOP_CENTER:
            case RowContainerName.TOP_LEFT:
            case RowContainerName.TOP_RIGHT:
            case RowContainerName.TOP_FULL_WIDTH:
                return this.rowRenderer.getTopRowCtrls();
            case RowContainerName.STICKY_TOP_CENTER:
            case RowContainerName.STICKY_TOP_LEFT:
            case RowContainerName.STICKY_TOP_RIGHT:
            case RowContainerName.STICKY_TOP_FULL_WIDTH:
                return this.rowRenderer.getStickyTopRowCtrls();
            case RowContainerName.BOTTOM_CENTER:
            case RowContainerName.BOTTOM_LEFT:
            case RowContainerName.BOTTOM_RIGHT:
            case RowContainerName.BOTTOM_FULL_WIDTH:
                return this.rowRenderer.getBottomRowCtrls();
            default:
                return this.rowRenderer.getCentreRowCtrls();
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
        Autowired('animationFrameService')
    ], RowContainerCtrl.prototype, "animationFrameService", void 0);
    __decorate([
        Autowired('rowRenderer')
    ], RowContainerCtrl.prototype, "rowRenderer", void 0);
    __decorate([
        PostConstruct
    ], RowContainerCtrl.prototype, "postConstruct", null);
    return RowContainerCtrl;
}(BeanStub));
export { RowContainerCtrl };
