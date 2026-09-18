import type { BeanCollection, IMenuItemProvider } from 'ag-grid-community';

/** The services that own stock menu items, in the order their default items appear in the context menu. */
export function _getMenuItemProviders(beans: BeanCollection): IMenuItemProvider[] {
    const { clipboardSvc, calculatedColsSvc, notesSvc, chartSvc, pinnedRowModel, gridSerializer } = beans;
    const candidates: (IMenuItemProvider | undefined)[] = [
        clipboardSvc,
        calculatedColsSvc,
        notesSvc,
        chartSvc,
        pinnedRowModel,
        gridSerializer,
    ];
    return candidates.filter((provider): provider is IMenuItemProvider => !!provider);
}
