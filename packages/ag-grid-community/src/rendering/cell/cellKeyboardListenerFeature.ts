import { KeyCode, _isMacOsUserAgent } from 'ag-stack';

import { isRowNumberCol } from '../../columns/columnUtils';
import type { BeanCollection } from '../../context/context';
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

export function _onCellKeyDown(beans: BeanCollection, cellCtrl: CellCtrl, event: KeyboardEvent): void {
    const key = event.key;

    // delegate Enter on Row Number cells to the RowNumbersService
    if (
        key === KeyCode.ENTER &&
        isRowNumberCol(cellCtrl.column) &&
        beans.rowNumbersSvc?.handleKeyDownOnCell(cellCtrl.cellPosition, event)
    ) {
        return;
    }

    switch (key) {
        case KeyCode.ENTER:
            onEnterKeyDown(beans, cellCtrl, event);
            break;
        case KeyCode.F2:
            onF2KeyDown(beans, cellCtrl, event);
            break;
        case KeyCode.ESCAPE:
            onEscapeKeyDown(beans, cellCtrl, event);
            break;
        case KeyCode.TAB:
            onTabKeyDown(beans, cellCtrl, event);
            break;
        case KeyCode.BACKSPACE:
        case KeyCode.DELETE:
            onBackspaceOrDeleteKeyDown(beans, cellCtrl, key, event);
            break;
        case KeyCode.DOWN:
        case KeyCode.UP:
        case KeyCode.RIGHT:
        case KeyCode.LEFT:
            onNavigationKeyDown(beans, cellCtrl, event, key);
            break;
    }
}

function onNavigationKeyDown(beans: BeanCollection, cellCtrl: CellCtrl, event: KeyboardEvent, key: string): void {
    if (beans.editSvc?.isEditing(cellCtrl, { withOpenEditor: true })) {
        return;
    }

    if (event.shiftKey && cellCtrl.isRangeSelectionEnabled()) {
        onShiftRangeSelect(beans, event);
    } else {
        const currentCellPosition = cellCtrl.getFocusedCellPosition();
        beans.navigation?.navigateToNextCell(event, key, currentCellPosition, true);
    }

    // if we don't prevent default, the grid will scroll with the navigation keys
    event.preventDefault();
}

