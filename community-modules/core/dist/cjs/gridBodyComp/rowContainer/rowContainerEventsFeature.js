/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.0.0
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
var beanStub_1 = require("../../context/beanStub");
var event_1 = require("../../utils/event");
var context_1 = require("../../context/context");
var rowCtrl_1 = require("../../rendering/row/rowCtrl");
var browser_1 = require("../../utils/browser");
var touchListener_1 = require("../../widgets/touchListener");
var keyboard_1 = require("../../utils/keyboard");
var events_1 = require("../../events");
var keyCode_1 = require("../../constants/keyCode");
var constants_1 = require("../../constants/constants");
var generic_1 = require("../../utils/generic");
var array_1 = require("../../utils/array");
var moduleRegistry_1 = require("../../modules/moduleRegistry");
var moduleNames_1 = require("../../modules/moduleNames");
var cellCtrl_1 = require("../../rendering/cell/cellCtrl");
var RowContainerEventsFeature = /** @class */ (function (_super) {
    __extends(RowContainerEventsFeature, _super);
    function RowContainerEventsFeature(element) {
        var _this = _super.call(this) || this;
        _this.element = element;
        return _this;
    }
    RowContainerEventsFeature.prototype.postConstruct = function () {
        this.addMouseListeners();
        this.mockContextMenuForIPad();
        this.addKeyboardEvents();
    };
    RowContainerEventsFeature.prototype.addKeyboardEvents = function () {
        var _this = this;
        var eventNames = ['keydown', 'keypress'];
        eventNames.forEach(function (eventName) {
            var listener = _this.processKeyboardEvent.bind(_this, eventName);
            _this.addManagedListener(_this.element, eventName, listener);
        });
    };
    RowContainerEventsFeature.prototype.addMouseListeners = function () {
        var _this = this;
        var mouseDownEvent = event_1.isEventSupported('touchstart') ? 'touchstart' : 'mousedown';
        var eventNames = ['dblclick', 'contextmenu', 'mouseover', 'mouseout', 'click', mouseDownEvent];
        eventNames.forEach(function (eventName) {
            var listener = _this.processMouseEvent.bind(_this, eventName);
            _this.addManagedListener(_this.element, eventName, listener);
        });
    };
    RowContainerEventsFeature.prototype.processMouseEvent = function (eventName, mouseEvent) {
        if (!this.mouseEventService.isEventFromThisGrid(mouseEvent) ||
            event_1.isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }
        var rowComp = this.getRowForEvent(mouseEvent);
        var cellCtrl = this.mouseEventService.getRenderedCellForEvent(mouseEvent);
        if (eventName === "contextmenu") {
            this.handleContextMenuMouseEvent(mouseEvent, null, rowComp, cellCtrl);
        }
        else {
            if (cellCtrl) {
                cellCtrl.onMouseEvent(eventName, mouseEvent);
            }
            if (rowComp) {
                rowComp.onMouseEvent(eventName, mouseEvent);
            }
        }
    };
    RowContainerEventsFeature.prototype.mockContextMenuForIPad = function () {
        var _this = this;
        // we do NOT want this when not in iPad, otherwise we will be doing
        if (!browser_1.isIOSUserAgent()) {
            return;
        }
        var touchListener = new touchListener_1.TouchListener(this.element);
        var longTapListener = function (event) {
            var rowComp = _this.getRowForEvent(event.touchEvent);
            var cellComp = _this.mouseEventService.getRenderedCellForEvent(event.touchEvent);
            _this.handleContextMenuMouseEvent(null, event.touchEvent, rowComp, cellComp);
        };
        this.addManagedListener(touchListener, touchListener_1.TouchListener.EVENT_LONG_TAP, longTapListener);
        this.addDestroyFunc(function () { return touchListener.destroy(); });
    };
    RowContainerEventsFeature.prototype.getRowForEvent = function (event) {
        var sourceElement = event_1.getTarget(event);
        while (sourceElement) {
            var rowCon = this.gridOptionsWrapper.getDomData(sourceElement, rowCtrl_1.RowCtrl.DOM_DATA_KEY_RENDERED_ROW);
            if (rowCon) {
                return rowCon;
            }
            sourceElement = sourceElement.parentElement;
        }
        return null;
    };
    RowContainerEventsFeature.prototype.handleContextMenuMouseEvent = function (mouseEvent, touchEvent, rowComp, cellCtrl) {
        var rowNode = rowComp ? rowComp.getRowNode() : null;
        var column = cellCtrl ? cellCtrl.getColumn() : null;
        var value = null;
        if (column) {
            var event_2 = mouseEvent ? mouseEvent : touchEvent;
            cellCtrl.dispatchCellContextMenuEvent(event_2);
            value = this.valueService.getValue(column, rowNode);
        }
        // if user clicked on a cell, anchor to that cell, otherwise anchor to the grid panel
        var gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        var anchorToElement = cellCtrl ? cellCtrl.getGui() : gridBodyCon.getGridBodyElement();
        if (this.contextMenuFactory) {
            this.contextMenuFactory.onContextMenu(mouseEvent, touchEvent, rowNode, column, value, anchorToElement);
        }
    };
    RowContainerEventsFeature.prototype.processKeyboardEvent = function (eventName, keyboardEvent) {
        var cellComp = event_1.getCtrlForEvent(this.gridOptionsWrapper, keyboardEvent, cellCtrl_1.CellCtrl.DOM_DATA_KEY_CELL_CTRL);
        var rowComp = event_1.getCtrlForEvent(this.gridOptionsWrapper, keyboardEvent, rowCtrl_1.RowCtrl.DOM_DATA_KEY_RENDERED_ROW);
        if (keyboardEvent.defaultPrevented) {
            return;
        }
        if (cellComp) {
            this.processCellKeyboardEvent(cellComp, eventName, keyboardEvent);
        }
        else if (rowComp && rowComp.isFullWidth()) {
            this.processFullWidthRowKeyboardEvent(rowComp, eventName, keyboardEvent);
        }
    };
    RowContainerEventsFeature.prototype.processCellKeyboardEvent = function (cellCtrl, eventName, keyboardEvent) {
        var rowNode = cellCtrl.getRowNode();
        var column = cellCtrl.getColumn();
        var editing = cellCtrl.isEditing();
        var gridProcessingAllowed = !keyboard_1.isUserSuppressingKeyboardEvent(this.gridOptionsWrapper, keyboardEvent, rowNode, column, editing);
        if (gridProcessingAllowed) {
            switch (eventName) {
                case 'keydown':
                    // first see if it's a scroll key, page up / down, home / end etc
                    var wasScrollKey = !editing && this.navigationService.handlePageScrollingKey(keyboardEvent);
                    // if not a scroll key, then we pass onto cell
                    if (!wasScrollKey) {
                        cellCtrl.onKeyDown(keyboardEvent);
                    }
                    // perform clipboard and undo / redo operations
                    this.doGridOperations(keyboardEvent, cellCtrl.isEditing());
                    break;
                case 'keypress':
                    cellCtrl.onKeyPress(keyboardEvent);
                    break;
            }
        }
        if (eventName === 'keydown') {
            var cellKeyDownEvent = cellCtrl.createEvent(keyboardEvent, events_1.Events.EVENT_CELL_KEY_DOWN);
            this.eventService.dispatchEvent(cellKeyDownEvent);
        }
        if (eventName === 'keypress') {
            var cellKeyPressEvent = cellCtrl.createEvent(keyboardEvent, events_1.Events.EVENT_CELL_KEY_PRESS);
            this.eventService.dispatchEvent(cellKeyPressEvent);
        }
    };
    RowContainerEventsFeature.prototype.processFullWidthRowKeyboardEvent = function (rowComp, eventName, keyboardEvent) {
        var rowNode = rowComp.getRowNode();
        var focusedCell = this.focusService.getFocusedCell();
        var column = (focusedCell && focusedCell.column);
        var gridProcessingAllowed = !keyboard_1.isUserSuppressingKeyboardEvent(this.gridOptionsWrapper, keyboardEvent, rowNode, column, false);
        if (gridProcessingAllowed) {
            var key = keyboardEvent.keyCode;
            if (eventName === 'keydown') {
                switch (key) {
                    case keyCode_1.KeyCode.UP:
                    case keyCode_1.KeyCode.DOWN:
                        rowComp.onKeyboardNavigate(keyboardEvent);
                        break;
                    case keyCode_1.KeyCode.TAB:
                        rowComp.onTabKeyDown(keyboardEvent);
                    default:
                }
            }
        }
        if (eventName === 'keydown') {
            var cellKeyDownEvent = rowComp.createRowEvent(events_1.Events.EVENT_CELL_KEY_DOWN, keyboardEvent);
            this.eventService.dispatchEvent(cellKeyDownEvent);
        }
        if (eventName === 'keypress') {
            var cellKeyPressEvent = rowComp.createRowEvent(events_1.Events.EVENT_CELL_KEY_PRESS, keyboardEvent);
            this.eventService.dispatchEvent(cellKeyPressEvent);
        }
    };
    RowContainerEventsFeature.prototype.doGridOperations = function (keyboardEvent, editing) {
        // check if ctrl or meta key pressed
        if (!keyboardEvent.ctrlKey && !keyboardEvent.metaKey) {
            return;
        }
        // if the cell the event came from is editing, then we do not
        // want to do the default shortcut keys, otherwise the editor
        // (eg a text field) would not be able to do the normal cut/copy/paste
        if (editing) {
            return;
        }
        // for copy / paste, we don't want to execute when the event
        // was from a child grid (happens in master detail)
        if (!this.mouseEventService.isEventFromThisGrid(keyboardEvent)) {
            return;
        }
        switch (keyboardEvent.which) {
            case keyCode_1.KeyCode.A:
                return this.onCtrlAndA(keyboardEvent);
            case keyCode_1.KeyCode.C:
                return this.onCtrlAndC(keyboardEvent);
            case keyCode_1.KeyCode.V:
                return this.onCtrlAndV();
            case keyCode_1.KeyCode.D:
                return this.onCtrlAndD(keyboardEvent);
            case keyCode_1.KeyCode.Z:
                return keyboardEvent.shiftKey ? this.undoRedoService.redo() : this.undoRedoService.undo();
            case keyCode_1.KeyCode.Y:
                return this.undoRedoService.redo();
        }
    };
    RowContainerEventsFeature.prototype.onCtrlAndA = function (event) {
        var _a = this, pinnedRowModel = _a.pinnedRowModel, paginationProxy = _a.paginationProxy, rangeService = _a.rangeService;
        var PINNED_BOTTOM = constants_1.Constants.PINNED_BOTTOM, PINNED_TOP = constants_1.Constants.PINNED_TOP;
        if (rangeService && paginationProxy.isRowsToRender()) {
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
            var allDisplayedColumns = this.columnModel.getAllDisplayedColumns();
            if (generic_1.missingOrEmpty(allDisplayedColumns)) {
                return;
            }
            rangeService.setCellRange({
                rowStartIndex: 0,
                rowStartPinned: floatingStart,
                rowEndIndex: rowEnd,
                rowEndPinned: floatingEnd,
                columnStart: allDisplayedColumns[0],
                columnEnd: array_1.last(allDisplayedColumns)
            });
        }
        event.preventDefault();
    };
    RowContainerEventsFeature.prototype.onCtrlAndC = function (event) {
        if (!this.clipboardService || this.gridOptionsWrapper.isEnableCellTextSelection()) {
            return;
        }
        this.clipboardService.copyToClipboard();
        event.preventDefault();
    };
    RowContainerEventsFeature.prototype.onCtrlAndV = function () {
        if (moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.ClipboardModule) && !this.gridOptionsWrapper.isSuppressClipboardPaste()) {
            this.clipboardService.pasteFromClipboard();
        }
    };
    RowContainerEventsFeature.prototype.onCtrlAndD = function (event) {
        if (moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.ClipboardModule) && !this.gridOptionsWrapper.isSuppressClipboardPaste()) {
            this.clipboardService.copyRangeDown();
        }
        event.preventDefault();
    };
    __decorate([
        context_1.Autowired('mouseEventService')
    ], RowContainerEventsFeature.prototype, "mouseEventService", void 0);
    __decorate([
        context_1.Autowired('valueService')
    ], RowContainerEventsFeature.prototype, "valueService", void 0);
    __decorate([
        context_1.Optional('contextMenuFactory')
    ], RowContainerEventsFeature.prototype, "contextMenuFactory", void 0);
    __decorate([
        context_1.Autowired('ctrlsService')
    ], RowContainerEventsFeature.prototype, "ctrlsService", void 0);
    __decorate([
        context_1.Autowired('navigationService')
    ], RowContainerEventsFeature.prototype, "navigationService", void 0);
    __decorate([
        context_1.Autowired('focusService')
    ], RowContainerEventsFeature.prototype, "focusService", void 0);
    __decorate([
        context_1.Autowired('undoRedoService')
    ], RowContainerEventsFeature.prototype, "undoRedoService", void 0);
    __decorate([
        context_1.Autowired('columnModel')
    ], RowContainerEventsFeature.prototype, "columnModel", void 0);
    __decorate([
        context_1.Autowired('paginationProxy')
    ], RowContainerEventsFeature.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.Autowired('pinnedRowModel')
    ], RowContainerEventsFeature.prototype, "pinnedRowModel", void 0);
    __decorate([
        context_1.Optional('rangeService')
    ], RowContainerEventsFeature.prototype, "rangeService", void 0);
    __decorate([
        context_1.Optional('clipboardService')
    ], RowContainerEventsFeature.prototype, "clipboardService", void 0);
    __decorate([
        context_1.PostConstruct
    ], RowContainerEventsFeature.prototype, "postConstruct", null);
    return RowContainerEventsFeature;
}(beanStub_1.BeanStub));
exports.RowContainerEventsFeature = RowContainerEventsFeature;

//# sourceMappingURL=rowContainerEventsFeature.js.map
