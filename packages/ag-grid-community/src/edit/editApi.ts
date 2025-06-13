import type { StartEditingCellParams } from '../api/gridApi';
import { ensureColumnVisible, ensureIndexVisible } from '../api/scrollApi';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { _getCellByPosition } from '../entities/positionUtils';
import { _getActiveDomElement } from '../gridOptionsUtils';
import type {
    EditingCellPosition,
    GetEditingCellsParams,
    ICellEditorValidationError,
    SetEditingCellsParams,
} from '../interfaces/iCellEditor';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { EditMap } from '../interfaces/iEditModelService';
import { _warn } from '../validation/logging';
import { _getCellCtrl } from './utils/controllers';
import { UNEDITED, _valuesDiffer } from './utils/editors';

export function undoCellEditing(beans: BeanCollection): void {
    beans.undoRedo?.undo('api');
}

export function redoCellEditing(beans: BeanCollection): void {
    beans.undoRedo?.redo('api');
}

export function setBatchEditing(beans: BeanCollection, enabled: boolean): void {
    beans.editSvc?.setBatchEditing(enabled);
}

export function isBatchEditing(beans: BeanCollection): boolean {
    return beans.editSvc?.isBatchEditing() ?? false;
}

export function getEditingCells(beans: BeanCollection, params: GetEditingCellsParams): EditingCellPosition[] {
    const edits = beans.editModelSvc?.getEditMap();
    const positions: EditingCellPosition[] = [];
    edits?.forEach((editRow, { rowIndex, rowPinned }) => {
        editRow.forEach(({ newValue, oldValue, state }, column) => {
            if (newValue === UNEDITED || !_valuesDiffer({ newValue, oldValue })) {
                // filter out internal details, let null through as that indicates cleared cell value
                return;
            }

            if (state === 'changed' && !params?.includePending) {
                return; // skip changed cells if not requested
            }

            positions.push({
                newValue,
                oldValue,
                state,
                column,
                colId: column.getColId(),
                colKey: column.getColId(),
                rowIndex: rowIndex!,
                rowPinned,
            });
        });
    });
    return positions;
}

export function setEditingCells(
    beans: BeanCollection,
    cells: EditingCellPosition[],
    params?: SetEditingCellsParams
): void {
    const { editSvc, colModel, valueSvc, editModelSvc } = beans;

    if (!editSvc?.isBatchEditing()) {
        return;
    }

    let edits: EditMap = new Map();

    if (params?.update) {
        const existingEdits = editModelSvc?.getEditMap();
        edits = new Map(existingEdits?.entries() ?? []);
    }

    cells.forEach(({ colId, column, colKey, rowIndex, rowPinned, newValue, state }) => {
        const col = colId ? colModel.getCol(colId) : colKey ? colModel.getCol(colKey) : column;

        if (!col) {
            return;
        }

        const cellCtrl = _getCellByPosition(beans, { rowIndex, rowPinned, column: col });

        if (!cellCtrl) {
            return;
        }

        const rowNode = cellCtrl.rowNode;
        const oldValue = valueSvc.getValue(col as AgColumn, rowNode, true, 'api');

        if (!_valuesDiffer({ newValue, oldValue }) && state !== 'editing') {
            // If the new value is the same as the old value, we don't need to update
            return;
        }

        let editRow = edits.get(rowNode);

        if (!editRow) {
            editRow = new Map();
            edits.set(rowNode, editRow);
        }

        // translate undefined to unedited, don't translate null as that means cell was cleared
        if (newValue === undefined) {
            newValue = UNEDITED;
        }

        editRow.set(col, { newValue, oldValue, state: state ?? 'changed' });
    });

    editSvc?.setEditMap(edits);
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