function onShiftRangeSelect(beans: BeanCollection, event: KeyboardEvent): void {
    const { rangeSvc, navigation } = beans;
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

function onTabKeyDown(beans: BeanCollection, cellCtrl: CellCtrl, event: KeyboardEvent): void {
    beans.navigation?.onTabKeyDown(cellCtrl, event);
}

function onBackspaceOrDeleteKeyDown(
    beans: BeanCollection,
    cellCtrl: CellCtrl,
    key: string,
    event: KeyboardEvent
): void {
    const { rowNode } = cellCtrl;
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

function onEnterKeyDown(beans: BeanCollection, cellCtrl: CellCtrl, event: KeyboardEvent): void {
    const { editSvc, navigation } = beans;
    const cellEditing = editSvc?.isEditing(cellCtrl, { withOpenEditor: true });
    const rowNode = cellCtrl.rowNode;
    const rowEditing = editSvc?.isRowEditing(rowNode, { withOpenEditor: true });

    const startEditingAction = (cellCtrl: CellCtrl) => {
        const started = editSvc?.startEditing(cellCtrl, {
            startedEdit: true,
            event,
            source: 'edit',
        });
        if (started) {
            // if we started editing, then we need to prevent default, otherwise the Enter action can get
            // applied to the cell editor. this happened, for example, with largeTextCellEditor where not
            // preventing default results in a 'new line' character getting inserted in the text area
            // when the editing was started
            event.preventDefault();
        }
    };

    if (cellEditing || rowEditing) {
        if (isCtrlEnter(event)) {
            // bulk edit, apply currently editing value to all selected cells
            editSvc?.applyBulkEdit(cellCtrl, beans?.rangeSvc?.getCellRanges() || []);
            return;
        }

        // Enter commits, so validity must be current: checkNavWithValidation re-runs ALL validations first.
        const validation = editSvc?.checkNavWithValidationAndCache(undefined, event);
        if (validation?.result === 'block-stop') {
            if (beans.gos.get('editType') === 'fullRow') {
                editSvc?.announceFullRowEditValidationErrors(rowNode);
            }
            return;
        }

        if (editSvc?.isEditing(cellCtrl, { withOpenEditor: true })) {
            editSvc?.stopEditing(
                cellCtrl,
                {
                    event,
                    source: 'edit',
                },
                validation?.validationCache
            );
        } else if (rowEditing && !cellCtrl.isCellEditable()) {
            // must be on a read only cell
            editSvc?.stopEditing({ rowNode }, { event, source: 'edit' }, validation?.validationCache);
        } else {
            startEditingAction(cellCtrl);
        }
    } else if (beans.gos.get('enterNavigatesVertically')) {
        const key = event.shiftKey ? KeyCode.UP : KeyCode.DOWN;
        navigation?.navigateToNextCell(null, key, cellCtrl.cellPosition, false);
    } else {
        if (editSvc?.revalidateAndCheck()) {
            return;
        }

        // Already revalidated above; only the scoped answer is still needed.
        if (editSvc?.checkValidated(cellCtrl)) {
            editSvc.revertSingleCellEdit(cellCtrl, true);
        }

        startEditingAction(cellCtrl);
    }
}

function isCtrlEnter(e: KeyboardEvent): boolean {
    return (e.ctrlKey || e.metaKey) && e.key === KeyCode.ENTER;
}

function onF2KeyDown(beans: BeanCollection, cellCtrl: CellCtrl, event: KeyboardEvent): void {
    const { editSvc, notesSvc } = beans;

    const editing = editSvc?.isEditing();

    if (event.shiftKey && notesSvc?.hasDataSource() && !editing) {
        const access = notesSvc.getNoteAccess({ rowNode: cellCtrl.rowNode, column: cellCtrl.column });

        if (access) {
            if (!access.isSuppressed || access.canView) {
                notesSvc.showNote(access.params, true);
                event.preventDefault();
                return;
            }
        }
    }

    if (editing) {
        // F2 starts a new edit cycle, so an in-progress one must be checked against fresh validations —
        // checkNavWithValidation re-runs them all first.
        if (editSvc?.checkNavWithValidation(undefined, event) === 'block-stop') {
            return;
        }
    }

    editSvc?.startEditing(cellCtrl, { startedEdit: true, event });
}

function onEscapeKeyDown(beans: BeanCollection, cellCtrl: CellCtrl, event: KeyboardEvent): void {
    const { editSvc } = beans;

    // The browser observes this before the deferred framework teardown below has a chance to run.
    event.preventDefault();

    // Let the editor and popup finish handling Escape before their framework components are torn down.
    // In particular, React applies edit-detail changes asynchronously, so keep cancellation on the next task.
    setTimeout(() => {
        editSvc?.stopEditing(cellCtrl, {
            event,
            cancel: true,
        });
    });
}

export function _processCellCharacter(beans: BeanCollection, cellCtrl: CellCtrl, event: KeyboardEvent): void {
    // check this, in case focus is on a (for example) a text field inside the cell,
    // in which cse we should not be listening for these key pressed
    const eventTarget = event.target;
    const eventOnChildComponent = eventTarget !== cellCtrl.eGui;
    const { editSvc } = beans;

    if (eventOnChildComponent) {
        return;
    }

    if (editSvc?.isEditing(cellCtrl, { withOpenEditor: true })) {
        // if we have an open editor, then we don't want to process the character on the cell
        return;
    }

    const key = event.key;
    if (key === KeyCode.SPACE) {
        onSpaceKeyDown(beans, cellCtrl, event);
    } else if (editSvc?.isCellEditable(cellCtrl, 'ui')) {
        if (editSvc?.revalidateAndCheck() && !editSvc.checkValidated(cellCtrl)) {
            return;
        }

        editSvc?.startEditing(cellCtrl, { startedEdit: true, event, source: 'api', editable: true });
        // if we don't prevent default, then the event also gets applied to the text field
        // (at least when doing the default editor), but we need to allow the editor to decide
        // what it wants to do. we only do this IF editing was started - otherwise it messes
        // up when the user is not doing editing, but using rendering with text fields in cellRenderer
        // (as it would block the the user from typing into text fields).

        const compDetails = cellCtrl.editCompDetails;
        const shouldPreventDefault = !(compDetails?.params as DefaultProvidedCellEditorParams)?.suppressPreventDefault;

        if (shouldPreventDefault) {
            event.preventDefault();
        }
    }
}

function onSpaceKeyDown(beans: BeanCollection, cellCtrl: CellCtrl, event: KeyboardEvent): void {
    const { gos, editSvc } = beans;
    const { rowNode } = cellCtrl;

    if (!editSvc?.isEditing(cellCtrl, { withOpenEditor: true }) && _isRowSelection(gos)) {
        beans.selectionSvc?.handleSelectionEvent(event, rowNode, 'spaceKey');
    }

    // prevent default as space key, by default, moves browser scroll down
    event.preventDefault();
}
