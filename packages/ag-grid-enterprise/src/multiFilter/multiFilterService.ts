import type {
    CoreDataTypeDefinition,
    DataTypeFormatValueFunc,
    IMultiFilterParams,
    IMultiFilterService,
    ValueGetterFunc,
} from 'ag-grid-community';
import { BeanStub, _getDefaultSimpleFilter, _getFilterParamsForDataType } from 'ag-grid-community';

import { getChildFilter } from './multiFilterUtil';

export class MultiFilterService extends BeanStub implements IMultiFilterService {
    readonly beanName = 'multiFilter' as const;

    public getParamsForDataType(
        existingFilterParams: IMultiFilterParams | ((params: any) => IMultiFilterParams | undefined) | undefined,
        existingFilterValueGetter: string | ValueGetterFunc | undefined,
        dataTypeDefinition: CoreDataTypeDefinition,
        formatValue: DataTypeFormatValueFunc
    ): { filterParams?: any; filterValueGetter?: string | ValueGetterFunc<any, any> } {
        if (typeof existingFilterParams === 'function') {
            // Its children are only known once the column's own function has run with the filter.
            return {
                filterParams: (params: any) =>
                    this.getParamsForDataType(
                        existingFilterParams(params),
                        existingFilterValueGetter,
                        dataTypeDefinition,
                        formatValue
                    ).filterParams,
            };
        }
        let filters = existingFilterParams?.filters;
        const beans = this.beans;
        if (!filters) {
            const simpleFilter = _getDefaultSimpleFilter(dataTypeDefinition.baseDataType);
            filters = [{ filter: simpleFilter }, { filter: 'agSetColumnFilter' }];
        }
        const translate = this.getLocaleTextFunc();
        filters = filters.map((filterDef) => {
            const { filterParams: existingChildFilterParams, filterValueGetter: existingChildFilterValueGetter } =
                filterDef;
            const filter = getChildFilter(filterDef);
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
