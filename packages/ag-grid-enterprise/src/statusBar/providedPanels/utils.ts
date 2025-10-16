import { _warn } from 'ag-grid-community';
import type { GridOptionsService, IClientSideRowModel, IRowModel, RowModelType } from 'ag-grid-community';

export const _getFilteredRowCount = (rowModel: IClientSideRowModel) => {
    let filteredRowCount = 0;
    rowModel.forEachNodeAfterFilter((node) => {
        if (node.data) {
            filteredRowCount++;
        }
    });
    return filteredRowCount;
};

export const _getTotalRowCount = (rowModel: IRowModel) => {
    let totalRowCount = 0;
    rowModel.forEachNode((node) => {
        if (node.data) {
            totalRowCount++;
        }
    });
    return totalRowCount;
};

/**
 * If false is returned the component should not be created
 */
export const supportsCurrentRowModel = (
    gos: GridOptionsService,
    expectedRowModels: Set<RowModelType>,
    warnArgs: [number, ...any[]]
): boolean => {
    if (expectedRowModels.has(gos.get('rowModelType'))) {
        return true;
    }
    _warn(...(warnArgs as Parameters<typeof _warn>));
    return false;
};
