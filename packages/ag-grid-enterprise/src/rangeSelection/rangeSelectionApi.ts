import type { AgColumn, BeanCollection, CellRange, CellRangeParams } from 'ag-grid-community';
import { _getFirstRow, _getLastRow } from 'ag-grid-community';

export function getCellRanges(beans: BeanCollection): CellRange[] | null {
    return beans.rangeSvc?.getCellRanges() ?? null;
}

export function addCellRange(beans: BeanCollection, params: CellRangeParams): void {
    beans.rangeSvc?.addCellRange(params);
}

export function clearRangeSelection(beans: BeanCollection): void {
    beans.rangeSvc?.removeAllCellRanges();
}

export function selectColumns(beans: BeanCollection, colIds: string[], select = true): void {
    const firstRow = _getFirstRow(beans);
    const lastRow = _getLastRow(beans);
    if (!firstRow || !lastRow) {
        return;
    }

    const columns = colIds.reduce<AgColumn[]>((acc, id) => acc.concat(beans.colModel.getColById(id) ?? []), []);

    if (select) {
        beans.rangeSvc?.selectColumns(columns, firstRow, lastRow);
    } else {
        for (const column of columns) {
            beans.rangeSvc?.deselectColumn(column, firstRow, lastRow);
        }
    }
}
