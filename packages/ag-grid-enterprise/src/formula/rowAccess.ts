import type { BeanCollection, RowNode } from 'ag-grid-community';
import { _getClientSideRowModel } from 'ag-grid-community';

export function getFormulaRowByIndex(beans: BeanCollection, rowIndex: number): RowNode | null {
    if (!Number.isFinite(rowIndex) || rowIndex < 0) {
        return null;
    }

    const clientSideRowModel = _getClientSideRowModel(beans);
    if (clientSideRowModel) {
        return clientSideRowModel.getFormulaRow(rowIndex) ?? null;
    }

    const row = beans.rowModel.getRow(rowIndex);
    return row && isFormulaRowAvailable(row) ? row : null;
}

export function getFormulaRowIndex(row: RowNode): number | null {
    return row.formulaRowIndex ?? row.rowIndex ?? null;
}

export function isFormulaRowAvailable(row: RowNode): boolean {
    return !row.stub && !row.failedLoad && row.data != null;
}
