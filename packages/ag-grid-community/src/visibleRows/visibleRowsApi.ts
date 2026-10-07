import type { BeanCollection, VisibleRowsHandlers, VisibleRowsOptions } from 'ag-grid-community';

import { _getSsrmVisibleRowsService } from './services/ssrmVisibleRowsService';

export function subscribeToVisibleRows<TData = any>(
    beans: BeanCollection,
    handlers: VisibleRowsHandlers<TData>,
    options?: VisibleRowsOptions
): () => void {
    return _getSsrmVisibleRowsService(beans)?.subscribe(handlers, options) ?? (() => {});
}
