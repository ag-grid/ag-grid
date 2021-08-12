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
import { BeanStub } from "../context/beanStub";
import { Autowired, Optional } from "../context/context";
import { LayoutFeature } from "../styling/layoutFeature";
import { Constants } from "../constants/constants";
import { Events } from "../eventKeys";
import { getTarget } from "../utils/event";
import { GridBodyScrollFeature } from "./gridBodyScrollFeature";
import { getInnerWidth, isVerticalScrollShowing, addCssClass, removeCssClass } from "../utils/dom";
import { RowDragFeature } from "./rowDragFeature";
import { getTabIndex, isBrowserIE } from "../utils/browser";
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
        _this.angularApplyTriggered = false;
        return _this;
    }
    GridBodyCtrl.prototype.getScrollFeature = function () {
        return this.bodyScrollFeature;
    };
    GridBodyCtrl.prototype.getBodyViewportElement = function () {
        return this.eBodyViewport;
    };
    GridBodyCtrl.prototype.setComp = function (comp, eGridBody, eBodyViewport, eTop, eBottom) {
        this.comp = comp;
        this.eGridBody = eGridBody;
        this.eBodyViewport = eBodyViewport;
        this.eTop = eTop;
        this.eBottom = eBottom;
        this.setCellTextSelection(this.gridOptionsWrapper.isEnableCellTextSelect());
        this.createManagedBean(new LayoutFeature(this.comp));
        this.bodyScrollFeature = this.createManagedBean(new GridBodyScrollFeature(this.eBodyViewport));
        this.addRowDragListener();
        this.setupRowAnimationCssClass();
        this.ctrlsService.registerGridBodyCtrl(this);
        this.addEventListeners();
        this.addFocusListeners([eTop, eBodyViewport, eBottom]);
        this.onGridColumnsChanged();
        this.addBodyViewportListener();
        this.setFloatingHeights();
        this.disableBrowserDragging();
        this.addStopEditingWhenGridLosesFocus();
        if (this.$scope) {
            this.addAngularApplyCheck();
        }
    };
    GridBodyCtrl.prototype.getComp = function () {
        return this.comp;
    };
    GridBodyCtrl.prototype.addEventListeners = function () {
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.setFloatingHeights.bind(this));
    };
    GridBodyCtrl.prototype.addFocusListeners = function (elements) {
        var _this = this;
        elements.forEach(function (element) {
            _this.addManagedListener(element, 'focusin', function () {
                addCssClass(element, 'ag-has-focus');
            });
            _this.addManagedListener(element, 'focusout', function (e) {
                if (!element.contains(e.relatedTarget)) {
                    removeCssClass(element, 'ag-has-focus');
                }
            });
        });
    };
    // used by ColumnAnimationService
    GridBodyCtrl.prototype.setColumnMovingCss = function (moving) {
        this.comp.setColumnMovingCss(moving ? CSS_CLASS_COLUMN_MOVING : null, moving);
    };
    GridBodyCtrl.prototype.setCellTextSelection = function (selectable) {
        if (selectable === void 0) { selectable = false; }
        var cssClass = selectable ? CSS_CLASS_CELL_SELECTABLE : null;
        this.comp.setCellSelectableCss(cssClass, selectable);
    };
    GridBodyCtrl.prototype.onScrollVisibilityChanged = function () {
        var visible = this.scrollVisibleService.isVerticalScrollShowing();
        this.setVerticalScrollPaddingVisible(visible);
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
        if (!this.gridOptionsWrapper.isStopEditingWhenCellsLoseFocus()) {
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
        var viewports = [this.eBodyViewport, this.eBottom, this.eTop];
        viewports.forEach(function (viewport) { return _this.addManagedListener(viewport, 'focusout', focusOutListener); });
    };
    GridBodyCtrl.prototype.updateRowCount = function () {
        var headerCount = this.headerNavigationService.getHeaderRowCount();
        var modelType = this.paginationProxy.getType();
        var rowCount = -1;
        if (modelType === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            rowCount = 0;
            this.paginationProxy.forEachNode(function (node) {
                if (!node.group) {
                    rowCount++;
                }
            });
        }
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
        var show = this.gridOptionsWrapper.isAlwaysShowVerticalScroll();
        var cssClass = show ? CSS_CLASS_FORCE_VERTICAL_SCROLL : null;
        this.comp.setAlwaysVerticalScrollClass(cssClass, show);
        return show || isVerticalScrollShowing(this.eBodyViewport);
    };
    GridBodyCtrl.prototype.setupRowAnimationCssClass = function () {
        var _this = this;
        var listener = function () {
            // we don't want to use row animation if scaling, as rows jump strangely as you scroll,
            // when scaling and doing row animation.
            var animateRows = _this.gridOptionsWrapper.isAnimateRows() && !_this.rowContainerHeightService.isStretching();
            var animateRowsCssClass = animateRows ? RowAnimationCssClasses.ANIMATION_ON : RowAnimationCssClasses.ANIMATION_OFF;
            _this.comp.setRowAnimationCssOnBodyViewport(animateRowsCssClass, animateRows);
        };
        listener();
        this.addManagedListener(this.eventService, Events.EVENT_HEIGHT_SCALE_CHANGED, listener);
    };
    GridBodyCtrl.prototype.getGridBodyElement = function () {
        return this.eGridBody;
    };
    GridBodyCtrl.prototype.addBodyViewportListener = function () {
        var _this = this;
        // we want to listen for clicks directly on the eBodyViewport, so the user has a way of showing
        // the context menu if no rows or columns are displayed, or user simply clicks outside of a cell
        var listener = function (mouseEvent) {
            var target = getTarget(mouseEvent);
            if (target === _this.eBodyViewport || target === _this.ctrlsService.getCenterRowContainerCtrl().getViewportElement()) {
                // show it
                if (_this.contextMenuFactory) {
                    _this.contextMenuFactory.onContextMenu(mouseEvent, null, null, null, null, _this.eGridBody);
                }
            }
        };
        this.addManagedListener(this.eBodyViewport, 'contextmenu', listener);
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
    // + focusService - used to know when to scroll when user is dragging outside the
    // main viewport while doing a range selection
    GridBodyCtrl.prototype.getBodyClientRect = function () {
        if (!this.eBodyViewport) {
            return;
        }
        return this.eBodyViewport.getBoundingClientRect();
    };
    GridBodyCtrl.prototype.addRowDragListener = function () {
        this.rowDragFeature = this.createManagedBean(new RowDragFeature(this.eBodyViewport));
        this.dragAndDropService.addDropTarget(this.rowDragFeature);
    };
    GridBodyCtrl.prototype.getRowDragFeature = function () {
        return this.rowDragFeature;
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
    };
    // method will call itself if no available width. this covers if the grid
    // isn't visible, but is just about to be visible.
    GridBodyCtrl.prototype.sizeColumnsToFit = function (nextTimeout) {
        var _this = this;
        // IE is different to the other browsers, it already removes the scroll width
        // while calling window.getComputedStyle() (which is called by getInnerWidth())
        var removeScrollWidth = this.isVerticalScrollShowing() && !isBrowserIE();
        var scrollWidthToRemove = removeScrollWidth ? this.gridOptionsWrapper.getScrollbarWidth() : 0;
        var bodyViewportWidth = getInnerWidth(this.eBodyViewport);
        var availableWidth = bodyViewportWidth - scrollWidthToRemove;
        if (availableWidth > 0) {
            this.columnModel.sizeColumnsToFit(availableWidth, "sizeColumnsToFit");
            return;
        }
        if (nextTimeout === undefined) {
            window.setTimeout(function () {
                _this.sizeColumnsToFit(100);
            }, 0);
        }
        else if (nextTimeout === 100) {
            window.setTimeout(function () {
                _this.sizeColumnsToFit(500);
            }, 100);
        }
        else if (nextTimeout === 500) {
            window.setTimeout(function () {
                _this.sizeColumnsToFit(-1);
            }, 500);
        }
        else {
            console.warn('AG Grid: tried to call sizeColumnsToFit() but the grid is coming back with ' +
                'zero width, maybe the grid is not visible yet on the screen?');
        }
    };
    // + rangeService
    GridBodyCtrl.prototype.addScrollEventListener = function (listener) {
        this.eBodyViewport.addEventListener('scroll', listener);
    };
    // + focusService
    GridBodyCtrl.prototype.removeScrollEventListener = function (listener) {
        this.eBodyViewport.removeEventListener('scroll', listener);
    };
    GridBodyCtrl.prototype.requestAngularApply = function () {
        var _this = this;
        if (this.angularApplyTriggered) {
            return;
        }
        this.angularApplyTriggered = true;
        window.setTimeout(function () {
            _this.angularApplyTriggered = false;
            _this.$scope.$apply();
        }, 0);
    };
    GridBodyCtrl.prototype.addAngularApplyCheck = function () {
        var _this = this;
        // these are the events we need to do an apply after - these are the ones that can end up
        // with columns added or removed
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, function () { return _this.requestAngularApply(); });
        this.addManagedListener(this.eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, function () { return _this.requestAngularApply(); });
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
        Autowired('paginationProxy')
    ], GridBodyCtrl.prototype, "paginationProxy", void 0);
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
        Autowired('$scope')
    ], GridBodyCtrl.prototype, "$scope", void 0);
    return GridBodyCtrl;
}(BeanStub));
export { GridBodyCtrl };
