import type {
    BaseCellDataType,
    CoreDataTypeDefinition,
    DataTypeFormatValueFunc,
    IMultiFilterDef,
    IMultiFilterParams,
    IMultiFilterService,
    ValueGetterFunc,
} from 'ag-grid-community';
import {
    BeanStub,
    _getDefaultSimpleFilter,
    _getFilterParamsForDataType,
    _hasFilterParamsForDataType,
} from 'ag-grid-community';

import { DEFAULT_CHILD_FILTER, getChildFilter } from './multiFilterUtil';

/** A Multi Filter's own filters, or with none, a simple filter for the data type followed by a Set Filter. */
function getFiltersForDataType(
    filterParams: IMultiFilterParams | undefined,
    baseDataType: BaseCellDataType | undefined
): IMultiFilterDef[] {
    const filters = filterParams?.filters;
    return filters?.length
        ? filters
        : [{ filter: _getDefaultSimpleFilter(baseDataType) }, { filter: 'agSetColumnFilter' }];
}

/**
 * The filter a Multi Filter child builds: the `{ component }` form builds the filter it names, and `true` the default
 * child filter, so each takes that filter's params.
 */
function getNamedChildFilter(filterDef: IMultiFilterDef): unknown {
    const childFilter = getChildFilter(filterDef);
    const named = typeof childFilter === 'object' && childFilter !== null ? childFilter.component : childFilter;
    return named === true ? DEFAULT_CHILD_FILTER : named;
}

export class MultiFilterService extends BeanStub implements IMultiFilterService {
    readonly beanName = 'multiFilter' as const;

    public areChildFiltersChangedByDataType(
        filterParams: IMultiFilterParams | ((params: any) => IMultiFilterParams) | undefined,
        from: BaseCellDataType | undefined,
        to: BaseCellDataType | undefined
    ): boolean {
        // a function's filters are only known once it is called, so it may leave them to the data type
        const params = typeof filterParams === 'function' ? undefined : filterParams;
        const toFilters = getFiltersForDataType(params, to);
        return getFiltersForDataType(params, from).some((def, i) => {
            const named = getNamedChildFilter(def);
            return (
                getChildFilter(def) !== getChildFilter(toFilters[i]) ||
                (typeof named === 'string' &&
                    (_hasFilterParamsForDataType(named, from) || _hasFilterParamsForDataType(named, to)))
            );
        });
    }

    public getParamsForDataType(
        existingFilterParams: IMultiFilterParams | undefined,
        existingFilterValueGetter: string | ValueGetterFunc | undefined,
        dataTypeDefinition: CoreDataTypeDefinition,
        formatValue: DataTypeFormatValueFunc
    ): { filterParams?: any; filterValueGetter?: string | ValueGetterFunc<any, any> } {
        let filters = getFiltersForDataType(existingFilterParams, dataTypeDefinition.baseDataType);
        const beans = this.beans;
        const translate = this.getLocaleTextFunc();
        filters = filters.map((filterDef) => {
            const { filterParams: existingChildFilterParams, filterValueGetter: existingChildFilterValueGetter } =
                filterDef;
            const filter = getNamedChildFilter(filterDef);
            if (typeof filter !== 'string') {
                return filterDef;
            }
            const { filterParams, filterValueGetter } = _getFilterParamsForDataType(
                filter,
                existingChildFilterParams,
                existingChildFilterValueGetter || existingFilterValueGetter,
                dataTypeDefinition,
                formatValue,
                beans,
                translate
            );
            return {
                ...filterDef,
                filterParams,
                filterValueGetter,
            };
        });
        return {
            filterParams: {
                ...existingFilterParams,
                filters,
            },
        };
    }
}
