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
var utils_1 = require("../utils");
var resizeObserver_1 = require("../resizeObserver");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var columnController_1 = require("../columnController/columnController");
var columnApi_1 = require("../columnController/columnApi");
var rowRenderer_1 = require("../rendering/rowRenderer");
var context_1 = require("../context/context");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var dragService_1 = require("../dragAndDrop/dragService");
var constants_1 = require("../constants");
var selectionController_1 = require("../selectionController");
var csvCreator_1 = require("../csvCreator");
var mouseEventService_1 = require("./mouseEventService");
var focusedCellController_1 = require("../focusedCellController");
var scrollVisibleService_1 = require("./scrollVisibleService");
var rowContainerComponent_1 = require("../rendering/rowContainerComponent");
var paginationProxy_1 = require("../rowModels/paginationProxy");
var popupEditorWrapper_1 = require("../rendering/cellEditors/popupEditorWrapper");
var alignedGridsService_1 = require("../alignedGridsService");
var pinnedRowModel_1 = require("../rowModels/pinnedRowModel");
var gridApi_1 = require("../gridApi");
var animationFrameService_1 = require("../misc/animationFrameService");
var rowComp_1 = require("../rendering/rowComp");
var navigationService_1 = require("./navigationService");
var valueService_1 = require("../valueService/valueService");
var touchListener_1 = require("../widgets/touchListener");
var componentRecipes_1 = require("../components/framework/componentRecipes");
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var rowDragFeature_1 = require("./rowDragFeature");
var heightScaler_1 = require("../rendering/heightScaler");
var component_1 = require("../widgets/component");
var autoHeightCalculator_1 = require("../rendering/autoHeightCalculator");
var columnAnimationService_1 = require("../rendering/columnAnimationService");
var autoWidthCalculator_1 = require("../rendering/autoWidthCalculator");
var beans_1 = require("../rendering/beans");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var headerRootComp_1 = require("../headerRendering/headerRootComp");
// in the html below, it is important that there are no white space between some of the divs, as if there is white space,
// it won't render correctly in safari, as safari renders white space as a gap
var GRID_PANEL_NORMAL_TEMPLATE = "<div class=\"ag-root ag-font-style\" role=\"grid\">\n        <ag-header-root ref=\"headerRoot\"></ag-header-root>\n        <div class=\"ag-floating-top\" ref=\"eTop\" role=\"presentation\">\n            <div class=\"ag-pinned-left-floating-top\" ref=\"eLeftTop\" role=\"presentation\"></div>\n            <div class=\"ag-floating-top-viewport\" ref=\"eTopViewport\" role=\"presentation\">\n                <div class=\"ag-floating-top-container\" ref=\"eTopContainer\" role=\"presentation\"></div>\n            </div>\n            <div class=\"ag-pinned-right-floating-top\" ref=\"eRightTop\" role=\"presentation\"></div>\n            <div class=\"ag-floating-top-full-width-container\" ref=\"eTopFullWidthContainer\" role=\"presentation\"></div>\n        </div>\n        <div class=\"ag-body\" ref=\"eBody\" role=\"presentation\">\n            <div class=\"ag-pinned-left-cols-viewport-wrapper\" ref=\"eLeftViewportWrapper\" role=\"presentation\">\n                <div class=\"ag-pinned-left-cols-viewport\" ref=\"eLeftViewport\" role=\"presentation\">\n                    <div class=\"ag-pinned-left-cols-container\" ref=\"eLeftContainer\" role=\"presentation\"></div>\n                </div>\n            </div>\n            <div class=\"ag-body-viewport-wrapper\" role=\"presentation\">\n                <div class=\"ag-body-viewport\" ref=\"eBodyViewport\" role=\"presentation\">\n                    <div class=\"ag-body-container\" ref=\"eBodyContainer\" role=\"presentation\"></div>\n                </div>\n            </div>\n            <div class=\"ag-pinned-right-cols-viewport-wrapper\" ref=\"eRightViewportWrapper\" role=\"presentation\">\n                <div class=\"ag-pinned-right-cols-viewport\" ref=\"eRightViewport\" role=\"presentation\">\n                    <div class=\"ag-pinned-right-cols-container\" ref=\"eRightContainer\" role=\"presentation\"></div>\n                </div>\n            </div>\n            <div class=\"ag-full-width-viewport-wrapper\" ref=\"eFullWidthViewportWrapper\" role=\"presentation\">\n                <div class=\"ag-full-width-viewport\" ref=\"eFullWidthViewport\" role=\"presentation\">\n                    <div class=\"ag-full-width-container\" ref=\"eFullWidthContainer\" role=\"presentation\"></div>\n                </div>\n            </div>\n        </div>\n        <div class=\"ag-floating-bottom\" ref=\"eBottom\" role=\"presentation\">\n            <div class=\"ag-pinned-left-floating-bottom\" ref=\"eLeftBottom\" role=\"presentation\"></div>\n            <div class=\"ag-floating-bottom-viewport\" ref=\"eBottomViewport\" role=\"presentation\">\n                <div class=\"ag-floating-bottom-container\" ref=\"eBottomContainer\" role=\"presentation\"></div>\n            </div>\n            <div class=\"ag-pinned-right-floating-bottom\" ref=\"eRightBottom\" role=\"presentation\"></div>\n            <div class=\"ag-floating-bottom-full-width-container\" ref=\"eBottomFullWidthContainer\" role=\"presentation\"></div>\n        </div>\n        <div class=\"ag-overlay\" ref=\"eOverlay\"></div>\n    </div>";
var GridPanel = (function (_super) {
    __extends(GridPanel, _super);
    function GridPanel() {
        var _this = _super.call(this, GRID_PANEL_NORMAL_TEMPLATE) || this;
        _this.scrollLeft = -1;
        _this.nextScrollLeft = -1;
        _this.scrollTop = -1;
        _this.nextScrollTop = -1;
        _this.verticalRedrawNeeded = false;
        return _this;
    }
    GridPanel.prototype.getVScrollPosition = function () {
        var result = {
            top: this.eBodyViewport.scrollTop,
            bottom: this.eBodyViewport.scrollTop + this.eBodyViewport.offsetHeight
        };
        return result;
    };
    // used by range controller
    GridPanel.prototype.getHScrollPosition = function () {
        var result = {
            left: this.eBodyViewport.scrollLeft,
            right: this.eBodyViewport.scrollTop + this.eBodyViewport.offsetWidth
        };
        return result;
    };
    // we override this, as the base class is missing the annotation
    GridPanel.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    GridPanel.prototype.onRowDataChanged = function () {
        this.showOrHideOverlay();
    };
    GridPanel.prototype.showOrHideOverlay = function () {
        if (this.paginationProxy.isEmpty() && !this.gridOptionsWrapper.isSuppressNoRowsOverlay()) {
            this.showNoRowsOverlay();
        }
        else {
            this.hideOverlay();
        }
    };
    GridPanel.prototype.onNewColumnsLoaded = function () {
        // hide overlay if columns and rows exist, this can happen if columns are loaded after data.
        // this problem exists before of the race condition between the services (column controller in this case)
        // and the view (grid panel). if the model beans were all initialised first, and then the view beans second,
        // this race condition would not happen.
        if (this.columnController.isReady() && !this.paginationProxy.isEmpty()) {
            this.hideOverlay();
        }
    };
    GridPanel.prototype.init = function () {
        this.instantiate(this.context);
        // makes code below more readable if we pull 'forPrint' out
        this.scrollWidth = this.gridOptionsWrapper.getScrollbarWidth();
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.useAnimationFrame = !this.gridOptionsWrapper.isSuppressAnimationFrame();
        // if the browser is Windows based, then the scrollbars take up space, and we clip by
        // the width of the scrollbar. however if the scroll bars do not take up space (iOS)
        // then they overlay on top of the div, so we clip some extra blank space instead.
        this.scrollClipWidth = this.scrollWidth > 0 ? this.scrollWidth : 20;
        // all of these element have different CSS when layout changes
        this.gridOptionsWrapper.addLayoutElement(this.getGui());
        this.gridOptionsWrapper.addLayoutElement(this.eBody);
        this.gridOptionsWrapper.addLayoutElement(this.eBodyViewport);
        this.gridOptionsWrapper.addLayoutElement(this.eTopViewport);
        this.gridOptionsWrapper.addLayoutElement(this.eBodyContainer);
        this.suppressScrollOnFloatingRow();
        this.setupRowAnimationCssClass();
        this.buildRowContainerComponents();
        this.addEventListeners();
        this.addDragListeners();
        this.addScrollListener();
        if (this.gridOptionsWrapper.isSuppressHorizontalScroll()) {
            this.eBodyViewport.style.overflowX = 'hidden';
        }
        this.setupOverlay();
        if (this.gridOptionsWrapper.isRowModelDefault() && !this.gridOptionsWrapper.getRowData()) {
            this.showLoadingOverlay();
        }
        this.setPinnedContainersVisible();
        this.setBodyAndHeaderHeights();
        this.disableBrowserDragging();
        this.addShortcutKeyListeners();
        this.addMouseListeners();
        this.addKeyboardEvents();
        this.addBodyViewportListener();
        this.addStopEditingWhenGridLosesFocus();
        this.mockContextMenuForIPad();
        this.addRowDragListener();
        if (this.$scope) {
            this.addAngularApplyCheck();
        }
        this.onDisplayedColumnsWidthChanged();
        // this.addWindowResizeListener();
        this.gridApi.registerGridComp(this);
        this.alignedGridsService.registerGridComp(this);
        this.headerRootComp.registerGridComp(this);
        this.animationFrameService.registerGridComp(this);
        this.navigationService.registerGridComp(this);
        this.heightScaler.registerGridComp(this);
        this.autoHeightCalculator.registerGridComp(this);
        this.columnAnimationService.registerGridComp(this);
        this.autoWidthCalculator.registerGridComp(this);
        this.paginationAutoPageSizeService.registerGridComp(this);
        this.beans.registerGridComp(this);
        this.rowRenderer.registerGridComp(this);
        if (this.rangeController) {
            this.rangeController.registerGridComp(this);
        }
        var unsubscribeFromResize = resizeObserver_1.observeResize(this.eBodyViewport, this.onBodyViewportResized.bind(this));
        this.addDestroyFunc(function () { return unsubscribeFromResize(); });
    };
    GridPanel.prototype.onBodyViewportResized = function () {
        this.checkViewportAndScrolls();
    };
    // used by ColumnAnimationService
    GridPanel.prototype.setColumnMovingCss = function (moving) {
        this.addOrRemoveCssClass('ag-column-moving', moving);
    };
    GridPanel.prototype.setupOverlay = function () {
        this.overlayWrapper = this.componentRecipes.newOverlayWrapperComponent();
        this.eOverlay = this.queryForHtmlElement('[ref="eOverlay"]');
        this.overlayWrapper.hideOverlay(this.eOverlay);
    };
    GridPanel.prototype.addRowDragListener = function () {
        var rowDragFeature = new rowDragFeature_1.RowDragFeature(this.eBody, this);
        this.context.wireBean(rowDragFeature);
        this.dragAndDropService.addDropTarget(rowDragFeature);
    };
    GridPanel.prototype.addStopEditingWhenGridLosesFocus = function () {
        var _this = this;
        if (this.gridOptionsWrapper.isStopEditingWhenGridLosesFocus()) {
            this.addDestroyableEventListener(this.eBody, 'focusout', function (event) {
                // this is the element the focus is moving to
                var elementWithFocus = event.relatedTarget;
                // see if the element the focus is going to is part of the grid
                var clickInsideGrid = false;
                var pointer = elementWithFocus;
                while (utils_1.Utils.exists(pointer) && !clickInsideGrid) {
                    var isPopup = !!_this.gridOptionsWrapper.getDomData(pointer, popupEditorWrapper_1.PopupEditorWrapper.DOM_KEY_POPUP_EDITOR_WRAPPER);
                    var isBody = _this.eBody == pointer;
                    clickInsideGrid = isPopup || isBody;
                    pointer = pointer.parentNode;
                }
                if (!clickInsideGrid) {
                    _this.rowRenderer.stopEditing();
                }
            });
        }
    };
    GridPanel.prototype.addAngularApplyCheck = function () {
        var _this = this;
        // this makes sure if we queue up requests, we only execute oe
        var applyTriggered = false;
        var listener = function () {
            // only need to do one apply at a time
            if (applyTriggered) {
                return;
            }
            applyTriggered = true; // mark 'need apply' to true
            setTimeout(function () {
                applyTriggered = false;
                _this.$scope.$apply();
            }, 0);
        };
        // these are the events we need to do an apply after - these are the ones that can end up
        // with columns added or removed
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED, listener);
    };
    // if we do not do this, then the user can select a pic in the grid (eg an image in a custom cell renderer)
    // and then that will start the browser native drag n' drop, which messes up with our own drag and drop.
    GridPanel.prototype.disableBrowserDragging = function () {
        this.getGui().addEventListener('dragstart', function (event) {
            if (event.target instanceof HTMLImageElement) {
                event.preventDefault();
                return false;
            }
        });
    };
    GridPanel.prototype.addEventListeners = function () {
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_PINNED_ROW_DATA_CHANGED, this.setBodyAndHeaderHeights.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_ROW_DATA_CHANGED, this.onRowDataChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_ROW_DATA_UPDATED, this.onRowDataChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_HEADER_HEIGHT, this.setBodyAndHeaderHeights.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, this.setBodyAndHeaderHeights.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, this.setBodyAndHeaderHeights.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, this.setBodyAndHeaderHeights.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, this.setBodyAndHeaderHeights.bind(this));
    };
    GridPanel.prototype.addDragListeners = function () {
        var _this = this;
        if (!this.gridOptionsWrapper.isEnableRangeSelection() // no range selection if no property
            || utils_1.Utils.missing(this.rangeController)) {
            return;
        }
        var containers = [this.eLeftContainer, this.eRightContainer, this.eBodyContainer,
            this.eTop, this.eBottom];
        containers.forEach(function (container) {
            var params = {
                eElement: container,
                onDragStart: _this.rangeController.onDragStart.bind(_this.rangeController),
                onDragStop: _this.rangeController.onDragStop.bind(_this.rangeController),
                onDragging: _this.rangeController.onDragging.bind(_this.rangeController),
                // for range selection by dragging the mouse, we want to ignore the event if shift key is pressed,
                // as shift key click is another type of range selection
                skipMouseEvent: function (mouseEvent) { return mouseEvent.shiftKey; }
            };
            _this.dragService.addDragSource(params);
            _this.addDestroyFunc(function () { return _this.dragService.removeDragSource(params); });
        });
    };
    GridPanel.prototype.addMouseListeners = function () {
        var _this = this;
        var eventNames = ['click', 'mousedown', 'dblclick', 'contextmenu', 'mouseover', 'mouseout'];
        eventNames.forEach(function (eventName) {
            var listener = _this.processMouseEvent.bind(_this, eventName);
            _this.eAllCellContainers.forEach(function (container) {
                return _this.addDestroyableEventListener(container, eventName, listener);
            });
        });
    };
    GridPanel.prototype.addKeyboardEvents = function () {
        var _this = this;
        var eventNames = ['keydown', 'keypress'];
        eventNames.forEach(function (eventName) {
            var listener = _this.processKeyboardEvent.bind(_this, eventName);
            _this.eAllCellContainers.forEach(function (container) {
                _this.addDestroyableEventListener(container, eventName, listener);
            });
        });
    };
    GridPanel.prototype.addBodyViewportListener = function () {
        var _this = this;
        // we want to listen for clicks directly on the eBodyViewport, so the user has a way of showing
        // the context menu if no rows are displayed, or user simply clicks outside of a cell
        var listener = function (mouseEvent) {
            var target = utils_1.Utils.getTarget(mouseEvent);
            if (target === _this.eBodyViewport || target === _this.eLeftViewport || target === _this.eRightViewport) {
                // show it
                _this.onContextMenu(mouseEvent, null, null, null, null);
                _this.preventDefaultOnContextMenu(mouseEvent);
            }
        };
        //For some reason listening only to this.eBody doesnt work... Maybe because the event is consumed somewhere else?
        //In any case, not expending much time on this, if anyome comes accross this and knows how to make this work with
        //one listener please go ahead and change it...
        this.addDestroyableEventListener(this.eBodyViewport, 'contextmenu', listener);
        this.addDestroyableEventListener(this.eRightViewport, 'contextmenu', listener);
        this.addDestroyableEventListener(this.eLeftViewport, 'contextmenu', listener);
    };
    // + rangeController
    GridPanel.prototype.getBodyClientRect = function () {
        if (this.eBody) {
            return this.eBody.getBoundingClientRect();
        }
    };
    GridPanel.prototype.getRowForEvent = function (event) {
        var sourceElement = utils_1.Utils.getTarget(event);
        while (sourceElement) {
            var renderedRow = this.gridOptionsWrapper.getDomData(sourceElement, rowComp_1.RowComp.DOM_DATA_KEY_RENDERED_ROW);
            if (renderedRow) {
                return renderedRow;
            }
            sourceElement = sourceElement.parentElement;
        }
        return null;
    };
    GridPanel.prototype.processKeyboardEvent = function (eventName, keyboardEvent) {
        var renderedCell = this.mouseEventService.getRenderedCellForEvent(keyboardEvent);
        if (!renderedCell) {
            return;
        }
        switch (eventName) {
            case 'keydown':
                // first see if it's a scroll key, page up / down, home / end etc
                var wasScrollKey = this.navigationService.handlePageScrollingKey(keyboardEvent);
                // if not a scroll key, then we pass onto cell
                if (!wasScrollKey) {
                    renderedCell.onKeyDown(keyboardEvent);
                }
                break;
            case 'keypress':
                renderedCell.onKeyPress(keyboardEvent);
                break;
        }
    };
    // gets called by rowRenderer when new data loaded, as it will want to scroll to the top
    GridPanel.prototype.scrollToTop = function () {
        this.eBodyViewport.scrollTop = 0;
    };
    GridPanel.prototype.processMouseEvent = function (eventName, mouseEvent) {
        if (!this.mouseEventService.isEventFromThisGrid(mouseEvent)) {
            return;
        }
        if (utils_1.Utils.isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }
        var rowComp = this.getRowForEvent(mouseEvent);
        var cellComp = this.mouseEventService.getRenderedCellForEvent(mouseEvent);
        if (eventName === "contextmenu") {
            this.handleContextMenuMouseEvent(mouseEvent, null, rowComp, cellComp);
        }
        else {
            if (cellComp) {
                cellComp.onMouseEvent(eventName, mouseEvent);
            }
            if (rowComp) {
                rowComp.onMouseEvent(eventName, mouseEvent);
            }
        }
        this.preventDefaultOnContextMenu(mouseEvent);
    };
    GridPanel.prototype.mockContextMenuForIPad = function () {
        var _this = this;
        // we do NOT want this when not in ipad, otherwise we will be doing
        if (!utils_1.Utils.isUserAgentIPad()) {
            return;
        }
        this.eAllCellContainers.forEach(function (container) {
            var touchListener = new touchListener_1.TouchListener(container);
            var longTapListener = function (event) {
                var rowComp = _this.getRowForEvent(event.touchEvent);
                var cellComp = _this.mouseEventService.getRenderedCellForEvent(event.touchEvent);
                _this.handleContextMenuMouseEvent(null, event.touchEvent, rowComp, cellComp);
            };
            _this.addDestroyableEventListener(touchListener, touchListener_1.TouchListener.EVENT_LONG_TAP, longTapListener);
            _this.addDestroyFunc(function () { return touchListener.destroy(); });
        });
    };
    GridPanel.prototype.handleContextMenuMouseEvent = function (mouseEvent, touchEvent, rowComp, cellComp) {
        var rowNode = rowComp ? rowComp.getRowNode() : null;
        var column = cellComp ? cellComp.getColumn() : null;
        var value = null;
        if (column) {
            var event_1 = mouseEvent ? mouseEvent : touchEvent;
            cellComp.dispatchCellContextMenuEvent(event_1);
            value = this.valueService.getValue(column, rowNode);
        }
        this.onContextMenu(mouseEvent, touchEvent, rowNode, column, value);
    };
    GridPanel.prototype.onContextMenu = function (mouseEvent, touchEvent, rowNode, column, value) {
        // to allow us to debug in chrome, we ignore the event if ctrl is pressed.
        // not everyone wants this, so first 'if' below allows to turn this hack off.
        if (!this.gridOptionsWrapper.isAllowContextMenuWithControlKey()) {
            // then do the check
            if (mouseEvent && (mouseEvent.ctrlKey || mouseEvent.metaKey)) {
                return;
            }
        }
        if (this.contextMenuFactory && !this.gridOptionsWrapper.isSuppressContextMenu()) {
            var eventOrTouch = mouseEvent ? mouseEvent : touchEvent.touches[0];
            this.contextMenuFactory.showMenu(rowNode, column, value, eventOrTouch);
            var event_2 = mouseEvent ? mouseEvent : touchEvent;
            event_2.preventDefault();
        }
    };
    GridPanel.prototype.preventDefaultOnContextMenu = function (mouseEvent) {
        // if we don't do this, then middle click will never result in a 'click' event, as 'mousedown'
        // will be consumed by the browser to mean 'scroll' (as you can scroll with the middle mouse
        // button in the browser). so this property allows the user to receive middle button clicks if
        // they want.
        if (this.gridOptionsWrapper.isSuppressMiddleClickScrolls() && mouseEvent.which === 2) {
            mouseEvent.preventDefault();
        }
    };
    GridPanel.prototype.addShortcutKeyListeners = function () {
        var _this = this;
        this.eAllCellContainers.forEach(function (container) {
            container.addEventListener('keydown', function (event) {
                // if the cell the event came from is editing, then we do not
                // want to do the default shortcut keys, otherwise the editor
                // (eg a text field) would not be able to do the normal cut/copy/paste
                var renderedCell = _this.mouseEventService.getRenderedCellForEvent(event);
                if (renderedCell && renderedCell.isEditing()) {
                    return;
                }
                // for copy / paste, we don't want to execute when the event
                // was from a child grid (happens in master detail)
                if (!_this.mouseEventService.isEventFromThisGrid(event)) {
                    return;
                }
                if (event.ctrlKey || event.metaKey) {
                    switch (event.which) {
                        case constants_1.Constants.KEY_A: return _this.onCtrlAndA(event);
                        case constants_1.Constants.KEY_C: return _this.onCtrlAndC(event);
                        case constants_1.Constants.KEY_V: return _this.onCtrlAndV(event);
                        case constants_1.Constants.KEY_D: return _this.onCtrlAndD(event);
                    }
                }
            });
        });
    };
    GridPanel.prototype.onCtrlAndA = function (event) {
        if (this.rangeController && this.paginationProxy.isRowsToRender()) {
            var rowEnd = void 0;
            var floatingStart = void 0;
            var floatingEnd = void 0;
            if (this.pinnedRowModel.isEmpty(constants_1.Constants.PINNED_TOP)) {
                floatingStart = null;
            }
            else {
                floatingStart = constants_1.Constants.PINNED_TOP;
            }
            if (this.pinnedRowModel.isEmpty(constants_1.Constants.PINNED_BOTTOM)) {
                floatingEnd = null;
                rowEnd = this.paginationProxy.getTotalRowCount() - 1;
            }
            else {
                floatingEnd = constants_1.Constants.PINNED_BOTTOM;
                rowEnd = this.pinnedRowModel.getPinnedBottomRowData().length - 1;
            }
            var allDisplayedColumns = this.columnController.getAllDisplayedColumns();
            if (utils_1.Utils.missingOrEmpty(allDisplayedColumns)) {
                return;
            }
            this.rangeController.setRange({
                rowStart: 0,
                floatingStart: floatingStart,
                rowEnd: rowEnd,
                floatingEnd: floatingEnd,
                columnStart: allDisplayedColumns[0],
                columnEnd: allDisplayedColumns[allDisplayedColumns.length - 1]
            });
        }
        event.preventDefault();
        return false;
    };
    GridPanel.prototype.onCtrlAndC = function (event) {
        if (!this.clipboardService) {
            return;
        }
        var focusedCell = this.focusedCellController.getFocusedCell();
        this.clipboardService.copyToClipboard();
        event.preventDefault();
        // the copy operation results in loosing focus on the cell,
        // because of the trickery the copy logic uses with a temporary
        // widget. so we set it back again.
        if (focusedCell) {
            this.focusedCellController.setFocusedCell(focusedCell.rowIndex, focusedCell.column, focusedCell.floating, true);
        }
        return false;
    };
    GridPanel.prototype.onCtrlAndV = function (event) {
        if (!this.enterprise) {
            return;
        }
        if (this.gridOptionsWrapper.isSuppressClipboardPaste()) {
            return;
        }
        this.clipboardService.pasteFromClipboard();
        return false;
    };
    GridPanel.prototype.onCtrlAndD = function (event) {
        if (!this.enterprise) {
            return;
        }
        this.clipboardService.copyRangeDown();
        event.preventDefault();
        return false;
    };
    // Valid values for position are bottom, middle and top
    // position should be {'top','middle','bottom', or undefined/null}.
    // if undefined/null, then the grid will to the minimal amount of scrolling,
    // eg if grid needs to scroll up, it scrolls until row is on top,
    //    if grid needs to scroll down, it scrolls until row is on bottom,
    //    if row is already in view, grid does not scroll
    GridPanel.prototype.ensureIndexVisible = function (index, position) {
        // if for print or auto height, everything is always visible
        if (this.gridOptionsWrapper.isGridAutoHeight()) {
            return;
        }
        var rowCount = this.paginationProxy.getTotalRowCount();
        if (typeof index !== 'number' || index < 0 || index >= rowCount) {
            console.warn('invalid row index for ensureIndexVisible: ' + index);
            return;
        }
        this.paginationProxy.goToPageWithIndex(index);
        var rowNode = this.paginationProxy.getRow(index);
        var paginationOffset = this.paginationProxy.getPixelOffset();
        var rowTopPixel = rowNode.rowTop - paginationOffset;
        var rowBottomPixel = rowTopPixel + rowNode.rowHeight;
        var scrollPosition = this.getVScrollPosition();
        var heightOffset = this.heightScaler.getOffset();
        var vScrollTop = scrollPosition.top + heightOffset;
        var vScrollBottom = scrollPosition.bottom + heightOffset;
        if (this.isHorizontalScrollShowing()) {
            vScrollBottom -= this.scrollWidth;
        }
        var viewportHeight = vScrollBottom - vScrollTop;
        var newScrollPosition = null;
        // work out the pixels for top, middle and bottom up front,
        // make the if/else below easier to read
        var pxTop = this.heightScaler.getScrollPositionForPixel(rowTopPixel);
        var pxBottom = this.heightScaler.getScrollPositionForPixel(rowBottomPixel - viewportHeight);
        var pxMiddle = (pxTop + pxBottom) / 2;
        // make sure if middle, the row is not outside the top of the grid
        if (pxMiddle > rowTopPixel) {
            pxMiddle = rowTopPixel;
        }
        var rowBelowViewport = vScrollTop > rowTopPixel;
        var rowAboveViewport = vScrollBottom < rowBottomPixel;
        if (position === 'top') {
            newScrollPosition = pxTop;
        }
        else if (position === 'bottom') {
            newScrollPosition = pxBottom;
        }
        else if (position === 'middle') {
            newScrollPosition = pxMiddle;
        }
        else if (rowBelowViewport) {
            // if row is before, scroll up with row at top
            newScrollPosition = pxTop;
        }
        else if (rowAboveViewport) {
            // if row is below, scroll down with row at bottom
            newScrollPosition = pxBottom;
        }
        if (newScrollPosition !== null) {
            this.eBodyViewport.scrollTop = newScrollPosition;
            this.rowRenderer.redrawAfterScroll();
        }
    };
    // + moveColumnController
    GridPanel.prototype.getCenterWidth = function () {
        return this.eBodyViewport.clientWidth;
    };
    GridPanel.prototype.isHorizontalScrollShowing = function () {
        return utils_1.Utils.isHorizontalScrollShowing(this.eBodyViewport);
    };
    GridPanel.prototype.isVerticalScrollShowing = function () {
        return utils_1.Utils.isVerticalScrollShowing(this.eBodyViewport);
    };
    // gets called every time the viewport size changes. we use this to check visibility of scrollbars
    // in the grid panel, and also to check size and position of viewport for row and column virtualisation.
    GridPanel.prototype.checkViewportAndScrolls = function () {
        // results in updating anything that depends on scroll showing
        this.updateScrollVisibleService();
        // fires event if height changes, used by PaginationService, HeightScalerService, RowRenderer
        this.checkBodyHeight();
        // check for virtual columns for ColumnController
        this.onHorizontalViewportChanged();
        this.setPinnedLeftWidth();
        this.setPinnedRightWidth();
        this.setBottomPaddingOnPinned();
        this.hideVerticalScrollOnCenter();
        this.hideFullWidthViewportScrollbars();
    };
    GridPanel.prototype.updateScrollVisibleService = function () {
        var params = {
            bodyHorizontalScrollShowing: false,
            leftVerticalScrollShowing: false,
            rightVerticalScrollShowing: false
        };
        if (this.enableRtl && this.columnController.isPinningLeft()) {
            params.leftVerticalScrollShowing = utils_1.Utils.isVerticalScrollShowing(this.eLeftViewport);
        }
        if (!this.enableRtl && this.columnController.isPinningRight()) {
            params.rightVerticalScrollShowing = utils_1.Utils.isVerticalScrollShowing(this.eRightViewport);
        }
        params.bodyHorizontalScrollShowing = this.isHorizontalScrollShowing();
        this.scrollVisibleService.setScrollsVisible(params);
    };
    // the pinned container needs extra space at the bottom, some blank space, otherwise when
    // vertically scrolled all the way down, the last row will be hidden behind the scrolls.
    // this extra padding allows the last row to be lifted above the bottom scrollbar.
    GridPanel.prototype.setBottomPaddingOnPinned = function () {
        // no need for padding if the scrollbars are not taking up any space
        if (this.scrollWidth <= 0) {
            return;
        }
        if (this.isHorizontalScrollShowing()) {
            this.eRightContainer.style.marginBottom = this.scrollWidth + 'px';
            this.eLeftContainer.style.marginBottom = this.scrollWidth + 'px';
        }
        else {
            this.eRightContainer.style.marginBottom = '';
            this.eLeftContainer.style.marginBottom = '';
        }
    };
    GridPanel.prototype.hideFullWidthViewportScrollbars = function () {
        // if browser does not have scrollbars that take up space (eg iOS) then we don't need
        // to adjust the sizes of the container for scrollbars
        // if (this.scrollWidth <= 0) { return; }
        var scrollWidthPx = this.scrollClipWidth > 0 ? this.scrollWidth + 'px' : '';
        // if horizontal scroll is showing, we add padding to bottom so
        // fullWidth container is not spreading over the scroll
        this.eFullWidthViewportWrapper.style.paddingBottom = this.isHorizontalScrollShowing() ? scrollWidthPx : '';
        // if vertical scroll is showing on full width viewport, then we clip it away, otherwise
        // it competes with the main vertical scroll. this is done by getting the viewport to be
        // bigger than the wrapper, the wrapper then ends up clipping the viewport.
        var takeOutVScroll = this.isVerticalScrollShowing();
        if (this.enableRtl) {
            this.eFullWidthViewportWrapper.style.marginLeft = takeOutVScroll ? scrollWidthPx : '';
            this.eFullWidthViewport.style.marginLeft = takeOutVScroll ? ('-' + scrollWidthPx) : '';
        }
        else {
            this.eFullWidthViewportWrapper.style.width = takeOutVScroll ? "calc(100% - " + scrollWidthPx + ")" : '';
            this.eFullWidthViewport.style.width = takeOutVScroll ? "calc(100% + " + scrollWidthPx + ")" : '';
        }
    };
    GridPanel.prototype.ensureColumnVisible = function (key) {
        var column = this.columnController.getGridColumn(key);
        if (!column) {
            return;
        }
        if (column.isPinned()) {
            console.warn('calling ensureIndexVisible on a ' + column.getPinned() + ' pinned column doesn\'t make sense for column ' + column.getColId());
            return;
        }
        if (!this.columnController.isColumnDisplayed(column)) {
            console.warn('column is not currently visible');
            return;
        }
        var colLeftPixel = column.getLeft();
        var colRightPixel = colLeftPixel + column.getActualWidth();
        var viewportWidth = this.eBodyViewport.clientWidth;
        var scrollPosition = this.getBodyViewportScrollLeft();
        var bodyWidth = this.columnController.getBodyContainerWidth();
        var viewportLeftPixel;
        var viewportRightPixel;
        // the logic of working out left and right viewport px is both here and in the ColumnController,
        // need to refactor it out to one place
        if (this.enableRtl) {
            viewportLeftPixel = bodyWidth - scrollPosition - viewportWidth;
            viewportRightPixel = bodyWidth - scrollPosition;
        }
        else {
            viewportLeftPixel = scrollPosition;
            viewportRightPixel = viewportWidth + scrollPosition;
        }
        var viewportScrolledPastCol = viewportLeftPixel > colLeftPixel;
        var viewportScrolledBeforeCol = viewportRightPixel < colRightPixel;
        var colToSmallForViewport = viewportWidth < column.getActualWidth();
        var alignColToLeft = viewportScrolledPastCol || colToSmallForViewport;
        var alignColToRight = viewportScrolledBeforeCol;
        if (alignColToLeft) {
            // if viewport's left side is after col's left side, scroll left to pull col into viewport at left
            if (this.enableRtl) {
                var newScrollPosition = bodyWidth - viewportWidth - colLeftPixel;
                this.setBodyViewportScrollLeft(newScrollPosition);
            }
            else {
                this.setBodyViewportScrollLeft(colLeftPixel);
            }
        }
        else if (alignColToRight) {
            // if viewport's right side is before col's right side, scroll right to pull col into viewport at right
            if (this.enableRtl) {
                var newScrollPosition = bodyWidth - colRightPixel;
                this.setBodyViewportScrollLeft(newScrollPosition);
            }
            else {
                var newScrollPosition = colRightPixel - viewportWidth;
                this.setBodyViewportScrollLeft(newScrollPosition);
            }
        }
        else {
            // otherwise, col is already in view, so do nothing
        }
        // this will happen anyway, as the move will cause a 'scroll' event on the body, however
        // it is possible that the ensureColumnVisible method is called from within ag-Grid and
        // the caller will need to have the columns rendered to continue, which will be before
        // the event has been worked on (which is the case for cell navigation).
        this.onHorizontalViewportChanged();
    };
    GridPanel.prototype.showLoadingOverlay = function () {
        if (!this.gridOptionsWrapper.isSuppressLoadingOverlay()) {
            this.overlayWrapper.showLoadingOverlay(this.eOverlay);
        }
    };
    GridPanel.prototype.showNoRowsOverlay = function () {
        if (!this.gridOptionsWrapper.isSuppressNoRowsOverlay()) {
            this.overlayWrapper.showNoRowsOverlay(this.eOverlay);
        }
    };
    GridPanel.prototype.hideOverlay = function () {
        this.overlayWrapper.hideOverlay(this.eOverlay);
    };
    GridPanel.prototype.getWidthForSizeColsToFit = function () {
        var availableWidth = this.eBody.clientWidth;
        // if pinning right, then the scroll bar can show, however for some reason
        // it overlays the grid and doesn't take space. so we are only interested
        // in the body scroll showing.
        var removeVerticalScrollWidth = this.isVerticalScrollShowing();
        if (removeVerticalScrollWidth) {
            availableWidth -= this.scrollWidth;
        }
        return availableWidth;
    };
    // method will call itself if no available width. this covers if the grid
    // isn't visible, but is just about to be visible.
    GridPanel.prototype.sizeColumnsToFit = function (nextTimeout) {
        var _this = this;
        var availableWidth = this.getWidthForSizeColsToFit();
        if (availableWidth > 0) {
            this.columnController.sizeColumnsToFit(availableWidth, "sizeColumnsToFit");
        }
        else {
            if (nextTimeout === undefined) {
                setTimeout(function () {
                    _this.sizeColumnsToFit(100);
                }, 0);
            }
            else if (nextTimeout === 100) {
                setTimeout(function () {
                    _this.sizeColumnsToFit(500);
                }, 100);
            }
            else if (nextTimeout === 500) {
                setTimeout(function () {
                    _this.sizeColumnsToFit(-1);
                }, 500);
            }
            else {
                console.log('ag-Grid: tried to call sizeColumnsToFit() but the grid is coming back with ' +
                    'zero width, maybe the grid is not visible yet on the screen?');
            }
        }
    };
    GridPanel.prototype.getBodyContainer = function () {
        return this.eBodyContainer;
    };
    GridPanel.prototype.getDropTargetBodyContainers = function () {
        return [this.eBodyViewport, this.eTopViewport, this.eBottomViewport];
    };
    GridPanel.prototype.getDropTargetLeftContainers = function () {
        return [this.eLeftViewport, this.eLeftBottom, this.eLeftTop];
    };
    GridPanel.prototype.getDropTargetRightContainers = function () {
        return [this.eRightViewport, this.eRightBottom, this.eRightTop];
    };
    GridPanel.prototype.buildRowContainerComponents = function () {
        var _this = this;
        this.eAllCellContainers = [
            this.eLeftContainer, this.eRightContainer, this.eBodyContainer,
            this.eTop, this.eBottom, this.eFullWidthContainer
        ];
        this.rowContainerComponents = {
            body: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eBodyContainer, eViewport: this.eBodyViewport }),
            fullWidth: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eFullWidthContainer, hideWhenNoChildren: true, eViewport: this.eFullWidthViewport }),
            pinnedLeft: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eLeftContainer, eViewport: this.eLeftViewport }),
            pinnedRight: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eRightContainer, eViewport: this.eRightViewport }),
            floatingTop: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eTopContainer }),
            floatingTopPinnedLeft: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eLeftTop }),
            floatingTopPinnedRight: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eRightTop }),
            floatingTopFullWidth: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eTopFullWidthContainer, hideWhenNoChildren: true }),
            floatingBottom: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eBottomContainer }),
            floatingBottomPinnedLeft: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eLeftBottom }),
            floatingBottomPinnedRight: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eRightBottom }),
            floatingBottomFullWith: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eBottomFullWidthContainer, hideWhenNoChildren: true }),
        };
        utils_1.Utils.iterateObject(this.rowContainerComponents, function (key, container) {
            if (container) {
                _this.context.wireBean(container);
            }
        });
    };
    GridPanel.prototype.setupRowAnimationCssClass = function () {
        var _this = this;
        var listener = function () {
            // we don't want to use row animation if scaling, as rows jump strangely as you scroll,
            // when scaling and doing row animation.
            var animateRows = _this.gridOptionsWrapper.isAnimateRows() && !_this.heightScaler.isScaling();
            utils_1.Utils.addOrRemoveCssClass(_this.eBody, 'ag-row-animation', animateRows);
            utils_1.Utils.addOrRemoveCssClass(_this.eBody, 'ag-row-no-animation', !animateRows);
        };
        listener();
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_HEIGHT_SCALE_CHANGED, listener);
    };
    // when editing a pinned row, if the cell is half outside the scrollable area, the browser can
    // scroll the column into view. we do not want this, the pinned sections should never scroll.
    // so we listen to scrolls on these containers and reset the scroll if we find one.
    GridPanel.prototype.suppressScrollOnFloatingRow = function () {
        var _this = this;
        var resetTopScroll = function () { return _this.eTopViewport.scrollLeft = 0; };
        var resetBottomScroll = function () { return _this.eTopViewport.scrollLeft = 0; };
        this.addDestroyableEventListener(this.eTopViewport, 'scroll', resetTopScroll);
        this.addDestroyableEventListener(this.eBottomViewport, 'scroll', resetBottomScroll);
    };
    GridPanel.prototype.getRowContainers = function () {
        return this.rowContainerComponents;
    };
    GridPanel.prototype.onDisplayedColumnsChanged = function () {
        this.setPinnedContainersVisible();
        this.setBodyAndHeaderHeights();
        this.onHorizontalViewportChanged();
    };
    GridPanel.prototype.onDisplayedColumnsWidthChanged = function () {
        this.setWidthsOfContainers();
        this.onHorizontalViewportChanged();
        if (this.enableRtl) {
            // because RTL is all backwards, a change in the width of the row
            // can cause a change in the scroll position, without a scroll event,
            // because the scroll position in RTL is a function that depends on
            // the width. to be convinced of this, take out this line, enable RTL,
            // scroll all the way to the left and then resize a column
            this.horizontallyScrollHeaderCenterAndFloatingCenter();
        }
    };
    GridPanel.prototype.setWidthsOfContainers = function () {
        this.setCenterWidth();
        this.setPinnedLeftWidth();
        this.setPinnedRightWidth();
    };
    GridPanel.prototype.setCenterWidth = function () {
        var widthPx = this.columnController.getBodyContainerWidth() + 'px';
        this.eBodyContainer.style.width = widthPx;
        this.eBottomContainer.style.width = widthPx;
        this.eTopContainer.style.width = widthPx;
    };
    GridPanel.prototype.setPinnedLeftWidth = function () {
        var widthOfCols = this.columnController.getPinnedLeftContainerWidth();
        var widthOfColsAndScroll = widthOfCols + this.scrollWidth;
        var widthOfColsAndClippedScroll = widthOfCols + this.scrollClipWidth;
        var viewportWidth;
        var wrapperWidth;
        if (utils_1.Utils.isVerticalScrollShowing(this.eLeftViewport)) {
            if (this.enableRtl) {
                // show the scroll
                viewportWidth = widthOfColsAndScroll;
                wrapperWidth = widthOfColsAndScroll;
            }
            else {
                // hide the scroll
                viewportWidth = widthOfColsAndClippedScroll;
                wrapperWidth = widthOfCols;
            }
        }
        else {
            // no scroll
            viewportWidth = widthOfCols;
            wrapperWidth = widthOfCols;
        }
        this.setElementWidth(this.eLeftViewportWrapper, wrapperWidth);
        this.setElementWidth(this.eLeftViewport, viewportWidth);
        this.setElementWidth(this.eLeftContainer, widthOfCols);
        this.setElementWidth(this.eLeftBottom, wrapperWidth);
        this.setElementWidth(this.eLeftTop, wrapperWidth);
    };
    GridPanel.prototype.setPinnedRightWidth = function () {
        var widthOfCols = this.columnController.getPinnedRightContainerWidth();
        var widthOfColsAndScroll = widthOfCols + this.scrollWidth;
        var widthOfColsAndClippedScroll = widthOfCols + this.scrollClipWidth;
        var viewportWidth;
        var wrapperWidth;
        if (utils_1.Utils.isVerticalScrollShowing(this.eRightViewport)) {
            if (!this.enableRtl) {
                // show the scroll
                viewportWidth = widthOfColsAndScroll;
                wrapperWidth = widthOfColsAndScroll;
            }
            else {
                // hide the scroll
                viewportWidth = widthOfColsAndClippedScroll;
                wrapperWidth = widthOfCols;
            }
        }
        else {
            // no scroll
            viewportWidth = widthOfCols;
            wrapperWidth = widthOfCols;
        }
        this.setElementWidth(this.eRightViewportWrapper, wrapperWidth);
        this.setElementWidth(this.eRightViewport, viewportWidth);
        this.setElementWidth(this.eRightContainer, widthOfCols);
        this.setElementWidth(this.eRightBottom, wrapperWidth);
        this.setElementWidth(this.eRightTop, wrapperWidth);
    };
    GridPanel.prototype.setElementWidth = function (element, width) {
        // .width didn't do the trick in firefox, so needed .minWidth also
        element.style.width = width + 'px';
        element.style.minWidth = width + 'px';
    };
    GridPanel.prototype.setPinnedContainersVisible = function () {
        var changeDetected = false;
        var showLeftPinned = this.columnController.isPinningLeft();
        if (showLeftPinned !== this.pinningLeft) {
            this.pinningLeft = showLeftPinned;
            this.headerRootComp.setLeftVisible(showLeftPinned);
            utils_1.Utils.setVisible(this.eLeftViewportWrapper, showLeftPinned);
            changeDetected = true;
            if (showLeftPinned) {
                // because the viewport was not visible, it was not keeping previous scrollTop values
                this.eLeftViewport.scrollTop = this.eBodyViewport.scrollTop;
            }
        }
        var showRightPinned = this.columnController.isPinningRight();
        if (showRightPinned !== this.pinningRight) {
            this.pinningRight = showRightPinned;
            this.headerRootComp.setRightVisible(showRightPinned);
            utils_1.Utils.setVisible(this.eRightViewportWrapper, showRightPinned);
            if (showRightPinned) {
                // because the viewport was not visible, it was not keeping previous scrollTop values
                this.eRightViewport.scrollTop = this.eBodyViewport.scrollTop;
            }
            changeDetected = true;
        }
        if (changeDetected) {
            this.hideVerticalScrollOnCenter();
            this.setPinnedLeftWidth();
            this.setPinnedRightWidth();
        }
    };
    GridPanel.prototype.hideVerticalScrollOnCenter = function () {
        var neverShowScroll = this.enableRtl ?
            this.columnController.isPinningLeft()
            : this.columnController.isPinningRight();
        var scrollActive = utils_1.Utils.isVerticalScrollShowing(this.eBodyViewport);
        var hideScroll = neverShowScroll && scrollActive;
        var margin = hideScroll ? '-' + this.scrollClipWidth + 'px' : '';
        if (this.enableRtl) {
            this.eBodyViewport.style.marginLeft = margin;
        }
        else {
            this.eBodyViewport.style.marginRight = margin;
        }
    };
    GridPanel.prototype.checkBodyHeight = function () {
        var bodyHeight = this.eBody.clientHeight;
        if (this.bodyHeight !== bodyHeight) {
            this.bodyHeight = bodyHeight;
            var event_3 = {
                type: events_1.Events.EVENT_BODY_HEIGHT_CHANGED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event_3);
        }
    };
    GridPanel.prototype.setBodyAndHeaderHeights = function () {
        var headerRowCount = this.columnController.getHeaderRowCount();
        var totalHeaderHeight;
        var numberOfFloating = 0;
        var groupHeight;
        var headerHeight;
        if (!this.columnController.isPivotMode()) {
            if (this.gridOptionsWrapper.isFloatingFilter()) {
                headerRowCount++;
            }
            numberOfFloating = (this.gridOptionsWrapper.isFloatingFilter()) ? 1 : 0;
            groupHeight = this.gridOptionsWrapper.getGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getHeaderHeight();
        }
        else {
            numberOfFloating = 0;
            groupHeight = this.gridOptionsWrapper.getPivotGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getPivotHeaderHeight();
        }
        var numberOfNonGroups = 1 + numberOfFloating;
        var numberOfGroups = headerRowCount - numberOfNonGroups;
        totalHeaderHeight = numberOfFloating * this.gridOptionsWrapper.getFloatingFiltersHeight();
        totalHeaderHeight += numberOfGroups * groupHeight;
        totalHeaderHeight += headerHeight;
        this.headerRootComp.setHeight(totalHeaderHeight);
        var floatingTopHeight = this.pinnedRowModel.getPinnedTopTotalHeight();
        var floatingBottomHeight = this.pinnedRowModel.getPinnedBottomTotalHeight();
        this.eTop.style.minHeight = floatingTopHeight + 'px';
        this.eTop.style.height = floatingTopHeight + 'px';
        this.eBottom.style.minHeight = floatingBottomHeight + 'px';
        this.eBottom.style.height = floatingBottomHeight + 'px';
        this.checkBodyHeight();
    };
    GridPanel.prototype.getBodyHeight = function () {
        return this.bodyHeight;
    };
    GridPanel.prototype.setHorizontalScrollPosition = function (hScrollPosition) {
        this.eBodyViewport.scrollLeft = hScrollPosition;
        // we need to manually do the event handling (rather than wait for the event)
        // for the alignedGridsService, as if we don't, the aligned grid service gets
        // notified async, and then it's 'consuming' flag doesn't get used right, and
        // we can end up with an infinite loop
        if (this.nextScrollLeft !== hScrollPosition) {
            this.nextScrollLeft = hScrollPosition;
            this.doHorizontalScroll();
        }
    };
    GridPanel.prototype.setVerticalScrollPosition = function (vScrollPosition) {
        this.eBodyViewport.scrollTop = vScrollPosition;
    };
    // tries to scroll by pixels, but returns what the result actually was
    GridPanel.prototype.scrollHorizontally = function (pixels) {
        var oldScrollPosition = this.eBodyViewport.scrollLeft;
        this.setHorizontalScrollPosition(oldScrollPosition + pixels);
        var newScrollPosition = this.eBodyViewport.scrollLeft;
        return newScrollPosition - oldScrollPosition;
    };
    // tries to scroll by pixels, but returns what the result actually was
    GridPanel.prototype.scrollVertically = function (pixels) {
        var oldScrollPosition = this.eBodyViewport.scrollTop;
        this.setVerticalScrollPosition(oldScrollPosition + pixels);
        var newScrollPosition = this.eBodyViewport.scrollTop;
        return newScrollPosition - oldScrollPosition;
    };
    GridPanel.prototype.addScrollListener = function () {
        var _this = this;
        this.addDestroyableEventListener(this.eBodyViewport, 'scroll', function () {
            _this.onBodyHorizontalScroll();
            _this.onAnyBodyScroll(_this.eBodyViewport);
        });
        this.addDestroyableEventListener(this.eRightViewport, 'scroll', this.onAnyBodyScroll.bind(this, this.eRightViewport));
        this.addDestroyableEventListener(this.eLeftViewport, 'scroll', this.onAnyBodyScroll.bind(this, this.eLeftViewport));
        this.addDestroyableEventListener(this.eFullWidthViewport, 'scroll', this.onAnyBodyScroll.bind(this, this.eFullWidthViewport));
    };
    GridPanel.prototype.onAnyBodyScroll = function (source) {
        var now = new Date().getTime();
        var diff = now - this.lastVScrollTime;
        var elementIsNotControllingTheScroll = source !== this.lastVScrollElement && diff < 500;
        if (elementIsNotControllingTheScroll) {
            return;
        }
        this.lastVScrollElement = source;
        this.lastVScrollTime = now;
        var scrollTop = source.scrollTop;
        if (this.useAnimationFrame) {
            if (this.nextScrollTop !== scrollTop) {
                this.nextScrollTop = scrollTop;
                this.animationFrameService.schedule();
            }
        }
        else {
            if (scrollTop !== this.scrollTop) {
                this.scrollTop = scrollTop;
                this.synchroniseVerticalScrollPositions(scrollTop);
                this.redrawRowsAfterScroll();
            }
        }
    };
    GridPanel.prototype.onBodyHorizontalScroll = function () {
        var scrollLeft = this.eBodyViewport.scrollLeft;
        if (this.nextScrollLeft !== scrollLeft) {
            this.nextScrollLeft = scrollLeft;
            if (this.useAnimationFrame) {
                this.animationFrameService.schedule();
            }
            else {
                this.doHorizontalScroll();
            }
        }
    };
    GridPanel.prototype.doHorizontalScroll = function () {
        this.scrollLeft = this.nextScrollLeft;
        var event = {
            type: events_1.Events.EVENT_BODY_SCROLL,
            api: this.gridApi,
            columnApi: this.columnApi,
            direction: 'horizontal',
            left: this.scrollLeft,
            top: this.scrollTop
        };
        this.eventService.dispatchEvent(event);
        this.horizontallyScrollHeaderCenterAndFloatingCenter();
        this.onHorizontalViewportChanged();
    };
    GridPanel.prototype.executeFrame = function () {
        if (this.scrollLeft !== this.nextScrollLeft) {
            this.doHorizontalScroll();
            return true;
        }
        else if (this.scrollTop !== this.nextScrollTop) {
            this.scrollTop = this.nextScrollTop;
            this.synchroniseVerticalScrollPositions(this.scrollTop);
            this.verticalRedrawNeeded = true;
            return true;
        }
        else if (this.verticalRedrawNeeded) {
            this.redrawRowsAfterScroll();
            this.verticalRedrawNeeded = false;
            return true;
        }
        else {
            return false;
        }
    };
    GridPanel.prototype.redrawRowsAfterScroll = function () {
        var event = {
            type: events_1.Events.EVENT_BODY_SCROLL,
            direction: 'vertical',
            api: this.gridApi,
            columnApi: this.columnApi,
            left: this.scrollLeft,
            top: this.scrollTop
        };
        this.eventService.dispatchEvent(event);
    };
    // this gets called whenever a change in the viewport, so we can inform column controller it has to work
    // out the virtual columns again. gets called from following locations:
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged, API (doLayout)
    GridPanel.prototype.onHorizontalViewportChanged = function () {
        var scrollWidth = this.eBodyViewport.clientWidth;
        var scrollPosition = this.getBodyViewportScrollLeft();
        this.columnController.setVirtualViewportPosition(scrollWidth, scrollPosition);
    };
    GridPanel.prototype.getBodyViewportScrollLeft = function () {
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        return utils_1.Utils.getScrollLeft(this.eBodyViewport, this.enableRtl);
    };
    GridPanel.prototype.setBodyViewportScrollLeft = function (value) {
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        utils_1.Utils.setScrollLeft(this.eBodyViewport, value, this.enableRtl);
    };
    GridPanel.prototype.horizontallyScrollHeaderCenterAndFloatingCenter = function () {
        var scrollLeft = this.getBodyViewportScrollLeft();
        var offset = this.enableRtl ? scrollLeft : -scrollLeft;
        this.headerRootComp.setHorizontalScroll(offset);
        this.eBottomContainer.style.left = offset + 'px';
        this.eTopContainer.style.left = offset + 'px';
    };
    GridPanel.prototype.synchroniseVerticalScrollPositions = function (position) {
        if (this.lastVScrollElement !== this.eBodyViewport) {
            this.eBodyViewport.scrollTop = position;
        }
        if (this.lastVScrollElement !== this.eLeftViewport && this.pinningLeft) {
            this.eLeftViewport.scrollTop = position;
        }
        if (this.lastVScrollElement !== this.eRightViewport && this.pinningRight) {
            this.eRightViewport.scrollTop = position;
        }
        if (this.lastVScrollElement !== this.eFullWidthViewport) {
            this.eFullWidthViewport.scrollTop = position;
        }
        // the row containers need to remember the scroll position, as if they are made
        // hidden / shown, the scroll position is lost
        this.rowContainerComponents.body.setVerticalScrollPosition(position);
        this.rowContainerComponents.pinnedLeft.setVerticalScrollPosition(position);
        this.rowContainerComponents.pinnedRight.setVerticalScrollPosition(position);
        this.rowContainerComponents.fullWidth.setVerticalScrollPosition(position);
        this.redrawRowsAfterScroll();
    };
    GridPanel.prototype.addScrollEventListener = function (listener) {
        this.eBodyViewport.addEventListener('scroll', listener);
    };
    GridPanel.prototype.removeScrollEventListener = function (listener) {
        this.eBodyViewport.removeEventListener('scroll', listener);
    };
    __decorate([
        context_1.Autowired('alignedGridsService'),
        __metadata("design:type", alignedGridsService_1.AlignedGridsService)
    ], GridPanel.prototype, "alignedGridsService", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], GridPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], GridPanel.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('rowRenderer'),
        __metadata("design:type", rowRenderer_1.RowRenderer)
    ], GridPanel.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired('pinnedRowModel'),
        __metadata("design:type", pinnedRowModel_1.PinnedRowModel)
    ], GridPanel.prototype, "pinnedRowModel", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], GridPanel.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], GridPanel.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('animationFrameService'),
        __metadata("design:type", animationFrameService_1.AnimationFrameService)
    ], GridPanel.prototype, "animationFrameService", void 0);
    __decorate([
        context_1.Autowired('navigationService'),
        __metadata("design:type", navigationService_1.NavigationService)
    ], GridPanel.prototype, "navigationService", void 0);
    __decorate([
        context_1.Autowired('autoHeightCalculator'),
        __metadata("design:type", autoHeightCalculator_1.AutoHeightCalculator)
    ], GridPanel.prototype, "autoHeightCalculator", void 0);
    __decorate([
        context_1.Autowired('columnAnimationService'),
        __metadata("design:type", columnAnimationService_1.ColumnAnimationService)
    ], GridPanel.prototype, "columnAnimationService", void 0);
    __decorate([
        context_1.Autowired('autoWidthCalculator'),
        __metadata("design:type", autoWidthCalculator_1.AutoWidthCalculator)
    ], GridPanel.prototype, "autoWidthCalculator", void 0);
    __decorate([
        context_1.Autowired('paginationAutoPageSizeService'),
        __metadata("design:type", paginationProxy_1.PaginationAutoPageSizeService)
    ], GridPanel.prototype, "paginationAutoPageSizeService", void 0);
    __decorate([
        context_1.Autowired('beans'),
        __metadata("design:type", beans_1.Beans)
    ], GridPanel.prototype, "beans", void 0);
    __decorate([
        context_1.Autowired('paginationProxy'),
        __metadata("design:type", paginationProxy_1.PaginationProxy)
    ], GridPanel.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], GridPanel.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], GridPanel.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('dragService'),
        __metadata("design:type", dragService_1.DragService)
    ], GridPanel.prototype, "dragService", void 0);
    __decorate([
        context_1.Autowired('selectionController'),
        __metadata("design:type", selectionController_1.SelectionController)
    ], GridPanel.prototype, "selectionController", void 0);
    __decorate([
        context_1.Autowired('csvCreator'),
        __metadata("design:type", csvCreator_1.CsvCreator)
    ], GridPanel.prototype, "csvCreator", void 0);
    __decorate([
        context_1.Autowired('mouseEventService'),
        __metadata("design:type", mouseEventService_1.MouseEventService)
    ], GridPanel.prototype, "mouseEventService", void 0);
    __decorate([
        context_1.Autowired('focusedCellController'),
        __metadata("design:type", focusedCellController_1.FocusedCellController)
    ], GridPanel.prototype, "focusedCellController", void 0);
    __decorate([
        context_1.Autowired('$scope'),
        __metadata("design:type", Object)
    ], GridPanel.prototype, "$scope", void 0);
    __decorate([
        context_1.Autowired('scrollVisibleService'),
        __metadata("design:type", scrollVisibleService_1.ScrollVisibleService)
    ], GridPanel.prototype, "scrollVisibleService", void 0);
    __decorate([
        context_1.Autowired('frameworkFactory'),
        __metadata("design:type", Object)
    ], GridPanel.prototype, "frameworkFactory", void 0);
    __decorate([
        context_1.Autowired('valueService'),
        __metadata("design:type", valueService_1.ValueService)
    ], GridPanel.prototype, "valueService", void 0);
    __decorate([
        context_1.Autowired('componentRecipes'),
        __metadata("design:type", componentRecipes_1.ComponentRecipes)
    ], GridPanel.prototype, "componentRecipes", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService'),
        __metadata("design:type", dragAndDropService_1.DragAndDropService)
    ], GridPanel.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('heightScaler'),
        __metadata("design:type", heightScaler_1.HeightScaler)
    ], GridPanel.prototype, "heightScaler", void 0);
    __decorate([
        context_1.Autowired('enterprise'),
        __metadata("design:type", Boolean)
    ], GridPanel.prototype, "enterprise", void 0);
    __decorate([
        context_1.Optional('rangeController'),
        __metadata("design:type", Object)
    ], GridPanel.prototype, "rangeController", void 0);
    __decorate([
        context_1.Optional('contextMenuFactory'),
        __metadata("design:type", Object)
    ], GridPanel.prototype, "contextMenuFactory", void 0);
    __decorate([
        context_1.Optional('clipboardService'),
        __metadata("design:type", Object)
    ], GridPanel.prototype, "clipboardService", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eBody'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eBody", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eBodyViewport'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eBodyViewport", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eBodyContainer'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eBodyContainer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eLeftContainer'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eLeftContainer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eRightContainer'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eRightContainer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eFullWidthViewportWrapper'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eFullWidthViewportWrapper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eFullWidthViewport'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eFullWidthViewport", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eFullWidthContainer'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eFullWidthContainer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eLeftViewport'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eLeftViewport", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eLeftViewportWrapper'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eLeftViewportWrapper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eRightViewport'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eRightViewport", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eRightViewportWrapper'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eRightViewportWrapper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eTop'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eTop", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eLeftTop'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eLeftTop", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eRightTop'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eRightTop", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eTopContainer'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eTopContainer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eTopViewport'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eTopViewport", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eTopFullWidthContainer'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eTopFullWidthContainer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eBottom'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eBottom", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eLeftBottom'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eLeftBottom", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eRightBottom'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eRightBottom", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eBottomContainer'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eBottomContainer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eBottomViewport'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eBottomViewport", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eBottomFullWidthContainer'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eBottomFullWidthContainer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('headerRoot'),
        __metadata("design:type", headerRootComp_1.HeaderRootComp)
    ], GridPanel.prototype, "headerRootComp", void 0);
    __decorate([
        context_1.PreDestroy,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], GridPanel.prototype, "destroy", null);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], GridPanel.prototype, "init", null);
    return GridPanel;
}(component_1.Component));
exports.GridPanel = GridPanel;
