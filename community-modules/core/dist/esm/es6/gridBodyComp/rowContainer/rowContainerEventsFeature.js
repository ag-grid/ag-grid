/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
export class RowContainerEventsFeature extends BeanStub {
    constructor(element) {
        super();
        this.element = element;
    }
    postConstruct() {
        this.addMouseListeners();
        this.mockContextMenuForIPad();
        this.addKeyboardEvents();
    }
    addKeyboardEvents() {
        const eventNames = ['keydown', 'keypress'];
        eventNames.forEach(eventName => {
            const listener = this.processKeyboardEvent.bind(this, eventName);
            this.addManagedListener(this.element, eventName, listener);
        });
    }
    addMouseListeners() {
        const mouseDownEvent = isEventSupported('touchstart') ? 'touchstart' : 'mousedown';
        const eventNames = ['dblclick', 'contextmenu', 'mouseover', 'mouseout', 'click', mouseDownEvent];
        eventNames.forEach(eventName => {
            const listener = this.processMouseEvent.bind(this, eventName);
            this.addManagedListener(this.element, eventName, listener);
        });
    }
    processMouseEvent(eventName, mouseEvent) {
        if (!this.mouseEventService.isEventFromThisGrid(mouseEvent) ||
            isStopPropagationForAgGrid(mouseEvent)) {
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
        if (!isIOSUserAgent()) {
            return;
        }
        const touchListener = new TouchListener(this.element);
        const longTapListener = (event) => {
            const rowComp = this.getRowForEvent(event.touchEvent);
            const cellComp = this.mouseEventService.getRenderedCellForEvent(event.touchEvent);
            this.handleContextMenuMouseEvent(null, event.touchEvent, rowComp, cellComp);
        };
        this.addManagedListener(touchListener, TouchListener.EVENT_LONG_TAP, longTapListener);
        this.addDestroyFunc(() => touchListener.destroy());
    }
    getRowForEvent(event) {
        let sourceElement = event.target;
        while (sourceElement) {
            const rowCon = this.gridOptionsWrapper.getDomData(sourceElement, RowCtrl.DOM_DATA_KEY_ROW_CTRL);
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
    processKeyboardEvent(eventName, keyboardEvent) {
        const cellComp = getCtrlForEvent(this.gridOptionsWrapper, keyboardEvent, CellCtrl.DOM_DATA_KEY_CELL_CTRL);
        const rowComp = getCtrlForEvent(this.gridOptionsWrapper, keyboardEvent, RowCtrl.DOM_DATA_KEY_ROW_CTRL);
        if (keyboardEvent.defaultPrevented) {
            return;
        }
        if (cellComp) {
            this.processCellKeyboardEvent(cellComp, eventName, keyboardEvent);
        }
        else if (rowComp && rowComp.isFullWidth()) {
            this.processFullWidthRowKeyboardEvent(rowComp, eventName, keyboardEvent);
        }
    }
    processCellKeyboardEvent(cellCtrl, eventName, keyboardEvent) {
        const rowNode = cellCtrl.getRowNode();
        const column = cellCtrl.getColumn();
        const editing = cellCtrl.isEditing();
        const gridProcessingAllowed = !isUserSuppressingKeyboardEvent(this.gridOptionsWrapper, keyboardEvent, rowNode, column, editing);
        if (gridProcessingAllowed) {
            switch (eventName) {
                case 'keydown':
                    // first see if it's a scroll key, page up / down, home / end etc
                    const wasScrollKey = !editing && this.navigationService.handlePageScrollingKey(keyboardEvent);
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
            const cellKeyDownEvent = cellCtrl.createEvent(keyboardEvent, Events.EVENT_CELL_KEY_DOWN);
            this.eventService.dispatchEvent(cellKeyDownEvent);
        }
        if (eventName === 'keypress') {
            const cellKeyPressEvent = cellCtrl.createEvent(keyboardEvent, Events.EVENT_CELL_KEY_PRESS);
            this.eventService.dispatchEvent(cellKeyPressEvent);
        }
    }
    processFullWidthRowKeyboardEvent(rowComp, eventName, keyboardEvent) {
        const rowNode = rowComp.getRowNode();
        const focusedCell = this.focusService.getFocusedCell();
        const column = (focusedCell && focusedCell.column);
        const gridProcessingAllowed = !isUserSuppressingKeyboardEvent(this.gridOptionsWrapper, keyboardEvent, rowNode, column, false);
        if (gridProcessingAllowed) {
            const key = keyboardEvent.key;
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
            const cellKeyDownEvent = rowComp.createRowEvent(Events.EVENT_CELL_KEY_DOWN, keyboardEvent);
            this.eventService.dispatchEvent(cellKeyDownEvent);
        }
        if (eventName === 'keypress') {
            const cellKeyPressEvent = rowComp.createRowEvent(Events.EVENT_CELL_KEY_PRESS, keyboardEvent);
            this.eventService.dispatchEvent(cellKeyPressEvent);
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
        const keyCode = normaliseQwertyAzerty(keyboardEvent);
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
    }
    onCtrlAndA(event) {
        const { pinnedRowModel, paginationProxy, rangeService } = this;
        const { PINNED_BOTTOM, PINNED_TOP } = Constants;
        if (rangeService && paginationProxy.isRowsToRender()) {
            const [isEmptyPinnedTop, isEmptyPinnedBottom] = [
                pinnedRowModel.isEmpty(PINNED_TOP),
                pinnedRowModel.isEmpty(PINNED_BOTTOM)
            ];
            const floatingStart = isEmptyPinnedTop ? null : PINNED_TOP;
            let floatingEnd;
            let rowEnd;
            if (isEmptyPinnedBottom) {
                floatingEnd = null;
                rowEnd = this.paginationProxy.getRowCount() - 1;
            }
            else {
                floatingEnd = PINNED_BOTTOM;
                rowEnd = pinnedRowModel.getPinnedBottomRowData().length - 1;
            }
            const allDisplayedColumns = this.columnModel.getAllDisplayedColumns();
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
    }
    onCtrlAndC(event) {
        if (!this.clipboardService || this.gridOptionsWrapper.isEnableCellTextSelection()) {
            return;
        }
        this.clipboardService.copyToClipboard();
        event.preventDefault();
    }
    onCtrlAndV() {
        if (ModuleRegistry.isRegistered(ModuleNames.ClipboardModule) && !this.gridOptionsWrapper.isSuppressClipboardPaste()) {
            this.clipboardService.pasteFromClipboard();
        }
    }
    onCtrlAndD(event) {
        if (ModuleRegistry.isRegistered(ModuleNames.ClipboardModule) && !this.gridOptionsWrapper.isSuppressClipboardPaste()) {
            this.clipboardService.copyRangeDown();
        }
        event.preventDefault();
    }
    onCtrlAndZ(event) {
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
    }
    onCtrlAndY() {
        this.undoRedoService.redo();
    }
}
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
