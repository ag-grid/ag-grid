import type { BeanCollection } from '../context/context';

export function expandAll(beans: BeanCollection) {
    beans.expansionService.expandAll(true);
}

export function collapseAll(beans: BeanCollection) {
    beans.expansionService.expandAll(false);
}

export function onRowHeightChanged(beans: BeanCollection) {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    const serverSideRowModel = beans.rowModelHelperService?.getServerSideRowModel();
    if (clientSideRowModel) {
        clientSideRowModel.onRowHeightChanged();
    } else if (serverSideRowModel) {
        serverSideRowModel.onRowHeightChanged();
    }
}
