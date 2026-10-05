import { _areEqual } from 'ag-stack';

import type {
    AgColumn,
    BeanCollection,
    IFilterDef,
    IMultiFilterDef,
    IMultiFilterModel,
    IMultiFilterParams,
    ResolvedFilter,
    SharedFilterUi,
} from 'ag-grid-community';
import { ProvidedFilter, _resolveFilter } from 'ag-grid-community';

export function getMultiFilterDefs(params: IMultiFilterParams | undefined): IMultiFilterDef[] {
    const filters = params?.filters;

    return filters && filters.length > 0
        ? filters
        : [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }];
}

/** What a child's `filter: true` resolves to, whatever the column's data type. */
export const DEFAULT_CHILD_FILTER = 'agTextColumnFilter';

/** A Multi Filter's children as each is built, or `undefined` where `multi` is not a Multi Filter. */
export function resolveMultiFilterChildren(
    beans: BeanCollection,
    column: AgColumn,
    multi: ResolvedFilter
): ResolvedFilter[] | undefined {
    return multi.key === 'agMultiColumnFilter'
        ? resolveChildFilters(beans, column, multi, resolveFilterParams(beans, column, multi.def))
        : undefined;
}

/** The children of the Multi Filter `multi`, from its params already resolved, as resolving calls any function. */
export function resolveChildFilters(
    beans: BeanCollection,
    column: AgColumn,
    multi: ResolvedFilter,
    multiParams: any
): ResolvedFilter[] {
    return getMultiFilterDefs(multiParams).map((def) =>
        _resolveFilter(beans, column, def, DEFAULT_CHILD_FILTER, multi)
    );
}

/** Without the column filters a function cannot be called with their params, so it is returned uncalled. */
export function resolveFilterParams(beans: BeanCollection, column: AgColumn, filterDef: IFilterDef): any {
    const colFilter = beans.colFilter;
    return colFilter ? colFilter.resolveFilterParams(column, filterDef) : filterDef.filterParams;
}

/** `undefined` is deliberately not folded in: the handler path gives it no filter at all rather than the default. */
export function getChildFilter(def: IMultiFilterDef): IMultiFilterDef['filter'] {
    const filter = def.filter;
    return filter === true ? DEFAULT_CHILD_FILTER : filter;
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
