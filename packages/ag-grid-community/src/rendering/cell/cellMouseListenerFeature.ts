import { _isBrowserSafari } from '../../agStack/utils/browser';
import { _isElementChildOfClass, _isFocusableFormField } from '../../agStack/utils/dom';
import { isRowNumberCol } from '../../columns/columnUtils';
import type { CellClickedEvent, CellDoubleClickedEvent, CellMouseDownEvent } from '../../events';
import { _interpretAsRightClick } from '../../gridOptionsUtils';
import { _isStopPropagationForAgGrid } from '../../utils/gridEvent';
import { _suppressCellMouseEvent } from '../renderUtils';
import type { CellCtrl } from './cellCtrl';

export function _onCellMouseEvent(cellCtrl: CellCtrl, eventName: string, mouseEvent: MouseEvent): void {
    if (_isStopPropagationForAgGrid(mouseEvent)) {
        return;
    }

    switch (eventName) {
        case 'click':
            _onCellClicked(cellCtrl, mouseEvent);
            break;
        case 'pointerdown':
        case 'mousedown':
        case 'touchstart':
            _onMouseDown(cellCtrl, mouseEvent);
            break;
        case 'dblclick':
            _onCellDoubleClicked(cellCtrl, mouseEvent);
            break;
        case 'mouseout':
            _onMouseOut(cellCtrl, mouseEvent);
            break;
        case 'mouseover':
            _onMouseOver(cellCtrl, mouseEvent);
            break;
    }
}

function _onCellClicked(cellCtrl: CellCtrl, event: MouseEvent): void {
    if (cellCtrl.beans.touchSvc?.handleCellDoubleClick(cellCtrl, event)) {
        return;
    }

    const { eventSvc, rangeSvc, editSvc, editModelSvc, frameworkOverrides, gos } = cellCtrl.beans;
    const isMultiKey = event.ctrlKey || event.metaKey;
    const { column, cellPosition, rowNode } = cellCtrl;
    const suppressMouseEvent = _suppressCellMouseEvent(gos, column, rowNode, event);

    if (rangeSvc && isMultiKey && !suppressMouseEvent) {
        if (rangeSvc.getCellRangeCount(cellPosition) > 1) {
            rangeSvc.intersectLastRange(true);
        }
    }

    const cellClickedEvent: CellClickedEvent = cellCtrl.createEvent(event, 'cellClicked') as CellClickedEvent;
    cellClickedEvent.isEventHandlingSuppressed = suppressMouseEvent;
    eventSvc.dispatchEvent(cellClickedEvent);

    const colDef = column.getColDef();

    if (colDef.onCellClicked) {
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
        const editing = editSvc?.isEditing();
        const isRangeSelectionEnabledWhileEditing = editSvc?.isRangeSelectionEnabledWhileEditing();
        const cellValidations = editModelSvc?.getCellValidationModel().getCellValidationMap().size ?? 0;
        const rowValidations = editModelSvc?.getRowValidationModel().getRowValidationMap().size ?? 0;
        if (editing && (isRangeSelectionEnabledWhileEditing || cellValidations > 0 || rowValidations > 0)) {
            return;
        }

        if (editSvc?.shouldStartEditing(cellCtrl, event)) {
            editSvc?.startEditing(cellCtrl, { event });
        } else if (editSvc?.shouldStopEditing(cellCtrl, event)) {
            if (cellCtrl.beans.gos.get('editType') === 'fullRow') {
                editSvc?.stopEditing(cellCtrl, {
                    event,
                    source: 'edit',
                });
            } else {
                editSvc?.stopEditing(undefined, {
                    event,
                    source: 'edit',
                });
            }
        }
    }
}

export function _onCellDoubleClicked(cellCtrl: CellCtrl, event: MouseEvent): void {
    const { column, beans } = cellCtrl;
    const { eventSvc, frameworkOverrides, editSvc, editModelSvc, gos } = beans;

    const suppressMouseEvent = _suppressCellMouseEvent(gos, cellCtrl.column, cellCtrl.rowNode, event);

    const colDef = column.getColDef();
    const cellDoubleClickedEvent: CellDoubleClickedEvent = cellCtrl.createEvent(
        event,
        'cellDoubleClicked'
    ) as CellDoubleClickedEvent;
    cellDoubleClickedEvent.isEventHandlingSuppressed = suppressMouseEvent;
    eventSvc.dispatchEvent(cellDoubleClickedEvent);

    if (typeof colDef.onCellDoubleClicked === 'function') {
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
        const editing = editSvc?.isEditing();
        const isRangeSelectionEnabledWhileEditing = editSvc?.isRangeSelectionEnabledWhileEditing();
        const cellValidations = editModelSvc?.getCellValidationModel().getCellValidationMap().size ?? 0;
        const rowValidations = editModelSvc?.getRowValidationModel().getRowValidationMap().size ?? 0;
        if (editing && (isRangeSelectionEnabledWhileEditing || cellValidations > 0 || rowValidations > 0)) {
            return;
        }

        editSvc?.startEditing(cellCtrl, { event });
    }
}

