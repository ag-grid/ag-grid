import { ProvidedFilter } from 'ag-grid-community';
import type { IMultiFilterDef, IMultiFilterModel, IMultiFilterParams, SharedFilterUi } from 'ag-grid-community';

export function getMultiFilterDefs(params: IMultiFilterParams): IMultiFilterDef[] {
    const { filters } = params;

    return filters && filters.length > 0
        ? filters
        : [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }];
}

export function forEachReverse<T>(list: T[] | null | undefined, action: (value: T, index: number) => void): void {
    if (list == null) {
        return;
    }

    for (let i = list.length - 1; i >= 0; i--) {
        action(list[i], i);
    }
}

export function getFilterTitle(filter: SharedFilterUi, filterDef: IMultiFilterDef): string {
    if (filterDef.title != null) {
        return filterDef.title;
    }

    return filter instanceof ProvidedFilter ? filter.getFilterTitle() : 'Filter';
}

export function getUpdatedMultiFilterModel(
    existingModel: IMultiFilterModel | null,
    numFilters: number,
    newModel: any,
    index: number
): IMultiFilterModel | null {
    const filterModels = [];
    const existingFilterModels = existingModel?.filterModels;
    for (let i = 0; i < numFilters; i++) {
        filterModels[i] = (i === index ? newModel : existingFilterModels?.[i]) ?? null;
    }
    return filterModels.every((childModel) => childModel == null)
        ? null
        : {
              filterType: 'multi',
              filterModels,
          };
}
