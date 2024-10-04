import type { BeanCollection } from '../context/context';
import { _logError } from '../validation/logging';

export function setRowCount(beans: BeanCollection, rowCount: number, maxRowFound?: boolean): void {
    const serverSideRowModel = beans.rowModelHelperService?.getServerSideRowModel();
    if (serverSideRowModel) {
        if (beans.funcColsService.isRowGroupEmpty()) {
            serverSideRowModel.setRowCount(rowCount, maxRowFound);
            return;
        }
        _logError(28, {});
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

export function isLastRowIndexKnown(beans: BeanCollection): boolean | undefined {
    return beans.rowModel.isLastRowIndexKnown();
}
