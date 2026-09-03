import { _areEqual } from 'ag-stack';

import type {
    AgColumn,
    BeanCollection,
    FilterDisplayParams,
    IMultiFilterDef,
    IMultiFilterModel,
    IMultiFilterParams,
    SharedFilterUi,
} from 'ag-grid-community';
import { ProvidedFilter } from 'ag-grid-community';

export function getMultiFilterDefs(params: IMultiFilterParams | undefined): IMultiFilterDef[] {
    const filters = params?.filters;

    return filters && filters.length > 0
        ? filters
        : [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }];
}

/** `true` means "use the default", which for a Multi Filter child is always the text filter. `undefined` is
 *  deliberately not folded in: the handler path gives it no filter at all rather than the default. */
function getChildFilter(def: IMultiFilterDef): IMultiFilterDef['filter'] {
    const filter = def.filter;
    return filter === true ? 'agTextColumnFilter' : filter;
}

/** The `{ component, handler, doesFilterPass }` form is rebuilt inline with the col def, so the wrapper's
 *  own identity says nothing; both resolvers key on its contents. */
function childFilterEqual(oldDef: IMultiFilterDef, newDef: IMultiFilterDef): boolean {
    const oldFilter = getChildFilter(oldDef);
    const newFilter = getChildFilter(newDef);
    if (oldFilter === newFilter) {
        return true;
    }
    if (typeof oldFilter !== 'object' || typeof newFilter !== 'object') {
        return false;
    }
    return (
        oldFilter.component === newFilter.component &&
        oldFilter.handler === newFilter.handler &&
        oldFilter.doesFilterPass === newFilter.doesFilterPass
    );
}

/** Children are built once, so a different child set means the Multi Filter has to be recreated. */
export function multiFilterChildrenChanged(oldDefs: IMultiFilterDef[], newDefs: IMultiFilterDef[]): boolean {
    return !_areEqual(oldDefs, newDefs, childFilterEqual);
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
