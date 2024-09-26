import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { CellClickedEvent, CellDoubleClickedEvent } from '../../events';
import { _isBrowserSafari, _isIOSUserAgent } from '../../utils/browser';
import { _isElementChildOfClass, _isFocusableFormField } from '../../utils/dom';
import { _isEventSupported, _isStopPropagationForAgGrid } from '../../utils/event';
import type { CellCtrl } from './cellCtrl';

export class CellMouseListenerFeature extends BeanStub {
    private readonly cellCtrl: CellCtrl;
    private readonly beans: BeanCollection;
    private readonly column: AgColumn;

    private lastIPadMouseClickEvent: number;

    constructor(ctrl: CellCtrl, beans: BeanCollection, column: AgColumn) {
        super();
        this.cellCtrl = ctrl;
        this.beans = beans;
        this.column = column;
    }

    public onMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        if (_isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }

        switch (eventName) {
            case 'click':
                this.onCellClicked(mouseEvent);
                break;
            case 'mousedown':
            case 'touchstart':
                this.onMouseDown(mouseEvent);
                break;
            case 'dblclick':
                this.onCellDoubleClicked(mouseEvent);
                break;
            case 'mouseout':
                this.onMouseOut(mouseEvent);
                break;
            case 'mouseover':
                this.onMouseOver(mouseEvent);
                break;
        }
    }

    private onCellClicked(mouseEvent: MouseEvent): void {
        // iPad doesn't have double click - so we need to mimic it to enable editing for iPad.
        if (this.isDoubleClickOnIPad()) {
            this.onCellDoubleClicked(mouseEvent);
            mouseEvent.preventDefault(); // if we don't do this, then iPad zooms in

            return;
        }

        const { eventService, rangeService, gos } = this.beans;
        const isMultiKey = mouseEvent.ctrlKey || mouseEvent.metaKey;

        if (rangeService && isMultiKey) {
            // the mousedown event has created the range already, so we only intersect if there is more than one
            // range on this cell
            if (rangeService.getCellRangeCount(this.cellCtrl.getCellPosition()) > 1) {
                rangeService.intersectLastRange(true);
            }
        }

        const cellClickedEvent: CellClickedEvent = this.cellCtrl.createEvent(mouseEvent, 'cellClicked');
        eventService.dispatchEvent(cellClickedEvent);

        const colDef = this.column.getColDef();

        if (colDef.onCellClicked) {
            // to make callback async, do in a timeout
            window.setTimeout(() => {
                this.beans.frameworkOverrides.wrapOutgoing(() => {
                    colDef.onCellClicked!(cellClickedEvent);
                });
            }, 0);
        }

        const editOnSingleClick =
            (gos.get('singleClickEdit') || colDef.singleClickEdit) && !gos.get('suppressClickEdit');

        // edit on single click, but not if extending a range
        if (editOnSingleClick && !(mouseEvent.shiftKey && rangeService?.getCellRanges().length != 0)) {
            this.cellCtrl.startRowOrCellEdit();
        }
    }

    // returns true if on iPad and this is second 'click' event in 200ms
    private isDoubleClickOnIPad(): boolean {
        if (!_isIOSUserAgent() || _isEventSupported('dblclick')) {
            return false;
        }

        const nowMillis = new Date().getTime();
        const res = nowMillis - this.lastIPadMouseClickEvent < 200;
        this.lastIPadMouseClickEvent = nowMillis;

        return res;
    }

    private onCellDoubleClicked(mouseEvent: MouseEvent) {
        const { column, beans, cellCtrl } = this;
        const { eventService, frameworkOverrides, gos } = beans;

        const colDef = column.getColDef();
        // always dispatch event to eventService
        const cellDoubleClickedEvent: CellDoubleClickedEvent = cellCtrl.createEvent(mouseEvent, 'cellDoubleClicked');
        eventService.dispatchEvent(cellDoubleClickedEvent);

        // check if colDef also wants to handle event
        if (typeof colDef.onCellDoubleClicked === 'function') {
            // to make the callback async, do in a timeout
            window.setTimeout(() => {
                frameworkOverrides.wrapOutgoing(() => {
                    (colDef.onCellDoubleClicked as any)(cellDoubleClickedEvent);
                });
            }, 0);
        }

        const editOnDoubleClick = !gos.get('singleClickEdit') && !gos.get('suppressClickEdit');
        if (editOnDoubleClick) {
            cellCtrl.startRowOrCellEdit(null, mouseEvent);
        }
    }

    private onMouseDown(mouseEvent: MouseEvent): void {
        const { ctrlKey, metaKey, shiftKey } = mouseEvent;
        const target = mouseEvent.target as HTMLElement;
        const { cellCtrl, beans } = this;
        const { eventService, rangeService, focusService, gos } = beans;

        // do not change the range for right-clicks inside an existing range
        if (this.isRightClickInExistingRange(mouseEvent)) {
            return;
        }

        const ranges = rangeService && rangeService.getCellRanges().length != 0;

        if (!shiftKey || !ranges) {
            const isEnableCellTextSelection = gos.get('enableCellTextSelection');
            // when `enableCellTextSelection` is true, we call prevent default on `mousedown`
            // within the row dragger to block text selection while dragging, but the cell
            // should still be selected/focused.
            const shouldFocus = isEnableCellTextSelection && mouseEvent.defaultPrevented;
            // however, this should never be true if the mousedown was triggered
            // due to a click on a cell editor for example, otherwise cell selection within
            // an editor would be blocked.
            const forceBrowserFocus =
                (_isBrowserSafari() || shouldFocus) && !cellCtrl.isEditing() && !_isFocusableFormField(target);

            cellCtrl.focusCell(forceBrowserFocus);
        }

        // if shift clicking, and a range exists, we keep the focus on the cell that started the
        // range as the user then changes the range selection.
        if (shiftKey && ranges && !focusService.isCellFocused(cellCtrl.getCellPosition())) {
            // this stops the cell from getting focused
            mouseEvent.preventDefault();

            const focusedCellPosition = focusService.getFocusedCell();
            if (focusedCellPosition) {
                const { column, rowIndex, rowPinned } = focusedCellPosition;
                const focusedRowCtrl = beans.rowRenderer.getRowByPosition({ rowIndex, rowPinned });
                const focusedCellCtrl = focusedRowCtrl?.getCellCtrl(column as AgColumn);

                // if the focused cell is editing, need to stop editing first
                if (focusedCellCtrl?.isEditing()) {
                    focusedCellCtrl.stopEditing();
                }

                // focus could have been lost, so restore it to the starting cell in the range if needed
                focusService.setFocusedCell({
                    column,
                    rowIndex,
                    rowPinned,
                    forceBrowserFocus: true,
                    preventScrollOnBrowserFocus: true,
                });
            }
        }

        // if we are clicking on a checkbox, we need to make sure the cell wrapping that checkbox
        // is focused but we don't want to change the range selection, so return here.
        if (this.containsWidget(target)) {
            return;
        }

        if (rangeService) {
            const thisCell = this.cellCtrl.getCellPosition();

            if (shiftKey) {
                rangeService.extendLatestRangeToCell(thisCell);
            } else {
                const isMultiKey = ctrlKey || metaKey;
                rangeService.setRangeToCell(thisCell, isMultiKey);
            }
        }

        eventService.dispatchEvent(this.cellCtrl.createEvent(mouseEvent, 'cellMouseDown'));
    }

    private isRightClickInExistingRange(mouseEvent: MouseEvent): boolean {
        const { rangeService } = this.beans;

        if (rangeService) {
            const cellInRange = rangeService.isCellInAnyRange(this.cellCtrl.getCellPosition());
            const isRightClick =
                mouseEvent.button === 2 || (mouseEvent.ctrlKey && this.beans.gos.get('allowContextMenuWithControlKey'));

            if (cellInRange && isRightClick) {
                return true;
            }
        }

        return false;
    }

    private containsWidget(target: HTMLElement): boolean {
        return _isElementChildOfClass(target, 'ag-selection-checkbox', 3);
    }

    private onMouseOut(mouseEvent: MouseEvent): void {
        if (this.mouseStayingInsideCell(mouseEvent)) {
            return;
        }
        this.beans.eventService.dispatchEvent(this.cellCtrl.createEvent(mouseEvent, 'cellMouseOut'));
        this.beans.columnHoverService?.clearMouseOver();
    }

    private onMouseOver(mouseEvent: MouseEvent): void {
        if (this.mouseStayingInsideCell(mouseEvent)) {
            return;
        }
        this.beans.eventService.dispatchEvent(this.cellCtrl.createEvent(mouseEvent, 'cellMouseOver'));
        this.beans.columnHoverService?.setMouseOver([this.column]);
    }

    private mouseStayingInsideCell(e: MouseEvent): boolean {
        if (!e.target || !e.relatedTarget) {
            return false;
        }
        const eGui = this.cellCtrl.getGui();
        const cellContainsTarget = eGui.contains(e.target as Node);
        const cellContainsRelatedTarget = eGui.contains(e.relatedTarget as Node);
        return cellContainsTarget && cellContainsRelatedTarget;
    }

    public override destroy(): void {
        super.destroy();
    }
}
