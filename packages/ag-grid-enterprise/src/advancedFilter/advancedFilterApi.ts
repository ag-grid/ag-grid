import type { AdvancedFilterModel, _BeanCollection } from 'ag-grid-community';

export function getAdvancedFilterModel(beans: _BeanCollection): AdvancedFilterModel | null {
    return beans.filterManager?.getAdvFilterModel() ?? null;
}

export function setAdvancedFilterModel(beans: _BeanCollection, advancedFilterModel: AdvancedFilterModel | null): void {
    beans.filterManager?.setAdvFilterModel(advancedFilterModel);
}

export function showAdvancedFilterBuilder(beans: _BeanCollection): void {
    beans.filterManager?.toggleAdvFilterBuilder(true, 'api');
}

export function hideAdvancedFilterBuilder(beans: _BeanCollection): void {
    beans.filterManager?.toggleAdvFilterBuilder(false, 'api');
}
