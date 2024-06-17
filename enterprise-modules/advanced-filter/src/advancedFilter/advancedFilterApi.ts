import type { AdvancedFilterModel, BeanCollection } from '@ag-grid-community/core';

export function getAdvancedFilterModel(beans: BeanCollection): AdvancedFilterModel | null {
    return beans.filterManager?.getAdvancedFilterModel() ?? null;
}

export function setAdvancedFilterModel(beans: BeanCollection, advancedFilterModel: AdvancedFilterModel | null): void {
    beans.filterManager?.setAdvancedFilterModel(advancedFilterModel);
}

export function showAdvancedFilterBuilder(beans: BeanCollection): void {
    beans.filterManager?.toggleAdvancedFilterBuilder(true, 'api');
}

export function hideAdvancedFilterBuilder(beans: BeanCollection): void {
    beans.filterManager?.toggleAdvancedFilterBuilder(false, 'api');
}
