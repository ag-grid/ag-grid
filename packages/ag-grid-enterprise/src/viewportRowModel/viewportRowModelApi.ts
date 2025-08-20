import type { BeanCollection } from 'ag-grid-community';
import { _getViewportRowModel } from 'ag-grid-community';

export function resetRowHeights(beans: BeanCollection): void {
    _getViewportRowModel(beans)?.resetRowHeights();
}
