import { KeyCode } from "../../constants/keyCode";
import { BeanStub } from "../../context/beanStub";
import { PostConstruct } from "../../context/context";
import { Column } from "../../entities/column";
import { CellKeyDownEvent, Events, FullWidthCellKeyDownEvent } from "../../events";
import { RowPinnedType } from "../../interfaces/iRowNode";
import { EventShowContextMenuParams } from "../../misc/menuService";
import { CellCtrl } from "../../rendering/cell/cellCtrl";
import { RowCtrl } from "../../rendering/row/rowCtrl";
import { last } from "../../utils/array";
import { isIOSUserAgent } from "../../utils/browser";
import { getCtrlForEventTarget, isEventSupported, isStopPropagationForAgGrid } from "../../utils/event";
import { missingOrEmpty } from "../../utils/generic";
import { isEventFromPrintableCharacter, isUserSuppressingKeyboardEvent, normaliseQwertyAzerty } from "../../utils/keyboard";
import { LongTapEvent, TouchListener } from "../../widgets/touchListener";

export class RowContainerEventsFeature extends BeanStub {
    private element: HTMLElement;

    constructor(element: HTMLElement) {
        super();
        this.element = element;
    }

    @PostConstruct
    public postConstruct(): void {
        this.addKeyboardListeners();
        this.addMouseListeners();
        this.mockContextMenuForIPad();
    }

    private addKeyboardListeners(): void {
        const eventName = 'keydown';
        const listener = this.processKeyboardEvent.bind(this, eventName);
        this.addManagedListener(this.element, eventName, listener);
    }

    private addMouseListeners(): void {
        const mouseDownEvent = isEventSupported('touchstart') ? 'touchstart' : 'mousedown';
        const eventNames = ['dblclick', 'contextmenu', 'mouseover', 'mouseout', 'click', mouseDownEvent];

        eventNames.forEach(eventName => {
            const listener = this.processMouseEvent.bind(this, eventName);
            this.addManagedListener(this.element, eventName, listener);
        });
    }

    private processMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        if (
            !this.beans.mouseEventService.isEventFromThisGrid(mouseEvent) ||
            isStopPropagationForAgGrid(mouseEvent)
        ) {
            return;
        }

        const rowComp = this.getRowForEvent(mouseEvent);
        const cellCtrl = this.beans.mouseEventService.getRenderedCellForEvent(mouseEvent)!;

        if (eventName === "contextmenu") {
            this.handleContextMenuMouseEvent(mouseEvent, undefined, rowComp, cellCtrl);
        } else {
            if (cellCtrl) {
                cellCtrl.onMouseEvent(eventName, mouseEvent);
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
            const cellComp = this.beans.mouseEventService.getRenderedCellForEvent(event.touchEvent)!;

            this.handleContextMenuMouseEvent(undefined, event.touchEvent, rowComp, cellComp);
        };

        this.addManagedListener(touchListener, TouchListener.EVENT_LONG_TAP, longTapListener);
        this.addDestroyFunc(() => touchListener.destroy());
    }

    private getRowForEvent(event: Event): RowCtrl | null {
        let sourceElement: HTMLElement | null = event.target as HTMLElement | null;

        while (sourceElement) {
            const rowCon = this.beans.gos.getDomData(sourceElement, RowCtrl.DOM_DATA_KEY_ROW_CTRL);
            if (rowCon) {
                return rowCon;
            }

            sourceElement = sourceElement.parentElement;
        }

        return null;
    }

    private handleContextMenuMouseEvent(mouseEvent: MouseEvent | undefined, touchEvent: TouchEvent | undefined, rowComp: RowCtrl | null, cellCtrl: CellCtrl) {
        const rowNode = rowComp ? rowComp.getRowNode() : null;
        const column = cellCtrl ? cellCtrl.getColumn() : null;
        let value = null;

        if (column) {
            const event = mouseEvent ? mouseEvent : touchEvent;
            cellCtrl.dispatchCellContextMenuEvent(event ?? null);
            value = this.beans.valueService.getValue(column, rowNode);
        }

        // if user clicked on a cell, anchor to that cell, otherwise anchor to the grid panel
        const gridBodyCon = this.beans.ctrlsService.getGridBodyCtrl();
        const anchorToElement = cellCtrl ? cellCtrl.getGui() : gridBodyCon.getGridBodyElement();

        this.beans.menuService.showContextMenu({ mouseEvent, touchEvent, rowNode, column, value, anchorToElement } as EventShowContextMenuParams);
    }

