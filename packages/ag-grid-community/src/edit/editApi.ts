import type { StartEditingCellParams } from '../api/gridApi';
import { ensureColumnVisible, ensureIndexVisible } from '../api/scrollApi';
import type { BeanCollection } from '../context/context';
import { _getCellByPosition } from '../entities/positionUtils';
import type { RowNode } from '../entities/rowNode';
import { _getActiveDomElement } from '../gridOptionsUtils';
import type { EditingCellPosition, GetEditingCellsParams, ICellEditorValidationError } from '../interfaces/iCellEditor';
import type { CellPosition } from '../interfaces/iCellPosition';
import { _warn } from '../validation/logging';
import { _getCellCtrl } from './utils/controllers';
import { UNEDITED, _valuesDiffer } from './utils/editors';

export function undoCellEditing(beans: BeanCollection): void {
    beans.undoRedo?.undo('api');
}

export function redoCellEditing(beans: BeanCollection): void {
    beans.undoRedo?.redo('api');
}

export function getEditingCells(beans: BeanCollection, params: GetEditingCellsParams): EditingCellPosition[] {
    const edits = beans.editModelSvc?.getEditMap();
    const positions: EditingCellPosition[] = [];
    edits?.forEach((editRow, rowNode) => {
        const { rowIndex, rowPinned } = rowNode as RowNode;
        editRow.forEach(({ newValue, oldValue, state }, column) => {
            const diff = _valuesDiffer({ newValue, oldValue });

            if (newValue === UNEDITED) {
                newValue = undefined;
            }

            const edit: EditingCellPosition = {
                newValue,
                oldValue,
                state,
                column,
                colId: column.getColId(),
                colKey: column.getColId(),
                rowIndex: rowIndex!,
                rowPinned,
            };

            const changed = state === 'changed' && diff;
            const editing = state === 'editing';

            if (editing && params?.includePending) {
                positions.push(edit);
            } else if (changed) {
                positions.push(edit);
            }
        });
    });
    return positions;
}

export function stopEditing(beans: BeanCollection, cancel: boolean = false): void {
    beans.editSvc?.stopEditing(undefined, { cancel, source: 'api' });
}

export function isEditing(beans: BeanCollection, cellPosition: CellPosition): boolean {
    const cellCtrl = _getCellCtrl(beans, cellPosition);
    return beans.editSvc?.isEditing(cellCtrl) ?? false;
}

export function startEditingCell(beans: BeanCollection, params: StartEditingCellParams): void {
    const { key, colKey, rowIndex, rowPinned } = params;
    const column = beans.colModel.getCol(colKey);
    if (!column) {
        _warn(12, { colKey });
        return;
    }

    const cellPosition: CellPosition = {
        rowIndex,
        rowPinned: rowPinned || null,
        column,
    };

    const notPinned = rowPinned == null;
    if (notPinned) {
        ensureIndexVisible(beans, rowIndex);
    }

    ensureColumnVisible(beans, colKey);

    const cell = _getCellByPosition(beans, cellPosition);
    if (!cell) {
        return;
    }

    const { eGui } = cell;
    const { focusSvc, gos, editSvc } = beans;

    if (beans.editSvc?.isEditing(cell)) {
        // if already editing, just focus the cell
        return;
    }

    const isFocusWithinCell = () => {
        const activeElement = _getActiveDomElement(beans);
        return activeElement !== eGui && !!eGui?.contains(activeElement);
    };

    const forceBrowserFocus = gos.get('stopEditingWhenCellsLoseFocus') && isFocusWithinCell();
    if (forceBrowserFocus || !focusSvc.isCellFocused(cellPosition)) {
        focusSvc.setFocusedCell({
            ...cellPosition,
            forceBrowserFocus,
            preventScrollOnBrowserFocus: true,
        });
    }
    editSvc?.startEditing(cell, { startedEdit: true, source: 'api', event: new KeyboardEvent('keydown', { key }) });
}

export function cancelEdits(beans: BeanCollection): void {
    beans.editSvc?.stopAllEditing(true, 'api');
}

export function validateEdit(beans: BeanCollection): ICellEditorValidationError[] | null {
    if (!beans.editSvc) {
        return null;
    }

    return beans.editSvc.validateEdit();
}

export function getCurrentUndoSize(beans: BeanCollection): number {
    return beans.undoRedo?.getCurrentUndoStackSize() ?? 0;
}

export function getCurrentRedoSize(beans: BeanCollection): number {
    return beans.undoRedo?.getCurrentRedoStackSize() ?? 0;
}
