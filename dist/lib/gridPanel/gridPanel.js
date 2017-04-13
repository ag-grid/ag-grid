/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var masterSlaveService_1 = require("../masterSlaveService");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var columnController_1 = require("../columnController/columnController");
var rowRenderer_1 = require("../rendering/rowRenderer");
var floatingRowModel_1 = require("../rowModels/floatingRowModel");
var borderLayout_1 = require("../layout/borderLayout");
var logger_1 = require("../logger");
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
var beanStub_1 = require("../context/beanStub");
var rowContainerComponent_1 = require("../rendering/rowContainerComponent");
var paginationProxy_1 = require("../rowModels/paginationProxy");
// in the html below, it is important that there are no white space between some of the divs, as if there is white space,
// it won't render correctly in safari, as safari renders white space as a gap
var gridHtml = '<div class="ag-root ag-font-style">' +
    // header
    '<div class="ag-header">' +
    '<div class="ag-pinned-left-header"></div>' +
    '<div class="ag-pinned-right-header"></div>' +
    '<div class="ag-header-viewport">' +
    '<div class="ag-header-container"></div>' +
    '</div>' +
    '<div class="ag-header-overlay"></div>' +
    '</div>' +
    // floating top
    '<div class="ag-floating-top">' +
    '<div class="ag-pinned-left-floating-top"></div>' +
    '<div class="ag-pinned-right-floating-top"></div>' +
    '<div class="ag-floating-top-viewport">' +
    '<div class="ag-floating-top-container"></div>' +
    '</div>' +
    '<div class="ag-floating-top-full-width-container"></div>' +
    '</div>' +
    // floating bottom
    '<div class="ag-floating-bottom">' +
    '<div class="ag-pinned-left-floating-bottom"></div>' +
    '<div class="ag-pinned-right-floating-bottom"></div>' +
    '<div class="ag-floating-bottom-viewport">' +
    '<div class="ag-floating-bottom-container"></div>' +
    '</div>' +
    '<div class="ag-floating-bottom-full-width-container"></div>' +
    '</div>' +
    // body
    '<div class="ag-body">' +
    '<div class="ag-pinned-left-cols-viewport">' +
    '<div class="ag-pinned-left-cols-container"></div>' +
    '</div>' +
    '<div class="ag-pinned-right-cols-viewport">' +
    '<div class="ag-pinned-right-cols-container"></div>' +
    '</div>' +
    '<div class="ag-body-viewport-wrapper">' +
    '<div class="ag-body-viewport">' +
    '<div class="ag-body-container"></div>' +
    '</div>' +
    '</div>' +
    '<div class="ag-full-width-viewport">' +
    '<div class="ag-full-width-container"></div>' +
    '</div>' +
    '</div>' +
    '</div>';
var gridForPrintHtml = '<div class="ag-root ag-font-style">' +
    // header
    '<div class="ag-header-container"></div>' +
    // floating
    '<div class="ag-floating-top-container"></div>' +
    // body
    '<div class="ag-body-container"></div>' +
    // floating bottom
    '<div class="ag-floating-bottom-container"></div>' +
    '</div>';
// wrapping in outer div, and wrapper, is needed to center the loading icon
// The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/
var mainOverlayTemplate = '<div class="ag-overlay-panel">' +
    '<div class="ag-overlay-wrapper ag-overlay-[OVERLAY_NAME]-wrapper">[OVERLAY_TEMPLATE]</div>' +
    '</div>';
