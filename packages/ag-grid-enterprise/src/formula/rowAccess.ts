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

/**
 * Like {@link isFormulaRowAvailable} but also accepts loaded aggregate group rows. Group nodes
 * have `data == null` because their values come from aggregation, not from the source row data,
 * so the standard formula-row predicate would reject them. Used by calculated columns, which
 * can legitimately evaluate against aggregated values; editable formulas should keep using the
 * stricter {@link isFormulaRowAvailable}.
 */
export function isCalculatedColumnRowAvailable(row: RowNode): boolean {
    return (
        isFormulaRowAvailable(row) ||
        (!row.stub && !row.failedLoad && row.group === true && (row.level !== -1 || row.footer === true))
    );
}
