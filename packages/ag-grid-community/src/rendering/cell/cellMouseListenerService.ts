import { _isBrowserSafari } from '../../agStack/utils/browser';
import { _isElementChildOfClass, _isFocusableFormField } from '../../agStack/utils/dom';
import { isRowNumberCol } from '../../columns/columnUtils';
import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { CellClickedEvent, CellDoubleClickedEvent, CellMouseDownEvent } from '../../events';
import { _interpretAsRightClick } from '../../gridOptionsUtils';
import type { IEditModelService } from '../../interfaces/iEditModelService';
import type { IEditService } from '../../interfaces/iEditService';
import { _isStopPropagationForAgGrid } from '../../utils/gridEvent';
import { _suppressCellMouseEvent } from '../renderUtils';
import type { CellCtrl } from './cellCtrl';

export class CellMouseListenerService extends BeanStub implements NamedBean {
    beanName = 'cellMouseSvc' as const;

    public onMouseEvent(cellCtrl: CellCtrl, eventName: string, mouseEvent: MouseEvent): void {
        if (_isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }

        switch (eventName) {
            case 'click':
                this.onCellClicked(cellCtrl, mouseEvent);
                break;
            case 'mousedown':
            case 'touchstart':
                this.onMouseDown(cellCtrl, mouseEvent);
                break;
            case 'dblclick':
                this.onCellDoubleClicked(cellCtrl, mouseEvent);
                break;
            case 'mouseout':
                this.onMouseOut(cellCtrl, mouseEvent);
                break;
            case 'mouseover':
                this.onMouseOver(cellCtrl, mouseEvent);
                break;
        }
    }

    private onCellClicked(cellCtrl: CellCtrl, event: MouseEvent): void {
        const { eventSvc, rangeSvc, editSvc, editModelSvc, frameworkOverrides, gos, touchSvc } = this.beans;
        // iPad doesn't have double click - so we need to mimic it to enable editing for iPad.
        if (touchSvc?.handleCellDoubleClick(this, cellCtrl, event)) {
            return;
        }

        const isMultiKey = event.ctrlKey || event.metaKey;
        const { column, cellPosition, rowNode } = cellCtrl;
        const suppressMouseEvent = _suppressCellMouseEvent(gos, column, rowNode, event);

        if (rangeSvc && isMultiKey && !suppressMouseEvent) {
            // the mousedown event has created the range already, so we only intersect if there is more than one
            // range on this cell
            if (rangeSvc.getCellRangeCount(cellPosition) > 1) {
                rangeSvc.intersectLastRange(true);
            }
        }

        const cellClickedEvent: CellClickedEvent = cellCtrl.createEvent(event, 'cellClicked') as CellClickedEvent;
        cellClickedEvent.isEventHandlingSuppressed = suppressMouseEvent;
        eventSvc.dispatchEvent(cellClickedEvent);

        const colDef = column.getColDef();

        if (colDef.onCellClicked) {
            // to make callback async, do in a timeout
            window.setTimeout(() => {
                frameworkOverrides.wrapOutgoing(() => {
                    colDef.onCellClicked!(cellClickedEvent);
                });
            }, 0);
        }

        if (suppressMouseEvent) {
            return;
        }

        if (editModelSvc?.getState(cellCtrl) !== 'editing') {
            if (isEditingWithValidations(editSvc, editModelSvc)) {
                return;
            }

            if (editSvc?.shouldStartEditing(cellCtrl, event)) {
                editSvc?.startEditing(cellCtrl, { event });
            } else if (editSvc?.shouldStopEditing(cellCtrl, event)) {
                if (this.beans.gos.get('editType') === 'fullRow') {
                    editSvc?.stopEditing(cellCtrl, {
                        event,
                        source: 'edit',
                    });
                } else {
                    // stop all editing
                    editSvc?.stopEditing(undefined, {
                        event,
                        source: 'edit',
                    });
                }
            }
        }
    }