var defaultLoadingOverlayTemplate = '<span class="ag-overlay-loading-center">[LOADING...]</span>';
var defaultNoRowsOverlayTemplate = '<span class="ag-overlay-no-rows-center">[NO_ROWS_TO_SHOW]</span>';
var GridPanel = (function (_super) {
    __extends(GridPanel, _super);
    function GridPanel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.requestAnimationFrameExists = typeof requestAnimationFrame === 'function';
        _this.scrollLagCounter = 0;
        _this.scrollLagTicking = false;
        _this.lastLeftPosition = -1;
        _this.lastTopPosition = -1;
        _this.animationThreadCount = 0;
        return _this;
    }
    GridPanel.prototype.agWire = function (loggerFactory) {
        this.logger = loggerFactory.create('GridPanel');
        // makes code below more readable if we pull 'forPrint' out
        this.forPrint = this.gridOptionsWrapper.isForPrint();
        this.scrollWidth = this.gridOptionsWrapper.getScrollbarWidth();
        this.useScrollLag = this.isUseScrollLag();
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.loadTemplate();
        this.findElements();
    };
    GridPanel.prototype.getVerticalPixelRange = function () {
        var container = this.getPrimaryScrollViewport();
        var result = {
            top: container.scrollTop,
            bottom: container.scrollTop + container.offsetHeight
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
    GridPanel.prototype.getLayout = function () {
        return this.layout;
    };
    GridPanel.prototype.init = function () {
        this.addEventListeners();
        this.addDragListeners();
        this.layout = new borderLayout_1.BorderLayout({
            overlays: {
                loading: utils_1.Utils.loadTemplate(this.createLoadingOverlayTemplate()),
                noRows: utils_1.Utils.loadTemplate(this.createNoRowsOverlayTemplate())
            },
            center: this.eRoot,
            dontFill: this.forPrint,
            name: 'eGridPanel'
        });
        this.layout.addSizeChangeListener(this.setBodyAndHeaderHeights.bind(this));
        this.layout.addSizeChangeListener(this.setLeftAndRightBounds.bind(this));
        this.addScrollListener();
        if (this.gridOptionsWrapper.isSuppressHorizontalScroll()) {
            this.eBodyViewport.style.overflowX = 'hidden';
        }
        if (this.gridOptionsWrapper.isRowModelDefault() && !this.gridOptionsWrapper.getRowData()) {
            this.showLoadingOverlay();
        }
        this.setPinnedContainersVisible();
        this.setBodyAndHeaderHeights();
        this.disableBrowserDragging();
        this.addShortcutKeyListeners();
        this.addMouseEvents();
        this.addKeyboardEvents();
        this.addBodyViewportListener();
        this.addStopEditingWhenGridLosesFocus();
        if (this.$scope) {
            this.addAngularApplyCheck();
        }
        this.onDisplayedColumnsWidthChanged();
    };
    GridPanel.prototype.addStopEditingWhenGridLosesFocus = function () {
        var _this = this;
        if (this.gridOptionsWrapper.isStopEditingWhenGridLosesFocus()) {
            this.addDestroyableEventListener(this.eBody, 'focusout', function (event) {
                // this is the element the focus is moving to
                var elementWithFocus = event.relatedTarget;
                // see if the element the focus is going to is part of the grid
                var ourBodyFound = false;
                var pointer = elementWithFocus;
                while (utils_1.Utils.exists(pointer)) {
                    pointer = pointer.parentNode;
                    if (pointer === _this.eBody) {
                        ourBodyFound = true;
                    }
                }
                // if it is not part fo the grid, then we have lost focus
                if (!ourBodyFound) {
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
        this.eRoot.addEventListener('dragstart', function (event) {
            if (event.target instanceof HTMLImageElement) {
                event.preventDefault();
                return false;
            }
        });
    };
    GridPanel.prototype.addEventListeners = function () {
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_FLOATING_ROW_DATA_CHANGED, this.setBodyAndHeaderHeights.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_ROW_DATA_CHANGED, this.onRowDataChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_ITEMS_ADDED, this.onRowDataChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_ITEMS_REMOVED, this.onRowDataChanged.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_HEADER_HEIGHT, this.setBodyAndHeaderHeights.bind(this));
    };
    GridPanel.prototype.addDragListeners = function () {
        var _this = this;
        if (this.forPrint // no range select when doing 'for print'
            || !this.gridOptionsWrapper.isEnableRangeSelection() // no range selection if no property
            || utils_1.Utils.missing(this.rangeController)) {
            return;
        }
        var containers = [this.ePinnedLeftColsContainer, this.ePinnedRightColsContainer, this.eBodyContainer,
            this.eFloatingTop, this.eFloatingBottom];
        containers.forEach(function (container) {
            var params = {
                dragStartPixels: 0,
                eElement: container,
                onDragStart: _this.rangeController.onDragStart.bind(_this.rangeController),
                onDragStop: _this.rangeController.onDragStop.bind(_this.rangeController),
                onDragging: _this.rangeController.onDragging.bind(_this.rangeController)
            };
            _this.dragService.addDragSource(params);
            _this.addDestroyFunc(function () { return _this.dragService.removeDragSource(params); });
        });
    };
    GridPanel.prototype.addMouseEvents = function () {
        var _this = this;
        var eventNames = ['click', 'mousedown', 'dblclick', 'contextmenu', 'mouseover', 'mouseout'];
        eventNames.forEach(function (eventName) {
            var listener = _this.processMouseEvent.bind(_this, eventName);
            _this.eAllCellContainers.forEach(function (container) {
                container.addEventListener(eventName, listener);
                _this.addDestroyFunc(function () { return container.removeEventListener(eventName, listener); });
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
        // we never add this when doing 'forPrint'
        if (this.gridOptionsWrapper.isForPrint()) {
            return;
        }
        // we want to listen for clicks directly on the eBodyViewport, so the user has a way of showing
        // the context menu if no rows are displayed, or user simply clicks outside of a cell
        var listener = function (mouseEvent) {
            var target = utils_1.Utils.getTarget(mouseEvent);
            if (target === _this.eBodyViewport) {
                // show it
                _this.onContextMenu(mouseEvent);
                _this.preventDefaultOnContextMenu(mouseEvent);
            }
        };
        this.addDestroyableEventListener(this.eBodyViewport, 'contextmenu', listener);
    };
    GridPanel.prototype.getRowForEvent = function (event) {
        var domDataKey = this.gridOptionsWrapper.getDomDataKey();
        var sourceElement = utils_1.Utils.getTarget(event);
        while (sourceElement) {
            var domData = sourceElement[domDataKey];
            if (domData && domData.renderedRow) {
                return domData.renderedRow;
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
                var pageScrollingKeys = [
                    constants_1.Constants.DIAGONAL_SCROLL_KEYS,
                    constants_1.Constants.HORIZONTAL_SCROLL_KEYS,
                    constants_1.Constants.VERTICAL_SCROLL_KEYS
                ];
                var result = testKeyboardBindingGroups(pageScrollingKeys, keyboardEvent);
                if (result) {
                    this.handlePageScrollingKey(result.trappedKeyboardBindingGroup.id, result.trappedKeyboardBinding.id, keyboardEvent);
                }
                else {
                    renderedCell.onKeyDown(keyboardEvent);
                }
                break;
            case 'keypress':
                renderedCell.onKeyPress(keyboardEvent);
                break;
        }
    };
    GridPanel.prototype.handlePageScrollingKey = function (pagingKeyGroup, pagingKey, keyboardEvent) {
        switch (pagingKeyGroup) {
            case constants_1.Constants.DIAGONAL_SCROLL_KEYS_ID:
                this.pageDiagonally(pagingKey);
                break;
            case constants_1.Constants.VERTICAL_SCROLL_KEYS_ID:
                this.pageVertically(pagingKey);
                break;
            case constants_1.Constants.HORIZONTAL_SCROLL_KEYS_ID:
                this.pageHorizontally(pagingKey);
                break;
        }
        //***************************************************************************
        //Stop event defaults and propagation
        keyboardEvent.preventDefault();
    };
    //Either CTL LEFT/RIGHT
    GridPanel.prototype.pageHorizontally = function (pagingKey) {
        //***************************************************************************
        //column to select
        var allColumns = this.columnController.getAllDisplayedColumns();
        var columnToSelect = pagingKey === constants_1.Constants.KEY_CTRL_LEFT_NAME ?
            allColumns[0] :
            allColumns[allColumns.length - 1];
        var horizontalScroll = {
            type: ScrollType.HORIZONTAL,
            columnToScrollTo: columnToSelect,
            columnToFocus: columnToSelect
        };
        this.performScroll(horizontalScroll);
    };
    //Either HOME OR END
    GridPanel.prototype.pageDiagonally = function (pagingKey) {
        //***************************************************************************
        //where to place the newly selected cell cursor after the scroll
        var pageSize = this.getPrimaryScrollViewport().offsetHeight;
        var selectionTopDelta = pagingKey === constants_1.Constants.KEY_PAGE_HOME_NAME ?
            0 :
            pageSize;
        //***************************************************************************
        //where to scroll to
        var rowIndexToScrollTo = pagingKey === constants_1.Constants.KEY_PAGE_HOME_NAME ?
            0 :
            this.paginationProxy.getPageLastRow();
        var rowToScrollTo = this.paginationProxy.getRow(rowIndexToScrollTo);
        //***************************************************************************
        //column to select
        var allColumns = this.columnController.getAllDisplayedColumns();
        var columnToSelect = pagingKey === constants_1.Constants.KEY_PAGE_HOME_NAME ?
            allColumns[0] :
            allColumns[allColumns.length - 1];
        var diagonalScroll = {
            focusedRowTopDelta: selectionTopDelta,
            type: ScrollType.DIAGONAL,
            rowToScrollTo: rowToScrollTo,
            columnToScrollTo: columnToSelect
        };
        this.performScroll(diagonalScroll);
    };
    //EITHER CTRL UP/DOWN or PAGE UP/DOWN
    GridPanel.prototype.pageVertically = function (pagingKey) {
        if (pagingKey === constants_1.Constants.KEY_CTRL_UP_NAME) {
            this.performScroll({
                rowToScrollTo: this.paginationProxy.getRow(0),
                focusedRowTopDelta: 0,
                type: ScrollType.VERTICAL
            });
            return;
        }
        if (pagingKey === constants_1.Constants.KEY_CTRL_DOWN_NAME) {
            this.performScroll({
                rowToScrollTo: this.paginationProxy.getRow(this.paginationProxy.getPageLastRow()),
                focusedRowTopDelta: this.getPrimaryScrollViewport().offsetHeight,
                type: ScrollType.VERTICAL
            });
            return;
        }
        //*********PAGING KEYS******************************************************
        //***************************************************************************
        //where to place the newly selected cell cursor after the scroll
        //  before we move the scroll
        //      a) find the top position of the current selected cell
        //      b) find what is the delta of that compared to the current scroll
        var focusedCell = this.focusedCellController.getFocusedCell();
        var focusedRowNode = this.paginationProxy.getRow(focusedCell.rowIndex);
        var focusedAbsoluteTop = focusedRowNode.rowTop;
        var selectionTopDelta = (focusedAbsoluteTop - this.getPrimaryScrollViewport().scrollTop) - this.paginationProxy.getPixelOffset();
        //***************************************************************************
        //how much to scroll:
        //  a) One entire page from or to
        //  b) the top of the first row in the current view
        //  c) then find what is the row that would appear the first one in the screen and adjust it to its top pos
        //      this will avoid having half printed rows at the top
        var currentPageTopmostPixel = this.getPrimaryScrollViewport().scrollTop;
        var currentPageTopRow = this.paginationProxy.getRowIndexAtPixel(currentPageTopmostPixel + this.paginationProxy.getPixelOffset());
        var currentPageTopmostRow = this.paginationProxy.getRow(currentPageTopRow);
        var viewportSize = this.getPrimaryScrollViewport().offsetHeight;
        var maxPageSize = this.paginationProxy.getCurrentPageHeight();
        var pageSize = maxPageSize < viewportSize ? maxPageSize : viewportSize;
        var currentTopmostRowBottom = currentPageTopmostRow.rowTop + currentPageTopmostRow.rowHeight;
        var toScrollUnadjusted = pagingKey == constants_1.Constants.KEY_PAGE_DOWN_NAME ?
            pageSize + currentTopmostRowBottom :
            currentTopmostRowBottom - pageSize;
        var nextScreenTopmostRow = this.paginationProxy.getRow(this.paginationProxy.getRowIndexAtPixel(toScrollUnadjusted));
        var verticalScroll = {
            rowToScrollTo: nextScreenTopmostRow,
            focusedRowTopDelta: selectionTopDelta,
            type: ScrollType.VERTICAL
        };
        this.performScroll(verticalScroll);
    };
    // gets called by rowRenderer when new data loaded, as it will want to scroll
    // to the top
    GridPanel.prototype.scrollToTop = function () {
        if (!this.forPrint) {
            this.getPrimaryScrollViewport().scrollTop = 0;
        }
    };
    //Performs any scroll
    GridPanel.prototype.performScroll = function (scroll) {
        var verticalScroll;
        var diagonalScroll;
        var horizontalScroll;
        var focusedCellBeforeScrolling = this.focusedCellController.getFocusedCell();
        //***************************************************************************
        // Scroll screen
        var newScrollTop;
        switch (scroll.type) {
            case ScrollType.VERTICAL:
                verticalScroll = scroll;
                this.ensureIndexVisible(verticalScroll.rowToScrollTo.rowIndex);
                newScrollTop = verticalScroll.rowToScrollTo.rowTop - this.paginationProxy.getPixelOffset();
                this.getPrimaryScrollViewport().scrollTop = newScrollTop;
                break;
            case ScrollType.DIAGONAL:
                diagonalScroll = scroll;
                this.ensureIndexVisible(diagonalScroll.rowToScrollTo.rowIndex);
                newScrollTop = diagonalScroll.rowToScrollTo.rowTop - this.paginationProxy.getPixelOffset();
                this.getPrimaryScrollViewport().scrollTop = newScrollTop;
                this.getPrimaryScrollViewport().scrollLeft = diagonalScroll.columnToScrollTo.getLeft();
                break;
            case ScrollType.HORIZONTAL:
                horizontalScroll = scroll;
                this.getPrimaryScrollViewport().scrollLeft = horizontalScroll.columnToScrollTo.getLeft();
                break;
        }
        //***************************************************************************
        // This is needed so that when we try to focus on the cell is actually rendered.
        var refreshViewParams = {
            onlyBody: true,
            suppressKeepFocus: true
        };
        this.rowRenderer.refreshView(refreshViewParams);
        //***************************************************************************
        // New focused cell
        var focusedRowIndex;
        var focusedColumn;
        switch (scroll.type) {
            case ScrollType.VERTICAL:
                focusedRowIndex = this.paginationProxy.getRowIndexAtPixel(newScrollTop + this.paginationProxy.getPixelOffset() + verticalScroll.focusedRowTopDelta);
                focusedColumn = focusedCellBeforeScrolling.column;
                break;
            case ScrollType.DIAGONAL:
                focusedRowIndex = this.paginationProxy.getRowIndexAtPixel(newScrollTop + this.paginationProxy.getPixelOffset() + diagonalScroll.focusedRowTopDelta);
                focusedColumn = diagonalScroll.columnToScrollTo;
                break;
            case ScrollType.HORIZONTAL:
                focusedRowIndex = focusedCellBeforeScrolling.rowIndex;
                focusedColumn = horizontalScroll.columnToScrollTo;
                break;
        }
        this.focusedCellController.setFocusedCell(focusedRowIndex, focusedColumn, null, true);
    };
    GridPanel.prototype.processMouseEvent = function (eventName, mouseEvent) {
        var renderedCell = this.mouseEventService.getRenderedCellForEvent(mouseEvent);
        if (renderedCell) {
            renderedCell.onMouseEvent(eventName, mouseEvent);
        }
        var renderedRow = this.getRowForEvent(mouseEvent);
        if (renderedRow) {
            renderedRow.onMouseEvent(eventName, mouseEvent);
        }
        this.preventDefaultOnContextMenu(mouseEvent);
    };
    GridPanel.prototype.onContextMenu = function (mouseEvent) {
        // to allow us to debug in chrome, we ignore the event if ctrl is pressed.
        // not everyone wants this, so first 'if' below allows to turn this hack off.
        if (!this.gridOptionsWrapper.isAllowContextMenuWithControlKey()) {
            // then do the check
            if (mouseEvent.ctrlKey || mouseEvent.metaKey) {
                return;
            }
        }
        if (this.contextMenuFactory && !this.gridOptionsWrapper.isSuppressContextMenu()) {
            this.contextMenuFactory.showMenu(null, null, null, mouseEvent);
            mouseEvent.preventDefault();
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
            var rowEnd;
            var floatingStart;
            var floatingEnd;
            if (this.floatingRowModel.isEmpty(constants_1.Constants.FLOATING_TOP)) {
                floatingStart = null;
            }
            else {
                floatingStart = constants_1.Constants.FLOATING_TOP;
            }
            if (this.floatingRowModel.isEmpty(constants_1.Constants.FLOATING_BOTTOM)) {
                floatingEnd = null;
                rowEnd = this.paginationProxy.getTotalRowCount() - 1;
            }
            else {
                floatingEnd = constants_1.Constants.FLOATING_BOTTOM;
                rowEnd = this.floatingRowModel.getFloatingBottomRowData().length = 1;
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
        if (!this.rangeController) {
            return;
        }
        this.clipboardService.pasteFromClipboard();
        return false;
    };
    GridPanel.prototype.onCtrlAndD = function (event) {
        if (!this.clipboardService) {
            return;
        }
        this.clipboardService.copyRangeDown();
        event.preventDefault();
        return false;
    };
    GridPanel.prototype.createOverlayTemplate = function (name, defaultTemplate, userProvidedTemplate) {
        var template = mainOverlayTemplate
            .replace('[OVERLAY_NAME]', name);
        if (userProvidedTemplate) {
            template = template.replace('[OVERLAY_TEMPLATE]', userProvidedTemplate);
        }
        else {
            template = template.replace('[OVERLAY_TEMPLATE]', defaultTemplate);
        }
        return template;
    };
    GridPanel.prototype.createLoadingOverlayTemplate = function () {
        var userProvidedTemplate = this.gridOptionsWrapper.getOverlayLoadingTemplate();
        var templateNotLocalised = this.createOverlayTemplate('loading', defaultLoadingOverlayTemplate, userProvidedTemplate);
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var templateLocalised = templateNotLocalised.replace('[LOADING...]', localeTextFunc('loadingOoo', 'Loading...'));
        return templateLocalised;
    };
    GridPanel.prototype.createNoRowsOverlayTemplate = function () {
        var userProvidedTemplate = this.gridOptionsWrapper.getOverlayNoRowsTemplate();
        var templateNotLocalised = this.createOverlayTemplate('no-rows', defaultNoRowsOverlayTemplate, userProvidedTemplate);
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var templateLocalised = templateNotLocalised.replace('[NO_ROWS_TO_SHOW]', localeTextFunc('noRowsToShow', 'No Rows To Show'));
        return templateLocalised;
    };
    GridPanel.prototype.ensureIndexVisible = function (index) {
        // if for print, everything is always visible
        if (this.gridOptionsWrapper.isForPrint()) {
            return;
        }
        this.logger.log('ensureIndexVisible: ' + index);
        var rowCount = this.paginationProxy.getTotalRowCount();
        if (typeof index !== 'number' || index < 0 || index >= rowCount) {
            console.warn('invalid row index for ensureIndexVisible: ' + index);
            return;
        }
        this.paginationProxy.goToPageWithIndex(index);
        var nodeAtIndex = this.paginationProxy.getRow(index);
        var pixelOffset = this.paginationProxy.getPixelOffset();
        var rowTopPixel = nodeAtIndex.rowTop - pixelOffset;
        var rowBottomPixel = rowTopPixel + nodeAtIndex.rowHeight;
        var vRange = this.getVerticalPixelRange();
        var vRangeTop = vRange.top;
        var vRangeBottom = vRange.bottom;
        var scrollShowing = this.isHorizontalScrollShowing();
        if (scrollShowing) {
            vRangeBottom -= this.scrollWidth;
        }
        var viewportScrolledPastRow = vRangeTop > rowTopPixel;
        var viewportScrolledBeforeRow = vRangeBottom < rowBottomPixel;
        var eViewportToScroll = this.getPrimaryScrollViewport();
        if (viewportScrolledPastRow) {
            // if row is before, scroll up with row at top
            eViewportToScroll.scrollTop = rowTopPixel;
            this.rowRenderer.drawVirtualRowsWithLock();
        }
        else if (viewportScrolledBeforeRow) {
            // if row is below, scroll down with row at bottom
            var viewportHeight = vRangeBottom - vRangeTop;
            var newScrollPosition = rowBottomPixel - viewportHeight;
            eViewportToScroll.scrollTop = newScrollPosition;
            this.rowRenderer.drawVirtualRowsWithLock();
        }
        // otherwise, row is already in view, so do nothing
    };
    GridPanel.prototype.getPrimaryScrollViewport = function () {
        if (this.enableRtl && this.columnController.isPinningLeft()) {
            return this.ePinnedLeftColsViewport;
        }
        else if (!this.enableRtl && this.columnController.isPinningRight()) {
            return this.ePinnedRightColsViewport;
        }
        else {
            return this.eBodyViewport;
        }
    };
    // + moveColumnController
    GridPanel.prototype.getCenterWidth = function () {
        return this.eBodyViewport.clientWidth;
    };
    GridPanel.prototype.isHorizontalScrollShowing = function () {
        var result = utils_1.Utils.isHorizontalScrollShowing(this.eBodyViewport);
        return result;
    };
    GridPanel.prototype.isVerticalScrollShowing = function () {
        if (this.columnController.isPinningRight()) {
            return utils_1.Utils.isVerticalScrollShowing(this.ePinnedRightColsViewport);
        }
        else {
            return utils_1.Utils.isVerticalScrollShowing(this.eBodyViewport);
        }
    };
    GridPanel.prototype.isBodyVerticalScrollShowing = function () {
        // if the scroll is on the pinned panel, then it is never in the center panel.
        // if LRT, then pinning right means scroll NOT on center
        if (!this.enableRtl && this.columnController.isPinningRight()) {
            return false;
        }
        // if RTL, then pinning left means scroll NOT on center
        if (this.enableRtl && this.columnController.isPinningLeft()) {
            return false;
        }
        return utils_1.Utils.isVerticalScrollShowing(this.eBodyViewport);
    };
    // gets called every 500 ms. we use this to set padding on right pinned column
    GridPanel.prototype.periodicallyCheck = function () {
        if (this.forPrint) {
            return;
        }
        this.setBottomPaddingOnPinnedRight();
        this.setMarginOnFullWidthCellContainer();
        this.setScrollShowing();
    };
    GridPanel.prototype.setScrollShowing = function () {
        var params = {
            vBody: false,
            hBody: false,
            vPinnedLeft: false,
            vPinnedRight: false
        };
        if (this.enableRtl) {
            if (this.columnController.isPinningLeft()) {
                params.vPinnedLeft = this.forPrint ? false : utils_1.Utils.isVerticalScrollShowing(this.ePinnedLeftColsViewport);
            }
            else {
                params.vBody = utils_1.Utils.isVerticalScrollShowing(this.eBodyViewport);
            }
        }
        else {
            if (this.columnController.isPinningRight()) {
                params.vPinnedRight = this.forPrint ? false : utils_1.Utils.isVerticalScrollShowing(this.ePinnedRightColsViewport);
            }
            else {
                params.vBody = utils_1.Utils.isVerticalScrollShowing(this.eBodyViewport);
            }
        }
        params.hBody = utils_1.Utils.isHorizontalScrollShowing(this.eBodyViewport);
        this.scrollVisibleService.setScrollsVisible(params);
    };
    // the pinned container needs extra space at the bottom, some blank space, otherwise when
    // vertically scrolled all the way down, the last row will be hidden behind the scrolls.
    // this extra padding allows the last row to be lifted above the bottom scrollbar.
    GridPanel.prototype.setBottomPaddingOnPinnedRight = function () {
        if (this.forPrint) {
            return;
        }
        if (this.columnController.isPinningRight()) {
            var bodyHorizontalScrollShowing = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
            if (bodyHorizontalScrollShowing) {
                this.ePinnedRightColsContainer.style.marginBottom = this.scrollWidth + 'px';
            }
            else {
                this.ePinnedRightColsContainer.style.marginBottom = '';
            }
        }
    };
    GridPanel.prototype.setMarginOnFullWidthCellContainer = function () {
        if (this.forPrint) {
            return;
        }
        // if either right or bottom scrollbars are showing, we need to make sure the
        // fullWidthCell panel isn't covering the scrollbars. originally i tried to do this using
        // margin, but the overflow was not getting clipped and going into the margin,
        // so used border instead. dunno why it works, trial and error found the solution.
        if (this.enableRtl) {
            if (this.isVerticalScrollShowing()) {
                this.eFullWidthCellViewport.style.borderLeft = this.scrollWidth + 'px solid transparent';
            }
            else {
                this.eFullWidthCellViewport.style.borderLeft = '';
            }
        }
        else {
            if (this.isVerticalScrollShowing()) {
                this.eFullWidthCellViewport.style.borderRight = this.scrollWidth + 'px solid transparent';
            }
            else {
                this.eFullWidthCellViewport.style.borderRight = '';
            }
        }
        if (this.isHorizontalScrollShowing()) {
            this.eFullWidthCellViewport.style.borderBottom = this.scrollWidth + 'px solid transparent';
        }
        else {
            this.eFullWidthCellViewport.style.borderBottom = '';
        }
    };
    GridPanel.prototype.ensureColumnVisible = function (key) {
        // if for print, everything is always visible
        if (this.gridOptionsWrapper.isForPrint()) {
            return;
        }
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
        if (viewportScrolledPastCol) {
            // if viewport's left side is after col's left side, scroll right to pull col into viewport at left
            if (this.enableRtl) {
                var newScrollPosition = bodyWidth - viewportWidth - colLeftPixel;
                this.setBodyViewportScrollLeft(newScrollPosition);
            }
            else {
                this.setBodyViewportScrollLeft(colLeftPixel);
            }
        }
        else if (viewportScrolledBeforeCol) {
            // if viewport's right side is before col's right side, scroll left to pull col into viewport at right
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
        this.setLeftAndRightBounds();
    };
    GridPanel.prototype.showLoadingOverlay = function () {
        if (!this.gridOptionsWrapper.isSuppressLoadingOverlay()) {
            this.layout.showOverlay('loading');
        }
    };
    GridPanel.prototype.showNoRowsOverlay = function () {
        if (!this.gridOptionsWrapper.isSuppressNoRowsOverlay()) {
            this.layout.showOverlay('noRows');
        }
    };
    GridPanel.prototype.hideOverlay = function () {
        this.layout.hideOverlay();
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
            this.columnController.sizeColumnsToFit(availableWidth);
        }
        else {
            if (nextTimeout === undefined) {
                setTimeout(function () {
                    _this.sizeColumnsToFit(100);
                }, 0);
            }
            else if (nextTimeout === 100) {
                setTimeout(function () {
                    _this.sizeColumnsToFit(-1);
                }, 100);
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
        if (this.forPrint) {
            return [this.eBodyContainer, this.eFloatingTopContainer, this.eFloatingBottomContainer];
        }
        else {
            return [this.eBodyViewport, this.eFloatingTopViewport, this.eFloatingBottomViewport];
        }
    };
    GridPanel.prototype.getBodyViewport = function () {
        return this.eBodyViewport;
    };
    GridPanel.prototype.getDropTargetLeftContainers = function () {
        if (this.forPrint) {
            return [];
        }
        else {
            return [this.ePinnedLeftColsViewport, this.ePinnedLeftFloatingBottom, this.ePinnedLeftFloatingTop];
        }
    };
    GridPanel.prototype.getDropTargetPinnedRightContainers = function () {
        if (this.forPrint) {
            return [];
        }
        else {
            return [this.ePinnedRightColsViewport, this.ePinnedRightFloatingBottom, this.ePinnedRightFloatingTop];
        }
    };
    GridPanel.prototype.getHeaderContainer = function () {
        return this.eHeaderContainer;
    };
    GridPanel.prototype.getHeaderOverlay = function () {
        return this.eHeaderOverlay;
    };
    GridPanel.prototype.getRoot = function () {
        return this.eRoot;
    };
    GridPanel.prototype.getPinnedLeftHeader = function () {
        return this.ePinnedLeftHeader;
    };
    GridPanel.prototype.getPinnedRightHeader = function () {
        return this.ePinnedRightHeader;
    };
    GridPanel.prototype.queryHtmlElement = function (selector) {
        return this.eRoot.querySelector(selector);
    };
    GridPanel.prototype.loadTemplate = function () {
        // the template we use is different when doing 'for print'
        var template = this.forPrint ? gridForPrintHtml : gridHtml;
        this.eRoot = utils_1.Utils.loadTemplate(template);
        // parts of the CSS need to know if we are in 'for print' mode or not,
        // so we add a class to allow applying CSS based on this.
        var scrollClass = this.forPrint ? 'ag-no-scrolls' : 'ag-scrolls';
        utils_1.Utils.addCssClass(this.eRoot, scrollClass);
    };
    GridPanel.prototype.findElements = function () {
        if (this.forPrint) {
            this.eHeaderContainer = this.queryHtmlElement('.ag-header-container');
            this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
            this.eFloatingTopContainer = this.queryHtmlElement('.ag-floating-top-container');
            this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');
            this.eAllCellContainers = [this.eBodyContainer, this.eFloatingTopContainer, this.eFloatingBottomContainer];
            var containers = {
                body: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eBodyContainer, useDocumentFragment: true }),
                fullWidth: null,
                pinnedLeft: null,
                pinnedRight: null,
                floatingTop: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eFloatingTopContainer }),
                floatingTopPinnedLeft: null,
                floatingTopPinnedRight: null,
                floatingTopFullWidth: null,
                floatingBottom: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eFloatingBottomContainer }),
                floatingBottomPinnedLeft: null,
                floatingBottomPinnedRight: null,
                floatingBottomFullWith: null
            };
            this.rowContainerComponents = containers;
            // when doing forPrint, we don't have any fullWidth containers, instead we add directly to the main
            // containers. this works in forPrint only as there are no pinned columns (no need for fullWidth to
            // span pinned columns) and the rows are already the full width of the grid (the reason for fullWidth)
            containers.fullWidth = containers.body;
            containers.floatingBottomFullWith = containers.floatingBottom;
            containers.floatingTopFullWidth = containers.floatingTop;
        }
        else {
            this.eBody = this.queryHtmlElement('.ag-body');
            this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
            this.eBodyViewport = this.queryHtmlElement('.ag-body-viewport');
            this.eBodyViewportWrapper = this.queryHtmlElement('.ag-body-viewport-wrapper');
            this.eFullWidthCellContainer = this.queryHtmlElement('.ag-full-width-container');
            this.eFullWidthCellViewport = this.queryHtmlElement('.ag-full-width-viewport');
            this.ePinnedLeftColsContainer = this.queryHtmlElement('.ag-pinned-left-cols-container');
            this.ePinnedRightColsContainer = this.queryHtmlElement('.ag-pinned-right-cols-container');
            this.ePinnedLeftColsViewport = this.queryHtmlElement('.ag-pinned-left-cols-viewport');
            this.ePinnedRightColsViewport = this.queryHtmlElement('.ag-pinned-right-cols-viewport');
            this.ePinnedLeftHeader = this.queryHtmlElement('.ag-pinned-left-header');
            this.ePinnedRightHeader = this.queryHtmlElement('.ag-pinned-right-header');
            this.eHeader = this.queryHtmlElement('.ag-header');
            this.eHeaderContainer = this.queryHtmlElement('.ag-header-container');
            this.eHeaderOverlay = this.queryHtmlElement('.ag-header-overlay');
            this.eHeaderViewport = this.queryHtmlElement('.ag-header-viewport');
            this.eFloatingTop = this.queryHtmlElement('.ag-floating-top');
            this.ePinnedLeftFloatingTop = this.queryHtmlElement('.ag-pinned-left-floating-top');
            this.ePinnedRightFloatingTop = this.queryHtmlElement('.ag-pinned-right-floating-top');
            this.eFloatingTopContainer = this.queryHtmlElement('.ag-floating-top-container');
            this.eFloatingTopViewport = this.queryHtmlElement('.ag-floating-top-viewport');
            this.eFloatingTopFullWidthCellContainer = this.queryHtmlElement('.ag-floating-top-full-width-container');
            this.eFloatingBottom = this.queryHtmlElement('.ag-floating-bottom');
            this.ePinnedLeftFloatingBottom = this.queryHtmlElement('.ag-pinned-left-floating-bottom');
            this.ePinnedRightFloatingBottom = this.queryHtmlElement('.ag-pinned-right-floating-bottom');
            this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');
            this.eFloatingBottomViewport = this.queryHtmlElement('.ag-floating-bottom-viewport');
            this.eFloatingBottomFullWidthCellContainer = this.queryHtmlElement('.ag-floating-bottom-full-width-container');
            this.eAllCellContainers = [
                this.ePinnedLeftColsContainer, this.ePinnedRightColsContainer, this.eBodyContainer,
                this.eFloatingTop, this.eFloatingBottom, this.eFullWidthCellContainer
            ];
            this.rowContainerComponents = {
                body: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eBodyContainer, eViewport: this.eBodyViewport, useDocumentFragment: true }),
                fullWidth: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eFullWidthCellContainer, hideWhenNoChildren: true, eViewport: this.eFullWidthCellViewport }),
                pinnedLeft: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.ePinnedLeftColsContainer, eViewport: this.ePinnedLeftColsViewport, useDocumentFragment: true }),
                pinnedRight: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.ePinnedRightColsContainer, eViewport: this.ePinnedRightColsViewport, useDocumentFragment: true }),
                floatingTop: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eFloatingTopContainer }),
                floatingTopPinnedLeft: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.ePinnedLeftFloatingTop }),
                floatingTopPinnedRight: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.ePinnedRightFloatingTop }),
                floatingTopFullWidth: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eFloatingTopFullWidthCellContainer, hideWhenNoChildren: true }),
                floatingBottom: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eFloatingBottomContainer }),
                floatingBottomPinnedLeft: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.ePinnedLeftFloatingBottom }),
                floatingBottomPinnedRight: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.ePinnedRightFloatingBottom }),
                floatingBottomFullWith: new rowContainerComponent_1.RowContainerComponent({ eContainer: this.eFloatingBottomFullWidthCellContainer, hideWhenNoChildren: true }),
            };
            this.addMouseWheelEventListeners();
        }
    };
    GridPanel.prototype.getRowContainers = function () {
        return this.rowContainerComponents;
    };
    GridPanel.prototype.addMouseWheelEventListeners = function () {
        // IE9, Chrome, Safari, Opera use 'mousewheel', Firefox uses 'DOMMouseScroll'
        this.addDestroyableEventListener(this.eBodyViewport, 'mousewheel', this.centerMouseWheelListener.bind(this));
        this.addDestroyableEventListener(this.eBodyViewport, 'DOMMouseScroll', this.centerMouseWheelListener.bind(this));
        if (this.enableRtl) {
            this.addDestroyableEventListener(this.ePinnedRightColsViewport, 'mousewheel', this.genericMouseWheelListener.bind(this));
            this.addDestroyableEventListener(this.ePinnedRightColsViewport, 'DOMMouseScroll', this.genericMouseWheelListener.bind(this));
        }
        else {
            this.addDestroyableEventListener(this.ePinnedLeftColsViewport, 'mousewheel', this.genericMouseWheelListener.bind(this));
            this.addDestroyableEventListener(this.ePinnedLeftColsViewport, 'DOMMouseScroll', this.genericMouseWheelListener.bind(this));
        }
    };
    GridPanel.prototype.getHeaderViewport = function () {
        return this.eHeaderViewport;
    };
    GridPanel.prototype.centerMouseWheelListener = function (event) {
        // we are only interested in mimicking the mouse wheel if we are not scrolling on the middle,
        // otherwise the body has scrolls and the mouse wheel works for free
        var bodyVScrollShowing = this.isBodyVerticalScrollActive();
        if (!bodyVScrollShowing) {
            var targetPanel = this.enableRtl ? this.ePinnedLeftColsViewport : this.ePinnedRightColsViewport;
            return this.generalMouseWheelListener(event, targetPanel);
        }
    };
    // used for listening to mouse wheel events on 1) left pinned and also the 2) fullWidthCell components.
    // the fullWidthCell listener is added in renderedRow, hence public.
    GridPanel.prototype.genericMouseWheelListener = function (event) {
        var targetPanel;
        var bodyVScrollActive = this.isBodyVerticalScrollActive();
        if (bodyVScrollActive) {
            targetPanel = this.eBodyViewport;
        }
        else {
            targetPanel = this.enableRtl ? this.ePinnedLeftColsViewport : this.ePinnedRightColsViewport;
        }
        return this.generalMouseWheelListener(event, targetPanel);
    };
    GridPanel.prototype.generalMouseWheelListener = function (event, targetPanel) {
        var wheelEvent = utils_1.Utils.normalizeWheel(event);
        // we need to detect in which direction scroll is happening to allow trackpads scroll horizontally
        // horizontal scroll
        if (Math.abs(wheelEvent.pixelX) > Math.abs(wheelEvent.pixelY)) {
            var newLeftPosition = this.eBodyViewport.scrollLeft + wheelEvent.pixelX;
            this.eBodyViewport.scrollLeft = newLeftPosition;
        }
        else {
            var newTopPosition = targetPanel.scrollTop + wheelEvent.pixelY;
            targetPanel.scrollTop = newTopPosition;
        }
        // allow the option to pass mouse wheel events to the browser
        // https://github.com/ceolter/ag-grid/issues/800
        // in the future, this should be tied in with 'forPrint' option, or have an option 'no vertical scrolls'
        if (!this.gridOptionsWrapper.isSuppressPreventDefaultOnMouseWheel()) {
            // if we don't prevent default, then the whole browser will scroll also as well as the grid
            event.preventDefault();
        }
        return false;
    };
    GridPanel.prototype.onDisplayedColumnsChanged = function () {
        this.setPinnedContainersVisible();
        this.setBodyAndHeaderHeights();
        this.setLeftAndRightBounds();
    };
    GridPanel.prototype.onDisplayedColumnsWidthChanged = function () {
        this.setWidthsOfContainers();
        this.setLeftAndRightBounds();
        if (this.enableRtl) {
            // because RTL is all backwards, a change in the width of the row
            // can cause a change in the scroll position, without a scroll event,
            // because the scroll position in RTL is a function that depends on
            // the width. to be convinced of this, take out this line, enable RTL,
            // scroll all the way to the left and then resize a column
            this.horizontallyScrollHeaderCenterAndFloatingCenter();
        }
    };
    GridPanel.prototype.onScrollVisibilityChanged = function () {
        this.setWidthsOfContainers();
    };
    GridPanel.prototype.setWidthsOfContainers = function () {
        var mainRowWidth = this.columnController.getBodyContainerWidth() + 'px';
        this.eBodyContainer.style.width = mainRowWidth;
        if (this.forPrint) {
            // pinned col doesn't exist when doing forPrint
            return;
        }
        this.eFloatingBottomContainer.style.width = mainRowWidth;
        this.eFloatingTopContainer.style.width = mainRowWidth;
        this.setPinnedLeftWidth();
        this.setPinnedRightWidth();
    };
    GridPanel.prototype.setPinnedLeftWidth = function () {
        var pinnedLeftWidth = this.scrollVisibleService.getPinnedLeftWidth() + 'px';
        var pinnedLeftWidthWithScroll = this.scrollVisibleService.getPinnedLeftWithScrollWidth() + 'px';
        this.ePinnedLeftColsViewport.style.width = pinnedLeftWidthWithScroll;
        this.eBodyViewportWrapper.style.marginLeft = pinnedLeftWidthWithScroll;
        this.ePinnedLeftFloatingBottom.style.width = pinnedLeftWidthWithScroll;
        this.ePinnedLeftFloatingTop.style.width = pinnedLeftWidthWithScroll;
        this.ePinnedLeftColsContainer.style.width = pinnedLeftWidth;
    };
    GridPanel.prototype.setPinnedRightWidth = function () {
        var pinnedRightWidth = this.scrollVisibleService.getPinnedRightWidth() + 'px';
        var pinnedRightWidthWithScroll = this.scrollVisibleService.getPinnedRightWithScrollWidth() + 'px';
        this.ePinnedRightColsViewport.style.width = pinnedRightWidthWithScroll;
        this.eBodyViewportWrapper.style.marginRight = pinnedRightWidthWithScroll;
        this.ePinnedRightFloatingBottom.style.width = pinnedRightWidthWithScroll;
        this.ePinnedRightFloatingTop.style.width = pinnedRightWidthWithScroll;
        this.ePinnedRightColsContainer.style.width = pinnedRightWidth;
    };
    GridPanel.prototype.setPinnedContainersVisible = function () {
        // no need to do this if not using scrolls
        if (this.forPrint) {
            return;
        }
        var changeDetected = false;
        var showLeftPinned = this.columnController.isPinningLeft();
        if (showLeftPinned !== this.pinningLeft) {
            this.pinningLeft = showLeftPinned;
            this.ePinnedLeftHeader.style.display = showLeftPinned ? 'inline-block' : 'none';
            this.ePinnedLeftColsViewport.style.display = showLeftPinned ? 'inline' : 'none';
            changeDetected = true;
        }
        var showRightPinned = this.columnController.isPinningRight();
        if (showRightPinned !== this.pinningRight) {
            this.pinningRight = showRightPinned;
            this.ePinnedRightHeader.style.display = showRightPinned ? 'inline-block' : 'none';
            this.ePinnedRightColsViewport.style.display = showRightPinned ? 'inline' : 'none';
            changeDetected = true;
        }
        if (changeDetected) {
            var bodyVScrollActive = this.isBodyVerticalScrollActive();
            this.eBodyViewport.style.overflowY = bodyVScrollActive ? 'auto' : 'hidden';
            // if we are v scrolling, then one of these will have the scroll position
            var scrollTop = Math.max(this.eBodyViewport.scrollTop, this.ePinnedLeftColsViewport.scrollTop, this.ePinnedRightColsViewport.scrollTop);
            // the body either uses it's scroll (when scrolling) or it's style.top
            // (when following the scroll of a pinned section), so we need to set it
            // back when changing from one to the other
            if (bodyVScrollActive) {
                this.eBodyContainer.style.top = '0px';
            }
            else {
                this.eBodyViewport.scrollTop = 0;
            }
            // when changing the primary scroll viewport, we copy over the scroll position,
            // eg if body was getting scrolled and we were at position 100px, then we start
            // pinning and pinned viewport is now the primary, we need to set it to 100px
            var primaryScrollViewport = this.getPrimaryScrollViewport();
            primaryScrollViewport.scrollTop = scrollTop;
            // this adjusts the scroll position of all the faking panels. they should already
            // be correct except body which has potentially just turned to be fake.
            this.fakeVerticalScroll(scrollTop);
        }
    };
    // init, layoutChanged, floatingDataChanged, headerHeightChanged
    GridPanel.prototype.setBodyAndHeaderHeights = function () {
        if (this.forPrint) {
            // if doing 'for print', then the header and footers are laid
            // out naturally by the browser. it whatever size that's needed to fit.
            return;
        }
        var heightOfContainer = this.layout.getCentreHeight();
        if (!heightOfContainer) {
            return;
        }
        var headerHeight = this.gridOptionsWrapper.getHeaderHeight();
        var numberOfRowsInHeader = this.columnController.getHeaderRowCount();
        var totalHeaderHeight = headerHeight * numberOfRowsInHeader;
        var floatingFilterActive = this.gridOptionsWrapper.isFloatingFilter() && !this.columnController.isPivotMode();
        if (floatingFilterActive) {
            totalHeaderHeight += 20;
        }
        this.eHeader.style['height'] = totalHeaderHeight + 'px';
        // padding top covers the header and the floating rows on top
        var floatingTopHeight = this.floatingRowModel.getFloatingTopTotalHeight();
        var paddingTop = totalHeaderHeight + floatingTopHeight;
        // bottom is just the bottom floating rows
        var floatingBottomHeight = this.floatingRowModel.getFloatingBottomTotalHeight();
        var floatingBottomTop = heightOfContainer - floatingBottomHeight;
        var bodyHeight = heightOfContainer - totalHeaderHeight - floatingBottomHeight - floatingTopHeight;
        this.eBody.style.top = paddingTop + 'px';
        this.eBody.style.height = bodyHeight + 'px';
        this.eFloatingTop.style.top = totalHeaderHeight + 'px';
        this.eFloatingTop.style.height = floatingTopHeight + 'px';
        this.eFloatingBottom.style.height = floatingBottomHeight + 'px';
        this.eFloatingBottom.style.top = floatingBottomTop + 'px';
        this.ePinnedLeftColsViewport.style.height = bodyHeight + 'px';
        this.ePinnedRightColsViewport.style.height = bodyHeight + 'px';
        // bodyHeight property is used by pagination service, that may change number of rows
        // in this page based on the height of the grid
        if (this.bodyHeight !== bodyHeight) {
            this.bodyHeight = bodyHeight;
            this.eventService.dispatchEvent(events_1.Events.EVENT_BODY_HEIGHT_CHANGED);
        }
    };
    GridPanel.prototype.getBodyHeight = function () {
        return this.bodyHeight;
    };
    GridPanel.prototype.setHorizontalScrollPosition = function (hScrollPosition) {
        this.eBodyViewport.scrollLeft = hScrollPosition;
    };
    // tries to scroll by pixels, but returns what the result actually was
    GridPanel.prototype.scrollHorizontally = function (pixels) {
        var oldScrollPosition = this.eBodyViewport.scrollLeft;
        this.setHorizontalScrollPosition(oldScrollPosition + pixels);
        var newScrollPosition = this.eBodyViewport.scrollLeft;
        return newScrollPosition - oldScrollPosition;
    };
    GridPanel.prototype.addScrollListener = function () {
        var _this = this;
        // if printing, then no scrolling, so no point in listening for scroll events
        if (this.forPrint) {
            return;
        }
        var wrapWithDebounce = function (func) {
            if (_this.useScrollLag) {
                return _this.debounce.bind(_this, func);
            }
            else {
                return func;
            }
        };
        var bodyScrollListener = wrapWithDebounce(this.onBodyScroll.bind(this));
        this.addDestroyableEventListener(this.eBodyViewport, 'scroll', bodyScrollListener);
        // below we add two things:
        // pinnedScrollListener -> when pinned panel with scrollbar gets scrolled, it updates body and other pinned
        // suppressScroll -> stops scrolling when pinned panel was moved - which can only happen when user is navigating
        //     in the pinned container, as the pinned col should never scroll. so we rollback the scroll on the pinned.
        var onPinnedLeftVerticalScroll = this.onVerticalScroll.bind(this, this.ePinnedLeftColsViewport);
        var onPinnedRightVerticalScroll = this.onVerticalScroll.bind(this, this.ePinnedRightColsViewport);
        if (this.enableRtl) {
            var pinnedScrollListener = wrapWithDebounce(onPinnedLeftVerticalScroll);
            this.addDestroyableEventListener(this.ePinnedLeftColsViewport, 'scroll', pinnedScrollListener);
            var suppressRightScroll = function () { return _this.ePinnedRightColsViewport.scrollTop = 0; };
            this.addDestroyableEventListener(this.ePinnedRightColsViewport, 'scroll', suppressRightScroll);
        }
        else {
            var pinnedScrollListener = wrapWithDebounce(onPinnedRightVerticalScroll);
            this.addDestroyableEventListener(this.ePinnedRightColsViewport, 'scroll', pinnedScrollListener);
            var suppressLeftScroll = function () { return _this.ePinnedLeftColsViewport.scrollTop = 0; };
            this.addDestroyableEventListener(this.ePinnedLeftColsViewport, 'scroll', suppressLeftScroll);
        }
        var suppressCenterScroll = function () {
            if (_this.getPrimaryScrollViewport() !== _this.eBodyViewport) {
                _this.eBodyViewport.scrollTop = 0;
            }
        };
        this.addDestroyableEventListener(this.eBodyViewport, 'scroll', suppressCenterScroll);
        this.addIEPinFix(onPinnedRightVerticalScroll, onPinnedLeftVerticalScroll);
    };
    GridPanel.prototype.onBodyScroll = function () {
        this.onBodyHorizontalScroll();
        this.onBodyVerticalScroll();
    };
    GridPanel.prototype.onBodyHorizontalScroll = function () {
        var newLeftPosition = this.eBodyViewport.scrollLeft;
        if (newLeftPosition !== this.lastLeftPosition) {
            this.eventService.dispatchEvent(events_1.Events.EVENT_BODY_SCROLL, { direction: 'horizontal' });
            this.lastLeftPosition = newLeftPosition;
            this.horizontallyScrollHeaderCenterAndFloatingCenter();
            this.masterSlaveService.fireHorizontalScrollEvent(newLeftPosition);
            this.setLeftAndRightBounds();
        }
    };
    GridPanel.prototype.onBodyVerticalScroll = function () {
        var bodyVScrollActive = this.isBodyVerticalScrollActive();
        if (bodyVScrollActive) {
            this.onVerticalScroll(this.eBodyViewport);
        }
    };
    GridPanel.prototype.onVerticalScroll = function (sourceElement) {
        var newTopPosition = sourceElement.scrollTop;
        if (newTopPosition !== this.lastTopPosition) {
            this.eventService.dispatchEvent(events_1.Events.EVENT_BODY_SCROLL, { direction: 'vertical' });
            this.lastTopPosition = newTopPosition;
            this.fakeVerticalScroll(newTopPosition);
            this.rowRenderer.drawVirtualRowsWithLock();
        }
    };
    // if LTR, we hide body scroll if pinning right (as scroll is in right pinned),
    // if RTL, we hide body scroll if pinning left (as scroll is in left pinned)
    GridPanel.prototype.isBodyVerticalScrollActive = function () {
        var pinningRight = this.columnController.isPinningRight();
        var pinningLeft = this.columnController.isPinningLeft();
        var centerHasScroll = this.enableRtl ? !pinningLeft : !pinningRight;
        return centerHasScroll;
    };
    // this bit is a fix / hack for IE due to this:
    // https://www.ag-grid.com/forum/showthread.php?tid=4303
    // it gets the left panel to reposition itself after a model change
    GridPanel.prototype.addIEPinFix = function (onPinnedRightScroll, onPinnedLeftScroll) {
        var _this = this;
        var listener = function () {
            if (_this.columnController.isPinningRight()) {
                setTimeout(function () {
                    if (_this.enableRtl) {
                        onPinnedLeftScroll();
                    }
                    else {
                        onPinnedRightScroll();
                    }
                }, 0);
            }
        };
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_MODEL_UPDATED, listener);
    };
    // this gets called whenever a change in the viewport, so we can inform column controller it has to work
    // out the virtual columns again. gets called from following locations:
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged
    GridPanel.prototype.setLeftAndRightBounds = function () {
        if (this.gridOptionsWrapper.isForPrint()) {
            return;
        }
        var scrollWidth = this.eBodyViewport.clientWidth;
        var scrollPosition = this.getBodyViewportScrollLeft();
        this.columnController.setVirtualViewportPosition(scrollWidth, scrollPosition);
    };
    GridPanel.prototype.isUseScrollLag = function () {
        // if we are in IE or Safari, then we only redraw if there was no scroll event
        // in the 50ms following this scroll event. without this, these browsers have
        // a bad scrolling feel, where the redraws clog the scroll experience
        // (makes the scroll clunky and sticky). this method is like throttling
        // the scroll events.
        // let the user override scroll lag option
        if (this.gridOptionsWrapper.isSuppressScrollLag()) {
            return false;
        }
        else if (this.gridOptionsWrapper.getIsScrollLag()) {
            return this.gridOptionsWrapper.getIsScrollLag()();
        }
        else {
            return utils_1.Utils.isBrowserIE() || utils_1.Utils.isBrowserSafari();
        }
    };
    GridPanel.prototype.debounce = function (callback) {
        var _this = this;
        if (this.requestAnimationFrameExists && utils_1.Utils.isBrowserSafari()) {
            if (!this.scrollLagTicking) {
                this.scrollLagTicking = true;
                requestAnimationFrame(function () {
                    callback();
                    _this.scrollLagTicking = false;
                });
            }
        }
        else {
            this.scrollLagCounter++;
            var scrollLagCounterCopy = this.scrollLagCounter;
            setTimeout(function () {
                if (_this.scrollLagCounter === scrollLagCounterCopy) {
                    callback();
                }
            }, 50);
        }
    };
    GridPanel.prototype.getBodyViewportScrollLeft = function () {
        if (this.forPrint) {
            return 0;
        }
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        return utils_1.Utils.getScrollLeft(this.eBodyViewport, this.enableRtl);
    };
    GridPanel.prototype.setBodyViewportScrollLeft = function (value) {
        if (this.forPrint) {
            return;
        }
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        utils_1.Utils.setScrollLeft(this.eBodyViewport, value, this.enableRtl);
    };
    GridPanel.prototype.horizontallyScrollHeaderCenterAndFloatingCenter = function () {
        var scrollLeft = this.getBodyViewportScrollLeft();
        var offset = this.enableRtl ? scrollLeft : -scrollLeft;
        this.eHeaderContainer.style.left = offset + 'px';
        this.eFloatingBottomContainer.style.left = offset + 'px';
        this.eFloatingTopContainer.style.left = offset + 'px';
    };
    // we say fake scroll as only one panel (left, right or body) has scrolls,
    // the other panels mimic the scroll by getting it's top position updated.
    GridPanel.prototype.fakeVerticalScroll = function (position) {
        if (this.enableRtl) {
            // RTL
            // if pinning left, then body scroll is faking
            var pinningLeft = this.columnController.isPinningLeft();
            if (pinningLeft) {
                this.eBodyContainer.style.top = -position + 'px';
            }
            // right is always faking
            this.ePinnedRightColsContainer.style.top = -position + 'px';
        }
        else {
            // LTR
            // if pinning right, then body scroll is faking
            var pinningRight = this.columnController.isPinningRight();
            if (pinningRight) {
                this.eBodyContainer.style.top = -position + 'px';
            }
            // left is always faking
            this.ePinnedLeftColsContainer.style.top = -position + 'px';
        }
        // always scroll fullWidth container, as this is never responsible for a scroll
        this.eFullWidthCellContainer.style.top = -position + 'px';
    };
    GridPanel.prototype.addScrollEventListener = function (listener) {
        this.eBodyViewport.addEventListener('scroll', listener);
    };
    GridPanel.prototype.removeScrollEventListener = function (listener) {
        this.eBodyViewport.removeEventListener('scroll', listener);
    };
    return GridPanel;
}(beanStub_1.BeanStub));
__decorate([
    context_1.Autowired('masterSlaveService'),
    __metadata("design:type", masterSlaveService_1.MasterSlaveService)
], GridPanel.prototype, "masterSlaveService", void 0);
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
    context_1.Autowired('floatingRowModel'),
    __metadata("design:type", floatingRowModel_1.FloatingRowModel)
], GridPanel.prototype, "floatingRowModel", void 0);
__decorate([
    context_1.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], GridPanel.prototype, "eventService", void 0);
