import type { ColDef, ValueGetterFunc } from '../entities/colDef';
import type { CoreDataTypeDefinition, DataTypeFormatValueFunc } from '../entities/dataType';
import type { IMultiFilterParams } from './iMultiFilter';

export interface IMultiFilterService {
    getParamsForDataType(
        existingFilterParams: IMultiFilterParams | undefined,
        colDef: ColDef,
        dataTypeDefinition: CoreDataTypeDefinition,
        formatValue: DataTypeFormatValueFunc
    ): { filterParams?: any; filterValueGetter?: string | ValueGetterFunc };
}
