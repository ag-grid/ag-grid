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
var layoutFeature_1 = require("../styling/layoutFeature");
var constants_1 = require("../constants/constants");
var eventKeys_1 = require("../eventKeys");
var event_1 = require("../utils/event");
var gridBodyScrollFeature_1 = require("./gridBodyScrollFeature");
var dom_1 = require("../utils/dom");
var rowDragFeature_1 = require("./rowDragFeature");
var browser_1 = require("../utils/browser");
var RowAnimationCssClasses;
(function (RowAnimationCssClasses) {
    RowAnimationCssClasses["ANIMATION_ON"] = "ag-row-animation";
    RowAnimationCssClasses["ANIMATION_OFF"] = "ag-row-no-animation";
})(RowAnimationCssClasses = exports.RowAnimationCssClasses || (exports.RowAnimationCssClasses = {}));
exports.CSS_CLASS_CELL_SELECTABLE = 'ag-selectable';
exports.CSS_CLASS_FORCE_VERTICAL_SCROLL = 'ag-force-vertical-scroll';
exports.CSS_CLASS_COLUMN_MOVING = 'ag-column-moving';
var GridBodyController = /** @class */ (function (_super) {
    __extends(GridBodyController, _super);
    function GridBodyController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridBodyController.prototype.getScrollFeature = function () {
        return this.bodyScrollFeature;
    };
    GridBodyController.prototype.getBodyViewportElement = function () {
        return this.eBodyViewport;
    };
    GridBodyController.prototype.setView = function (view, eGridBody, eBodyViewport, eTop, eBottom) {
        this.view = view;
        this.eGridBody = eGridBody;
        this.eBodyViewport = eBodyViewport;
        this.eTop = eTop;
        this.eBottom = eBottom;
        this.setCellTextSelection(this.gridOptionsWrapper.isEnableCellTextSelect());
        this.createManagedBean(new layoutFeature_1.LayoutFeature(this.view));
        this.bodyScrollFeature = this.createManagedBean(new gridBodyScrollFeature_1.GridBodyScrollFeature(this.eBodyViewport));
        this.addRowDragListener();
        this.setupRowAnimationCssClass();
        this.controllersService.registerGridBodyController(this);
        this.addEventListeners();
        this.onGridColumnsChanged();
        this.addBodyViewportListener();
        this.setFloatingHeights();
        this.disableBrowserDragging();
        this.addStopEditingWhenGridLosesFocus();
    };
    GridBodyController.prototype.addEventListeners = function () {
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_PINNED_ROW_DATA_CHANGED, this.setFloatingHeights.bind(this));
    };
    // used by ColumnAnimationService
    GridBodyController.prototype.setColumnMovingCss = function (moving) {
        this.view.setColumnMovingCss(moving);
    };
    GridBodyController.prototype.setCellTextSelection = function (selectable) {
        if (selectable === void 0) { selectable = false; }
        this.view.setCellSelectableCss(selectable);
    };
    GridBodyController.prototype.onScrollVisibilityChanged = function () {
        var show = this.scrollVisibleService.isVerticalScrollShowing();
        this.view.setVerticalScrollPaddingVisible(show);
    };
    GridBodyController.prototype.onGridColumnsChanged = function () {
        var columns = this.columnController.getAllGridColumns();
        this.view.setColumnCount(columns ? columns.length : 0);
    };
    // if we do not do this, then the user can select a pic in the grid (eg an image in a custom cell renderer)
    // and then that will start the browser native drag n' drop, which messes up with our own drag and drop.
    GridBodyController.prototype.disableBrowserDragging = function () {
        this.addManagedListener(this.eGridBody, 'dragstart', function (event) {
            if (event.target instanceof HTMLImageElement) {
                event.preventDefault();
                return false;
            }
        });
    };
    GridBodyController.prototype.addStopEditingWhenGridLosesFocus = function () {
        var _this = this;
        if (!this.gridOptionsWrapper.isStopEditingWhenCellsLoseFocus()) {
            return;
        }
        var focusOutListener = function (event) {
            // this is the element the focus is moving to
            var elementWithFocus = event.relatedTarget;
            if (browser_1.getTabIndex(elementWithFocus) === null) {
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
    GridBodyController.prototype.updateRowCount = function () {
        var headerCount = this.headerNavigationService.getHeaderRowCount();
        var modelType = this.paginationProxy.getType();
        var rowCount = -1;
        if (modelType === constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            rowCount = 0;
            this.paginationProxy.forEachNode(function (node) {
                if (!node.group) {
                    rowCount++;
                }
            });
        }
        var total = rowCount === -1 ? -1 : (headerCount + rowCount);
        this.view.setRowCount(total);
    };
    GridBodyController.prototype.registerBodyViewportResizeListener = function (listener) {
        this.view.registerBodyViewportResizeListener(listener);
    };
    GridBodyController.prototype.setVerticalScrollPaddingVisible = function (visible) {
        this.view.setVerticalScrollPaddingVisible(visible);
    };
    GridBodyController.prototype.isVerticalScrollShowing = function () {
        var isAlwaysShowVerticalScroll = this.gridOptionsWrapper.isAlwaysShowVerticalScroll();
        this.view.setAlwaysVerticalScrollClass(isAlwaysShowVerticalScroll);
        return isAlwaysShowVerticalScroll || dom_1.isVerticalScrollShowing(this.eBodyViewport);
    };
    GridBodyController.prototype.setupRowAnimationCssClass = function () {
        var _this = this;
        var listener = function () {
            // we don't want to use row animation if scaling, as rows jump strangely as you scroll,
            // when scaling and doing row animation.
            var animateRows = _this.gridOptionsWrapper.isAnimateRows() && !_this.rowContainerHeightService.isStretching();
            _this.view.setRowAnimationCssOnBodyViewport(animateRows);
        };
        listener();
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_HEIGHT_SCALE_CHANGED, listener);
    };
    GridBodyController.prototype.getGridBodyElement = function () {
        return this.eGridBody;
    };
    GridBodyController.prototype.addBodyViewportListener = function () {
        var _this = this;
        // we want to listen for clicks directly on the eBodyViewport, so the user has a way of showing
        // the context menu if no rows or columns are displayed, or user simply clicks outside of a cell
        var listener = function (mouseEvent) {
            var target = event_1.getTarget(mouseEvent);
            if (target === _this.eBodyViewport || target === _this.controllersService.getCenterRowContainerCon().getViewportElement()) {
                // show it
                if (_this.contextMenuFactory) {
                    _this.contextMenuFactory.onContextMenu(mouseEvent, null, null, null, null, _this.eGridBody);
                }
            }
        };
        this.addManagedListener(this.eBodyViewport, 'contextmenu', listener);
    };
    GridBodyController.prototype.getGui = function () {
        return this.eGridBody;
    };
    // called by rowDragFeature
    GridBodyController.prototype.scrollVertically = function (pixels) {
        var oldScrollPosition = this.eBodyViewport.scrollTop;
        this.bodyScrollFeature.setVerticalScrollPosition(oldScrollPosition + pixels);
        return this.eBodyViewport.scrollTop - oldScrollPosition;
    };
    // + rangeController - used to know when to scroll when user is dragging outside the
    // main viewport while doing a range selection
    GridBodyController.prototype.getBodyClientRect = function () {
        if (!this.eBodyViewport) {
            return;
        }
        return this.eBodyViewport.getBoundingClientRect();
    };
    GridBodyController.prototype.addRowDragListener = function () {
        this.rowDragFeature = this.createManagedBean(new rowDragFeature_1.RowDragFeature(this.eBodyViewport));
        this.dragAndDropService.addDropTarget(this.rowDragFeature);
    };
    GridBodyController.prototype.getRowDragFeature = function () {
        return this.rowDragFeature;
    };
    GridBodyController.prototype.setFloatingHeights = function () {
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
        this.view.setTopHeight(floatingTopHeight);
        this.view.setBottomHeight(floatingBottomHeight);
        this.view.setTopDisplay(floatingTopHeight ? 'inherit' : 'none');
        this.view.setBottomDisplay(floatingBottomHeight ? 'inherit' : 'none');
    };
    // method will call itself if no available width. this covers if the grid
    // isn't visible, but is just about to be visible.
    GridBodyController.prototype.sizeColumnsToFit = function (nextTimeout) {
        var _this = this;
        // IE is different to the other browsers, it already removes the scroll width
        // while calling window.getComputedStyle() (which is called by getInnerWidth())
        var removeScrollWidth = this.isVerticalScrollShowing() && !browser_1.isBrowserIE();
        var scrollWidthToRemove = removeScrollWidth ? this.gridOptionsWrapper.getScrollbarWidth() : 0;
        var bodyViewportWidth = dom_1.getInnerWidth(this.eBodyViewport);
        var availableWidth = bodyViewportWidth - scrollWidthToRemove;
        if (availableWidth > 0) {
            this.columnController.sizeColumnsToFit(availableWidth, "sizeColumnsToFit");
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
    __decorate([
        context_1.Autowired('rowContainerHeightService')
    ], GridBodyController.prototype, "rowContainerHeightService", void 0);
    __decorate([
        context_1.Autowired('controllersService')
    ], GridBodyController.prototype, "controllersService", void 0);
    __decorate([
        context_1.Autowired('columnController')
    ], GridBodyController.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('scrollVisibleService')
    ], GridBodyController.prototype, "scrollVisibleService", void 0);
    __decorate([
        context_1.Optional('contextMenuFactory')
    ], GridBodyController.prototype, "contextMenuFactory", void 0);
    __decorate([
        context_1.Autowired('headerNavigationService')
    ], GridBodyController.prototype, "headerNavigationService", void 0);
    __decorate([
        context_1.Autowired('paginationProxy')
    ], GridBodyController.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService')
    ], GridBodyController.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('pinnedRowModel')
    ], GridBodyController.prototype, "pinnedRowModel", void 0);
    __decorate([
        context_1.Autowired('rowRenderer')
    ], GridBodyController.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired('popupService')
    ], GridBodyController.prototype, "popupService", void 0);
    __decorate([
        context_1.Autowired('mouseEventService')
    ], GridBodyController.prototype, "mouseEventService", void 0);
    return GridBodyController;
}(beanStub_1.BeanStub));
exports.GridBodyController = GridBodyController;

//# sourceMappingURL=gridBodyController.js.map