    private getControlsForEventTarget(target: EventTarget | null): { cellCtrl: CellCtrl | null, rowCtrl: RowCtrl | null } {
        return {
            cellCtrl: getCtrlForEventTarget<CellCtrl>(this.beans.gos, target, CellCtrl.DOM_DATA_KEY_CELL_CTRL),
            rowCtrl: getCtrlForEventTarget<RowCtrl>(this.beans.gos, target, RowCtrl.DOM_DATA_KEY_ROW_CTRL)
        }
    }

    private processKeyboardEvent(eventName: string, keyboardEvent: KeyboardEvent): void {
        const { cellCtrl, rowCtrl } = this.getControlsForEventTarget(keyboardEvent.target);

        if (keyboardEvent.defaultPrevented) { return; }
        if (cellCtrl) {
            this.processCellKeyboardEvent(cellCtrl, eventName, keyboardEvent);
        } else if (rowCtrl && rowCtrl.isFullWidth()) {
            this.processFullWidthRowKeyboardEvent(rowCtrl, eventName, keyboardEvent);
        }
    }

    private processCellKeyboardEvent(cellCtrl: CellCtrl, eventName: string, keyboardEvent: KeyboardEvent): void {
        const rowNode = cellCtrl.getRowNode();
        const column = cellCtrl.getColumn();
        const editing = cellCtrl.isEditing();

        const gridProcessingAllowed = !isUserSuppressingKeyboardEvent(this.beans.gos, keyboardEvent, rowNode, column, editing);

        if (gridProcessingAllowed) {
            if (eventName === 'keydown') {
                // first see if it's a scroll key, page up / down, home / end etc
                const wasScrollKey = !editing && this.beans.navigationService.handlePageScrollingKey(keyboardEvent);

                // if not a scroll key, then we pass onto cell
                if (!wasScrollKey) {
                    cellCtrl.onKeyDown(keyboardEvent);
                }

                // perform clipboard and undo / redo operations
                this.doGridOperations(keyboardEvent, cellCtrl.isEditing());

                if (isEventFromPrintableCharacter(keyboardEvent)) {
                    cellCtrl.processCharacter(keyboardEvent);
                }
            }
        }

        if (eventName === 'keydown') {
            const cellKeyDownEvent: CellKeyDownEvent = cellCtrl.createEvent(keyboardEvent, Events.EVENT_CELL_KEY_DOWN);
            this.beans.eventService.dispatchEvent(cellKeyDownEvent);
        }

    }

    private processFullWidthRowKeyboardEvent(rowComp: RowCtrl, eventName: string, keyboardEvent: KeyboardEvent) {
        const rowNode = rowComp.getRowNode();
        const focusedCell = this.beans.focusService.getFocusedCell();
        const column = (focusedCell && focusedCell.column) as Column;
        const gridProcessingAllowed = !isUserSuppressingKeyboardEvent(this.beans.gos, keyboardEvent, rowNode, column, false);

        if (gridProcessingAllowed) {
            const key = keyboardEvent.key;
            if (eventName === 'keydown') {
                switch (key) {
                    case KeyCode.PAGE_HOME:
                    case KeyCode.PAGE_END:
                    case KeyCode.PAGE_UP:
                    case KeyCode.PAGE_DOWN:
                        this.beans.navigationService.handlePageScrollingKey(keyboardEvent, true);
                        break;
    
                    case KeyCode.UP:
                    case KeyCode.DOWN:
                        rowComp.onKeyboardNavigate(keyboardEvent);
                        break;
                    case KeyCode.TAB:
                        rowComp.onTabKeyDown(keyboardEvent);
                        break;
                    default:
                }
            }
        }

        if (eventName === 'keydown') {
            const cellKeyDownEvent: FullWidthCellKeyDownEvent = rowComp.createRowEvent(Events.EVENT_CELL_KEY_DOWN, keyboardEvent);
            this.beans.eventService.dispatchEvent(cellKeyDownEvent);
        }
    }

