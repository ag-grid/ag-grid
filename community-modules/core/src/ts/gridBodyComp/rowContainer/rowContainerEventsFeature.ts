import { BeanStub } from "../../context/beanStub";
import { getComponentForEvent, getTarget, isStopPropagationForAgGrid } from "../../utils/event";
import { Autowired, Optional, PostConstruct } from "../../context/context";
import { MouseEventService } from "./../mouseEventService";
import { RowCtrl } from "../../rendering/row/rowCtrl";
import { CellComp } from "../../rendering/cellComp";
import { ValueService } from "../../valueService/valueService";
import { Column } from "../../entities/column";
import { IContextMenuFactory } from "../../interfaces/iContextMenuFactory";
import { isIOSUserAgent } from "../../utils/browser";
import { LongTapEvent, TouchListener } from "../../widgets/touchListener";
import { ControllersService } from "../../controllersService";
import { isUserSuppressingKeyboardEvent } from "../../utils/keyboard";
import { CellKeyDownEvent, CellKeyPressEvent, Events, FullWidthCellKeyDownEvent, FullWidthCellKeyPressEvent } from "../../events";
import { KeyName } from "../../constants/keyName";
import { NavigationService } from "./../navigationService";
import { FocusService } from "../../focusService";
import { KeyCode } from "../../constants/keyCode";
import { UndoRedoService } from "../../undoRedo/undoRedoService";
import { Constants } from "../../constants/constants";
import { missingOrEmpty } from "../../utils/generic";
import { last } from "../../utils/array";
import { ColumnModel } from "../../columns/columnModel";
import { PaginationProxy } from "../../pagination/paginationProxy";
import { PinnedRowModel } from "../../pinnedRowModel/pinnedRowModel";
import { IRangeService } from "../../interfaces/IRangeService";
import { ModuleRegistry } from "../../modules/moduleRegistry";
import { ModuleNames } from "../../modules/moduleNames";
import { IClipboardService } from "../../interfaces/iClipboardService";

export class RowContainerEventsFeature extends BeanStub {

    @Autowired('mouseEventService') private mouseEventService: MouseEventService;
    @Autowired('valueService') private valueService: ValueService;
    @Optional('contextMenuFactory') private contextMenuFactory: IContextMenuFactory;
    @Autowired('controllersService') private controllersService: ControllersService;
    @Autowired('navigationService') private navigationService: NavigationService;
    @Autowired('focusService') private focusService: FocusService;
    @Autowired('undoRedoService') private undoRedoService: UndoRedoService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Optional('rangeService') private rangeService: IRangeService;
    @Optional('clipboardService') private clipboardService: IClipboardService;

    private element: HTMLElement;

    constructor(element: HTMLElement) {
        super();
        this.element = element;
    }

    @PostConstruct
    public postConstruct(): void {
        this.addMouseListeners();
        this.mockContextMenuForIPad();
        this.addKeyboardEvents();
    }

    private addKeyboardEvents(): void {
        const eventNames = ['keydown', 'keypress'];

        eventNames.forEach(eventName => {
            const listener = this.processKeyboardEvent.bind(this, eventName);
            this.addManagedListener(this.element, eventName, listener);
        });
    }

    private addMouseListeners(): void {
        const eventNames = ['dblclick', 'contextmenu', 'mouseover', 'mouseout', 'click', 'mousedown'];

        eventNames.forEach(eventName => {
            const listener = this.processMouseEvent.bind(this, eventName);
            this.addManagedListener(this.element, eventName, listener);
        });
    }

    private processMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        if (
            !this.mouseEventService.isEventFromThisGrid(mouseEvent) ||
            isStopPropagationForAgGrid(mouseEvent)
        ) {
            return;
        }

        const rowComp = this.getRowForEvent(mouseEvent);
        const cellComp = this.mouseEventService.getRenderedCellForEvent(mouseEvent)!;