__decorate([
    context_1.Autowired('paginationProxy'),
    __metadata("design:type", paginationProxy_1.PaginationProxy)
], GridPanel.prototype, "paginationProxy", void 0);
__decorate([
    context_1.Optional('rangeController'),
    __metadata("design:type", Object)
], GridPanel.prototype, "rangeController", void 0);
__decorate([
    context_1.Autowired('dragService'),
    __metadata("design:type", dragService_1.DragService)
], GridPanel.prototype, "dragService", void 0);
__decorate([
    context_1.Autowired('selectionController'),
    __metadata("design:type", selectionController_1.SelectionController)
], GridPanel.prototype, "selectionController", void 0);
__decorate([
    context_1.Optional('clipboardService'),
    __metadata("design:type", Object)
], GridPanel.prototype, "clipboardService", void 0);
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
    context_1.Optional('contextMenuFactory'),
    __metadata("design:type", Object)
], GridPanel.prototype, "contextMenuFactory", void 0);
__decorate([
    context_1.Autowired('frameworkFactory'),
    __metadata("design:type", Object)
], GridPanel.prototype, "frameworkFactory", void 0);
__decorate([
    __param(0, context_1.Qualifier('loggerFactory')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [logger_1.LoggerFactory]),
    __metadata("design:returntype", void 0)
], GridPanel.prototype, "agWire", null);
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
GridPanel = __decorate([
    context_1.Bean('gridPanel')
], GridPanel);
exports.GridPanel = GridPanel;
var ScrollType;
(function (ScrollType) {
    ScrollType[ScrollType["HORIZONTAL"] = 0] = "HORIZONTAL";
    ScrollType[ScrollType["VERTICAL"] = 1] = "VERTICAL";
    ScrollType[ScrollType["DIAGONAL"] = 2] = "DIAGONAL";
})(ScrollType || (ScrollType = {}));
function testKeyboardBindingGroups(keyboardBindingGroups, event) {
    for (var i = 0; i < keyboardBindingGroups.length; i++) {
        var keyboardBindingGroup = keyboardBindingGroups[i];
        for (var j = 0; j < keyboardBindingGroup.bindings.length; j++) {
            var keyboardBinding = keyboardBindingGroup.bindings[j];
            if (testKeyboardBinding(keyboardBinding, event)) {
                return {
                    trappedKeyboardBinding: keyboardBinding,
                    trappedKeyboardBindingGroup: keyboardBindingGroup
                };
            }
        }
    }
    return null;
}
function testKeyboardBinding(keyboardBinding, event) {
    var key = event.which || event.keyCode;
    return (keyboardBinding.ctlRequired === event.ctrlKey) &&
        (keyboardBinding.keyCode === key) &&
        (keyboardBinding.altRequired === event.altKey);
}