function _onMouseDown(cellCtrl: CellCtrl, mouseEvent: MouseEvent): void {
    const { shiftKey } = mouseEvent;
    const target = mouseEvent.target as HTMLElement;
    const { beans } = cellCtrl;
    const { eventSvc, rangeSvc, rowNumbersSvc, focusSvc, gos, editSvc } = beans;
    const { column, rowNode, cellPosition } = cellCtrl;

    const suppressMouseEvent = _suppressCellMouseEvent(gos, column, rowNode, mouseEvent);

    const fireMouseDownEvent = () => {
        const cellMouseDownEvent = cellCtrl.createEvent(mouseEvent, 'cellMouseDown') as CellMouseDownEvent;
        cellMouseDownEvent.isEventHandlingSuppressed = suppressMouseEvent;
        eventSvc.dispatchEvent(cellMouseDownEvent);
    };

    if (suppressMouseEvent) {
        fireMouseDownEvent();
        return;
    }

    if (_isRightClickInExistingRange(cellCtrl, mouseEvent)) {
        return;
    }

    const hasRanges = rangeSvc && !rangeSvc.isEmpty();
    const containsWidget = _containsWidget(target);

    const isRowNumberColumn = isRowNumberCol(column);

    if (rowNumbersSvc && isRowNumberColumn && !rowNumbersSvc.handleMouseDownOnCell(cellPosition, mouseEvent)) {
        return;
    }

    if (!shiftKey || !hasRanges) {
        const editing = editSvc?.isEditing(cellCtrl);
        const isEnableCellTextSelection = gos.get('enableCellTextSelection');
        const shouldFocus = isEnableCellTextSelection && mouseEvent.defaultPrevented;
        const forceBrowserFocus =
            (_isBrowserSafari() || shouldFocus) && !editing && !_isFocusableFormField(target) && !containsWidget;

        cellCtrl.focusCell(forceBrowserFocus, mouseEvent);
    }

    if (shiftKey && hasRanges && !focusSvc.isCellFocused(cellPosition)) {
        mouseEvent.preventDefault();

        const focusedCell = focusSvc.getFocusedCell();
        if (focusedCell) {
            const { column, rowIndex, rowPinned } = focusedCell;
            const allowRangesWhileEditing = !!editSvc?.isRangeSelectionEnabledWhileEditing?.();

            if (editSvc?.isEditing(focusedCell) && !allowRangesWhileEditing) {
                editSvc?.stopEditing(focusedCell);
            }

            if (!allowRangesWhileEditing) {
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
    }

    if (containsWidget) {
        return;
    }

    rangeSvc?.handleCellMouseDown(mouseEvent, cellPosition);

    fireMouseDownEvent();
}

function _isRightClickInExistingRange(cellCtrl: CellCtrl, mouseEvent: MouseEvent): boolean {
    const { rangeSvc } = cellCtrl.beans;

    if (rangeSvc) {
        const cellInRange = rangeSvc.isCellInAnyRange(cellCtrl.cellPosition);
        const isRightClick = _interpretAsRightClick(cellCtrl.beans, mouseEvent);

        if (cellInRange && isRightClick) {
            return true;
        }
    }

    return false;
}

function _containsWidget(target: HTMLElement): boolean {
    return (
        _isElementChildOfClass(target, 'ag-selection-checkbox', 3) ||
        _isElementChildOfClass(target, 'ag-drag-handle', 3)
    );
}

function _onMouseOut(cellCtrl: CellCtrl, mouseEvent: MouseEvent): void {
    if (_mouseStayingInsideCell(cellCtrl, mouseEvent)) {
        return;
    }
    const { eventSvc, colHover } = cellCtrl.beans;
    eventSvc.dispatchEvent(cellCtrl.createEvent(mouseEvent, 'cellMouseOut'));
    colHover?.clearMouseOver();
}

function _onMouseOver(cellCtrl: CellCtrl, mouseEvent: MouseEvent): void {
    if (_mouseStayingInsideCell(cellCtrl, mouseEvent)) {
        return;
    }
    const { eventSvc, colHover } = cellCtrl.beans;
    eventSvc.dispatchEvent(cellCtrl.createEvent(mouseEvent, 'cellMouseOver'));
    colHover?.setMouseOver([cellCtrl.column]);
}

function _mouseStayingInsideCell(cellCtrl: CellCtrl, e: MouseEvent): boolean {
    if (!e.target || !e.relatedTarget) {
        return false;
    }
    const eCell = cellCtrl.eGui;
    const cellContainsTarget = eCell.contains(e.target as Node);
    const cellContainsRelatedTarget = eCell.contains(e.relatedTarget as Node);
    return cellContainsTarget && cellContainsRelatedTarget;
}