        if (eventName === "contextmenu") {
            this.handleContextMenuMouseEvent(mouseEvent, null, rowComp, cellComp);
        } else {
            if (cellComp) {
                cellComp.onMouseEvent(eventName, mouseEvent);
            }
            if (rowComp) {
                rowComp.onMouseEvent(eventName, mouseEvent);
            }
        }
    }

    private mockContextMenuForIPad(): void {
        // we do NOT want this when not in iPad, otherwise we will be doing
        if (!isIOSUserAgent()) { return; }

        const touchListener = new TouchListener(this.element);
        const longTapListener = (event: LongTapEvent) => {
            const rowComp = this.getRowForEvent(event.touchEvent);
            const cellComp = this.mouseEventService.getRenderedCellForEvent(event.touchEvent)!;

            this.handleContextMenuMouseEvent(null, event.touchEvent, rowComp, cellComp);
        };

        this.addManagedListener(touchListener, TouchListener.EVENT_LONG_TAP, longTapListener);
        this.addDestroyFunc(() => touchListener.destroy());
    }

    private getRowForEvent(event: Event): RowCtrl | null {
        let sourceElement: Element | null = getTarget(event);

        while (sourceElement) {
            const rowCon = this.gridOptionsWrapper.getDomData(sourceElement, RowCtrl.DOM_DATA_KEY_RENDERED_ROW);
            if (rowCon) {
                return rowCon;
            }

            sourceElement = sourceElement.parentElement;
        }

        return null;
    }

    private handleContextMenuMouseEvent(mouseEvent: MouseEvent | null, touchEvent: TouchEvent | null, rowComp: RowCtrl | null, cellComp: CellComp) {
        const rowNode = rowComp ? rowComp.getRowNode() : null;
        const column = cellComp ? cellComp.getColumn() : null;
        let value = null;

        if (column) {
            const event = mouseEvent ? mouseEvent : touchEvent;
            cellComp.dispatchCellContextMenuEvent(event);
            value = this.valueService.getValue(column, rowNode);
        }

        // if user clicked on a cell, anchor to that cell, otherwise anchor to the grid panel
        const gridBodyCon = this.controllersService.getGridBodyController();
        const anchorToElement = cellComp ? cellComp.getGui() : gridBodyCon.getGridBodyElement();

        if (this.contextMenuFactory) {
            this.contextMenuFactory.onContextMenu(mouseEvent, touchEvent, rowNode, column, value, anchorToElement);
        }
    }

    private processKeyboardEvent(eventName: string, keyboardEvent: KeyboardEvent): void {
        const cellComp = getComponentForEvent<CellComp>(this.gridOptionsWrapper, keyboardEvent, 'cellComp');
        const rowComp = getComponentForEvent<RowCtrl>(this.gridOptionsWrapper, keyboardEvent, 'renderedRow');

        if (keyboardEvent.defaultPrevented) { return; }
        if (cellComp) {
            this.processCellKeyboardEvent(cellComp, eventName, keyboardEvent);
        } else if (rowComp && rowComp.isFullWidth()) {
            this.processFullWidthRowKeyboardEvent(rowComp, eventName, keyboardEvent);
        }
    }

    private processCellKeyboardEvent(cellComp: CellComp, eventName: string, keyboardEvent: KeyboardEvent): void {
        const rowNode = cellComp.getRenderedRow()!.getRowNode();
        const column = cellComp.getColumn();
        const editing = cellComp.isEditing();

        const gridProcessingAllowed = !isUserSuppressingKeyboardEvent(this.gridOptionsWrapper, keyboardEvent, rowNode, column, editing);

        if (gridProcessingAllowed) {
            switch (eventName) {
                case 'keydown':
                    // first see if it's a scroll key, page up / down, home / end etc
                    const wasScrollKey = !editing && this.navigationService.handlePageScrollingKey(keyboardEvent);

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
            const cellKeyDownEvent: CellKeyDownEvent = cellComp.createEvent(keyboardEvent, Events.EVENT_CELL_KEY_DOWN);
            this.eventService.dispatchEvent(cellKeyDownEvent);
        }

        if (eventName === 'keypress') {
            const cellKeyPressEvent: CellKeyPressEvent = cellComp.createEvent(keyboardEvent, Events.EVENT_CELL_KEY_PRESS);
            this.eventService.dispatchEvent(cellKeyPressEvent);
        }
    }

    private processFullWidthRowKeyboardEvent(rowComp: RowCtrl, eventName: string, keyboardEvent: KeyboardEvent) {
        const rowNode = rowComp.getRowNode();
        const focusedCell = this.focusService.getFocusedCell();
        const column = (focusedCell && focusedCell.column) as Column;
        const gridProcessingAllowed = !isUserSuppressingKeyboardEvent(this.gridOptionsWrapper, keyboardEvent, rowNode, column, false);

        if (gridProcessingAllowed) {
            const key = keyboardEvent.key;
            if (eventName === 'keydown') {
                switch (key) {
                    case KeyName.UP:
                    case KeyName.DOWN:
                        rowComp.onKeyboardNavigate(keyboardEvent);
                        break;
                    case KeyName.TAB:
                        rowComp.onTabKeyDown(keyboardEvent);
                    default:
                }
            }
        }

        if (eventName === 'keydown') {
            const cellKeyDownEvent: FullWidthCellKeyDownEvent = rowComp.createRowEvent(Events.EVENT_CELL_KEY_DOWN, keyboardEvent);
            this.eventService.dispatchEvent(cellKeyDownEvent);
        }

        if (eventName === 'keypress') {
            const cellKeyPressEvent: FullWidthCellKeyPressEvent = rowComp.createRowEvent(Events.EVENT_CELL_KEY_PRESS, keyboardEvent);
            this.eventService.dispatchEvent(cellKeyPressEvent);
        }
    }

    private doGridOperations(keyboardEvent: KeyboardEvent, cellComp: CellComp): void {
        // check if ctrl or meta key pressed
        if (!keyboardEvent.ctrlKey && !keyboardEvent.metaKey) { return; }

        // if the cell the event came from is editing, then we do not
        // want to do the default shortcut keys, otherwise the editor
        // (eg a text field) would not be able to do the normal cut/copy/paste
        if (cellComp.isEditing()) { return; }

        // for copy / paste, we don't want to execute when the event
        // was from a child grid (happens in master detail)
        if (!this.mouseEventService.isEventFromThisGrid(keyboardEvent)) { return; }

        switch (keyboardEvent.which) {
            case KeyCode.A:
                return this.onCtrlAndA(keyboardEvent);
            case KeyCode.C:
                return this.onCtrlAndC(keyboardEvent);
            case KeyCode.V:
                return this.onCtrlAndV();
            case KeyCode.D:
                return this.onCtrlAndD(keyboardEvent);
            case KeyCode.Z:
                return keyboardEvent.shiftKey ? this.undoRedoService.redo() : this.undoRedoService.undo();
            case KeyCode.Y:
                return this.undoRedoService.redo();
        }
    }

    private onCtrlAndA(event: KeyboardEvent): void {

        const { pinnedRowModel, paginationProxy, rangeService } = this;
        const { PINNED_BOTTOM, PINNED_TOP } = Constants;

        if (rangeService && paginationProxy.isRowsToRender()) {
            const [isEmptyPinnedTop, isEmptyPinnedBottom] = [
                pinnedRowModel.isEmpty(PINNED_TOP),
                pinnedRowModel.isEmpty(PINNED_BOTTOM)
            ];

            const floatingStart = isEmptyPinnedTop ? null : PINNED_TOP;
            let floatingEnd: string | null;
            let rowEnd: number;

            if (isEmptyPinnedBottom) {
                floatingEnd = null;
                rowEnd = this.paginationProxy.getRowCount() - 1;
            } else {
                floatingEnd = PINNED_BOTTOM;
                rowEnd = pinnedRowModel.getPinnedBottomRowData().length - 1;
            }

            const allDisplayedColumns = this.columnModel.getAllDisplayedColumns();
            if (missingOrEmpty(allDisplayedColumns)) { return; }

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

    private onCtrlAndC(event: KeyboardEvent): void {

        if (!this.clipboardService || this.gridOptionsWrapper.isEnableCellTextSelection()) { return; }

        this.clipboardService.copyToClipboard();
        event.preventDefault();
    }

    private onCtrlAndV(): void {
        if (ModuleRegistry.isRegistered(ModuleNames.ClipboardModule) && !this.gridOptionsWrapper.isSuppressClipboardPaste()) {
            this.clipboardService.pasteFromClipboard();
        }
    }

    private onCtrlAndD(event: KeyboardEvent): void {
        if (ModuleRegistry.isRegistered(ModuleNames.ClipboardModule) && !this.gridOptionsWrapper.isSuppressClipboardPaste()) {
            this.clipboardService.copyRangeDown();
        }
        event.preventDefault();
    }

}