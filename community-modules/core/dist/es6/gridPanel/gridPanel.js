/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
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
import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { Autowired, Optional, PostConstruct } from '../context/context';
import { Events } from '../events';
import { Constants } from '../constants';
import { RowContainerComponent } from '../rendering/rowContainerComponent';
import { RowComp } from '../rendering/rowComp';
import { TouchListener } from '../widgets/touchListener';
import { RowDragFeature } from './rowDragFeature';
import { Component } from '../widgets/component';
import { RefSelector } from '../widgets/componentAnnotations';
import { ModuleRegistry } from '../modules/moduleRegistry';
import { ModuleNames } from '../modules/moduleNames';
import { _ } from "../utils";
// in the html below, it is important that there are no white space between some of the divs, as if there is white space,
// it won't render correctly in safari, as safari renders white space as a gap
var GRID_PANEL_NORMAL_TEMPLATE = /* html */ "<div class=\"ag-root ag-unselectable\" role=\"grid\" unselectable=\"on\">\n        <ag-header-root ref=\"headerRoot\" unselectable=\"on\"></ag-header-root>\n        <div class=\"ag-floating-top\" ref=\"eTop\" role=\"presentation\" unselectable=\"on\">\n            <div class=\"ag-pinned-left-floating-top\" ref=\"eLeftTop\" role=\"presentation\" unselectable=\"on\"></div>\n            <div class=\"ag-floating-top-viewport\" ref=\"eTopViewport\" role=\"presentation\" unselectable=\"on\">\n                <div class=\"ag-floating-top-container\" ref=\"eTopContainer\" role=\"presentation\" unselectable=\"on\"></div>\n            </div>\n            <div class=\"ag-pinned-right-floating-top\" ref=\"eRightTop\" role=\"presentation\" unselectable=\"on\"></div>\n            <div class=\"ag-floating-top-full-width-container\" ref=\"eTopFullWidthContainer\" role=\"presentation\" unselectable=\"on\"></div>\n        </div>\n        <div class=\"ag-body-viewport\" ref=\"eBodyViewport\" role=\"presentation\">\n            <div class=\"ag-pinned-left-cols-container\" ref=\"eLeftContainer\" role=\"presentation\" unselectable=\"on\"></div>\n            <div class=\"ag-center-cols-clipper\" ref=\"eCenterColsClipper\" role=\"presentation\" unselectable=\"on\">\n                <div class=\"ag-center-cols-viewport\" ref=\"eCenterViewport\" role=\"presentation\">\n                    <div class=\"ag-center-cols-container\" ref=\"eCenterContainer\" role=\"rowgroup\" unselectable=\"on\"></div>\n                </div>\n            </div>\n            <div class=\"ag-pinned-right-cols-container\" ref=\"eRightContainer\" role=\"presentation\" unselectable=\"on\"></div>\n            <div class=\"ag-full-width-container\" ref=\"eFullWidthContainer\" role=\"presentation\" unselectable=\"on\"></div>\n        </div>\n        <div class=\"ag-floating-bottom\" ref=\"eBottom\" role=\"presentation\" unselectable=\"on\">\n            <div class=\"ag-pinned-left-floating-bottom\" ref=\"eLeftBottom\" role=\"presentation\" unselectable=\"on\"></div>\n            <div class=\"ag-floating-bottom-viewport\" ref=\"eBottomViewport\" role=\"presentation\" unselectable=\"on\">\n                <div class=\"ag-floating-bottom-container\" ref=\"eBottomContainer\" role=\"presentation\" unselectable=\"on\"></div>\n            </div>\n            <div class=\"ag-pinned-right-floating-bottom\" ref=\"eRightBottom\" role=\"presentation\" unselectable=\"on\"></div>\n            <div class=\"ag-floating-bottom-full-width-container\" ref=\"eBottomFullWidthContainer\" role=\"presentation\" unselectable=\"on\"></div>\n        </div>\n        <div class=\"ag-body-horizontal-scroll\" ref=\"eHorizontalScrollBody\" aria-hidden=\"true\">\n            <div class=\"ag-horizontal-left-spacer\" ref=\"eHorizontalLeftSpacer\"></div>\n            <div class=\"ag-body-horizontal-scroll-viewport\" ref=\"eBodyHorizontalScrollViewport\">\n                <div class=\"ag-body-horizontal-scroll-container\" ref=\"eBodyHorizontalScrollContainer\"></div>\n            </div>\n            <div class=\"ag-horizontal-right-spacer\" ref=\"eHorizontalRightSpacer\"></div>\n        </div>\n        <ag-overlay-wrapper ref=\"overlayWrapper\"></ag-overlay-wrapper>\n    </div>";
var GridPanel = /** @class */ (function (_super) {
    __extends(GridPanel, _super);
    function GridPanel() {
        var _this = _super.call(this, GRID_PANEL_NORMAL_TEMPLATE) || this;
        _this.scrollLeft = -1;
        _this.scrollTop = -1;
        _this.resetLastHorizontalScrollElementDebounced = _.debounce(_this.resetLastHorizontalScrollElement.bind(_this), 500);
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
        if (this.beans.columnController.isReady() && !this.paginationProxy.isEmpty()) {
            this.hideOverlay();
        }
    };
    GridPanel.prototype.init = function () {
        var _this = this;
        this.scrollWidth = this.gridOptionsWrapper.getScrollbarWidth();
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
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
        this.headerNavigationService.registerGridComp(this);
        this.heightScaler.registerGridComp(this);
        this.autoHeightCalculator.registerGridComp(this);
        this.columnAnimationService.registerGridComp(this);
        this.autoWidthCalculator.registerGridComp(this);
        this.paginationAutoPageSizeService.registerGridComp(this);
        this.mouseEventService.registerGridComp(this);
        this.beans.registerGridComp(this);
        this.rowRenderer.registerGridComp(this);
        if (this.rangeController) {
            this.rangeController.registerGridComp(this);
        }
        [this.eCenterViewport, this.eBodyViewport].forEach(function (viewport) {
            var unsubscribeFromResize = _this.resizeObserverService.observeResize(viewport, _this.onCenterViewportResized.bind(_this));
            _this.addDestroyFunc(function () { return unsubscribeFromResize(); });
        });
        [this.eTop, this.eBodyViewport, this.eBottom].forEach(function (element) {
            _this.addManagedListener(element, 'focusin', function () {
                _.addCssClass(element, 'ag-has-focus');
            });
            _this.addManagedListener(element, 'focusout', function (e) {
                if (!element.contains(e.relatedTarget)) {
                    _.removeCssClass(element, 'ag-has-focus');
                }
            });
        });
    };
    GridPanel.prototype.onDomLayoutChanged = function () {
        var newPrintLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
        if (this.printLayout !== newPrintLayout) {
            this.printLayout = newPrintLayout;
            this.setWidthsOfContainers();
            // pinned containers are always hidden for print layout
            this.setPinnedContainerSize();
        }
    };
    GridPanel.prototype.onCenterViewportResized = function () {
        if (_.isVisible(this.eCenterViewport)) {
            this.checkViewportAndScrolls();
            this.beans.columnController.refreshFlexedColumns(this.getCenterWidth());
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
            .forEach(function (ct) { return _.addOrRemoveCssClass(ct, 'ag-selectable', selectable); });
    };
    GridPanel.prototype.addRowDragListener = function () {
        this.rowDragFeature = this.createManagedBean(new RowDragFeature(this.eBodyViewport, this));
        this.dragAndDropService.addDropTarget(this.rowDragFeature);
    };
    GridPanel.prototype.getRowDragFeature = function () {
        return this.rowDragFeature;
    };
    GridPanel.prototype.addStopEditingWhenGridLosesFocus = function () {
        var _this = this;
        if (!this.gridOptionsWrapper.isStopEditingWhenGridLosesFocus()) {
            return;
        }
        var viewports = [this.eBodyViewport, this.eBottom, this.eTop];
        var focusOutListener = function (event) {
            // this is the element the focus is moving to
            var elementWithFocus = event.relatedTarget;
            if (_.getTabIndex(elementWithFocus) === null) {
                _this.rowRenderer.stopEditing();
                return;
            }
            var clickInsideGrid = viewports.some(function (viewport) { return viewport.contains(elementWithFocus); });
            if (!clickInsideGrid) {
                var popupService = _this.beans.popupService;
                clickInsideGrid =
                    popupService.getActivePopups().some(function (popup) { return popup.contains(elementWithFocus); }) ||
                        popupService.isElementWithinCustomPopup(elementWithFocus);
            }
            if (!clickInsideGrid) {
                _this.rowRenderer.stopEditing();
            }
        };
        viewports.forEach(function (viewport) { return _this.addManagedListener(viewport, 'focusout', focusOutListener); });
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
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, listener);
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
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.setHeaderAndFloatingHeights.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_ROW_DATA_CHANGED, this.onRowDataChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_ROW_DATA_UPDATED, this.onRowDataChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_HEADER_HEIGHT, this.setHeaderAndFloatingHeights.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, this.setHeaderAndFloatingHeights.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, this.setHeaderAndFloatingHeights.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, this.setHeaderAndFloatingHeights.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, this.setHeaderAndFloatingHeights.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.onDomLayoutChanged.bind(this));
    };
    GridPanel.prototype.addDragListeners = function () {
        var _this = this;
        if (!this.gridOptionsWrapper.isEnableRangeSelection() || // no range selection if no property
            _.missing(this.rangeController) // no range selection if not enterprise version
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
                return _this.addManagedListener(container, eventName, listener);
            });
        });
    };
    GridPanel.prototype.addKeyboardEvents = function () {
        var _this = this;
        var eventNames = ['keydown', 'keypress'];
        eventNames.forEach(function (eventName) {
            var listener = _this.processKeyboardEvent.bind(_this, eventName);
            _this.eAllCellContainers.forEach(function (container) {
                _this.addManagedListener(container, eventName, listener);
            });
        });
    };
    GridPanel.prototype.addBodyViewportListener = function () {
        var _this = this;
        // we want to listen for clicks directly on the eBodyViewport, so the user has a way of showing
        // the context menu if no rows or columns are displayed, or user simply clicks outside of a cell
        var listener = function (mouseEvent) {
            var target = _.getTarget(mouseEvent);
            if (target === _this.eBodyViewport || target === _this.eCenterViewport) {
                // show it
                _this.onContextMenu(mouseEvent, null, null, null, null);
                _this.preventDefaultOnContextMenu(mouseEvent);
            }
        };
        this.addManagedListener(this.eBodyViewport, 'contextmenu', listener);
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
        var sourceElement = _.getTarget(event);
        while (sourceElement) {
            var renderedRow = this.gridOptionsWrapper.getDomData(sourceElement, RowComp.DOM_DATA_KEY_RENDERED_ROW);
            if (renderedRow) {
                return renderedRow;
            }
            sourceElement = sourceElement.parentElement;
        }
        return null;
    };
    GridPanel.prototype.processKeyboardEvent = function (eventName, keyboardEvent) {
        var cellComp = _.getCellCompForEvent(this.gridOptionsWrapper, keyboardEvent);
        if (!cellComp || keyboardEvent.defaultPrevented) {
            return;
        }
        var rowNode = cellComp.getRenderedRow().getRowNode();
        var column = cellComp.getColumn();
        var editing = cellComp.isEditing();
        var gridProcessingAllowed = !_.isUserSuppressingKeyboardEvent(this.gridOptionsWrapper, keyboardEvent, rowNode, column, editing);
        if (gridProcessingAllowed) {
            switch (eventName) {
                case 'keydown':
                    // first see if it's a scroll key, page up / down, home / end etc
                    var wasScrollKey = !editing && this.navigationService.handlePageScrollingKey(keyboardEvent);
                    // if not a scroll key, then we pass onto cell
                    if (!wasScrollKey) {
                        cellComp.onKeyDown(keyboardEvent);
                    }
                    // perform clipboard and undo / redo operations
                    this.doGridOperations(keyboardEvent, cellComp);
                    break;
                case 'keypress':
                    cellComp.onKeyPress(keyboardEvent);
                    break;
            }
        }
        if (eventName === 'keydown') {
            var cellKeyDownEvent = cellComp.createEvent(keyboardEvent, Events.EVENT_CELL_KEY_DOWN);
            this.beans.eventService.dispatchEvent(cellKeyDownEvent);
        }
        if (eventName === 'keypress') {
            var cellKeyPressEvent = cellComp.createEvent(keyboardEvent, Events.EVENT_CELL_KEY_PRESS);
            this.beans.eventService.dispatchEvent(cellKeyPressEvent);
        }
    };
    GridPanel.prototype.doGridOperations = function (keyboardEvent, cellComp) {
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
            case Constants.KEY_A:
                return this.onCtrlAndA(keyboardEvent);
            case Constants.KEY_C:
                return this.onCtrlAndC(keyboardEvent);
            case Constants.KEY_V:
                return this.onCtrlAndV();
            case Constants.KEY_D:
                return this.onCtrlAndD(keyboardEvent);
            case Constants.KEY_Z:
                return keyboardEvent.shiftKey ? this.undoRedoService.redo() : this.undoRedoService.undo();
            case Constants.KEY_Y:
                return this.undoRedoService.redo();
        }
    };
    // gets called by rowRenderer when new data loaded, as it will want to scroll to the top
    GridPanel.prototype.scrollToTop = function () {
        this.eBodyViewport.scrollTop = 0;
    };
    GridPanel.prototype.processMouseEvent = function (eventName, mouseEvent) {
        if (!this.mouseEventService.isEventFromThisGrid(mouseEvent) ||
            _.isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }
        var rowComp = this.getRowForEvent(mouseEvent);
        var cellComp = this.mouseEventService.getRenderedCellForEvent(mouseEvent);
        if (eventName === "contextmenu") {
            this.preventDefaultOnContextMenu(mouseEvent);
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
    };
    GridPanel.prototype.mockContextMenuForIPad = function () {
        var _this = this;
        // we do NOT want this when not in iPad, otherwise we will be doing
        if (!_.isIOSUserAgent()) {
            return;
        }
        this.eAllCellContainers.forEach(function (container) {
            var touchListener = new TouchListener(container);
            var longTapListener = function (event) {
                var rowComp = _this.getRowForEvent(event.touchEvent);
                var cellComp = _this.mouseEventService.getRenderedCellForEvent(event.touchEvent);
                _this.handleContextMenuMouseEvent(null, event.touchEvent, rowComp, cellComp);
            };
            _this.addManagedListener(touchListener, TouchListener.EVENT_LONG_TAP, longTapListener);
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
            if (this.contextMenuFactory.showMenu(rowNode, column, value, eventOrTouch)) {
                var event_2 = mouseEvent ? mouseEvent : touchEvent;
                event_2.preventDefault();
            }
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
        var _a = this, beans = _a.beans, pinnedRowModel = _a.pinnedRowModel, paginationProxy = _a.paginationProxy, rangeController = _a.rangeController;
        var PINNED_BOTTOM = Constants.PINNED_BOTTOM, PINNED_TOP = Constants.PINNED_TOP;
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
            var allDisplayedColumns = beans.columnController.getAllDisplayedColumns();
            if (_.missingOrEmpty(allDisplayedColumns)) {
                return;
            }
            rangeController.setCellRange({
                rowStartIndex: 0,
                rowStartPinned: floatingStart,
                rowEndIndex: rowEnd,
                rowEndPinned: floatingEnd,
                columnStart: allDisplayedColumns[0],
                columnEnd: _.last(allDisplayedColumns)
            });
        }
        event.preventDefault();
    };
    GridPanel.prototype.onCtrlAndC = function (event) {
        if (!this.clipboardService || this.gridOptionsWrapper.isEnableCellTextSelection()) {
            return;
        }
        this.clipboardService.copyToClipboard();
        event.preventDefault();
    };
    GridPanel.prototype.onCtrlAndV = function () {
        if (ModuleRegistry.isRegistered(ModuleNames.ClipboardModule) && !this.gridOptionsWrapper.isSuppressClipboardPaste()) {
            this.clipboardService.pasteFromClipboard();
        }
    };
    GridPanel.prototype.onCtrlAndD = function (event) {
        if (ModuleRegistry.isRegistered(ModuleNames.ClipboardModule) && !this.gridOptionsWrapper.isSuppressClipboardPaste()) {
            this.clipboardService.copyRangeDown();
        }
        event.preventDefault();
    };
    // Valid values for position are bottom, middle and top
    // position should be {'top','middle','bottom', or undefined/null}.
    // if undefined/null, then the grid will to the minimal amount of scrolling,
    // eg if grid needs to scroll up, it scrolls until row is on top,
    //    if grid needs to scroll down, it scrolls until row is on bottom,
    //    if row is already in view, grid does not scroll
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
        _.addOrRemoveCssClass(this.eBodyViewport, 'ag-force-vertical-scroll', isAlwaysShowVerticalScroll);
        return isAlwaysShowVerticalScroll || _.isVerticalScrollShowing(this.eBodyViewport);
    };
    GridPanel.prototype.isHorizontalScrollShowing = function () {
        return _.isHorizontalScrollShowing(this.eCenterViewport);
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
        // this is to cater for AG-3274, where grid is removed from the dom and then inserted back in again.
        // (which happens with some implementations of tabbing). this can result in horizontal scroll getting
        // reset back to the left, however no scroll event is fired. so we need to get header to also scroll
        // back to the left to be kept in sync.
        // adding and removing the grid from the DOM both resets the scroll position and
        // triggers a resize event, so notify listeners if the scroll position has changed
        if (this.scrollLeft !== this.getCenterViewportScrollLeft()) {
            this.onBodyHorizontalScroll(this.eCenterViewport);
        }
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
        var addIEPadding = _.isBrowserIE() && visible;
        this.eCenterViewport.style.height = "calc(100% + " + scrollSize + "px)";
        _.setFixedHeight(this.eHorizontalScrollBody, scrollContainerSize);
        // we have to add an extra pixel to the scroller viewport on IE because
        // if the container has the same size as the scrollbar, the scroll button won't work
        _.setFixedHeight(this.eBodyHorizontalScrollViewport, scrollContainerSize + (addIEPadding ? 1 : 0));
        _.setFixedHeight(this.eBodyHorizontalScrollContainer, scrollContainerSize);
    };
    GridPanel.prototype.setVerticalScrollPaddingVisible = function (show) {
        var scroller = show ? 'scroll' : 'hidden';
        this.eTop.style.overflowY = this.eBottom.style.overflowY = scroller;
        this.setFakeHScrollSpacerWidths();
    };
    GridPanel.prototype.updateRowCount = function () {
        var headerCount = this.headerNavigationService.getHeaderRowCount();
        var rowCount = this.paginationProxy.getRowCount();
        var total = (headerCount + rowCount).toString();
        this.getGui().setAttribute('aria-rowcount', total);
    };
    GridPanel.prototype.updateColumnCount = function () {
        var columns = this.columnController.getAllDisplayedColumns();
        this.getGui().setAttribute('aria-colcount', columns.length.toString());
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
            body: new RowContainerComponent({
                eContainer: this.eCenterContainer,
                eWrapper: this.eCenterColsClipper,
                eViewport: this.eBodyViewport
            }),
            fullWidth: new RowContainerComponent({
                eContainer: this.eFullWidthContainer
            }),
            pinnedLeft: new RowContainerComponent({ eContainer: this.eLeftContainer }),
            pinnedRight: new RowContainerComponent({ eContainer: this.eRightContainer }),
            floatingTop: new RowContainerComponent({ eContainer: this.eTopContainer }),
            floatingTopPinnedLeft: new RowContainerComponent({ eContainer: this.eLeftTop }),
            floatingTopPinnedRight: new RowContainerComponent({ eContainer: this.eRightTop }),
            floatingTopFullWidth: new RowContainerComponent({
                eContainer: this.eTopFullWidthContainer,
                hideWhenNoChildren: true
            }),
            floatingBottom: new RowContainerComponent({ eContainer: this.eBottomContainer }),
            floatingBottomPinnedLeft: new RowContainerComponent({ eContainer: this.eLeftBottom }),
            floatingBottomPinnedRight: new RowContainerComponent({ eContainer: this.eRightBottom }),
            floatingBottomFullWidth: new RowContainerComponent({
                eContainer: this.eBottomFullWidthContainer,
                hideWhenNoChildren: true
            }),
        };
        _.iterateObject(this.rowContainerComponents, function (key, container) {
            if (container) {
                _this.getContext().createBean(container);
            }
        });
    };
    GridPanel.prototype.setupRowAnimationCssClass = function () {
        var _this = this;
        var listener = function () {
            // we don't want to use row animation if scaling, as rows jump strangely as you scroll,
            // when scaling and doing row animation.
            var animateRows = _this.gridOptionsWrapper.isAnimateRows() && !_this.heightScaler.isScaling();
            _.addOrRemoveCssClass(_this.eBodyViewport, 'ag-row-animation', animateRows);
            _.addOrRemoveCssClass(_this.eBodyViewport, 'ag-row-no-animation', !animateRows);
        };
        listener();
        this.addManagedListener(this.eventService, Events.EVENT_HEIGHT_SCALE_CHANGED, listener);
    };
    // when editing a pinned row, if the cell is half outside the scrollable area, the browser can
    // scroll the column into view. we do not want this, the pinned sections should never scroll.
    // so we listen to scrolls on these containers and reset the scroll if we find one.
    GridPanel.prototype.suppressScrollOnFloatingRow = function () {
        var _this = this;
        var resetTopScroll = function () { return _this.eTopViewport.scrollLeft = 0; };
        var resetBottomScroll = function () { return _this.eTopViewport.scrollLeft = 0; };
        this.addManagedListener(this.eTopViewport, 'scroll', resetTopScroll);
        this.addManagedListener(this.eBottomViewport, 'scroll', resetBottomScroll);
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
        this.updateColumnCount();
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
        var _a = this, headerRootComp = _a.headerRootComp, columnController = _a.columnController;
        var width = columnController.getBodyContainerWidth();
        if (this.printLayout) {
            var pinnedContainerWidths = columnController.getPinnedLeftContainerWidth()
                + columnController.getPinnedRightContainerWidth();
            width += pinnedContainerWidths;
        }
        headerRootComp.setHeaderContainerWidth(width);
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
        containers.forEach(function (e) { return _.setDisplayed(e, _this.pinningLeft); });
        if (newPinning) {
            containers.forEach(function (ct) { return _.setFixedWidth(ct, widthOfCols); });
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
        containers.forEach(function (ct) { return _.setDisplayed(ct, newPinning); });
        if (newPinning) {
            containers.forEach(function (ct) { return _.setFixedWidth(ct, widthOfCols); });
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
        _.setFixedWidth(this.eHorizontalRightSpacer, rightSpacing);
        _.addOrRemoveCssClass(this.eHorizontalRightSpacer, 'ag-scroller-corner', rightSpacing <= this.scrollWidth);
        // we pad the left based on a) if cols are pinned to the left and
        // b) if v scroll is showing on the left (happens in LTR layout only)
        var leftSpacing = this.columnController.getPinnedLeftContainerWidth();
        var scrollOnLeft = this.enableRtl && this.isVerticalScrollShowing();
        if (scrollOnLeft) {
            leftSpacing += this.scrollWidth;
        }
        _.setFixedWidth(this.eHorizontalLeftSpacer, leftSpacing);
        _.addOrRemoveCssClass(this.eHorizontalLeftSpacer, 'ag-scroller-corner', leftSpacing <= this.scrollWidth);
    };
    GridPanel.prototype.checkBodyHeight = function () {
        var bodyHeight = this.eBodyViewport.clientHeight;
        if (this.bodyHeight !== bodyHeight) {
            this.bodyHeight = bodyHeight;
            var event_3 = {
                type: Events.EVENT_BODY_HEIGHT_CHANGED,
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
        if (columnController.isPivotMode()) {
            groupHeight = gridOptionsWrapper.getPivotGroupHeaderHeight();
            headerHeight = gridOptionsWrapper.getPivotHeaderHeight();
        }
        else {
            var hasFloatingFilters = columnController.hasFloatingFilters();
            if (hasFloatingFilters) {
                headerRowCount++;
                numberOfFloating = 1;
            }
            groupHeight = gridOptionsWrapper.getGroupHeaderHeight();
            headerHeight = gridOptionsWrapper.getHeaderHeight();
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
        this.addManagedListener(this.eCenterViewport, 'scroll', this.onCenterViewportScroll.bind(this));
        this.addManagedListener(this.eBodyHorizontalScrollViewport, 'scroll', this.onFakeHorizontalScroll.bind(this));
        this.addManagedListener(this.eBodyViewport, 'scroll', this.onVerticalScroll.bind(this));
    };
    GridPanel.prototype.onVerticalScroll = function () {
        var scrollTop = this.eBodyViewport.scrollTop;
        this.animationFrameService.setScrollTop(scrollTop);
        this.scrollTop = scrollTop;
        this.redrawRowsAfterScroll();
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
        var scrollLeft = Math.floor(_.getScrollLeft(eSource, this.enableRtl));
        // touch devices allow elastic scroll - which temporally scrolls the panel outside of the viewport
        // (eg user uses touch to go to the left of the grid, but drags past the left, the rows will actually
        // scroll past the left until the user releases the mouse). when this happens, we want ignore the scroll,
        // as otherwise it was causing the rows and header to flicker.
        // sometimes when scrolling, we got values that extended the maximum scroll allowed. we used to
        // ignore these scrolls. problem is the max scroll position could be skipped (eg the previous scroll event
        // could be 10px before the max position, and then current scroll event could be 20px after the max position).
        // if we just ignored the last event, we would be setting the scroll to 10px before the max position, when in
        // actual fact the user has exceeded the max scroll and thus scroll should be set to the max.
        var minScroll = 0;
        var maxScroll = scrollWidth - clientWidth;
        if (scrollLeft < minScroll) {
            scrollLeft = minScroll;
        }
        else if (scrollLeft > maxScroll) {
            scrollLeft = maxScroll;
        }
        this.doHorizontalScroll(scrollLeft);
        this.resetLastHorizontalScrollElementDebounced();
    };
    GridPanel.prototype.resetLastHorizontalScrollElement = function () {
        this.lastHorizontalScrollElement = null;
    };
    GridPanel.prototype.doHorizontalScroll = function (scrollLeft) {
        this.scrollLeft = scrollLeft;
        var event = {
            type: Events.EVENT_BODY_SCROLL,
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
            type: Events.EVENT_BODY_SCROLL,
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
        return _.getScrollLeft(this.eCenterViewport, this.enableRtl);
    };
    GridPanel.prototype.setCenterViewportScrollLeft = function (value) {
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        _.setScrollLeft(this.eCenterViewport, value, this.enableRtl);
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
        _.setScrollLeft(partner, scrollLeft, this.enableRtl);
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
        Autowired('alignedGridsService')
    ], GridPanel.prototype, "alignedGridsService", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], GridPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('rowRenderer')
    ], GridPanel.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired('pinnedRowModel')
    ], GridPanel.prototype, "pinnedRowModel", void 0);
    __decorate([
        Autowired('animationFrameService')
    ], GridPanel.prototype, "animationFrameService", void 0);
    __decorate([
        Autowired('navigationService')
    ], GridPanel.prototype, "navigationService", void 0);
    __decorate([
        Autowired('autoHeightCalculator')
    ], GridPanel.prototype, "autoHeightCalculator", void 0);
    __decorate([
        Autowired('columnAnimationService')
    ], GridPanel.prototype, "columnAnimationService", void 0);
    __decorate([
        Autowired('autoWidthCalculator')
    ], GridPanel.prototype, "autoWidthCalculator", void 0);
    __decorate([
        Autowired('paginationAutoPageSizeService')
    ], GridPanel.prototype, "paginationAutoPageSizeService", void 0);
    __decorate([
        Autowired('beans')
    ], GridPanel.prototype, "beans", void 0);
    __decorate([
        Autowired('paginationProxy')
    ], GridPanel.prototype, "paginationProxy", void 0);
    __decorate([
        Autowired('columnApi')
    ], GridPanel.prototype, "columnApi", void 0);
    __decorate([
        Autowired('gridApi')
    ], GridPanel.prototype, "gridApi", void 0);
    __decorate([
        Autowired('dragService')
    ], GridPanel.prototype, "dragService", void 0);
    __decorate([
        Autowired('mouseEventService')
    ], GridPanel.prototype, "mouseEventService", void 0);
    __decorate([
        Autowired('$scope')
    ], GridPanel.prototype, "$scope", void 0);
    __decorate([
        Autowired('scrollVisibleService')
    ], GridPanel.prototype, "scrollVisibleService", void 0);
    __decorate([
        Autowired('valueService')
    ], GridPanel.prototype, "valueService", void 0);
    __decorate([
        Autowired('dragAndDropService')
    ], GridPanel.prototype, "dragAndDropService", void 0);
    __decorate([
        Autowired('maxDivHeightScaler')
    ], GridPanel.prototype, "heightScaler", void 0);
    __decorate([
        Autowired('resizeObserverService')
    ], GridPanel.prototype, "resizeObserverService", void 0);
    __decorate([
        Autowired('undoRedoService')
    ], GridPanel.prototype, "undoRedoService", void 0);
    __decorate([
        Autowired('columnController')
    ], GridPanel.prototype, "columnController", void 0);
    __decorate([
        Autowired('headerNavigationService')
    ], GridPanel.prototype, "headerNavigationService", void 0);
    __decorate([
        Optional('rangeController')
    ], GridPanel.prototype, "rangeController", void 0);
    __decorate([
        Optional('contextMenuFactory')
    ], GridPanel.prototype, "contextMenuFactory", void 0);
    __decorate([
        Optional('clipboardService')
    ], GridPanel.prototype, "clipboardService", void 0);
    __decorate([
        RefSelector('eBodyViewport')
    ], GridPanel.prototype, "eBodyViewport", void 0);
    __decorate([
        RefSelector('eCenterContainer')
    ], GridPanel.prototype, "eCenterContainer", void 0);
    __decorate([
        RefSelector('eCenterViewport')
    ], GridPanel.prototype, "eCenterViewport", void 0);
    __decorate([
        RefSelector('eLeftContainer')
    ], GridPanel.prototype, "eLeftContainer", void 0);
    __decorate([
        RefSelector('eRightContainer')
    ], GridPanel.prototype, "eRightContainer", void 0);
    __decorate([
        RefSelector('eCenterColsClipper')
    ], GridPanel.prototype, "eCenterColsClipper", void 0);
    __decorate([
        RefSelector('eHorizontalScrollBody')
    ], GridPanel.prototype, "eHorizontalScrollBody", void 0);
    __decorate([
        RefSelector('eHorizontalLeftSpacer')
    ], GridPanel.prototype, "eHorizontalLeftSpacer", void 0);
    __decorate([
        RefSelector('eHorizontalRightSpacer')
    ], GridPanel.prototype, "eHorizontalRightSpacer", void 0);
    __decorate([
        RefSelector('eBodyHorizontalScrollViewport')
    ], GridPanel.prototype, "eBodyHorizontalScrollViewport", void 0);
    __decorate([
        RefSelector('eBodyHorizontalScrollContainer')
    ], GridPanel.prototype, "eBodyHorizontalScrollContainer", void 0);
    __decorate([
        RefSelector('eFullWidthContainer')
    ], GridPanel.prototype, "eFullWidthContainer", void 0);
    __decorate([
        RefSelector('eTop')
    ], GridPanel.prototype, "eTop", void 0);
    __decorate([
        RefSelector('eLeftTop')
    ], GridPanel.prototype, "eLeftTop", void 0);
    __decorate([
        RefSelector('eRightTop')
    ], GridPanel.prototype, "eRightTop", void 0);
    __decorate([
        RefSelector('eTopContainer')
    ], GridPanel.prototype, "eTopContainer", void 0);
    __decorate([
        RefSelector('eTopViewport')
    ], GridPanel.prototype, "eTopViewport", void 0);
    __decorate([
        RefSelector('eTopFullWidthContainer')
    ], GridPanel.prototype, "eTopFullWidthContainer", void 0);
    __decorate([
        RefSelector('eBottom')
    ], GridPanel.prototype, "eBottom", void 0);
    __decorate([
        RefSelector('eLeftBottom')
    ], GridPanel.prototype, "eLeftBottom", void 0);
    __decorate([
        RefSelector('eRightBottom')
    ], GridPanel.prototype, "eRightBottom", void 0);
    __decorate([
        RefSelector('eBottomContainer')
    ], GridPanel.prototype, "eBottomContainer", void 0);
    __decorate([
        RefSelector('eBottomViewport')
    ], GridPanel.prototype, "eBottomViewport", void 0);
    __decorate([
        RefSelector('eBottomFullWidthContainer')
    ], GridPanel.prototype, "eBottomFullWidthContainer", void 0);
    __decorate([
        RefSelector('headerRoot')
    ], GridPanel.prototype, "headerRootComp", void 0);
    __decorate([
        RefSelector('overlayWrapper')
    ], GridPanel.prototype, "overlayWrapper", void 0);
    __decorate([
        PostConstruct
    ], GridPanel.prototype, "init", null);
    return GridPanel;
}(Component));
export { GridPanel };
