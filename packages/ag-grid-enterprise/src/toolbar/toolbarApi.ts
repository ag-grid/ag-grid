import type { BeanCollection, IToolbarItem } from 'ag-grid-community';
import { _unwrapUserComp } from 'ag-grid-community';

export function getToolbarItemInstance<TToolbarItem = IToolbarItem>(
    beans: BeanCollection,
    key: string
): TToolbarItem | undefined {
    const comp = beans.toolbar?.comp?.getToolbarItemInstance(key);
    return _unwrapUserComp(comp) as any;
}

export function getToolbarItemKeys(beans: BeanCollection): string[] {
    return beans.toolbar?.comp?.getToolbarItemKeys() ?? [];
}
