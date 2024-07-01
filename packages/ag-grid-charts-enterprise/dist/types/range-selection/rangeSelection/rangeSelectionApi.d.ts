import type { BeanCollection, CellRange, CellRangeParams } from 'ag-grid-community';
export declare function getCellRanges(beans: BeanCollection): CellRange[] | null;
export declare function addCellRange(beans: BeanCollection, params: CellRangeParams): void;
export declare function clearRangeSelection(beans: BeanCollection): void;
