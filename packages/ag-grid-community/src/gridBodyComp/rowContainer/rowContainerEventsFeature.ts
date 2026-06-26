import {
    KeyCode,
    _isEventFromPrintableCharacter,
    _isEventFromThisInstance,
    _isEventSupported,
    _normaliseQwertyAzerty,
} from 'ag-stack';

import { BeanStub } from '../../context/beanStub';
import type { EditService } from '../../edit/editService';
import type { AgColumn } from '../../entities/agColumn';
import { _getCtrlASelectsRows, _getSelectAll, _isCellSelectionEnabled, _isRowSelection } from '../../gridOptionsUtils';
import type { IClipboardService } from '../../interfaces/iClipboardService';
import type { GetNoteParams } from '../../interfaces/notes';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import { _getCellCtrlForEventTarget, _getRowCtrlForEventTarget } from '../../rendering/renderUtils';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import type { UndoRedoService } from '../../undoRedo/undoRedoService';
import { _isStopPropagationForAgGrid } from '../../utils/gridEvent';
import { _isUserSuppressingKeyboardEvent } from '../../utils/keyboardEvent';
import { _selectAllCells } from '../../utils/selection';

export class RowContainerEventsFeature extends BeanStub {
    private editSvc?: EditService;

    constructor(public readonly element: HTMLElement) {
        super();
    }

    public postConstruct(): void {
        this.addKeyboardListeners();
        this.addMouseListeners();
        this.beans.touchSvc?.mockRowContextMenu(this);
        this.editSvc = this.beans.editSvc;
    }

    private addKeyboardListeners(): void {
        const eventName = 'keydown';
        const listener = this.processKeyboardEvent.bind(this, eventName);
        this.addManagedElementListeners(this.element, { [eventName]: listener });
    }

    private addMouseListeners(): void {
        let mouseDownEvent = 'mousedown';
        if (_isEventSupported('pointerdown')) {
            mouseDownEvent = 'pointerdown';
        } else if (_isEventSupported('touchstart')) {
            mouseDownEvent = 'touchstart';
        }
        const eventNames = ['dblclick', 'contextmenu', 'mouseover', 'mouseout', 'click', mouseDownEvent];

        for (const eventName of eventNames) {
            const listener = this.processMouseEvent.bind(this, eventName);
            this.addManagedElementListeners(this.element, { [eventName]: listener });
        }
    }

    private processMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        if (!_isEventFromThisInstance(this.beans, mouseEvent) || _isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }

        const { cellCtrl, rowCtrl } = this.getControlsForEventTarget(mouseEvent.target);

