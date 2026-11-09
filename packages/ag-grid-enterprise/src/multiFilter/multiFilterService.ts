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
            const filter = getChildFilter(def);
            const named = typeof filter === 'object' && filter !== null ? filter.component : filter;
            return (
                filter !== getChildFilter(toFilters[i]) ||
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
            const childFilter = getChildFilter(filterDef);
            // the `{ component }` form builds the filter it names, so it takes that filter's params
            const named = typeof childFilter === 'object' && childFilter !== null ? childFilter.component : childFilter;
            const filter = named === true ? DEFAULT_CHILD_FILTER : named;
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
