import type { AgColumn, ColumnChooserParams, IContextMenuParams, RowNode, _BeanCollection } from 'ag-grid-community';

import type { ColumnChooserFactory } from './columnChooserFactory';

export function showContextMenu(beans: _BeanCollection, params?: IContextMenuParams) {
    const { contextMenuSvc } = beans;
    if (!contextMenuSvc) {
        return;
    }
    const { rowNode, column, value, x, y } = params || {};
    let { x: clientX, y: clientY } = contextMenuSvc.getContextMenuPosition(rowNode as RowNode, column as AgColumn);

    if (x != null) {
        clientX = x;
    }

    if (y != null) {
        clientY = y;
    }

    contextMenuSvc.showContextMenu({
        mouseEvent: new MouseEvent('mousedown', { clientX, clientY }),
        rowNode,
        column,
        value,
        source: 'api',
    });
}

export function showColumnChooser(beans: _BeanCollection, params?: ColumnChooserParams): void {
    (beans.colChooserFactory as ColumnChooserFactory)?.showColumnChooser({ chooserParams: params });
}

export function hideColumnChooser(beans: _BeanCollection): void {
    (beans.colChooserFactory as ColumnChooserFactory)?.hideActiveColumnChooser();
}
