import type { StartEditingCellParams } from '../api/gridApi';
import { ensureColumnVisible, ensureIndexVisible } from '../api/scrollApi';
import { _unwrapUserComp } from '../components/framework/unwrapUserComp';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { _getCellByPosition } from '../entities/positionUtils';
import { _getActiveDomElement } from '../gridOptionsUtils';
import type { GetCellEditorInstancesParams, ICellEditor } from '../interfaces/iCellEditor';
import type { CellPendingPosition } from '../interfaces/iCellPendingPosition';
import type { CellPosition } from '../interfaces/iCellPosition';
import { _warn } from '../validation/logging';
import type { PendingUpdates } from './editModelService';
import { _resolveControllers } from './utils/controllers';
import { _valuesDiffer } from './utils/editors';

export function undoCellEditing(beans: BeanCollection): void {
    beans.undoRedo?.undo('api');
}

export function redoCellEditing(beans: BeanCollection): void {
    beans.undoRedo?.redo('api');
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

export function getEditingCells(beans: BeanCollection): CellPosition[] {
    return beans.editSvc?.getEditingCellPositions() ?? [];
}

export function getPendingUpdates(beans: BeanCollection): CellPendingPosition[] {
    const pendingUpdates = beans.editModelSvc?.getPendingUpdates();
    const pendingPositions: CellPendingPosition[] = [];
    pendingUpdates?.forEach((rowUpdateMap, { rowIndex, rowPinned }) => {
        rowUpdateMap.forEach((cellData, column) => {
            if (!cellData) {
                return;
            }
            const cellPendingPosition: CellPendingPosition = {
                ...cellData,
                colKey: column.getColId(),
                rowIndex: rowIndex!,
                rowPinned,
            };
            pendingPositions.push(cellPendingPosition);
        });
    });
    return pendingPositions;
}

export function setPendingUpdates(
    beans: BeanCollection,
    pendingPositions: CellPendingPosition[],
    update?: boolean
): void {
    if (!beans.gos.get('batchEdit')) {
        beans.gridApi.setGridOption('batchEdit', true);
    }

    let pendingUpdates: PendingUpdates = new Map();

    if (update) {
        const existingPendingUpdates = beans.editModelSvc?.getPendingUpdates();
        pendingUpdates = new Map(existingPendingUpdates?.entries() ?? []);
    }

    pendingPositions.forEach(({ colKey, rowIndex, rowPinned, newValue, state }) => {
        const column = beans.colModel.getCol(colKey);

        if (!column) {
            return;
        }

        const cellCtrl = _getCellByPosition(beans, { rowIndex, rowPinned, column });

        if (!cellCtrl) {
            return;
        }

        const rowNode = cellCtrl.rowNode;

        if (!pendingUpdates.has(rowNode)) {
            pendingUpdates.set(rowNode, new Map());
        }

        const oldValue = rowNode.data[colKey];

        if (!_valuesDiffer({ newValue, oldValue }) && state !== 'editing') {
            // If the new value is the same as the old value, we don't need to update
            return;
        }

        pendingUpdates.get(rowNode)!.set(column, { newValue, oldValue, state: state ?? 'changed' });
    });

    beans.editSvc?.setPendingUpdates(pendingUpdates);
}

export function stopEditing(beans: BeanCollection, cancel: boolean = false): void {
    beans.editSvc?.stopAllEditing(cancel, 'api');
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
