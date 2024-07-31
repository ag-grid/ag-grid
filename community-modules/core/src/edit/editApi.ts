import type { StartEditingCellParams } from '../api/gridApi';
import { ensureColumnVisible, ensureIndexVisible } from '../api/scrollApi';
import { _unwrapUserComp } from '../components/framework/unwrapUserComp';
import type { BeanCollection } from '../context/context';
import type { CellPosition } from '../entities/cellPositionUtils';
import type { ICellEditor } from '../interfaces/iCellEditor';
import type { GetCellEditorInstancesParams } from '../rendering/rowRenderer';
import { _warnOnce } from '../utils/function';

export function undoCellEditing(beans: BeanCollection): void {
    beans.undoRedoService?.undo('api');
}

export function redoCellEditing(beans: BeanCollection): void {
    beans.undoRedoService?.redo('api');
}

export function getCellEditorInstances<TData = any>(
    beans: BeanCollection,
    params: GetCellEditorInstancesParams<TData> = {}
): ICellEditor[] {
    const res = beans.rowRenderer.getCellEditorInstances(params);
    const unwrapped = res.map(_unwrapUserComp);
    return unwrapped;
}

export function getEditingCells(beans: BeanCollection): CellPosition[] {
    return beans.rowRenderer.getEditingCells();
}

export function stopEditing(beans: BeanCollection, cancel: boolean = false): void {
    beans.rowRenderer.stopEditing(cancel);
}

export function startEditingCell(beans: BeanCollection, params: StartEditingCellParams): void {
    const column = beans.columnModel.getCol(params.colKey);
    if (!column) {
        _warnOnce(`no column found for ${params.colKey}`);
        return;
    }
    const cellPosition: CellPosition = {
        rowIndex: params.rowIndex,
        rowPinned: params.rowPinned || null,
        column: column,
    };
    const notPinned = params.rowPinned == null;
    if (notPinned) {
        ensureIndexVisible(beans, params.rowIndex);
    }

    ensureColumnVisible(beans, params.colKey);

    const cell = beans.navigationService.getCellByPosition(cellPosition);
    if (!cell) {
        return;
    }
    const { focusService, gos } = beans;
    const isFocusWithinCell = () => {
        const activeElement = gos.getActiveDomElement();
        const eCell = cell.getGui();
        return activeElement !== eCell && eCell.contains(activeElement);
    };
    const forceBrowserFocus = gos.get('stopEditingWhenCellsLoseFocus') && isFocusWithinCell();
    if (forceBrowserFocus || !focusService.isCellFocused(cellPosition)) {
        focusService.setFocusedCell({
            ...cellPosition,
            forceBrowserFocus,
            preventScrollOnBrowserFocus: true,
        });
    }
    cell.startRowOrCellEdit(params.key);
}

export function getCurrentUndoSize(beans: BeanCollection): number {
    return beans.undoRedoService?.getCurrentUndoStackSize() ?? 0;
}

export function getCurrentRedoSize(beans: BeanCollection): number {
    return beans.undoRedoService?.getCurrentRedoStackSize() ?? 0;
}
