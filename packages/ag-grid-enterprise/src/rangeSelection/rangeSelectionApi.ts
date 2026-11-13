import type { BeanCollection, CellRange, CellRangeParams } from 'ag-grid-community';

export function getCellRanges(beans: BeanCollection): CellRange[] | null {
    return beans.rangeSvc?.getCellRanges() ?? null;
}

export function addCellRange(beans: BeanCollection, params: CellRangeParams): void {
    beans.rangeSvc?.addCellRange(params);
}

export function clearCellSelection(beans: BeanCollection): void {
    beans.rangeSvc?.removeAllCellRanges();
}
