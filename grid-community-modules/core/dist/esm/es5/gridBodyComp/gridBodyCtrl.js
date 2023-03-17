/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
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
import { BeanStub } from "../context/beanStub";
import { Autowired, Optional } from "../context/context";
import { LayoutFeature } from "../styling/layoutFeature";
import { Events } from "../eventKeys";
import { GridBodyScrollFeature } from "./gridBodyScrollFeature";
import { getInnerWidth, isElementChildOfClass, isVerticalScrollShowing } from "../utils/dom";
import { RowDragFeature } from "./rowDragFeature";
import { getTabIndex, isInvisibleScrollbar, isIOSUserAgent } from "../utils/browser";
import { TouchListener } from "../widgets/touchListener";
export var RowAnimationCssClasses;
(function (RowAnimationCssClasses) {
    RowAnimationCssClasses["ANIMATION_ON"] = "ag-row-animation";
    RowAnimationCssClasses["ANIMATION_OFF"] = "ag-row-no-animation";
})(RowAnimationCssClasses || (RowAnimationCssClasses = {}));
export var CSS_CLASS_CELL_SELECTABLE = 'ag-selectable';
export var CSS_CLASS_FORCE_VERTICAL_SCROLL = 'ag-force-vertical-scroll';
export var CSS_CLASS_COLUMN_MOVING = 'ag-column-moving';
var GridBodyCtrl = /** @class */ (function (_super) {
    __extends(GridBodyCtrl, _super);
    function GridBodyCtrl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.stickyTopHeight = 0;
        return _this;
    }
    GridBodyCtrl.prototype.getScrollFeature = function () {
        return this.bodyScrollFeature;
    };
    GridBodyCtrl.prototype.getBodyViewportElement = function () {
        return this.eBodyViewport;
    };
    GridBodyCtrl.prototype.setComp = function (comp, eGridBody, eBodyViewport, eTop, eBottom, eStickyTop) {
        this.comp = comp;
        this.eGridBody = eGridBody;
        this.eBodyViewport = eBodyViewport;
        this.eTop = eTop;
        this.eBottom = eBottom;
        this.eStickyTop = eStickyTop;
        this.setCellTextSelection(this.gridOptionsService.is('enableCellTextSelection'));
        this.createManagedBean(new LayoutFeature(this.comp));
        this.bodyScrollFeature = this.createManagedBean(new GridBodyScrollFeature(this.eBodyViewport));
        this.addRowDragListener();
        this.setupRowAnimationCssClass();
        this.addEventListeners();
        this.addFocusListeners([eTop, eBodyViewport, eBottom, eStickyTop]);
        this.onGridColumnsChanged();
        this.addBodyViewportListener();
        this.setFloatingHeights();
        this.disableBrowserDragging();
        this.addStopEditingWhenGridLosesFocus();
        this.ctrlsService.registerGridBodyCtrl(this);
    };
    GridBodyCtrl.prototype.getComp = function () {
        return this.comp;
    };
    GridBodyCtrl.prototype.addEventListeners = function () {
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.onPinnedRowDataChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_HEADER_HEIGHT_CHANGED, this.onHeaderHeightChanged.bind(this));
    };
    GridBodyCtrl.prototype.addFocusListeners = function (elements) {
        var _this = this;
        elements.forEach(function (element) {
            _this.addManagedListener(element, 'focusin', function (e) {
                var target = e.target;
                // element being focused is nested?
                var isFocusedElementNested = isElementChildOfClass(target, 'ag-root', element);
                element.classList.toggle('ag-has-focus', !isFocusedElementNested);
            });
            _this.addManagedListener(element, 'focusout', function (e) {
                var target = e.target, relatedTarget = e.relatedTarget;
                var gridContainRelatedTarget = element.contains(relatedTarget);
                var isNestedRelatedTarget = isElementChildOfClass(relatedTarget, 'ag-root', element);
                var isNestedTarget = isElementChildOfClass(target, 'ag-root', element);
                // element losing focus belongs to a nested grid,
                // it should not be handled here.
                if (isNestedTarget) {
                    return;
                }
                // the grid does not contain, or the focus element is within
                // a nested grid
                if (!gridContainRelatedTarget || isNestedRelatedTarget) {
                    element.classList.remove('ag-has-focus');
                }
            });
        });
    };
    // used by ColumnAnimationService
    GridBodyCtrl.prototype.setColumnMovingCss = function (moving) {
        this.comp.setColumnMovingCss(CSS_CLASS_COLUMN_MOVING, moving);
    };
    GridBodyCtrl.prototype.setCellTextSelection = function (selectable) {
        if (selectable === void 0) { selectable = false; }
        var cssClass = selectable ? CSS_CLASS_CELL_SELECTABLE : null;
        this.comp.setCellSelectableCss(cssClass, selectable);
    };
    GridBodyCtrl.prototype.onScrollVisibilityChanged = function () {
        var visible = this.scrollVisibleService.isVerticalScrollShowing();
        this.setVerticalScrollPaddingVisible(visible);
        this.setStickyTopWidth(visible);
        var scrollbarWidth = visible ? (this.gridOptionsService.getScrollbarWidth() || 0) : 0;
        var pad = isInvisibleScrollbar() ? 16 : 0;
        var width = "calc(100% + " + (scrollbarWidth + pad) + "px)";
        this.comp.setBodyViewportWidth(width);
    };
    GridBodyCtrl.prototype.onGridColumnsChanged = function () {
        var columns = this.columnModel.getAllGridColumns();
        this.comp.setColumnCount(columns ? columns.length : 0);
    };
    // if we do not do this, then the user can select a pic in the grid (eg an image in a custom cell renderer)
    // and then that will start the browser native drag n' drop, which messes up with our own drag and drop.
    GridBodyCtrl.prototype.disableBrowserDragging = function () {
        this.addManagedListener(this.eGridBody, 'dragstart', function (event) {
            if (event.target instanceof HTMLImageElement) {
                event.preventDefault();
                return false;
            }
        });
    };
    GridBodyCtrl.prototype.addStopEditingWhenGridLosesFocus = function () {
        var _this = this;
        if (!this.gridOptionsService.is('stopEditingWhenCellsLoseFocus')) {
            return;
        }
        var focusOutListener = function (event) {
            // this is the element the focus is moving to
            var elementWithFocus = event.relatedTarget;
            if (getTabIndex(elementWithFocus) === null) {
                _this.rowRenderer.stopEditing();
                return;
            }
            var clickInsideGrid = 
            // see if click came from inside the viewports
            viewports.some(function (viewport) { return viewport.contains(elementWithFocus); })
                // and also that it's not from a detail grid
                && _this.mouseEventService.isElementInThisGrid(elementWithFocus);
            if (!clickInsideGrid) {
                var popupService = _this.popupService;
                clickInsideGrid =
                    popupService.getActivePopups().some(function (popup) { return popup.contains(elementWithFocus); }) ||
                        popupService.isElementWithinCustomPopup(elementWithFocus);
            }
            if (!clickInsideGrid) {
                _this.rowRenderer.stopEditing();
            }
        };
        var viewports = [this.eBodyViewport, this.eBottom, this.eTop, this.eStickyTop];
        viewports.forEach(function (viewport) { return _this.addManagedListener(viewport, 'focusout', focusOutListener); });
    };
    GridBodyCtrl.prototype.updateRowCount = function () {
        var headerCount = this.headerNavigationService.getHeaderRowCount();
        var rowCount = this.rowModel.isLastRowIndexKnown() ? this.rowModel.getRowCount() : -1;
        var total = rowCount === -1 ? -1 : (headerCount + rowCount);
        this.comp.setRowCount(total);
    };
    GridBodyCtrl.prototype.registerBodyViewportResizeListener = function (listener) {
        this.comp.registerBodyViewportResizeListener(listener);
    };
    GridBodyCtrl.prototype.setVerticalScrollPaddingVisible = function (visible) {
        var overflowY = visible ? 'scroll' : 'hidden';
        this.comp.setPinnedTopBottomOverflowY(overflowY);
    };
    GridBodyCtrl.prototype.isVerticalScrollShowing = function () {
        var show = this.gridOptionsService.is('alwaysShowVerticalScroll');
        var cssClass = show ? CSS_CLASS_FORCE_VERTICAL_SCROLL : null;
        var allowVerticalScroll = this.gridOptionsService.isDomLayout('normal');
        this.comp.setAlwaysVerticalScrollClass(cssClass, show);
        return show || (allowVerticalScroll && isVerticalScrollShowing(this.eBodyViewport));
    };
    GridBodyCtrl.prototype.setupRowAnimationCssClass = function () {
        var _this = this;
        var listener = function () {
            // we don't want to use row animation if scaling, as rows jump strangely as you scroll,
            // when scaling and doing row animation.
            var animateRows = _this.gridOptionsService.isAnimateRows() && !_this.rowContainerHeightService.isStretching();
            var animateRowsCssClass = animateRows ? RowAnimationCssClasses.ANIMATION_ON : RowAnimationCssClasses.ANIMATION_OFF;
            _this.comp.setRowAnimationCssOnBodyViewport(animateRowsCssClass, animateRows);
        };
        listener();
        this.addManagedListener(this.eventService, Events.EVENT_HEIGHT_SCALE_CHANGED, listener);
        this.addManagedPropertyListener('animateRows', listener);
    };
    GridBodyCtrl.prototype.getGridBodyElement = function () {
        return this.eGridBody;
    };
    GridBodyCtrl.prototype.addBodyViewportListener = function () {
        var _this = this;
        // we want to listen for clicks directly on the eBodyViewport, so the user has a way of showing
        // the context menu if no rows or columns are displayed, or user simply clicks outside of a cell
        var listener = function (mouseEvent, touch, touchEvent) {
            if (!mouseEvent && !touchEvent) {
                return;
            }
            if (_this.gridOptionsService.is('preventDefaultOnContextMenu')) {
                var event_1 = (mouseEvent || touchEvent);
                event_1.preventDefault();
            }
            var target = (mouseEvent || touch).target;
            if (target === _this.eBodyViewport || target === _this.ctrlsService.getCenterRowContainerCtrl().getViewportElement()) {
                // show it
                if (_this.contextMenuFactory) {
                    if (mouseEvent) {
                        _this.contextMenuFactory.onContextMenu(mouseEvent, null, null, null, null, _this.eGridBody);
                    }
                    else if (touchEvent) {
                        _this.contextMenuFactory.onContextMenu(null, touchEvent, null, null, null, _this.eGridBody);
                    }
                }
            }
        };
        this.addManagedListener(this.eBodyViewport, 'contextmenu', listener);
        this.mockContextMenuForIPad(listener);
        this.addManagedListener(this.eBodyViewport, 'wheel', this.onBodyViewportWheel.bind(this));
        this.addManagedListener(this.eStickyTop, 'wheel', this.onStickyTopWheel.bind(this));
    };
    GridBodyCtrl.prototype.mockContextMenuForIPad = function (listener) {
        // we do NOT want this when not in iPad
        if (!isIOSUserAgent()) {
            return;
        }
        var touchListener = new TouchListener(this.eBodyViewport);
        var longTapListener = function (event) {
            listener(undefined, event.touchStart, event.touchEvent);
        };
        this.addManagedListener(touchListener, TouchListener.EVENT_LONG_TAP, longTapListener);
        this.addDestroyFunc(function () { return touchListener.destroy(); });
    };
    GridBodyCtrl.prototype.onBodyViewportWheel = function (e) {
        if (!this.gridOptionsService.is('suppressScrollWhenPopupsAreOpen')) {
            return;
        }
        if (this.popupService.hasAnchoredPopup()) {
            e.preventDefault();
        }
    };
    GridBodyCtrl.prototype.onStickyTopWheel = function (e) {
        e.preventDefault();
        if (e.offsetY) {
            this.scrollVertically(e.deltaY);
        }
    };
    GridBodyCtrl.prototype.getGui = function () {
        return this.eGridBody;
    };
    // called by rowDragFeature
    GridBodyCtrl.prototype.scrollVertically = function (pixels) {
        var oldScrollPosition = this.eBodyViewport.scrollTop;
        this.bodyScrollFeature.setVerticalScrollPosition(oldScrollPosition + pixels);
        return this.eBodyViewport.scrollTop - oldScrollPosition;
    };
    GridBodyCtrl.prototype.addRowDragListener = function () {
        this.rowDragFeature = this.createManagedBean(new RowDragFeature(this.eBodyViewport));
        this.dragAndDropService.addDropTarget(this.rowDragFeature);
    };
    GridBodyCtrl.prototype.getRowDragFeature = function () {
        return this.rowDragFeature;
    };
    GridBodyCtrl.prototype.onPinnedRowDataChanged = function () {
        this.setFloatingHeights();
    };
    GridBodyCtrl.prototype.setFloatingHeights = function () {
        var pinnedRowModel = this.pinnedRowModel;
        var floatingTopHeight = pinnedRowModel.getPinnedTopTotalHeight();
        if (floatingTopHeight) {
            // adding 1px for cell bottom border
            floatingTopHeight += 1;
        }
        var floatingBottomHeight = pinnedRowModel.getPinnedBottomTotalHeight();
        if (floatingBottomHeight) {
            // adding 1px for cell bottom border
            floatingBottomHeight += 1;
        }
        this.comp.setTopHeight(floatingTopHeight);
        this.comp.setBottomHeight(floatingBottomHeight);
        this.comp.setTopDisplay(floatingTopHeight ? 'inherit' : 'none');
        this.comp.setBottomDisplay(floatingBottomHeight ? 'inherit' : 'none');
        this.setStickyTopOffsetTop();
    };
    GridBodyCtrl.prototype.setStickyTopHeight = function (height) {
        if (height === void 0) { height = 0; }
        // console.log('setting sticky top height ' + height);
        this.comp.setStickyTopHeight(height + "px");
        this.stickyTopHeight = height;
    };
    GridBodyCtrl.prototype.getStickyTopHeight = function () {
        return this.stickyTopHeight;
    };
    GridBodyCtrl.prototype.setStickyTopWidth = function (vScrollVisible) {
        if (!vScrollVisible) {
            this.comp.setStickyTopWidth('100%');
        }
        else {
            var scrollbarWidth = this.gridOptionsService.getScrollbarWidth();
            this.comp.setStickyTopWidth("calc(100% - " + scrollbarWidth + "px)");
        }
    };
    GridBodyCtrl.prototype.onHeaderHeightChanged = function () {
        this.setStickyTopOffsetTop();
    };
    GridBodyCtrl.prototype.setStickyTopOffsetTop = function () {
        var headerCtrl = this.ctrlsService.getGridHeaderCtrl();
        var headerHeight = headerCtrl.getHeaderHeight();
        var pinnedTopHeight = this.pinnedRowModel.getPinnedTopTotalHeight();
        var height = 0;
        if (headerHeight > 0) {
            height += headerHeight + 1;
        }
        if (pinnedTopHeight > 0) {
            height += pinnedTopHeight + 1;
        }
        this.comp.setStickyTopTop(height + "px");
    };
    // method will call itself if no available width. this covers if the grid
    // isn't visible, but is just about to be visible.
    GridBodyCtrl.prototype.sizeColumnsToFit = function (params, nextTimeout) {
        var _this = this;
        var removeScrollWidth = this.isVerticalScrollShowing();
        var scrollWidthToRemove = removeScrollWidth ? this.gridOptionsService.getScrollbarWidth() : 0;
        // bodyViewportWidth should be calculated from eGridBody, not eBodyViewport
        // because we change the width of the bodyViewport to hide the real browser scrollbar
        var bodyViewportWidth = getInnerWidth(this.eGridBody);
        var availableWidth = bodyViewportWidth - scrollWidthToRemove;
        if (availableWidth > 0) {
            this.columnModel.sizeColumnsToFit(availableWidth, "sizeColumnsToFit", false, params);
            return;
        }
        if (nextTimeout === undefined) {
            window.setTimeout(function () {
                _this.sizeColumnsToFit(params, 100);
            }, 0);
        }
        else if (nextTimeout === 100) {
            window.setTimeout(function () {
                _this.sizeColumnsToFit(params, 500);
            }, 100);
        }
        else if (nextTimeout === 500) {
            window.setTimeout(function () {
                _this.sizeColumnsToFit(params, -1);
            }, 500);
        }
        else {
            console.warn('AG Grid: tried to call sizeColumnsToFit() but the grid is coming back with ' +
                'zero width, maybe the grid is not visible yet on the screen?');
        }
    };
    // + rangeService
    GridBodyCtrl.prototype.addScrollEventListener = function (listener) {
        this.eBodyViewport.addEventListener('scroll', listener, { passive: true });
    };
    // + focusService
    GridBodyCtrl.prototype.removeScrollEventListener = function (listener) {
        this.eBodyViewport.removeEventListener('scroll', listener);
    };
    __decorate([
        Autowired('rowContainerHeightService')
    ], GridBodyCtrl.prototype, "rowContainerHeightService", void 0);
    __decorate([
        Autowired('ctrlsService')
    ], GridBodyCtrl.prototype, "ctrlsService", void 0);
    __decorate([
        Autowired('columnModel')
    ], GridBodyCtrl.prototype, "columnModel", void 0);
    __decorate([
        Autowired('scrollVisibleService')
    ], GridBodyCtrl.prototype, "scrollVisibleService", void 0);
    __decorate([
        Optional('contextMenuFactory')
    ], GridBodyCtrl.prototype, "contextMenuFactory", void 0);
    __decorate([
        Autowired('headerNavigationService')
    ], GridBodyCtrl.prototype, "headerNavigationService", void 0);
    __decorate([
        Autowired('dragAndDropService')
    ], GridBodyCtrl.prototype, "dragAndDropService", void 0);
    __decorate([
        Autowired('pinnedRowModel')
    ], GridBodyCtrl.prototype, "pinnedRowModel", void 0);
    __decorate([
        Autowired('rowRenderer')
    ], GridBodyCtrl.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired('popupService')
    ], GridBodyCtrl.prototype, "popupService", void 0);
    __decorate([
        Autowired('mouseEventService')
    ], GridBodyCtrl.prototype, "mouseEventService", void 0);
    __decorate([
        Autowired('rowModel')
    ], GridBodyCtrl.prototype, "rowModel", void 0);
    return GridBodyCtrl;
}(BeanStub));
export { GridBodyCtrl };
