import type { CellRange, CellRangeParams, _BeanCollection } from 'ag-grid-community';

export function getCellRanges(beans: _BeanCollection): CellRange[] | null {
    return beans.rangeSvc?.getCellRanges() ?? null;
}

export function addCellRange(beans: _BeanCollection, params: CellRangeParams): void {
    beans.rangeSvc?.addCellRange(params);
}

export function clearRangeSelection(beans: _BeanCollection): void {
    beans.rangeSvc?.removeAllCellRanges();
}
