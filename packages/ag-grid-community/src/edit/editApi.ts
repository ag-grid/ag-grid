import { ensureColumnVisible, ensureIndexVisible } from '../api/scrollApi';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { _getRowNode } from '../entities/positionUtils';
import type { RowNode } from '../entities/rowNode';
import type {
    EditingCellPosition,
    ICellEditorValidationError,
    StartEditingCellParams,
} from '../interfaces/iCellEditor';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { IRowNode } from '../interfaces/iRowNode';
import {
    UNEDITED,
    _flushEditors,
    _readEditValidationErrors,
    _sourceAndPendingDiffer,
    _validateEdit,
} from './utils/editors';

export function undoCellEditing(beans: BeanCollection): void {
    beans.undoRedo?.undo('api');
}

export function redoCellEditing(beans: BeanCollection): void {
    beans.undoRedo?.redo('api');
}

export function getEditRowValues(beans: BeanCollection, rowNode: IRowNode): Record<string, any> | undefined {
    return beans.editModelSvc?.getEditRowDataValue(rowNode);
}

export function getEditingCells(beans: BeanCollection): EditingCellPosition[] {
    const edits = beans.editModelSvc?.getEditMap();
    const positions: EditingCellPosition[] = [];
    edits?.forEach((editRow, rowNode: RowNode) => {
        editRow.forEach((editValue, column: AgColumn) => {
            const editing = editValue.state === 'editing';
            const changed = !editing && _sourceAndPendingDiffer(editValue);
            if (editing || changed) {
                const colId = column.colId;
                let newValue = editValue.editorValue ?? editValue.pendingValue;
                if (newValue === UNEDITED) {
                    newValue = undefined;
                }
                positions.push({
                    newValue,
                    oldValue: editValue.sourceValue,
                    state: editValue.state,
                    column,
                    colId,
                    colKey: colId,
                    rowIndex: rowNode.rowIndex!,
                    rowPinned: rowNode.rowPinned,
                });
            }
        });
    });
    return positions;
}

export function stopEditing(beans: BeanCollection, cancel: boolean = false): void {
    const { editSvc } = beans;
    if (editSvc?.isBatchEditing()) {
        editSvc.stopBatchEditors(cancel);
    } else {
        editSvc?.stopEditing(undefined, { cancel, source: 'edit', forceStop: !cancel, forceCancel: cancel });
    }
}

export function isEditing(beans: BeanCollection, cellPosition: CellPosition): boolean {
    // Resolved from the row model, not a cell controller: an unrendered row has no controller, and an
    // undefined position makes isEditing answer "is anything editing" — a scroll-dependent wrong answer.
    const rowNode = _getRowNode(beans, cellPosition);
    return !!rowNode && !!beans.editSvc?.isEditing({ rowNode, column: cellPosition.column });
}

export function startEditingCell(beans: BeanCollection, params: StartEditingCellParams): void {
    const { key, colKey, rowIndex, rowPinned } = params;
    const { editSvc, colModel } = beans;

    const column = colModel.getCol(colKey);
    if (!column) {
        beans.log.warn(12, { colKey });
        return;
    }

    const cellPosition: CellPosition = {
        rowIndex,
        rowPinned: rowPinned || null,
        column,
    };

    const rowNode = _getRowNode(beans, cellPosition);
    if (!rowNode) {
        beans.log.warn(290, { rowIndex, rowPinned });
        return;
    }

    if (!editSvc?.isCellEditable({ rowNode, column }, 'api')) {
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
            editable: true,
        }
    );
}

export function validateEdit(beans: BeanCollection): ICellEditorValidationError[] | null {
    _flushEditors(beans);
    return _validateEdit(beans);
}

export const getEditValidationErrors: (beans: BeanCollection) => ICellEditorValidationError[] | null =
    _readEditValidationErrors;

export function getCurrentUndoSize(beans: BeanCollection): number {
    return beans.undoRedo?.getCurrentUndoStackSize() ?? 0;
}

export function getCurrentRedoSize(beans: BeanCollection): number {
    return beans.undoRedo?.getCurrentRedoStackSize() ?? 0;
}
