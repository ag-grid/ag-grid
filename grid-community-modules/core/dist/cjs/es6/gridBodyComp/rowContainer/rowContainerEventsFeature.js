"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowContainerEventsFeature = void 0;
const beanStub_1 = require("../../context/beanStub");
const event_1 = require("../../utils/event");
const context_1 = require("../../context/context");
const rowCtrl_1 = require("../../rendering/row/rowCtrl");
const browser_1 = require("../../utils/browser");
const touchListener_1 = require("../../widgets/touchListener");
const keyboard_1 = require("../../utils/keyboard");
const events_1 = require("../../events");
const keyCode_1 = require("../../constants/keyCode");
const generic_1 = require("../../utils/generic");
const array_1 = require("../../utils/array");
const keyboard_2 = require("../../utils/keyboard");
const cellCtrl_1 = require("../../rendering/cell/cellCtrl");
class RowContainerEventsFeature extends beanStub_1.BeanStub {
    constructor(element) {
        super();
        this.element = element;
    }
    postConstruct() {
        this.addKeyboardListeners();
        this.addMouseListeners();
        this.mockContextMenuForIPad();
    }
    addKeyboardListeners() {
        const eventName = 'keydown';
        const listener = this.processKeyboardEvent.bind(this, eventName);
        this.addManagedListener(this.element, eventName, listener);
    }
    addMouseListeners() {
        const mouseDownEvent = (0, event_1.isEventSupported)('touchstart') ? 'touchstart' : 'mousedown';
        const eventNames = ['dblclick', 'contextmenu', 'mouseover', 'mouseout', 'click', mouseDownEvent];
        eventNames.forEach(eventName => {
            const listener = this.processMouseEvent.bind(this, eventName);
            this.addManagedListener(this.element, eventName, listener);
        });
    }
    processMouseEvent(eventName, mouseEvent) {
        if (!this.mouseEventService.isEventFromThisGrid(mouseEvent) ||
            (0, event_1.isStopPropagationForAgGrid)(mouseEvent)) {
            return;
        }
        const rowComp = this.getRowForEvent(mouseEvent);
        const cellCtrl = this.mouseEventService.getRenderedCellForEvent(mouseEvent);
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
    }
    mockContextMenuForIPad() {
        // we do NOT want this when not in iPad, otherwise we will be doing
        if (!(0, browser_1.isIOSUserAgent)()) {
            return;
        }
        const touchListener = new touchListener_1.TouchListener(this.element);
        const longTapListener = (event) => {
            const rowComp = this.getRowForEvent(event.touchEvent);
            const cellComp = this.mouseEventService.getRenderedCellForEvent(event.touchEvent);
            this.handleContextMenuMouseEvent(null, event.touchEvent, rowComp, cellComp);
        };
        this.addManagedListener(touchListener, touchListener_1.TouchListener.EVENT_LONG_TAP, longTapListener);
        this.addDestroyFunc(() => touchListener.destroy());
    }
    getRowForEvent(event) {
        let sourceElement = event.target;
        while (sourceElement) {
            const rowCon = this.gridOptionsService.getDomData(sourceElement, rowCtrl_1.RowCtrl.DOM_DATA_KEY_ROW_CTRL);
            if (rowCon) {
                return rowCon;
            }
            sourceElement = sourceElement.parentElement;
        }
        return null;
    }
    handleContextMenuMouseEvent(mouseEvent, touchEvent, rowComp, cellCtrl) {
        const rowNode = rowComp ? rowComp.getRowNode() : null;
        const column = cellCtrl ? cellCtrl.getColumn() : null;
        let value = null;
        if (column) {
            const event = mouseEvent ? mouseEvent : touchEvent;
            cellCtrl.dispatchCellContextMenuEvent(event);
            value = this.valueService.getValue(column, rowNode);
        }
        // if user clicked on a cell, anchor to that cell, otherwise anchor to the grid panel
        const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        const anchorToElement = cellCtrl ? cellCtrl.getGui() : gridBodyCon.getGridBodyElement();
        if (this.contextMenuFactory) {
            this.contextMenuFactory.onContextMenu(mouseEvent, touchEvent, rowNode, column, value, anchorToElement);
        }
    }
    getControlsForEventTarget(target) {
        return {
            cellCtrl: (0, event_1.getCtrlForEventTarget)(this.gridOptionsService, target, cellCtrl_1.CellCtrl.DOM_DATA_KEY_CELL_CTRL),
            rowCtrl: (0, event_1.getCtrlForEventTarget)(this.gridOptionsService, target, rowCtrl_1.RowCtrl.DOM_DATA_KEY_ROW_CTRL)
        };
    }
    processKeyboardEvent(eventName, keyboardEvent) {
        const { cellCtrl, rowCtrl } = this.getControlsForEventTarget(keyboardEvent.target);
        if (keyboardEvent.defaultPrevented) {
            return;
        }
        if (cellCtrl) {
            this.processCellKeyboardEvent(cellCtrl, eventName, keyboardEvent);
        }
        else if (rowCtrl && rowCtrl.isFullWidth()) {
            this.processFullWidthRowKeyboardEvent(rowCtrl, eventName, keyboardEvent);
        }
    }
    processCellKeyboardEvent(cellCtrl, eventName, keyboardEvent) {
        const rowNode = cellCtrl.getRowNode();
        const column = cellCtrl.getColumn();
        const editing = cellCtrl.isEditing();
        const gridProcessingAllowed = !(0, keyboard_1.isUserSuppressingKeyboardEvent)(this.gridOptionsService, keyboardEvent, rowNode, column, editing);
        if (gridProcessingAllowed) {
            if (eventName === 'keydown') {
                // first see if it's a scroll key, page up / down, home / end etc
                const wasScrollKey = !editing && this.navigationService.handlePageScrollingKey(keyboardEvent);
                // if not a scroll key, then we pass onto cell
                if (!wasScrollKey) {
                    cellCtrl.onKeyDown(keyboardEvent);
                }
                // perform clipboard and undo / redo operations
                this.doGridOperations(keyboardEvent, cellCtrl.isEditing());
                if ((0, keyboard_1.isEventFromPrintableCharacter)(keyboardEvent)) {
                    cellCtrl.processCharacter(keyboardEvent);
                }
            }
        }
        if (eventName === 'keydown') {
            const cellKeyDownEvent = cellCtrl.createEvent(keyboardEvent, events_1.Events.EVENT_CELL_KEY_DOWN);
            this.eventService.dispatchEvent(cellKeyDownEvent);
        }
    }
    processFullWidthRowKeyboardEvent(rowComp, eventName, keyboardEvent) {
        const rowNode = rowComp.getRowNode();
        const focusedCell = this.focusService.getFocusedCell();
        const column = (focusedCell && focusedCell.column);
        const gridProcessingAllowed = !(0, keyboard_1.isUserSuppressingKeyboardEvent)(this.gridOptionsService, keyboardEvent, rowNode, column, false);
        if (gridProcessingAllowed) {
            const key = keyboardEvent.key;
            if (eventName === 'keydown') {
                switch (key) {
                    case keyCode_1.KeyCode.PAGE_HOME:
                    case keyCode_1.KeyCode.PAGE_END:
                    case keyCode_1.KeyCode.PAGE_UP:
                    case keyCode_1.KeyCode.PAGE_DOWN:
                        this.navigationService.handlePageScrollingKey(keyboardEvent, true);
                        break;
                    case keyCode_1.KeyCode.UP:
                    case keyCode_1.KeyCode.DOWN:
                        rowComp.onKeyboardNavigate(keyboardEvent);
                        break;
                    case keyCode_1.KeyCode.TAB:
                        rowComp.onTabKeyDown(keyboardEvent);
                        break;
                    default:
                }
            }
        }
        if (eventName === 'keydown') {
            const cellKeyDownEvent = rowComp.createRowEvent(events_1.Events.EVENT_CELL_KEY_DOWN, keyboardEvent);
            this.eventService.dispatchEvent(cellKeyDownEvent);
        }
    }
    doGridOperations(keyboardEvent, editing) {
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
        const keyCode = (0, keyboard_2.normaliseQwertyAzerty)(keyboardEvent);
        if (keyCode === keyCode_1.KeyCode.A) {
            return this.onCtrlAndA(keyboardEvent);
        }
        if (keyCode === keyCode_1.KeyCode.C) {
            return this.onCtrlAndC(keyboardEvent);
        }
        if (keyCode === keyCode_1.KeyCode.D) {
            return this.onCtrlAndD(keyboardEvent);
        }
        if (keyCode === keyCode_1.KeyCode.V) {
            return this.onCtrlAndV(keyboardEvent);
        }
        if (keyCode === keyCode_1.KeyCode.X) {
            return this.onCtrlAndX(keyboardEvent);
        }
        if (keyCode === keyCode_1.KeyCode.Y) {
            return this.onCtrlAndY();
        }
        if (keyCode === keyCode_1.KeyCode.Z) {
            return this.onCtrlAndZ(keyboardEvent);
        }
    }
    onCtrlAndA(event) {
        const { pinnedRowModel, paginationProxy, rangeService } = this;
        if (rangeService && paginationProxy.isRowsToRender()) {
            const [isEmptyPinnedTop, isEmptyPinnedBottom] = [
                pinnedRowModel.isEmpty('top'),
                pinnedRowModel.isEmpty('bottom')
            ];
            const floatingStart = isEmptyPinnedTop ? null : 'top';
            let floatingEnd;
            let rowEnd;
            if (isEmptyPinnedBottom) {
                floatingEnd = null;
                rowEnd = this.paginationProxy.getRowCount() - 1;
            }
            else {
                floatingEnd = 'bottom';
                rowEnd = pinnedRowModel.getPinnedBottomRowData().length - 1;
            }
            const allDisplayedColumns = this.columnModel.getAllDisplayedColumns();
            if ((0, generic_1.missingOrEmpty)(allDisplayedColumns)) {
                return;
            }
            rangeService.setCellRange({
                rowStartIndex: 0,
                rowStartPinned: floatingStart,
                rowEndIndex: rowEnd,
                rowEndPinned: floatingEnd,
                columnStart: allDisplayedColumns[0],
                columnEnd: (0, array_1.last)(allDisplayedColumns)
            });
        }
        event.preventDefault();
    }
    onCtrlAndC(event) {
        if (!this.clipboardService || this.gridOptionsService.get('enableCellTextSelection')) {
            return;
        }
        const { cellCtrl, rowCtrl } = this.getControlsForEventTarget(event.target);
        if ((cellCtrl === null || cellCtrl === void 0 ? void 0 : cellCtrl.isEditing()) || (rowCtrl === null || rowCtrl === void 0 ? void 0 : rowCtrl.isEditing())) {
            return;
        }
        event.preventDefault();
        this.clipboardService.copyToClipboard();
    }
    onCtrlAndX(event) {
        if (!this.clipboardService ||
            this.gridOptionsService.get('enableCellTextSelection') ||
            this.gridOptionsService.get('suppressCutToClipboard')) {
            return;
        }
        const { cellCtrl, rowCtrl } = this.getControlsForEventTarget(event.target);
        if ((cellCtrl === null || cellCtrl === void 0 ? void 0 : cellCtrl.isEditing()) || (rowCtrl === null || rowCtrl === void 0 ? void 0 : rowCtrl.isEditing())) {
            return;
        }
        event.preventDefault();
        this.clipboardService.cutToClipboard(undefined, 'ui');
    }
    onCtrlAndV(event) {
        const { cellCtrl, rowCtrl } = this.getControlsForEventTarget(event.target);
        if ((cellCtrl === null || cellCtrl === void 0 ? void 0 : cellCtrl.isEditing()) || (rowCtrl === null || rowCtrl === void 0 ? void 0 : rowCtrl.isEditing())) {
            return;
        }
        if (this.clipboardService && !this.gridOptionsService.get('suppressClipboardPaste')) {
            this.clipboardService.pasteFromClipboard();
        }
    }
    onCtrlAndD(event) {
        if (this.clipboardService && !this.gridOptionsService.get('suppressClipboardPaste')) {
            this.clipboardService.copyRangeDown();
        }
        event.preventDefault();
    }
    onCtrlAndZ(event) {
        if (!this.gridOptionsService.get('undoRedoCellEditing')) {
            return;
        }
        event.preventDefault();
        if (event.shiftKey) {
            this.undoRedoService.redo('ui');
        }
        else {
            this.undoRedoService.undo('ui');
        }
    }
    onCtrlAndY() {
        this.undoRedoService.redo('ui');
    }
}
__decorate([
    (0, context_1.Autowired)('mouseEventService')
], RowContainerEventsFeature.prototype, "mouseEventService", void 0);
__decorate([
    (0, context_1.Autowired)('valueService')
], RowContainerEventsFeature.prototype, "valueService", void 0);
__decorate([
    (0, context_1.Optional)('contextMenuFactory')
], RowContainerEventsFeature.prototype, "contextMenuFactory", void 0);
__decorate([
    (0, context_1.Autowired)('ctrlsService')
], RowContainerEventsFeature.prototype, "ctrlsService", void 0);
__decorate([
    (0, context_1.Autowired)('navigationService')
], RowContainerEventsFeature.prototype, "navigationService", void 0);
__decorate([
    (0, context_1.Autowired)('focusService')
], RowContainerEventsFeature.prototype, "focusService", void 0);
__decorate([
    (0, context_1.Autowired)('undoRedoService')
], RowContainerEventsFeature.prototype, "undoRedoService", void 0);
__decorate([
    (0, context_1.Autowired)('columnModel')
], RowContainerEventsFeature.prototype, "columnModel", void 0);
__decorate([
    (0, context_1.Autowired)('paginationProxy')
], RowContainerEventsFeature.prototype, "paginationProxy", void 0);
__decorate([
    (0, context_1.Autowired)('pinnedRowModel')
], RowContainerEventsFeature.prototype, "pinnedRowModel", void 0);
__decorate([
    (0, context_1.Optional)('rangeService')
], RowContainerEventsFeature.prototype, "rangeService", void 0);
__decorate([
    (0, context_1.Optional)('clipboardService')
], RowContainerEventsFeature.prototype, "clipboardService", void 0);
__decorate([
    context_1.PostConstruct
], RowContainerEventsFeature.prototype, "postConstruct", null);
exports.RowContainerEventsFeature = RowContainerEventsFeature;
