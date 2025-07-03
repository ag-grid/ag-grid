import type { StartEditingCellParams } from '../api/gridApi';
import { ensureColumnVisible, ensureIndexVisible } from '../api/scrollApi';
import type { BeanCollection } from '../context/context';
import { _getRowNode } from '../entities/positionUtils';
import type { RowNode } from '../entities/rowNode';
import type { EditingCellPosition, ICellEditorValidationError } from '../interfaces/iCellEditor';
import type { CellPosition } from '../interfaces/iCellPosition';
import { _warn } from '../validation/logging';
import { _getCellCtrl } from './utils/controllers';
import { UNEDITED, _destroyEditors, _syncFromEditors, _valuesDiffer } from './utils/editors';

export function undoCellEditing(beans: BeanCollection): void {
    beans.undoRedo?.undo('api');
}

export function redoCellEditing(beans: BeanCollection): void {
    beans.undoRedo?.redo('api');
}

export function getEditingCells(beans: BeanCollection): EditingCellPosition[] {
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

            if (editing) {
                positions.push(edit);
            } else if (changed) {
                positions.push(edit);
            }
        });
    });
    return positions;
}

export function stopEditing(beans: BeanCollection, cancel: boolean = false): void {
    const { editSvc } = beans;
    if (editSvc?.isBatchEditing()) {
        if (cancel) {
            beans.editModelSvc?.getEditPositions().forEach((cellPosition) => {
                if (cellPosition.state === 'editing') {
                    editSvc.revertSingleCellEdit(cellPosition);
                }
            });
        } else {
            _syncFromEditors(beans);
        }
        _destroyEditors(beans);
    } else {
        editSvc?.stopEditing(undefined, { cancel, source: 'api' });
    }
}

export function isEditing(beans: BeanCollection, cellPosition: CellPosition): boolean {
    const cellCtrl = _getCellCtrl(beans, cellPosition);
    return beans.editSvc?.isEditing(cellCtrl) ?? false;
}

export function startEditingCell(beans: BeanCollection, params: StartEditingCellParams): void {
    const { key, colKey, rowIndex, rowPinned } = params;
    const { editSvc, colModel } = beans;

    const column = colModel.getCol(colKey);
    if (!column) {
        _warn(12, { colKey });
        return;
    }

    const cellPosition: CellPosition = {
        rowIndex,
        rowPinned: rowPinned || null,
        column,
    };

    const rowNode = _getRowNode(beans, cellPosition);
    if (!rowNode) {
        _warn(290, { rowIndex, rowPinned });
        return;
    }

    if (!column.isCellEditable(rowNode)) {
        return;
    }

    const notPinned = rowPinned == null;
    if (notPinned) {
        ensureIndexVisible(beans, rowIndex);
    }

    ensureColumnVisible(beans, colKey);

    editSvc?.setEditingCells(
        [
            {
                ...cellPosition,
                colId: column.getColId(),
                newValue: key,
                state: 'editing',
            },
        ],
        { update: true }
    );
}

export function cancelEdits({ editSvc }: BeanCollection): void {
    editSvc?.stopEditing(undefined, { cancel: true, source: editSvc?.isBatchEditing() ? 'ui' : 'api' });
}

export function validateEdit(beans: BeanCollection): ICellEditorValidationError[] | null {
    return beans.editSvc?.validateEdit() || null;
}

export function getCurrentUndoSize(beans: BeanCollection): number {
    return beans.undoRedo?.getCurrentUndoStackSize() ?? 0;
}

export function getCurrentRedoSize(beans: BeanCollection): number {
    return beans.undoRedo?.getCurrentRedoStackSize() ?? 0;
}
