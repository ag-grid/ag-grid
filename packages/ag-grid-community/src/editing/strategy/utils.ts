import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import type { Column } from '../../interfaces/iColumn';
import type { CellCtrl, ICellComp } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';

type ResolveRowControllerType = {
    rowIndex?: number | null;
    rowId?: string;
    rowCtrl?: RowCtrl | null;
};

type ResolveCellControllerType = {
    colId?: string;
    column?: string | Column | null;
};

type ResolveControllerType = ResolveRowControllerType & ResolveCellControllerType;

type ResolvedControllersType = {
    rowCtrl?: RowCtrl;
    cellCtrl?: CellCtrl;
};

export function _resolveRowController(beans: BeanCollection, inputs: ResolveRowControllerType): RowCtrl | undefined {
    const { rowIndex, rowId, rowCtrl } = inputs;

    if (rowCtrl) {
        return rowCtrl;
    }

    const { rowModel, rowRenderer } = beans;

    const rowNode = rowId ? rowModel.getRowNode(rowId) : rowModel.getRow(rowIndex!); // TODO: what about pinned rows??

    if (!rowNode) {
        return undefined;
    }

    return rowRenderer.getRowCtrls([rowNode])?.[0];
}

export function _resolveCellController(beans: BeanCollection, inputs: ResolveControllerType): CellCtrl | undefined {
    const { colId, column, rowIndex, rowId } = inputs;
    let { rowCtrl } = inputs;
    const { rowRenderer, colModel } = beans;

    const agColumn = colId
        ? colModel.getCol(colId)
        : colModel.getCol(typeof column === 'string' ? column : column?.getColId());

    rowCtrl ??= rowIndex || rowId ? _resolveRowController(beans, inputs) : rowRenderer.getRowCtrls()?.[0];
    return rowCtrl?.getCellCtrl(agColumn!) ?? undefined;
}

export function _resolveControllers(beans: BeanCollection, inputs: ResolveControllerType): ResolvedControllersType {
    const rowCtrl = _resolveRowController(beans, inputs);
    const cellCtrl = _resolveCellController(beans, inputs);

    return {
        rowCtrl,
        cellCtrl,
    };
}

export function _takeValueFromCellEditor(
    cancel: boolean,
    cellComp: ICellComp
): { newValue?: any; newValueExists: boolean } {
    const noValueResult = { newValueExists: false };

    if (cancel) {
        return noValueResult;
    }

    const cellEditor = cellComp.getCellEditor();

    if (!cellEditor) {
        return noValueResult;
    }

    const userWantsToCancel = cellEditor.isCancelAfterEnd && cellEditor.isCancelAfterEnd();

    if (userWantsToCancel) {
        return noValueResult;
    }

    const newValue = cellEditor.getValue();

    return {
        newValue: newValue,
        newValueExists: true,
    };
}

/**
 * @returns `True` if the value changes, otherwise `False`.
 */
export function _saveNewValue(
    cellCtrl: CellCtrl,
    oldValue: any,
    newValue: any,
    rowNode: RowNode,
    column: AgColumn
): boolean {
    if (newValue === oldValue) {
        return false;
    }

    // we suppressRefreshCell because the call to rowNode.setDataValue() results in change detection
    // getting triggered, which results in all cells getting refreshed. we do not want this refresh
    // to happen on this call as we want to call it explicitly below. otherwise refresh gets called twice.
    // if we only did this refresh (and not the one below) then the cell would flash and not be forced.
    cellCtrl.suppressRefreshCell = true;
    const valueChanged = rowNode.setDataValue(column, newValue, 'edit');
    cellCtrl.suppressRefreshCell = false;

    return valueChanged;
}
