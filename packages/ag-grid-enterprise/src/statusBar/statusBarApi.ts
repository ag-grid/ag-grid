import type { BeanCollection, IStatusPanel } from 'ag-grid-community';
import { _unwrapUserComp } from 'ag-grid-community';

export function getStatusPanel<TStatusPanel = IStatusPanel>(
    beans: BeanCollection,
    key: string
): TStatusPanel | undefined {
    const comp = beans.statusBarService!.getStatusPanel(key);
    return _unwrapUserComp(comp) as any;
}