        if (eventName === 'contextmenu') {
            if (!cellCtrl && !rowCtrl) {
                return;
            }
            if (cellCtrl?.column) {
                cellCtrl.dispatchCellContextMenuEvent(mouseEvent);
            }
            this.beans.contextMenuSvc?.handleContextMenuMouseEvent(mouseEvent, undefined, rowCtrl, cellCtrl);
        } else {
            if (cellCtrl) {
                cellCtrl.onMouseEvent(eventName, mouseEvent);
            }
            if (rowCtrl) {
                rowCtrl.onMouseEvent(eventName, mouseEvent);
            }
        }
    }

    public getControlsForEventTarget(target: EventTarget | null): {
        cellCtrl: CellCtrl | null;
        rowCtrl: RowCtrl | null;
    } {
        const { gos } = this;
        return {
            cellCtrl: _getCellCtrlForEventTarget(gos, target),
            rowCtrl: _getRowCtrlForEventTarget(gos, target),
        };
    }

    private processKeyboardEvent(eventName: string, keyboardEvent: KeyboardEvent): void {
        const { cellCtrl, rowCtrl } = this.getControlsForEventTarget(keyboardEvent.target);

        if (keyboardEvent.defaultPrevented) {
            return;
        }
        if (cellCtrl) {
            this.processCellKeyboardEvent(cellCtrl, eventName, keyboardEvent);
        } else if (rowCtrl?.isFullWidth()) {
            this.processFullWidthRowKeyboardEvent(rowCtrl, eventName, keyboardEvent);
        }
    }

    private processCellKeyboardEvent(cellCtrl: CellCtrl, eventName: string, keyboardEvent: KeyboardEvent): void {
        const editing = this.editSvc?.isEditing(cellCtrl, { withOpenEditor: true }) ?? false;

        const gridProcessingAllowed = !_isUserSuppressingKeyboardEvent(
            this.gos,
            keyboardEvent,
            cellCtrl.rowNode,
            cellCtrl.column,
            editing
        );

        if (gridProcessingAllowed) {
            if (eventName === 'keydown') {
                // first see if it's a scroll key, page up / down, home / end etc
                const wasScrollKey = !editing && this.beans.navigation?.handlePageScrollingKey(keyboardEvent);

                // if not a scroll key, then we pass onto cell
                if (!wasScrollKey) {
                    cellCtrl.onKeyDown(keyboardEvent);
                }

                // perform clipboard and undo / redo operations
                this.doGridOperations(keyboardEvent, editing);

                if (_isEventFromPrintableCharacter(keyboardEvent)) {
                    cellCtrl.processCharacter(keyboardEvent);
                }
            }
        }

        if (eventName === 'keydown') {
            this.eventSvc.dispatchEvent(cellCtrl.createEvent(keyboardEvent, 'cellKeyDown'));
        }
    }

    private processFullWidthRowKeyboardEvent(rowCtrl: RowCtrl, eventName: string, keyboardEvent: KeyboardEvent) {
        const { rowNode } = rowCtrl;
        const focusedCell = this.beans.focusSvc.getFocusedCell();
        const column = focusedCell?.column as AgColumn;
        const gridProcessingAllowed = !_isUserSuppressingKeyboardEvent(this.gos, keyboardEvent, rowNode, column, false);

        if (gridProcessingAllowed && eventName === 'keydown') {
            this.processFullWidthRowKeyDown(rowCtrl, keyboardEvent, column);
        }

        if (eventName === 'keydown') {
            this.eventSvc.dispatchEvent(rowCtrl.createRowEvent('cellKeyDown', keyboardEvent));
        }
    }

    private processFullWidthRowKeyDown(
        rowCtrl: RowCtrl,
        keyboardEvent: KeyboardEvent,
        focusedColumn: AgColumn | undefined
    ): void {
        switch (keyboardEvent.key) {
            case KeyCode.PAGE_HOME:
            case KeyCode.PAGE_END:
            case KeyCode.PAGE_UP:
            case KeyCode.PAGE_DOWN:
                this.beans.navigation?.handlePageScrollingKey(keyboardEvent, true);
                return;

            case KeyCode.LEFT:
            case KeyCode.RIGHT:
                if (!this.gos.get('embedFullWidthRows')) {
                    return;
                }
            /* eslint-ignore: no-fallthrough */
            case KeyCode.UP:
            case KeyCode.DOWN:
                rowCtrl.onKeyboardNavigate(keyboardEvent);
                return;

            case KeyCode.F2:
                this.processFullWidthRowNoteShortcut(rowCtrl, keyboardEvent, focusedColumn, this.beans.notesSvc);
                return;

            case KeyCode.TAB:
                rowCtrl.onTabKeyDown(keyboardEvent);
                return;

            case KeyCode.SPACE:
                // leave SPACE to interactive controls inside custom full-width renderers (mirrors the cell path)
                if (keyboardEvent.target !== rowCtrl.getCurrentRowElement()) {
                    return;
                }
                if (_isRowSelection(this.gos)) {
                    this.beans.selectionSvc?.handleSelectionEvent(keyboardEvent, rowCtrl.rowNode, 'spaceKey');
                }
                keyboardEvent.preventDefault();
                return;

            default:
        }
    }

    private processFullWidthRowNoteShortcut(
        rowCtrl: RowCtrl,
        keyboardEvent: KeyboardEvent,
        focusedColumn: AgColumn | undefined,
        notesSvc = this.beans.notesSvc
    ): void {
        if (!keyboardEvent.shiftKey || !notesSvc?.hasDataSource()) {
            return;
        }

        const rowNode = rowCtrl.rowNode;
        const fullWidthInfo = rowCtrl.findInfoForEvent(keyboardEvent);

        let noteParams: GetNoteParams | undefined;

        if (fullWidthInfo) {
            const { pinned } = fullWidthInfo;
            noteParams = {
                rowNode,
                location: 'fullWidthRow' as const,
                pinned: pinned === 'left' || pinned === 'right' ? pinned : undefined,
            };
        } else if (focusedColumn) {
            noteParams = { rowNode, column: focusedColumn };
        }

        if (!noteParams) {
            return;
        }

        const access = notesSvc.getNoteAccess(noteParams);

        if (!access) {
            return;
        }

        if (!access.isSuppressed || access.canView) {
            notesSvc.showNote(access.params, true);
            keyboardEvent.preventDefault();
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
        if (!_isEventFromThisInstance(this.beans, keyboardEvent)) {
            return;
        }

        const keyCode = _normaliseQwertyAzerty(keyboardEvent);

        const { clipboardSvc, undoRedo } = this.beans;

        if (keyCode === KeyCode.A) {
            return this.onCtrlAndA(keyboardEvent);
        }
        if (keyCode === KeyCode.C) {
            return this.onCtrlAndC(clipboardSvc, keyboardEvent);
        }
        if (keyCode === KeyCode.D) {
            return this.onCtrlAndD(clipboardSvc, keyboardEvent);
        }
        if (keyCode === KeyCode.V) {
            return this.onCtrlAndV(clipboardSvc, keyboardEvent);
        }
        if (keyCode === KeyCode.X) {
            return this.onCtrlAndX(clipboardSvc, keyboardEvent);
        }
        if (keyCode === KeyCode.Y) {
            return this.onCtrlAndY(undoRedo);
        }
        if (keyCode === KeyCode.Z) {
            return this.onCtrlAndZ(undoRedo, keyboardEvent);
        }
    }

    private onCtrlAndA(event: KeyboardEvent): void {
        const {
            beans: { rowModel, rangeSvc, selectionSvc },
            gos,
        } = this;

        if (rangeSvc && _isCellSelectionEnabled(gos) && !_getCtrlASelectsRows(gos) && rowModel.isRowsToRender()) {
            _selectAllCells(this.beans);
        } else if (selectionSvc) {
            selectionSvc.selectAllRowNodes({ source: 'keyboardSelectAll', selectAll: _getSelectAll(gos) });
        }

        event.preventDefault();
    }

    private onCtrlAndC(clipboardSvc: IClipboardService | undefined, event: KeyboardEvent): void {
        if (!clipboardSvc || this.gos.get('enableCellTextSelection')) {
            return;
        }

        const { cellCtrl } = this.getControlsForEventTarget(event.target);

        if (this.editSvc?.isEditing(cellCtrl, { withOpenEditor: true })) {
            return;
        }

        event.preventDefault();
        clipboardSvc.copyToClipboard();
    }

    private onCtrlAndX(clipboardSvc: IClipboardService | undefined, event: KeyboardEvent): void {
        if (!clipboardSvc || this.gos.get('enableCellTextSelection') || this.gos.get('suppressCutToClipboard')) {
            return;
        }

        const { cellCtrl } = this.getControlsForEventTarget(event.target);

        if (this.editSvc?.isEditing(cellCtrl, { withOpenEditor: true })) {
            return;
        }

        event.preventDefault();
        clipboardSvc.cutToClipboard(undefined, 'ui');
    }

    private onCtrlAndV(clipboardSvc: IClipboardService | undefined, event: KeyboardEvent): void {
        const { cellCtrl } = this.getControlsForEventTarget(event.target);

        if (this.editSvc?.isEditing(cellCtrl, { withOpenEditor: true })) {
            return;
        }

        if (clipboardSvc && !this.gos.get('suppressClipboardPaste')) {
            clipboardSvc.pasteFromClipboard();
        }
    }

    private onCtrlAndD(clipboardSvc: IClipboardService | undefined, event: KeyboardEvent): void {
        if (clipboardSvc && !this.gos.get('suppressClipboardPaste')) {
            clipboardSvc.copyRangeDown();
        }
        event.preventDefault();
    }

    private onCtrlAndZ(undoRedo: UndoRedoService | undefined, event: KeyboardEvent): void {
        if (!this.gos.get('undoRedoCellEditing') || !undoRedo) {
            return;
        }
        event.preventDefault();

        if (event.shiftKey) {
            undoRedo.redo('ui');
        } else {
            undoRedo.undo('ui');
        }
    }

    private onCtrlAndY(undoRedo: UndoRedoService | undefined): void {
        undoRedo?.redo('ui');
    }
}