    public onCellDoubleClicked(cellCtrl: CellCtrl, event: MouseEvent) {
        const { eventSvc, frameworkOverrides, editSvc, editModelSvc, gos } = this.beans;
        const { column, rowNode } = cellCtrl;
        const suppressMouseEvent = _suppressCellMouseEvent(gos, column, rowNode, event);

        const colDef = column.getColDef();
        // always dispatch event to eventService
        const cellDoubleClickedEvent: CellDoubleClickedEvent = cellCtrl.createEvent(
            event,
            'cellDoubleClicked'
        ) as CellDoubleClickedEvent;
        cellDoubleClickedEvent.isEventHandlingSuppressed = suppressMouseEvent;
        eventSvc.dispatchEvent(cellDoubleClickedEvent);

        // check if colDef also wants to handle event
        if (typeof colDef.onCellDoubleClicked === 'function') {
            // to make the callback async, do in a timeout
            window.setTimeout(() => {
                frameworkOverrides.wrapOutgoing(() => {
                    (colDef.onCellDoubleClicked as any)(cellDoubleClickedEvent);
                });
            }, 0);
        }
        if (suppressMouseEvent) {
            return;
        }

        if (editSvc?.shouldStartEditing(cellCtrl, event) && editModelSvc?.getState(cellCtrl) !== 'editing') {
            if (isEditingWithValidations(editSvc, editModelSvc)) {
                return;
            }

            editSvc?.startEditing(cellCtrl, { event });
        }
    }

    private onMouseDown(cellCtrl: CellCtrl, mouseEvent: MouseEvent): void {
        const { ctrlKey, metaKey, shiftKey } = mouseEvent;
        const target = mouseEvent.target as HTMLElement;
        const { eventSvc, rangeSvc, rowNumbersSvc, focusSvc, gos, editSvc } = this.beans;
        const { column, rowNode, cellPosition } = cellCtrl;

        const suppressMouseEvent = _suppressCellMouseEvent(gos, column, rowNode, mouseEvent);

        const fireMouseDownEvent = () => {
            const cellMouseDownEvent = cellCtrl.createEvent(mouseEvent, 'cellMouseDown') as CellMouseDownEvent;
            cellMouseDownEvent.isEventHandlingSuppressed = suppressMouseEvent;
            eventSvc.dispatchEvent(cellMouseDownEvent);
        };

        if (suppressMouseEvent) {
            // suppress just prevents grid handling. Events are still passed to users (with suppress property value)
            fireMouseDownEvent();
            return;
        }

        // do not change the range for right-clicks inside an existing range
        if (this.isRightClickInExistingRange(cellCtrl, mouseEvent)) {
            return;
        }

        const hasRanges = rangeSvc && !rangeSvc.isEmpty();
        const containsWidget = this.containsWidget(target);

        const isRowNumberColumn = isRowNumberCol(column);

        if (rowNumbersSvc && isRowNumberColumn && !rowNumbersSvc.handleMouseDownOnCell(cellPosition, mouseEvent)) {
            if (rangeSvc) {
                mouseEvent.preventDefault();
            }
            mouseEvent.stopImmediatePropagation();
            return;
        }

        if (!shiftKey || !hasRanges) {
            const editing = editSvc?.isEditing(cellCtrl);
            const isEnableCellTextSelection = gos.get('enableCellTextSelection');
            // when `enableCellTextSelection` is true, we call prevent default on `mousedown`
            // within the row dragger to block text selection while dragging, but the cell
            // should still be selected/focused.
            const shouldFocus = isEnableCellTextSelection && mouseEvent.defaultPrevented;
            // however, this should never be true if the mousedown was triggered
            // due to a click on a cell editor for example, otherwise cell selection within
            // an editor would be blocked.
            const forceBrowserFocus =
                (_isBrowserSafari() || shouldFocus) && !editing && !_isFocusableFormField(target) && !containsWidget;

            cellCtrl.focusCell(forceBrowserFocus, mouseEvent);
        }

        // if shift clicking, and a range exists, we keep the focus on the cell that started the
        // range as the user then changes the range selection.
        if (shiftKey && hasRanges && !focusSvc.isCellFocused(cellPosition)) {
            // this stops the cell from getting focused
            mouseEvent.preventDefault();

            const focusedCell = focusSvc.getFocusedCell();
            if (focusedCell) {
                const { column, rowIndex, rowPinned } = focusedCell;

                // if the focused cell is editing, need to stop editing first
                if (editSvc?.isEditing(focusedCell)) {
                    editSvc?.stopEditing(focusedCell);
                }

                // focus could have been lost, so restore it to the starting cell in the range if needed
                focusSvc.setFocusedCell({
                    column,
                    rowIndex,
                    rowPinned,
                    forceBrowserFocus: true,
                    preventScrollOnBrowserFocus: true,
                    sourceEvent: mouseEvent,
                });
            }
        }

        // if we are clicking on a checkbox, we need to make sure the cell wrapping that checkbox
        // is focused but we don't want to change the range selection, so return here.
        if (containsWidget) {
            return;
        }

        if (rangeSvc) {
            if (isRowNumberColumn) {
                mouseEvent.preventDefault();
            }
            const hasRightClickedOnRowNumber = _interpretAsRightClick(this.beans, mouseEvent) && isRowNumberColumn;
            if (shiftKey) {
                rangeSvc.extendLatestRangeToCell(cellPosition);
            } else if (!hasRightClickedOnRowNumber) {
                const isMultiKey = ctrlKey || metaKey;
                rangeSvc.setRangeToCell(cellPosition, isMultiKey);
            }
        }

        fireMouseDownEvent();
    }

