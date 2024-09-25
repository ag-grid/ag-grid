import type { VisibleColsService } from '../../columns/visibleColsService';
import { KeyCode } from '../../constants/keyCode';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { FocusService } from '../../focusService';
import { _getDomData } from '../../gridOptionsUtils';
import type { IRangeService } from '../../interfaces/IRangeService';
import type { IClipboardService } from '../../interfaces/iClipboardService';
import type { IContextMenuService } from '../../interfaces/iContextMenu';
import type { IRowModel } from '../../interfaces/iRowModel';
import type { RowPinnedType } from '../../interfaces/iRowNode';
import type { PinnedRowModel } from '../../pinnedRowModel/pinnedRowModel';
import { CellCtrl } from '../../rendering/cell/cellCtrl';
import { RowCtrl } from '../../rendering/row/rowCtrl';
import type { UndoRedoService } from '../../undoRedo/undoRedoService';
import { _last } from '../../utils/array';
import { _isIOSUserAgent } from '../../utils/browser';
import { _getCtrlForEventTarget, _isEventSupported, _isStopPropagationForAgGrid } from '../../utils/event';
import { _missingOrEmpty } from '../../utils/generic';
import {
    _isEventFromPrintableCharacter,
    _isUserSuppressingKeyboardEvent,
    _normaliseQwertyAzerty,
} from '../../utils/keyboard';
import type { LongTapEvent } from '../../widgets/touchListener';
import { TouchListener } from '../../widgets/touchListener';
import type { MouseEventService } from './../mouseEventService';
import type { NavigationService } from './../navigationService';

export class RowContainerEventsFeature extends BeanStub {
    private mouseEventService: MouseEventService;
    private contextMenuService?: IContextMenuService;
    private navigationService: NavigationService;
    private focusService: FocusService;
    private undoRedoService?: UndoRedoService;
    private visibleColsService: VisibleColsService;
    private rowModel: IRowModel;
    private pinnedRowModel?: PinnedRowModel;
    private rangeService?: IRangeService;
    private clipboardService?: IClipboardService;

    public wireBeans(beans: BeanCollection) {
        this.mouseEventService = beans.mouseEventService;
        this.contextMenuService = beans.contextMenuService;
        this.navigationService = beans.navigationService;
        this.focusService = beans.focusService;
        this.undoRedoService = beans.undoRedoService;
        this.visibleColsService = beans.visibleColsService;
        this.rowModel = beans.rowModel;
        this.pinnedRowModel = beans.pinnedRowModel;
        this.rangeService = beans.rangeService;
        this.clipboardService = beans.clipboardService;
    }

    private element: HTMLElement;

    constructor(element: HTMLElement) {
        super();
        this.element = element;
    }

    public postConstruct(): void {
        this.addKeyboardListeners();
        this.addMouseListeners();
        this.mockContextMenuForIPad();
    }

    private addKeyboardListeners(): void {
        const eventName = 'keydown';
        const listener = this.processKeyboardEvent.bind(this, eventName);
        this.addManagedElementListeners(this.element, { [eventName]: listener });
    }

    private addMouseListeners(): void {
        const mouseDownEvent = _isEventSupported('touchstart') ? 'touchstart' : 'mousedown';
        const eventNames = ['dblclick', 'contextmenu', 'mouseover', 'mouseout', 'click', mouseDownEvent];

        eventNames.forEach((eventName) => {
            const listener = this.processMouseEvent.bind(this, eventName);
            this.addManagedElementListeners(this.element, { [eventName]: listener });
        });
    }

    private processMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        if (!this.mouseEventService.isEventFromThisGrid(mouseEvent) || _isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }

        const rowComp = this.getRowForEvent(mouseEvent);
        const cellCtrl = this.mouseEventService.getRenderedCellForEvent(mouseEvent)!;

        if (eventName === 'contextmenu') {
            this.contextMenuService?.handleContextMenuMouseEvent(mouseEvent, undefined, rowComp, cellCtrl);
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
        if (!_isIOSUserAgent()) {
            return;
        }

        const touchListener = new TouchListener(this.element);
        const longTapListener = (event: LongTapEvent) => {
            const rowComp = this.getRowForEvent(event.touchEvent);
            const cellComp = this.mouseEventService.getRenderedCellForEvent(event.touchEvent)!;

            this.contextMenuService?.handleContextMenuMouseEvent(undefined, event.touchEvent, rowComp, cellComp);
        };

        this.addManagedListeners(touchListener, { longTap: longTapListener });
        this.addDestroyFunc(() => touchListener.destroy());
    }

    private getRowForEvent(event: Event): RowCtrl | null {
        let sourceElement: HTMLElement | null = event.target as HTMLElement | null;

        while (sourceElement) {
            const rowCon = _getDomData(this.gos, sourceElement, RowCtrl.DOM_DATA_KEY_ROW_CTRL);
            if (rowCon) {
                return rowCon;
            }

            sourceElement = sourceElement.parentElement;
        }

        return null;
    }

    private getControlsForEventTarget(target: EventTarget | null): {
        cellCtrl: CellCtrl | null;
        rowCtrl: RowCtrl | null;
    } {
        return {
            cellCtrl: _getCtrlForEventTarget<CellCtrl>(this.gos, target, CellCtrl.DOM_DATA_KEY_CELL_CTRL),
            rowCtrl: _getCtrlForEventTarget<RowCtrl>(this.gos, target, RowCtrl.DOM_DATA_KEY_ROW_CTRL),
        };
    }

