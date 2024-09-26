import type { AgColumn, BeanCollection, ColumnChooserParams, IContextMenuParams } from 'ag-grid-community';

export function showContextMenu(beans: BeanCollection, params?: IContextMenuParams) {
    const { rowNode, column, value, x, y } = params || {};
    let { x: clientX, y: clientY } = beans.menuService.getContextMenuPosition(rowNode, column as AgColumn);

    if (x != null) {
        clientX = x;
    }

    if (y != null) {
        clientY = y;
    }

    beans.menuService.showContextMenu({
        mouseEvent: new MouseEvent('mousedown', { clientX, clientY }),
        rowNode,
        column,
        value,
    });
}

export function showColumnChooser(beans: BeanCollection, params?: ColumnChooserParams): void {
    beans.menuService.showColumnChooser({ chooserParams: params });
}

export function hideColumnChooser(beans: BeanCollection): void {
    beans.menuService.hideColumnChooser();
}
