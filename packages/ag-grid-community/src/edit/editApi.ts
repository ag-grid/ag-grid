import type { StartEditingCellParams } from '../api/gridApi';
import { ensureColumnVisible, ensureIndexVisible } from '../api/scrollApi';
import type { BeanCollection } from '../context/context';
import { _getRowNode } from '../entities/positionUtils';
import type { RowNode } from '../entities/rowNode';
import type { EditingCellPosition, ICellEditorValidationError } from '../interfaces/iCellEditor';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { IRowNode } from '../interfaces/iRowNode';
import { _warn } from '../validation/logging';
import { _getCellCtrl } from './utils/controllers';
import { UNEDITED, _destroyEditors, _sourceAndPendingDiffer, _syncFromEditors } from './utils/editors';

export function undoCellEditing(beans: BeanCollection): void {
    beans.undoRedo?.undo('api');
}

export function redoCellEditing(beans: BeanCollection): void {
    beans.undoRedo?.redo('api');
}

export function getEditRowValues(beans: BeanCollection, rowNode: IRowNode): Record<string, any> | undefined {
    return beans.editModelSvc?.getEditRowDataValue(rowNode, { checkSiblings: true });
}

export function getEditingCells(beans: BeanCollection): EditingCellPosition[] {
    const edits = beans.editModelSvc?.getEditMap();
    const positions: EditingCellPosition[] = [];
    edits?.forEach((editRow, rowNode) => {
        const { rowIndex, rowPinned } = rowNode as RowNode;
        editRow.forEach((editValue, column) => {
            const { editorValue, pendingValue, sourceValue: oldValue, state } = editValue;
            const diff = _sourceAndPendingDiffer(editValue);

            let newValue = editorValue ?? pendingValue;

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

            if (editing || changed) {
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
            for (const cellPosition of beans.editModelSvc?.getEditPositions() ?? []) {
                if (cellPosition.state === 'editing') {
                    editSvc.revertSingleCellEdit(cellPosition);
                }
            }
        } else {
            _syncFromEditors(beans, { persist: true });
        }
        _destroyEditors(beans, undefined, { cancel });
    } else {
        editSvc?.stopEditing(undefined, { cancel, source: 'edit', forceStop: !cancel, forceCancel: cancel });
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

    editSvc?.startEditing(
        {
            rowNode,
            column,
        },
        {
            event: key ? new KeyboardEvent('keydown', { key }) : undefined,
            source: 'api',
        }
    );
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
