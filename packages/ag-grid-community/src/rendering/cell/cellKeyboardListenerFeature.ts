import { KeyCode } from '../../agStack/constants/keyCode';
import { _isMacOsUserAgent } from '../../agStack/utils/browser';
import { isRowNumberCol } from '../../columns/columnUtils';
import { _populateModelValidationErrors } from '../../edit/utils/editors';
import type { AgColumn } from '../../entities/agColumn';
import { _isCellSelectionEnabled, _isRowSelection } from '../../gridOptionsUtils';
import type { DefaultProvidedCellEditorParams } from '../../interfaces/iCellEditor';
import type { CellCtrl } from './cellCtrl';

function _isDeleteKey(key: string, alwaysReturnFalseOnBackspace = false) {
    if (key === KeyCode.DELETE) {
        return true;
    }
    if (!alwaysReturnFalseOnBackspace && key === KeyCode.BACKSPACE) {
        return _isMacOsUserAgent();
    }
    return false;
}

export function _isCtrlEnter(e: KeyboardEvent): boolean {
    return (e.ctrlKey || e.metaKey) && e.key === KeyCode.ENTER;
}

export function _onCellKeyDown(cellCtrl: CellCtrl, event: KeyboardEvent): void {
    const key = event.key;

    if (
        key === KeyCode.ENTER &&
        isRowNumberCol(cellCtrl.column) &&
        cellCtrl.beans.rowNumbersSvc?.handleKeyDownOnCell(cellCtrl.cellPosition, event)
    ) {
        return;
    }

    switch (key) {
        case KeyCode.ENTER:
            _onEnterKeyDown(cellCtrl, event);
            break;
        case KeyCode.F2:
            _onF2KeyDown(cellCtrl, event);
            break;
        case KeyCode.ESCAPE:
            _onEscapeKeyDown(cellCtrl, event);
            break;
        case KeyCode.TAB:
            cellCtrl.beans.navigation?.onTabKeyDown(cellCtrl, event);
            break;
        case KeyCode.BACKSPACE:
        case KeyCode.DELETE:
            _onBackspaceOrDeleteKeyDown(cellCtrl, key, event);
            break;
        case KeyCode.DOWN:
        case KeyCode.UP:
        case KeyCode.RIGHT:
        case KeyCode.LEFT:
            _onNavigationKeyDown(cellCtrl, event, key);
            break;
    }
}

export function _processCharacter(cellCtrl: CellCtrl, event: KeyboardEvent): void {
    const eventTarget = event.target;
    const eventOnChildComponent = eventTarget !== cellCtrl.eGui;
    const { beans } = cellCtrl;
    const { editSvc } = beans;

    if (eventOnChildComponent) {
        return;
    }

    if (editSvc?.isEditing(cellCtrl, { withOpenEditor: true })) {
        return;
    }

    const key = event.key;
    if (key === KeyCode.SPACE) {
        _onSpaceKeyDown(cellCtrl, event);
    } else if (editSvc?.isCellEditable(cellCtrl, 'ui')) {
        if (editSvc?.hasValidationErrors() && !editSvc?.hasValidationErrors(cellCtrl)) {
            return;
        }

        editSvc?.startEditing(cellCtrl, { startedEdit: true, event, source: 'api', editable: true });

        const compDetails = cellCtrl.editCompDetails;
        const shouldPreventDefault = !(compDetails?.params as DefaultProvidedCellEditorParams)?.suppressPreventDefault;

        if (shouldPreventDefault) {
            event.preventDefault();
        }
    }
}

function _onSpaceKeyDown(cellCtrl: CellCtrl, event: KeyboardEvent): void {
    const { gos, editSvc } = cellCtrl.beans;

    if (!editSvc?.isEditing(cellCtrl, { withOpenEditor: true }) && _isRowSelection(gos)) {
        cellCtrl.beans.selectionSvc?.handleSelectionEvent(event, cellCtrl.rowNode, 'spaceKey');
    }

    event.preventDefault();
}

function _onNavigationKeyDown(cellCtrl: CellCtrl, event: KeyboardEvent, key: string): void {
    const { beans } = cellCtrl;
    if (beans.editSvc?.isEditing(cellCtrl, { withOpenEditor: true })) {
        return;
    }

    if (event.shiftKey && cellCtrl.isRangeSelectionEnabled()) {
        _onShiftRangeSelect(cellCtrl, event);
    } else {
        const currentCellPosition = cellCtrl.getFocusedCellPosition();
        beans.navigation?.navigateToNextCell(event, key, currentCellPosition, true);
    }

    event.preventDefault();
}

