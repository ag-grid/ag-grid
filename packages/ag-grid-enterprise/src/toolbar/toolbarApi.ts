import type { BeanCollection, IToolbarItem } from 'ag-grid-community';
import { _unwrapUserComp } from 'ag-grid-community';

export function getToolbarItemInstance<T = IToolbarItem>(beans: BeanCollection, key: string): T | undefined {
    const comp = beans.toolbar?.getToolbarItemInstance<T>(key);
    return _unwrapUserComp(comp);
}