    private doGridOperations(keyboardEvent: KeyboardEvent, editing: boolean): void {
        // check if ctrl or meta key pressed
        if (!keyboardEvent.ctrlKey && !keyboardEvent.metaKey) { return; }

        // if the cell the event came from is editing, then we do not
        // want to do the default shortcut keys, otherwise the editor
        // (eg a text field) would not be able to do the normal cut/copy/paste
        if (editing) { return; }

        // for copy / paste, we don't want to execute when the event
        // was from a child grid (happens in master detail)
        if (!this.beans.mouseEventService.isEventFromThisGrid(keyboardEvent)) { return; }

        const keyCode = normaliseQwertyAzerty(keyboardEvent);

        if (keyCode === KeyCode.A) { return this.onCtrlAndA(keyboardEvent); }
        if (keyCode === KeyCode.C) { return this.onCtrlAndC(keyboardEvent); }
        if (keyCode === KeyCode.D) { return this.onCtrlAndD(keyboardEvent); }
        if (keyCode === KeyCode.V) { return this.onCtrlAndV(keyboardEvent); }
        if (keyCode === KeyCode.X) { return this.onCtrlAndX(keyboardEvent); }
        if (keyCode === KeyCode.Y) { return this.onCtrlAndY(); }
        if (keyCode === KeyCode.Z) { return this.onCtrlAndZ(keyboardEvent); }
    }

    private onCtrlAndA(event: KeyboardEvent): void {
        const { pinnedRowModel, paginationProxy, rangeService } = this.beans;

        if (rangeService && paginationProxy.isRowsToRender()) {
            const [isEmptyPinnedTop, isEmptyPinnedBottom] = [
                pinnedRowModel.isEmpty('top'),
                pinnedRowModel.isEmpty('bottom')
            ];

            const floatingStart: RowPinnedType = isEmptyPinnedTop ? null : 'top';
            let floatingEnd: RowPinnedType;
            let rowEnd: number;

            if (isEmptyPinnedBottom) {
                floatingEnd = null;
                rowEnd = paginationProxy.getRowCount() - 1;
            } else {
                floatingEnd = 'bottom';
                rowEnd = pinnedRowModel.getPinnedBottomRowData().length - 1;
            }

            const allDisplayedColumns = this.beans.columnModel.getAllDisplayedColumns();
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
        if (!this.beans.clipboardService || this.beans.gos.get('enableCellTextSelection')) { return; }

        const { cellCtrl, rowCtrl } = this.getControlsForEventTarget(event.target);

        if (cellCtrl?.isEditing() || rowCtrl?.isEditing()) { return; }

        event.preventDefault();
        this.beans.clipboardService.copyToClipboard();
    }

    private onCtrlAndX(event: KeyboardEvent): void {
        if (
            !this.beans.clipboardService ||
            this.beans.gos.get('enableCellTextSelection') ||
            this.beans.gos.get('suppressCutToClipboard')
        ) { return; }

        const { cellCtrl, rowCtrl } = this.getControlsForEventTarget(event.target);

        if (cellCtrl?.isEditing() || rowCtrl?.isEditing()) { return; }

            event.preventDefault();
            this.beans.clipboardService.cutToClipboard(undefined, 'ui');
    }


    private onCtrlAndV(event: KeyboardEvent): void {
        const { cellCtrl, rowCtrl } = this.getControlsForEventTarget(event.target);

        if (cellCtrl?.isEditing() || rowCtrl?.isEditing()) { return; }
        if (this.beans.clipboardService && !this.beans.gos.get('suppressClipboardPaste')) {
            this.beans.clipboardService.pasteFromClipboard();
        }
    }

    private onCtrlAndD(event: KeyboardEvent): void {
        if (this.beans.clipboardService && !this.beans.gos.get('suppressClipboardPaste')) {
            this.beans.clipboardService.copyRangeDown();
        }
        event.preventDefault();
    }

    private onCtrlAndZ(event: KeyboardEvent): void {
        if (!this.beans.gos.get('undoRedoCellEditing')) { return; }
        event.preventDefault();

        if (event.shiftKey) {
            this.beans.undoRedoService.redo('ui');
        } else {
            this.beans.undoRedoService.undo('ui');
        }
    }

    private onCtrlAndY(): void {
        this.beans.undoRedoService.redo('ui');
    }

}