function _onShiftRangeSelect(cellCtrl: CellCtrl, event: KeyboardEvent): void {
    const { rangeSvc, navigation } = cellCtrl.beans;
    if (!rangeSvc) {
        return;
    }

    const endCell = rangeSvc.extendLatestRangeInDirection(event);

    if (!endCell) {
        return;
    }

    if (event.key === KeyCode.LEFT || event.key === KeyCode.RIGHT) {
        navigation?.ensureColumnVisible(endCell.column as AgColumn);
    } else {
        navigation?.ensureRowVisible(endCell.rowIndex);
    }
}

function _onBackspaceOrDeleteKeyDown(cellCtrl: CellCtrl, key: string, event: KeyboardEvent): void {
    const { beans, rowNode } = cellCtrl;
    const { gos, rangeSvc, eventSvc, editSvc } = beans;

    eventSvc.dispatchEvent({ type: 'keyShortcutChangedCellStart' });

    if (
        _isDeleteKey(key, gos.get('enableCellEditingOnBackspace')) &&
        !editSvc?.isEditing(cellCtrl, { withOpenEditor: true })
    ) {
        if (rangeSvc && _isCellSelectionEnabled(gos)) {
            rangeSvc.clearCellRangeCellValues({
                dispatchWrapperEvents: true,
                wrapperEventSource: 'deleteKey',
            });
        } else if (cellCtrl.isCellEditable()) {
            const deleteValue = beans.valueSvc.getDeleteValue(cellCtrl.column, rowNode);
            rowNode.setDataValue(cellCtrl.column, deleteValue, 'cellClear');
        }
    } else if (!editSvc?.isEditing(cellCtrl, { withOpenEditor: true })) {
        beans.editSvc?.startEditing(cellCtrl, { startedEdit: true, event });
    }

    eventSvc.dispatchEvent({ type: 'keyShortcutChangedCellEnd' });
}

function _onEnterKeyDown(cellCtrl: CellCtrl, event: KeyboardEvent): void {
    const { beans } = cellCtrl;
    const { editSvc, navigation } = beans;
    const cellEditing = editSvc?.isEditing(cellCtrl, { withOpenEditor: true });
    const rowNode = cellCtrl.rowNode;
    const rowEditing = editSvc?.isRowEditing(rowNode, { withOpenEditor: true });

    const startEditingAction = (ctrl: CellCtrl) => {
        const started = editSvc?.startEditing(ctrl, {
            startedEdit: true,
            event,
            source: 'edit',
        });
        if (started) {
            event.preventDefault();
        }
    };

    if (cellEditing || rowEditing) {
        if (_isCtrlEnter(event)) {
            editSvc?.applyBulkEdit(cellCtrl, beans?.rangeSvc?.getCellRanges() || []);
            return;
        }

        _populateModelValidationErrors(beans);

        if (editSvc?.checkNavWithValidation(undefined, event) === 'block-stop') {
            return;
        }

        if (editSvc?.isEditing(cellCtrl, { withOpenEditor: true })) {
            editSvc?.stopEditing(cellCtrl, {
                event,
                source: 'edit',
            });
        } else if (rowEditing && !cellCtrl.isCellEditable()) {
            editSvc?.stopEditing({ rowNode }, { event, source: 'edit' });
        } else {
            startEditingAction(cellCtrl);
        }
    } else if (beans.gos.get('enterNavigatesVertically')) {
        const key = event.shiftKey ? KeyCode.UP : KeyCode.DOWN;
        navigation?.navigateToNextCell(null, key, cellCtrl.cellPosition, false);
    } else {
        if (editSvc?.hasValidationErrors()) {
            return;
        }

        if (editSvc?.hasValidationErrors(cellCtrl)) {
            editSvc.revertSingleCellEdit(cellCtrl, true);
        }

        startEditingAction(cellCtrl);
    }
}

function _onF2KeyDown(cellCtrl: CellCtrl, event: KeyboardEvent): void {
    const { editSvc, notesSvc } = cellCtrl.beans;

    if (event.shiftKey && notesSvc?.hasDataSource()) {
        const access = notesSvc.getCellNoteAccess({ rowNode: cellCtrl.rowNode, column: cellCtrl.column });

        if (access) {
            if (!access.isSuppressed || access.canView) {
                notesSvc.showCellNote(access.params, true);
                event.preventDefault();
                return;
            }
        }
    }

    const editing = editSvc?.isEditing();

    if (editing) {
        _populateModelValidationErrors(cellCtrl.beans);

        if (editSvc?.checkNavWithValidation(undefined, event) === 'block-stop') {
            return;
        }
    }

    editSvc?.startEditing(cellCtrl, { startedEdit: true, event });
}

function _onEscapeKeyDown(cellCtrl: CellCtrl, event: KeyboardEvent): void {
    const { editSvc } = cellCtrl.beans;

    if (editSvc?.checkNavWithValidation(cellCtrl, event) === 'block-stop') {
        editSvc.revertSingleCellEdit(cellCtrl);
    }

    setTimeout(() => {
        editSvc?.stopEditing(cellCtrl, {
            event,
            cancel: true,
        });
    });
}
