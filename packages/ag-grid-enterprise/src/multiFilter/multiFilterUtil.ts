import { ProvidedFilter } from 'ag-grid-community';
import type {
    AgColumn,
    BeanCollection,
    FilterDisplayParams,
    IMultiFilterDef,
    IMultiFilterModel,
    IMultiFilterParams,
    SharedFilterUi,
} from 'ag-grid-community';

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

export function getFilterModelForIndex<TModel = any>(model: IMultiFilterModel | null, index: number): TModel | null {
    return model?.filterModels?.[index] ?? null;
}

export function updateGetValue(
    beans: BeanCollection,
    column: AgColumn,
    filterDef: IMultiFilterDef,
    existingGetValue: FilterDisplayParams['getValue']
): FilterDisplayParams['getValue'] {
    const filterValueGetter = filterDef.filterValueGetter;
    return filterValueGetter ? beans.colFilter!.createGetValue(column, filterValueGetter) : existingGetValue;
}
