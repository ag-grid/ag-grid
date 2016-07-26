/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.4
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var utils_1 = require("../utils");
var masterSlaveService_1 = require("../masterSlaveService");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var columnController_1 = require("../columnController/columnController");
var rowRenderer_1 = require("../rendering/rowRenderer");
var floatingRowModel_1 = require("../rowControllers/floatingRowModel");
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
// in the html below, it is important that there are no white space between some of the divs, as if there is white space,
// it won't render correctly in safari, as safari renders white space as a gap
var gridHtml = '<div>' +
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
    '</div>' +
    // floating bottom
    '<div class="ag-floating-bottom">' +
    '<div class="ag-pinned-left-floating-bottom"></div>' +
    '<div class="ag-pinned-right-floating-bottom"></div>' +
    '<div class="ag-floating-bottom-viewport">' +
    '<div class="ag-floating-bottom-container"></div>' +
    '</div>' +
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
    '</div>' +
    '</div>';
var gridForPrintHtml = '<div>' +
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
var GridPanel = (function () {
    function GridPanel() {
        this.requestAnimationFrameExists = typeof requestAnimationFrame === 'function';
        this.scrollLagCounter = 0;
        this.scrollLagTicking = false;
        this.lastLeftPosition = -1;
        this.lastTopPosition = -1;
        this.animationThreadCount = 0;
        this.destroyFunctions = [];
    }
    GridPanel.prototype.agWire = function (loggerFactory) {
        // makes code below more readable if we pull 'forPrint' out
        this.forPrint = this.gridOptionsWrapper.isForPrint();
        this.scrollWidth = utils_1.Utils.getScrollbarWidth();
        this.logger = loggerFactory.create('GridPanel');
        this.findElements();
    };
    GridPanel.prototype.destroy = function () {
        this.destroyFunctions.forEach(function (func) { return func(); });
    };
    GridPanel.prototype.onRowDataChanged = function () {
        if (this.rowModel.isEmpty() && !this.gridOptionsWrapper.isSuppressNoRowsOverlay()) {
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
        this.useScrollLag = this.isUseScrollLag();
        this.layout = new borderLayout_1.BorderLayout({
            overlays: {
                loading: utils_1.Utils.loadTemplate(this.createLoadingOverlayTemplate()),
                noRows: utils_1.Utils.loadTemplate(this.createNoRowsOverlayTemplate())
            },
            center: this.eRoot,
            dontFill: this.forPrint,
            name: 'eGridPanel'
        });
        this.layout.addSizeChangeListener(this.sizeHeaderAndBody.bind(this));
        this.addScrollListener();
        this.setLeftAndRightBounds();
        if (this.gridOptionsWrapper.isSuppressHorizontalScroll()) {
            this.eBodyViewport.style.overflowX = 'hidden';
        }
        if (this.gridOptionsWrapper.isRowModelDefault() && !this.gridOptionsWrapper.getRowData()) {
            this.showLoadingOverlay();
        }
        this.setWidthsOfContainers();
        this.showPinnedColContainersIfNeeded();
        this.sizeHeaderAndBody();
        this.disableBrowserDragging();
        this.addShortcutKeyListeners();
        this.addCellListeners();
        if (this.$scope) {
            this.addAngularApplyCheck();
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
        this.eventService.addEventListener(events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.eventService.addEventListener(events_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED, listener);
        this.destroyFunctions.push(function () {
            _this.eventService.removeEventListener(events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
            _this.eventService.removeEventListener(events_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED, listener);
        });
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
        this.eventService.addEventListener(events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_FLOATING_ROW_DATA_CHANGED, this.sizeHeaderAndBody.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_HEADER_HEIGHT_CHANGED, this.sizeHeaderAndBody.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_ROW_DATA_CHANGED, this.onRowDataChanged.bind(this));
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
            _this.dragService.addDragSource({
                dragStartPixels: 0,
                eElement: container,
                onDragStart: _this.rangeController.onDragStart.bind(_this.rangeController),
                onDragStop: _this.rangeController.onDragStop.bind(_this.rangeController),
                onDragging: _this.rangeController.onDragging.bind(_this.rangeController)
            });
        });
    };
    GridPanel.prototype.addCellListeners = function () {
        var _this = this;
        var eventNames = ['click', 'mousedown', 'dblclick', 'contextmenu'];
        var that = this;
        eventNames.forEach(function (eventName) {
            _this.eAllCellContainers.forEach(function (container) {
                return container.addEventListener(eventName, function (mouseEvent) {
                    var eventSource = this;
                    that.processMouseEvent(eventName, mouseEvent, eventSource);
                });
            });
        });
    };
    GridPanel.prototype.processMouseEvent = function (eventName, mouseEvent, eventSource) {
        var cell = this.mouseEventService.getCellForMouseEvent(mouseEvent);
        if (utils_1.Utils.exists(cell)) {
            //console.log(`row = ${cell.rowIndex}, floating = ${floating}`);
            this.rowRenderer.onMouseEvent(eventName, mouseEvent, eventSource, cell);
        }
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
        if (this.rangeController && this.rowModel.isRowsToRender()) {
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
                rowEnd = this.rowModel.getRowCount() - 1;
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
    GridPanel.prototype.getPinnedLeftFloatingTop = function () {
        return this.ePinnedLeftFloatingTop;
    };
    GridPanel.prototype.getPinnedRightFloatingTop = function () {
        return this.ePinnedRightFloatingTop;
    };
    GridPanel.prototype.getFloatingTopContainer = function () {
        return this.eFloatingTopContainer;
    };
    GridPanel.prototype.getPinnedLeftFloatingBottom = function () {
        return this.ePinnedLeftFloatingBottom;
    };
    GridPanel.prototype.getPinnedRightFloatingBottom = function () {
        return this.ePinnedRightFloatingBottom;
    };
    GridPanel.prototype.getFloatingBottomContainer = function () {
        return this.eFloatingBottomContainer;
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
        this.logger.log('ensureIndexVisible: ' + index);
        var lastRow = this.rowModel.getRowCount();
        if (typeof index !== 'number' || index < 0 || index >= lastRow) {
            console.warn('invalid row index for ensureIndexVisible: ' + index);
            return;
        }
        var nodeAtIndex = this.rowModel.getRow(index);
        var rowTopPixel = nodeAtIndex.rowTop;
        var rowBottomPixel = rowTopPixel + nodeAtIndex.rowHeight;
        var viewportTopPixel = this.eBodyViewport.scrollTop;
        var viewportHeight = this.eBodyViewport.offsetHeight;
        var scrollShowing = this.isHorizontalScrollShowing();
        if (scrollShowing) {
            viewportHeight -= this.scrollWidth;
        }
        var viewportBottomPixel = viewportTopPixel + viewportHeight;
        var viewportScrolledPastRow = viewportTopPixel > rowTopPixel;
        var viewportScrolledBeforeRow = viewportBottomPixel < rowBottomPixel;
        var eViewportToScroll = this.columnController.isPinningRight() ? this.ePinnedRightColsViewport : this.eBodyViewport;
        if (viewportScrolledPastRow) {
            // if row is before, scroll up with row at top
            eViewportToScroll.scrollTop = rowTopPixel;
        }
        else if (viewportScrolledBeforeRow) {
            // if row is below, scroll down with row at bottom
            var newScrollPosition = rowBottomPixel - viewportHeight;
            eViewportToScroll.scrollTop = newScrollPosition;
        }
        // otherwise, row is already in view, so do nothing
    };
    // + moveColumnController
    GridPanel.prototype.getCenterWidth = function () {
        return this.eBodyViewport.clientWidth;
    };
    GridPanel.prototype.isHorizontalScrollShowing = function () {
        var result = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
        return result;
    };
    GridPanel.prototype.isVerticalScrollShowing = function () {
        if (this.columnController.isPinningRight()) {
            // if pinning right, then the scroll bar can show, however for some reason
            // it overlays the grid and doesn't take space.
            return false;
        }
        else {
            return this.eBodyViewport.clientHeight < this.eBodyViewport.scrollHeight;
        }
    };
    // gets called every 500 ms. we use this to set padding on right pinned column
    GridPanel.prototype.periodicallyCheck = function () {
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
        var viewportLeftPixel = this.eBodyViewport.scrollLeft;
        var viewportWidth = this.eBodyViewport.offsetWidth;
        var scrollShowing = this.eBodyViewport.clientHeight < this.eBodyViewport.scrollHeight;
        if (scrollShowing) {
            viewportWidth -= this.scrollWidth;
        }
        var viewportRightPixel = viewportLeftPixel + viewportWidth;
        var viewportScrolledPastCol = viewportLeftPixel > colLeftPixel;
        var viewportScrolledBeforeCol = viewportRightPixel < colRightPixel;
        if (viewportScrolledPastCol) {
            // if viewport's left side is after col's left side, scroll right to pull col into viewport at left
            this.eBodyViewport.scrollLeft = colLeftPixel;
        }
        else if (viewportScrolledBeforeCol) {
            // if viewport's right side is before col's right side, scroll left to pull col into viewport at right
            var newScrollPosition = colRightPixel - viewportWidth;
            this.eBodyViewport.scrollLeft = newScrollPosition;
        }
        // otherwise, col is already in view, so do nothing
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
        var scrollShowing = this.isVerticalScrollShowing();
        if (scrollShowing) {
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
    GridPanel.prototype.getPinnedLeftColsContainer = function () {
        return this.ePinnedLeftColsContainer;
    };
    GridPanel.prototype.getDropTargetLeftContainers = function () {
        if (this.forPrint) {
            return [];
        }
        else {
            return [this.ePinnedLeftColsViewport, this.ePinnedLeftFloatingBottom, this.ePinnedLeftFloatingTop];
        }
    };
    GridPanel.prototype.getPinnedRightColsContainer = function () {
        return this.ePinnedRightColsContainer;
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
    GridPanel.prototype.findElements = function () {
        if (this.forPrint) {
            this.eRoot = utils_1.Utils.loadTemplate(gridForPrintHtml);
            utils_1.Utils.addCssClass(this.eRoot, 'ag-root');
            utils_1.Utils.addCssClass(this.eRoot, 'ag-font-style');
            utils_1.Utils.addCssClass(this.eRoot, 'ag-no-scrolls');
        }
        else {
            this.eRoot = utils_1.Utils.loadTemplate(gridHtml);
            utils_1.Utils.addCssClass(this.eRoot, 'ag-root');
            utils_1.Utils.addCssClass(this.eRoot, 'ag-font-style');
            utils_1.Utils.addCssClass(this.eRoot, 'ag-scrolls');
        }
        if (this.forPrint) {
            this.eHeaderContainer = this.queryHtmlElement('.ag-header-container');
            this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
            this.eFloatingTopContainer = this.queryHtmlElement('.ag-floating-top-container');
            this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');
            this.eAllCellContainers = [this.eBodyContainer, this.eFloatingTopContainer, this.eFloatingBottomContainer];
        }
        else {
            this.eBody = this.queryHtmlElement('.ag-body');
            this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
            this.eBodyViewport = this.queryHtmlElement('.ag-body-viewport');
            this.eBodyViewportWrapper = this.queryHtmlElement('.ag-body-viewport-wrapper');
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
            this.eFloatingBottom = this.queryHtmlElement('.ag-floating-bottom');
            this.ePinnedLeftFloatingBottom = this.queryHtmlElement('.ag-pinned-left-floating-bottom');
            this.ePinnedRightFloatingBottom = this.queryHtmlElement('.ag-pinned-right-floating-bottom');
            this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');
            this.eFloatingBottomViewport = this.queryHtmlElement('.ag-floating-bottom-viewport');
            this.eAllCellContainers = [this.ePinnedLeftColsContainer, this.ePinnedRightColsContainer, this.eBodyContainer,
                this.eFloatingTop, this.eFloatingBottom];
            // IE9, Chrome, Safari, Opera
            this.ePinnedLeftColsViewport.addEventListener('mousewheel', this.pinnedLeftMouseWheelListener.bind(this));
            this.eBodyViewport.addEventListener('mousewheel', this.centerMouseWheelListener.bind(this));
            // Firefox
            this.ePinnedLeftColsViewport.addEventListener('DOMMouseScroll', this.pinnedLeftMouseWheelListener.bind(this));
            this.eBodyViewport.addEventListener('DOMMouseScroll', this.centerMouseWheelListener.bind(this));
        }
    };
    GridPanel.prototype.getHeaderViewport = function () {
        return this.eHeaderViewport;
    };
    GridPanel.prototype.centerMouseWheelListener = function (event) {
        // we are only interested in mimicking the mouse wheel if we are pinning on the right,
        // as if we are not pinning on the right, then we have scrollbars in the center body, and
        // as such we just use the default browser wheel behaviour.
        if (this.columnController.isPinningRight()) {
            return this.generalMouseWheelListener(event, this.ePinnedRightColsViewport);
        }
    };
    GridPanel.prototype.pinnedLeftMouseWheelListener = function (event) {
        var targetPanel;
        if (this.columnController.isPinningRight()) {
            targetPanel = this.ePinnedRightColsViewport;
        }
        else {
            targetPanel = this.eBodyViewport;
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
            var newTopPosition = this.eBodyViewport.scrollTop + wheelEvent.pixelY;
            targetPanel.scrollTop = newTopPosition;
        }
        // allow the option to pass mouse wheel events ot the browser
        // https://github.com/ceolter/ag-grid/issues/800
        // in the future, this should be tied in with 'forPrint' option, or have an option 'no vertical scrolls'
        if (!this.gridOptionsWrapper.isSuppressPreventDefaultOnMouseWheel()) {
            // if we don't prevent default, then the whole browser will scroll also as well as the grid
            event.preventDefault();
        }
        return false;
    };
    GridPanel.prototype.onColumnResized = function () {
        this.setWidthsOfContainers();
    };
    GridPanel.prototype.onDisplayedColumnsChanged = function () {
        this.setWidthsOfContainers();
        this.showPinnedColContainersIfNeeded();
        this.sizeHeaderAndBody();
    };
    GridPanel.prototype.setWidthsOfContainers = function () {
        this.logger.log('setWidthsOfContainers()');
        this.showPinnedColContainersIfNeeded();
        var mainRowWidth = this.columnController.getBodyContainerWidth() + 'px';
        this.eBodyContainer.style.width = mainRowWidth;
        if (this.forPrint) {
            // pinned col doesn't exist when doing forPrint
            return;
        }
        this.eFloatingBottomContainer.style.width = mainRowWidth;
        this.eFloatingTopContainer.style.width = mainRowWidth;
        var pinnedLeftWidth = this.columnController.getPinnedLeftContainerWidth() + 'px';
        this.ePinnedLeftColsContainer.style.width = pinnedLeftWidth;
        this.ePinnedLeftFloatingBottom.style.width = pinnedLeftWidth;
        this.ePinnedLeftFloatingTop.style.width = pinnedLeftWidth;
        this.eBodyViewportWrapper.style.marginLeft = pinnedLeftWidth;
        var pinnedRightWidth = this.columnController.getPinnedRightContainerWidth() + 'px';
        this.ePinnedRightColsContainer.style.width = pinnedRightWidth;
        this.ePinnedRightFloatingBottom.style.width = pinnedRightWidth;
        this.ePinnedRightFloatingTop.style.width = pinnedRightWidth;
        this.eBodyViewportWrapper.style.marginRight = pinnedRightWidth;
    };
    GridPanel.prototype.showPinnedColContainersIfNeeded = function () {
        // no need to do this if not using scrolls
        if (this.forPrint) {
            return;
        }
        //some browsers had layout issues with the blank divs, so if blank,
        //we don't display them
        if (this.columnController.isPinningLeft()) {
            this.ePinnedLeftHeader.style.display = 'inline-block';
            this.ePinnedLeftColsViewport.style.display = 'inline';
        }
        else {
            this.ePinnedLeftHeader.style.display = 'none';
            this.ePinnedLeftColsViewport.style.display = 'none';
        }
        if (this.columnController.isPinningRight()) {
            this.ePinnedRightHeader.style.display = 'inline-block';
            this.ePinnedRightColsViewport.style.display = 'inline';
            this.eBodyViewport.style.overflowY = 'hidden';
        }
        else {
            this.ePinnedRightHeader.style.display = 'none';
            this.ePinnedRightColsViewport.style.display = 'none';
            this.eBodyViewport.style.overflowY = 'auto';
        }
    };
    GridPanel.prototype.sizeHeaderAndBody = function () {
        if (this.forPrint) {
            // if doing 'for print', then the header and footers are laid
            // out naturally by the browser. it whatever size that's needed to fit.
            return;
        }
        this.setLeftAndRightBounds();
        var heightOfContainer = this.layout.getCentreHeight();
        if (!heightOfContainer) {
            return;
        }
        var headerHeight = this.gridOptionsWrapper.getHeaderHeight();
        var numberOfRowsInHeader = this.columnController.getHeaderRowCount();
        var totalHeaderHeight = headerHeight * numberOfRowsInHeader;
        this.eHeader.style['height'] = totalHeaderHeight + 'px';
        // padding top covers the header and the floating rows on top
        var floatingTopHeight = this.floatingRowModel.getFloatingTopTotalHeight();
        var paddingTop = totalHeaderHeight + floatingTopHeight;
        // bottom is just the bottom floating rows
        var floatingBottomHeight = this.floatingRowModel.getFloatingBottomTotalHeight();
        var floatingBottomTop = heightOfContainer - floatingBottomHeight;
        var heightOfCentreRows = heightOfContainer - totalHeaderHeight - floatingBottomHeight - floatingTopHeight;
        this.eBody.style.paddingTop = paddingTop + 'px';
        this.eBody.style.paddingBottom = floatingBottomHeight + 'px';
        this.eFloatingTop.style.top = totalHeaderHeight + 'px';
        this.eFloatingTop.style.height = floatingTopHeight + 'px';
        this.eFloatingBottom.style.height = floatingBottomHeight + 'px';
        this.eFloatingBottom.style.top = floatingBottomTop + 'px';
        this.ePinnedLeftColsViewport.style.height = heightOfCentreRows + 'px';
        this.ePinnedRightColsViewport.style.height = heightOfCentreRows + 'px';
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
    GridPanel.prototype.getHorizontalScrollPosition = function () {
        if (this.forPrint) {
            return 0;
        }
        else {
            return this.eBodyViewport.scrollLeft;
        }
    };
    GridPanel.prototype.turnOnAnimationForABit = function () {
        var _this = this;
        if (this.gridOptionsWrapper.isSuppressColumnMoveAnimation()) {
            return;
        }
        this.animationThreadCount++;
        var animationThreadCountCopy = this.animationThreadCount;
        utils_1.Utils.addCssClass(this.eRoot, 'ag-column-moving');
        setTimeout(function () {
            if (_this.animationThreadCount === animationThreadCountCopy) {
                utils_1.Utils.removeCssClass(_this.eRoot, 'ag-column-moving');
            }
        }, 300);
    };
    GridPanel.prototype.addScrollListener = function () {
        var _this = this;
        // if printing, then no scrolling, so no point in listening for scroll events
        if (this.forPrint) {
            return;
        }
        var that = this;
        function onBodyViewportScroll() {
            // we are always interested in horizontal scrolls of the body
            var newLeftPosition = that.eBodyViewport.scrollLeft;
            if (newLeftPosition !== that.lastLeftPosition) {
                that.lastLeftPosition = newLeftPosition;
                that.horizontallyScrollHeaderCenterAndFloatingCenter();
                that.masterSlaveService.fireHorizontalScrollEvent(newLeftPosition);
                that.setLeftAndRightBounds();
            }
            // if we are pinning to the right, then it's the right pinned container
            // that has the scroll.
            if (!that.columnController.isPinningRight()) {
                var newTopPosition = that.eBodyViewport.scrollTop;
                if (newTopPosition !== that.lastTopPosition) {
                    that.lastTopPosition = newTopPosition;
                    that.verticallyScrollLeftPinned(newTopPosition);
                    that.rowRenderer.drawVirtualRows();
                }
            }
        }
        function onPinnedRightScroll() {
            var newTopPosition = that.ePinnedRightColsViewport.scrollTop;
            if (newTopPosition !== that.lastTopPosition) {
                that.lastTopPosition = newTopPosition;
                that.verticallyScrollLeftPinned(newTopPosition);
                that.verticallyScrollBody(newTopPosition);
                that.rowRenderer.drawVirtualRows();
            }
        }
        if (this.useScrollLag) {
            this.eBodyViewport.addEventListener('scroll', this.debounce.bind(this, onBodyViewportScroll));
            this.ePinnedRightColsViewport.addEventListener('scroll', this.debounce.bind(this, onPinnedRightScroll));
        }
        else {
            this.eBodyViewport.addEventListener('scroll', onBodyViewportScroll);
            this.ePinnedRightColsViewport.addEventListener('scroll', onPinnedRightScroll);
        }
        // this means the pinned panel was moved, which can only
        // happen when the user is navigating in the pinned container
        // as the pinned col should never scroll. so we rollback
        // the scroll on the pinned.
        this.ePinnedLeftColsViewport.addEventListener('scroll', function () {
            _this.ePinnedLeftColsViewport.scrollTop = 0;
        });
    };
    GridPanel.prototype.setLeftAndRightBounds = function () {
        if (this.gridOptionsWrapper.isForPrint()) {
            return;
        }
        var scrollPosition = this.eBodyViewport.scrollLeft;
        var totalWidth = this.eBody.offsetWidth;
        this.columnController.setWidthAndScrollPosition(totalWidth, scrollPosition);
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
    GridPanel.prototype.horizontallyScrollHeaderCenterAndFloatingCenter = function () {
        var bodyLeftPosition = this.eBodyViewport.scrollLeft;
        this.eHeaderContainer.style.left = -bodyLeftPosition + 'px';
        this.eFloatingBottomContainer.style.left = -bodyLeftPosition + 'px';
        this.eFloatingTopContainer.style.left = -bodyLeftPosition + 'px';
    };
    GridPanel.prototype.verticallyScrollLeftPinned = function (bodyTopPosition) {
        this.ePinnedLeftColsContainer.style.top = -bodyTopPosition + 'px';
    };
    GridPanel.prototype.verticallyScrollBody = function (position) {
        this.eBodyViewport.scrollTop = position;
    };
    GridPanel.prototype.getVerticalScrollPosition = function () {
        if (this.forPrint) {
            return 0;
        }
        else {
            return this.eBodyViewport.scrollTop;
        }
    };
    GridPanel.prototype.getBodyViewportClientRect = function () {
        if (this.forPrint) {
            return this.eBodyContainer.getBoundingClientRect();
        }
        else {
            return this.eBodyViewport.getBoundingClientRect();
        }
    };
    GridPanel.prototype.getFloatingTopClientRect = function () {
        if (this.forPrint) {
            return this.eFloatingTopContainer.getBoundingClientRect();
        }
        else {
            return this.eFloatingTop.getBoundingClientRect();
        }
    };
    GridPanel.prototype.getFloatingBottomClientRect = function () {
        if (this.forPrint) {
            return this.eFloatingBottomContainer.getBoundingClientRect();
        }
        else {
            return this.eFloatingBottom.getBoundingClientRect();
        }
    };
    GridPanel.prototype.getPinnedLeftColsViewportClientRect = function () {
        return this.ePinnedLeftColsViewport.getBoundingClientRect();
    };
    GridPanel.prototype.getPinnedRightColsViewportClientRect = function () {
        return this.ePinnedRightColsViewport.getBoundingClientRect();
    };
    GridPanel.prototype.addScrollEventListener = function (listener) {
        this.eBodyViewport.addEventListener('scroll', listener);
    };
    GridPanel.prototype.removeScrollEventListener = function (listener) {
        this.eBodyViewport.removeEventListener('scroll', listener);
    };
    __decorate([
        context_1.Autowired('masterSlaveService'), 
        __metadata('design:type', masterSlaveService_1.MasterSlaveService)
    ], GridPanel.prototype, "masterSlaveService", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], GridPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], GridPanel.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('rowRenderer'), 
        __metadata('design:type', rowRenderer_1.RowRenderer)
    ], GridPanel.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired('floatingRowModel'), 
        __metadata('design:type', floatingRowModel_1.FloatingRowModel)
    ], GridPanel.prototype, "floatingRowModel", void 0);
    __decorate([
        context_1.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], GridPanel.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('rowModel'), 
        __metadata('design:type', Object)
    ], GridPanel.prototype, "rowModel", void 0);
    __decorate([
        context_1.Optional('rangeController'), 
        __metadata('design:type', Object)
    ], GridPanel.prototype, "rangeController", void 0);
    __decorate([
        context_1.Autowired('dragService'), 
        __metadata('design:type', dragService_1.DragService)
    ], GridPanel.prototype, "dragService", void 0);
    __decorate([
        context_1.Autowired('selectionController'), 
        __metadata('design:type', selectionController_1.SelectionController)
    ], GridPanel.prototype, "selectionController", void 0);
    __decorate([
        context_1.Optional('clipboardService'), 
        __metadata('design:type', Object)
    ], GridPanel.prototype, "clipboardService", void 0);
    __decorate([
        context_1.Autowired('csvCreator'), 
        __metadata('design:type', csvCreator_1.CsvCreator)
    ], GridPanel.prototype, "csvCreator", void 0);
    __decorate([
        context_1.Autowired('mouseEventService'), 
        __metadata('design:type', mouseEventService_1.MouseEventService)
    ], GridPanel.prototype, "mouseEventService", void 0);
    __decorate([
        context_1.Autowired('focusedCellController'), 
        __metadata('design:type', focusedCellController_1.FocusedCellController)
    ], GridPanel.prototype, "focusedCellController", void 0);
    __decorate([
        context_1.Autowired('$scope'), 
        __metadata('design:type', Object)
    ], GridPanel.prototype, "$scope", void 0);
    __decorate([
        __param(0, context_1.Qualifier('loggerFactory')), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
        __metadata('design:returntype', void 0)
    ], GridPanel.prototype, "agWire", null);
    __decorate([
        context_1.PreDestroy, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], GridPanel.prototype, "destroy", null);
    __decorate([
        context_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], GridPanel.prototype, "init", null);
    GridPanel = __decorate([
        context_1.Bean('gridPanel'), 
        __metadata('design:paramtypes', [])
    ], GridPanel);
    return GridPanel;
})();
exports.GridPanel = GridPanel;
