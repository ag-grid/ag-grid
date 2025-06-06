import type { StartEditingCellParams } from '../api/gridApi';
import { ensureColumnVisible, ensureIndexVisible } from '../api/scrollApi';
import { _unwrapUserComp } from '../components/framework/unwrapUserComp';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { _getCellByPosition } from '../entities/positionUtils';
import { _getActiveDomElement } from '../gridOptionsUtils';
import type {
    EditingCellPosition,
    GetCellEditorInstancesParams,
    GetEditingCellsParams,
    ICellEditor,
    SetEditingCellsParams,
} from '../interfaces/iCellEditor';
import type { CellPosition } from '../interfaces/iCellPosition';
import { _warn } from '../validation/logging';
import type { PendingUpdates } from './editModelService';
import { _resolveControllers } from './utils/controllers';
import { UNEDITED, _valuesDiffer } from './utils/editors';

export function undoCellEditing(beans: BeanCollection): void {
    beans.undoRedo?.undo('api');
}

export function redoCellEditing(beans: BeanCollection): void {
    beans.undoRedo?.redo('api');
}

export function enableBatchEditing(beans: BeanCollection): void {
    beans.editSvc?.enableBatchEditing();
}

export function disableBatchEditing(beans: BeanCollection): void {
    beans.editSvc?.disableBatchEditing();
}

export function batchEditingEnabled(beans: BeanCollection): boolean {
    return beans.editSvc?.batchEditing ?? false;
}

export function getCellEditorInstances<TData = any>(
    beans: BeanCollection,
    params: GetCellEditorInstancesParams<TData> = {}
): ICellEditor[] {
    const res: ICellEditor[] = [];

    beans.rowRenderer.getCellCtrls(params.rowNodes, params.columns as AgColumn[]).forEach((cellCtrl) => {
        const cellEditor = cellCtrl.comp?.getCellEditor() as ICellEditor;

        if (cellEditor) {
            res.push(_unwrapUserComp(cellEditor));
        }
    });

    return res;
}

export function getEditingCells(beans: BeanCollection, params: GetEditingCellsParams): EditingCellPosition[] {
    const pendingUpdates = beans.editModelSvc?.getPendingUpdates();
    const pendingPositions: EditingCellPosition[] = [];
    pendingUpdates?.forEach((rowUpdateMap, { rowIndex, rowPinned }) => {
        rowUpdateMap.forEach(({ newValue, oldValue, state }, column) => {
            if (newValue === UNEDITED) {
                // filter out internal details, let null through as that indicates cleared cell value
                return;
            }

            if (state === 'changed' && !params?.includePending) {
                return; // skip changed cells if not requested
            }
            const cellPendingPosition: EditingCellPosition = {
                newValue,
                oldValue,
                state,
                column,
                colKey: column.getColId(),
                rowIndex: rowIndex!,
                rowPinned,
            };
            pendingPositions.push(cellPendingPosition);
        });
    });
    return pendingPositions;
}

export function setEditingCells(
    beans: BeanCollection,
    cellPositions: EditingCellPosition[],
    params?: SetEditingCellsParams
): void {
    if (!beans.editSvc?.batchEditing) {
        return;
    }

    let pendingUpdates: PendingUpdates = new Map();

    if (params?.update) {
        const existingPendingUpdates = beans.editModelSvc?.getPendingUpdates();
        pendingUpdates = new Map(existingPendingUpdates?.entries() ?? []);
    }

    cellPositions.forEach(({ colKey, column, rowIndex, rowPinned, newValue, state }) => {
        const col = colKey ? beans.colModel.getCol(colKey) : column;

        if (!col) {
            return;
        }

        const cellCtrl = _getCellByPosition(beans, { rowIndex, rowPinned, column: col });

        if (!cellCtrl) {
            return;
        }

        const rowNode = cellCtrl.rowNode;
        const oldValue = beans.valueSvc.getValue(col as AgColumn, rowNode, true, 'api');

        if (!_valuesDiffer({ newValue, oldValue }) && state !== 'editing') {
            // If the new value is the same as the old value, we don't need to update
            return;
        }

        let rowMap = pendingUpdates.get(rowNode);

        if (!rowMap) {
            rowMap = new Map();
            pendingUpdates.set(rowNode, rowMap);
        }

        // translate undefined to unedited, don't translate null as that means cell was cleared
        if (newValue === undefined) {
            newValue = UNEDITED;
        }

        rowMap.set(col, { newValue, oldValue, state: state ?? 'changed' });
    });

    beans.editSvc?.setPendingUpdates(pendingUpdates);
}

export function stopEditing(beans: BeanCollection, cancel: boolean = false): void {
    beans.editSvc?.stopEditing(undefined, undefined, undefined, undefined, cancel, 'api');
}

export function isEditing(beans: BeanCollection, rowId?: string, colId?: string): boolean {
    const { rowCtrl, cellCtrl } = _resolveControllers(beans, { rowId, colId });
    return beans.editSvc?.isEditing(rowCtrl?.rowNode, cellCtrl?.column) ?? false;
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

    const { eGui, rowNode } = cell;
    const { focusSvc, gos, editSvc } = beans;

    if (beans.editSvc?.isEditing(rowNode, column)) {
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
    editSvc?.startEditing(rowNode, column, key, true, undefined, 'api');
}

export function cancelEdits(beans: BeanCollection): void {
    beans.editSvc?.stopAllEditing(true, 'api');
}

export function getCurrentUndoSize(beans: BeanCollection): number {
    return beans.undoRedo?.getCurrentUndoStackSize() ?? 0;
}

export function getCurrentRedoSize(beans: BeanCollection): number {
    return beans.undoRedo?.getCurrentRedoStackSize() ?? 0;
}
