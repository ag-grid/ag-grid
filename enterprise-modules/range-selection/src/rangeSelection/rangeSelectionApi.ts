import type { BeanCollection, CellRange, CellRangeParams } from '@ag-grid-community/core';

export function getCellRanges(beans: BeanCollection): CellRange[] | null {
    return beans.rangeService?.getCellRanges() ?? null;
}

export function addCellRange(beans: BeanCollection, params: CellRangeParams): void {
    beans.rangeService?.addCellRange(params);
}

export function clearRangeSelection(beans: BeanCollection): void {
    beans.rangeService?.removeAllCellRanges();
}
