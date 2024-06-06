import type { BeanCollection, IStatusPanel } from '@ag-grid-community/core';
import { ModuleNames, ModuleRegistry, _unwrapUserComp } from '@ag-grid-community/core';

export function getStatusPanel<TStatusPanel = IStatusPanel>(
    beans: BeanCollection,
    key: string
): TStatusPanel | undefined {
    if (
        !ModuleRegistry.__assertRegistered(ModuleNames.StatusBarModule, 'api.getStatusPanel', beans.context.getGridId())
    ) {
        return;
    }
    const comp = beans.statusBarService!.getStatusPanel(key);
    return _unwrapUserComp(comp) as any;
}
