import { ProvidedFilter } from 'ag-grid-community';
import type {
    FilterEvaluator,
    FilterEvaluatorParams,
    FilterModelValidation,
    IFilterComp,
    IMultiFilterDef,
    IMultiFilterModel,
    IMultiFilterParams,
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

export function getFilterTitle(filter: IFilterComp, filterDef: IMultiFilterDef): string {
    if (filterDef.title != null) {
        return filterDef.title;
    }

    return filter instanceof ProvidedFilter ? filter.getFilterTitle() : 'Filter';
}

export function updateMultiFilterModel(filterModels: any[]): IMultiFilterModel | null {
    return filterModels.every((childModel) => childModel == null)
        ? null
        : {
              filterType: 'multi',
              filterModels,
          };
}

export async function refreshEvaluator(
    evaluator: FilterEvaluator,
    evaluatorParams: FilterEvaluatorParams
): Promise<FilterModelValidation> {
    return (await evaluator.refresh?.(evaluatorParams)) ?? { valid: true };
}
