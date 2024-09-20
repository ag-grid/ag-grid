import type { BeanCollection } from '../context/context';
import type { IRowNode } from '../interfaces/iRowNode';

export function getPinnedTopRowCount(beans: BeanCollection): number {
    return beans.pinnedRowModel.getPinnedTopRowCount();
}

export function getPinnedBottomRowCount(beans: BeanCollection): number {
    return beans.pinnedRowModel.getPinnedBottomRowCount();
}

export function getPinnedTopRow(beans: BeanCollection, index: number): IRowNode | undefined {
    return beans.pinnedRowModel.getPinnedTopRow(index);
}

export function getPinnedBottomRow(beans: BeanCollection, index: number): IRowNode | undefined {
    return beans.pinnedRowModel.getPinnedBottomRow(index);
}
