import type { BeanCollection, IRowNode } from 'ag-grid-community';

export function getPinnedTopRowCount(beans: BeanCollection): number {
    return beans.manualPinnedRowModel?.getPinnedTopRowCount() ?? 0;
}

export function getPinnedBottomRowCount(beans: BeanCollection): number {
    return beans.manualPinnedRowModel?.getPinnedBottomRowCount() ?? 0;
}

export function getPinnedTopRow(beans: BeanCollection, index: number): IRowNode | undefined {
    return beans.manualPinnedRowModel?.getPinnedTopRow(index);
}

export function getPinnedBottomRow(beans: BeanCollection, index: number): IRowNode | undefined {
    return beans.manualPinnedRowModel?.getPinnedBottomRow(index);
}
