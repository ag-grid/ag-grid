import type { BeanCollection } from '../context/context';
import type { VisibleRowsHandlers, VisibleRowsOptions } from '../interfaces/iVisibleRows';

export function subscribeToVisibleRows<TData = any>(
    beans: BeanCollection,
    handlers: VisibleRowsHandlers<TData>,
    options?: VisibleRowsOptions
): () => void {
    return beans.visibleRowsSvc?.subscribe(handlers, options) ?? (() => {});
}
