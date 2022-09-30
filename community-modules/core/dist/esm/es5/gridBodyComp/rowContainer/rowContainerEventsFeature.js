/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
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
import { BeanStub } from "../../context/beanStub";
import { getCtrlForEvent, isStopPropagationForAgGrid, isEventSupported } from "../../utils/event";
import { Autowired, Optional, PostConstruct } from "../../context/context";
import { RowCtrl } from "../../rendering/row/rowCtrl";
import { isIOSUserAgent } from "../../utils/browser";
import { TouchListener } from "../../widgets/touchListener";
import { isUserSuppressingKeyboardEvent } from "../../utils/keyboard";
import { Events } from "../../events";
import { KeyCode } from "../../constants/keyCode";
import { Constants } from "../../constants/constants";
import { missingOrEmpty } from "../../utils/generic";
import { last } from "../../utils/array";
import { normaliseQwertyAzerty } from "../../utils/keyboard";
import { ModuleRegistry } from "../../modules/moduleRegistry";
import { ModuleNames } from "../../modules/moduleNames";
import { CellCtrl } from "../../rendering/cell/cellCtrl";
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
        var mouseDownEvent = isEventSupported('touchstart') ? 'touchstart' : 'mousedown';
        var eventNames = ['dblclick', 'contextmenu', 'mouseover', 'mouseout', 'click', mouseDownEvent];
        eventNames.forEach(function (eventName) {
            var listener = _this.processMouseEvent.bind(_this, eventName);
            _this.addManagedListener(_this.element, eventName, listener);
        });
    };
    RowContainerEventsFeature.prototype.processMouseEvent = function (eventName, mouseEvent) {
        if (!this.mouseEventService.isEventFromThisGrid(mouseEvent) ||
            isStopPropagationForAgGrid(mouseEvent)) {
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
        if (!isIOSUserAgent()) {
            return;
        }
        var touchListener = new TouchListener(this.element);
        var longTapListener = function (event) {
            var rowComp = _this.getRowForEvent(event.touchEvent);
            var cellComp = _this.mouseEventService.getRenderedCellForEvent(event.touchEvent);
            _this.handleContextMenuMouseEvent(null, event.touchEvent, rowComp, cellComp);
        };
        this.addManagedListener(touchListener, TouchListener.EVENT_LONG_TAP, longTapListener);
        this.addDestroyFunc(function () { return touchListener.destroy(); });
    };
    RowContainerEventsFeature.prototype.getRowForEvent = function (event) {
        var sourceElement = event.target;
        while (sourceElement) {
            var rowCon = this.gridOptionsWrapper.getDomData(sourceElement, RowCtrl.DOM_DATA_KEY_ROW_CTRL);
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
            var event_1 = mouseEvent ? mouseEvent : touchEvent;
            cellCtrl.dispatchCellContextMenuEvent(event_1);
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
        var cellComp = getCtrlForEvent(this.gridOptionsWrapper, keyboardEvent, CellCtrl.DOM_DATA_KEY_CELL_CTRL);
        var rowComp = getCtrlForEvent(this.gridOptionsWrapper, keyboardEvent, RowCtrl.DOM_DATA_KEY_ROW_CTRL);
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
        var gridProcessingAllowed = !isUserSuppressingKeyboardEvent(this.gridOptionsWrapper, keyboardEvent, rowNode, column, editing);
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
            var cellKeyDownEvent = cellCtrl.createEvent(keyboardEvent, Events.EVENT_CELL_KEY_DOWN);
            this.eventService.dispatchEvent(cellKeyDownEvent);
        }
        if (eventName === 'keypress') {
            var cellKeyPressEvent = cellCtrl.createEvent(keyboardEvent, Events.EVENT_CELL_KEY_PRESS);
            this.eventService.dispatchEvent(cellKeyPressEvent);
        }
    };
    RowContainerEventsFeature.prototype.processFullWidthRowKeyboardEvent = function (rowComp, eventName, keyboardEvent) {
        var rowNode = rowComp.getRowNode();
        var focusedCell = this.focusService.getFocusedCell();
        var column = (focusedCell && focusedCell.column);
        var gridProcessingAllowed = !isUserSuppressingKeyboardEvent(this.gridOptionsWrapper, keyboardEvent, rowNode, column, false);
        if (gridProcessingAllowed) {
            var key = keyboardEvent.key;
            if (eventName === 'keydown') {
                switch (key) {
                    case KeyCode.UP:
                    case KeyCode.DOWN:
                        rowComp.onKeyboardNavigate(keyboardEvent);
                        break;
                    case KeyCode.TAB:
                        rowComp.onTabKeyDown(keyboardEvent);
                    default:
                }
            }
        }
        if (eventName === 'keydown') {
            var cellKeyDownEvent = rowComp.createRowEvent(Events.EVENT_CELL_KEY_DOWN, keyboardEvent);
            this.eventService.dispatchEvent(cellKeyDownEvent);
        }
        if (eventName === 'keypress') {
            var cellKeyPressEvent = rowComp.createRowEvent(Events.EVENT_CELL_KEY_PRESS, keyboardEvent);
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
        var keyCode = normaliseQwertyAzerty(keyboardEvent);
        if (keyCode === KeyCode.A) {
            return this.onCtrlAndA(keyboardEvent);
        }
        if (keyCode === KeyCode.C) {
            return this.onCtrlAndC(keyboardEvent);
        }
        if (keyCode === KeyCode.V) {
            return this.onCtrlAndV();
        }
        if (keyCode === KeyCode.D) {
            return this.onCtrlAndD(keyboardEvent);
        }
        if (keyCode === KeyCode.Z) {
            return this.onCtrlAndZ(keyboardEvent);
        }
        if (keyCode === KeyCode.Y) {
            return this.onCtrlAndY();
        }
    };
    RowContainerEventsFeature.prototype.onCtrlAndA = function (event) {
        var _a = this, pinnedRowModel = _a.pinnedRowModel, paginationProxy = _a.paginationProxy, rangeService = _a.rangeService;
        var PINNED_BOTTOM = Constants.PINNED_BOTTOM, PINNED_TOP = Constants.PINNED_TOP;
        if (rangeService && paginationProxy.isRowsToRender()) {
            var _b = __read([
                pinnedRowModel.isEmpty(PINNED_TOP),
                pinnedRowModel.isEmpty(PINNED_BOTTOM)
            ], 2), isEmptyPinnedTop = _b[0], isEmptyPinnedBottom = _b[1];
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
            if (missingOrEmpty(allDisplayedColumns)) {
                return;
            }
            rangeService.setCellRange({
                rowStartIndex: 0,
                rowStartPinned: floatingStart,
                rowEndIndex: rowEnd,
                rowEndPinned: floatingEnd,
                columnStart: allDisplayedColumns[0],
                columnEnd: last(allDisplayedColumns)
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
        if (ModuleRegistry.isRegistered(ModuleNames.ClipboardModule) && !this.gridOptionsWrapper.isSuppressClipboardPaste()) {
            this.clipboardService.pasteFromClipboard();
        }
    };
    RowContainerEventsFeature.prototype.onCtrlAndD = function (event) {
        if (ModuleRegistry.isRegistered(ModuleNames.ClipboardModule) && !this.gridOptionsWrapper.isSuppressClipboardPaste()) {
            this.clipboardService.copyRangeDown();
        }
        event.preventDefault();
    };
    RowContainerEventsFeature.prototype.onCtrlAndZ = function (event) {
        if (!this.gridOptionsWrapper.isUndoRedoCellEditing()) {
            return;
        }
        event.preventDefault();
        if (event.shiftKey) {
            this.undoRedoService.redo();
        }
        else {
            this.undoRedoService.undo();
        }
    };
    RowContainerEventsFeature.prototype.onCtrlAndY = function () {
        this.undoRedoService.redo();
    };
    __decorate([
        Autowired('mouseEventService')
    ], RowContainerEventsFeature.prototype, "mouseEventService", void 0);
    __decorate([
        Autowired('valueService')
    ], RowContainerEventsFeature.prototype, "valueService", void 0);
    __decorate([
        Optional('contextMenuFactory')
    ], RowContainerEventsFeature.prototype, "contextMenuFactory", void 0);
    __decorate([
        Autowired('ctrlsService')
    ], RowContainerEventsFeature.prototype, "ctrlsService", void 0);
    __decorate([
        Autowired('navigationService')
    ], RowContainerEventsFeature.prototype, "navigationService", void 0);
    __decorate([
        Autowired('focusService')
    ], RowContainerEventsFeature.prototype, "focusService", void 0);
    __decorate([
        Autowired('undoRedoService')
    ], RowContainerEventsFeature.prototype, "undoRedoService", void 0);
    __decorate([
        Autowired('columnModel')
    ], RowContainerEventsFeature.prototype, "columnModel", void 0);
    __decorate([
        Autowired('paginationProxy')
    ], RowContainerEventsFeature.prototype, "paginationProxy", void 0);
    __decorate([
        Autowired('pinnedRowModel')
    ], RowContainerEventsFeature.prototype, "pinnedRowModel", void 0);
    __decorate([
        Optional('rangeService')
    ], RowContainerEventsFeature.prototype, "rangeService", void 0);
    __decorate([
        Optional('clipboardService')
    ], RowContainerEventsFeature.prototype, "clipboardService", void 0);
    __decorate([
        PostConstruct
    ], RowContainerEventsFeature.prototype, "postConstruct", null);
    return RowContainerEventsFeature;
}(BeanStub));
export { RowContainerEventsFeature };
