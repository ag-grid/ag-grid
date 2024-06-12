import type { BeanCollection } from '../context/context';
import { _errorOnce } from '../utils/function';

export function setRowCount(beans: BeanCollection, rowCount: number, maxRowFound?: boolean): void {
    const serverSideRowModel = beans.rowModelHelperService?.getServerSideRowModel();
    if (serverSideRowModel) {
        if (beans.funcColsService.isRowGroupEmpty()) {
            serverSideRowModel.setRowCount(rowCount, maxRowFound);
            return;
        }
        _errorOnce('setRowCount cannot be used while using row grouping.');
        return;
    }

    const infiniteRowModel = beans.rowModelHelperService?.getInfiniteRowModel();
    if (infiniteRowModel) {
        infiniteRowModel.setRowCount(rowCount, maxRowFound);
        return;
    }
}

export function getCacheBlockState(beans: BeanCollection): any {
    return beans.rowNodeBlockLoader?.getBlockState() ?? {};
}
