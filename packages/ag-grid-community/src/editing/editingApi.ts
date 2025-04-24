import type { StartEditingCellParams } from '../api/gridApi';
import { ensureColumnVisible, ensureIndexVisible } from '../api/scrollApi';
import { _unwrapUserComp } from '../components/framework/unwrapUserComp';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { _getCellByPosition } from '../entities/positionUtils';
import { _getActiveDomElement } from '../gridOptionsUtils';
import type { EditStrategyType } from '../interfaces/editStrategyType';
import type { GetCellEditorInstancesParams, ICellEditor } from '../interfaces/iCellEditor';
import type { CellPosition } from '../interfaces/iCellPosition';
import { _warn } from '../validation/logging';
import { _resolveControllers, _resolveRowController } from './strategy/utils';

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
    return beans.editingSvc?.getEditingCellPositions() ?? [];
}

export function stopEditing(beans: BeanCollection, cancel: boolean = false): void {
    if (beans.editingSvc?.isEditing()) {
        beans.editingSvc?.stopAllEditing(cancel);
    }
}

export function isEditing(beans: BeanCollection, rowId?: string, colId?: string): boolean {
    const { rowCtrl, cellCtrl } = _resolveControllers(beans, { rowId, colId });
    return beans.editingSvc?.isEditing(rowCtrl, cellCtrl) ?? false;
}

export function isRowEditing(beans: BeanCollection, rowId: string): boolean {
    const rowCtrl = _resolveRowController(beans, { rowId });
    return beans.editingSvc?.isEditing(rowCtrl) ?? false;
}

export function startEditingCell(beans: BeanCollection, params: StartEditingCellParams): void {
    const column = beans.colModel.getCol(params.colKey);
    if (!column) {
        _warn(12, { colKey: params.colKey });
        return;
    }
    const cellPosition: CellPosition = {
        rowIndex: params.rowIndex,
        rowPinned: params.rowPinned || null,
        column,
    };
    const notPinned = params.rowPinned == null;
    if (notPinned) {
        ensureIndexVisible(beans, params.rowIndex);
    }

    ensureColumnVisible(beans, params.colKey);

    const cell = _getCellByPosition(beans, cellPosition);
    if (!cell) {
        return;
    }
    const { focusSvc, gos, editingSvc } = beans;
    const isFocusWithinCell = () => {
        const activeElement = _getActiveDomElement(beans);
        const eCell = cell.eGui;
        return activeElement !== eCell && !!eCell?.contains(activeElement);
    };
    const forceBrowserFocus = gos.get('stopEditingWhenCellsLoseFocus') && isFocusWithinCell();
    if (forceBrowserFocus || !focusSvc.isCellFocused(cellPosition)) {
        focusSvc.setFocusedCell({
            ...cellPosition,
            forceBrowserFocus,
            preventScrollOnBrowserFocus: true,
        });
    }
    editingSvc?.startEditing(cell.rowCtrl, cell, params.key, true, undefined, 'api');
}

export function updateEditStrategy(beans: BeanCollection, editStrategy: string): void {
    cancelEdits(beans);
    beans.gos.updateGridOptions({
        options: {
            experimentalEditingModeV2: {
                strategy: editStrategy as EditStrategyType,
            },
        },
    });
}

export function commitEdits(beans: BeanCollection): void {
    if (beans.editingSvc?.isEditing()) {
        beans.editingSvc?.stopAllEditing(false);
    }
}

export function cancelEdits(beans: BeanCollection): void {
    if (beans.editingSvc?.isEditing()) {
        beans.editingSvc?.stopAllEditing(true);
    }
}

export function getCurrentUndoSize(beans: BeanCollection): number {
    return beans.undoRedo?.getCurrentUndoStackSize() ?? 0;
}

export function getCurrentRedoSize(beans: BeanCollection): number {
    return beans.undoRedo?.getCurrentRedoStackSize() ?? 0;
}