    private isRightClickInExistingRange(cellCtrl: CellCtrl, mouseEvent: MouseEvent): boolean {
        const { rangeSvc } = this.beans;

        if (rangeSvc) {
            const cellInRange = rangeSvc.isCellInAnyRange(cellCtrl.cellPosition);
            const isRightClick = _interpretAsRightClick(this.beans, mouseEvent);

            if (cellInRange && isRightClick) {
                return true;
            }
        }

        return false;
    }

    private containsWidget(target: HTMLElement): boolean {
        return (
            _isElementChildOfClass(target, 'ag-selection-checkbox', 3) ||
            _isElementChildOfClass(target, 'ag-drag-handle', 3)
        );
    }

    private onMouseOut(cellCtrl: CellCtrl, mouseEvent: MouseEvent): void {
        if (this.mouseStayingInsideCell(cellCtrl, mouseEvent)) {
            return;
        }
        const { eventSvc, colHover } = this.beans;
        eventSvc.dispatchEvent(cellCtrl.createEvent(mouseEvent, 'cellMouseOut'));
        colHover?.clearMouseOver();
    }

    private onMouseOver(cellCtrl: CellCtrl, mouseEvent: MouseEvent): void {
        if (this.mouseStayingInsideCell(cellCtrl, mouseEvent)) {
            return;
        }
        const { eventSvc, colHover } = this.beans;
        eventSvc.dispatchEvent(cellCtrl.createEvent(mouseEvent, 'cellMouseOver'));
        colHover?.setMouseOver([cellCtrl.column]);
    }

    private mouseStayingInsideCell(cellCtrl: CellCtrl, e: MouseEvent): boolean {
        if (!e.target || !e.relatedTarget) {
            return false;
        }
        const eCell = cellCtrl.eGui;
        return eCell.contains(e.target as Node) && eCell.contains(e.relatedTarget as Node);
    }
}

function isEditingWithValidations(
    editSvc: IEditService | undefined,
    editModelSvc: IEditModelService | undefined
): boolean | undefined {
    const editing = editSvc?.isEditing();
    const cellValidations = editModelSvc?.getCellValidationModel().getCellValidationMap().size ?? 0;
    const rowValidations = editModelSvc?.getRowValidationModel().getRowValidationMap().size ?? 0;
    return editing && (cellValidations > 0 || rowValidations > 0);
}
