import type {
    ColDef,
    CoreDataTypeDefinition,
    DataTypeFormatValueFunc,
    IMultiFilterParams,
    IMultiFilterService,
    SelectableFilterDef,
    ValueGetterFunc,
} from 'ag-grid-community';
import { BeanStub, _getDefaultSimpleFilter, _getFilterParamsForDataType } from 'ag-grid-community';

export class MultiFilterService extends BeanStub implements IMultiFilterService {
    readonly beanName = 'multiFilter' as const;

    public getParamsForDataType(
        existingFilterParams: IMultiFilterParams | undefined,
        colDef: ColDef | SelectableFilterDef,
        dataTypeDefinition: CoreDataTypeDefinition,
        formatValue: DataTypeFormatValueFunc
    ): { filterParams?: any; filterValueGetter?: string | ValueGetterFunc<any, any> | undefined } {
        let filters = existingFilterParams?.filters;
        const beans = this.beans;
        if (!filters) {
            const simpleFilter = _getDefaultSimpleFilter(dataTypeDefinition.baseDataType);
            filters = [{ filter: simpleFilter }, { filter: 'agSetColumnFilter' }];
        }
        const translate = this.getLocaleTextFunc();
        filters = filters.map((filterDef) => {
            const { filter, filterParams: existingChildFilterParams } = filterDef;
            if (typeof filter !== 'string') {
                return filterDef;
            }
            const { filterParams, filterValueGetter } = _getFilterParamsForDataType(
                filter,
                existingChildFilterParams,
                colDef,
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
