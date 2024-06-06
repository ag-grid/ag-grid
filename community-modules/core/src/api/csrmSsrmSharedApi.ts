import type { BeanCollection } from '../context/context';
import { _logMissingRowModel } from './apiUtils';

export function expandAll(beans: BeanCollection) {
    if (beans.rowModelHelperService?.getClientSideRowModel() || beans.rowModelHelperService?.getServerSideRowModel()) {
        beans.expansionService.expandAll(true);
    } else {
        _logMissingRowModel('expandAll', 'clientSide', 'serverSide');
    }
}

export function collapseAll(beans: BeanCollection) {
    if (beans.rowModelHelperService?.getClientSideRowModel() || beans.rowModelHelperService?.getServerSideRowModel()) {
        beans.expansionService.expandAll(false);
    } else {
        _logMissingRowModel('collapseAll', 'clientSide', 'serverSide');
    }
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
