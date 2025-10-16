import type { IClientSideRowModel, IRowModel } from 'ag-grid-community';

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
