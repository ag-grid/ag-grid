import type { BeanCollection, DetailGridInfo } from '@ag-grid-community/core';

export function addDetailGridInfo(beans: BeanCollection, id: string, gridInfo: DetailGridInfo): void {
    beans.detailGridApiService?.addDetailGridInfo(id, gridInfo);
}

export function removeDetailGridInfo(beans: BeanCollection, id: string): void {
    beans.detailGridApiService?.removeDetailGridInfo(id);
}

export function getDetailGridInfo(beans: BeanCollection, id: string): DetailGridInfo | undefined {
    return beans.detailGridApiService?.getDetailGridInfo(id);
}

export function forEachDetailGridInfo(
    beans: BeanCollection,
    callback: (gridInfo: DetailGridInfo, index: number) => void
) {
    beans.detailGridApiService?.forEachDetailGridInfo(callback);
}
