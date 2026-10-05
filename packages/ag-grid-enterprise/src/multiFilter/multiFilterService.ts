import type {
    CoreDataTypeDefinition,
    DataTypeFormatValueFunc,
    IMultiFilterParams,
    IMultiFilterService,
    ValueGetterFunc,
} from 'ag-grid-community';
import { BeanStub, _getDefaultSimpleFilter, _getFilterParamsForDataType } from 'ag-grid-community';

import { DEFAULT_CHILD_FILTER, getChildFilter } from './multiFilterUtil';

export class MultiFilterService extends BeanStub implements IMultiFilterService {
    readonly beanName = 'multiFilter' as const;

    public getParamsForDataType(
        existingFilterParams: IMultiFilterParams | undefined,
        existingFilterValueGetter: string | ValueGetterFunc | undefined,
        dataTypeDefinition: CoreDataTypeDefinition,
        formatValue: DataTypeFormatValueFunc
    ): { filterParams?: any; filterValueGetter?: string | ValueGetterFunc<any, any> } {
        let filters = existingFilterParams?.filters;
        const beans = this.beans;
        if (!filters?.length) {
            const simpleFilter = _getDefaultSimpleFilter(dataTypeDefinition.baseDataType);
            filters = [{ filter: simpleFilter }, { filter: 'agSetColumnFilter' }];
        }
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