    private processKeyboardEvent(eventName: string, keyboardEvent: KeyboardEvent): void {
        const { cellCtrl, rowCtrl } = this.getControlsForEventTarget(keyboardEvent.target);

        if (keyboardEvent.defaultPrevented) {
            return;
        }
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

        const gridProcessingAllowed = !_isUserSuppressingKeyboardEvent(
            this.gos,
            keyboardEvent,
            rowNode,
            column,
            editing
        );

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

                if (_isEventFromPrintableCharacter(keyboardEvent)) {
                    cellCtrl.processCharacter(keyboardEvent);
                }
            }
        }

        if (eventName === 'keydown') {
            this.eventService.dispatchEvent(cellCtrl.createEvent(keyboardEvent, 'cellKeyDown'));
        }
    }

    private processFullWidthRowKeyboardEvent(rowComp: RowCtrl, eventName: string, keyboardEvent: KeyboardEvent) {
        const rowNode = rowComp.getRowNode();
        const focusedCell = this.focusService.getFocusedCell();
        const column = (focusedCell && focusedCell.column) as AgColumn;
        const gridProcessingAllowed = !_isUserSuppressingKeyboardEvent(this.gos, keyboardEvent, rowNode, column, false);

        if (gridProcessingAllowed) {
            const key = keyboardEvent.key;
            if (eventName === 'keydown') {
                switch (key) {
                    case KeyCode.PAGE_HOME:
                    case KeyCode.PAGE_END:
                    case KeyCode.PAGE_UP:
                    case KeyCode.PAGE_DOWN:
                        this.navigationService.handlePageScrollingKey(keyboardEvent, true);
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
            this.eventService.dispatchEvent(rowComp.createRowEvent('cellKeyDown', keyboardEvent));
        }
    }

    private doGridOperations(keyboardEvent: KeyboardEvent, editing: boolean): void {
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

        const keyCode = _normaliseQwertyAzerty(keyboardEvent);

        if (keyCode === KeyCode.A) {
            return this.onCtrlAndA(keyboardEvent);
        }
        if (keyCode === KeyCode.C) {
            return this.onCtrlAndC(keyboardEvent);
        }
        if (keyCode === KeyCode.D) {
            return this.onCtrlAndD(keyboardEvent);
        }
        if (keyCode === KeyCode.V) {
            return this.onCtrlAndV(keyboardEvent);
        }
        if (keyCode === KeyCode.X) {
            return this.onCtrlAndX(keyboardEvent);
        }
        if (keyCode === KeyCode.Y) {
            return this.onCtrlAndY();
        }
        if (keyCode === KeyCode.Z) {
            return this.onCtrlAndZ(keyboardEvent);
        }
    }

    private onCtrlAndA(event: KeyboardEvent): void {
        const { pinnedRowModel, rowModel, rangeService } = this;

        if (rangeService && rowModel.isRowsToRender()) {
            const [isEmptyPinnedTop, isEmptyPinnedBottom] = [
                pinnedRowModel?.isEmpty('top') ?? true,
                pinnedRowModel?.isEmpty('bottom') ?? true,
            ];

            const floatingStart: RowPinnedType = isEmptyPinnedTop ? null : 'top';
            let floatingEnd: RowPinnedType;
            let rowEnd: number;

            if (isEmptyPinnedBottom) {
                floatingEnd = null;
                rowEnd = rowModel.getRowCount() - 1;
            } else {
                floatingEnd = 'bottom';
                rowEnd = pinnedRowModel?.getPinnedBottomRowCount() ?? 0 - 1;
            }

            const allDisplayedColumns = this.visibleColsService.allCols;
            if (_missingOrEmpty(allDisplayedColumns)) {
                return;
            }

            rangeService.setCellRange({
                rowStartIndex: 0,
                rowStartPinned: floatingStart,
                rowEndIndex: rowEnd,
                rowEndPinned: floatingEnd,
                columnStart: allDisplayedColumns[0],
                columnEnd: _last(allDisplayedColumns),
            });
        }
        event.preventDefault();
    }

    private onCtrlAndC(event: KeyboardEvent): void {
        if (!this.clipboardService || this.gos.get('enableCellTextSelection')) {
            return;
        }

        const { cellCtrl, rowCtrl } = this.getControlsForEventTarget(event.target);

        if (cellCtrl?.isEditing() || rowCtrl?.isEditing()) {
            return;
        }

        event.preventDefault();
        this.clipboardService.copyToClipboard();
    }

    private onCtrlAndX(event: KeyboardEvent): void {
        if (
            !this.clipboardService ||
            this.gos.get('enableCellTextSelection') ||
            this.gos.get('suppressCutToClipboard')
        ) {
            return;
        }

        const { cellCtrl, rowCtrl } = this.getControlsForEventTarget(event.target);

        if (cellCtrl?.isEditing() || rowCtrl?.isEditing()) {
            return;
        }

        event.preventDefault();
        this.clipboardService.cutToClipboard(undefined, 'ui');
    }

    private onCtrlAndV(event: KeyboardEvent): void {
        const { cellCtrl, rowCtrl } = this.getControlsForEventTarget(event.target);

        if (cellCtrl?.isEditing() || rowCtrl?.isEditing()) {
            return;
        }
        if (this.clipboardService && !this.gos.get('suppressClipboardPaste')) {
            this.clipboardService.pasteFromClipboard();
        }
    }

    private onCtrlAndD(event: KeyboardEvent): void {
        if (this.clipboardService && !this.gos.get('suppressClipboardPaste')) {
            this.clipboardService.copyRangeDown();
        }
        event.preventDefault();
    }

    private onCtrlAndZ(event: KeyboardEvent): void {
        if (!this.gos.get('undoRedoCellEditing') || !this.undoRedoService) {
            return;
        }
        event.preventDefault();

        if (event.shiftKey) {
            this.undoRedoService.redo('ui');
        } else {
            this.undoRedoService.undo('ui');
        }
    }

    private onCtrlAndY(): void {
        this.undoRedoService?.redo('ui');
    }
}
