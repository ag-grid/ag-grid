import type { AdvancedFilterModel, BeanCollection } from '@ag-grid-community/core';
import { ModuleNames, ModuleRegistry } from '@ag-grid-community/core';

export function getAdvancedFilterModel(beans: BeanCollection): AdvancedFilterModel | null {
    if (
        ModuleRegistry.__assertRegistered(
            ModuleNames.AdvancedFilterModule,
            'api.getAdvancedFilterModel',
            beans.context.getGridId()
        )
    ) {
        return beans.filterManager?.getAdvancedFilterModel() ?? null;
    }
    return null;
}

export function setAdvancedFilterModel(beans: BeanCollection, advancedFilterModel: AdvancedFilterModel | null): void {
    beans.filterManager?.setAdvancedFilterModel(advancedFilterModel);
}

export function showAdvancedFilterBuilder(beans: BeanCollection): void {
    if (
        ModuleRegistry.__assertRegistered(
            ModuleNames.AdvancedFilterModule,
            'api.setAdvancedFilterModel',
            beans.context.getGridId()
        )
    ) {
        beans.filterManager?.showAdvancedFilterBuilder('api');
    }
}
