/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var columnController_1 = require("../columnController/columnController");
var columnApi_1 = require("../columnController/columnApi");
var rowRenderer_1 = require("../rendering/rowRenderer");
var context_1 = require("../context/context");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var dragService_1 = require("../dragAndDrop/dragService");
var constants_1 = require("../constants");
var mouseEventService_1 = require("./mouseEventService");
var focusedCellController_1 = require("../focusedCellController");
var scrollVisibleService_1 = require("./scrollVisibleService");
var rowContainerComponent_1 = require("../rendering/rowContainerComponent");
var paginationProxy_1 = require("../rowModels/paginationProxy");
var paginationAutoPageSizeService_1 = require("../rowModels/paginationAutoPageSizeService");
var popupEditorWrapper_1 = require("../rendering/cellEditors/popupEditorWrapper");
var alignedGridsService_1 = require("../alignedGridsService");
var pinnedRowModel_1 = require("../rowModels/pinnedRowModel");
var gridApi_1 = require("../gridApi");
var animationFrameService_1 = require("../misc/animationFrameService");
var rowComp_1 = require("../rendering/rowComp");
var navigationService_1 = require("./navigationService");
var valueService_1 = require("../valueService/valueService");
var touchListener_1 = require("../widgets/touchListener");
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var rowDragFeature_1 = require("./rowDragFeature");
var maxDivHeightScaler_1 = require("../rendering/maxDivHeightScaler");
var overlayWrapperComponent_1 = require("../rendering/overlays/overlayWrapperComponent");
var component_1 = require("../widgets/component");
var autoHeightCalculator_1 = require("../rendering/autoHeightCalculator");
var columnAnimationService_1 = require("../rendering/columnAnimationService");
var autoWidthCalculator_1 = require("../rendering/autoWidthCalculator");
var beans_1 = require("../rendering/beans");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var headerRootComp_1 = require("../headerRendering/headerRootComp");
var resizeObserverService_1 = require("../misc/resizeObserverService");
var utils_1 = require("../utils");
// in the html below, it is important that there are no white space between some of the divs, as if there is white space,
// it won't render correctly in safari, as safari renders white space as a gap
var GRID_PANEL_NORMAL_TEMPLATE = "<div class=\"ag-root ag-unselectable\" role=\"grid\" unselectable=\"on\">\n        <ag-header-root ref=\"headerRoot\" unselectable=\"on\"></ag-header-root>\n        <div class=\"ag-floating-top\" ref=\"eTop\" role=\"presentation\" unselectable=\"on\">\n            <div class=\"ag-pinned-left-floating-top\" ref=\"eLeftTop\" role=\"presentation\" unselectable=\"on\"></div>\n            <div class=\"ag-floating-top-viewport\" ref=\"eTopViewport\" role=\"presentation\" unselectable=\"on\">\n                <div class=\"ag-floating-top-container\" ref=\"eTopContainer\" role=\"presentation\" unselectable=\"on\"></div>\n            </div>\n            <div class=\"ag-pinned-right-floating-top\" ref=\"eRightTop\" role=\"presentation\" unselectable=\"on\"></div>\n            <div class=\"ag-floating-top-full-width-container\" ref=\"eTopFullWidthContainer\" role=\"presentation\" unselectable=\"on\"></div>\n        </div>\n        <div class=\"ag-body-viewport\" ref=\"eBodyViewport\" role=\"presentation\" unselectable=\"on\">\n            <div class=\"ag-pinned-left-cols-container\" ref=\"eLeftContainer\" role=\"presentation\" unselectable=\"on\"></div>\n            <div class=\"ag-center-cols-clipper\" ref=\"eCenterColsClipper\" role=\"presentation\" unselectable=\"on\">\n                <div class=\"ag-center-cols-viewport\" ref=\"eCenterViewport\" role=\"presentation\" unselectable=\"on\">\n                    <div class=\"ag-center-cols-container\" ref=\"eCenterContainer\" role=\"rowgroup\" unselectable=\"on\"></div>\n                </div>\n            </div>\n            <div class=\"ag-pinned-right-cols-container\" ref=\"eRightContainer\" role=\"presentation\" unselectable=\"on\"></div>\n            <div class=\"ag-full-width-container\" ref=\"eFullWidthContainer\" role=\"presentation\" unselectable=\"on\"></div>\n        </div>\n        <div class=\"ag-floating-bottom\" ref=\"eBottom\" role=\"presentation\" unselectable=\"on\">\n            <div class=\"ag-pinned-left-floating-bottom\" ref=\"eLeftBottom\" role=\"presentation\" unselectable=\"on\"></div>\n            <div class=\"ag-floating-bottom-viewport\" ref=\"eBottomViewport\" role=\"presentation\" unselectable=\"on\">\n                <div class=\"ag-floating-bottom-container\" ref=\"eBottomContainer\" role=\"presentation\" unselectable=\"on\"></div>\n            </div>\n            <div class=\"ag-pinned-right-floating-bottom\" ref=\"eRightBottom\" role=\"presentation\" unselectable=\"on\"></div>\n            <div class=\"ag-floating-bottom-full-width-container\" ref=\"eBottomFullWidthContainer\" role=\"presentation\" unselectable=\"on\"></div>\n        </div>\n        <div class=\"ag-body-horizontal-scroll\" ref=\"eHorizontalScrollBody\" aria-hidden=\"true\">\n            <div class=\"ag-horizontal-left-spacer\" ref=\"eHorizontalLeftSpacer\"></div>\n            <div class=\"ag-body-horizontal-scroll-viewport\" ref=\"eBodyHorizontalScrollViewport\">\n                <div class=\"ag-body-horizontal-scroll-container\" ref=\"eBodyHorizontalScrollContainer\"></div>\n            </div>\n            <div class=\"ag-horizontal-right-spacer\" ref=\"eHorizontalRightSpacer\"></div>\n        </div>\n        <ag-overlay-wrapper ref=\"overlayWrapper\"></ag-overlay-wrapper>\n    </div>";
var GridPanel = /** @class */ (function (_super) {
    __extends(GridPanel, _super);
    function GridPanel() {
        var _this = _super.call(this, GRID_PANEL_NORMAL_TEMPLATE) || this;
        _this.scrollLeft = -1;
        _this.scrollTop = -1;
        _this.nextScrollTop = -1;
        _this.resetLastHorizontalScrollElementDebounce = utils_1._.debounce(_this.resetLastHorizontalScrollElement.bind(_this), 500);
        return _this;
    }
    GridPanel.prototype.getVScrollPosition = function () {
        var result = {
            top: this.eBodyViewport.scrollTop,
            bottom: this.eBodyViewport.scrollTop + this.eBodyViewport.offsetHeight
        };
        return result;
    };
    GridPanel.prototype.getHScrollPosition = function () {
        var result = {
            left: this.eCenterViewport.scrollLeft,
            right: this.eCenterViewport.scrollLeft + this.eCenterViewport.offsetWidth
        };
        return result;
    };
    GridPanel.prototype.onRowDataChanged = function () {
        this.showOrHideOverlay();
    };
    GridPanel.prototype.showOrHideOverlay = function () {
        var isEmpty = this.paginationProxy.isEmpty();
        var isSuppressNoRowsOverlay = this.gridOptionsWrapper.isSuppressNoRowsOverlay();
        var method = isEmpty && !isSuppressNoRowsOverlay ? 'showNoRowsOverlay' : 'hideOverlay';
        this[method]();
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
        var _this = this;
        this.scrollWidth = this.gridOptionsWrapper.getScrollbarWidth();
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.printLayout = this.gridOptionsWrapper.getDomLayout() === constants_1.Constants.DOM_LAYOUT_PRINT;
        // these elements have different CSS when layout changes
        this.gridOptionsWrapper.addLayoutElement(this.getGui());
        this.gridOptionsWrapper.addLayoutElement(this.eBodyViewport);
        this.suppressScrollOnFloatingRow();
        this.setupRowAnimationCssClass();
        this.buildRowContainerComponents();
        this.addEventListeners();
        this.addDragListeners();
        this.addScrollListener();
        if (this.gridOptionsWrapper.isRowModelDefault() && !this.gridOptionsWrapper.getRowData()) {
            this.showLoadingOverlay();
        }
        this.setCellTextSelection(this.gridOptionsWrapper.isEnableCellTextSelect());
        this.setPinnedContainerSize();
        this.setHeaderAndFloatingHeights();
        this.disableBrowserDragging();
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
        this.gridApi.registerGridComp(this);
        this.alignedGridsService.registerGridComp(this);
        this.headerRootComp.registerGridComp(this);
        this.navigationService.registerGridComp(this);
        this.heightScaler.registerGridComp(this);
        this.autoHeightCalculator.registerGridComp(this);
        this.columnAnimationService.registerGridComp(this);
        this.autoWidthCalculator.registerGridComp(this);
        this.paginationAutoPageSizeService.registerGridComp(this);
        this.beans.registerGridComp(this);
        this.rowRenderer.registerGridComp(this);
        this.animationFrameService.registerGridComp(this);
        if (this.rangeController) {
            this.rangeController.registerGridComp(this);
        }
        [this.eCenterViewport, this.eBodyViewport].forEach(function (viewport) {
            var unsubscribeFromResize = _this.resizeObserverService.observeResize(viewport, _this.onCenterViewportResized.bind(_this));
            _this.addDestroyFunc(function () { return unsubscribeFromResize(); });
        });
    };
    GridPanel.prototype.onDomLayoutChanged = function () {
        var newPrintLayout = this.gridOptionsWrapper.getDomLayout() === constants_1.Constants.DOM_LAYOUT_PRINT;
        if (this.printLayout !== newPrintLayout) {
            this.printLayout = newPrintLayout;
            this.setWidthsOfContainers();
            // pinned containers are always hidden for print layout
            this.setPinnedContainerSize();
        }
    };
    GridPanel.prototype.onCenterViewportResized = function () {
        if (utils_1._.isVisible(this.eCenterViewport)) {
            this.checkViewportAndScrolls();
        }
        else {
            this.bodyHeight = 0;
        }
    };
    // used by ColumnAnimationService
    GridPanel.prototype.setColumnMovingCss = function (moving) {
        this.addOrRemoveCssClass('ag-column-moving', moving);
    };
    GridPanel.prototype.setCellTextSelection = function (selectable) {
        if (selectable === void 0) { selectable = false; }
        [this.eTop, this.eBodyViewport, this.eBottom]
            .forEach(function (ct) { return utils_1._.addOrRemoveCssClass(ct, 'ag-selectable', selectable); });
    };
    GridPanel.prototype.addRowDragListener = function () {
        var rowDragFeature = new rowDragFeature_1.RowDragFeature(this.eBodyViewport, this);
        this.getContext().wireBean(rowDragFeature);
        this.dragAndDropService.addDropTarget(rowDragFeature);
    };
    GridPanel.prototype.addStopEditingWhenGridLosesFocus = function () {
        var _this = this;
        if (!this.gridOptionsWrapper.isStopEditingWhenGridLosesFocus()) {
            return;
        }
        var focusOutListener = function (event) {
            // this is the element the focus is moving to
            var elementWithFocus = event.relatedTarget;
            // see if the element the focus is going to is part of the grid
            var clickInsideGrid = false;
            var pointer = elementWithFocus;
            while (utils_1._.exists(pointer) && !clickInsideGrid) {
                var isPopup = !!_this.gridOptionsWrapper.getDomData(pointer, popupEditorWrapper_1.PopupEditorWrapper.DOM_KEY_POPUP_EDITOR_WRAPPER);
                var isBody = _this.eBodyViewport === pointer || _this.eBottom === pointer || _this.eTop === pointer;
                clickInsideGrid = isPopup || isBody;
                pointer = pointer.parentNode;
            }
            if (!clickInsideGrid) {
                _this.rowRenderer.stopEditing();
            }
        };
        this.addDestroyableEventListener(this.eBodyViewport, 'focusout', focusOutListener);
        this.addDestroyableEventListener(this.eTop, 'focusout', focusOutListener);
        this.addDestroyableEventListener(this.eBottom, 'focusout', focusOutListener);
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
            window.setTimeout(function () {
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
        this.addGuiEventListener('dragstart', function (event) {
            if (event.target instanceof HTMLImageElement) {
                event.preventDefault();
                return false;
            }
        });
    };
    GridPanel.prototype.addEventListeners = function () {
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_PINNED_ROW_DATA_CHANGED, this.setHeaderAndFloatingHeights.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_ROW_DATA_CHANGED, this.onRowDataChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_ROW_DATA_UPDATED, this.onRowDataChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_HEADER_HEIGHT, this.setHeaderAndFloatingHeights.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, this.setHeaderAndFloatingHeights.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, this.setHeaderAndFloatingHeights.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, this.setHeaderAndFloatingHeights.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, this.setHeaderAndFloatingHeights.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_DOM_LAYOUT, this.onDomLayoutChanged.bind(this));
    };
    GridPanel.prototype.addDragListeners = function () {
        var _this = this;
        if (!this.gridOptionsWrapper.isEnableRangeSelection() || // no range selection if no property
            utils_1._.missing(this.rangeController) // no range selection if not enterprise version
        ) {
            return;
        }
        var containers = [
            this.eLeftContainer,
            this.eRightContainer,
            this.eCenterContainer,
            this.eTop,
            this.eBottom
        ];
        containers.forEach(function (container) {
            var params = {
                eElement: container,
                onDragStart: _this.rangeController.onDragStart.bind(_this.rangeController),
                onDragStop: _this.rangeController.onDragStop.bind(_this.rangeController),
                onDragging: _this.rangeController.onDragging.bind(_this.rangeController)
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
        // the context menu if no rows or columns are displayed, or user simply clicks outside of a cell
        var listener = function (mouseEvent) {
            var target = utils_1._.getTarget(mouseEvent);
            if (target === _this.eBodyViewport || target === _this.eCenterViewport) {
                // show it
                _this.onContextMenu(mouseEvent, null, null, null, null);
                _this.preventDefaultOnContextMenu(mouseEvent);
            }
        };
        this.addDestroyableEventListener(this.eBodyViewport, 'contextmenu', listener);
    };
    // + rangeController - used to know when to scroll when user is dragging outside the
    // main viewport while doing a range selection
    GridPanel.prototype.getBodyClientRect = function () {
        if (!this.eBodyViewport) {
            return;
        }
        return this.eBodyViewport.getBoundingClientRect();
    };
    GridPanel.prototype.getRowForEvent = function (event) {
        var sourceElement = utils_1._.getTarget(event);
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
        var cellComp = utils_1._.getCellCompForEvent(this.gridOptionsWrapper, keyboardEvent);
        if (!cellComp) {
            return;
        }
        var rowNode = cellComp.getRenderedRow().getRowNode();
        var column = cellComp.getColumn();
        var editing = cellComp.isEditing();
        var gridProcessingAllowed = !utils_1._.isUserSuppressingKeyboardEvent(this.gridOptionsWrapper, keyboardEvent, rowNode, column, editing);
        if (gridProcessingAllowed) {
            switch (eventName) {
                case 'keydown':
                    // first see if it's a scroll key, page up / down, home / end etc
                    var wasScrollKey = !editing && this.navigationService.handlePageScrollingKey(keyboardEvent);
                    // if not a scroll key, then we pass onto cell
                    if (!wasScrollKey) {
                        cellComp.onKeyDown(keyboardEvent);
                    }
                    this.doClipboardOperations(keyboardEvent, cellComp);
                    break;
                case 'keypress':
                    cellComp.onKeyPress(keyboardEvent);
                    break;
            }
        }
        if (eventName === 'keydown') {
            var cellKeyDownEvent = cellComp.createEvent(keyboardEvent, events_1.Events.EVENT_CELL_KEY_DOWN);
            this.beans.eventService.dispatchEvent(cellKeyDownEvent);
        }
        if (eventName === 'keypress') {
            var cellKeyPressEvent = cellComp.createEvent(keyboardEvent, events_1.Events.EVENT_CELL_KEY_PRESS);
            this.beans.eventService.dispatchEvent(cellKeyPressEvent);
        }
    };
    GridPanel.prototype.doClipboardOperations = function (keyboardEvent, cellComp) {
        // check if ctrl or meta key pressed
        if (!keyboardEvent.ctrlKey && !keyboardEvent.metaKey) {
            return;
        }
        // if the cell the event came from is editing, then we do not
        // want to do the default shortcut keys, otherwise the editor
        // (eg a text field) would not be able to do the normal cut/copy/paste
        if (cellComp.isEditing()) {
            return;
        }
        // for copy / paste, we don't want to execute when the event
        // was from a child grid (happens in master detail)
        if (!this.mouseEventService.isEventFromThisGrid(keyboardEvent)) {
            return;
        }
        switch (keyboardEvent.which) {
            case constants_1.Constants.KEY_A:
                return this.onCtrlAndA(keyboardEvent);
            case constants_1.Constants.KEY_C:
                return this.onCtrlAndC(keyboardEvent);
            case constants_1.Constants.KEY_V:
                return this.onCtrlAndV();
            case constants_1.Constants.KEY_D:
                return this.onCtrlAndD(keyboardEvent);
        }
    };
    // gets called by rowRenderer when new data loaded, as it will want to scroll to the top
    GridPanel.prototype.scrollToTop = function () {
        this.eBodyViewport.scrollTop = 0;
    };
    GridPanel.prototype.processMouseEvent = function (eventName, mouseEvent) {
        if (!this.mouseEventService.isEventFromThisGrid(mouseEvent) ||
            utils_1._.isStopPropagationForAgGrid(mouseEvent)) {
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
        // we do NOT want this when not in iPad, otherwise we will be doing
        if (!utils_1._.isUserAgentIPad()) {
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
        var gridOptionsWrapper = this.gridOptionsWrapper;
        var which = mouseEvent.which;
        if (gridOptionsWrapper.isPreventDefaultOnContextMenu() ||
            (gridOptionsWrapper.isSuppressMiddleClickScrolls() && which === 2)) {
            mouseEvent.preventDefault();
        }
    };
    GridPanel.prototype.onCtrlAndA = function (event) {
        var _a = this, columnController = _a.columnController, pinnedRowModel = _a.pinnedRowModel, paginationProxy = _a.paginationProxy, rangeController = _a.rangeController;
        var PINNED_BOTTOM = constants_1.Constants.PINNED_BOTTOM, PINNED_TOP = constants_1.Constants.PINNED_TOP;
        if (rangeController && paginationProxy.isRowsToRender()) {
            var _b = [
                pinnedRowModel.isEmpty(PINNED_TOP),
                pinnedRowModel.isEmpty(PINNED_BOTTOM)
            ], isEmptyPinnedTop = _b[0], isEmptyPinnedBottom = _b[1];
            var floatingStart = isEmptyPinnedTop ? null : PINNED_TOP;
            var floatingEnd = void 0;
            var rowEnd = void 0;
            if (isEmptyPinnedBottom) {
                floatingEnd = null;
                rowEnd = this.paginationProxy.getRowCount() - 1;
            }
            else {
                floatingEnd = PINNED_BOTTOM;
                rowEnd = pinnedRowModel.getPinnedBottomRowData().length - 1;
            }
            var allDisplayedColumns = columnController.getAllDisplayedColumns();
            if (utils_1._.missingOrEmpty(allDisplayedColumns)) {
                return;
            }
            rangeController.setCellRange({
                rowStartIndex: 0,
                rowStartPinned: floatingStart,
                rowEndIndex: rowEnd,
                rowEndPinned: floatingEnd,
                columnStart: allDisplayedColumns[0],
                columnEnd: utils_1._.last(allDisplayedColumns)
            });
        }
        event.preventDefault();
    };
    GridPanel.prototype.onCtrlAndC = function (event) {
        if (!this.clipboardService || this.gridOptionsWrapper.isEnableCellTextSelection()) {
            return;
        }
        var focusedCell = this.focusedCellController.getFocusedCell();
        this.clipboardService.copyToClipboard();
        event.preventDefault();
        // the copy operation results in loosing focus on the cell,
        // because of the trickery the copy logic uses with a temporary
        // widget. so we set it back again.
        if (focusedCell) {
            this.focusedCellController.setFocusedCell(focusedCell.rowIndex, focusedCell.column, focusedCell.rowPinned, true);
        }
    };
    GridPanel.prototype.onCtrlAndV = function () {
        if (!this.enterprise || this.gridOptionsWrapper.isSuppressClipboardPaste()) {
            return;
        }
        this.clipboardService.pasteFromClipboard();
    };
    GridPanel.prototype.onCtrlAndD = function (event) {
        if (!this.enterprise) {
            return;
        }
        this.clipboardService.copyRangeDown();
        event.preventDefault();
    };
    // Valid values for position are bottom, middle and top
    // position should be {'top','middle','bottom', or undefined/null}.
    // if undefined/null, then the grid will to the minimal amount of scrolling,
    // eg if grid needs to scroll up, it scrolls until row is on top,
    //    if grid needs to scroll down, it scrolls until row is on bottom,
    //    if row is already in view, grid does not scroll
    // fixme - how does this work in the new way
    GridPanel.prototype.ensureIndexVisible = function (index, position) {
        // if for print or auto height, everything is always visible
        if (this.printLayout) {
            return;
        }
        var rowCount = this.paginationProxy.getRowCount();
        if (typeof index !== 'number' || index < 0 || index >= rowCount) {
            console.warn('invalid row index for ensureIndexVisible: ' + index);
            return;
        }
        this.paginationProxy.goToPageWithIndex(index);
        var rowNode = this.paginationProxy.getRow(index);
        var rowGotShiftedDuringOperation;
        do {
            var startingRowTop = rowNode.rowTop;
            var startingRowHeight = rowNode.rowHeight;
            var paginationOffset = this.paginationProxy.getPixelOffset();
            var rowTopPixel = rowNode.rowTop - paginationOffset;
            var rowBottomPixel = rowTopPixel + rowNode.rowHeight;
            var scrollPosition = this.getVScrollPosition();
            var heightOffset = this.heightScaler.getOffset();
            var vScrollTop = scrollPosition.top + heightOffset;
            var vScrollBottom = scrollPosition.bottom + heightOffset;
            var viewportHeight = vScrollBottom - vScrollTop;
            // work out the pixels for top, middle and bottom up front,
            // make the if/else below easier to read
            var pxTop = this.heightScaler.getScrollPositionForPixel(rowTopPixel);
            var pxBottom = this.heightScaler.getScrollPositionForPixel(rowBottomPixel - viewportHeight);
            // make sure if middle, the row is not outside the top of the grid
            var pxMiddle = Math.min((pxTop + pxBottom) / 2, rowTopPixel);
            var rowBelowViewport = vScrollTop > rowTopPixel;
            var rowAboveViewport = vScrollBottom < rowBottomPixel;
            var newScrollPosition = null;
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
            // the row can get shifted if during the rendering (during rowRenderer.redrawAfterScroll()),
            // the height of a row changes due to lazy calculation of row heights when using
            // colDef.autoHeight or gridOptions.getRowHeight.
            // if row was shifted, then the position we scrolled to is incorrect.
            rowGotShiftedDuringOperation = (startingRowTop !== rowNode.rowTop)
                || (startingRowHeight !== rowNode.rowHeight);
        } while (rowGotShiftedDuringOperation);
        // so when we return back to user, the cells have rendered
        this.animationFrameService.flushAllFrames();
    };
    // + moveColumnController
    GridPanel.prototype.getCenterWidth = function () {
        return this.eCenterViewport.clientWidth;
    };
    GridPanel.prototype.isVerticalScrollShowing = function () {
        var isAlwaysShowVerticalScroll = this.gridOptionsWrapper.isAlwaysShowVerticalScroll();
        utils_1._.addOrRemoveCssClass(this.eBodyViewport, 'ag-force-vertical-scroll', isAlwaysShowVerticalScroll);
        return isAlwaysShowVerticalScroll || utils_1._.isVerticalScrollShowing(this.eBodyViewport);
    };
    GridPanel.prototype.isHorizontalScrollShowing = function () {
        return utils_1._.isHorizontalScrollShowing(this.eCenterViewport);
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
        this.setPinnedContainerSize();
    };
    GridPanel.prototype.updateScrollVisibleService = function () {
        // because of column animation (which takes 200ms), we have to do this twice.
        // eg if user removes cols anywhere except at the RHS, then the cols on the RHS
        // will animate to the left to fill the gap. this animation means just after
        // the cols are removed, the remaining cols are still in the original location
        // at the start of the animation, so pre animation the H scrollbar is still needed,
        // but post animation it is not.
        this.updateScrollVisibleServiceImpl();
        setTimeout(this.updateScrollVisibleServiceImpl.bind(this), 500);
    };
    GridPanel.prototype.updateScrollVisibleServiceImpl = function () {
        var params = {
            horizontalScrollShowing: false,
            verticalScrollShowing: false
        };
        params.verticalScrollShowing = this.isVerticalScrollShowing();
        params.horizontalScrollShowing = this.isHorizontalScrollShowing();
        this.scrollVisibleService.setScrollsVisible(params);
        this.setHorizontalScrollVisible(params.horizontalScrollShowing);
        this.setVerticalScrollPaddingVisible(params.verticalScrollShowing);
    };
    GridPanel.prototype.setHorizontalScrollVisible = function (visible) {
        var isSuppressHorizontalScroll = this.gridOptionsWrapper.isSuppressHorizontalScroll();
        var scrollSize = visible ? (this.gridOptionsWrapper.getScrollbarWidth() || 0) : 0;
        var scrollContainerSize = !isSuppressHorizontalScroll ? scrollSize : 0;
        var addIEPadding = utils_1._.isBrowserIE() && visible;
        this.eCenterViewport.style.height = "calc(100% + " + scrollSize + "px)";
        utils_1._.setFixedHeight(this.eHorizontalScrollBody, scrollContainerSize);
        // we have to add an extra pixel to the scroller viewport on IE because
        // if the container has the same size as the scrollbar, the scroll button won't work
        utils_1._.setFixedHeight(this.eBodyHorizontalScrollViewport, scrollContainerSize + (addIEPadding ? 1 : 0));
        utils_1._.setFixedHeight(this.eBodyHorizontalScrollContainer, scrollContainerSize);
    };
    GridPanel.prototype.setVerticalScrollPaddingVisible = function (show) {
        var scroller = show ? "scroll" : "hidden";
        this.eTop.style.overflowY = this.eBottom.style.overflowY = scroller;
        this.setFakeHScrollSpacerWidths();
    };
    GridPanel.prototype.updateRowCount = function () {
        var headerCount = this.headerRootComp.getHeaderRowCount();
        var rowCount = this.paginationProxy.getRowCount();
        var total = (headerCount + rowCount).toString();
        this.getGui().setAttribute('aria-rowcount', total);
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
        var viewportWidth = this.eCenterViewport.clientWidth;
        var scrollPosition = this.getCenterViewportScrollLeft();
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
        var newScrollPosition = this.getCenterViewportScrollLeft();
        if (alignColToLeft || alignColToRight) {
            if (this.enableRtl) {
                newScrollPosition = alignColToLeft ? (bodyWidth - viewportWidth - colLeftPixel) : (bodyWidth - colRightPixel);
            }
            else {
                newScrollPosition = alignColToLeft ? colLeftPixel : (colRightPixel - viewportWidth);
            }
            this.setCenterViewportScrollLeft(newScrollPosition);
        }
        else {
            // otherwise, col is already in view, so do nothing
        }
        // this will happen anyway, as the move will cause a 'scroll' event on the body, however
        // it is possible that the ensureColumnVisible method is called from within ag-Grid and
        // the caller will need to have the columns rendered to continue, which will be before
        // the event has been worked on (which is the case for cell navigation).
        this.onHorizontalViewportChanged();
        // so when we return back to user, the cells have rendered
        this.animationFrameService.flushAllFrames();
    };
    GridPanel.prototype.showLoadingOverlay = function () {
        if (!this.gridOptionsWrapper.isSuppressLoadingOverlay()) {
            this.overlayWrapper.showLoadingOverlay();
        }
    };
    GridPanel.prototype.showNoRowsOverlay = function () {
        if (!this.gridOptionsWrapper.isSuppressNoRowsOverlay()) {
            this.overlayWrapper.showNoRowsOverlay();
        }
    };
    GridPanel.prototype.hideOverlay = function () {
        this.overlayWrapper.hideOverlay();
    };
    // method will call itself if no available width. this covers if the grid
    // isn't visible, but is just about to be visible.
    GridPanel.prototype.sizeColumnsToFit = function (nextTimeout) {
        var _this = this;
        var availableWidth = this.eBodyViewport.clientWidth;
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
            console.warn('ag-Grid: tried to call sizeColumnsToFit() but the grid is coming back with ' +
                'zero width, maybe the grid is not visible yet on the screen?');
        }
    };
    // used by autoWidthCalculator and autoHeightCalculator
    GridPanel.prototype.getCenterContainer = function () {
        return this.eCenterContainer;
    };
    GridPanel.prototype.getDropTargetBodyContainers = function () {
        return [this.eCenterViewport, this.eTopViewport, this.eBottomViewport];
    };
    GridPanel.prototype.getDropTargetLeftContainers = function () {
        return [this.eLeftContainer, this.eLeftBottom, this.eLeftTop];
    };
    GridPanel.prototype.getDropTargetRightContainers = function () {
        return [this.eRightContainer, this.eRightBottom, this.eRightTop];
    };
    GridPanel.prototype.buildRowContainerComponents = function () {
        var _this = this;
        this.eAllCellContainers = [
            this.eLeftContainer, this.eRightContainer, this.eCenterContainer,
            this.eTop, this.eBottom, this.eFullWidthContainer
        ];
        this.rowContainerComponents = {
            body: new rowContainerComponent_1.RowContainerComponent({
                eContainer: this.eCenterContainer,
                eWrapper: this.eCenterColsClipper,
                eViewport: this.eBodyViewport
            }),
            fullWidth: new rowContainerComponent_1.RowContainerComponent({
                eContainer: this.eFullWidthContainer
            }),
            pinnedLeft: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eLeftContainer }),
            pinnedRight: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eRightContainer }),
            floatingTop: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eTopContainer }),
            floatingTopPinnedLeft: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eLeftTop }),
            floatingTopPinnedRight: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eRightTop }),
            floatingTopFullWidth: new rowContainerComponent_1.RowContainerComponent({
                eContainer: this.eTopFullWidthContainer,
                hideWhenNoChildren: true
            }),
            floatingBottom: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eBottomContainer }),
            floatingBottomPinnedLeft: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eLeftBottom }),
            floatingBottomPinnedRight: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eRightBottom }),
            floatingBottomFullWith: new rowContainerComponent_1.RowContainerComponent({
                eContainer: this.eBottomFullWidthContainer,
                hideWhenNoChildren: true
            }),
        };
        utils_1._.iterateObject(this.rowContainerComponents, function (key, container) {
            if (container) {
                _this.getContext().wireBean(container);
            }
        });
    };
    GridPanel.prototype.setupRowAnimationCssClass = function () {
        var _this = this;
        var listener = function () {
            // we don't want to use row animation if scaling, as rows jump strangely as you scroll,
            // when scaling and doing row animation.
            var animateRows = _this.gridOptionsWrapper.isAnimateRows() && !_this.heightScaler.isScaling();
            utils_1._.addOrRemoveCssClass(_this.eBodyViewport, 'ag-row-animation', animateRows);
            utils_1._.addOrRemoveCssClass(_this.eBodyViewport, 'ag-row-no-animation', !animateRows);
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
    GridPanel.prototype.getFloatingTopBottom = function () {
        return [this.eTop, this.eBottom];
    };
    GridPanel.prototype.onDisplayedColumnsChanged = function () {
        this.setPinnedContainerSize();
        this.setHeaderAndFloatingHeights();
        this.onHorizontalViewportChanged();
        this.updateScrollVisibleService();
    };
    GridPanel.prototype.onDisplayedColumnsWidthChanged = function () {
        this.setWidthsOfContainers();
        this.onHorizontalViewportChanged();
        this.updateScrollVisibleService();
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
        this.setPinnedContainerSize();
    };
    GridPanel.prototype.setCenterWidth = function () {
        var width = this.columnController.getBodyContainerWidth();
        if (this.printLayout) {
            var pinnedContainerWidths = this.columnController.getPinnedLeftContainerWidth()
                + this.columnController.getPinnedRightContainerWidth();
            width += pinnedContainerWidths;
        }
        this.headerRootComp.setHeaderContainerWidth(width);
        var widthPx = width + "px";
        this.eCenterContainer.style.width = widthPx;
        this.eBottomContainer.style.width = widthPx;
        this.eTopContainer.style.width = widthPx;
        if (!this.printLayout) {
            this.eBodyHorizontalScrollContainer.style.width = widthPx;
        }
    };
    GridPanel.prototype.setPinnedLeftWidth = function () {
        var _this = this;
        var oldPinning = this.pinningLeft;
        var widthOfCols = this.columnController.getPinnedLeftContainerWidth();
        var newPinning = this.pinningLeft = !this.printLayout && widthOfCols > 0;
        var containers = [this.eLeftContainer, this.eLeftTop, this.eLeftBottom];
        if (oldPinning !== newPinning) {
            this.headerRootComp.setLeftVisible(newPinning);
        }
        containers.forEach(function (e) { return utils_1._.setDisplayed(e, _this.pinningLeft); });
        if (newPinning) {
            containers.forEach(function (ct) { return utils_1._.setFixedWidth(ct, widthOfCols); });
        }
    };
    GridPanel.prototype.setPinnedRightWidth = function () {
        var oldPinning = this.pinningRight;
        var widthOfCols = this.columnController.getPinnedRightContainerWidth();
        var newPinning = this.pinningRight = !this.printLayout && widthOfCols > 0;
        var containers = [this.eRightContainer, this.eRightTop, this.eRightBottom];
        if (oldPinning !== newPinning) {
            this.headerRootComp.setRightVisible(newPinning);
        }
        containers.forEach(function (ct) { return utils_1._.setDisplayed(ct, newPinning); });
        if (newPinning) {
            containers.forEach(function (ct) { return utils_1._.setFixedWidth(ct, widthOfCols); });
        }
    };
    GridPanel.prototype.setPinnedContainerSize = function () {
        this.setPinnedLeftWidth();
        this.setPinnedRightWidth();
        this.setFakeHScrollSpacerWidths();
    };
    GridPanel.prototype.setFakeHScrollSpacerWidths = function () {
        // we pad the right based on a) if cols are pinned to the right and
        // b) if v scroll is showing on the right (normal position of scroll)
        var rightSpacing = this.columnController.getPinnedRightContainerWidth();
        var scrollOnRight = !this.enableRtl && this.isVerticalScrollShowing();
        if (scrollOnRight) {
            rightSpacing += this.scrollWidth;
        }
        utils_1._.setFixedWidth(this.eHorizontalRightSpacer, rightSpacing);
        utils_1._.addOrRemoveCssClass(this.eHorizontalRightSpacer, 'ag-scroller-corner', rightSpacing <= this.scrollWidth);
        // we pad the left based on a) if cols are pinned to the left and
        // b) if v scroll is showing on the left (happens in LTR layout only)
        var leftSpacing = this.columnController.getPinnedLeftContainerWidth();
        var scrollOnLeft = this.enableRtl && this.isVerticalScrollShowing();
        if (scrollOnLeft) {
            leftSpacing += this.scrollWidth;
        }
        utils_1._.setFixedWidth(this.eHorizontalLeftSpacer, leftSpacing);
        utils_1._.addOrRemoveCssClass(this.eHorizontalLeftSpacer, 'ag-scroller-corner', leftSpacing <= this.scrollWidth);
    };
    GridPanel.prototype.checkBodyHeight = function () {
        var bodyHeight = this.eBodyViewport.clientHeight;
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
    GridPanel.prototype.setHeaderAndFloatingHeights = function () {
        var _a = this, columnController = _a.columnController, gridOptionsWrapper = _a.gridOptionsWrapper, pinnedRowModel = _a.pinnedRowModel, eTop = _a.eTop, eBottom = _a.eBottom;
        var numberOfFloating = 0;
        var headerRowCount = columnController.getHeaderRowCount();
        var totalHeaderHeight;
        var groupHeight;
        var headerHeight;
        if (!columnController.isPivotMode()) {
            if (gridOptionsWrapper.isFloatingFilter()) {
                headerRowCount++;
            }
            numberOfFloating = (gridOptionsWrapper.isFloatingFilter()) ? 1 : 0;
            groupHeight = gridOptionsWrapper.getGroupHeaderHeight();
            headerHeight = gridOptionsWrapper.getHeaderHeight();
        }
        else {
            numberOfFloating = 0;
            groupHeight = gridOptionsWrapper.getPivotGroupHeaderHeight();
            headerHeight = gridOptionsWrapper.getPivotHeaderHeight();
        }
        var numberOfNonGroups = 1 + numberOfFloating;
        var numberOfGroups = headerRowCount - numberOfNonGroups;
        totalHeaderHeight = numberOfFloating * gridOptionsWrapper.getFloatingFiltersHeight();
        totalHeaderHeight += numberOfGroups * groupHeight;
        totalHeaderHeight += headerHeight;
        this.headerRootComp.setHeight(totalHeaderHeight);
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
        var floatingTopHeightString = floatingTopHeight + "px";
        var floatingBottomHeightString = floatingBottomHeight + "px";
        eTop.style.minHeight = floatingTopHeightString;
        eTop.style.height = floatingTopHeightString;
        eTop.style.display = floatingTopHeight ? 'inherit' : 'none';
        eBottom.style.minHeight = floatingBottomHeightString;
        eBottom.style.height = floatingBottomHeightString;
        eBottom.style.display = floatingBottomHeight ? 'inherit' : 'none';
        this.checkBodyHeight();
    };
    GridPanel.prototype.getBodyHeight = function () {
        return this.bodyHeight;
    };
    // called by scrollHorizontally method and alignedGridsService
    GridPanel.prototype.setHorizontalScrollPosition = function (hScrollPosition) {
        this.eCenterViewport.scrollLeft = hScrollPosition;
        // we need to manually do the event handling (rather than wait for the event)
        // for the alignedGridsService, as if we don't, the aligned grid service gets
        // notified async, and then it's 'consuming' flag doesn't get used right, and
        // we can end up with an infinite loop
        this.doHorizontalScroll(hScrollPosition);
    };
    GridPanel.prototype.setVerticalScrollPosition = function (vScrollPosition) {
        this.eBodyViewport.scrollTop = vScrollPosition;
    };
    // called by the headerRootComp and moveColumnController
    GridPanel.prototype.scrollHorizontally = function (pixels) {
        var oldScrollPosition = this.eCenterViewport.scrollLeft;
        this.setHorizontalScrollPosition(oldScrollPosition + pixels);
        return this.eCenterViewport.scrollLeft - oldScrollPosition;
    };
    // called by rowDragFeature
    GridPanel.prototype.scrollVertically = function (pixels) {
        var oldScrollPosition = this.eBodyViewport.scrollTop;
        this.setVerticalScrollPosition(oldScrollPosition + pixels);
        return this.eBodyViewport.scrollTop - oldScrollPosition;
    };
    GridPanel.prototype.addScrollListener = function () {
        this.addDestroyableEventListener(this.eCenterViewport, 'scroll', this.onCenterViewportScroll.bind(this));
        this.addDestroyableEventListener(this.eBodyHorizontalScrollViewport, 'scroll', this.onFakeHorizontalScroll.bind(this));
        this.addDestroyableEventListener(this.eBodyViewport, 'scroll', this.onVerticalScroll.bind(this));
    };
    GridPanel.prototype.onVerticalScroll = function () {
        var scrollTop = this.eBodyViewport.scrollTop;
        this.animationFrameService.setScrollTop(scrollTop);
        this.nextScrollTop = scrollTop;
        if (this.gridOptionsWrapper.isSuppressAnimationFrame()) {
            this.redrawRowsAfterScroll();
        }
        else {
            this.animationFrameService.schedule();
        }
    };
    GridPanel.prototype.executeFrame = function () {
        var frameNeeded = this.scrollTop !== this.nextScrollTop;
        if (frameNeeded) {
            this.scrollTop = this.nextScrollTop;
            this.redrawRowsAfterScroll();
        }
        return frameNeeded;
    };
    GridPanel.prototype.isControllingScroll = function (eDiv) {
        if (!this.lastHorizontalScrollElement) {
            this.lastHorizontalScrollElement = eDiv;
            return true;
        }
        return eDiv === this.lastHorizontalScrollElement;
    };
    GridPanel.prototype.onFakeHorizontalScroll = function () {
        if (!this.isControllingScroll(this.eBodyHorizontalScrollViewport)) {
            return;
        }
        this.onBodyHorizontalScroll(this.eBodyHorizontalScrollViewport);
    };
    GridPanel.prototype.onCenterViewportScroll = function () {
        if (!this.isControllingScroll(this.eCenterViewport)) {
            return;
        }
        this.onBodyHorizontalScroll(this.eCenterViewport);
    };
    GridPanel.prototype.onBodyHorizontalScroll = function (eSource) {
        var _a = this.eCenterViewport, scrollWidth = _a.scrollWidth, clientWidth = _a.clientWidth;
        // in chrome, fractions can be in the scroll left, eg 250.342234 - which messes up our 'scrollWentPastBounds'
        // formula. so we floor it to allow the formula to work.
        var scrollLeft = Math.floor(utils_1._.getScrollLeft(eSource, this.enableRtl));
        // touch devices allow elastic scroll - which temporally scrolls the panel outside of the viewport
        // (eg user uses touch to go to the left of the grid, but drags past the left, the rows will actually
        // scroll past the left until the user releases the mouse). when this happens, we want ignore the scroll,
        // as otherwise it was causing the rows and header to flicker.
        var scrollWentPastBounds = scrollLeft < 0 || (scrollLeft + clientWidth > scrollWidth);
        if (scrollWentPastBounds) {
            return;
        }
        this.doHorizontalScroll(scrollLeft);
        this.resetLastHorizontalScrollElementDebounce();
    };
    GridPanel.prototype.resetLastHorizontalScrollElement = function () {
        this.lastHorizontalScrollElement = null;
    };
    GridPanel.prototype.doHorizontalScroll = function (scrollLeft) {
        this.scrollLeft = scrollLeft;
        var event = {
            type: events_1.Events.EVENT_BODY_SCROLL,
            api: this.gridApi,
            columnApi: this.columnApi,
            direction: 'horizontal',
            left: this.scrollLeft,
            top: this.scrollTop
        };
        this.eventService.dispatchEvent(event);
        this.horizontallyScrollHeaderCenterAndFloatingCenter(scrollLeft);
        this.onHorizontalViewportChanged();
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
        var scrollWidth = this.eCenterViewport.clientWidth;
        var scrollPosition = this.getCenterViewportScrollLeft();
        this.columnController.setVirtualViewportPosition(scrollWidth, scrollPosition);
    };
    GridPanel.prototype.getCenterViewportScrollLeft = function () {
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        return utils_1._.getScrollLeft(this.eCenterViewport, this.enableRtl);
    };
    GridPanel.prototype.setCenterViewportScrollLeft = function (value) {
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        utils_1._.setScrollLeft(this.eCenterViewport, value, this.enableRtl);
    };
    GridPanel.prototype.horizontallyScrollHeaderCenterAndFloatingCenter = function (scrollLeft) {
        if (scrollLeft === undefined) {
            scrollLeft = this.getCenterViewportScrollLeft();
        }
        var offset = this.enableRtl ? scrollLeft : -scrollLeft;
        var _a = this.eCenterViewport, clientWidth = _a.clientWidth, scrollWidth = _a.scrollWidth;
        var scrollWentPastBounds = Math.abs(offset) + clientWidth > scrollWidth;
        if (scrollWentPastBounds ||
            (this.enableRtl && offset < 0) ||
            (!this.enableRtl && offset > 0)) {
            return;
        }
        this.headerRootComp.setHorizontalScroll(offset);
        this.eBottomContainer.style.transform = "translateX(" + offset + "px)";
        this.eTopContainer.style.transform = "translateX(" + offset + "px)";
        var partner = this.lastHorizontalScrollElement === this.eCenterViewport ? this.eBodyHorizontalScrollViewport : this.eCenterViewport;
        utils_1._.setScrollLeft(partner, scrollLeft, this.enableRtl);
    };
    // + rangeController
    GridPanel.prototype.addScrollEventListener = function (listener) {
        this.eBodyViewport.addEventListener('scroll', listener);
    };
    // + rangeController
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
        __metadata("design:type", paginationAutoPageSizeService_1.PaginationAutoPageSizeService)
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
        context_1.Autowired('valueService'),
        __metadata("design:type", valueService_1.ValueService)
    ], GridPanel.prototype, "valueService", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService'),
        __metadata("design:type", dragAndDropService_1.DragAndDropService)
    ], GridPanel.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('maxDivHeightScaler'),
        __metadata("design:type", maxDivHeightScaler_1.MaxDivHeightScaler)
    ], GridPanel.prototype, "heightScaler", void 0);
    __decorate([
        context_1.Autowired('enterprise'),
        __metadata("design:type", Boolean)
    ], GridPanel.prototype, "enterprise", void 0);
    __decorate([
        context_1.Autowired('resizeObserverService'),
        __metadata("design:type", resizeObserverService_1.ResizeObserverService)
    ], GridPanel.prototype, "resizeObserverService", void 0);
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
        componentAnnotations_1.RefSelector('eBodyViewport'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eBodyViewport", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eCenterContainer'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eCenterContainer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eCenterViewport'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eCenterViewport", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eLeftContainer'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eLeftContainer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eRightContainer'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eRightContainer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eCenterColsClipper'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eCenterColsClipper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eHorizontalScrollBody'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eHorizontalScrollBody", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eHorizontalLeftSpacer'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eHorizontalLeftSpacer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eHorizontalRightSpacer'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eHorizontalRightSpacer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eBodyHorizontalScrollViewport'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eBodyHorizontalScrollViewport", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eBodyHorizontalScrollContainer'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eBodyHorizontalScrollContainer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eFullWidthContainer'),
        __metadata("design:type", HTMLElement)
    ], GridPanel.prototype, "eFullWidthContainer", void 0);
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
        componentAnnotations_1.RefSelector('overlayWrapper'),
        __metadata("design:type", overlayWrapperComponent_1.OverlayWrapperComponent)
    ], GridPanel.prototype, "overlayWrapper", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], GridPanel.prototype, "init", null);
    return GridPanel;
}(component_1.Component));
exports.GridPanel = GridPanel;
